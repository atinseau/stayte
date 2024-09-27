import { z, ZodError, ZodType } from "zod"
import { safeParse } from "../utils"
import { deepEqual } from "fast-equals"

export type GluonOptions<DefaultValue, Schema> = {
  schema?: Schema
  defaultValue?: Schema extends ZodType ? z.infer<Schema> : DefaultValue
}

export abstract class GluonSubscription<T> {
  protected subscribers: Set<(value: T) => void> = new Set()

  public subscribe(callback: (value: T) => void) {
    this.subscribers.add(callback)
    return () => {
      this.subscribers.delete(callback)
    }
  }

  public unsubscribe() {
    this.subscribers.clear()
  }

  protected emit(value: T) {
    this.subscribers.forEach((callback) => callback(value))
  }
}

export abstract class Gluon<T> extends GluonSubscription<T> {

  public value: T | null = null
  public error: ZodError | null = null

  private requestId: string | null = null

  constructor(
    protected name: string,
    protected options: GluonOptions<T, ZodType>
  ) {
    super()

    // This is used to avoid calling setup() on each render
    // each request is unique
    // @ts-ignore
    if (typeof window === 'undefined') {
      // @ts-ignore
      this.requestId = globalThis.request.id
    }

    this.computeSchema()
    this.applySetup()
  }

  // This method is used when there is no schema provided
  // to compute the schema accordingly to the defaultValue type
  private computeSchema() {
    if (this.options.schema) {
      return
    }

    if (typeof this.options.defaultValue === 'number') {
      this.options.schema = z.number()
    }
  }

  private applySetup() {
    this.setup?.()
    if (!this.value && !this.error && typeof this.options.defaultValue !== 'undefined') {
      this.set(this.options.defaultValue)
    }
  }

  protected parse(value: any) {
    if (this.options.schema) {
      let parsedValue = value

      // @ts-ignore
      const typeName = this.options.schema._def.typeName

      // This formatting is only needed when the incomming value is a string
      // so we need to convert it to the right type accordingly to the schema
      if (typeof value === 'string') {
        if (typeName === 'ZodObject') {
          parsedValue = safeParse(value)
        }

        if (typeName === 'ZodBoolean') {
          parsedValue = value === 'true' || value === '1'
        }

        if (typeName === 'ZodNumber') {
          parsedValue = Number(value)
        }
      }

      const output = this.options.schema.safeParse(parsedValue)
      if (output.success) {
        this.error = null
        return output.data
      }

      this.error = output.error
      return null
    }

    // If there is no schema, we treat every value as a string
    return value
  }


  // If this method return false or throw an error, the value will not be updated
  // instead of returning true, the value will be updated
  protected update(value: T, callback: () => void) {

    const oldValue = this.value

    let oldError = this.error
    let alreadHasError = this.error !== null

    if (this.options.schema) {
      this.value = this.parse(value)
    } else {
      this.value = value
    }


    // If there is no error, it's mean error was removed and we can trigger the callback
    // or the error changed, so we need to trigger the callback
    if (!this.error || !deepEqual(oldError?.errors, this.error?.errors)) {
      alreadHasError = false
    }

    // If the value is the same, we don't need to trigger the callback
    // and no need to notify the subscribers
    // only in the case where the value is valid (no error)
    // and also if there is already an error, we don't need to emit the new value (prevent unwanted re-render)
    if (
      (!this.error && deepEqual(oldValue, this.value))
      || alreadHasError
    ) return


    // Actual behavior, if a wrong value is pushed, we simple log the error
    // and every next behavior stay the same as a valid value
    // it's mean if the schema is wrong, the callback will be called and every subscribers
    // will be notified of the new value and also the related error
    this.emit(value)
    callback()
  }


  public get() {
    // When we are on the server, we need to call setup() each time
    // to hydrate the gluon with the right value
    // to prevent to many setup() calls with execute the setup only 
    // when the request is different
    if (typeof window === 'undefined') {
      // @ts-ignore
      const requestId = globalThis.request.id
      if (this.requestId !== requestId) {
        this.applySetup()
        this.requestId = requestId
      }
    }

    return this.value as T
  }

  // The setup method is called by every subclass that want
  // to set the default value depending on the behavior of the subclass
  // For example, the query gluon will watch the url to fetch the right value
  // and fill the value property accordingly
  abstract setup(...args: any[]): void
  abstract set(value: T): void
}