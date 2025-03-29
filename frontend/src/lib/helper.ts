import { Program } from '@coral-xyz/anchor'
import { Idl } from '@coral-xyz/anchor'
import solamon from '@/target/idl/solamon.json'
import { clusterApiUrl, Connection, Keypair } from '@solana/web3.js'
import { Solamon } from '@/target/types/solamon'

export function getFromLocalStorage(key: string): string | null {
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(key)
  }
  return null
}

export function getFromSessionStorage(key: string): string | null {
  if (typeof sessionStorage !== 'undefined') {
    return sessionStorage.getItem(key)
  }
  return null
}

export function setToLocalStorage(key: string, value: string) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, value)
  }
}

export function setToSessionStorage(key: string, value: string) {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(key, value)
  }
}

export function setKeypairToLocalStorage() {
  const account = Keypair.generate()
  setToLocalStorage('pk', account.secretKey.toString())
}

export function getKeypairFromLocalStorage(): Keypair | null {
  const pk = getFromLocalStorage('pk')
  if (!pk) return null

  try {
    // Convert the string back to a Uint8Array properly
    const privateKeyArray = Uint8Array.from(pk.split(',').map(Number))
    return Keypair.fromSecretKey(privateKeyArray)
  } catch (error) {
    console.error('Error creating keypair from stored data:', error)
    return null
  }
}

export const getConnection = () => {
  return new Connection(clusterApiUrl('devnet'), 'confirmed')
}

export const getProgram = () => {
  return new Program<Solamon>(solamon as Solamon, {
    connection: getConnection(),
  })
}
