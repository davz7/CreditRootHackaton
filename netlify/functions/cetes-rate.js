// netlify/functions/cetes-rate.js
//
// Fuente de la tasa: Banxico SIE API (SF43936 = CETES 28 días, mercado primario)
// La tasa bruta de Banxico es la tasa real que paga el gobierno mexicano.
// Etherfuse cobra ~0.9% de spread sobre esa tasa — lo restamos para dar
// al usuario exactamente lo que va a recibir.
//
// Ejemplo: Banxico = 6.5% → Etherfuse spread 0.9% → usuario recibe 5.6%
//
// Por qué NO usamos el precio del token de Etherfuse para calcular APY:
// El token CETES migró de Solana a Stellar en marzo 2025 con un precio
// ya acumulado (1.16), por lo que cualquier cálculo desde el precio
// del token en Stellar da resultados incorrectos (~14%).

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

// Spread que cobra Etherfuse sobre la tasa bruta de CETES
// Basado en observación: Banxico 6.5% - Etherfuse 5.6% = 0.9%
// Ajustar si Etherfuse cambia su modelo de comisiones
const ETHERFUSE_SPREAD = 0.9

export async function handler() {

  // ── Banxico SIE API — SF43936 = CETES 28 días tasa de rendimiento ──────────
  try {
    const banxicoToken = process.env.BANXICO_TOKEN
    if (!banxicoToken) throw new Error('BANXICO_TOKEN no configurado en .env')

    const res = await fetch(
      `https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF43936/datos/oportuno?token=${banxicoToken}`,
      { headers: { 'Accept': 'application/json' } }
    )

    if (!res.ok) throw new Error(`Banxico HTTP ${res.status}`)

    const data = await res.json()

    // Estructura de respuesta Banxico:
    // { bmx: { series: [{ datos: [{ dato: "6.50", fecha: "2026-05-04" }] }] } }
    const serie = data?.bmx?.series?.[0]
    const ultimo = serie?.datos?.[0]

    if (!ultimo || ultimo.dato === 'N/E') throw new Error('Dato no disponible')

    const tasaBruta = parseFloat(ultimo.dato)
    if (isNaN(tasaBruta) || tasaBruta <= 0) throw new Error('Tasa inválida')

    // Tasa que realmente recibe el usuario después del spread de Etherfuse
    const tasaUsuario = Math.max(0, tasaBruta - ETHERFUSE_SPREAD)

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        // "rate" es lo que usa useEtherfuseRate como cetesRate
        // El hook luego resta el 1% de comisión de Mañana Seguro para dar userRate
        rate: parseFloat(tasaBruta.toFixed(2)),
        tasaBruta: parseFloat(tasaBruta.toFixed(2)),
        tasaUsuarioEtherfuse: parseFloat(tasaUsuario.toFixed(2)),
        fecha: ultimo.fecha,
        source: 'banxico',
      }),
    }

  } catch (err) {
    console.warn('[cetes-rate] Banxico falló, usando fallback:', err.message)

    // Fallback: última tasa conocida
    // Actualizar manualmente si la tasa cambia significativamente
    // Banxico actualiza CETES cada semana (subasta del martes)
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        rate: 6.5,           // tasa bruta de Banxico
        tasaBruta: 6.5,
        tasaUsuarioEtherfuse: 5.6,
        source: 'fallback',
        error: err.message,
      }),
    }
  }
}