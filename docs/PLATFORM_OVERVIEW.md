# FragVerse Platform Overview

This document outlines the FragVerse user experience, design system, interactive workflows, and platform identity from a product and UX perspective.

---

## 1. What FragVerse Is

FragVerse is a design-first, high-performance wallpaper discovery and community platform. It acts as a visual museum for landscape and desktop wallpapers, merging high-quality photography from the Unsplash editorial community with custom digital art and designs submitted by users.

### Core Value Pillars
*   **Immersive Discovery**: Presenting wallpapers in clean, responsive masonry grids that eliminate distracting UI elements.
*   **Community Curation**: Empowering users to upload their own wallpapers, review and approve submissions through admin moderation, and curate personal collections.
*   **Visual Fluidity**: Providing premium, responsive themes (light and dark modes) with glassmorphic cards, smooth transitions, and stable scrolling.

---

## 2. Main User Experience

Users navigate FragVerse using an interactive sidebar or sliding mobile drawer. The platform contains several key pages and discovery feeds:

### Home Page Feed
*   **Hero Slideshow**: An aesthetic header featuring slow-fade transitions of curated wallpapers.
*   **Infinite Scrolling Grid**: A blended feed showcasing professional Unsplash photographs interspersed with approved community submissions. The scroll behavior is infinite, loading additional content automatically.

### Explore Feed
*   **Sticky Search Bar**: An input field supporting real-time searches and keyboard short-cuts (`Ctrl+K`).
*   **Mood Strip**: A horizontal list of pre-configured emotional categories (e.g. Cozy ☕, Dreamy 🌙, Cyberpunk ⚡, Minimal ◻️) for quick discovery.
*   **Load More Grid**: Explore feeds are paginated using a "Load More" button to avoid scrolling fatigue and maintain network efficiency.

### Categories Discovery
*   **Thematic Sections**: Categorized sections (Featured, Trending moods, Moods, Popular aesthetics) that group wallpapers by visual theme (e.g., Study, Calm, Productivity, Purple Aesthetic).
*   **Grid Previews**: Each category card displays a composite preview of three matching wallpapers, dynamically selected from the feed.

### Community Submissions Portal
*   **Upload Modal**: A drag-and-drop file uploader that accepts multiple formats (including HEIC). Users can categorize their wallpaper, add a title, input a description, and specify custom tags.
*   **Ownership Management**: A dedicated "My Uploads" section allows users to view their submissions and monitor approval statuses (*Pending*, *Approved*, or *Rejected*).

### Favorites Feed
*   **Personal Collection**: Registered users can heart wallpapers to add them to their personal library.
*   **Automatic Syncing**: The favorites page automatically syncs with Supabase, fetching any missing card metadata in the background.

---

## 3. UI Design Philosophy

FragVerse is built with a strong focus on aesthetics. The visual theme centers on a clean, modern look:

```text
  Minimalist Layout
  ──────────────────
  [Sidebar / Drawer] ──> [Hero Carousel] ──> [Masonry Grid] ──> [Fullscreen Details]
```

### Design Principles
*   **Glassmorphism**: Elements like headers, modals, and sidebar backgrounds utilize heavy backdrop blurs (`backdrop-filter: blur(12px)`) combined with subtle, high-contrast borders.
*   **Responsive Masonry**: Adaptive grid layouts dynamically adjust column counts (from 1 to 5) based on screen width. Clamped aspect ratios prevent layout shifts when switching views.
*   **Light/Dark Sync**: Colors are bound to CSS variables. In dark mode, backgrounds shift to deep violet-blacks (`#0e0e15`) with semi-transparent surfaces, while light mode features soft slate-greys.
*   **Hover States**: Wallpapers expand slightly on hover, revealing a clean overlay with a download button, a heart icon, and a fullscreen zoom shortcut.

---

## 4. Community Features

FragVerse balances open sharing with quality control:

1.  **Auth Integration**: Firebase Google sign-in is required to upload files or like wallpapers.
2.  **Upload Quarantine**: Uploaded files do not appear in public feeds immediately. They are stored in a `pending_wallpapers` queue.
3.  **Feed Blending**: Once approved, user-uploaded wallpapers are labeled with a purple `FragVerse` badge, distinguishing them from the dark-grey `Unsplash` badges in public feeds.

---

## 5. Admin Experience

Administrators play a crucial role in maintaining FragVerse's high quality standards. When logged in under the authorized admin email, they gain access to a specialized suite of controls:

*   **Pending Submissions Queue**: Displays a real-time badge count of outstanding submissions.
*   **Review Dashboard**: Admins can inspect previews, view full-resolution files, read descriptions, and validate tag structures.
*   **Actionable Moderation**:
    *   **Approve**: Transfers the record to the public feed and removes it from the pending table.
    *   **Reject**: Deletes the submission from the pending table.
    *   **Admin Delete**: Admins can delete any approved wallpaper directly from the main feed.

---

## 6. Performance Philosophy

*   **Render Optimization**: Main components like grids and cards are memoized to minimize unnecessary re-renders during background sync operations.
*   **Layout Stability**: Fixed container boundaries prevent layout shifts during image loading.
*   **Dynamic Image Delivery**: Images uploaded via Cloudinary utilize dynamic URL transformations to adapt format and quality dynamically for web delivery.

---

## 7. Platform Identity

*   **Modern**: Glassmorphic styling, rounded cards, and smooth animations create a premium visual experience.
*   **Community-Driven**: Relies on user uploads and persistent collections to foster active community participation.
*   **Immersive**: Clean card hover overlays keep the focus entirely on the wallpapers.
*   **Aesthetic-Focused**: Emphasizes landscape dimensions, color tones, and layout harmony.
*   **Contributor-Friendly**: Clean documentation, structured APIs, and isolated state components make it easy for contributors to build new features.
