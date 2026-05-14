# @vedika-io/react

React SDK for the [Vedika Intelligence API](https://vedika.io) -- hooks, provider, and utilities for astrology, tarot, numerology, and 20+ spiritual domains.

## Installation

```bash
npm install @vedika-io/react @vedika-io/sdk
```

## Quick Start

Wrap your app with `VedikaProvider` and use hooks anywhere inside:

```tsx
import { VedikaProvider, useAskVedika, useBirthChart } from '@vedika-io/react';

function App() {
  return (
    <VedikaProvider apiKey="vk_live_...">
      <AstrologyChat />
    </VedikaProvider>
  );
}

function AstrologyChat() {
  const { data, loading, error, ask } = useAskVedika();

  const handleAsk = () => {
    ask({
      question: 'What are my career prospects this year?',
      birthDetails: {
        datetime: '1990-06-15T14:30:00+05:30',
        latitude: 28.6139,
        longitude: 77.2090,
        timezone: '+05:30',
      },
    });
  };

  return (
    <div>
      <button onClick={handleAsk} disabled={loading}>
        Ask Vedika
      </button>
      {loading && <p>Thinking...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && <p>{data.answer}</p>}
    </div>
  );
}
```

## Provider Options

```tsx
<VedikaProvider
  apiKey="vk_live_..."       // Required -- your API key
  baseUrl="https://api.vedika.io"  // Optional -- custom base URL
  language="en"              // Optional -- default response language
  timeout={60000}            // Optional -- request timeout in ms
>
  {children}
</VedikaProvider>
```

## Available Hooks

Every hook returns `{ data, loading, error, fetch/ask/draw/cast/send, reset }`.

### AI Query

| Hook | Description |
|------|-------------|
| `useAskVedika()` | Natural language astrology question |
| `useAskVedikaStream()` | Streaming response (real-time chunks) |
| `useVoice()` | Voice query (audio in, audio/text out) |

### Vedic Astrology

| Hook | Description |
|------|-------------|
| `useBirthChart()` | Generate a complete birth chart (Kundali) |
| `useDasha()` | Vimshottari Dasha planetary periods |
| `useDosha()` | Dosha analysis (Kaal Sarp, Mangal, Sade Sati) |
| `useYoga()` | Detect 300+ astrological yogas |
| `usePanchang()` | Hindu calendar data for any date |
| `useMuhurta()` | Find auspicious times for events |
| `useTransit()` | Planetary transit analysis |
| `useCompatibility()` | Ashtakoota marriage compatibility |
| `useHoroscope()` | Daily/weekly/monthly horoscope |
| `usePrediction()` | Predictions (daily to yearly) |

### Tarot

| Hook | Description |
|------|-------------|
| `useTarotReading()` | Draw a tarot spread |
| `useCardOfTheDay()` | Daily tarot card |
| `useTarotSpreads()` | List available spreads |

### Chinese Astrology

| Hook | Description |
|------|-------------|
| `useChineseZodiac()` | Chinese zodiac animal by year |
| `useBaZi()` | Four Pillars of Destiny chart |
| `useFengShui()` | Kua number and directions |

### I Ching

| Hook | Description |
|------|-------------|
| `useHexagram()` | Cast a hexagram with question |
| `useIChingDaily()` | Daily hexagram |

### Numerology

| Hook | Description |
|------|-------------|
| `useNumerologyReport()` | Full 37-calculation report |
| `useLifePath()` | Life path number |
| `useExpression()` | Expression/destiny number |

### Matrimony

| Hook | Description |
|------|-------------|
| `useGunaMilan()` | 36-point Ashtakoota matching |
| `useDoshaCancellation()` | Dosha cancellation check |
| `useUnifiedMatch()` | Combined Vedic + KP matching |

### Human Design

| Hook | Description |
|------|-------------|
| `useBodyGraph()` | Full body graph chart |
| `useHDType()` | Type, strategy, and authority |
| `useHDStrategy()` | Alias for useHDType |

### Crystals

| Hook | Description |
|------|-------------|
| `useCrystalByZodiac()` | Crystals for a zodiac sign |
| `useCrystalByChakra()` | Crystals for a chakra |
| `useCrystalCatalog()` | Full crystal catalog |

### Spiritual

| Hook | Description |
|------|-------------|
| `useMantra()` | Personalized mantra recommendation |
| `useDeity()` | Recommended deity for worship |
| `usePastLife()` | Past life karmic indicators |

### Health

| Hook | Description |
|------|-------------|
| `useHealthVulnerabilities()` | Health analysis from chart |
| `useAyurvedicType()` | Ayurvedic constitution type |

### Career

| Hook | Description |
|------|-------------|
| `useSuitableCareers()` | Best career fields from chart |
| `useCareerTiming()` | Auspicious periods for career moves |

### Daily

| Hook | Description |
|------|-------------|
| `useDailyBundle()` | All-in-one daily insights |
| `useDailyHoroscope()` | Daily horoscope by sign |

## Accessing the Client Directly

For advanced use cases, access the underlying `VedikaClient`:

```tsx
import { useVedikaClient } from '@vedika-io/react';

function Advanced() {
  const client = useVedikaClient();
  // Use any method from @vedika-io/sdk directly
  const result = await client.getNavamsa(birthDetails);
}
```

## Streaming Example

```tsx
import { useAskVedikaStream } from '@vedika-io/react';

function StreamingChat() {
  const { data, loading, stream, abort } = useAskVedikaStream();

  return (
    <div>
      <button onClick={() => stream({ question: '...', birthDetails: { ... } })}>
        Stream Response
      </button>
      <button onClick={abort}>Stop</button>
      <div>{data}</div>
    </div>
  );
}
```

## Error Handling

All hooks catch errors automatically. Errors from the API are typed:

```tsx
import { useAskVedika } from '@vedika-io/react';

function MyComponent() {
  const { error } = useAskVedika();

  if (error) {
    // error.message contains the API error description
    // Check error type: AuthenticationError, RateLimitError,
    // InsufficientCreditsError, ValidationError, etc.
  }
}
```

## TypeScript

Full TypeScript support. All types are re-exported from `@vedika-io/sdk`:

```tsx
import type { BirthDetails, QuestionResponse, TarotReading } from '@vedika-io/sdk';
```

## Links

- [API Documentation](https://vedika.io/docs)
- [Dashboard](https://vedika.io/dashboard.html)
- [JavaScript SDK](https://www.npmjs.com/package/@vedika-io/sdk)
- [API Status](https://vedika.io/status)

## License

MIT
