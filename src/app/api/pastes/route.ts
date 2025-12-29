import { NextRequest, NextResponse } from 'next/server';
import { createPaste } from '@/lib/paste';
import { getCurrentTime, isNonEmptyString, isPositiveInteger } from '@/lib/utils';
import { CreatePasteRequest, CreatePasteResponse, ErrorResponse } from '@/types/paste';

/**
 * POST /api/pastes
 * 
 * Creates a new paste.
 * 
 * Request body:
 * {
 *   "content": "string",         // Required, non-empty
 *   "ttl_seconds": 60,            // Optional, integer >= 1
 *   "max_views": 5                // Optional, integer >= 1
 * }
 * 
 * Response:
 * {
 *   "id": "abc123",
 *   "url": "https://yourdomain.com/p/abc123"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: CreatePasteRequest = await request.json();
    
    // Validate content
    if (!isNonEmptyString(body.content)) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Invalid input', details: 'content must be a non-empty string' },
        { status: 400 }
      );
    }
    
    // Validate ttl_seconds if provided
    let ttl_seconds: number | null = null;
    if (body.ttl_seconds !== undefined) {
      if (!isPositiveInteger(body.ttl_seconds)) {
        return NextResponse.json<ErrorResponse>(
          { error: 'Invalid input', details: 'ttl_seconds must be an integer >= 1' },
          { status: 400 }
        );
      }
      ttl_seconds = body.ttl_seconds;
    }
    
    // Validate max_views if provided
    let max_views: number | null = null;
    if (body.max_views !== undefined) {
      if (!isPositiveInteger(body.max_views)) {
        return NextResponse.json<ErrorResponse>(
          { error: 'Invalid input', details: 'max_views must be an integer >= 1' },
          { status: 400 }
        );
      }
      max_views = body.max_views;
    }
    
    // Get current time (supports TEST_MODE)
    const currentTime = getCurrentTime(request.headers);
    
    // Create the paste
    const id = await createPaste(body.content, ttl_seconds, max_views, currentTime);
    
    // Build the shareable URL
    // Use VERCEL_URL in production, or construct from host header
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const host = process.env.VERCEL_URL || request.headers.get('host') || 'localhost:3000';
    const url = `${protocol}://${host}/p/${id}`;
    
    // Return success response
    const response: CreatePasteResponse = { id, url };
    return NextResponse.json(response, { status: 201 });
    
  } catch (error) {
    console.error('Error creating paste:', error);
    
    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Invalid JSON' },
        { status: 400 }
      );
    }
    
    return NextResponse.json<ErrorResponse>(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
