#  WalkEnd Weekend - Community Running Platform

> A modern web application designed for organizing running events, sharing merchandise, and building community among runners in Ghana.

![Next.js](https://img.shields.io/badge/Next.js-16.0.10-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38B2AC)
![License](https://img.shields.io/badge/License-Proprietary-red)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [External Services](#external-services)
- [API Routes](#api-routes)
- [Deployment](#deployment)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Known Issues](#known-issues)

---

##  Overview

WalkEnd Weekend is a comprehensive platform for the running community. It allows organizers to create and manage running events, sell merchandise, share photos from past events, publish training tips and blog posts, and handle user registrations.

---

##  Key Features

### Core Functionality
- **Event Management** - Create, organize, and manage running events with interactive location mapping
- **Merchandise Store** - Sell running gear with WhatsApp integration for orders
- **Photo Gallery** - Upload and share event photos with Cloudinary integration
- **Blog & Training** - Publish training tips and blog posts with authentication
- **User Management** - Email/password and Google OAuth authentication, event registrations
- **Email Notifications** - Automated alerts for events, blogs, and merchandise
- **Admin Dashboard** - Complete content management system for administrators
- **Ride Hailing** - Integration with Uber and Yango APIs for transportation

### Technical Features
- **Mobile Responsive** - Works seamlessly on all devices
- **Dark Theme** - Modern dark interface throughout
- **Role-Based Access** - Admin and user roles with row-level security
- **Location Mapping** - Interactive maps powered by OpenStreetMap and Leaflet
- **Security** - Supabase authentication with RLS policies

---

##  Tech Stack

### Frontend

| Technology      | Version | Purpose               |
|-----------------|---------|----------------------|
| **Next.js**     | 16.0.10 | React framework       |
| **React**       | 19      | UI library            |
| **TypeScript**  | 5.6     | Type safety           |
| **Tailwind CSS**| 4.0     | Styling               |
| **Shadcn/ui**   | Latest  | Component library     |

### Backend & Services

| Service         | Purpose                        | Cost                |
|-----------------|--------------------------------|---------------------|
| **Supabase**    | PostgreSQL database, Auth      | Free tier available |
| **Cloudinary**  | Image hosting & management     | Free tier available |
| **Resend**      | Email sending service          | 100 emails/day free |
| **OpenStreetMap**| Location mapping & geocoding  | Free                |
| **Google OAuth**| Social authentication          | Free                |

---

##  Quick Start

### Prerequisites

- Node.js 18+ (recommended 20 LTS)
- npm (we use npm for commands)
- Git
- [Supabase account](https://supabase.com)
- [Cloudinary account](https://cloudinary.com)
- [Resend account](https://resend.com)

### Installation Steps

#### 1. Clone Repository

```bash
git clone https://github.com/yourusername/walkend-weekend.git
cd walkend-weekend
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Set Up Environment Variables

```bash
cp .env.local.example .env.local
```

#### 4. Configure Environment

Edit `.env.local` with your credentials from Supabase, Cloudinary, and Resend.

#### 5. Create Database Tables

Run the SQL scripts from the [Database Setup](#database-setup) section in Supabase SQL Editor.

#### 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

#### 7. Create Admin User

Sign up from the signup page, then run this in Supabase SQL Editor:

```sql
UPDATE public.users SET role = 'admin' WHERE email = 'your-email@example.com';
```

---

##  Environment Setup

### Create .env.local File

Copy `.env.local.example` and fill in your credentials:

```env
# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# CLOUDINARY
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# RESEND (EMAIL)
RESEND_API_KEY=your-resend-api-key

# MAPS
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here

# APPLICATION
NEXT_PUBLIC_WHATSAPP_NUMBER=+233XXXXXXXXX
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a project
2. Navigate to **Settings** → **API**
3. Copy the URLs and keys
4. Paste into `.env.local`

### Get Cloudinary Credentials

1. Go to [cloudinary.com](https://cloudinary.com) and create an account
2. Go to **Dashboard**
3. Copy **Cloud Name**, **API Key**, **API Secret**
4. Create an upload preset named `walkend_weekend` (set to **Unsigned** mode)

### Get Resend API Key

1. Go to [resend.com](https://resend.com) and create an account
2. Go to **API Keys**
3. Create a new key and copy to `RESEND_API_KEY`

---

## Database Setup

Run these SQL scripts in your Supabase SQL Editor to create all tables.

### Users Table

```sql
CREATE TABLE public.users (
  id UUID NOT NULL PRIMARY KEY DEFAULT auth.uid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone_number TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  avatar_url TEXT,
  receive_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  CONSTRAINT email_not_empty CHECK (email <> '')
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON public.users FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Only admins can change roles"
  ON public.users FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
```

### Events Table

```sql
CREATE TABLE public.events (
  id UUID NOT NULL PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location_name TEXT NOT NULL,
  latitude FLOAT8 NOT NULL,
  longitude FLOAT8 NOT NULL,
  image_url TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  CONSTRAINT title_not_empty CHECK (title <> ''),
  CONSTRAINT location_not_empty CHECK (location_name <> ''),
  CONSTRAINT valid_latitude CHECK (latitude >= -90 AND latitude <= 90),
  CONSTRAINT valid_longitude CHECK (longitude >= -180 AND longitude <= 180)
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published events"
  ON public.events FOR SELECT USING (true);

CREATE POLICY "Admins can create events"
  ON public.events FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Event creators and admins can update"
  ON public.events FOR UPDATE
  USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Event creators and admins can delete"
  ON public.events FOR DELETE
  USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX idx_events_date ON public.events(date DESC);
CREATE INDEX idx_events_created_by ON public.events(created_by);
```

### Merchandise Table

```sql
CREATE TABLE public.merchandise (
  id UUID NOT NULL PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  CONSTRAINT name_not_empty CHECK (name <> ''),
  CONSTRAINT valid_price CHECK (price >= 0),
  CONSTRAINT valid_stock CHECK (stock >= 0)
);

ALTER TABLE public.merchandise ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view merchandise"
  ON public.merchandise FOR SELECT USING (true);

CREATE POLICY "Admins can manage merchandise"
  ON public.merchandise FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update merchandise"
  ON public.merchandise FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete merchandise"
  ON public.merchandise FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX idx_merchandise_created_by ON public.merchandise(created_by);
```

### Gallery Images Table

```sql
CREATE TABLE public.gallery_images (
  id UUID NOT NULL PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  image_url TEXT NOT NULL,
  public_id TEXT,
  caption TEXT,
  image_date DATE,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  uploaded_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  CONSTRAINT image_url_not_empty CHECK (image_url <> '')
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gallery"
  ON public.gallery_images FOR SELECT USING (true);

CREATE POLICY "Admins can upload images"
  ON public.gallery_images FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete images"
  ON public.gallery_images FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX idx_gallery_event_id ON public.gallery_images(event_id);
```

### Blog Posts Table

```sql
CREATE TABLE public.blog_posts (
  id UUID NOT NULL PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  CONSTRAINT title_not_empty CHECK (title <> ''),
  CONSTRAINT slug_not_empty CHECK (slug <> ''),
  CONSTRAINT content_not_empty CHECK (content <> '')
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published posts"
  ON public.blog_posts FOR SELECT USING (published = true);

CREATE POLICY "Admins can view all posts"
  ON public.blog_posts FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can create posts"
  ON public.blog_posts FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Post authors and admins can update"
  ON public.blog_posts FOR UPDATE
  USING (author_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX idx_blog_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_published ON public.blog_posts(published);
```

### FAQs Table

```sql
CREATE TABLE public.faqs (
  id UUID NOT NULL PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  CONSTRAINT question_not_empty CHECK (question <> ''),
  CONSTRAINT answer_not_empty CHECK (answer <> '')
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view FAQs"
  ON public.faqs FOR SELECT USING (true);

CREATE POLICY "Admins can manage FAQs"
  ON public.faqs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX idx_faqs_order ON public.faqs(order_index);
```

### Training Tips Table

```sql
CREATE TABLE public.training_tips (
  id UUID NOT NULL PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  image_url TEXT,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  CONSTRAINT title_not_empty CHECK (title <> ''),
  CONSTRAINT content_not_empty CHECK (content <> '')
);

ALTER TABLE public.training_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view training tips"
  ON public.training_tips FOR SELECT USING (true);

CREATE POLICY "Admins can manage training tips"
  ON public.training_tips FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX idx_training_category ON public.training_tips(category);
```

### Event Registrations Table

```sql
CREATE TABLE public.event_registrations (
  id UUID NOT NULL PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'completed', 'cancelled')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  CONSTRAINT unique_registration UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their registrations"
  ON public.event_registrations FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all registrations"
  ON public.event_registrations FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Authenticated users can register"
  ON public.event_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel their registration"
  ON public.event_registrations FOR DELETE
  USING (user_id = auth.uid());

CREATE INDEX idx_registration_event_id ON public.event_registrations(event_id);
CREATE INDEX idx_registration_user_id ON public.event_registrations(user_id);
```

---

##  External Services

### Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a project
2. Choose region (Europe recommended for Ghana)
3. Save password securely
4. Wait 2-3 minutes for setup to complete

### Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Google+ API**
4. Create **OAuth 2.0 Client ID** for Web
5. Add redirect URI: `https://your-project.supabase.co/auth/v1/callback`
6. Copy Client ID and Secret
7. In Supabase: Go to **Authentication** → **Providers** → **Google**
8. Paste your credentials

### Cloudinary Setup

1. Go to [cloudinary.com](https://cloudinary.com) and create an account
2. Go to **Settings** → **Upload**
3. Create upload preset named `walkend_weekend`
4. Set Type to **Unsigned**
5. Save and use credentials in `.env.local`

### Resend Setup

1. Go to [resend.com](https://resend.com) and create an account
2. Go to **API Keys**
3. Create new API key
4. Add to `RESEND_API_KEY` in `.env.local`

> **Note**: Free tier allows 100 emails/day with Resend's onboarding domain

### Map Integration (OpenStreetMap)

No additional setup required! Maps use:
- **OpenStreetMap** - Free mapping service (no API key needed)
- **Leaflet** - Interactive map library
- **Nominatim API** - Location search and geocoding

Features include:
- Interactive event maps
- Location search
- Marker clustering
- Mobile responsive design

---

##  API Routes

### Public Routes

- `GET /` - Homepage
- `GET /event-calendar` - Events calendar  
- `GET /gallery` - Photo gallery
- `GET /merchandise` - Products catalog
- `GET /blog` - Blog listing
- `GET /blog/[slug]` - Individual blog post
- `GET /training-tips` - Training content
- `GET /faq` - FAQ page
- `GET /about` - About page
- `GET /join-run` - Join run form

### Admin Routes (Protected)

- `GET /admin` - Admin dashboard
- `GET /admin/events` - Event management
- `GET /admin/merchandise` - Merchandise management
- `GET /admin/gallery` - Gallery management
- `GET /admin/blog` - Blog management
- `GET /admin/faqs` - FAQ management
- `GET /admin/training-tips` - Training tips management

### API Endpoints

- `POST /api/auth/create-user` - Create user
- `POST /api/emails/send-event-notification` - Event email
- `POST /api/emails/send-blog-notification` - Blog email
- `POST /api/emails/send-merchandise-notification` - Merchandise email
- `POST /api/gallery/upload` - Upload image
- `POST /api/cloudinary/delete` - Delete image

---

##  Deployment

### Deploy to Vercel

#### 1. Push to GitHub

```bash
git add .
git commit -m "Deploy ready"
git push origin main
```

#### 2. Create Vercel Account

Visit [vercel.com](https://vercel.com) and sign up with GitHub

#### 3. Import Project

1. Go to your Vercel Dashboard
2. Click **Import Project**
3. Select your repository
4. Click **Import**

#### 4. Add Environment Variables

In Vercel **Settings** → **Environment Variables**, add all variables from `.env.local.example`:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
RESEND_API_KEY
NEXT_PUBLIC_WHATSAPP_NUMBER
NEXT_PUBLIC_APP_URL (your Vercel domain)
```

#### 5. Deploy

Click **Deploy** - takes 2-5 minutes

---

##  Development

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Run Production Build

```bash
npm start
```

### Check for Errors

```bash
npm run lint
npx tsc --noEmit
```

---

## Troubleshooting

### "No NEXT_PUBLIC_SUPABASE_URL" Error

- Verify `.env.local` exists in project root
- Restart dev server: `Ctrl+C` then `npm run dev`
- Ensure no spaces in environment values

### Build Fails with TypeScript Errors

```bash
npm run build
npx tsc --noEmit
```

### Images Not Uploading to Cloudinary

- Verify `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` in `.env.local`
- Confirm upload preset is set to **Unsigned**
- Restart dev server

### Email Notifications Not Sending

- Verify `RESEND_API_KEY` is valid
- Check domain is verified in Resend dashboard
- Visit **Resend** → **Emails** tab for delivery logs

### Session Expires Too Quickly

- Known issue - see [TODO.md](./TODO.md)
- Workaround: Refresh page

### Admin Pages Require Re-login

- Known issue - see [TODO.md](./TODO.md)
- Workaround: Refresh or re-login

---

##  Known Issues

See [TODO.md](./TODO.md) for detailed information and roadmap.

| Issue | Severity | Status |
|-------|----------|--------|
| Session persistence timeout | Medium | Known issue |
| Map picker search | High | Workaround available |
| Event edit/delete | Medium | Partial implementation |

---

##  Project Structure

```
app/
├── globals.css
├── layout.tsx
├── page.tsx
├── (public)/           # Public pages
│   ├── about/
│   ├── blog/
│   ├── event-calendar/
│   ├── faq/
│   ├── gallery/
│   ├── merchandise/
│   └── training-tips/
├── admin/              # Protected admin pages
│   ├── layout.tsx
│   ├── page.tsx
│   ├── events/
│   ├── merchandise/
│   ├── gallery/
│   └── blog/
├── auth/               # Authentication pages
│   ├── login/
│   ├── signup/
│   └── callback/
└── api/                # API routes
    ├── auth/
    ├── emails/
    ├── cloudinary/
    └── gallery/

components/
├── navigation.tsx
├── theme-provider.tsx
├── sections/           # Page sections
└── ui/                 # Shadcn UI components

lib/
├── auth-context.tsx    # Global auth state
├── supabase.ts         # Supabase client
├── cloudinary.ts       # Cloudinary config
├── email.ts            # Email templates
└── utils.ts            # Utility functions

public/                 # Static assets
```

---

##  License

**Proprietary** - Do Not Share

---

**Last Updated**: February 6, 2026  
**Status**: Production Ready  
**Maintained By**: WalkEnd Weekend Team
