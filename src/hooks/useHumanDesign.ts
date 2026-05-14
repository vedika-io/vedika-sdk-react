import { useState, useCallback } from 'react';
import { useVedikaClient } from '../provider';
import type { V2Query, BodyGraph, HDType } from '@vedika-io/sdk';

/**
 * Get a full Human Design body graph chart.
 *
 * @example
 * ```tsx
 * const { data, loading, fetch } = useBodyGraph();
 * await fetch({ datetime: '1990-06-15T14:30:00', latitude: 28.61, longitude: 77.20 });
 * // data.type => 'Generator', data.authority => 'Sacral'
 * ```
 */
export function useBodyGraph() {
  const client = useVedikaClient();
  const [data, setData] = useState<BodyGraph | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(
    async (birthDetails: V2Query): Promise<BodyGraph | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.humanDesign.chart(birthDetails);
        setData(result);
        return result;
      } catch (e: any) {
        setError(e instanceof Error ? e : new Error(String(e)));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, fetch, reset };
}

/**
 * Get the Human Design type summary (type, strategy, authority).
 *
 * @example
 * ```tsx
 * const { data, loading, fetch } = useHDType();
 * await fetch(birthDetails);
 * // data.type => 'Manifestor', data.strategy => 'Inform'
 * ```
 */
export function useHDType() {
  const client = useVedikaClient();
  const [data, setData] = useState<HDType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(
    async (birthDetails: V2Query): Promise<HDType | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.humanDesign.type(birthDetails);
        setData(result);
        return result;
      } catch (e: any) {
        setError(e instanceof Error ? e : new Error(String(e)));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, fetch, reset };
}

/**
 * Convenience hook combining type + strategy + authority in one call.
 * Alias for useHDType with a friendlier name.
 */
export const useHDStrategy = useHDType;
