# Things Comparison

A pairwise comparison tool that ranks items based on 1-vs-1 choices, with a predefined Taskmaster UK ranking mode and community rankings.

## How to Run

1. Start a local HTTP server (Python 3 required):

   ```bash
   cd /path/to/compare_things
   python3 -m http.server 8080
   ```

2. Open your browser and go to `http://localhost:8080`

## Sections

### Taskmaster UK
- Select series subsets (Main Series 1-21, Champion of Champions, New Year's Treat)
- Rank contestants from selected series via pairwise comparison
- Save your ranking to the community database

### Custom Compare
- Add items as text or images
- Compare them 1 vs 1, get a ranked list

### Community Rankings
- View aggregated rankings from all users
- See average ELO scores across all submissions

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run this SQL in the SQL Editor:

   ```sql
   create table rankings (
     id uuid default gen_random_uuid() primary key,
     username text not null,
     subset text not null,
     rankings jsonb not null,
     created_at timestamptz default now()
   );

   alter table rankings enable row level security;
   create policy "Anyone can insert" on rankings for insert with check (true);
   create policy "Anyone can read" on rankings for select using (true);
   ```

3. Edit `js/supabase.js` and replace `SUPABASE_URL` and `SUPABASE_ANON_KEY` with your credentials.

Without Supabase configured, rankings are stored in localStorage as a fallback.

## Adding Contestant Images

Place images in `images/contestants/` named by contestant ID, e.g.:
- `images/contestants/s01_frank_skinner.jpg`
- `images/contestants/s05_bob_mortimer.jpg`

The app shows initials as avatars when images aren't available.
