/**
 * This file defines TypeScript types for our paste data.
 * Types help catch errors during development.
 */

// The structure of a paste stored in Redis
export interface Paste {
  id: string;                    // Unique identifier
  content: string;               // The actual text content
  created_at: number;            // Unix timestamp (milliseconds) when created
  ttl_seconds: number | null;    // Time-to-live in seconds, or null if no expiry
  max_views: number | null;      // Maximum view count, or null if unlimited
  view_count: number;            // Current number of views
}

// Request body when creating a new paste
export interface CreatePasteRequest {
  content: string;
  ttl_seconds?: number;          // Optional
  max_views?: number;            // Optional
}

// Response after successfully creating a paste
export interface CreatePasteResponse {
  id: string;
  url: string;
}

// Response when fetching a paste via API
export interface FetchPasteResponse {
  content: string;
  remaining_views: number | null;
  expires_at: string | null;     // ISO 8601 format
}

// Standard error response
export interface ErrorResponse {
  error: string;
  details?: string;
}
