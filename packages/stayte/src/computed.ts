import { GluonSubscription } from "./class/Gluon"
import { ReadGluon } from "./class/ReadGluon"

export const computed = <T>(getter: () => T, deps: Array<GluonSubscription<any>>) => {
  return new ReadGluon<T>(getter, deps)
}