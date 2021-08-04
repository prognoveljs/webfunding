import {
  getStatsPercentageErrorCalculatingRelativeWeight,
  getStatsPercentageErrorCalculatingWeightSum,
  getStatsPercentageErrorGettingCurrentPool,
  getStatsPercentageErrorPickingAddress,
  getStatsPercentageErrorPointerIsUndefined,
  WebfundingError,
} from "./errors";
import { calculateRelativeWeight } from "./relative-weight";
import { createPool, DEFAULT_WEIGHT } from "./set-pointer-multiple";
import { getCurrentPointerPool, getPoolWeightSum } from "./utils";

export function getPaymentPointerSharePercentage(
  address: string,
  opts?: {
    rawPool?: WMPointer[];
    calculatedPool?: WMPointer[];
    poolSum?: number;
  },
): number {
  let pool;
  let sum;

  if (opts?.calculatedPool) pool = opts.calculatedPool;
  if (!pool && opts?.rawPool) pool = opts.rawPool;
  try {
    if (!pool) pool = createPool(getCurrentPointerPool());
  } catch (error) {
    throw WebfundingError(getStatsPercentageErrorGettingCurrentPool);
  }

  try {
    sum = opts?.poolSum || getPoolWeightSum(pool);
  } catch (error) {
    throw WebfundingError(getStatsPercentageErrorCalculatingWeightSum);
  }

  try {
    pool = calculateRelativeWeight(pool);
  } catch (error) {
    throw WebfundingError(getStatsPercentageErrorCalculatingRelativeWeight);
  }

  let pointer;
  try {
    pointer = pool.find((pointer) => pointer.address === address);
  } catch (error) {
    throw WebfundingError(getStatsPercentageErrorPickingAddress);
  }

  if (!pointer) return 0;
  if (!pointer.weight) throw WebfundingError(getStatsPercentageErrorPointerIsUndefined);

  return (pointer.weight as number) / sum;
}

export function createWebfundingLeaderboard(
  pool?: WMPointer[],
  opts?: {
    ascending: boolean;
  },
): WMPointerStats[] {
  if (!pool) pool = createPool(getCurrentPointerPool());
  pool = calculateRelativeWeight(pool);
  let sum = getPoolWeightSum(pool);

  const leaderboard = pool.reduce((prev: WMPointerStats[], cur: WMPointer): WMPointerStats[] => {
    prev.push({
      address: cur.address,
      chance: ((cur.weight as number) || DEFAULT_WEIGHT) / sum,
    });
    return prev;
  }, [] as WMPointerStats[]);

  return opts?.ascending
    ? leaderboard.sort((a: WMPointerStats, b: WMPointerStats) => {
        return a.chance - b.chance;
      })
    : leaderboard.sort((a: WMPointerStats, b: WMPointerStats) => {
        return b.chance - a.chance;
      });
}
