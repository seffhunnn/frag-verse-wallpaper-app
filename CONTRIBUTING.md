# Contributing to FragVerse

Thank you for your interest in contributing to **FragVerse**.

FragVerse is a modern wallpaper platform focused on aesthetics, performance, and a smooth browsing experience. This guide will help you contribute in a clean and consistent way.

## Before You Start

* Check existing issues before opening a new one
* For larger UI or architecture changes, open an issue first to discuss the idea
* Keep pull requests focused and minimal
* Follow the existing design style and project structure

## Development Setup

### 1) Fork and clone

```bash
git clone https://github.com/your-username/frag-verse-wallpaper-app.git
cd frag-verse-wallpaper-app
```

### 2) Install dependencies

```bash
npm install
```

### 3) Create environment variables

Create a `.env` file in the project root and add the required keys:

```env
VITE_UNSPLASH_KEY=your_unsplash_access_key
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_APP_ID=your_app_id
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
VITE_ADMIN_EMAIL=your_email
```

### 4) Start the app

```bash
npm run dev
```

Open `http://localhost:5173`

## Contribution Guidelines

### UI and UX

FragVerse is design-first, so UI consistency matters.

* Maintain the current visual style
* Keep layouts clean and responsive
* Avoid unnecessary visual clutter
* Prioritize smooth interactions and loading states

### Code Style

* Write clear and readable React components
* Prefer reusable components over duplicated code
* Keep hooks and services modular
* Use meaningful variable and function names
* Avoid large unrelated refactors in bug-fix PRs

## Branch Naming

Use descriptive branch names:

* `fix/search-scroll-bug`
* `feat/category-filter`
* `docs/readme-redesign`

## Pull Request Guidelines

When opening a PR:

* explain what changed
* include screenshots for UI changes
* mention related issue numbers
* keep PRs small and review-friendly

Example:

```md
Fixes #12
Improves category filtering UI and fixes loading flicker.
```

## Areas to Contribute

Good contribution areas include:

* UI polish and responsiveness
* search improvements
* infinite scroll performance
* favorites and download UX
* admin upload flow
* documentation improvements
* code cleanup and modularization

## Reporting Bugs

When reporting bugs, include:

* expected behavior
* actual behavior
* steps to reproduce
* screenshots if relevant
* browser/device details

## Questions

If you are unsure about a contribution, open an issue first so we can align on the best approach.

Thanks for helping improve FragVerse.
