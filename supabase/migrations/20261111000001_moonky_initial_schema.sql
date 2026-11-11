-- ====================================================================
-- MOONKY PRODUCTION DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Multi-tenant Omnichannel Customer Communication Platform
-- ====================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean existing if re-running
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS usage_records CASCADE;
DROP TABLE IF EXISTS webhook_events CASCADE;
DROP TABLE IF EXISTS automation_rules CASCADE;
DROP TABLE IF EXISTS automations CASCADE;
DROP TABLE IF EXISTS ai_logs CASCADE;
DROP TABLE IF EXISTS ai_knowledge CASCADE;
DROP TABLE IF EXISTS ai_agents CASCADE;
DROP TABLE IF EXISTS internal_notes CASCADE;
DROP TABLE IF EXISTS contact_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS conversation_assignments CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS channels CASCADE;
DROP TABLE IF EXISTS organization_members CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- 1. ORGANIZATIONS (TENANTS)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    plan VARCHAR(50) DEFAULT 'growth',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER PROFILES
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'agent', -- 'owner', 'admin', 'supervisor', 'agent'
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORGANIZATION MEMBERS (Multi-tenant user membership)
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'agent', -- 'owner', 'admin', 'supervisor', 'agent'
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'invited', 'suspended'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 4. CHANNELS (WhatsApp / Instagram via WAME)
CREATE TABLE channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'whatsapp', 'instagram'
    provider VARCHAR(50) NOT NULL DEFAULT 'wame',
    instance_key VARCHAR(255),
    is_official BOOLEAN DEFAULT true, -- true = Meta Cloud API; false = Unofficial QR Code
    phone_number VARCHAR(50),
    instagram_username VARCHAR(100),
    status VARCHAR(50) DEFAULT 'disconnected', -- 'connected', 'disconnected', 'pairing'
    webhook_url TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CONTACTS / CRM
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    instagram_username VARCHAR(100),
    email VARCHAR(255),
    avatar_url TEXT,
    lead_status VARCHAR(50) DEFAULT 'lead', -- 'new', 'qualified', 'lead', 'customer', 'churned'
    custom_fields JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TAGS
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) DEFAULT '#45D483',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CONTACT TAGS
CREATE TABLE contact_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(contact_id, tag_id)
);

-- 8. CONVERSATIONS
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    assigned_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'pending', 'resolved'
    priority VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    ai_enabled BOOLEAN DEFAULT true,
    ai_status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'handed_off'
    unread_count INT DEFAULT 0,
    last_message_preview TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CONVERSATION ASSIGNMENTS AUDIT
CREATE TABLE conversation_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. MESSAGES
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    sender_type VARCHAR(50) NOT NULL, -- 'contact', 'agent', 'ai', 'system'
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    external_id VARCHAR(255), -- WAME / Meta message ID
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'audio', 'video', 'document', 'interactive'
    media_url TEXT,
    delivery_status VARCHAR(50) DEFAULT 'sent', -- 'pending', 'sent', 'delivered', 'read', 'failed'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. INTERNAL NOTES (Team collaboration on conversations)
CREATE TABLE internal_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AI AGENTS CONFIGURATION
CREATE TABLE ai_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    name VARCHAR(100) DEFAULT 'Moonky AI',
    personality TEXT DEFAULT 'Helpful, concise, friendly, and strictly truthful enterprise customer support assistant.',
    instructions TEXT NOT NULL,
    confidence_threshold NUMERIC(3,2) DEFAULT 0.85,
    auto_reply_enabled BOOLEAN DEFAULT true,
    handoff_keywords TEXT[] DEFAULT ARRAY['human', 'agent', 'falar com atendente', 'pessoa', 'suporte humano', 'cancelamento', 'supervisor'],
    provider VARCHAR(50) DEFAULT 'gemini', -- 'gemini', 'openai', 'anthropic'
    model VARCHAR(100) DEFAULT 'gemini-1.5-pro',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AI KNOWLEDGE BASE
CREATE TABLE ai_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. AI LOGS (Token and conversation handoff tracking)
CREATE TABLE ai_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    prompt_tokens INT DEFAULT 0,
    completion_tokens INT DEFAULT 0,
    input_preview TEXT,
    output_preview TEXT,
    handoff_triggered BOOLEAN DEFAULT false,
    latency_ms INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. AUTOMATIONS
