// ─────────────────────────────────────────────────────────────────
// Cloudinary Upload Service
// Uses XMLHttpRequest (not fetch) so we get real upload progress events.
//
// Required env vars:
//   VITE_CLOUDINARY_CLOUD_NAME   – your Cloudinary cloud name
//   VITE_CLOUDINARY_UPLOAD_PRESET – unsigned upload preset name
// ─────────────────────────────────────────────────────────────────

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? 'fragverse_upload';

/**
 * Upload a file to Cloudinary.
 *
 * @param {File}     file         – the File object to upload
 * @param {Function} onProgress   – called with a number 0-100 during upload
 * @returns {Promise<object>}     – Cloudinary response JSON (includes secure_url, etc.)
 */
export const uploadToCloudinary = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    if (!CLOUD_NAME) {
      reject(new Error('Missing VITE_CLOUDINARY_CLOUD_NAME in .env'));
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();

    // ── Progress ────────────────────────────────────────────────────
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress(pct);
      }
    });

    // ── Done ────────────────────────────────────────────────────────
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } catch {
          reject(new Error('Invalid JSON response from Cloudinary.'));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err?.error?.message ?? `Upload failed (${xhr.status})`));
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`));
        }
      }
    });

    // ── Error / Abort ────────────────────────────────────────────────
    xhr.addEventListener('error', () => reject(new Error('Network error during upload.')));
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled.')));

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);
    xhr.send(formData);
  });
};

/**
 * Normalize a Cloudinary response into the same shape used by Unsplash photos.
 * This lets uploaded images be rendered by WallpaperCard without changes.
 *
 * @param {object} cloudinaryRes  – raw Cloudinary response
 * @param {string} category       – category selected by user in the upload modal
 * @returns {object}              – normalized wallpaper object
 */
export const normalizeCloudinaryPhoto = (cloudinaryRes, category = 'My Uploads') => {
  const { secure_url, public_id, width, height } = cloudinaryRes;

    const resolution = ''; // Removed

  return {
    id:          public_id,
    image:       secure_url,
    thumb:       secure_url,
    fullImage:   secure_url,
    title:       public_id.split('/').pop().replace(/_/g, ' '),
    author:      'You',
    authorImage: null,
    authorLink:  null,
    category,
    // Removed resolution
    likes:       0,
    downloads:   0,
    color:       '#1a1a2e',
    width,
    height,
    isUserUpload: true,
  };
};
