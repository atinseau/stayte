import { gluon } from "stayte";
import { z } from "zod";


export const countGluon = gluon('count', {
  from: 'query',
  schema: z.number(),
  defaultValue: 0
})

export const isOnlineGluon = gluon('isOnline', {
  from: 'query',
  schema: z.boolean(),
  defaultValue: false
})

export const floatGluon = gluon('float', {
  from: 'query',
  schema: z.number(),
  defaultValue: 0
})


floatGluon.subscribe((value) => {
  console.log('float', value)
})