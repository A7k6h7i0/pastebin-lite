import { notFound } from 'next/navigation';
import { fetchAndIncrementPaste, getRemainingViews, getExpiryTimestamp } from '@/lib/paste';
import { getCurrentTime } from '@/lib/utils';
import { headers } from 'next/headers';

/**
 * GET /p/:id
 * 
 * Server-side rendered page to view a paste.
 * Content is safely escaped (React does this automatically).
 * 
 * If paste is unavailable, returns 404.
 */
export default async function ViewPastePage({ params }: { params: { id: string } }) {
  // Get headers for TEST_MODE support
  const headersList = headers();
  const currentTime = getCurrentTime(headersList);
  
  // Fetch the paste
  const paste = await fetchAndIncrementPaste(params.id, currentTime);
  
  if (!paste) {
    // Return 404
    notFound();
  }
  
  const remainingViews = getRemainingViews(paste);
  const expiresAt = getExpiryTimestamp(paste);

  return (
    <div className="container">
      <h1>📄 Paste</h1>
      
      <div className="paste-content">
        {paste.content}
      </div>
      
      <div className="info">
        {remainingViews !== null && (
          <p>🔢 Remaining views: {remainingViews}</p>
        )}
        {expiresAt && (
          <p>⏰ Expires at: {new Date(expiresAt).toLocaleString()}</p>
        )}
      </div>
      
      <a href="/" className="home-link">← Create a new paste</a>
    </div>
  );
}
