import { useState } from 'react'

export function useAnimatedValue(value) {
  const [prev, setPrev] = useState(value)
  const [key, setKey] = useState(0)

  if (prev !== value) {
    setPrev(value)
    setKey(k => k + 1)
  }

  return { display: value, key }
}