


export const safeParse = (value: any) => {
  try {
    return JSON.parse(value)
  } catch (error) {
    console.error(error)
    return value
  }
}