import { useState, useCallback } from 'react';
import { useVedikaClient } from '../provider';
import type { Hexagram } from '@vedika-io/sdk';

/**
 * Cast an I Ching hexagram with an optional question.
 *
 * @example
 * ```tsx
 * const { data, loading, cast } = useHexagram();
 * await cast('Should I change careers?');
 * // data.number => 42, data.englishName => 'Increase'
 * ```
 */
export function useHexagram() {
  const client = useVedikaClient();
  const [data, setData] = useState<Hexagram | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cast = useCallback(
    async (question?: string): Promise<Hexagram | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.iching.cast(question);
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

  return { data, loading, error, cast, reset };
}

/**
 * Get the daily I Ching hexagram.
 *
 * @example
 * ```tsx
 * const { data, loading, fetch } = useIChingDaily();
 * await fetch();
 * ```
 */
export function useIChingDaily() {
  const client = useVedikaClient();
  const [data, setData] = useState<Hexagram | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async (): Promise<Hexagram | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await client.iching.daily();
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
