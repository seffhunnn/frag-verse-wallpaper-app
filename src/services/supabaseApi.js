import { supabase } from './supabase';

/**
 * Fetch all wallpapers from the "wallpapers" table.
 * 
 * @returns {Promise<Array>} List of wallpaper objects
 */
export const fetchSupabaseWallpapers = async () => {
  const { data, error } = await supabase
    .from('wallpapers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return [];
  }


  // Normalize to the internal wallpaper format
  return (data || []).map(item => ({
    id: item.id || Math.random().toString(36).substr(2, 9),
    image: item.image_url,
    thumb: item.image_url,
    fullImage: item.image_url,
    title: item.title || `Wallpaper by ${item.author}`,
    author: item.author || 'Anonymous',
    category: item.category || 'General',
    created_at: item.created_at,
    isSupabase: true,
    source: item.source || 'user',
    user_id: item.user_id
  }));
};

/**
 * Insert a new wallpaper into the "wallpapers" table.
 * 
 * @param {object} wallpaperData - { image_url, category, author, title, source, user_id }
 * @returns {Promise<object>} The inserted wallpaper if successful
 */
export const insertSupabaseWallpaper = async ({ image_url, category, author, title, source }) => {
  const { data, error } = await supabase
    .from('wallpapers')
    .insert([{ image_url, category, author, title, source }])
    .select();

  if (error) {
    throw error;
  }

  return data?.[0] || null;
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

