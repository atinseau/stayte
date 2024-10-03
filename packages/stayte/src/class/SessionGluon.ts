import { isServer } from "../utils";
import { Gluon, GluonSetter } from "./Gluon";



export class SessionGluon<T> extends Gluon<T> {

  static SECURE_HYDRATION = true

  clear() {
    this.value = null
    this.emit(null)
    sessionStorage.removeItem(this.name)
  }

  setup(): void {

    // There is nothing to do on the server
    // no need to call configure (no need to trigger the callback)
    // so we can return
    if (isServer()) {
      return
    }

    this.configure(() => {
      const value = sessionStorage.getItem(this.name)
      if (value) {
        this.value = this.parse(value)
      }
    })
  }

  set(setter: GluonSetter<T>) {

    // Nothing could be done on the server
    // because sessionStorage is not available 
    if (isServer()) {
      return
    }

    this.update(setter, (value) => {
      sessionStorage.setItem(this.name, typeof value === 'object'
        ? JSON.stringify(value)
        : value as any
      )
    })
  }

}