import { useEffect, useRef, useState } from "react"
import { gluon, useGluon } from "stayte"

const count1Gluon = gluon('count1', {
  from: 'local',
  ssr: false
})

const count2Gluon = gluon('count2', {
  from: 'local',
})

function dumpLocalStorage() {
  const localStorageKeys = Object.keys(localStorage)
  return localStorageKeys.reduce((acc, key) => {
    acc[key] = localStorage.getItem(key)
    return acc
  }, {})
}

function TrackLocalStorage() {

  const oldLocalStorageRef = useRef(dumpLocalStorage())
  const [currentLocalStorage, setCurrentLocalStorage] = useState(dumpLocalStorage())

  useEffect(() => {

    const timer = setInterval(() => {
      const newLocalStorage = dumpLocalStorage()
      if (JSON.stringify(newLocalStorage) !== JSON.stringify(oldLocalStorageRef.current)) {
        oldLocalStorageRef.current = newLocalStorage
        setCurrentLocalStorage(newLocalStorage)
      }
    }, 100)

    return () => {
      clearInterval(timer)
    }

  }, [])

  return <p>Current localStorage: {Object.keys(currentLocalStorage).length > 0 ? `${JSON.stringify(currentLocalStorage)}` : 'Empty'}</p>
}

function NoSsrLocalCounter() {
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
    <TrackLocalStorage />
  </div>
}

function SsrLocalCounter() {
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
    <TrackLocalStorage />
  </div>
}

export default function LocalExample() {

  return <>
    <NoSsrLocalCounter />
    <SsrLocalCounter />
  </>
}