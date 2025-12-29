'use client';

import { useState } from 'react';

/**
 * Homepage - Create a new paste
 * 
 * This is a client component (uses React hooks).
 * Users can enter paste content and optional constraints.
 */
export default function Home() {
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // Build request body
      const body: any = { content };
      
      // Add optional fields only if provided
      if (ttlSeconds) {
        const ttl = parseInt(ttlSeconds, 10);
        if (isNaN(ttl) || ttl < 1) {
          setError('TTL must be a positive integer');
          setLoading(false);
          return;
        }
        body.ttl_seconds = ttl;
      }
      
      if (maxViews) {
        const views = parseInt(maxViews, 10);
        if (isNaN(views) || views < 1) {
          setError('Max views must be a positive integer');
          setLoading(false);
          return;
        }
        body.max_views = views;
      }

      // Make API request
      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create paste');
        return;
      }

      // Success!
      setResult({ url: data.url });
      
      // Clear form
      setContent('');
      setTtlSeconds('');
      setMaxViews('');
      
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>📋 Pastebin Lite</h1>
      <p>Create a paste and share it with a link. Optionally set expiry time or view limits.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="content">Paste Content *</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your text here..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="ttl">Time to Live (seconds) - Optional</label>
          <input
            id="ttl"
            type="number"
            min="1"
            value={ttlSeconds}
            onChange={(e) => setTtlSeconds(e.target.value)}
            placeholder="e.g., 3600 for 1 hour"
          />
        </div>

        <div className="form-group">
          <label htmlFor="views">Max Views - Optional</label>
          <input
            id="views"
            type="number"
            min="1"
            value={maxViews}
            onChange={(e) => setMaxViews(e.target.value)}
            placeholder="e.g., 5"
          />
        </div>

        <button type="submit" disabled={loading || !content.trim()}>
          {loading ? 'Creating...' : 'Create Paste'}
        </button>
      </form>

      {result && (
        <div className="success">
          <strong>✅ Paste created successfully!</strong>
          <p style={{ marginTop: '0.5rem' }}>
            Share this link: <a href={result.url} target="_blank" rel="noopener noreferrer">{result.url}</a>
          </p>
        </div>
      )}

      {error && (
        <div className="error">
          <strong>❌ Error:</strong> {error}
        </div>
      )}
    </div>
  );
}
