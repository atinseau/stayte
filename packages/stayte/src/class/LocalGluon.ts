import { Gluon } from "./Gluon";



export class LocalGluon<T> extends Gluon<T> {

  setup(): void {
    const value = localStorage.getItem(this.name)
    if (value) {
      this.value = this.parse(value)
    }
  }

  set(value: T) {
    this.update(value, () => {
      localStorage.setItem(this.name, typeof value === 'object'
        ? JSON.stringify(value)
        : value as any
      )
    })
  }

}