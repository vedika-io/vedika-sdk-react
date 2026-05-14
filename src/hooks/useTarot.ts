import { useState, useCallback } from 'react';
import { useVedikaClient } from '../provider';
import type { TarotCard, TarotReading, SpreadList } from '@vedika-io/sdk';

/**
 * Draw a tarot spread with an optional question.
 *
 * @example
 * ```tsx
 * const { data, loading, draw } = useTarotReading();
 * await draw('celtic-cross', 'What does my career path look like?');
 * ```
 */
export function useTarotReading() {
  const client = useVedikaClient();
  const [data, setData] = useState<TarotReading | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const draw = useCallback(
    async (spread: string, question?: string): Promise<TarotReading | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.tarot.draw(spread, question);
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

  return { data, loading, error, draw, reset };
}

/**
 * Get the tarot card of the day.
 *
 * @example
 * ```tsx
 * const { data, loading, fetch } = useCardOfTheDay();
 * await fetch();
 * ```
 */
export function useCardOfTheDay() {
  const client = useVedikaClient();
  const [data, setData] = useState<TarotCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async (): Promise<TarotCard | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await client.tarot.cardOfTheDay();
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
 * List all available tarot spreads.
 *
 * @example
 * ```tsx
 * const { data, loading, fetch } = useTarotSpreads();
 * await fetch();
 * // data.spreads => [{ id: 'celtic-cross', name: 'Celtic Cross', ... }]
 * ```
 */
export function useTarotSpreads() {
  const client = useVedikaClient();
  const [data, setData] = useState<SpreadList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async (): Promise<SpreadList | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await client.tarot.spreads();
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
