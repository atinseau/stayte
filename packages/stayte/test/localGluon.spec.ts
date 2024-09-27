import { beforeEach, describe, expect, it } from "bun:test"
import { gluon } from "../src"

describe('LocalGluon', () => {

  beforeEach(() => {

    const mockedLocalStorage = {}

    // @ts-ignore
    globalThis.window = {}

    // @ts-ignore
    globalThis.localStorage = {
      getItem: (key: string) => {
        // @ts-ignore
        return mockedLocalStorage[key] ?? null
      },
      setItem: (key: string, value: string) => {
        // @ts-ignore
        mockedLocalStorage[key] = value
      }
    }

  })

  it('Should be able to set default value at initialization in the local storage', () => {


    const nameGluon = gluon('name', {
      from: 'local',
      defaultValue: 'John Doe'
    })

    expect(nameGluon.get()).toBe('John Doe')
    expect(localStorage.getItem('name')).toBe('John Doe')
  })

  it('Should be no local storage when no default value is provided', () => {
    const nameGluon = gluon('name', {
      from: 'local'
    })
    expect(nameGluon.get()).toBe(null)
    expect(localStorage.getItem('name')).toBe(null)
  })

  it('Should be able to update the value and the local storage should be updated', () => {
    const nameGluon = gluon('name', {
      from: 'local',
    })
    expect(nameGluon.get()).toBe(null)
    expect(localStorage.getItem('name')).toBe(null)
    nameGluon.set('John Doe')
    expect(nameGluon.get()).toBe('John Doe')
    expect(localStorage.getItem('name')).toBe('John Doe')
  })

})