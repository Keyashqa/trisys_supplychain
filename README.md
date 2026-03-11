# triSys Supply Chain AI Assistant

A neuro-symbolic multi-agent Q&A system for supply chain analytics. Upload a CSV of order/shipment data, ask natural language questions, and receive evidence-based answers with visualizations — powered by Google ADK agents, Pandas, and Pinecone.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Flow](#data-flow)
- [Backend](#backend)
  - [API Endpoints](#api-endpoints)
  - [Agent Pipeline](#agent-pipeline)
  - [Data Enrichment](#data-enrichment)
  - [Pinecone Vectorization](#pinecone-vectorization)
  - [Pydantic Schemas](#pydantic-schemas)
- [Frontend](#frontend)
  - [Global State (Zustand)](#global-state-zustand)
  - [Hooks](#hooks)
  - [Components](#components)
  - [SSE Event Protocol](#sse-event-protocol)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)

---

## Overview

Supply Chain AI Copilot lets logistics managers interrogate their shipment data by asking plain English questions:

- *"Which warehouse has the worst delays?"*
- *"What's the fastest processing product?"*
- *"How many orders are critically delayed this month?"*

The system combines **deterministic Pandas queries** (for factual grounding) with **LLM reasoning** (for pattern recognition and narrative generation) and **Pinecone semantic memory** (for cross-query insight retrieval and persistence).

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend                       │
│   Upload CSV → Dashboard (KPIs + Charts) → Chat Panel   │
└───────────────┬─────────────────────────────────────────┘
                │  POST /upload   POST /ask (SSE)
                ↓
┌─────────────────────────────────────────────────────────┐
│                  FastAPI Backend (server.py)             │
│   Enrichment Pipeline → ADK Runner → SSE Stream         │
└───────────────┬─────────────────────────────────────────┘
                │
    ┌───────────┼────────────────────┐
    ↓           ↓                    ↓
 DataAgent  AnalystAgent       NarratorAgent
 (Pandas)   (Gemini LLM)       (Gemini LLM)
    │           │                    │
    └───────────┴────────────────────┘
                │
           Pinecone
     (bootstrap + insight memory)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 18.3 + JSX |
| Frontend Build | Vite 5.4 |
| Styling | Tailwind CSS 3.4 |
| State Management | Zustand 4.5 |
| Charts | Recharts 2.12 |
| File Upload UI | react-dropzone 14.2 |
| Backend Framework | FastAPI 0.110 |
| Backend Server | Uvicorn 0.29 |
| Data Processing | Pandas 2.2 + NumPy 1.26 |
| AI Agent Framework | Google ADK 0.3 |
| LLM | Google Gemini (`gemini-2.5-flash-lite`) |
| Embeddings | Google Gemini Embedding API (`gemini-embedding-001`) |
| Vector Database | Pinecone 3.0 |
| Config / Secrets | python-dotenv 1.0 |
| Validation | Pydantic 2.0 |

---

## Project Structure

```
trisys_supplychain/
├── .gitignore
├── README.md
├── input.md                    # Sample questions / test inputs
├── frontend.md                 # Frontend design notes
├── sample_data.csv             # Example CSV for testing
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js          # Dev server + proxy config
│   ├── index.html
│   └── src/
│       ├── main.jsx            # React DOM entry
│       ├── App.jsx             # Root component (tab switcher)
│       ├── index.css           # Tailwind imports
│       ├── api/
│       │   ├── constants.js    # BASE_URL constant
│       │   └── upload.js       # uploadCSV(file) → POST /upload
│       ├── store/
│       │   └── useCopilotStore.js   # Zustand global store
│       ├── hooks/
│       │   ├── useSSE.js       # SSE stream parser
│       │   ├── useChat.js      # Chat submit + SSE orchestration
│       │   └── useUpload.js    # File upload + summary handler
│       └── components/
│           ├── layout/
│           │   ├── Layout.jsx          # App shell: sidebar + topbar + main
│           │   ├── Sidebar.jsx         # Logo, dropzone, summary, query history
│           │   └── TopBar.jsx          # Status / navigation bar
│           ├── upload/
│           │   ├── DropZone.jsx        # Drag-and-drop CSV upload
│           │   ├── UploadProgress.jsx  # Progress bar during enrichment
│           │   └── DataSummaryCard.jsx # Stats: rows, warehouses, delay rate
│           ├── dashboard/
│           │   ├── Dashboard.jsx       # KPI grid + 4 chart panels
│           │   ├── KPICard.jsx         # Single metric card
│           │   ├── WarehouseChart.jsx  # Bar chart: avg delay by warehouse
│           │   ├── SeverityPieChart.jsx# Pie: on_time / minor / critical
│           │   ├── DelayTrendChart.jsx # Line: delay trend over time
│           │   └── ProductRankTable.jsx# Table: products by processing time
│           ├── chat/
│           │   ├── ChatPanel.jsx       # Full chat interface
│           │   ├── MessageList.jsx     # Scrollable message history
│           │   ├── MessageBubble.jsx   # User/AI bubble + inline chart
│           │   ├── StreamingBubble.jsx # Live token streaming bubble
│           │   ├── AgentTracker.jsx    # Pipeline status indicator
│           │   ├── FollowUpChips.jsx   # Suggested follow-up buttons
│           │   └── ChatInput.jsx       # Text input + send
│           ├── charts/
│           │   ├── DynamicChart.jsx    # Routes chart_instruction to widget
│           │   ├── BarChartWidget.jsx  # Recharts bar chart
│           │   ├── LineChartWidget.jsx # Recharts line chart
│           │   └── ScatterWidget.jsx   # Recharts scatter chart
│           └── shared/
│               ├── Badge.jsx           # Severity / confidence badge
│               ├── Spinner.jsx         # Loading spinner
│               └── EmptyState.jsx      # "No data loaded" placeholder
│
└── backend/
    ├── server.py               # FastAPI app, CORS, startup, endpoints
    ├── main.py                 # Standalone test runner
    ├── requirements.txt
    ├── .env.example
    ├── app/
    │   ├── agent.py            # Root SupplyChainPipeline (BaseAgent)
    │   ├── config.py           # get_model() → Gemini instance
    │   └── sub_agents/
    │       ├── DataAgent/
    │       │   ├── __init__.py
    │       │   └── agent.py    # Pandas intent classifier + query executor
    │       ├── AnalystAgent/
    │       │   ├── __init__.py
    │       │   ├── agent.py    # LlmAgent: pattern analysis + insight gen
    │       │   └── prompt.py   # ANALYST_PROMPT system instruction
    │       └── NarratorAgent/
    │           ├── __init__.py
    │           ├── agent.py    # LlmAgent: business narrative + chart spec
    │           └── prompt.py   # NARRATOR_PROMPT system instruction
    ├── pipeline/
    │   ├── enrichment.py       # enrich(csv_bytes) → (df, summary_json)
    │   ├── vectorizer.py       # vectorize_summary() → Pinecone bootstrap
    │   ├── pinecone_writer.py  # write_insight() → store agent insight
    │   └── embeddings.py       # embed(text) → list[float] via Gemini API
    ├── models/
    │   └── schemas.py          # All Pydantic request/response models
    └── state/
        └── store.py            # In-memory df + summary_json store
```

---

## Data Flow

### 1. Upload Phase

```
User drops CSV
    → POST /upload (multipart)
    → enrichment.py: parse + compute derived columns + aggregate stats
    → state/store.py: save (enriched_df, summary_json) in memory
    → vectorizer.py: embed summary + per-warehouse + per-product docs → Pinecone
    → Response: UploadResponse (rows, warehouses, insights_vectorized)
```

**Enrichment adds these computed columns to the DataFrame:**

| Column | Formula |
|--------|---------|
| `Order_Processing_Time` | `Ship_Date − Order_Date` (days) |
| `Shipping_Delay` | `Actual_Delivery − Expected_Delivery` (days) |
| `Is_Delayed` | `Shipping_Delay > 0` |
| `Delay_Severity` | `"on_time"` / `"minor"` / `"critical"` |

**Aggregated stats in `summary_json`:**
- `total_rows`, `warehouses`, `products`
- `overall_delay_rate`, `avg_shipping_delay`, `avg_processing_time`
- `warehouse_stats`: per-warehouse avg delay, delay rate, total orders
- `product_stats`: per-product avg processing time and delay
- `severity_counts`: on_time / minor / critical breakdown
- `delay_trend`: weekly average delay time series

---

### 2. Query Phase

```
User types question
    → POST /ask { question, session_id }
    → Create ADK session: { user_question, summary_json }
    → Runner streams agent events as SSE
    → Frontend parses events → updates AgentTracker, streaming bubble
    → "complete" event delivers final_answer (text + chart + follow-ups)
```

---

## Backend

### API Endpoints

#### `POST /upload`

Upload and process a CSV file.

**Request:** `multipart/form-data` with `file` field (CSV).

**Response:**
```json
{
  "status": "ready",
  "rows_loaded": 5000,
  "warehouses_found": ["WH-A", "WH-B", "WH-C"],
  "insights_vectorized": 14,
  "summary": { ... }
}
```

---

#### `POST /ask`

Ask a natural language question. Returns a **Server-Sent Events (SSE)** stream.

**Request:**
```json
{
  "question": "Which warehouse has the highest delay rate?",
  "session_id": "optional-uuid"
}
```

**SSE Events** (see [SSE Event Protocol](#sse-event-protocol)):

| Event | Payload |
|-------|---------|
| `agent_start` | `{ agent: "DataAgent" \| "AnalystAgent" \| "NarratorAgent" }` |
| `agent_done` | `{ agent: "...", result: { ... } }` |
| `token` | `{ text: "partial response token" }` |
| `pinecone_fetch` | `{ count: 5 }` |
| `pinecone_write` | `{ status: "ok" }` |
| `complete` | Full `FinalAnswer` object |
| `error` | `{ message: "..." }` |

---

### Agent Pipeline

The root agent `SupplyChainPipeline` is a `BaseAgent` that runs three sub-agents sequentially:

```
DataAgent → AnalystAgent → NarratorAgent
```

Between DataAgent and AnalystAgent, the pipeline also queries Pinecone for relevant past insights (`pinecone_context`), and after NarratorAgent it writes the new `generated_insight` back to Pinecone.

---

#### Agent 1 — DataAgent (`BaseAgent`, deterministic)

**Purpose:** Classify question intent, run the matching Pandas query, detect anomalies.

**Intent → Query mapping:**

| Intent | Trigger Keywords | Pandas Operation |
|--------|-----------------|-----------------|
| `worst_warehouse` | "worst delay", "highest delay" | `groupby(Warehouse_ID).mean(Shipping_Delay).sort_values(desc)` |
| `fastest_product` | "fastest", "quickest processing" | `groupby(Product_ID).mean(Order_Processing_Time).sort_values(asc)` |
| `avg_delay_warehouse` | "average delay by warehouse" | `groupby(Warehouse_ID).mean(Shipping_Delay)` |
| `delayed_orders_list` | "how many delayed", "list delays" | `filter(Is_Delayed == True).sample(5)` |
| `general_summary` | (default) | Return overall summary stats |

**Output state key:** `data_context`
```json
{
  "question_intent": "worst_warehouse",
  "result_summary": { ... },
  "rows_analyzed": 5000,
  "top_entities": [{ "Warehouse_ID": "WH-C", "avg_delay": 4.2 }],
  "anomalies_detected": ["WH-C exceeds mean+2σ threshold"]
}
```

---

#### Agent 2 — AnalystAgent (`LlmAgent`)

**Model:** `gemini-2.5-flash-lite`
**ADK config:** `output_schema=AnalysisResult`, `include_contents="none"`, `disallow_transfer_to_peers=True`

**Inputs (from session state):**
- `{data_context}` — verified Pandas figures
- `{pinecone_context}` — relevant past insights
- `{user_question}`

**Responsibilities:**
- Answer using only verified numbers from `data_context` (no hallucination)
- Cross-reference `pinecone_context` to spot cross-query patterns
- Flag statistical anomalies
- Recommend a chart type
- Generate a 3–5 sentence insight for Pinecone storage

**Output state key:** `analysis_result`
```json
{
  "key_finding": "WH-C averages 4.2 days delay vs. fleet mean of 1.8",
  "supporting_evidence": ["WH-C delay_rate=62%", "Only warehouse above 2σ"],
  "pattern_detected": "WH-C consistently top offender across 3 queries",
  "anomaly_flag": true,
  "confidence": "high",
  "chart_type": "bar",
  "chart_data_key": "warehouse_stats",
  "generated_insight": "WH-C shows systemic underperformance..."
}
```

---

#### Agent 3 — NarratorAgent (`LlmAgent`)

**Model:** `gemini-2.5-flash-lite`
**ADK config:** `output_schema=FinalAnswer`, `include_contents="none"`, `disallow_transfer_to_peers=True`

**Inputs:**
- `{analysis_result}` — technical findings
- `{user_question}`
- `{data_context}` — for grounding

**Responsibilities:**
- Convert technical analysis into 2–4 plain-English sentences
- Give one actionable business recommendation
- Suggest 2 follow-up questions
- Produce a `chart_instruction` object (or `null`)

**Output state key:** `final_answer`
```json
{
  "answer": "Warehouse C is your biggest problem — 62% of its orders are delayed by an average of 4.2 days.",
  "recommendation": "Conduct an operational audit of WH-C and consider redistributing its load to WH-A temporarily.",
  "follow_ups": [
    "Which product categories are most affected in WH-C?",
    "Has WH-C's performance worsened over the past 4 weeks?"
  ],
  "chart_instruction": {
    "chart_type": "bar",
    "x_key": "Warehouse_ID",
    "y_key": "avg_delay",
    "title": "Average Delay by Warehouse",
    "chart_data_key": "warehouse_stats"
  }
}
```

---

### Data Enrichment

**File:** `backend/pipeline/enrichment.py`
**Function:** `enrich(csv_bytes: bytes) → (pd.DataFrame, dict)`

Steps:
1. Parse CSV with Pandas
2. Parse date columns: `Order_Date`, `Ship_Date`, `Expected_Delivery`, `Actual_Delivery`
3. Compute derived columns (table above)
4. Build `summary_json` with aggregated warehouse stats, product stats, severity counts, and weekly delay trend
5. Return `(enriched_df, summary_json)`

---

### Pinecone Vectorization

**Bootstrap** (`pipeline/vectorizer.py`) — runs once per CSV upload:

| Vector Type | Description | Count |
|-------------|-------------|-------|
| Global summary | Overall dataset stats | 1 |
| Per-warehouse | Stats for each warehouse | N warehouses |
| Per-product | Top 10 products by delay severity | up to 10 |
| Anomaly | Warehouses with delay_rate > 40% | variable |

**Runtime write** (`pipeline/pinecone_writer.py`) — runs after each query:
- Stores the `generated_insight` from AnalystAgent tagged with question, intent, and entities

**Embeddings** (`pipeline/embeddings.py`):
- Model: `gemini-embedding-001` (768 dimensions)
- Called via Google Gemini REST API

---

### Pydantic Schemas

Defined in `backend/models/schemas.py`:

| Schema | Used By |
|--------|---------|
| `AskRequest` | `POST /ask` request body |
| `UploadResponse` | `POST /upload` response |
| `DataContext` | DataAgent output |
| `AnalysisResult` | AnalystAgent output schema |
| `ChartInstruction` | Nested in FinalAnswer |
| `FinalAnswer` | NarratorAgent output schema |

---

## Frontend

### Global State (Zustand)

**File:** `frontend/src/store/useCopilotStore.js`

```javascript
{
  // Upload state
  uploadStatus: 'idle' | 'uploading' | 'ready' | 'error',
  summary: {
    rows_loaded, warehouses_found, insights_vectorized, summary
  },

  // Chat state
  messages: [{
    id, role: 'user' | 'assistant',
    content, chart, recommendation, follow_ups
  }],
  isStreaming: boolean,
  streamingText: string,

  // Agent pipeline status (updated live via SSE)
  agentEvents: {
    DataAgent:     { status: 'idle' | 'running' | 'done', result },
    AnalystAgent:  { status, result },
    NarratorAgent: { status, result },
    pinecone_fetch: count
  },

  // UI
  activeTab: 'dashboard' | 'chat',
  queryHistory: string[]   // last 10 questions
}
```

**Key actions:** `setUploadStatus`, `setSummary`, `setActiveTab`, `resetAgentEvents`, `updateAgentEvent`, `addUserMessage`, `appendToken`, `startStreaming`, `finalizeMessage`

---

### Hooks

#### `useUpload()`
- Calls `uploadCSV(file)` → `POST /upload`
- On success: sets `uploadStatus = 'ready'`, stores `summary` in Zustand

#### `useChat()`
- Manages question submission
- Calls `createSSEStream()`, dispatches Zustand actions per event

#### `useSSE(question, sessionId, onEvent, onError)`
- Opens `POST /ask` as an SSE stream
- Parses `data:` lines and calls `onEvent(type, payload)` for each

---

### Components

#### Layout

| Component | Role |
|-----------|------|
| `Layout.jsx` | App shell — sidebar + topbar + main content area |
| `Sidebar.jsx` | Logo, `DropZone`, upload summary, query history list |
| `TopBar.jsx` | Status bar and navigation |

#### Upload

| Component | Role |
|-----------|------|
| `DropZone.jsx` | Drag-and-drop zone using react-dropzone; shows spinner during upload |
| `UploadProgress.jsx` | Progress indicator during CSV enrichment |
| `DataSummaryCard.jsx` | Displays rows loaded, warehouses found, overall delay rate |

#### Dashboard

| Component | Role |
|-----------|------|
| `Dashboard.jsx` | Grid layout: 4 KPI cards + 4 chart panels |
| `KPICard.jsx` | Single metric tile (label + value + trend indicator) |
| `WarehouseChart.jsx` | Bar chart: average delay per warehouse |
| `SeverityPieChart.jsx` | Pie chart: on_time / minor / critical breakdown |
| `DelayTrendChart.jsx` | Line chart: weekly average delay trend |
| `ProductRankTable.jsx` | Table: products ranked by average processing time |

#### Chat

| Component | Role |
|-----------|------|
| `ChatPanel.jsx` | Main chat view — messages + input; shows EmptyState if no CSV |
| `MessageList.jsx` | Scrollable list of MessageBubble components |
| `MessageBubble.jsx` | Renders user/AI message; includes inline DynamicChart + FollowUpChips |
| `StreamingBubble.jsx` | Live bubble that appends tokens as they arrive |
| `AgentTracker.jsx` | Visual pipeline: DataAgent → AnalystAgent → NarratorAgent (idle/running/done) |
| `FollowUpChips.jsx` | Clickable suggested follow-up question buttons |
| `ChatInput.jsx` | Text input + submit button |

#### Charts

| Component | Role |
|-----------|------|
| `DynamicChart.jsx` | Reads `chart_instruction.chart_type`, renders the correct widget |
| `BarChartWidget.jsx` | Recharts `BarChart` wrapper |
| `LineChartWidget.jsx` | Recharts `LineChart` wrapper |
| `ScatterWidget.jsx` | Recharts `ScatterChart` wrapper |

#### Shared

| Component | Role |
|-----------|------|
| `Badge.jsx` | Colored badge for severity or confidence level |
| `Spinner.jsx` | Loading spinner |
| `EmptyState.jsx` | Prompt to upload CSV when no data is loaded |

---

### SSE Event Protocol

Events emitted by `POST /ask` as `text/event-stream`:

```
event: agent_start
data: {"agent": "DataAgent"}

event: agent_done
data: {"agent": "DataAgent", "result": {...}}

event: pinecone_fetch
data: {"count": 5}

event: token
data: {"text": "Warehouse C"}

event: pinecone_write
data: {"status": "ok"}

event: complete
data: {"answer": "...", "recommendation": "...", "follow_ups": [...], "chart_instruction": {...}}

event: error
data: {"message": "CSV not uploaded yet"}
```

---

## Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
GOOGLE_API_KEY=your-gemini-api-key
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=your-pinecone-index-name
```

All three are validated at FastAPI startup. Missing any will raise a `RuntimeError` before the server accepts requests.

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **Python** 3.10+
- A **Google Cloud / AI Studio** API key with Gemini access
- A **Pinecone** account with an index created (768 dimensions, cosine metric)

---

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure secrets
cp .env.example .env
# Edit .env with your actual API keys

# Start the API server
uvicorn server:app --reload --port 8000
```

To test the pipeline without the frontend:
```bash
python main.py
```

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (proxies /upload and /ask to localhost:8000)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

**Production build:**
```bash
npm run build
```

---

### Usage

1. Start the backend (`uvicorn server:app --reload --port 8000`)
2. Start the frontend (`npm run dev`)
3. Drag and drop a CSV file onto the upload zone in the sidebar
4. Wait for enrichment to complete — the Dashboard tab populates with KPIs and charts
5. Switch to the **Chat** tab and ask questions in plain English
6. Watch the AgentTracker show live pipeline progress as DataAgent → AnalystAgent → NarratorAgent execute
7. Receive a narrative answer with optional chart and follow-up suggestions

---

### Expected CSV Format

The CSV should include the following columns (additional columns are ignored):

| Column | Type | Description |
|--------|------|-------------|
| `Order_Date` | date | When the order was placed |
| `Ship_Date` | date | When the order was shipped |
| `Expected_Delivery` | date | Promised delivery date |
| `Actual_Delivery` | date | Actual delivery date |
| `Warehouse_ID` | string | Warehouse identifier |
| `Product_ID` | string | Product identifier |

A `sample_data.csv` is included at the project root for testing.
