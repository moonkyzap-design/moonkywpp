# 🟢 MOONKY — Omnichannel Customer Communication Platform

> **Futuristic, Minimalist, Enterprise-Grade Customer Service SaaS**  
> Unifying **WhatsApp** and **Instagram Direct** into a single inbox with zero-hallucination grounded AI support, instant human handoff, CRM, workflow automations, and multi-tenant PostgreSQL security.

---

## 🌟 Product Vision & Aesthetics

Moonky is built for modern high-growth brands and enterprises that need a fast, reliable, beautiful customer communication hub.

### Brand Identity
- **Primary Palette**:
  - White: `#FFFFFF` (dominant surfaces, cards)
  - Light Gray: `#F1F3F2` (background canvas, subtle structure)
  - Medium Gray: `#AEB7B3` (subtle captions, borders, muted states)
  - Dark Gray: `#252B28` (primary typography, dark action elements)
  - Green Accent: `#45D483` (used sparingly for active states, online indicators, highlights)
- **Typography**: Inter / Modern clean sans-serif
- **Wordmark**: Clean text-based `Moonky` with an emerald accent dot.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 16 (App Router) + TypeScript |
| **Styling** | Tailwind CSS v4 + Reusable Component Tokens |
| **Database & Auth** | Supabase PostgreSQL + Row Level Security (RLS) |
| **Realtime** | Supabase Realtime + Reactive In-Memory Store |
| **Messaging Gateway** | WAME API (`https://server.wame.api.br`) |
| **Server-Side AI** | Configurable Server Engine (`gemini-1.5-pro`, `gpt-4o`, `claude-3-5-sonnet`) |
| **Deployment** | Vercel Serverless Platform |

---

## 🚀 Key Modules Implemented

### 1. Omnichannel Inbox (3-Column Layout)
- **Column 1 (Filters & Channels)**:
  - All Inboxes, Unread count, Assigned to Me, Not Assigned, Starred
  - Channels: WhatsApp (Official) & Instagram Direct
  - Labels: VIP Customer, New Years Event, Priority, Completed
  - Team Agents quick filter list
- **Column 2 (Conversation Feed)**:
  - Real-time search by name, phone, or message content
  - Channel indicators (WhatsApp Green / Instagram Gradient badge)
  - AI handling status tags (`[AI]`, `[Handoff]`, `[AI Paused]`)
  - Assigned agent pill, unread badges, timestamp
- **Column 3 (Message History & Composer)**:
  - Contact header with direct status switcher (`Open`, `Pending`, `Resolved`)
  - AI controls: `AI Active`, `AI Paused`, and `Take Over` button
  - Distinct message bubbles: Customer, AI Assistant (with robot badge & model trace), and Agent
  - Rich composer with attachments preview, canned responses, and send action
  - **Interactive Simulation Controls**: 1-click test buttons for Knowledge Base queries and Human Handoff triggers!
- **Column 4 (Context & CRM Drawer)**:
  - Internal Notes timeline with live `Save` action (collaborative `@AI Agent`, `@Christian`, `@Aulya Riski`)
  - Agent Profile with response rate metrics
  - Contact details (Phone, Instagram handle, Email, Lead Stage, Tags)

### 2. Grounded AI Assistant (Zero Hallucination Rules)
- AI **only** answers using verified company knowledge articles and immediate context.
- If an answer is not in the knowledge base, it triggers `[HANDOFF_REQUESTED]` and assigns an agent.
- Automatically pauses when a human agent takes over.
- Dedicated configuration studio with knowledge article editor, FAQ manager, personality tuner, and live interactive playground!

### 3. Channel Gateways (WAME API)
- Direct support for `https://server.wame.api.br/{instanceKey}/...`
- Meta Cloud API (Official) vs QR Code (Unofficial) connection modes
- Webhook receiver at `/api/webhooks/wame` supporting the standard Meta Cloud JSON envelope
- In-memory event deduplication & idempotency protection via `idempotency_key`
- Live connection test endpoint with latency measurement

### 4. CRM & Contacts
- Contact database with lead status pipeline (`New`, `Qualified`, `Lead`, `Customer`, `Churned`)
- Direct chat launch from CRM table
- Custom tags and field metadata

### 5. Automations
- Rule engine with event triggers (`Keyword in message`, `New conversation`, `Outside business hours`)
- Actions: Send automated reply, assign to agent, toggle AI

### 6. Analytics & KPI Dashboard
- Daily message volume breakdown (WhatsApp vs Instagram)
- Resolution rate and SLA average response times
- AI autopilot efficiency (68.4% resolved automatically)
- Agent performance rankings

### 7. Team & RBAC
- Role-Based Access Control: `Owner`, `Admin`, `Supervisor`, `Agent`
- Permissions matrix enforced at database level via Supabase RLS

---

## ⚙️ Environment Variables Setup

Create a `.env.local` file based on `.env.example`:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Supabase (Database & Authentication)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGci..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..."

# WAME API Integration
WAME_API_BASE_URL="https://server.wame.api.br"
WAME_DEFAULT_INSTANCE_KEY="YOUR_WAME_INSTANCE_KEY"
WAME_WEBHOOK_SECRET="moonky_whsec_token"

# Server-side AI Provider
AI_PROVIDER="gemini" # or "openai" | "anthropic"
AI_MODEL="gemini-1.5-pro"
AI_API_KEY="YOUR_AI_API_KEY"
```

---

## 🗄️ Supabase Database Migration

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Open `supabase/migrations/20261111000001_moonky_initial_schema.sql`.
4. Run the SQL script to create all 19 tables, indexes, and Row Level Security policies:
   - `organizations`, `profiles`, `organization_members`
   - `channels`, `contacts`, `tags`, `contact_tags`
   - `conversations`, `messages`, `conversation_assignments`, `internal_notes`
   - `ai_agents`, `ai_knowledge`, `ai_logs`
   - `automations`, `automation_rules`
   - `webhook_events`, `usage_records`, `subscriptions`

---

## 🌐 Deploy to Vercel

```bash
npm i -g vercel
vercel
```

In the Vercel dashboard:
1. Set the environment variables from your `.env.local`.
2. Configure your custom domain.
3. In WAME Dashboard (`https://wame.api.br`), set your Webhook URL to:
   `https://your-domain.vercel.app/api/webhooks/wame` with format `meta`.

---

## ✅ Interactive Testing Checklist

- [x] **Omnichannel Inbox**: Filter by WhatsApp, Instagram, Unread, and Assigned.
- [x] **Live Message Sending**: Type a response in the composer and press send.
- [x] **Simulate Customer Message**: Click "Test Knowledge Base Answer" in the top banner. Observe the AI respond with verified information.
- [x] **Simulate Human Handoff**: Click "Test Human Handoff". Observe the AI detect handoff, pause itself, flag the ticket, and assign Christian.
- [x] **Save Internal Note**: Write a note in the right panel and click `Save`.
- [x] **AI Playground**: Go to AI Assistant > Live Playground and test arbitrary questions.
- [x] **Test WAME Connection**: Go to Integrations > Test Connection with your instance key.
- [x] **CRM Contact Creation**: Go to Contacts > New Contact.
- [x] **Build Automation**: Go to Automations > Create Automation.
