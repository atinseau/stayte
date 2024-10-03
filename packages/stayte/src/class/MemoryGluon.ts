import { Gluon } from "./Gluon";



export class MemoryGluon<T> extends Gluon<T> {
  setup() {
    this.configure()
  }
  set(value: T) {
    this.update(value)
  }
}

