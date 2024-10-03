import { Gluon, GluonSetter } from "./Gluon";



export class MemoryGluon<T> extends Gluon<T> {
  setup() {
    this.configure()
  }
  set(setter: GluonSetter<T>) {
    this.update(setter)
  }
}

