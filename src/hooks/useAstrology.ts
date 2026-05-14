import { useState, useCallback } from 'react';
import { useVedikaClient } from '../provider';
import type {
  BirthChartQuery,
  BirthChart,
  BirthDetails,
  DashaResponse,
  DoshaResponse,
  YogaResponse,
  CompatibilityQuery,
  CompatibilityResponse,
  MuhurthaQuery,
  MuhurthaResponse,
  V2Query,
  HoroscopeQuery,
  PredictionQuery,
} from '@vedika-io/sdk';

interface HookResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  reset: () => void;
}

function useApiCall<TArgs, TResult>() {
  const [data, setData] = useState<TResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  const execute = useCallback(async (fn: () => Promise<TResult>): Promise<TResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      setData(result);
      return result;
    } catch (e: any) {
      setError(e instanceof Error ? e : new Error(String(e)));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, reset, execute };
}

/**
 * Generate a complete Vedic birth chart (Kundali).
 *
 * @example
 * ```tsx
 * const { data, loading, error, fetch } = useBirthChart();
 * await fetch({ datetime: '1990-06-15T14:30:00', latitude: 28.61, longitude: 77.20 });
 * ```
 */
export function useBirthChart() {
  const client = useVedikaClient();
  const { data, loading, error, reset, execute } = useApiCall<BirthChartQuery, BirthChart>();

  const fetch = useCallback(
    (query: BirthChartQuery) => execute(() => client.getBirthChart(query)),
    [client, execute]
  );

  return { data, loading, error, fetch, reset };
}

/**
 * Get Vimshottari Dasha planetary periods.
 */
export function useDasha() {
  const client = useVedikaClient();
  const { data, loading, error, reset, execute } = useApiCall<BirthDetails, DashaResponse>();

  const fetch = useCallback(
    (birthDetails: BirthDetails) => execute(() => client.getDashas(birthDetails)),
    [client, execute]
  );

  return { data, loading, error, fetch, reset };
}

/**
 * Analyze doshas (Kaal Sarp, Mangal, Sade Sati, Pitra).
 */
export function useDosha() {
  const client = useVedikaClient();
  const { data, loading, error, reset, execute } = useApiCall<BirthDetails, DoshaResponse>();

  const fetch = useCallback(
    (birthDetails: BirthDetails) => execute(() => client.analyzeDoshas(birthDetails)),
    [client, execute]
  );

  return { data, loading, error, fetch, reset };
}

/**
 * Detect 300+ astrological yogas from a birth chart.
 */
export function useYoga() {
  const client = useVedikaClient();
  const { data, loading, error, reset, execute } = useApiCall<BirthDetails, YogaResponse>();

  const fetch = useCallback(
    (birthDetails: BirthDetails) => execute(() => client.detectYogas(birthDetails)),
    [client, execute]
  );

  return { data, loading, error, fetch, reset };
}

/**
 * Get Panchang (Hindu calendar) data for a date and location.
 */
export function usePanchang() {
  const client = useVedikaClient();
  const { data, loading, error, reset, execute } = useApiCall<
    Parameters<typeof client.getPanchang>[0],
    Record<string, any>
  >();

  const fetch = useCallback(
    (options?: { date?: string; latitude?: number; longitude?: number; timezone?: string }) =>
      execute(() => client.getPanchang(options)),
    [client, execute]
  );

  return { data, loading, error, fetch, reset };
}

/**
 * Find auspicious times (Muhurtha) for important events.
 */
export function useMuhurta() {
  const client = useVedikaClient();
  const { data, loading, error, reset, execute } = useApiCall<MuhurthaQuery, MuhurthaResponse>();

  const fetch = useCallback(
    (query: MuhurthaQuery) => execute(() => client.getMuhurtha(query)),
    [client, execute]
  );

  return { data, loading, error, fetch, reset };
}

/**
 * Get planetary transit data (Western astrology).
 */
export function useTransit() {
  const client = useVedikaClient();
  const { data, loading, error, reset, execute } = useApiCall<V2Query, Record<string, any>>();

  const fetch = useCallback(
    (birthDetails: V2Query, transitDateTime?: string) =>
      execute(() => client.getWesternTransits(birthDetails, transitDateTime)),
    [client, execute]
  );

  return { data, loading, error, fetch, reset };
}

/**
 * Check marriage compatibility using Ashtakoota matching.
 */
export function useCompatibility() {
  const client = useVedikaClient();
  const { data, loading, error, reset, execute } = useApiCall<
    CompatibilityQuery,
    CompatibilityResponse
  >();

  const fetch = useCallback(
    (query: CompatibilityQuery) => execute(() => client.checkCompatibility(query)),
    [client, execute]
  );

  return { data, loading, error, fetch, reset };
}

/**
 * Get horoscope for a zodiac sign (daily, weekly, monthly).
 */
export function useHoroscope() {
  const client = useVedikaClient();
  const { data, loading, error, reset, execute } = useApiCall<string, Record<string, any>>();

  const fetch = useCallback(
    (sign: string, options?: HoroscopeQuery) =>
      execute(() => client.getHoroscope(sign, options)),
    [client, execute]
  );

  return { data, loading, error, fetch, reset };
}

/**
 * Get predictions (daily, weekly, monthly, quarterly, yearly).
 */
export function usePrediction() {
  const client = useVedikaClient();
  const { data, loading, error, reset, execute } = useApiCall<string, Record<string, any>>();

  const fetch = useCallback(
    (period: string, options?: PredictionQuery) =>
      execute(() => client.getPrediction(period, options)),
    [client, execute]
  );

  return { data, loading, error, fetch, reset };
}
