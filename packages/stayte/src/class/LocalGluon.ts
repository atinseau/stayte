import { isServer } from "../utils";
import { Gluon } from "./Gluon";



export class LocalGluon<T> extends Gluon<T> {

  static SECURE_HYDRATION = true

  setup(): void {

    // There is nothing to do on the server
    // no need to call configure (no need to trigger the callback)
    // so we can return
    if (isServer()) {
      return
    }

    this.configure(() => {
      const value = localStorage.getItem(this.name)
      if (value) {
        this.value = this.parse(value)
      }
    })
  }

  set(value: T) {

    // Nothing could be done on the server
    // because localStorage is not available 
    if (isServer()) {
      return
    }

    this.update(value, () => {
      localStorage.setItem(this.name, typeof value === 'object'
        ? JSON.stringify(value)
        : value as any
      )
    })
  }

}