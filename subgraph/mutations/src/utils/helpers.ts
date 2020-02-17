import base from 'base-x'

//////////////////////////
///// Basic Helpers //////
//////////////////////////

export const stripHexPrefix = (str: string) => {
  if (str.startsWith('0x')) {
    return str.slice(2)
  }
  return str
}

export const leftPad = (data: string, size = 64) => {
  if (data.length === size) return data
  return '0'.repeat(size - data.length) + data
}

// convert ipfsHash to Hex string
export const ipfsHexHash = (ipfsHash: string) => {
  const base58 = base('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz')
  return (
    '0x' +
    base58
      .decode(ipfsHash)
      .slice(2)
      .toString('hex')
  )
}

export const stringToBytes32 = str => {
  const buffstr = Buffer.from(str).toString('hex')
  return buffstr + '0'.repeat(64 - buffstr.length)
}
