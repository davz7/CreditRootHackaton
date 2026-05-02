import freighterApi from "@stellar/freighter-api"

const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015"

export async function conectarWallet() {
  const isConnected = await freighterApi.isConnected()
  if (!isConnected) {
    throw new Error("Freighter no está disponible. ¿Está instalado?")
  }

  await freighterApi.requestAccess()
  const { address } = await freighterApi.getAddress()

  if (!address) {
    throw new Error('Cancelaste la conexión o no se obtuvo la dirección.')
  }

  return address
}

export async function firmarTransaccion(transactionXdr) {
  const { signedTxXdr } = await freighterApi.signTransaction(transactionXdr, {
    networkPassphrase: NETWORK_PASSPHRASE
  })
  return signedTxXdr
}