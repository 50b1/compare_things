# Things Comparison

A pairwise comparison tool that ranks items based on 1-vs-1 choices, with a predefined Taskmaster UK series ranking mode and community rankings.

## How to Run

1. Start a local HTTP server (Python 3 required):

   ```bash
   cd /path/to/compare_things
   python3 -m http.server 8080
   ```

2. Open your browser and go to `http://localhost:8080`

## Sections

### Taskmaster UK
- Select which series to include (Main Series 1-21, Champion of Champions 1-4, New Year's Treat 1-6)
- Rank the selected **series** against each other via pairwise comparison
- Each VS card shows the series name, year, and contestants (winner highlighted)
- Rankings are automatically saved after completion
- Enter a username before ranking to identify your submission

### Custom Compare
- Add items as text or images (single file or entire folder)
- Compare them 1 vs 1, get a ranked list
- Supports skip (tie) and undo

### Community Rankings
- View aggregated rankings from all users
- Filter by category: All (combined), Main Series, Champion of Champions, New Year's Treat
- "All" shows a single combined ranking across all submissions
- Category filters group rankings by the exact subset that was ranked

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

Without Supabase configured, rankings are stored in localStorage. When Supabase is later configured, locally stored rankings are automatically synced to the database on next page load.

## Adding Series Images

Place images in `images/series/` named by series ID, e.g.:
- `images/series/s01.jpg`
- `images/series/s05.jpg`
- `images/series/coc1.jpg`
- `images/series/nyt3.jpg`

The app gracefully hides the image element when no file is found.
