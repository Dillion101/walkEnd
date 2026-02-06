#  WalkEnd Weekend - Community Running Platform

> A modern web application designed for organizing running events, sharing merchandise, and building community among runners in Ghana.

![Next.js](https://img.shields.io/badge/Next.js-16.0.10-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38B2AC)
![License](https://img.shields.io/badge/License-Proprietary-red)

---

##  Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Quick Start Guide](#quick-start-guide)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [External Services](#external-services)
- [Features](#features)
- [API Routes](#api-routes)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Known Issues](#known-issues)

---

## Overview

WalkEnd Weekend is a comprehensive platform for the running community. It allows organizers to create and manage running events, sell merchandise, share photos from past events, publish training tips and blog posts, and handle user registrations.

### Key Capabilities

-  **Event Management**: Create, organize, and manage running events with location mapping
-  **Merchandise Store**: Sell running gear with WhatsApp integration
-  **Gallery**: Upload and share event photos
-  **Blog & Tips**: Publish training content
-  **User Management**: Authentication and event registrations
-  **Email Notifications**: Automated alerts for events, blogs, and merchandise
-  **Mobile Responsive**: Works on all devices
-  **Dark Theme**: Modern dark interface

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 16.0.10 | React framework |
| **React** | 19 | UI library |
| **TypeScript** | 5.6 | Type safety |
| **Tailwind CSS** | 4.0 | Styling |
| **Shadcn/ui** | Latest | Components |

### Backend & Services
| Service | Purpose | Cost |
|---------|---------|------|
| **Supabase** | PostgreSQL database, authentication | Free tier available |
| **Cloudinary** | Image hosting | Free tier available |
| **Resend** | Email service | 100 emails/day free |
| **OpenStreetMap** | Location mapping | Free |
| **Google OAuth** | Social authentication | Free |

---

## Quick Start Guide

### Prerequisites
- Node.js 18+ (recommend 20 LTS)
- npm or pnpm
- Git
- Supabase account (https://supabase.com)
- Cloudinary account (https://cloudinary.com)
- Resend account (https://resend.com)

### Installation Steps

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/walkend-weekend.git
cd walkend-weekend
```

#### 2. Install Dependencies
\\\ash
pnpm install
\\\

#### 3. Set Up Environment Variables
\\\ash
cp .env.local.example .env.local
\\\

#### 4. Create Database Tables
Run SQL scripts from the Database Setup section below in Supabase SQL Editor.

#### 5. Configure Google OAuth
Follow the steps in External Services section below.

#### 6. Start Development Server
\\\ash
pnpm dev
\\\

Visit http://localhost:3000

#### 7. Create Admin User
Sign up at signup page, then run in Supabase SQL Editor:
\\\sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
\\\

---

## Environment Setup

### Create .env.local File

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

# THEME & COLORS
NEXT_PUBLIC_PRIMARY_HUE=0
NEXT_PUBLIC_SECONDARY_HUE=240

# APPLICATION
NEXT_PUBLIC_WHATSAPP_NUMBER=+233XXXXXXXXX
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Get Supabase Credentials
1. Go to supabase.com, create a project
2. Go to Settings  API
3. Copy the URLs and keys to .env.local

### Get Cloudinary Credentials
1. Go to cloudinary.com, create account
2. Go to Dashboard
3. Copy Cloud Name, API Key, API Secret
4. Create upload preset named \walkend_weekend\ (Unsigned mode)

### Get Resend API Key
1. Go to resend.com, create account
2. Create API key
3. Copy to RESEND_API_KEY

---

## Database Setup

### Create Users Table
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
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
```

### Create Events Table
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

### Create Merchandise Table
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

### Create Gallery Images Table
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

### Create Blog Posts Table
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

### Create FAQs Table
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

### Create Training Tips Table
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

### Create Event Registrations Table
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

## External Services

### 1. Supabase Setup

#### Create Project
1. Visit supabase.com
2. Create new project (region: Europe recommended for Ghana)
3. Save password securely
4. Wait 2-3 minutes for setup

#### Configure Google OAuth
1. Go to Google Cloud Console (console.cloud.google.com)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 Client ID for Web
5. Add redirect URI: https://your-project.supabase.co/auth/v1/callback
6. Copy Client ID and Secret to Supabase Authentication  Providers  Google

---

### 2. Cloudinary Setup

#### Create Account
1. Visit cloudinary.com
2. Sign up with email
3. Complete setup

#### Configure Upload Preset
1. Go to Settings  Upload
2. Create preset named \walkend_weekend\
3. Set Type: **Unsigned**
4. Save

#### Get Credentials
1. Go to Dashboard
2. Copy Cloud Name, API Key, API Secret

---

### 3. Resend Setup

#### Create Account
1. Visit resend.com
2. Sign up with email

#### Get API Key
1. Go to API Keys
2. Create new key
3. Copy to RESEND_API_KEY in .env.local

**Free Tier**: 100 emails/day with onboarding domain

---

### 4. Map Integration (OpenStreetMap & Leaflet)

#### How It Works
The application uses OpenStreetMap and Leaflet for interactive maps with:
- Event location display with markers
- Location-based search with Nominatim API
- Customizable map colors using CSS

#### Setup
No additional credentials required! OpenStreetMap is free to use.

#### Features
- **Interactive Maps**: Display events on maps with zoom/pan controls
- **Location Search**: Search for locations using Nominatim API
- **Marker Clustering**: Group nearby events visually
- **Mobile Responsive**: Maps work on all screen sizes

#### Map Components
- `components/ui/map.tsx` - Base map component
- `app/admin/events/map-picker.tsx` - Event location picker for admins
- Map integration in event detail pages

#### Environment Configuration
```env
# Map colors are configured via HUE variables in CSS
NEXT_PUBLIC_PRIMARY_HUE=0
NEXT_PUBLIC_SECONDARY_HUE=240
```

---

## Features

**Core Functionality**
- User authentication (email/password + Google OAuth)
- Event creation, management, and registration with location mapping
- Interactive map picker with OpenStreetMap integration for event locations
- Merchandise catalog and ordering via WhatsApp
- Photo gallery with Cloudinary image uploads and management
- Blog posts with automatic slug generation and routing
- Training tips and FAQs management
- Email notifications via Resend API
- Admin dashboard for content management
- Ride hailing integration (Uber & Yango APIs)
- Mobile responsive design
- Dark theme support

**Security & Admin**
- Role-based access control (Admin/User)
- Row-level security policies in Supabase
- Protected admin routes
- User authentication with session management

**Coming Soon**
- Theme toggle (Light/Dark modes)
- Payment integration
- Advanced analytics
- Live chat support
- Mobile app

---

## API Routes

### Public Routes
- GET / - Homepage
- GET /(public)/event-calendar - Events calendar
- GET /(public)/gallery - Photo gallery
- GET /(public)/merchandise - Products
- GET /(public)/blog - Blog listing
- GET /(public)/blog/[slug] - Blog detail
- GET /(public)/training-tips - Training content
- GET /(public)/faq - FAQ page
- GET /(public)/about - About page
- GET /(public)/join-run - Join form

### Admin Routes (Protected)
- GET /admin - Dashboard
- GET /admin/events - Event management
- GET /admin/merchandise - Merchandise management
- GET /admin/gallery - Gallery management
- GET /admin/blog - Blog management
- GET /admin/faqs - FAQ management
- GET /admin/training-tips - Training tips management

### API Routes
- POST /api/auth/create-user - Create user
- POST /api/emails/send-event-notification - Event notification
- POST /api/emails/send-blog-notification - Blog notification
- POST /api/emails/send-merchandise-notification - Merchandise notification
- POST /api/gallery/upload - Upload image
- POST /api/cloudinary/delete - Delete image

---

## Deployment to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "Deploy ready"
git push origin main
```

### 2. Create Vercel Account
Visit vercel.com, sign up with GitHub

### 3. Import Project
1. Go to Dashboard
2. Click Import Project
3. Select repository
4. Click Import

### 4. Add Environment Variables
In Vercel  Settings  Environment Variables, add:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- RESEND_API_KEY
- NEXT_PUBLIC_WHATSAPP_NUMBER
- NEXT_PUBLIC_APP_URL (your Vercel domain)

### 5. Deploy
Click Deploy. Takes 2-5 minutes.

---

## Troubleshooting

### "No NEXT_PUBLIC_SUPABASE_URL" Error
- Check .env.local exists in project root
- Restart dev server: Ctrl+C then npm run dev
- No spaces in env values

### Build Fails with TypeScript Errors
```bash
npm run build
npx tsc --noEmit
```

### Images Not Uploading to Cloudinary
- Verify CLOUDINARY_API_KEY and SECRET in .env.local
- Check upload preset is set to Unsigned
- Restart dev server

### Email Notifications Not Sending
- Verify RESEND_API_KEY is valid
- Check domain is verified in Resend dashboard
- View Resend  Emails tab for logs

### Session Expires Too Quickly
- Known issue - see TODO.md
- Workaround: Refresh page

### Admin Pages Require Re-login
- Known issue - see TODO.md
- Workaround: Click refresh or re-login

### Map Picker Not Working
- Known issue - see TODO.md
- Workaround: Enter latitude/longitude manually

---

## Known Issues

**See TODO.md for detailed known issues and development roadmap**

1. **Session Persistence** - Sessions expire when returning to app after 5-10 minutes
2. **Map Picker Search** - Clicking search results redirects to home page
3. **Event Edit/Delete** - Partial implementation

---

## Development

### Install Dependencies
\\\ash
pnpm install
\\\

### Start Dev Server
\\\ash
pnpm dev
\\\

### Build for Production
\\\ash
pnpm build
\\\

### Run Production Build
\\\ash
pnpm start
\\\

### Check for Errors
\\\ash
pnpm lint
npx tsc --noEmit
\\\

---

## Project Structure

`
app/
   globals.css
   layout.tsx
   page.tsx
   (public)/              # Public pages
      about/
      blog/
      event-calendar/
      faq/
      gallery/
      merchandise/
      training-tips/
      ...
   admin/                 # Protected admin pages
      events/
      merchandise/
      gallery/
      blog/
      ...
   auth/                  # Auth pages
      login/
      signup/
      callback/
   api/                   # API routes
       auth/
       emails/
       cloudinary/
       gallery/

components/
   navigation.tsx
   sections/              # Page sections
   ui/                    # Shadcn UI components

lib/
   auth-context.tsx       # Global auth state
   supabase.ts           # Supabase client
   cloudinary.ts         # Cloudinary config
   email.ts              # Email templates
   utils.ts              # Utilities

public/                      # Static assets
`

---

## Support

For issues and known problems, see TODO.md

---

## License

Proprietary - Do Not Share

---

**Last Updated**: February 2, 2026
**Maintained By**: WalkEnd Weekend Team
**Status**: Production Ready (with known issues documented in TODO.md)
