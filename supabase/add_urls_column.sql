-- Add urls column to renovations (run this in Supabase SQL editor)
alter table renovations add column if not exists urls text[] default '{}';
