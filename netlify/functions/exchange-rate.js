// netlify/functions/exchange-rate.js
// Tipo de cambio USD → MXN en tiempo real desde Banxico SIE API
// Serie SF43186 = Tipo de cambio peso mexicano / dólar americano (FIX)
// Publicado por Banxico cada día hábil

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

export async function handler() {
  try {
    const banxicoToken = process.env.BANXICO_TOKEN
    if (!banxicoToken) throw new Error('BANXICO_TOKEN no configurado')

    const res = await fetch(
      `https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF43186/datos/oportuno?token=${banxicoToken}`,
      { headers: { 'Accept': 'application/json' } }
    )

    if (!res.ok) throw new Error(`Banxico HTTP ${res.status}`)

    const data = await res.json()
    const serie = data?.bmx?.series?.[0]
    const ultimo = serie?.datos?.[0]

    if (!ultimo || ultimo.dato === 'N/E') throw new Error('Dato no disponible')

    const rate = parseFloat(ultimo.dato)
    if (isNaN(rate) || rate < 10 || rate > 30) throw new Error(`Tipo de cambio fuera de rango: ${rate}`)

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        usdMxn: parseFloat(rate.toFixed(4)),
        fecha: ultimo.fecha,
        source: 'banxico',
      }),
    }
  } catch (err) {
    console.warn('[exchange-rate] Banxico falló, usando fallback:', err.message)
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        usdMxn: 17.50,
        source: 'fallback',
        error: err.message,
      }),
    }
  }
}
