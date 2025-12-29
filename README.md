# Pastebin Lite

A simple, production-ready pastebin application built with Next.js, TypeScript, and Vercel KV (Redis).

## 🚀 Features

- Create  pastes with shareable URLs
- Optional time-based expiry (TTL)
- Optional view-count limits
- Safe content rendering (XSS protection)
- Atomic view counting (concurrency-safe)
- Serverless deployment on Vercel

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Vercel KV (Redis)
- **Deployment**: Vercel

### Why Vercel KV (Redis)?

I chose Vercel KV as the persistence layer for several reasons:

1. **Serverless-native**: Works perfectly with Vercel's serverless functions (no connection pooling issues)
2. **Atomic operations**: Redis supports atomic increment operations, crucial for preventing race conditions in view counting
3. **Built-in TTL**: Redis natively supports time-to-live, making paste expiry efficient
4. **Fast performance**: In-memory storage provides sub-millisecond response times
5. **Zero maintenance**: Fully managed service, no database servers to maintain

### Project Structure

pastebin-lite/
├── src/
│ ├── app/ # Next.js App Router
│ │ ├── api/ # API routes
│ │ │ ├── healthz/ # Health check endpoint
│ │ │ └── pastes/ # Paste CRUD operations
│ │ ├── p/[id]/ # View paste page
│ │ ├── page.tsx # Homepage (create paste)
│ │ └── layout.tsx # Root layout
│ ├── lib/ # Core business logic
│ │ ├── redis.ts # Redis connection
│ │ ├── paste.ts # Paste operations
│ │ └── utils.ts # Helper functions
│ └── types/ # TypeScript type definitions
├── .env.local.example # Environment variable template
├── package.json
└── README.md



## 🛠️ Running Locally

### Prerequisites
- Node.js 18+ installed
- A Vercel account (free tier works)

### Step 1: Clone the repository

git clone <your-repo-url>
cd pastebin-lite



### Step 2: Install dependencies

npm install



### Step 3: Set up Vercel KV

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new KV store: Storage → Create Database → KV
3. Copy the environment variables provided

### Step 4: Configure environment variables

cp .env.local.example .env.local



Edit `.env.local` and paste your Vercel KV credentials:

KV_REST_API_URL=https://your-kv-url.kv.vercel-storage.com
KV_REST_API_TOKEN=your_token_here
KV_REST_API_READ_ONLY_TOKEN=your_readonly_token_here



### Step 5: Run the development server

npm run dev



Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚢 Deploying to Vercel

### Option 1: Deploy via Vercel CLI

npm install -g vercel
vercel



### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/new)
3. Import your repository
4. Vercel will auto-detect Next.js
5. Add environment variables in the Vercel dashboard
6. Deploy!

**Important**: Make sure to add your KV environment variables in the Vercel project settings.

## 📡 API Documentation

### Health Check
GET /api/healthz


Response:
{ "ok": true }



### Create Paste
POST /api/pastes
Content-Type: application/json

{
"content": "Hello world",
"ttl_seconds": 3600, // Optional: 1 hour
"max_views": 5 // Optional: 5 views max
}


Response:
{
"id": "abc123",
"url": "https://yourdomain.com/p/abc123"
}



### Fetch Paste (API)
GET /api/pastes/:id


Response:
{
"content": "Hello world",
"remaining_views": 4,
"expires_at": "2026-01-01T00:00:00.000Z"
}



### View Paste (HTML)
GET /p/:id


Returns HTML page with paste content.

## 🧪 Testing

The application supports deterministic time testing for automated tests:

Set environment variable:
TEST_MODE=1



Then send requests with header:
x-test-now-ms: 1704067200000



This allows testing time-based expiry without waiting.

## 🔒 Security Features

- **XSS Protection**: All paste content is safely escaped by React
- **Input Validation**: Strict validation on all API inputs
- **No SQL Injection**: Redis key-value store (not vulnerable to SQL injection)
- **Secrets Management**: Environment variables for credentials (never committed)

## 🎯 Design Decisions

### 1. Atomic View Counting
View counts are incremented in the same transaction that checks limits, preventing race conditions under concurrent access.

### 2. Immediate Deletion
When a paste reaches its limit (TTL or views), it's immediately deleted from Redis rather than marked as inactive. This prevents stale data and simplifies logic.

### 3. Server-Side Rendering for View Pages
The `/p/:id` route uses Next.js server components for fast initial load and SEO benefits.

### 4. Client-Side Form for Creation
The homepage uses client-side React for interactive form validation and better UX.

### 5. Dynamic URL Construction
URLs are constructed dynamically using Vercel environment variables, ensuring correct URLs in both development and production.

## 📝 Requirements Checklist

- ✅ Create paste with shareable URL
- ✅ View paste safely (no script execution)
- ✅ TTL-based expiry
- ✅ View-count limits
- ✅ Combined constraints (either triggers)
- ✅ Health check endpoint
- ✅ All API routes return JSON
- ✅ Proper 404 for unavailable pastes
- ✅ Deterministic time testing support
- ✅ Persistence survives across requests
- ✅ Concurrency-safe view counting
- ✅ Clean UI with error messages
- ✅ No hardcoded localhost URLs
- ✅ No committed secrets
- ✅ Works on Vercel serverless

## 🤝 Contributing

This is a take-home assignment project. Contributions are not expected, but feedback is welcome!

## 📄 License

MIT

---

Built with ❤️ using Next.js and Vercel KV