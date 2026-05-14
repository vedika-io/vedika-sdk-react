import { useState, useCallback, useRef } from 'react';
import { useVedikaClient } from '../provider';
import type {
  QuestionQuery,
  EnhancedQuestionQuery,
  QuestionResponse,
  VoiceQuery,
  VoiceResult,
} from '@vedika-io/sdk';

/**
 * Ask Vedika Intelligence a natural language astrology question.
 *
 * Supports both standard and enhanced queries with multi-turn
 * conversations, system selection, and structured responses.
 *
 * @example
 * ```tsx
 * const { data, loading, error, ask } = useAskVedika();
 *
 * await ask({
 *   question: 'What are my career prospects this year?',
 *   birthDetails: {
 *     datetime: '1990-06-15T14:30:00+05:30',
 *     latitude: 28.6139,
 *     longitude: 77.2090,
 *     timezone: '+05:30',
 *   },
 * });
 * ```
 */
export function useAskVedika() {
  const client = useVedikaClient();
  const [data, setData] = useState<QuestionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const ask = useCallback(
    async (query: QuestionQuery | EnhancedQuestionQuery): Promise<QuestionResponse | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.askQuestion(query);
        setData(result);
        return result;
      } catch (e: any) {
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
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

  return { data, loading, error, ask, reset };
}

/**
 * Stream a Vedika Intelligence response in real-time.
 *
 * Provides a `stream` function that yields text chunks as they arrive,
 * accumulating the full response in `data`.
 *
 * @example
 * ```tsx
 * const { data, loading, stream } = useAskVedikaStream();
 *
 * await stream({
 *   question: 'Tell me about my Vimshottari Dasha periods.',
 *   birthDetails: { ... },
 * });
 * // data updates progressively as chunks arrive
 * ```
 */
export function useAskVedikaStream() {
  const client = useVedikaClient();
  const [data, setData] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef(false);

  const stream = useCallback(
    async (query: QuestionQuery): Promise<string | null> => {
      setLoading(true);
      setError(null);
      setData('');
      abortRef.current = false;

      try {
        let accumulated = '';
        for await (const chunk of client.askQuestionStream(query)) {
          if (abortRef.current) break;
          accumulated += chunk;
          setData(accumulated);
        }
        return accumulated;
      } catch (e: any) {
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const abort = useCallback(() => {
    abortRef.current = true;
  }, []);

  const reset = useCallback(() => {
    setData('');
    setError(null);
  }, []);

  return { data, loading, error, stream, abort, reset };
}

/**
 * Send a voice query (audio input) to Vedika Intelligence.
 *
 * Returns either binary audio (TTS succeeded) or a JSON text fallback.
 *
 * @example
 * ```tsx
 * const { data, loading, send } = useVoice();
 *
 * const audioBlob = new Blob([buffer], { type: 'audio/wav' });
 * const result = await send({
 *   audio: audioBlob,
 *   birthDetails: { ... },
 * });
 * if (result?.kind === 'binary') playAudio(result.audio);
 * ```
 */
export function useVoice() {
  const client = useVedikaClient();
  const [data, setData] = useState<VoiceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const send = useCallback(
    async (query: VoiceQuery): Promise<VoiceResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.askVoice(query);
        setData(result);
        return result;
      } catch (e: any) {
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
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

  return { data, loading, error, send, reset };
}
