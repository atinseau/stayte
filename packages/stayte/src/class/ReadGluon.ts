import { isSecureHydrationGluon, isServer } from "../utils";
import { GluonSubscription } from "./Gluon";


export class ReadGluon<T> extends GluonSubscription<T> {

  public value: T | null = null
  private requestId: string | null = null
  protected unsubscribes: Array<() => void> = []

  constructor(
    private getter: () => T,
    private deps: Array<GluonSubscription<any>>
  ) {
    super()

    if (isServer()) {
      this.requestId = this.getRequestId()
    }

    this.value = this.getter()
    this.deps.forEach((dep) => {
      return dep.subscribe(() => {
        this.value = this.getter()
        this.emit(this.value)
      })
    })
  }

  private getRequestId() {
    // @ts-ignore
    const requestId = globalThis?.request?.id ?? null
    if (!requestId) {
      throw new Error('Cannot retrieve the request id, please make sure that framework is correctly patched or you are not using static rendering')
    }
    return requestId
  }

  get() {
    if (isServer()) {
      const requestId = this.getRequestId()
      if (this.requestId !== requestId) {
        this.requestId = requestId
        this.value = this.getter()
      }
    }

    return this.value
  }

  asSecureHydrationDeps() {
    return this.deps.some((dep) => isSecureHydrationGluon(dep as any))
  }

}