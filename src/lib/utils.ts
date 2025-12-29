/**
 * Utility functions used across the application.
 */

/**
 * Generates a random alphanumeric ID for pastes.
 * Uses a cryptographically secure random generator.
 */
export function generatePasteId(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  // Use crypto.getRandomValues for better randomness
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  
  return result;
}

/**
 * Gets the current time in milliseconds.
 * Supports TEST_MODE for deterministic testing.
 * 
 * In TEST_MODE, reads the x-test-now-ms header.
 * Otherwise, uses real system time.
 */
export function getCurrentTime(headers?: Headers): number {
  // Check if we're in test mode
  const isTestMode = process.env.TEST_MODE === '1';
  
  if (isTestMode && headers) {
    const testTime = headers.get('x-test-now-ms');
    if (testTime) {
      const parsed = parseInt(testTime, 10);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
  }
  
  // Fall back to real time
  return Date.now();
}

/**
 * Validates that a string is non-empty after trimming.
 */
export function isNonEmptyString(value: any): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates that a value is a positive integer.
 */
export function isPositiveInteger(value: any): value is number {
  return typeof value === 'number' && 
         Number.isInteger(value) && 
         value >= 1;
}
