import { useState, useCallback } from 'react';
import { useVedikaClient } from '../provider';
import type { V2Query, MatchResult, DoshaResult } from '@vedika-io/sdk';

/**
 * Get Guna Milan (36-point Ashtakoota matching) for two charts.
 *
 * @example
 * ```tsx
 * const { data, loading, fetch } = useGunaMilan();
 * await fetch(maleBirthDetails, femaleBirthDetails);
 * // data => Record<string, any> with matching scores
 * ```
 */
export function useGunaMilan() {
  const client = useVedikaClient();
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(
    async (male: V2Query, female: V2Query): Promise<Record<string, any> | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.getGunaMilan(male, female);
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
 * Check dosha cancellation between two charts.
 *
 * @example
 * ```tsx
 * const { data, loading, fetch } = useDoshaCancellation();
 * await fetch(person1, person2);
 * // data.cancelled => true
 * ```
 */
export function useDoshaCancellation() {
  const client = useVedikaClient();
  const [data, setData] = useState<DoshaResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(
    async (person1: V2Query, person2: V2Query): Promise<DoshaResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.matrimony.doshaCancellation(person1, person2);
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
 * Get unified match analysis (combined Vedic + KP matching).
 *
 * @example
 * ```tsx
 * const { data, loading, fetch } = useUnifiedMatch();
 * await fetch(person1, person2);
 * // data.verdict => 'Excellent'
 * ```
 */
export function useUnifiedMatch() {
  const client = useVedikaClient();
  const [data, setData] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(
    async (person1: V2Query, person2: V2Query): Promise<MatchResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.matrimony.unifiedMatch(person1, person2);
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
