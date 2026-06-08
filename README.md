# R & R — Our Private Space 💕

A password-protected private memory website for Rahim and Rugiatu.

---

## 🚀 Running Locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

---

## 🛠 Supabase Setup (Required for real data)

### Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (free).
2. Click **New Project**, give it a name (e.g. `r-and-r`), set a DB password, choose a region close to you.
3. Wait ~1 minute for the project to be ready.

### Step 2 — Create the database tables

Go to your Supabase dashboard → **SQL Editor** → click **New Query**, paste and run each block:

#### Table 1: `media_items`
```sql
create table media_items (
  id uuid primary key default gen_random_uuid(),
  file_type text not null,
  file_url text,
  caption text,
  uploader text not null,
  created_at timestamptz default now()
);

alter table media_items enable row level security;
create policy "Allow all" on media_items for all using (true) with check (true);
```

#### Table 2: `media_interactions`
```sql
create table media_interactions (
  id uuid primary key default gen_random_uuid(),
  media_id uuid references media_items(id) on delete cascade,
  user_name text not null,
  interaction_type text not null,
  comment_text text,
  created_at timestamptz default now()
);

create index on media_interactions(media_id);

alter table media_interactions enable row level security;
create policy "Allow all" on media_interactions for all using (true) with check (true);
```

#### Table 3: `user_views`
```sql
create table user_views (
  id uuid primary key default gen_random_uuid(),
  media_id uuid references media_items(id) on delete cascade,
  user_name text not null,
  created_at timestamptz default now()
);

create index on user_views(media_id);

alter table user_views enable row level security;
create policy "Allow all" on user_views for all using (true) with check (true);
```

#### Table 4: `updates`
```sql
create table updates (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  content text not null,
  created_at timestamptz default now()
);

alter table updates enable row level security;
create policy "Allow all" on updates for all using (true) with check (true);
```

### Step 3 — Create a Storage bucket for photos & videos

1. In your Supabase dashboard go to **Storage** → **New Bucket**.
2. Name it exactly: `memories`
3. Check **Public bucket** ✅
4. Click **Create bucket**.
5. Go to **Storage → Policies** → Add a policy on the `memories` bucket:
   - **For SELECT**: Allow for everyone (`true`)
   - **For INSERT**: Allow for everyone (`true`)

Or run this SQL:
```sql
create policy "Public read memories"
  on storage.objects for select using (bucket_id = 'memories');

create policy "Public upload memories"
  on storage.objects for insert with check (bucket_id = 'memories');
```

### Step 4 — Get your API keys

1. In your Supabase dashboard go to **Settings → API**.
2. Copy your **Project URL** and **anon/public key**.

### Step 5 — Add keys to `.env`

Edit the `.env` file in this project:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Then restart the dev server: `npm run dev`

---

## 🌐 Deploying to Vercel / Netlify

### Vercel
```bash
npm install -g vercel
vercel --prod
```
When prompted, add your env variables in the Vercel dashboard under **Settings → Environment Variables**.

### Netlify
1. Push to GitHub.
2. Connect repo in Netlify.
3. Add env variables in **Site Settings → Environment Variables**.
4. Build command: `npm run build`, Publish dir: `dist`.

---

## 🔐 Password

The site password is: **memories2024**

After entering the password, choose **Rahim** or **Rugiatu** — your view is personalised.

---

## 💕 Features

- Password gate with user selection
- Personalized gallery (you see what the other person uploads for you)
- Photo & video uploads via Supabase Storage
- Private text notes
- Like & comment on memories
- View tracking (see when your photos are seen)
- Filters: All / New / With Notes / Photos / Videos
- Private updates timeline (like a shared diary)
- Our Story page
- Mobile responsive
- Dust rose theme throughout
