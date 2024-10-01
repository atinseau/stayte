import { useEffect, useState } from "react"


const NoSsr = ({ children }: { children: React.ReactNode }) => {

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return children
}

export default NoSsr