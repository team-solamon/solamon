export const getExplorerUrl = (
  publicKey: string,
  cluster: string = 'devnet'
) => {
  return `https://solscan.io/account/${publicKey}?cluster=${cluster}`
}

export const getTransactionUrl = (
  transactionId: string,
  cluster: string = 'devnet'
) => {
  return `https://solscan.io/tx/${transactionId}?cluster=${cluster}`
}

export const getTokenUrl = (
  tokenAddress: string,
  cluster: string = 'devnet'
) => {
  return `https://solscan.io/token/${tokenAddress}?cluster=${cluster}`
}
