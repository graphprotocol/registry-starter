export const makeRepeatedUnique = (array: string[]) => {
  const map: any = {}
  const count = array.map((val: string) =>
    map[val] = (typeof map[val] === 'undefined') ? 1 : map[val] + 1
  )

  return array.map((val: string, index: number) =>
    val + (map[val] != 1 ? '_' + count[index] : '')
  )
}
