import { useState, useCallback } from 'react';
import { useVedikaClient } from '../provider';
import type { V2Query, CareerResult } from '@vedika-io/sdk';

/**
 * Get suitable career fields based on birth chart.
 *
 * Analyzes the 10th house, career yogas, and current transits
 * to suggest career paths and timing.
 *
 * @example
 * ```tsx
 * const { data, loading, fetch } = useSuitableCareers();
 * await fetch({ datetime: '1990-06-15T14:30:00', latitude: 28.61, longitude: 77.20 });
 * // data.suitableFields => ['Technology', 'Finance']
 * ```
 */
export function useSuitableCareers() {
  const client = useVedikaClient();
  const [data, setData] = useState<CareerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(
    async (birthDetails: V2Query): Promise<CareerResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.career.analysis(birthDetails);
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
 * Get career timing analysis (auspicious periods for career moves).
 *
 * @example
 * ```tsx
 * const { data, loading, fetch } = useCareerTiming();
 * await fetch(birthDetails);
 * // data.auspiciousPeriods => [{ period: 'Jul 2026 - Sep 2026', ... }]
 * ```
 */
export function useCareerTiming() {
  const client = useVedikaClient();
  const [data, setData] = useState<CareerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(
    async (birthDetails: V2Query): Promise<CareerResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.career.analysis(birthDetails);
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
