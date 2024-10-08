import { isServer } from "../utils";
import { Gluon, GluonSetter } from "./Gluon";
import { parse, serialize, CookieSerializeOptions } from 'cookie-es'

export class CookieGluon<T> extends Gluon<T> {

  clear() {
    if (isServer()) {
      return
    }

    // Bypass schema validation because the value is not valid
    this.value = null
    this.emit(null)
    window.document.cookie = `${this.name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;`
  }

  setup(options: CookieSerializeOptions): void {

    // @ts-ignore
    this['cookiesOptions'] = options;

    this.configure(() => {
      // @ts-ignore
      const cookies: string = isServer() ? globalThis?.__incrementalCache?.requestHeaders?.cookie ?? '' : window.document.cookie
      const parsedCookies = parse(cookies)
      let value = parsedCookies[this.name]

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

  set(setter: GluonSetter<T>): void {
    this.update(setter, (value) => {
      if (isServer()) {
        return
      }

      const newCookie = serialize(
        this.name,
        typeof value === 'object' ? JSON.stringify(value) : value as any,
        // @ts-ignore
        this['cookiesOptions'] ?? {}
      )
      window.document.cookie = newCookie
    })
  }

}