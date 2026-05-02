import { usePollar } from '@pollar/react'

export function usePollarSession() {
  const pollar = usePollar()
  console.log('pollar completo:', pollar)
  return pollar
}