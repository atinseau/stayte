'use client';
import { useEffect, useState } from "react";
import { gluon, computed } from "stayte";
import { useGluon } from "stayte/react";

const countGluon = gluon('count', {
  from: 'session',
  defaultValue: 10
})

console.log('countGluon', countGluon.get())

const doubleGluon = computed(() => countGluon.get() * 2, [countGluon])

console.log('doubleGluon', doubleGluon.get())

// doubleGluon.subscribe((value) => {
//   console.log('double', value)
// })

function CountA() {
  const [normalCount, setNormalCount] = useState(0)

  const count = useGluon(countGluon)

  return (<div>
    <p>salut tout le monde {count.value ?? 'null'}</p>
    <p>Etat du gluon: {count.error ? `error (${count.error.errors.map((error) => error.message).join(', ')})` : 'ok'}</p>
    <button onClick={() => count.value++}>incrementer</button>
    <button onClick={() => count.value = 10}>set to 10</button>

    <button onClick={() => setNormalCount(normalCount + 1)}>increment normal count {normalCount}</button>
    <button onClick={() => setNormalCount(0)}>reset normal count</button>
  </div>);
}

function CountB() {
  const doubleCount = useGluon(doubleGluon)
  return (<div>{doubleCount.value ?? 'null'}</div>)
}

export default function Count() {

  return <div>
    <CountA />
    <CountB />
  </div>
}
