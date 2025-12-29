import { redis } from './redis';
import { Paste } from '@/types/paste';
import { generatePasteId, getCurrentTime } from './utils';

/**
 * This file contains all paste-related operations.
 * Think of it as the "database access layer" for pastes.
 */

// Redis key prefix to namespace our data
const PASTE_KEY_PREFIX = 'paste:';

/**
 * Creates a new paste and stores it in Redis.
 * 
 * @param content - The paste content
 * @param ttl_seconds - Optional time-to-live in seconds
 * @param max_views - Optional maximum view count
 * @param currentTime - Current timestamp (for testing)
 * @returns The created paste ID
 */
export async function createPaste(
  content: string,
  ttl_seconds: number | null,
  max_views: number | null,
  currentTime: number
): Promise<string> {
  // Generate a unique ID
  const id = generatePasteId();
  const key = `${PASTE_KEY_PREFIX}${id}`;
  
  // Create the paste object
  const paste: Paste = {
    id,
    content,
    created_at: currentTime,
    ttl_seconds,
    max_views,
    view_count: 0,
  };
  
  // Store in Redis
  // If TTL is set, Redis will automatically delete after expiry
  if (ttl_seconds) {
    await redis.setex(key, ttl_seconds, JSON.stringify(paste));
  } else {
    await redis.set(key, JSON.stringify(paste));
  }
  
  return id;
}

/**
 * Fetches a paste by ID and increments its view count.
 * Returns null if paste doesn't exist or is unavailable.
 * 
 * This function handles:
 * - TTL expiry checking
 * - View count limits
 * - Atomic view count incrementing
 * 
 * @param id - Paste ID
 * @param currentTime - Current timestamp (for testing)
 * @returns Paste object or null
 */
export async function fetchAndIncrementPaste(
  id: string,
  currentTime: number
): Promise<Paste | null> {
  const key = `${PASTE_KEY_PREFIX}${id}`;
  
  // Fetch the paste
  const data = await redis.get(key);
  
  if (!data) {
    return null; // Paste not found
  }
  
  // Parse the paste data
  const paste: Paste = typeof data === 'string' ? JSON.parse(data) : data;
  
  // Check if TTL has expired
  if (paste.ttl_seconds !== null) {
    const expiryTime = paste.created_at + (paste.ttl_seconds * 1000);
    if (currentTime >= expiryTime) {
      // Paste has expired, delete it
      await redis.del(key);
      return null;
    }
  }
  
  // Check if view count limit is exceeded
  if (paste.max_views !== null && paste.view_count >= paste.max_views) {
    // View limit reached
    return null;
  }
  
  // Increment view count atomically
  paste.view_count += 1;
  
  // Check if this was the last allowed view
  const shouldDelete = paste.max_views !== null && paste.view_count >= paste.max_views;
  
  if (shouldDelete) {
    // Delete the paste as it's now exhausted
    await redis.del(key);
  } else {
    // Update the paste with incremented view count
    // Preserve the original TTL if it exists
    if (paste.ttl_seconds) {
      const remainingSeconds = Math.ceil((paste.created_at + (paste.ttl_seconds * 1000) - currentTime) / 1000);
      if (remainingSeconds > 0) {
        await redis.setex(key, remainingSeconds, JSON.stringify(paste));
      } else {
        // TTL expired during processing
        await redis.del(key);
        return null;
      }
    } else {
      await redis.set(key, JSON.stringify(paste));
    }
  }
  
  return paste;
}

/**
 * Calculates remaining views for a paste.
 * Returns null if unlimited.
 */
export function getRemainingViews(paste: Paste): number | null {
  if (paste.max_views === null) {
    return null;
  }
  return Math.max(0, paste.max_views - paste.view_count);
}

/**
 * Calculates expiry timestamp for a paste.
 * Returns null if no TTL.
 */
export function getExpiryTimestamp(paste: Paste): string | null {
  if (paste.ttl_seconds === null) {
    return null;
  }
  const expiryMs = paste.created_at + (paste.ttl_seconds * 1000);
  return new Date(expiryMs).toISOString();
}
