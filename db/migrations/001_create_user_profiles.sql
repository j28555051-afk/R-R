-- Migration: create user_profiles table
-- Run this in Supabase SQL editor to enable avatar syncing across devices

create table if not exists user_profiles (
  username text primary key,
  avatar_url text
);
