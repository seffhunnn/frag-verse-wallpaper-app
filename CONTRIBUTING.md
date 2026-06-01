# Contributing to FragVerse

Thank you for your interest in contributing to **FragVerse**! 

FragVerse is a design-first, high-performance wallpaper discovery platform. To maintain a clean, stable, and fast application, please read and follow these contribution guidelines.

---

## 🛠️ Local Development Setup

To set up the project locally:

1. **Fork the repository** on GitHub and clone your fork:
   ```bash
   git clone https://github.com/your-username/frag-verse-wallpaper-app.git
   cd frag-verse-wallpaper-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory by copying the template:
   ```bash
   cp .env.example .env
   ```
   Add valid developer keys for the APIs. Check [README.md](README.md) for variable definitions.

4. **Start the dev server:**
   ```bash
   npm run dev
   ```
   Your app will start running on [http://localhost:5173](http://localhost:5173).

---

## 🗄️ Database & Schema Integration Guidelines

FragVerse uses a dual-table structure in Supabase to separate live community wallpapers from items undergoing moderation review:

- **`pending_wallpapers`**: Stores submissions uploaded by users. Images are hosted on Cloudinary, and metadata (Uploader ID, Category, Title, Tags, Description) is stored here with a status of `pending`.
- **`wallpapers`**: Stores approved public wallpapers. Once an admin approves a wallpaper in the dashboard, the entry is copied here, and deleted from `pending_wallpapers`.
- **`favorites`**: Connects `user_id` and `wallpaper_id` to persist user likes.

When modifying code that interacts with these tables:
* Ensure all database calls are consolidated in [supabaseApi.js](src/services/supabaseApi.js).
* Always handle unique constraints gracefully (e.g., catching code `23505` when adding duplicate favorites).
* Keep properties normalized using `normalizeWallpapers` before feeding them to UI state.

---

## 🎨 UI & UX Design Policy

FragVerse places premium visual quality at its core. When modifying or introducing UI elements:
- **Design Tokens**: Do not use arbitrary colors or paddings. Use CSS design tokens defined in [index.css](src/index.css) (e.g., `var(--bg)`, `var(--surface)`, `var(--accent)`, `var(--radius-card)`).
- **Light/Dark Synchrony**: Every component must look stunning in both light and dark themes. Verify contrast and visual hierarchy when shifting states.
- **Masonry Layout**: Do not modify masonry grids or height calculations without validating column distribution. Ensure items have fallback aspect ratios and sizes to prevent layout shifts.

---

## ⚡ Performance Preservation

- **Avoid Re-renders**: Wrap static buttons, cards, and grid sections in `React.memo` or use `useMemo`/`useCallback` hooks where state updates are frequent.
- **Stable Intersection Observers**: Infinite scrolling observers must remain stable and utilize `useRef` loading gates. Never alter observer callbacks to trigger infinite fetch loops.
- **No Junk Logs**: Do not push code containing `console.log` or `console.debug` statements. All print lines should be cleaned before building.

---

## 🌿 Contribution Git Workflow

### 1. Branch Naming Conventions
Create a branch from `main` using these naming rules:
- `feat/feature-name` (e.g., `feat/google-analytics`)
- `fix/bug-fix-name` (e.g., `fix/mobile-grid-leak`)
- `docs/documentation-update` (e.g., `docs/contributing-edit`)
- `refactor/clean-components` (e.g., `refactor/sidebar-cleanup`)

### 2. Commit Message Guidelines
Make commits clear and concise:
- `feat: add tag filtering in search palette`
- `fix: correct backdrop blur overlap on mobile aside`
- `docs: update setup guidelines`

### 3. Pull Request Checklist
When submitting a Pull Request:
- [ ] Provide a clear summary of what changed.
- [ ] Add screenshots or recordings if the PR modifies the UI.
- [ ] Run `npm run build` locally and ensure it completes with zero errors.
- [ ] Make sure unused imports and debugging `console.log` statements are fully removed.

---

Thank you for helping keep FragVerse stable, fast, and beautiful!
