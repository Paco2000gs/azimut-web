-- Migration: Add Dossier Support Columns
-- Description: Adds columns to 'properties' table for dynamic dossier generation and document storage.

-- 1. Add new columns to 'properties' table
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT,
ADD COLUMN IF NOT EXISTS energy_rating TEXT,        -- 'A', 'B', 'C', etc.
ADD COLUMN IF NOT EXISTS energy_cert_url TEXT,      -- URL to the image/pdf of the cert
ADD COLUMN IF NOT EXISTS financial_info JSONB DEFAULT '{}'::jsonb, -- Store taxes, community fees, etc.
ADD COLUMN IF NOT EXISTS distances JSONB DEFAULT '{}'::jsonb,      -- Store pre-calculated distances
ADD COLUMN IF NOT EXISTS legal_docs JSONB DEFAULT '[]'::jsonb;     -- Store metadata of available docs

-- 2. Create 'documents' storage bucket (if not exists)
-- Note: This usually requires using the Storage API or Dashboard, but we can try inserting into storage.buckets if permissions allow.
-- Ideally, create this via the Supabase Dashboard: 'documents' (Private).

-- 3. Policy for 'documents' bucket
-- Allow authenticated users (Admins) to upload/delete/read
-- Allow public to READ only if we decide documents are public (Unlikely for private dossier).
-- For now, we assume Edge Function will generate a signed URL, so we keep it private.
