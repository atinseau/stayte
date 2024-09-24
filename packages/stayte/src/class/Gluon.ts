import { z, ZodBoolean, ZodNumber, ZodObject, ZodType } from "zod"
import { safeParse } from "../utils"

export type GluonOptions<T, Schema> = {
  schema?: Schema
  defaultValue?: Schema extends ZodType ? z.infer<Schema> : T
}

export abstract class Gluon<T> {

  public value: T | null = null
  protected subscribers: Array<(value: T) => void> = []

  constructor(
    protected name: string,
    protected options: GluonOptions<T, ZodType>
  ) {
    this.setup?.()
    if (!this.value && typeof this.options.defaultValue !== 'undefined') {
      this.set(this.options.defaultValue)
    }
  }

  protected parse(value: any) {
    if (this.options.schema instanceof ZodObject) {
      return this.options.schema.parse(safeParse(value))
    }

    if (this.options.schema instanceof ZodBoolean) {
      return this.options.schema.parse(value === 'true' || value === '1')
    }

    if (this.options.schema instanceof ZodNumber) {
      return this.options.schema.parse(Number(value))
    }

    if (typeof this.options.defaultValue === 'number') {
      return Number(value)
    }

    // If there is no schema, we treat every value as a string
    return value
  }

  protected update(value: T, callback: () => void) {
    if (this.options.schema) {
      this.options.schema.parse(value)
    }
    this.value = value
    this.subscribers.forEach((callback) => callback(value))
    callback()
  }

  public subscribe(callback: (value: T) => void) {
    const index = this.subscribers.push(callback)
    return () => {
      this.subscribers.splice(index - 1, 1)
    }
  }

  public unsubscribe() {
    this.subscribers = []
  }

  public get() {
    return this.value
  }

  // The setup method is called by every subclass that want
  // to set the default value depending on the behavior of the subclass
  // For example, the query gluon will watch the url to fetch the right value
  // and fill the value property accordingly
  abstract setup(): void
  abstract set(value: T): void
}