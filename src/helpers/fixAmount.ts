const DECIMALS_LENGTH: number = 8

export default function(float: number): number {
  return Number(float.toFixed(DECIMALS_LENGTH))
}
