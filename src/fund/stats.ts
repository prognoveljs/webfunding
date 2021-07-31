import { getStatsPercentageErrorPointerIsUndefined, WebfundingError } from "./errors"
import { calculateRelativeWeight } from "./relative-weight"
import { createPool } from "./set-pointer-multiple"
import { getCurrentPointerPool, getPoolWeightSum } from "./utils"

export function getPaymentPointerSharePercentage(address: string, opts?: {
  rawPool?: WMPointer[],
  calculatedPool?: WMPointer[],
  poolSum?:number
}): number {
  let pool;
  
  if (opts?.calculatedPool) pool = opts.calculatedPool
  if (!pool && opts?.rawPool) pool = opts.rawPool
  if (!pool) pool = createPool(getCurrentPointerPool())
  
  let sum = opts?.poolSum || getPoolWeightSum(pool)
  pool = calculateRelativeWeight(pool)
  const pointer = pool.find(pointer => pointer.address === address)

  if (!pointer) return 0
  if (!pointer.weight) throw WebfundingError(getStatsPercentageErrorPointerIsUndefined)
  
  
  return (pointer.weight as number) / sum
}

export function createWebfundingLeaderboard(pool: WMPointer[], opts: any): WMPointerStats[] {

}