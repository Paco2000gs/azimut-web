-- Add price_on_demand column to properties table
ALTER TABLE public.properties ADD COLUMN price_on_demand boolean DEFAULT false;
