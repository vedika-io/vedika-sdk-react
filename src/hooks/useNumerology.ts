import { useState, useCallback } from 'react';
import { useVedikaClient } from '../provider';
import type { NumerologyQuery, NumerologyResponse } from '@vedika-io/sdk';

/**
 * Get a full numerology report (37 calculations) from name and birth date.
 *
 * @example
 * ```tsx
 * const { data, loading, fetch } = useNumerologyReport();
 * await fetch({ name: 'John Doe', birthDate: '1990-06-15' });
 * // data.lifePath => 4
 * ```
 */
export function useNumerologyReport() {
  const client = useVedikaClient();
  const [data, setData] = useState<NumerologyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(
    async (query: NumerologyQuery): Promise<NumerologyResponse | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.getNumerology(query);
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
 * Get the life path number from a birth date.
 *
 * @example
 * ```tsx
 * const { data, loading, fetch } = useLifePath();
 * await fetch({ name: 'John Doe', birthDate: '1990-06-15' });
 * // data.lifePath => 4
 * ```
 */
export function useLifePath() {
  const client = useVedikaClient();
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(
    async (options: {
      name?: string;
      birthDate?: string;
    }): Promise<Record<string, any> | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.getNumerologyV2('life-path', options);
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
 * Get the expression/destiny number from a name.
 *
 * @example
 * ```tsx
 * const { data, loading, fetch } = useExpression();
 * await fetch({ name: 'John Doe' });
 * ```
 */
export function useExpression() {
  const client = useVedikaClient();
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(
    async (options: {
      name?: string;
      birthDate?: string;
    }): Promise<Record<string, any> | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.getNumerologyV2('destiny', options);
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
