-- ====================================================================
-- MOONKY SUPABASE FIX & SEED: LIBERAÇÃO DE PERMISSÕES E DADOS REAIS
-- Execute este script no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/awsmysjmittjvgpbopay/sql
-- ====================================================================

-- 1. DESATIVAÇÃO DE RLS PARA PERMITIR GRAVAÇÃO REAL DE MENSAGENS, ÁUDIO, FOTO E DOCS
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE internal_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_knowledge DISABLE ROW LEVEL SECURITY;
ALTER TABLE automations DISABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records DISABLE ROW LEVEL SECURITY;

-- 2. POLÍTICAS DE ACESSO TOTAL PARA CHAVE PÚBLICA / ANON
DROP POLICY IF EXISTS "Public full access messages" ON messages;
CREATE POLICY "Public full access messages" ON messages FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access conversations" ON conversations;
CREATE POLICY "Public full access conversations" ON conversations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access contacts" ON contacts;
CREATE POLICY "Public full access contacts" ON contacts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access channels" ON channels;
CREATE POLICY "Public full access channels" ON channels FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access organizations" ON organizations;
CREATE POLICY "Public full access organizations" ON organizations FOR ALL USING (true) WITH CHECK (true);

-- 3. ORGANIZAÇÃO PRINCIPAL MOONKY
INSERT INTO organizations (id, name, slug, plan)
VALUES (
    '11111111-1111-4111-8111-111111111111',
    'Moonky Technologies',
    'moonky-tech',
    'growth'
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, plan = EXCLUDED.plan;

-- 4. CANAIS OFICIAIS (WHATSAPP E INSTAGRAM)
INSERT INTO channels (id, organization_id, name, type, provider, is_official, phone_number, instagram_username, status)
VALUES 
(
    '22222222-2222-4222-8222-222222222222',
    '11111111-1111-4111-8111-111111111111',
    'WhatsApp Oficial',
    'whatsapp',
    'wame',
    true,
    '+55 11 98877-6655',
    NULL,
    'connected'
),
(
    '33333333-3333-4333-8333-333333333333',
    '11111111-1111-4111-8111-111111111111',
    'Instagram Direct Oficial',
    'instagram',
    'wame',
    true,
    NULL,
    'moonky.enterprise',
    'connected'
)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;

-- 5. CONTATOS INDIVIDUAIS REAIS
INSERT INTO contacts (id, organization_id, name, phone, instagram_username, email, lead_status)
VALUES 
(
    '44444444-4444-4444-8444-444444444441',
    '11111111-1111-4111-8111-111111111111',
    'Mariana Silva',
    '+55 11 98877-1122',
    'mariana.silva',
    'mariana.silva@gmail.com',
    'customer'
),
(
    '44444444-4444-4444-8444-444444444442',
    '11111111-1111-4111-8111-111111111111',
    'Darya Santos',
    '+55 11 99123-4567',
    'darya.santos',
    'darya.santos@gmail.com',
    'customer'
),
(
    '44444444-4444-4444-8444-444444444443',
    '11111111-1111-4111-8111-111111111111',
    'Omid Ferreira',
    '+55 21 98888-2233',
    'omid.ferreira',
    'omid.ferreira@empresa.com.br',
    'qualified'
),
(
    '44444444-4444-4444-8444-444444444444',
    '11111111-1111-4111-8111-111111111111',
    'Carlos Eduardo',
    '+55 11 97766-5544',
    'carlos.edu',
    'carlos.eduardo@gmail.com',
    'customer'
),
(
    '44444444-4444-4444-8444-444444444445',
    '11111111-1111-4111-8111-111111111111',
    'Sanaz Souza',
    '+55 31 99876-5432',
    'sanaz_souza',
    'sanaz.souza@yahoo.com',
    'lead'
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone;

-- 6. CONVERSAS INDIVIDUAIS
INSERT INTO conversations (id, organization_id, channel_id, contact_id, status, priority, ai_enabled, ai_status, last_message_preview)
VALUES
(
    '55555555-5555-4555-8555-555555555551',
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    '44444444-4444-4444-8444-444444444441',
    'open',
    'high',
    true,
    'active',
    '🎙 Mensagem de voz gravada'
),
(
    '55555555-5555-4555-8555-555555555552',
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    '44444444-4444-4444-8444-444444444442',
    'open',
    'medium',
    true,
    'active',
    '📄 Tabela_Precos_Moonky_2026.pdf'
),
(
    '55555555-5555-4555-8555-555555555553',
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    '44444444-4444-4444-8444-444444444443',
    'open',
    'high',
    true,
    'active',
    '🎙 Mensagem de voz'
),
(
    '55555555-5555-4555-8555-555555555554',
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    '44444444-4444-4444-8444-444444444444',
    'open',
    'medium',
    true,
    'active',
    'Perfeito Carlos! Pagamento confirmado.'
),
(
    '55555555-5555-4555-8555-555555555555',
    '11111111-1111-4111-8111-111111111111',
    '33333333-3333-4333-8333-333333333333',
    '44444444-4444-4444-8444-444444444445',
    'pending',
    'high',
    false,
    'paused',
    'Oi! Queria saber se o teste grátis ainda está ativo.'
)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;
