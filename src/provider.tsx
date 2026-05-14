import React, { createContext, useContext, useMemo } from 'react';
import { VedikaClient } from '@vedika-io/sdk';

interface VedikaContextValue {
  client: VedikaClient;
}

const VedikaContext = createContext<VedikaContextValue | null>(null);

interface VedikaProviderProps {
  /** Your Vedika API key (vk_live_* or vk_ent_*) */
  apiKey: string;
  /** API base URL (defaults to https://api.vedika.io) */
  baseUrl?: string;
  /** Default language for responses (defaults to 'en') */
  language?: string;
  /** Request timeout in milliseconds (defaults to 60000) */
  timeout?: number;
  children: React.ReactNode;
}

/**
 * Provides a VedikaClient instance to all descendant components.
 *
 * @example
 * ```tsx
 * import { VedikaProvider } from '@vedika-io/react';
 *
 * function App() {
 *   return (
 *     <VedikaProvider apiKey="vk_live_...">
 *       <YourApp />
 *     </VedikaProvider>
 *   );
 * }
 * ```
 */
export function VedikaProvider({ apiKey, baseUrl, language, timeout, children }: VedikaProviderProps) {
  const client = useMemo(
    () => new VedikaClient({ apiKey, baseUrl, language, timeout }),
    [apiKey, baseUrl, language, timeout]
  );

  return <VedikaContext.Provider value={{ client }}>{children}</VedikaContext.Provider>;
}

/**
 * Access the VedikaClient instance from context.
 * Must be used within a <VedikaProvider>.
 */
export function useVedikaClient(): VedikaClient {
  const ctx = useContext(VedikaContext);
  if (!ctx) {
    throw new Error('useVedikaClient must be used within a <VedikaProvider>');
  }
  return ctx.client;
}
