'use client';

import { useGluon } from "stayte";
import { z } from "zod";

export default function User() {

  const user = useGluon('user', {
    from: 'cookie',
    schema: z.object({
      name: z.string(),
      age: z.number()
    })
  })

  return (<div>
    <p>user: {JSON.stringify(user.value)}</p>
    <p>Etat du gluon: {user.error ? `error (${user.error.errors.map((error) => error.message).join(', ')})` : 'ok'}</p>

    <div style={{ flexDirection: 'column', display: 'flex', width: 'fit-content' }}>
      <button onClick={() => user.value = { age: 10, name: 'John Doe' }}>update name valid</button>
      {/* @ts-ignore */}
      <button onClick={() => user.value = { name: 'John Doe' }}>update user invalid (missing age)</button>
      {/* @ts-ignore */}
      <button onClick={() => user.value = {}}>update user invalid (missing age and name)</button>

      <button onClick={() => user.value = { ...user.value, age: user.value.age + 1 }}>increment</button>
    </div>

  </div>)

}