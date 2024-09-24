import { useRef, useSyncExternalStore } from 'react'
import { Gluon, GluonOptions } from '../class/Gluon'
import { gluon, GluonMap } from '../gluon'
import { z, ZodType } from 'zod'


export const useGluon = <
  U extends keyof GluonMap<any>,
  Name extends string | Gluon<any>,
  Schema,
  T = false
>(
  name: Name,
  options?: (
    Name extends string
    ? GluonOptions<T, Schema> & { from: U }
    : never
  )
): (
    Name extends string
    ? { value: Schema extends ZodType ? z.infer<Schema> : T }
    : { value: Name extends Gluon<any> ? NonNullable<Name['value']> : never }
  ) => {


  const gluonRef = useRef<Gluon<any>>()

  if (!gluonRef.current) {
    gluonRef.current = typeof name === 'string'
      ? gluon(name, options as any)
      : name
  }


  const proxyRef = useRef(new Proxy({ value: gluonRef.current!.get() }, {
    get: (...args) => {
      if (args[1] === 'value') {
        return args[0].value
      }
      return Reflect.get(...args)
    },
    set: (...args) => {
      if (args[1] === 'value') {
        gluonRef.current!.set(args[2])
      }
      return Reflect.set(...args)
    }
  }))

  useSyncExternalStore(
    (callback) => {
      const unsubscribe = gluonRef.current!.subscribe(callback)
      return unsubscribe
    },
    () => gluonRef.current!.get()
  )

  return proxyRef.current as any
}