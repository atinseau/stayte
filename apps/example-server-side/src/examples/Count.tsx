'use client';
import { useEffect, useState } from "react";
import { useGluon } from "stayte";

export default function Count() {

  const [normalCount, setNormalCount] = useState(0)

  const count = useGluon('count', {
    from: 'query',
    defaultValue: 10
  })

  useEffect(() => {
    console.log('Mounted', count.value)
  }, [count.value])

  return (<div>
    <p>salut tout le monde {count.value ?? 'null'}</p>
    <p>Etat du gluon: {count.error ? `error (${count.error.errors.map((error) => error.message).join(', ')})` : 'ok'}</p>
    <button onClick={() => count.value++}>incrementer</button>
    <button onClick={() => count.value = 10}>set to 10</button>

    <button onClick={() => setNormalCount(normalCount + 1)}>increment normal count {normalCount}</button>
    <button onClick={() => setNormalCount(0)}>reset normal count</button>
 </div>);
}
