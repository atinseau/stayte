import { gluon, computed } from "stayte";
import { z } from "zod";

// export const countGluon2 = gluon('count', {
//   from: 'local',
//   defaultValue: 20
// })

// export const userGluon = gluon('user', {
//   from: 'local',
//   defaultValue: {
//     name: 'John Doe',
//     age: 30
//   }
// })

// userGluon.set({
//   name: 'John Doe',
//   age: 20
// })

export const countGluon = gluon('count', {
  from: 'query',
  schema: z.number(),
  // defaultValue: 0
})

export const isOnlineGluon = gluon('isOnline', {
  from: 'local',
  schema: z.boolean(),
  defaultValue: false
})

export const floatGluon = gluon('float', {
  from: 'local',
  schema: z.number(),
  defaultValue: 0,
})

export const doubleGluon = computed(() => floatGluon.get() * 2, [
  floatGluon
])

export const isOnlineMessage = computed(() => {
  return isOnlineGluon.get() ? 'You are online' : 'You are offline'
}, [
  isOnlineGluon
])