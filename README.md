# 🌌 Frag Verse

**Frag Verse** is a premium, high-performance wallpaper discovery application built with **React**, **Tailwind CSS**, and the **Unsplash API**. It offers a seamless experience for finding and downloading stunning 4K wallpapers across various categories like Gaming, Anime, Nature, and more.

## ✨ Features

- **High-Resolution Discovery**: Fetch the latest and most popular wallpapers directly from Unsplash.
- **Infinite Scroll**: Seamlessly browse through thousands of images without manual pagination.
- **Smart Search**: Dual search entry points in the Navbar and Hero section.
- **Category Filtering**: Quick access to specific themes (Gaming, Anime, Nature, etc.).
- **Premium UI**: Dark-themed, glassmorphic design with smooth micro-animations and purple glow effects.
- **One-Click Downloads**: Save high-resolution (Full/Raw) images directly to your device.
- **Fullscreen Preview**: Immersive modal view with author information and resolution details.

---

## 🚀 Getting Started

To run **Frag Verse** locally, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/your-username/frag-verse.git
cd frag-verse
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Frag Verse requires an Unsplash API access key.
1. Go to [Unsplash Developers](https://unsplash.com/developers) and create a new application.
2. Copy your **Access Key**.
3. Create a `.env` file in the root directory:
```bash
touch .env
```
4. Add your key to the `.env` file:
```env
VITE_UNSPLASH_KEY=your_access_key_here
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Built With

- [React](https://reactjs.org/) - UI Framework
- [Vite](https://vitejs.dev/) - Frontend Tooling
- [Tailwind CSS](https://tailwindcss.com/) - Styling & Design System
- [Lucide React](https://lucide.dev/) - Icons
- [Unsplash API](https://unsplash.com/developers) - Data Source

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Handcrafted for stunning visual experiences.*
