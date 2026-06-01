import { supabase } from './supabase';

/**
 * Fetch approved wallpapers from the "wallpapers" table with pagination.
 * 
 * @param {string|null} categoryOrQuery - Optional category filter or general search query
 * @param {number} page - Page number (1-indexed)
 * @param {number} pageSize - Number of items per page
 * @param {boolean} isStrictCategory - Whether to treat categoryOrQuery as a strict category
 * @returns {Promise<Array>} List of wallpaper objects
 */
export const fetchSupabaseWallpapers = async (categoryOrQuery = null, page = 1, pageSize = 20, isStrictCategory = true) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let query = supabase.from('wallpapers').select('*');
  
  if (categoryOrQuery) {
    const q = categoryOrQuery.trim();
    if (isStrictCategory) {
      query = query.ilike('category', q);
    } else {
      // General search across title, category, author, and description
      query = query.or(`title.ilike.%${q}%,category.ilike.%${q}%,author.ilike.%${q}%,description.ilike.%${q}%`);
    }
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .order('id', { ascending: false }) // Added secondary sort for stable pagination
    .range(start, end);

  if (error) {
    console.error("Supabase wallpapers fetch error:", error);
    return [];
  }

  return normalizeWallpapers(data || []);
};

// Helper function to normalize wallpapers data uniformly
const normalizeWallpapers = (list) => {
  return list.map(item => ({
    id: item.id || Math.random().toString(36).substr(2, 9),
    image: item.image_url,
    thumb: item.thumbnail_url || item.image_url,
    fullImage: item.image_url,
    title: item.title || "Untitled Wallpaper",
    author: item.author || 'Anonymous',
    category: item.category || 'General',
    created_at: item.created_at,
    isSupabase: true,
    source: item.source || 'user',
    user_id: item.uploader_id || item.user_id,
    description: item.description || '',
    tags: item.tags || [],
    status: 'approved'
  }));
};

/**
 * Insert a new wallpaper into the "wallpapers" table (with status set to 'pending').
 * 
 * @param {object} wallpaperData
 * @returns {Promise<object>} The inserted wallpaper metadata
 */
export const insertSupabaseWallpaper = async ({ 
  image_url, 
  category, 
  author, 
  title, 
  description, 
  tags,
  uploader_id
}) => {
  if (!image_url) {
    throw new Error("image_url is required for database insertion.");
  }
  if (!title || !title.trim()) {
    throw new Error("title is required for database insertion.");
  }

  const { data, error } = await supabase
    .from('pending_wallpapers')
    .insert([{ 
      image_url, 
      category: category || "General", 
      author: author || 'Anonymous', 
      title, 
      source: "user",
      description: description || "",
      tags: tags || [],
      uploader_id
    }])
    .select();

  if (error) {
    console.error("Supabase insert error:", error);
    throw error;
  }

  return data?.[0] || null;
};

/**
 * Fetch all pending wallpapers for moderation (status is pending or null).
 * 
 * @returns {Promise<Array>} List of pending wallpaper objects
 */
export const fetchPendingSupabaseWallpapers = async () => {
  const { data, error } = await supabase
    .from('pending_wallpapers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Supabase pending fetch error:", error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    image: item.image_url,
    thumb: item.image_url,
    fullImage: item.image_url,
    title: item.title || 'Untitled Wallpaper',
    author: item.author || 'Anonymous',
    category: item.category || 'General',
    created_at: item.created_at,
    isSupabase: true,
    source: item.source || 'user',
    description: item.description || '',
    tags: item.tags || [],
    status: 'pending',
    user_id: item.uploader_id
  }));
};

/**
 * Approve a wallpaper by ID.
 * 
 * @param {string|number} id
 * @returns {Promise<object>} The inserted wallpaper record
 */
export const approveSupabaseWallpaper = async (id) => {
  // Step 0: Fetch the pending wallpaper by ID first to get its full metadata
  const { data: pendingData, error: fetchError } = await supabase
    .from('pending_wallpapers')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !pendingData) {
    console.error("Failed to fetch pending wallpaper details:", fetchError);
    throw fetchError || new Error("Pending wallpaper details not found.");
  }

  // Step 1: Insert into wallpapers, copying uploader_id
  const { data, error: insertError } = await supabase
    .from('wallpapers')
    .insert([{
      image_url: pendingData.image_url,
      category: pendingData.category,
      author: pendingData.author,
      title: pendingData.title,
      source: pendingData.source || 'user',
      description: pendingData.description || '',
      tags: pendingData.tags || [],
      uploader_id: pendingData.uploader_id
    }])
    .select();

  if (insertError) {
    console.error("Supabase approve insert error:", insertError);
    throw insertError;
  }

  // Step 2: Delete from pending_wallpapers
  const { error: deleteError } = await supabase
    .from('pending_wallpapers')
    .delete()
    .eq('id', id);

  if (deleteError) {
    console.error("Supabase approve delete error:", deleteError);
    // Rollback insert to prevent orphan/inconsistent records
    if (data && data[0] && data[0].id) {
      await supabase
        .from('wallpapers')
        .delete()
        .eq('id', data[0].id);
    }
    throw deleteError;
  }

  return data?.[0] || null;
};

