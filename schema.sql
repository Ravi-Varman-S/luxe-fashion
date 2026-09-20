-- Supabase SQL Schema for Fashion Website
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Wardrobe items table
CREATE TABLE IF NOT EXISTS wardrobe_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('top', 'bottom', 'dress', 'shoes', 'accessory', 'outerwear')),
  color TEXT NOT NULL,
  image_url TEXT NOT NULL,
  season TEXT[] DEFAULT ARRAY['all'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User photos table (full body photos for virtual try-on)
CREATE TABLE IF NOT EXISTS user_photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  body_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outfit combinations table
CREATE TABLE IF NOT EXISTS outfit_combinations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  photo_url TEXT,
  occasion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_wardrobe_user_id ON wardrobe_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_photos_user_id ON user_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_outfit_combinations_user_id ON outfit_combinations(user_id);

-- Storage buckets (run these in Supabase Dashboard > Storage)
-- 1. Create bucket: wardrobe-images (public)
-- 2. Create bucket: user-photos (public)
-- 3. Create bucket: outfit-images (public)

-- Row Level Security policies
ALTER TABLE wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_combinations ENABLE ROW LEVEL SECURITY;

-- Policies for wardrobe_items
CREATE POLICY "Users can view own wardrobe items" ON wardrobe_items
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own wardrobe items" ON wardrobe_items
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own wardrobe items" ON wardrobe_items
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own wardrobe items" ON wardrobe_items
  FOR DELETE USING (auth.uid()::text = user_id);

-- Policies for user_photos
CREATE POLICY "Users can view own photos" ON user_photos
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own photos" ON user_photos
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own photos" ON user_photos
  FOR DELETE USING (auth.uid()::text = user_id);

-- Policies for outfit_combinations
CREATE POLICY "Users can view own combinations" ON outfit_combinations
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own combinations" ON outfit_combinations
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own combinations" ON outfit_combinations
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own combinations" ON outfit_combinations
  FOR DELETE USING (auth.uid()::text = user_id);
