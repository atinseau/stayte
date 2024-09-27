import { GluonSubscription } from "./Gluon";


export class ReadGluon<T> extends GluonSubscription<T> {

  public value: T | null = null
  protected unsubscribes: Array<() => void> = []

  constructor(
    private getter: () => T,
    private deps: Array<GluonSubscription<any>>
  ) {
    super()
    this.value = this.getter()
    this.deps.forEach((dep) => {
      return dep.subscribe(() => {
        this.value = this.getter()
        this.emit(this.value)
      })
    })
  }

  get() {
    return this.value
  }

}