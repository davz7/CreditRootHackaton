// Variables de entorno requeridas:
//   SUPABASE_URL, SUPABASE_SERVICE_KEY
//   WEBHOOK_SECRET → secreto devuelto por Etherfuse al crear el webhook

import { createClient } from '@supabase/supabase-js'
import { createHmac, timingSafeEqual } from 'crypto'

//  Constantes 

// Solo acepta POST — los webhooks siempre son POST
const CORS_HEADERS = {
  'Content-Type': 'application/json',
}

//  Verificación de firma HMAC-SHA256 

/**
 * Verifica la firma del webhook de Etherfuse.
 *
 * Etherfuse firma el body con HMAC-SHA256 usando el secreto devuelto
 * al crear el webhook (POST /ramp/webhook → { secret }).
 * La firma viene en el header X-Signature como hex.
 *
 * timingSafeEqual previene timing attacks — ISO 25010 Seguridad.
 */
function verificarFirma(body, firmaRecibida, secreto) {
  if (!firmaRecibida || !secreto) return false

  try {
    const firmaEsperada = createHmac('sha256', secreto)
      .update(body, 'utf8')
      .digest('hex')

    const bufferEsperado = Buffer.from(firmaEsperada, 'hex')
    const bufferRecibido = Buffer.from(firmaRecibida, 'hex')

    if (bufferEsperado.length !== bufferRecibido.length) return false

    return timingSafeEqual(bufferEsperado, bufferRecibido)
  } catch {
    return false
  }
}

//  Handlers por tipo de evento 

/**
 * kyc_updated: el usuario completó (o falló) el KYC en Etherfuse.
 * Actualiza kyc_status y bank_account_status en Supabase.
 */
async function handleKycUpdated(payload, supabase) {
  const { customerId, kycStatus, bankAccountId, bankAccountStatus } = payload

  if (!customerId) {
    console.warn('[webhook] kyc_updated sin customerId')
    return
  }

  const updates = {
    kyc_status: kycStatus,       // 'approved' | 'rejected' | 'pending'
    updated_at: new Date().toISOString(),
  }

  if (bankAccountStatus) {
    updates.bank_account_status = bankAccountStatus
  }

  const { error } = await supabase
    .from('usuarios')
    .update(updates)
    .eq('customer_id', customerId)

  if (error) {
    console.error('[webhook] Error actualizando KYC:', error.message)
  } else {
    console.info('[webhook] KYC actualizado:', customerId, '→', kycStatus)
  }
}

/**
 * order_updated: una orden de depósito cambió de estado.
 * Estados: created → funded → completed
 * Cuando es 'completed', el usuario ya tiene sus CETES en Stellar.
 */
async function handleOrderUpdated(payload, supabase) {
  const { orderId, status, stellarClaimTransaction } = payload

  if (!orderId) {
    console.warn('[webhook] order_updated sin orderId')
    return
  }

  const updates = {
    status,
    updated_at: new Date().toISOString(),
  }

  // Si hay una transacción de claim pendiente (wallet nueva), guardarla
  // El frontend la firmará con la llave custodial del usuario
  if (stellarClaimTransaction) {
    updates.stellar_claim_transaction = stellarClaimTransaction
  }

  const { error } = await supabase
    .from('ordenes')
    .update(updates)
    .eq('order_id', orderId)

  if (error) {
    console.error('[webhook] Error actualizando orden:', error.message)
  } else {
    console.info('[webhook] Orden actualizada:', orderId, '→', status)

    // TODO cuando status === 'completed':
    // 1. Si hay stellarClaimTransaction → firmarla con la llave custodial
    //    y enviarla a Stellar para que el usuario reciba sus CETES
    // 2. Notificar al usuario (push notification, email, etc.)
  }
}

//  Handler principal ──

export async function handler(event) {

  // Solo acepta POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Método no permitido' }),
    }
  }

  // ── Verificar firma antes de cualquier procesamiento ─
  const firma = event.headers['x-signature'] || event.headers['X-Signature']
  const secreto1 = process.env.WEBHOOK_SECRET
  const secreto2 = process.env.WEBHOOK_SECRET_2

  if (!secreto1) {
    console.error('[webhook] WEBHOOK_SECRET no configurado')
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Error de configuración' }),
    }
  }

  const bodyRaw = event.body || ''

  // Verificar contra ambos secrets — cada eventType tiene el suyo
  const firmaValida = verificarFirma(bodyRaw, firma, secreto1) ||
                      (secreto2 && verificarFirma(bodyRaw, firma, secreto2))

  if (!firmaValida) {
    console.warn('[webhook] Firma inválida — posible request no autorizado')
    return {
      statusCode: 401,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Firma inválida' }),
    }
  }

  // ── Parsear payload ─
  let payload
  try {
    payload = JSON.parse(bodyRaw)
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Body inválido — se esperaba JSON' }),
    }
  }

  const { type, data } = payload

  if (!type) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Falta campo "type" en el webhook' }),
    }
  }

  console.info('[webhook] Evento recibido:', type)

  // ── Responder 200 inmediatamente a Etherfuse 
  // ISO 25010 Fiabilidad: Etherfuse reintenta si no recibe 200 rápido.
  // Procesamos de forma síncrona pero respondemos antes de fallar.

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { persistSession: false } }
  )

  try {
    switch (type) {
      case 'kyc_updated':
        await handleKycUpdated(data || payload, supabase)
        break

      case 'order_updated':
        await handleOrderUpdated(data || payload, supabase)
        break

      default:
        // Loguear eventos desconocidos sin fallar — futuros eventos de Etherfuse
        console.info('[webhook] Evento no manejado (ignorado):', type)
    }
  } catch (err) {
    // Loguear pero responder 200 de todas formas
    // Etherfuse no debe reintentar por errores internos nuestros
    console.error('[webhook] Error procesando evento:', type, err.message)
  }

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ received: true }),
  }
}