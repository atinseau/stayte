import { useGluon } from 'stayte/react';

const Counter = () => {
  const count = useGluon('count', {
    from: 'query',
  })

  return (
    <button onClick={() => count.value = parseInt(count.value ?? 0) + 1} className="bg-white outline-none text-black font-bold text-md p-2 border-none rounded-md">
      count: {count.value ?? 0}
    </button>
  )
}

export default Counter