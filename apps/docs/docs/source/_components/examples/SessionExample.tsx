import { useEffect, useRef, useState } from "react"
import { gluon, useGluon } from "stayte"

const count1Gluon = gluon('count1', {
  from: 'session',
  ssr: false
})

const count2Gluon = gluon('count2', {
  from: 'session',
})

function dumpSessionStorage() {
  const sessionStorageKeys = Object.keys(sessionStorage)
  return sessionStorageKeys.reduce((acc, key) => {
    acc[key] = sessionStorage.getItem(key)
    return acc
  }, {})
}

function TrackSessionStorage() {

  const oldSessionStorageRef = useRef(dumpSessionStorage())
  const [currentSessionStorage, setCurrentSessionStorage] = useState(dumpSessionStorage())

  useEffect(() => {

    const timer = setInterval(() => {
      const newSessionStorage = dumpSessionStorage()
      if (JSON.stringify(newSessionStorage) !== JSON.stringify(oldSessionStorageRef.current)) {
        oldSessionStorageRef.current = newSessionStorage
        setCurrentSessionStorage(newSessionStorage)
      }
    }, 100)

    return () => {
      clearInterval(timer)
    }

  }, [])

  return <p>Current sessionStorage: {Object.keys(currentSessionStorage).length > 0 ? `${JSON.stringify(currentSessionStorage)}` : 'Empty'}</p>
}

function NoSsrSessionCounter() {
  const count = useGluon(count1Gluon)
  const renderCountRef = useRef(0)

  renderCountRef.current++

  return <div className="flex flex-col gap-2">
    <p className="mb-0">"ssr: false" is used to skip the first render</p>
    <p className="mb-0">Render count: <strong>{renderCountRef.current}</strong></p>

    <div className="flex gap-2">
      <button onClick={() => count.value = parseInt(count.value ?? 0) + 1} className="bg-gray-300 dark:bg-white outline-none text-black font-bold text-md p-2 border-none rounded-md">
        count: {count.value ?? 0}
      </button>

      <button onClick={() => count1Gluon.clear()} className="bg-red-500 outline-none text-white font-bold text-md p-2 border-none rounded-md">
        Clear local storage
      </button>
    </div>
    <TrackSessionStorage />
  </div>
}

function SsrSessionCounter() {
  const count = useGluon(count2Gluon)
  const renderCountRef = useRef(0)

  renderCountRef.current++

  return <div className="flex flex-col gap-2">
    <p className="mb-0">default ssr behavior, first render will be empty and second render will be filled</p>
    <p className="mb-0">Render count: <strong>{renderCountRef.current}</strong></p>

    <div className="flex gap-2">
      <button onClick={() => count.value = parseInt(count.value ?? 0) + 1} className="bg-gray-300 dark:bg-white outline-none text-black font-bold text-md p-2 border-none rounded-md">
        count: {count.value ?? 0}
      </button>

      <button onClick={() => count2Gluon.clear()} className="bg-red-500 outline-none text-white font-bold text-md p-2 border-none rounded-md">
        Clear local storage
      </button>
    </div>
    <TrackSessionStorage />
  </div>
}

export default function SessionExample() {

  return <>
    <NoSsrSessionCounter />
    <SsrSessionCounter />
  </>
}