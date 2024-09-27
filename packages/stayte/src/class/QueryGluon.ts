import { isServer } from "../utils"
import { Gluon } from "./Gluon"

export class QueryGluon<T> extends Gluon<T> {

  static PUSH_STATE_DELAY = 10

  setup() {
    // @ts-ignore
    const url = (typeof window === 'undefined' ? globalThis?.request?.url ?? '' : window.location.search).replace(/^\//, '')
    const searchParams = new URLSearchParams(url)
    const value = searchParams.get(this.name) as any

    if (value) {
      this.value = this.parse(value)
    }
  }

  set(value: T) {
    this.update(value, () => {
      if (isServer()) {
        return
      }

      // This part of the set method is only called on the client
      // and is used to update the query string (not needed on the server)

      const searchParams = new URLSearchParams(window.location.search)
      let waitForUpdate = false

      // If the value is null, it's mean it's first time we set the value
      // (query string is empty), we need to wait a little bit before pushing the new value
      // to prevent hmr to trigger an url update
      if (!searchParams.get(this.name)) {
        waitForUpdate = true
      }

      searchParams.set(this.name, typeof value === 'object'
        ? JSON.stringify(value)
        : value as any
      )

      if (waitForUpdate) {
        setTimeout(() => this.replaceState(searchParams), QueryGluon.PUSH_STATE_DELAY)
        return
      }
      this.replaceState(searchParams)
    })
  }

  private replaceState(searchParams: URLSearchParams) {
    window.history.replaceState({ ...window.history.state }, '', `?${searchParams.toString()}`)
  }
}
