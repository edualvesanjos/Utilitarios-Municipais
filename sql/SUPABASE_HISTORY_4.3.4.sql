-- Script Supabase v4.3.4 - Sincronização e Idempotência
-- Garante a chave primária 'id' para evitar registros duplicados em inserções paralelas.

CREATE TABLE IF NOT EXISTS public.historicos_modulos (
    id TEXT PRIMARY KEY,
    modulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índice para acelerar busca por módulo
CREATE INDEX IF NOT EXISTS idx_historicos_modulo ON public.historicos_modulos (modulo);
