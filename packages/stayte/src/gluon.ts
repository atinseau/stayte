import { z, ZodType } from "zod"
import { GluonOptions } from "./class/Gluon"
import { QueryGluon } from "./class/QueryGluon"
import { LocalGluon } from "./class/LocalGluon"
import { CookieGluon } from "./class/CookieGluon"
import { SessionGluon } from "./class/SessionGluon"
import { MemoryGluon } from "./class/MemoryGluon"

export type GluonMap<T> = {
  "query": QueryGluon<T>
  "cookie": CookieGluon<T>
  "local": LocalGluon<T>
  "session": SessionGluon<T>
  "memory": MemoryGluon<T>
}

export const gluon = <
  U extends keyof GluonMap<any>,
  Schema,
  T = false
>(
  name: string,
  options: GluonOptions<T, Schema>
    & { from: U }
    & { options?: Parameters<GluonMap<any>[U]['setup']>[0] }
): (
    Schema extends ZodType
    ? GluonMap<z.infer<Schema>>[U]
    : (
      T extends false
      ? GluonMap<any>[U]
      : GluonMap<T>[U]
    )
  ) => {

  if (options.from === 'query') {
    return new QueryGluon(name, options as any) as any
  }

  if (options.from === 'local') {
    return new LocalGluon(name, options as any) as any
  }

  if (options.from === 'cookie') {
    return new CookieGluon(name, options as any) as any
  }

  if (options.from === 'session') {
    return new SessionGluon(name, options as any) as any
  }

  if (options.from === 'memory') {
    return new MemoryGluon(name, options as any) as any
  }

  throw new Error('Cannot create a Gluon from this source')
}
