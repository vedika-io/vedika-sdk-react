import { useState, useCallback } from 'react';
import { useVedikaClient } from '../provider';
import type { V2Query, HealthResult } from '@vedika-io/sdk';

/**
 * Get health vulnerability analysis from birth chart.
 *
 * Identifies vulnerable body areas, Ayurvedic constitution,
 * and recommended healing modalities.
 *
 * @example
 * ```tsx
 * const { data, loading, fetch } = useHealthVulnerabilities();
 * await fetch({ datetime: '1990-06-15T14:30:00', latitude: 28.61, longitude: 77.20 });
 * // data.vulnerableAreas => [{ area: 'Stomach', planet: 'Moon', ... }]
 * ```
 */
export function useHealthVulnerabilities() {
  const client = useVedikaClient();
  const [data, setData] = useState<HealthResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(
    async (birthDetails: V2Query): Promise<HealthResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.health.analysis(birthDetails);
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
 * Get Ayurvedic body type (dosha) from birth chart.
 *
 * Convenience hook that returns just the Ayurvedic dosha
 * from the health analysis.
 *
 * @example
 * ```tsx
 * const { data, loading, fetch } = useAyurvedicType();
 * await fetch(birthDetails);
 * // data.ayurvedicDosha => 'Vata-Pitta'
 * ```
 */
export function useAyurvedicType() {
  const client = useVedikaClient();
  const [data, setData] = useState<HealthResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(
    async (birthDetails: V2Query): Promise<HealthResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.health.analysis(birthDetails);
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
