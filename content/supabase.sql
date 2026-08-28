create table if not exists public.site_content (
  key text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

-- No public policies are required. The Vercel server functions use the
-- Supabase service-role key, which must never be exposed to browser code.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'codecrafts-media',
  'codecrafts-media',
  true,
  3145728,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
