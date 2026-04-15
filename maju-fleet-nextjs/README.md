# Maju Fleet — Next.js Website

Website maritim untuk **Maju Fleet**, dibangun dengan Next.js 14, Tailwind CSS, dan Framer Motion.

## 🚀 Cara Menjalankan

### 1. Install dependencies

```bash
npm install
```

### 2. Jalankan development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### 3. Build untuk production

```bash
npm run build
npm start
```

---

## 📁 Struktur Folder

```
maju-fleet-nextjs/
├── app/
│   ├── layout.tsx          # Root layout (Navbar + Footer)
│   ├── globals.css         # Global styles & Tailwind
│   ├── page.tsx            # Halaman Home
│   ├── about/
│   │   └── page.tsx        # Halaman About Us
│   └── contact/
│       └── page.tsx        # Halaman Contact Us
│
├── components/
│   ├── Navbar.tsx          # Navigasi sticky dengan active state
│   ├── Footer.tsx          # Footer
│   ├── FadeUp.tsx          # Animasi scroll reusable
│   ├── home/
│   │   ├── HeroSection.tsx       # Hero dengan HUD cards
│   │   ├── FeaturesSection.tsx   # 3-column bento cards
│   │   ├── VisionMissionSection.tsx
│   │   └── MetricsSection.tsx    # 500+ vessels, 99.9% uptime, dll
│   ├── about/
│   │   ├── AboutHero.tsx         # Hero dengan foto kapal sunset
│   │   ├── AboutVisionMission.tsx
│   │   ├── AboutMetrics.tsx
│   │   └── DeepTechGrid.tsx      # Grid foto kapal aerial
│   └── contact/
│       ├── ContactForm.tsx       # Form dengan useState + toast
│       └── ContactPersons.tsx    # Kartu Dimas & Juan
│
└── public/
    ├── ship-sunset.png     # Foto kapal sunset (About hero)
    ├── ship-aerial.png     # Foto kapal aerial (Deep tech grid)
    └── logo.png            # Logo Maju Fleet
```

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Background Deep | `#0B0C10` |
| Background Dark | `#121317` |
| Background Mid  | `#1A1B20` |
| Background Card | `#16181F` |
| Purple Accent   | `#B026FF` |
| Cyan Accent     | `#BDF4FF` |
| Light Purple    | `#E5B5FF` |
| Text Primary    | `#E3E2E8` |
| Text Muted      | `#D2C1D7` |

**Font:** Space Grotesk (heading) + Inter (body)

---

## ✏️ Cara Edit Konten

- **Teks hero** → `components/home/HeroSection.tsx`
- **Fitur cards** → `components/home/FeaturesSection.tsx` (edit array `features`)
- **Statistik** → `components/home/MetricsSection.tsx` (edit array `metrics`)
- **Kontak person** → `components/contact/ContactPersons.tsx` (edit array `persons`)
- **Warna** → `tailwind.config.ts` dan `app/globals.css`
- **Gambar** → ganti file di folder `public/`

---

## 📦 Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** — animasi entrance & hover
- **Lucide React** — icons
