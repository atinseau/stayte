import { isServer } from "../utils"
import { Gluon } from "./Gluon"

// disableSanitize is used to prevent the sanitization of the url
// it's mean if there is a html tag in the url, the behavior of convertion to a string to prevent sql injection
// will be disabled
type QueryGluonOptions = {
  disableSanitize?: boolean
}

export class QueryGluon<T> extends Gluon<T> {

  static PUSH_STATE_DELAY = 10

  // @ts-ignore
  setup(options: QueryGluonOptions) {
    // this workaround is needed because the hostname is not available in the globalThis
    // so to have a behavior that is working on both server and client, we need to use the
    // example.com hostname to retrieve the search
    // @ts-ignore
    const url = new URL(`http://example.com${typeof window === 'undefined' ? globalThis?.request?.url ?? '' : window.location.search}`)
    const searchParams = new URLSearchParams(url.search)
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
