import { useState, useCallback } from 'react';
import { useVedikaClient } from '../provider';
import type { Crystal } from '@vedika-io/sdk';

/**
 * Get crystal recommendations for a zodiac sign.
 *
 * @example
 * ```tsx
 * const { data, loading, fetch } = useCrystalByZodiac();
 * await fetch('aries');
 * // data => [{ name: 'Carnelian', chakra: 'Sacral', ... }]
 * ```
 */
export function useCrystalByZodiac() {
  const client = useVedikaClient();
  const [data, setData] = useState<Crystal[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(
    async (sign: string): Promise<Crystal[] | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.crystals.byZodiac(sign);
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
 * Get the full crystal catalog.
 *
 * @example
 * ```tsx
 * const { data, loading, fetch } = useCrystalCatalog();
 * await fetch();
 * ```
 */
export function useCrystalCatalog() {
  const client = useVedikaClient();
  const [data, setData] = useState<Crystal[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async (): Promise<Crystal[] | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await client.crystals.catalog();
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
 * Filter crystals by chakra from the full catalog.
 *
 * Fetches the catalog then filters client-side by chakra name.
 *
 * @example
 * ```tsx
 * const { data, loading, fetch } = useCrystalByChakra();
 * await fetch('Heart');
 * ```
 */
export function useCrystalByChakra() {
  const client = useVedikaClient();
  const [data, setData] = useState<Crystal[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(
    async (chakra: string): Promise<Crystal[] | null> => {
      setLoading(true);
      setError(null);
      try {
        const catalog = await client.crystals.catalog();
        const filtered = catalog.filter(
          (c) => c.chakra.toLowerCase() === chakra.toLowerCase()
        );
        setData(filtered);
        return filtered;
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
