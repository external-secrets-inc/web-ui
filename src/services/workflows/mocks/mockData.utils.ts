import { MOCK_NETWORK_DELAY_MS } from './mockData.constants';

/**
 * Simulates network delay for realistic mock behavior
 */
export const simulateNetworkDelay = (delayMs: number = MOCK_NETWORK_DELAY_MS): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, delayMs));
};

/**
 * Simulates random network errors for testing error handling
 */
export const simulateRandomError = (errorRate: number = 0.1): void => {
  if (Math.random() < errorRate) {
    throw new Error('Mock network error - simulated failure');
  }
};

/**
 * Creates a mock response with realistic timing
 */
export const createMockResponse = async <T>(
  data: T,
  delayMs?: number,
  shouldSimulateError: boolean = false
): Promise<T> => {
  await simulateNetworkDelay(delayMs);

  if (shouldSimulateError) {
    simulateRandomError();
  }

  return data;
};