import { useRef, useSyncExternalStore } from 'react'
import { Gluon, GluonOptions } from '../class/Gluon'
import { gluon, GluonMap } from '../gluon'
import { type z, ZodError, ZodType } from 'zod'
import { ReadGluon } from '../class/ReadGluon'
import { isSecureHydrationGluon } from '../utils'

function asHydrationGuard(gluon: Gluon<any> | ReadGluon<any>) {
  if (gluon instanceof Gluon) {
    return isSecureHydrationGluon(gluon)
  }
  return gluon.asSecureHydrationDeps()
}

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
    ? { 
      value: Schema extends ZodType ? z.infer<Schema> : T,
      error?: ZodError,
      gluon: Name extends Gluon<any> | ReadGluon<any> ? Name: GluonMap<Schema extends ZodType ? z.infer<Schema> : T>[U]
    }
    : {
      value: Name extends Gluon<any> | ReadGluon<any> ? NonNullable<ReturnType<Name['get']>> : never,
      error?: ZodError,
      gluon: Name extends Gluon<any> | ReadGluon<any> ? Name: GluonMap<Name extends Gluon<any> | ReadGluon<any> ? NonNullable<ReturnType<Name['get']>> : never>[U] }
  ) => {

  const gluonRef = useRef<Gluon<any> | ReadGluon<any>>()
  const isMountedRef = useRef(false)
  const countRef = useRef(0)

  if (!gluonRef.current) {
    gluonRef.current = (typeof name === 'string' || typeof name === 'undefined')
      ? gluon(name, options as any)
      : name
  }

  const proxyRef = useRef(new Proxy({ value: gluonRef.current!.get(), error: null, gluon: gluonRef.current! }, {
    get: (...args) => {
      if (args[1] === 'value') {
        if (asHydrationGuard(gluonRef.current!) && !isMountedRef.current) return null
        return gluonRef.current?.get()
      }

      if (args[1] === 'error' && gluonRef.current instanceof Gluon) {
        return gluonRef.current!.error
      }

      if (args[1] === 'gluon') {
        return gluonRef.current!
      }

      return Reflect.get(...args)
    },
    set: (...args) => {
      if (gluonRef.current instanceof ReadGluon) {
        console.error('Cannot set a ReadGluon')
        return false
      }

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

      if (!isMountedRef.current) {
        isMountedRef.current = true

        // This behavior is needed to prevent hydration error
        // because some gluon children class are not able to fetch the value from 
        // the server (from the request) and we need to skip the first render (first value is null)
        // and manually calling the callback
        if (asHydrationGuard(gluonRef.current!) && countRef.current === 0) {
          countRef.current++
          callback()
        }
      }

      const unsubscribe = gluonRef.current!.subscribe(() => {
        countRef.current++
        callback()
      })
      return unsubscribe
    },
    () => countRef.current,
    () => countRef.current,
  )

  return proxyRef.current as any
}