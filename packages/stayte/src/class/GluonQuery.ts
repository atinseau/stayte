import { Gluon } from "./Gluon"

export class QueryGluon<T> extends Gluon<T> {

  setup() {
    const searchParams = new URLSearchParams(window.location.search)
    const value = searchParams.get(this.name) as any

    if (value) {
      this.value = this.parse(value)
    }
  }

  set(value: T) {
    this.update(value, () => {
      const searchParams = new URLSearchParams(window.location.search)
      searchParams.set(this.name, typeof value === 'object'
        ? JSON.stringify(value)
        : value as any
      )
      window.history.pushState({}, '', `?${searchParams.toString()}`)
    })
  }
}
