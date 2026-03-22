// netlify/functions/cetes-rate.js
// Proxy para la API de Etherfuse — evita CORS desde el browser

export async function handler() {
  try {
    const res = await fetch("https://stablebonds.etherfuse.com/bonds", {
      headers: { "Accept": "application/json" },
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const bonds = await res.json()
    const cetes = bonds.find(
      b => b.name?.toLowerCase().includes("cetes") ||
           b.symbol?.toLowerCase().includes("cetes")
    )

    const raw = cetes?.apy ?? cetes?.interestRate ?? cetes?.rate ?? 5.7
    const rate = raw > 100 ? raw / 100 : parseFloat(raw)

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ rate: parseFloat(rate.toFixed(2)), source: "etherfuse" }),
    }
  } catch (err) {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ rate: 5.7, source: "fallback", error: err.message }),
    }
  }
}
