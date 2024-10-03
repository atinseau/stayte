import { useEffect, useRef, useState } from 'react';
import { useGluon } from 'stayte';


const Query = () => {

  const oldQueryRef = useRef(window.location.search)
  const [currentQuery, setCurrentQuery] = useState(window.location.search)

  const count = useGluon('count', {
    from: 'query',
  })

  useEffect(() => {

    const timer = setInterval(() => {
      if (window.location.search !== oldQueryRef.current) {
        console.log('query changed', window.location.search)
        oldQueryRef.current = window.location.search
        setCurrentQuery(window.location.search)
      }
    }, 100)

    return () => {
      clearInterval(timer)
    }

  }, [])

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex gap-2'>
        <button onClick={() => count.value = parseInt(count.value ?? 0) + 1} className="bg-gray-300 dark:bg-white outline-none text-black font-bold text-md p-2 border-none rounded-md">
          count: {count.value ?? 0}
        </button>
        <button onClick={() => count.gluon.clear()} className="bg-red-500 outline-none text-white font-bold text-md p-2 border-none rounded-md">
          Clear query
        </button>
      </div>
      <p>Query in the url: {currentQuery.length > 0 ? `"${currentQuery}"` : 'Empty'}</p>
    </div>
  )
}

export default function QueryExample() {
  return <>
    <Query />
  </>
}