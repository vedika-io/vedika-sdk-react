/**
 * @vedika-io/react — React SDK for Vedika Intelligence API
 *
 * Provides hooks, context provider, and utilities for building
 * React applications with astrology, tarot, numerology, and 20+ spiritual domains.
 *
 * @packageDocumentation
 */

// Provider & client access
export { VedikaProvider, useVedikaClient } from './provider';

// Astrology hooks
export {
  useBirthChart,
  useDasha,
  useDosha,
  useYoga,
  usePanchang,
  useMuhurta,
  useTransit,
  useCompatibility,
  useHoroscope,
  usePrediction,
} from './hooks/useAstrology';

// AI query hooks
export { useAskVedika, useAskVedikaStream, useVoice } from './hooks/useQuery';

// Tarot hooks
export { useTarotReading, useCardOfTheDay, useTarotSpreads } from './hooks/useTarot';

// Chinese astrology hooks
export { useChineseZodiac, useBaZi, useFengShui } from './hooks/useChinese';

// I Ching hooks
export { useHexagram, useIChingDaily } from './hooks/useIChing';

// Numerology hooks
export { useNumerologyReport, useLifePath, useExpression } from './hooks/useNumerology';

// Matrimony hooks
export { useGunaMilan, useDoshaCancellation, useUnifiedMatch } from './hooks/useMatrimony';

// Human Design hooks
export { useBodyGraph, useHDType, useHDStrategy } from './hooks/useHumanDesign';

// Crystal hooks
export { useCrystalByZodiac, useCrystalByChakra, useCrystalCatalog } from './hooks/useCrystals';

// Spiritual hooks
export { useMantra, useDeity, usePastLife } from './hooks/useSpiritual';

// Health hooks
export { useHealthVulnerabilities, useAyurvedicType } from './hooks/useHealth';

// Career hooks
export { useSuitableCareers, useCareerTiming } from './hooks/useCareer';

// Daily hooks
export { useDailyBundle, useDailyHoroscope } from './hooks/useDaily';

// Version
export { VERSION } from './version';
