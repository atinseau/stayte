import { Gluon } from "./class/Gluon"

export const isSecureHydrationGluon = (gluon: Gluon<any>) => {
  if (!gluon.isSSR()) {
    return false
  }

  // @ts-ignore
  return gluon.constructor.SECURE_HYDRATION
}


export const safeParse = (value: any) => {
  try {
    return JSON.parse(value)
  } catch (error) {
    console.error(error)
    return value
  }
}

export const isServer = () => {
  return typeof window === 'undefined'
}