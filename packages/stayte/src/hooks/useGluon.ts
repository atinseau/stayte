import { useRef, useSyncExternalStore } from 'react'
import { Gluon, GluonOptions } from '../class/Gluon'
import { gluon, GluonMap } from '../gluon'
import { type z, ZodError, ZodType } from 'zod'
import { ReadGluon } from '../class/ReadGluon'


export const useGluon = <
  U extends keyof GluonMap<any>,
  Name extends string | Gluon<any> | ReadGluon<any>,
  Schema,
  T = any
>(
  name: Name,
  options?: (
    Name extends string
    ? GluonOptions<T, Schema>
      & { from: U }
      & { options?: Parameters<GluonMap<any>[U]['setup']>[0] }
    : never
  )
): (
    Name extends string
    ? { value: Schema extends ZodType ? z.infer<Schema> : T, error?: ZodError }
    : { value: Name extends Gluon<any> | ReadGluon<any> ? NonNullable<Name['value']> : never, error?: ZodError }
  ) => {

  const gluonRef = useRef<Gluon<any>>()
  const countRef = useRef(0)

  if (!gluonRef.current) {
    gluonRef.current = typeof name === 'string'
      ? gluon(name, options as any)
      : name
  }

  const proxyRef = useRef(new Proxy({ value: gluonRef.current!.get(), error: null }, {
    get: (...args) => {
      if (args[1] === 'value') {
        return gluonRef.current!.get()
      }

      if (args[1] === 'error') {
        return gluonRef.current!.error
      }

      return Reflect.get(...args)
    },
    set: (...args) => {

      if (gluonRef.current instanceof ReadGluon) {
        console.error('Cannot set a ReadGluon')
        return false
      }

      countRef.current++
      if (args[1] === 'value') {
        gluonRef.current!.set(args[2])
      }
      return Reflect.set(...args)
    }
  }))


  // To understand who useSyncExternalStore works, it's pretty basic
  // the callback is used to trigger the render of the component, if the value changes
  // and call the internal callback of the useSyncExternalStore, so useSyncExternalStore
  // will trigger a render, getSnapshot and getServerSnapshot is used to confirm the change
  // if the callback is called but the snapshot didn't change, the component will not be re-rendered
  useSyncExternalStore(
    (callback) => {
      const unsubscribe = gluonRef.current!.subscribe(callback)
      return unsubscribe
    },
    () => countRef.current,
    () => countRef.current,
  )

  return proxyRef.current as any
}