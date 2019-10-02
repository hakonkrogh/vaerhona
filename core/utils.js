export const isServer =
  typeof document === 'undefined' && typeof window === 'undefined';
export const isClient = !isServer;

export function getClosestSnapshot({ dateToBeCloseTo, snapshots }) {
  if (!dateToBeCloseTo || !snapshots.length) {
    return;
  }

  let closest = snapshots[0];
  for (let i = 1; i < snapshots.length; i++) {
    const s = snapshots[i];

    if (
      Math.abs(new Date(s.date) - dateToBeCloseTo) <
      Math.abs(new Date(closest.date) - dateToBeCloseTo)
    ) {
      closest = s;
    }
  }

  return closest;
}
