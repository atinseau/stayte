import { isServer } from "../utils"
import { Gluon, GluonSetter } from "./Gluon"

// disableSanitize is used to prevent the sanitization of the url
// it's mean if there is a html tag in the url, the behavior of convertion to a string to prevent sql injection
// will be disabled
type QueryGluonOptions = {
  disableSanitize?: boolean
}

export class QueryGluon<T> extends Gluon<T> {

  static PUSH_STATE_DELAY = 10

  clear() {
    if (isServer()) {
      return
    }

    this.value = null
    this.emit(null)

    // Remove the query string from the url
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.delete(this.name)
    window.history.replaceState({ ...window.history.state }, '', `?${searchParams.toString()}`)
  }

  // @ts-ignore
  setup(options: QueryGluonOptions) {
    this.configure(() => {
      // this workaround is needed because the hostname is not available in the globalThis
      // so to have a behavior that is working on both server and client, we need to use the
      // example.com hostname to retrieve the search
      // @ts-ignore
      const url = new URL(`http://example.com${isServer() ? globalThis?.request?.url ?? '' : window.location.search}`)
      const searchParams = new URLSearchParams(url.search)
      let value = searchParams.get(this.name) as any

      // If there is no value in the url and the gluon is alread initialized
      // it's mean the user change the value manual in the url so we need to reset the internal value of
      // the gluon by forcing the update with the default value
      if (this.value && !value && this.options?.defaultValue) {
        value = this.options.defaultValue
      }

      if (value) {
        this.value = this.parse(value)
      }
    })
  }

  set(setter: GluonSetter<T>) {
    this.update(setter, (value) => {
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
