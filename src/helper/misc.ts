export const stringListToMap = (
  str: string,
  listSep = '|',
  kvSep = ':',
): Map<string, string> => {
  const list = str.split(listSep)
  return list.reduce((agg: Map<string, string>, val: string) => {
    const kv = val.split(kvSep)
    agg.set(kv[0], kv[1])
    return agg
  }, new Map<string, string>())
}
