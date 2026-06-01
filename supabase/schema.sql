-- Fragverse Supabase Schema
-- Run this file inside Supabase SQL Editor

create extension if not exists "pgcrypto";

-- Main wallpapers table
create table if not exists public.wallpapers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  image_url text not null,
  category text not null default 'Other',
  author text not null default 'Unknown',
  title text not null,
  source text not null default 'user',
  description text,
  tags text[] default '{}',
  uploader_id text
);

-- Pending wallpapers for admin approval
create table if not exists public.pending_wallpapers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  image_url text not null,
  category text not null default 'Other',
  author text not null default 'Unknown',
  title text not null,
  source text not null default 'user',
  description text,
  tags text[] default '{}',
  uploader_id text
);

-- User favorites
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  wallpaper_id text not null,
  created_at timestamptz not null default now(),
  constraint unique_user_wallpaper_favorite
  unique (user_id, wallpaper_id)
);

-- Wallpapers indexes
create index if not exists idx_wallpapers_category
on public.wallpapers(category);

create index if not exists idx_wallpapers_created_at
on public.wallpapers(created_at desc);

create index if not exists idx_wallpapers_uploader_id
on public.wallpapers(uploader_id);

-- Pending wallpapers indexes
create index if not exists idx_pending_wallpapers_category
on public.pending_wallpapers(category);

create index if not exists idx_pending_wallpapers_created_at
on public.pending_wallpapers(created_at desc);

create index if not exists idx_pending_wallpapers_uploader_id
on public.pending_wallpapers(uploader_id);

-- Favorites indexes
create index if not exists idx_favorites_user_id
on public.favorites(user_id);

create index if not exists idx_favorites_wallpaper_id
on public.favorites(wallpaper_id);

create index if not exists idx_favorites_created_at
on public.favorites(created_at desc);

-- Optional RLS setup (disabled by default)
-- Uncomment later if needed

-- ALTER TABLE public.wallpapers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.pending_wallpapers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;