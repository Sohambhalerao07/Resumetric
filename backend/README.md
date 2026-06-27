# Resume Matcher — Backend

AI-powered resume & job description matcher. Node.js/Express backend with Python document parsing.

## Quick Start

### 1. Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.9 with pip
- An **OpenRouter API key** — get one at [openrouter.ai/keys](https://openrouter.ai/keys)

### 2. Install MarkItDown (Python)

```bash
pip install markitdown
```

### 3. Install Node dependencies

```bash
cd backend
npm install
```

### 4. Configure environment

Edit `backend/.env`:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
OPENROUTER_API_KEY=your_key_here
MODEL=google/gemma-3-27b-it
```

### 5. Start the server

```bash
npm start         # production
npm run dev       # development (auto-restarts on file changes)
```

Server runs on `http://localhost:5000`.

---

## API

### `POST /api/match`

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resume` | File | ✅ | PDF resume (max 10 MB) |
| `job_description` | string | ✅ | Full job posting text |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "score": 85,
    "summary": "Strong candidate with relevant experience...",
    "strengths": ["5 years React experience", "..."],
    "missingSkills": ["Kubernetes", "..."],
    "recommendations": ["Add certification in...", "..."]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

### `GET /api/health`
Returns `{ "status": "ok", "timestamp": "..." }`.

---

## Architecture

```
server.js              ← Entry point (bootstrap only)
config/aiConfig.js     ← AI env vars (fail-fast validation)
routes/matchRoutes.js  ← Route declarations
controllers/
  matchController.js   ← HTTP layer (thin)
middleware/
  uploadMiddleware.js  ← Multer: PDF validation + storage
  errorHandler.js      ← Global error handler
services/
  matcherService.js    ← Pipeline orchestrator
  documentParserService.js  ← Spawns python/parser.py
  resumeProcessorService.js ← Cleans Markdown
  promptBuilderService.js   ← Builds LLM prompt
  AIService.js              ← OpenRouter client
utils/
  responseParser.js    ← Validates + parses LLM JSON
python/
  parser.py            ← MarkItDown PDF → Markdown (CLI only)
uploads/               ← Temporary storage (auto-deleted after parse)
```

## Changing the AI Model

Only update `.env`:
```env
MODEL=anthropic/claude-3.5-sonnet
```

No code changes required.
