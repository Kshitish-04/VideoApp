<div align="center">

# ▶ LuminaStream

**A cinematic, glassmorphism-themed video streaming platform**

[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Video%20CDN-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20Hero-000000?logo=three.js&logoColor=white)](https://threejs.org/)

![LuminaStream Preview](./public/preview.png)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Auth** | Email/password auth with Supabase. Protected routes for upload & dashboard. |
| 🎬 **Video Streaming** | Cloudinary upload with adaptive HLS (`sp_auto`) playback + MP4 fallback. |
| 🌐 **Community** | Toggle videos as "Community" — accessible without login. Dedicated community page. |
| 🌑 **3D Hero** | Animated marble sphere (Three.js + React Three Fiber) with GSAP entrance animations. |
| 🖤 **Black Minimalist UI** | Pure black background, frosted glass cards, hairline white borders, monochrome palette. |
| 📊 **Dashboard** | Manage your uploaded videos — edit, delete, and track views. |
| 📂 **Categories** | Filter by Gaming, Music, Education, Tech, Sports, Vlogs, Comedy. |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6 |
| **Styling** | Vanilla CSS (custom design system) — glassmorphism + black minimalist |
| **3D / Animation** | Three.js · @react-three/fiber · @react-three/drei · GSAP · Framer Motion |
| **Backend / Auth** | Supabase (PostgreSQL + Row Level Security + Auth + Storage) |
| **Video CDN** | Cloudinary (upload, HLS transcoding, thumbnail generation) |
| **Icons** | Lucide React |
| **Notifications** | react-hot-toast |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- A [Supabase](https://supabase.com/) project
- A [Cloudinary](https://cloudinary.com/) account with an **unsigned** upload preset

### 1. Clone & Install

```bash
git clone https://github.com/your-username/luminastream.git
cd luminastream
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory (never commit this!):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-unsigned-preset
```

### 3. Set Up Supabase

Run the following SQL in your Supabase SQL Editor:

```sql
-- Profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- Videos table
create table videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  video_url text not null,
  thumbnail_url text,
  category text,
  view_count integer default 0,
  is_community boolean default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table videos enable row level security;

-- Policies
create policy "Public read" on videos for select using (true);
create policy "Authenticated insert" on videos for insert with check (auth.uid() = user_id);
create policy "Owner update/delete" on videos for all using (auth.uid() = user_id);
create policy "Public profile read" on profiles for select using (true);
create policy "Own profile write" on profiles for all using (auth.uid() = id);

-- Grant permissions
grant usage on schema public to anon, authenticated;
grant select on videos, profiles to anon;
grant all on videos, profiles to authenticated;
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
luminastream/
├── public/                   # Static assets
├── src/
│   ├── components/
│   │   ├── Navbar.jsx        # Fixed glass navbar
│   │   ├── VideoCard.jsx     # 3D tilt video card with specular shine
│   │   ├── VideoPlayer.jsx   # HLS + MP4 adaptive player
│   │   ├── MarbleHero.jsx    # 3D marble hero (GSAP + Three.js)
│   │   ├── MarbleScene.jsx   # React Three Fiber scene
│   │   └── ProtectedRoute.jsx
│   ├── hooks/
│   │   ├── useAuth.js        # Auth context (sign in, sign up, sign out)
│   │   └── useSupabase.js    # Videos, community, dashboard hooks
│   ├── lib/
│   │   └── supabase.js       # Supabase client
│   ├── pages/
│   │   ├── Home.jsx          # Landing + video grid
│   │   ├── Watch.jsx         # Video player page
│   │   ├── Upload.jsx        # Upload + community toggle
│   │   ├── Dashboard.jsx     # Creator dashboard
│   │   ├── Community.jsx     # Community videos + discussions
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css             # Full design system (black minimalist)
├── supabase/
│   └── functions/
│       └── delete-video/     # Edge function for Cloudinary deletion
├── .env                      # ← never commit
├── .gitignore
└── README.md
```

---

## 🎨 Design System

LuminaStream uses a **pure black minimalist** design system:

- **Background**: `#000000` — pure black, no ambient gradients
- **Surfaces**: Near-opaque dark glass `rgba(14,14,14, 0.9)` with `backdrop-filter: blur(24px)`
- **Borders**: Hairline white `rgba(255,255,255, 0.08)` — ghost lines, not structural dividers
- **Accent**: Solid `#ffffff` — primary buttons are white with black text
- **Typography**: **Plus Jakarta Sans** (headlines) + **Manrope** (body)
- **Cards**: 3D perspective tilt on hover + specular shine effect tracking the cursor

---

## 🔑 Key Workflows

### Upload a Video
1. Log in → click **Upload**
2. Fill in title, description, category
3. Toggle **"Share to Community"** if you want it publicly visible without login
4. Select a video file (max **100MB**) → **Upload**

### Community Access
- The `/community` page is public (no login required)
- Community-flagged videos appear in the top section
- To mark an existing video as community: run `UPDATE videos SET is_community = true WHERE id = 'your-video-id';`

### Delete a Video
- Go to **Dashboard** → click the delete icon on a video
- This triggers the `delete-video` Supabase Edge Function, which removes the asset from Cloudinary and the row from the database

---

## 🌍 Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add all `VITE_*` environment variables in the Vercel project settings
4. Deploy 🚀

> **Note:** Supabase Edge Functions are deployed separately via `supabase functions deploy delete-video`

---

## 📝 Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `VITE_CLOUDINARY_CLOUD_NAME` | ✅ | Your Cloudinary cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | ✅ | **Unsigned** upload preset name |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT — see [LICENSE](./LICENSE) for details.

---

<div align="center">
Built with ❤️ using React, Supabase, Cloudinary & Three.js
</div>
