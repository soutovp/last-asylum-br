-- ==============================================================================
-- MIGRAÇÃO DE BANCO DE DADOS: PREFERÊNCIAS DE MAIL MARKETING & ANALYTICS
-- Projeto: Last Asylum BR
-- ==============================================================================

-- 1. ADICIONA AS COLUNAS DE PREFERÊNCIAS NA TABELA PROFILES (OPT-IN POR PADRÃO)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS receive_noticias BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS receive_guias BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS receive_codigos BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS receive_promocionais BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS unsubscribe_token TEXT;

-- 2. CRIA ÍNDICE ÚNICO PARA O TOKEN DE UNSUBSCRIBE
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_unsubscribe_token 
  ON public.profiles (unsubscribe_token) 
  WHERE unsubscribe_token IS NOT NULL;

-- 3. FUNÇÃO AUXILIAR PARA GERAR TOKEN CRIPTOGRÁFICO ÚNICO SE NÃO FORNECIDO
CREATE OR REPLACE FUNCTION generate_unique_unsubscribe_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unsubscribe_token IS NULL OR NEW.unsubscribe_token = '' THEN
    NEW.unsubscribe_token := encode(gen_random_bytes(24), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. TRIGGER PARA GERAR AUTOMATICAMENTE O TOKEN NO CADASTRO DE NOVOS USUÁRIOS
DROP TRIGGER IF EXISTS trigger_generate_unsubscribe_token ON public.profiles;
CREATE TRIGGER trigger_generate_unsubscribe_token
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_unique_unsubscribe_token();

-- 5. BACKFILL DE TOKENS E PREFERÊNCIAS PARA USUÁRIOS EXISTENTES
UPDATE public.profiles
SET unsubscribe_token = encode(gen_random_bytes(24), 'hex')
WHERE unsubscribe_token IS NULL OR unsubscribe_token = '';

UPDATE public.profiles SET receive_noticias = true WHERE receive_noticias IS NULL;
UPDATE public.profiles SET receive_guias = true WHERE receive_guias IS NULL;
UPDATE public.profiles SET receive_codigos = true WHERE receive_codigos IS NULL;
UPDATE public.profiles SET receive_promocionais = true WHERE receive_promocionais IS NULL;

-- ==============================================================================
-- 6. TABELA DE ANALYTICS & EVENTOS DE COMPORTAMENTO DO USUÁRIO
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,                  -- 'link_click' | 'code_copy' | 'guide_view'
  url TEXT,                                  -- URL do link clicado ou da página
  label TEXT NOT NULL,                       -- Nome legível (ex: "Recarga Oficial Web Shop", "Código HERO2026")
  category TEXT NOT NULL DEFAULT 'geral',   -- 'canais_oficiais' | 'parceiros' | 'codigos' | 'guias' | 'redes'
  page_location TEXT,                        -- Onde ocorreu o evento (ex: "footer", "/guias/iniciante")
  metadata JSONB DEFAULT '{}'::jsonb,        -- Informações adicionais flexíveis
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ÍNDICES PARA ALTA PERFORMANCE DE LEITURA E AGREGAÇÃO NO PAINEL ADMIN
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events (event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_category ON public.analytics_events (category);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_label ON public.analytics_events (label);

-- POLÍTICA DE SEGURANÇA (RLS) PARA ANALYTICS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Permite inserção anônima pública para registro não-bloqueante de eventos
CREATE POLICY "Permitir insercao anonima de eventos de analytics"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (true);

-- Permite leitura de métricas por todos ou por administradores
CREATE POLICY "Permitir leitura de eventos de analytics"
  ON public.analytics_events
  FOR SELECT
  USING (true);
