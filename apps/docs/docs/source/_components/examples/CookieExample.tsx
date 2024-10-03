import { useEffect, useRef, useState } from "react"
import { gluon } from "stayte"
import { useGluon } from "stayte/react"

const countGluon = gluon('count', {
  from: 'cookie',
})

export default function CookieExample() {

  const count = useGluon(countGluon)
  const oldCookieRef = useRef(window.document.cookie)

  const [currentCookie, setCurrentCookie] = useState(window.document.cookie)

  useEffect(() => {
    const timer = setInterval(() => {
      if (window.document.cookie !== oldCookieRef.current) {
        console.log('cookie changed', window.document.cookie)
        oldCookieRef.current = window.document.cookie
        setCurrentCookie(window.document.cookie)
      }
    }, 100)

    return () => {
      clearInterval(timer)
    }
  }, [])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button onClick={() => count.value = parseInt(count.value ?? 0) + 1} className="bg-gray-300 dark:bg-white outline-none text-black font-bold text-md p-2 border-none rounded-md">
          count: {count.value ?? 0}
        </button>

        <button onClick={() => countGluon.clear()} className="bg-red-500 outline-none text-white font-bold text-md p-2 border-none rounded-md">
          Clear cookie
        </button>
      </div>
      <p>Cookie in the browser: {currentCookie.length > 0 ? `"${currentCookie}"` : 'Empty'}</p>
    </div>
  )
}