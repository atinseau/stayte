import { afterAll, beforeEach, describe, expect, it } from "bun:test";
import { computed, gluon } from "../src";
import { sleep } from "bun";
import { QueryGluon } from "../src/class/QueryGluon"
import { z, ZodError, ZodNumber } from "zod";

describe('QueryGluon (client)', () => {

  beforeEach(() => {
    // mock the window.location.search
    // @ts-ignore
    globalThis.window = {
      // @ts-ignore
      location: {
        search: ''
      },
      // @ts-ignore
      history: {
        replaceState: (a, b, query) => {
          // @ts-ignore
          window.location.search = query
        }
      }
    }
  })

  afterAll(() => {
    // @ts-ignore
    delete globalThis.window
  })

  it('Should be able to set default value at initialization in the query', async () => {
    const nameGluon = gluon('name', {
      from: 'query',
      defaultValue: 'John Doe'
    })
    expect(nameGluon.get()).toBe('John Doe')

    // Because it's the first time we set the value in the query, the gluon will wait a little bit
    // before pushing the new value to the query due to the safe set behavior (prevent hmr to trigger an url update)
    await sleep(QueryGluon.PUSH_STATE_DELAY)

    expect(new URLSearchParams(window.location.search).get('name')).toBe('John Doe')
  })

  it('Should be no query when no default value is provided', () => {
    const nameGluon = gluon('name', {
      from: 'query'
    })
    expect(nameGluon.get()).toBe(null)
    expect(new URLSearchParams(window.location.search).get('name')).toBe(null)
  })

  it('Should be able to update the value and the query should be updated', async () => {


    const nameGluon = gluon('name', {
      from: 'query',
    })

    expect(nameGluon.get()).toBe(null)
    expect(new URLSearchParams(window.location.search).get('name')).toBe(null)

    nameGluon.set('John Doe')
    expect(nameGluon.get()).toBe('John Doe')

    // Delayed behavior
    await sleep(QueryGluon.PUSH_STATE_DELAY)

    expect(new URLSearchParams(window.location.search).get('name')).toBe('John Doe')
  })

  it('Should be able to subscribe to change when gluon is updated', () => {
    const nameGluon = gluon('name', {
      from: 'query',
    })

    let count = 0
    const unsubscribe = nameGluon.subscribe(() => {
      count++
    })

    expect(count).toBe(0)
    nameGluon.set('John Doe')
    expect(count).toBe(1)
    unsubscribe()
    nameGluon.set('John Doe')
    expect(count).toBe(1)
  })

  it('Should be able to compute a new value from other gluon and watch dependencies', () => {

    const countGluon = gluon('count', {
      from: 'query',
      defaultValue: 2
    })

    const doubleGluon = computed(() => countGluon.get() * 2, [countGluon])
    const unwatchedDoubleGluon = computed(() => countGluon.get() * 2, [])

    expect(doubleGluon.get()).toBe(4)
    expect(unwatchedDoubleGluon.get()).toBe(4)

    countGluon.set(3)

    expect(doubleGluon.get()).toBe(6)
    expect(unwatchedDoubleGluon.get()).toBe(4) // Should not be updated
  })

  it('Should be able to subscribe to change when a computed value is updated', () => {
    const countGluon = gluon('count', {
      from: 'query',
      defaultValue: 2
    })

    const doubleGluon = computed(() => countGluon.get() * 2, [countGluon])

    let count = 0
    const unsubscribe = doubleGluon.subscribe(() => {
      count++
    })

    expect(count).toBe(0)
    expect(doubleGluon.get()).toBe(4)

    countGluon.set(3)

    expect(doubleGluon.get()).toBe(6)
    expect(count).toBe(1)

    unsubscribe()
    countGluon.set(3)

    expect(doubleGluon.get()).toBe(6)
    expect(count).toBe(1)
  })

  it('Should not trigger an update if the value is setted to the same value', () => {
    const countGluon = gluon('count', {
      from: 'query',
      defaultValue: 2
    })

    let count = 0 

    const unsubscribe = countGluon.subscribe(() => {
      count++
    })

    expect(count).toBe(0)
    countGluon.set(4)
    expect(count).toBe(1)
    countGluon.set(4)
    expect(count).toBe(1)
  
    countGluon.set(2)
    expect(count).toBe(2)
    countGluon.set(2)
    expect(count).toBe(2)

    unsubscribe()
  })

})

describe('QueryGluon (server)', () => {

  beforeEach(() => {
    // @ts-ignore
    delete globalThis.request
  })

  it('Should be able to retrieve the value from the query on the server', () => {

    // Simulate the server next patch
    // @ts-ignore
    globalThis.request = {
      url: '?name=John Doe',
      id: '1'
    }

    const nameGluon = gluon('name', {
      from: 'query',
    })

    expect(nameGluon.get()).toBe('John Doe')
  })


  it('Should be able to set gluon on error if the query don\'t match the schema', () => {
    // Simulate the server next patch
    // @ts-ignore
    globalThis.request = {
      url: '?count=qsdmlqsmdl', // <--- expecting a number but got a string
      id: '1'
    }

    const countGluon = gluon('count', {
      from: 'query',
      schema: z.number() // <--- expecting a number
    })

    expect(countGluon.get()).toBeNull()
    expect(countGluon.error).toBeInstanceOf(ZodError)
  })

  it('Should be able to detect the schema depending on the default value type', () => {

    // Simulate the server next patch
    // @ts-ignore
    globalThis.request = {
      id: '1'
    }

    const countGluon = gluon('count', {
      from: 'query',
      defaultValue: 10
    })

    expect(countGluon['options']['schema']).toBeInstanceOf(ZodNumber)
    expect(countGluon.get()).toBe(10)
  })

  it('Should be able to update externally the value if the query is updated (global gluon and url reload)', () => {

    // Simulate the server next patch
    // @ts-ignore
    globalThis.request = {
      url: '?count=10',
      id: '1'
    }

    const countGluon = gluon('count', {
      from: 'query',
      schema: z.number()
    })

    expect(countGluon.get()).toBe(10)

    // Simulate the url reload with non id request update (no patch)
    // @ts-ignore
    globalThis.request = {
      url: '?count=20',
      id: '1' // <--- keep the same id, auto update should not be triggered
    }

    expect(countGluon.get()).toBe(10)

    // Simulate the url reload with new id request (patch)
    // @ts-ignore
    globalThis.request = {
      url: '?count=20',
      id: '2'
    }

    expect(countGluon.get()).toBe(20)
  })


  it('Should be able to remove an error if the query is updated and the value is valid', () => {


    // Simulate the server next patch
    // @ts-ignore
    globalThis.request = {
      url: '?count=10',
      id: '1'
    }

    const countGluon = gluon('count', {
      from: 'query',
      schema: z.number()
    })

    expect(countGluon.get()).toBe(10) // <--- valid value, no error
    expect(countGluon.error).toBeNull()

    // Simulate the url reload with new id request (patch) and wrong value
    // @ts-ignore
    globalThis.request = {
      url: '?count=qsdmlqsmdl', // <--- expecting a number but got a string
      id: '2'
    }

    expect(countGluon.get()).toBeNull() // <--- invalid value, error
    expect(countGluon.error).toBeInstanceOf(ZodError)
  })
})