'use client';
import { gluon, useGluon } from "stayte"

const countGluon = gluon('name', {
  from: "memory",
  defaultValue: 50,
})

countGluon.subscribe(() => {
  console.log('countGluon changed', countGluon.get())
})

const A = () => {

  const count = useGluon(countGluon)

  return (<div>
    <p>empty gluon: {count.value ?? 'null'}</p>
    <button onClick={() => count.value++}>increment</button>
  </div>)

}

const B = () => {
  const count = useGluon(countGluon)
  return (<div>
    <p>{count.value ?? 'null'}</p>
    <button onClick={() => count.value = 10}>set 10</button>
  </div>)
}

export default function InMemoryGluon() {
  return (<div>
    <A />
    <B />
  </div>)
}