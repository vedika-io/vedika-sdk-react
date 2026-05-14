import { useState, useCallback } from 'react';
import { useVedikaClient } from '../provider';
import type { V2Query, MantraResult, DeityResult, PastLifeResult } from '@vedika-io/sdk';

/**
 * Get a personalized mantra recommendation based on birth chart.
 *
 * @example
 * ```tsx
 * const { data, loading, fetch } = useMantra();
 * await fetch({ datetime: '1990-06-15T14:30:00', latitude: 28.61, longitude: 77.20 });
 * // data.mantra => 'Om Namah Shivaya'
 * ```
 */
export function useMantra() {
  const client = useVedikaClient();
  const [data, setData] = useState<MantraResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(
    async (birthDetails: V2Query): Promise<MantraResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.spiritual.mantra(birthDetails);
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
 * Get recommended deity for worship based on birth chart.
 *
 * @example
 * ```tsx
 * const { data, loading, fetch } = useDeity();
 * await fetch(birthDetails);
 * // data.deity => 'Lord Shiva', data.auspiciousDay => 'Monday'
 * ```
 */
export function useDeity() {
  const client = useVedikaClient();
  const [data, setData] = useState<DeityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(
    async (birthDetails: V2Query): Promise<DeityResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.spiritual.deity(birthDetails);
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
 * Get past life karmic indicators from birth chart.
 *
 * @example
 * ```tsx
 * const { data, loading, fetch } = usePastLife();
 * await fetch(birthDetails);
 * // data.karmicDebts => ['7th house Saturn...']
 * ```
 */
export function usePastLife() {
  const client = useVedikaClient();
  const [data, setData] = useState<PastLifeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(
    async (birthDetails: V2Query): Promise<PastLifeResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.spiritual.pastLife(birthDetails);
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
