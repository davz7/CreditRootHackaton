import { useState, useRef, useEffect } from 'react'

export function useAnimatedValue(value) {
  const [display, setDisplay] = useState(value)
  const [key, setKey] = useState(0)
  const prev = useRef(value)
  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value
      setDisplay(value)
      setKey(k => k + 1)
    }
  }, [value])
  return { display, key }
}
