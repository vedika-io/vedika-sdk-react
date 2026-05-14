import { useState, useCallback } from 'react';
import { useVedikaClient } from '../provider';
import type { DailyBundle } from '@vedika-io/sdk';

/**
 * Get the comprehensive daily bundle (horoscope + panchang + tarot + mantra + crystal).
 *
 * @example
 * ```tsx
 * const { data, loading, fetch } = useDailyBundle();
 * await fetch();
 * // data.horoscope.prediction => 'Today is a good day...'
 * // data.tarotCard?.name => 'The Star'
 * ```
 */
export function useDailyBundle() {
  const client = useVedikaClient();
  const [data, setData] = useState<DailyBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async (): Promise<DailyBundle | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await client.daily.bundle();
      setData(result);
      return result;
    } catch (e: any) {
      setError(e instanceof Error ? e : new Error(String(e)));
      return null;
    } finally {
      setLoading(false);
    }
  }, [client]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, fetch, reset };
}

/**
 * Get the daily horoscope for a zodiac sign.
 *
 * @example
 * ```tsx
 * const { data, loading, fetch } = useDailyHoroscope();
 * await fetch('aries');
 * ```
 */
export function useDailyHoroscope() {
  const client = useVedikaClient();
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(
    async (sign: string): Promise<Record<string, any> | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.daily.horoscope(sign);
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
