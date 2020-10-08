import { useEffect } from 'react';
import { useQuery } from 'urql';

export const isServer =
  typeof document === 'undefined' && typeof window === 'undefined';
export const isClient = !isServer;

export function hoursBetweenDates(a, b) {
  return Math.abs(a - b) / 60 / 60 / 1000;
}

export function getClosestSnapshot({ dateToBeCloseTo, snapshots }) {
  if (!dateToBeCloseTo || !snapshots.length) {
    return;
  }

  const date =
    typeof dateToBeCloseTo === 'string'
      ? new Date(dateToBeCloseTo)
      : dateToBeCloseTo;

  let closest = snapshots[0];
  let index = -1;
  for (let i = 1; i < snapshots.length; i++) {
    const s = snapshots[i];

    if (
      Math.abs(new Date(s.date) - date) <
      Math.abs(new Date(closest.date) - date)
    ) {
      closest = s;
      index = i;
    }
  }

  return {
    snapshot: closest,
    index,
  };
}

export function useRefreshQuery(args) {
  const [{ reexecuteQuery, ...rest } = {}] = useQuery(args);

  useEffect(() => {
    if (!args.paused && reexecuteQuery) {
      const interval = setInterval(() => {
        reexecuteQuery({ requestPolicy: 'network-only' });
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [args, reexecuteQuery]);

  return [{ reexecuteQuery, ...rest }];
}
