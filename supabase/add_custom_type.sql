-- Add custom_type column for "Overig" renovations
alter table renovations add column if not exists custom_type text;
