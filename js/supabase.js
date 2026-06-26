// Supabase Configuration
// Replace these with your actual Supabase project credentials
const SUPABASE_URL = 'https://mvctykdtafvsugvcvyvw.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'sb_publishable_bcf3Ib6DaIwzjsKyaXuheA_u78wY5zB';

let supabaseClient = null;

function initSupabase() {
  if (typeof supabase !== 'undefined' && SUPABASE_URL !== 'https://YOUR_PROJECT.supabase.co') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    syncLocalToSupabase();
    return true;
  }
  return false;
}

function isSupabaseConfigured() {
  return supabaseClient !== null;
}

// Sync local rankings to Supabase when it becomes available
async function syncLocalToSupabase() {
  if (!isSupabaseConfigured()) return;

  const stored = JSON.parse(localStorage.getItem('tm_rankings') || '[]');
  if (stored.length === 0) return;

  const failed = [];
  for (const entry of stored) {
    try {
      const { error } = await supabaseClient
        .from('rankings')
        .insert({
          username: entry.username,
          subset: entry.subset,
          rankings: entry.rankings,
          created_at: entry.created_at,
        });
      if (error) throw error;
    } catch (err) {
      console.error('Failed to sync ranking:', err);
      failed.push(entry);
    }
  }

  // Keep only failed entries in localStorage
  localStorage.setItem('tm_rankings', JSON.stringify(failed));
  if (failed.length === 0) {
    console.log(`Synced ${stored.length} local rankings to Supabase.`);
  } else {
    console.log(`Synced ${stored.length - failed.length} rankings, ${failed.length} failed.`);
  }
}

// Save a user's ranking to the database
async function saveRanking(username, subset, rankings) {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Rankings saved locally only.');
    saveRankingLocal(username, subset, rankings);
    return { success: true, local: true };
  }

  try {
    const { data, error } = await supabaseClient
      .from('rankings')
      .insert({
        username: username,
        subset: subset,
        rankings: rankings,
      });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error saving ranking:', err);
    saveRankingLocal(username, subset, rankings);
    return { success: false, error: err.message, local: true };
  }
}

// Fetch all rankings (optionally filtered by subset)
async function fetchRankings(subset) {
  if (!isSupabaseConfigured()) {
    return { success: true, data: fetchRankingsLocal(subset), local: true };
  }

  try {
    let query = supabaseClient.from('rankings').select('*');
    if (subset && subset !== 'all') {
      query = query.eq('subset', subset);
    }
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error fetching rankings:', err);
    return { success: false, error: err.message, data: fetchRankingsLocal(subset) };
  }
}

// Local storage fallback
function saveRankingLocal(username, subset, rankings) {
  const stored = JSON.parse(localStorage.getItem('tm_rankings') || '[]');
  stored.push({
    id: Date.now().toString(),
    username,
    subset,
    rankings,
    created_at: new Date().toISOString()
  });
  localStorage.setItem('tm_rankings', JSON.stringify(stored));
}

function fetchRankingsLocal(subset) {
  const stored = JSON.parse(localStorage.getItem('tm_rankings') || '[]');
  if (subset && subset !== 'all') {
    return stored.filter(r => r.subset === subset);
  }
  return stored;
}