CREATE TABLE automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    trigger_type VARCHAR(100) NOT NULL, -- 'incoming_message', 'keyword', 'new_conversation', 'status_change', 'business_hours'
    trigger_config JSONB DEFAULT '{}'::jsonb,
    actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. AUTOMATION RULES (Conditions)
CREATE TABLE automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
    condition_type VARCHAR(100) NOT NULL, -- 'channel', 'keyword', 'time', 'tag', 'status'
    operator VARCHAR(50) NOT NULL, -- 'equals', 'contains', 'starts_with', 'in'
    condition_value TEXT NOT NULL,
    sort_order INT DEFAULT 0
);

-- 17. WEBHOOK EVENTS (Idempotency and Audit)
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES channels(id) ON DELETE SET NULL,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processed', 'failed'
    error_message TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. USAGE RECORDS (Metrics & Analytics)
CREATE TABLE usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    metric_type VARCHAR(100) NOT NULL, -- 'messages_sent', 'messages_received', 'ai_tokens', 'active_contacts'
    quantity INT NOT NULL DEFAULT 1,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. SUBSCRIPTIONS (Billing & Multi-tenancy preparation)
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL DEFAULT 'growth', -- 'starter', 'growth', 'scale', 'enterprise'
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'trialing', 'past_due', 'canceled'
    max_agents INT DEFAULT 5,
    max_channels INT DEFAULT 3,
    max_ai_tokens INT DEFAULT 500000,
    current_period_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- INDEXES FOR PERFORMANCE AND TENANT FILTERING
-- ====================================================================
CREATE INDEX idx_profiles_org ON profiles(organization_id);
CREATE INDEX idx_channels_org ON channels(organization_id);
CREATE INDEX idx_contacts_org ON contacts(organization_id);
CREATE INDEX idx_contacts_phone ON contacts(phone);
CREATE INDEX idx_contacts_ig ON contacts(instagram_username);
CREATE INDEX idx_conversations_org ON conversations(organization_id);
CREATE INDEX idx_conversations_channel ON conversations(channel_id);
CREATE INDEX idx_conversations_contact ON conversations(contact_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_last_msg ON conversations(last_message_at DESC);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_external_id ON messages(external_id);
CREATE INDEX idx_messages_created_at ON messages(created_at ASC);
CREATE INDEX idx_internal_notes_conv ON internal_notes(conversation_id);
CREATE INDEX idx_webhook_events_key ON webhook_events(idempotency_key);
CREATE INDEX idx_ai_logs_org ON ai_logs(organization_id);
CREATE INDEX idx_usage_records_org_metric ON usage_records(organization_id, metric_type);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Multi-tenant isolation ensuring organizations never see each other's data
-- ====================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's organization_id
CREATE OR REPLACE FUNCTION get_current_org_id()
RETURNS UUID AS $$
    SELECT organization_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Profiles: Users can see profiles in their own organization
CREATE POLICY "Profiles are viewable by org members"
    ON profiles FOR SELECT
    USING (organization_id = get_current_org_id() OR id = auth.uid());

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid());

-- Generic tenant isolation policy pattern for all tenant tables
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'channels', 'contacts', 'tags', 'conversations', 
        'messages', 'internal_notes', 'ai_agents', 'ai_knowledge', 
        'ai_logs', 'automations', 'webhook_events', 'usage_records', 'subscriptions'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('
            CREATE POLICY "%s_tenant_select" ON %I
                FOR SELECT USING (organization_id = get_current_org_id());
            CREATE POLICY "%s_tenant_insert" ON %I
                FOR INSERT WITH CHECK (organization_id = get_current_org_id());
            CREATE POLICY "%s_tenant_update" ON %I
                FOR UPDATE USING (organization_id = get_current_org_id());
            CREATE POLICY "%s_tenant_delete" ON %I
                FOR DELETE USING (organization_id = get_current_org_id());
        ', tbl, tbl, tbl, tbl, tbl, tbl, tbl, tbl);
    END LOOP;
END $$;
