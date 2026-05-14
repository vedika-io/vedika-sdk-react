import { useState, useCallback } from 'react';
import { useVedikaClient } from '../provider';
import type { ChineseZodiac, BaZiChart, KuaResult, V2Query } from '@vedika-io/sdk';

/**
 * Get the Chinese zodiac animal and traits for a given year.
 *
 * @example
 * ```tsx
 * const { data, loading, fetch } = useChineseZodiac();
 * await fetch(1990); // => { animal: 'Horse', polarity: 'yang', ... }
 * ```
 */
export function useChineseZodiac() {
  const client = useVedikaClient();
  const [data, setData] = useState<ChineseZodiac | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(
    async (year: number): Promise<ChineseZodiac | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.chinese.zodiacAnimal(year);
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
 * Get a BaZi (Four Pillars of Destiny) chart.
 *
 * @example
 * ```tsx
 * const { data, loading, fetch } = useBaZi();
 * await fetch({ datetime: '1990-06-15T14:30:00', latitude: 28.61, longitude: 77.20 });
 * ```
 */
export function useBaZi() {
  const client = useVedikaClient();
  const [data, setData] = useState<BaZiChart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(
    async (birthDetails: V2Query): Promise<BaZiChart | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.chinese.bazi(birthDetails);
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
 * Calculate a personal Feng Shui Kua number and auspicious directions.
 *
 * @example
 * ```tsx
 * const { data, loading, fetch } = useFengShui();
 * await fetch(1990, 'male');
 * // data.kuaNumber => 1, data.group => 'east'
 * ```
 */
export function useFengShui() {
  const client = useVedikaClient();
  const [data, setData] = useState<KuaResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(
    async (birthYear: number, gender: string): Promise<KuaResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.chinese.fengShui.kuaNumber(birthYear, gender);
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
