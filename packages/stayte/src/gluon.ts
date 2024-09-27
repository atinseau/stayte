import { z, ZodType } from "zod"
import { GluonOptions } from "./class/Gluon"
import { QueryGluon } from "./class/QueryGluon"
import { LocalGluon } from "./class/LocalGluon"

export type GluonMap<T> = {
  "query": QueryGluon<T>
  "cookies": any
  "local": LocalGluon<T>
  "session": any
}

export const gluon = <
  U extends keyof GluonMap<any>,
  Schema,
  T = false
>(
  name: string,
  options: GluonOptions<T, Schema> & { from: U }
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

  throw new Error('Cannot create a Gluon from this source')
}
