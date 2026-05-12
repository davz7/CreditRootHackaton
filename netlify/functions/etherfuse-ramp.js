// Proxy para la Etherfuse Ramp API — maneja autenticación y CORS
// Variables de entorno requeridas (Netlify dashboard > Environment variables):
//   ETHERFUSE_API_KEY  → tu API key de devnet.etherfuse.com

const SANDBOX_URL = 'https://api.sand.etherfuse.com'
const PROD_URL    = 'https://api.etherfuse.com'

const BASE_URL = process.env.ETHERFUSE_ENV === 'production' ? PROD_URL : SANDBOX_URL

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

//  Helper: llamar a la Ramp API 
async function callRampApi(path, method = 'GET', body = null) {
  const apiKey = process.env.ETHERFUSE_API_KEY
  if (!apiKey) throw new Error('ETHERFUSE_API_KEY no configurada')

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      // Etherfuse no usa prefijo "Bearer" — el API key va directo
      'Authorization': apiKey,
    },
  }
  if (body) options.body = JSON.stringify(body)

  const res = await fetch(`${BASE_URL}${path}`, options)
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || data.error || `HTTP ${res.status}`)
  }

  return data
}

//  Handler principal 
export async function handler(event) {
  // Preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' }
  }

  const { action } = event.queryStringParameters || {}

  try {
    let result

    //  GET /assets — activos disponibles en Stellar
    // En el bloque de 'assets', reemplaza temporalmente:
     if (action === 'assets' && event.httpMethod === 'GET') {
      const res = await fetch(`${BASE_URL}/ramp/assets?blockchain=stellar`, {
        headers: {
          'Authorization': process.env.ETHERFUSE_API_KEY,
          'Content-Type': 'application/json',
        }
      })
      const text = await res.text()
      console.log('[assets raw]', text)  // ver qué devuelve
      result = JSON.parse(text)
    }
    //  POST /quote — cotización MXN → MXNe o MXN → CETES
    else if (action === 'quote' && event.httpMethod === 'POST') {
      const { walletAddress, amountMxn, targetAsset, customerId } = JSON.parse(event.body)

      if (!walletAddress || !amountMxn || !targetAsset || !customerId) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Faltan campos: walletAddress, amountMxn, targetAsset, customerId' }),
        }
      }

      result = await callRampApi('/ramp/quote', 'POST', {
        quoteId: crypto.randomUUID(),
        customerId,
        blockchain: 'stellar',
        quoteAssets: {
          type: 'onramp',
          sourceAsset: 'MXN',
          targetAsset, // ej: "USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
        },
        sourceAmount: String(amountMxn),
        walletAddress, // para wallets nuevas — Etherfuse calcula el fee de onboarding
      })
    }

    //  POST /order — crear orden y obtener CLABE SPEI
    else if (action === 'order' && event.httpMethod === 'POST') {
      const { quoteId, bankAccountId, cryptoWalletId } = JSON.parse(event.body)

      if (!quoteId || !bankAccountId || !cryptoWalletId) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Faltan campos: quoteId, bankAccountId, cryptoWalletId' }),
        }
      }

      result = await callRampApi('/ramp/order', 'POST', {
        orderId: crypto.randomUUID(),
        bankAccountId,
        cryptoWalletId,
        quoteId,
      })
      // result.depositClabe  → la CLABE que el usuario usa para el SPEI
      // result.depositBankName → "STP"
      // result.statusPage    → URL para seguimiento
    }

    //  GET /order/:id — estado de una orden
    else if (action === 'order-status' && event.httpMethod === 'GET') {
      const { orderId } = event.queryStringParameters
      if (!orderId) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Falta orderId' }),
        }
      }
      result = await callRampApi(`/ramp/order/${orderId}`)
      // result.status: 'created' | 'funded' | 'completed'
      // result.stellarClaimTransaction → XDR sin firmar (si la wallet es nueva)
    }

    //  POST /onboarding/hosted — URL de KYC hosted de Etherfuse
    else if (action === 'kyc-url' && event.httpMethod === 'POST') {
      const { walletAddress, email } = JSON.parse(event.body)

      if (!walletAddress || !email) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Faltan campos: walletAddress, email' }),
        }
      }

      result = await callRampApi('/ramp/onboarding/hosted', 'POST', {
        walletPublicKey: walletAddress,
        email,
        blockchain: 'stellar',
        redirectUrl: process.env.URL + '/dashboard', // Netlify inyecta URL automáticamente
      })
      // result.url → redirige al usuario aquí para KYC
    }

    //  GET /kyc-status — estado del KYC del usuario
    else if (action === 'kyc-status' && event.httpMethod === 'GET') {
      const { customerId, walletAddress } = event.queryStringParameters
      if (!customerId || !walletAddress) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Faltan campos: customerId, walletAddress' }),
        }
      }
      result = await callRampApi(`/ramp/customer/${customerId}/kyc/${walletAddress}`)
      // result.status: 'not_started' | 'proposed' | 'approved' | 'rejected'
    }

    //  Acción no reconocida
    else {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Acción no válida',
          acciones_disponibles: ['assets', 'quote', 'order', 'order-status', 'kyc-url', 'kyc-status'],
        }),
      }
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(result),
    }

  } catch (err) {
    console.error('[etherfuse-ramp]', err.message)
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
