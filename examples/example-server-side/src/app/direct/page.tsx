'use client';
import { useGluon } from "stayte/react";

export default function Page() {

  const count = useGluon('count', {
    from: 'query',
    defaultValue: 10
  })

  return (<div>
    <p>count: {count.value}</p>
    <button onClick={() => count.value++}>increment</button>
  </div>)
}