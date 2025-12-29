import { NextRequest, NextResponse } from 'next/server';
import { fetchAndIncrementPaste, getRemainingViews, getExpiryTimestamp } from '@/lib/paste';
import { getCurrentTime } from '@/lib/utils';
import { FetchPasteResponse, ErrorResponse } from '@/types/paste';

/**
 * GET /api/pastes/:id
 * 
 * Fetches a paste by ID and increments its view count.
 * 
 * Success response (200):
 * {
 *   "content": "string",
 *   "remaining_views": 4 or null,
 *   "expires_at": "2026-01-01T00:00:00.000Z" or null
 * }
 * 
 * Error response (404):
 * {
 *   "error": "Paste not found or unavailable"
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get current time (supports TEST_MODE)
    const currentTime = getCurrentTime(request.headers);
    
    // Fetch and increment the paste
    const paste = await fetchAndIncrementPaste(id, currentTime);
    
    if (!paste) {
      // Paste not found, expired, or view limit exceeded
      return NextResponse.json<ErrorResponse>(
        { error: 'Paste not found or unavailable' },
        { status: 404 }
      );
    }
    
    // Build response
    const response: FetchPasteResponse = {
      content: paste.content,
      remaining_views: getRemainingViews(paste),
      expires_at: getExpiryTimestamp(paste),
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching paste:', error);
    return NextResponse.json<ErrorResponse>(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
