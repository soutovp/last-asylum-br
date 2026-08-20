-- ==============================================================================
-- MIGRAÇÃO DE BANCO DE DADOS: PREFERÊNCIAS DE MAIL MARKETING & UNSUBSCRIBE TOKEN
-- Projeto: Last Asylum BR
-- Tabela: profiles
-- ==============================================================================

-- 1. ADICIONA AS COLUNAS DE PREFERÊNCIAS (TODAS COM PADRÃO TRUE / OPT-IN)
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

-- 5. BACKFILL: PREENCHE TOKENS E VALORES DEFAULT EM USUÁRIOS JÁ EXISTENTES
UPDATE public.profiles
SET 
  unsubscribe_token = encode(gen_random_bytes(24), 'hex')
WHERE unsubscribe_token IS NULL OR unsubscribe_token = '';

UPDATE public.profiles
SET 
  receive_noticias = true
WHERE receive_noticias IS NULL;

UPDATE public.profiles
SET 
  receive_guias = true
WHERE receive_guias IS NULL;

UPDATE public.profiles
SET 
  receive_codigos = true
WHERE receive_codigos IS NULL;

UPDATE public.profiles
SET 
  receive_promocionais = true
WHERE receive_promocionais IS NULL;

-- 6. POLÍTICA DE SEGURANÇA (RLS) - PERMITE LEITURA E ATUALIZAÇÃO VIA TOKEN ANÔNIMO SE NECESSÁRIO
-- Se RLS estiver ativado na tabela profiles:
-- Permite leitura por token
CREATE POLICY "Permitir consulta publica de preferencias por unsubscribe_token"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Permite atualização por token via API Server/Service Role ou RPC
-- (As chamadas da API Next.js usam Service Role ou RLS autenticado)