/**
 * Reject a wallpaper by ID (updating status to 'rejected' in pending_wallpapers).
 * 
 * @param {string|number} id
 * @returns {Promise<boolean>} True if successful
 */
export const rejectSupabaseWallpaper = async (id) => {
  const { error } = await supabase
    .from('pending_wallpapers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Supabase reject delete error:", error);
    throw error;
  }

  return true;
};

/**
 * Delete a wallpaper from the "wallpapers" table by ID.
 * 
 * @param {string|number} id - The ID of the wallpaper to delete
 * @returns {Promise<boolean>} True if successful
 */
export const deleteSupabaseWallpaper = async (id) => {
  const { error } = await supabase
    .from('wallpapers')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  return true;
};

/**
 * Fetch all wallpapers uploaded by the current user (both pending/rejected and approved).
 * 
 * @param {string} uid - The Firebase User ID (uploader_id)
 * @returns {Promise<Array>} Combined list of user's wallpapers with status normalization
 */
export const fetchUserWallpapers = async (uid) => {
  if (!uid) return [];

  // Fetch pending/rejected wallpapers
  const { data: pendingData, error: pendingError } = await supabase
    .from('pending_wallpapers')
    .select('*')
    .eq('uploader_id', uid)
    .order('created_at', { ascending: false });

  if (pendingError) {
    console.error("Error fetching user pending wallpapers:", pendingError);
  }

  // Fetch approved wallpapers
  const { data: approvedData, error: approvedError } = await supabase
    .from('wallpapers')
    .select('*')
    .eq('uploader_id', uid)
    .order('created_at', { ascending: false });

  if (approvedError) {
    console.error("Error fetching user approved wallpapers:", approvedError);
  }

  const normalizedPending = (pendingData || []).map(item => ({
    id: item.id,
    image: item.image_url,
    thumb: item.image_url,
    fullImage: item.image_url,
    title: item.title || 'Untitled Wallpaper',
    author: item.author || 'Anonymous',
    category: item.category || 'General',
    created_at: item.created_at,
    isSupabase: true,
    source: item.source || 'user',
    uploader_id: item.uploader_id,
    description: item.description || '',
    tags: item.tags || [],
    status: 'pending'
  }));

  const normalizedApproved = (approvedData || []).map(item => ({
    id: item.id,
    image: item.image_url,
    thumb: item.thumbnail_url || item.image_url,
    fullImage: item.image_url,
    title: item.title || 'Untitled Wallpaper',
    author: item.author || 'Anonymous',
    category: item.category || 'General',
    created_at: item.created_at,
    isSupabase: true,
    source: item.source || 'user',
    uploader_id: item.uploader_id,
    description: item.description || '',
    tags: item.tags || [],
    status: 'approved'
  }));

  // Combine both cleanly, sorting by created_at descending
  const combined = [...normalizedPending, ...normalizedApproved];
  combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return combined;
};

/**
 * Delete a user's wallpaper (supports both owner deletion and admin override).
 * 
 * @param {string} id - The wallpaper ID
 * @param {string} status - The current status ('pending' | 'approved' | 'rejected')
 * @param {string} currentUserUid - The current user's UID
 * @param {boolean} isAdmin - Whether the current user is an admin
 * @returns {Promise<boolean>} True if successful
 */
export const deleteUserOrAdminWallpaper = async (id, status, currentUserUid, isAdmin) => {
  const isPendingOrRejected = status === 'pending' || status === 'rejected';
  const table = isPendingOrRejected ? 'pending_wallpapers' : 'wallpapers';

  let query = supabase.from(table).delete().eq('id', id);

  // If not admin, restrict by uploader_id to enforce ownership
  if (!isAdmin) {
    query = query.eq('uploader_id', currentUserUid);
  }

  const { error } = await query;
  if (error) {
    console.error("Deletion failed:", error);
    throw error;
  }
  return true;
};

/**
 * Permanently delete a pending wallpaper by ID.
 * 
 * @param {string|number} id
 * @returns {Promise<boolean>} True if successful
 */
export const deleteSupabasePendingWallpaper = async (id) => {
  const { error } = await supabase
    .from('pending_wallpapers')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  return true;
};
