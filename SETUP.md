# Baladna PMIS - Supabase Migration Setup Guide

This guide explains how to migrate the Baladna PMIS dashboard from Express/JWT authentication to Supabase.

## Prerequisites

- Node.js 18+ installed
- A Supabase project (free tier works)
- Access to the Supabase project settings

---

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Note your **Project URL** and **anon/public key** from Settings > API

---

## Step 2: Set Up Database Schema

### Option A: Run SQL in Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and run the SQL

### Option B: Run via Supabase CLI

```bash
supabase db push
```

### What the Schema Includes

- **profiles** table: User profiles with roles (Admin, Document Controller, Viewer)
- **Core tables**: vendors, packages, contracts, cost_records, purchase_orders
- **Document management**: risks, rfis, transmittals, correspondence, drawings
- **Reference tables**: contacts, workstreams, phases
- **Import tracking**: import_runs

### Row Level Security (RLS)

The schema includes RLS policies:
- All authenticated users can read data
- Document Controllers and Admins can insert/update
- Only Admins can delete

### Key Functions

- `handle_new_user()`: Auto-creates profile when user signs up
- `get_dashboard_kpis()`: Returns aggregated dashboard metrics
- `get_contractor_scorecard()`: Returns contractor performance data
- `is_admin()` / `can_edit()`: Helper functions for RLS

---

## Step 3: Configure Authentication

### Enable Email Authentication

1. In Supabase Dashboard, go to **Authentication** > **Settings**
2. Under **Auth Providers**, ensure **Email** is enabled
3. Configure SMTP settings if you want custom email templates (optional)

### Create Admin User

1. Go to **Authentication** > **Users**
2. Click **Add user** > **Create new user**
3. Enter email and password
4. Set role to "Admin" in the profile

Or via SQL:
```sql
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  auth.uid(),
  'admin@example.com',
  'Admin User',
  'Admin'
);
```

---

## Step 4: Create Storage Bucket

1. Go to **Storage** in Supabase Dashboard
2. Click **New bucket**
3. Name: `imports`
4. Set to **Public** bucket

---

## Step 5: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## Step 6: Install Dependencies

```bash
npm install
```

---

## Step 7: Build and Test

```bash
npm run build
```

If there are no errors, start the development server:

```bash
npm run dev
```

---

## Project Structure

```
baladna-pmis/
├── src/
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client configuration
│   │   ├── types.ts        # TypeScript types for database
│   │   ├── auth.ts          # Authentication service
│   │   ├── api.ts           # Data service layer
│   │   ├── hooks.ts         # React Query hooks
│   │   ├── roles.ts         # Role-based access control
│   │   └── excel-import.ts  # Excel parsing service
│   ├── pages/
│   │   ├── Login.tsx        # Login page
│   │   ├── AdminImport.tsx  # Excel import page
│   │   └── Users.tsx        # User management
│   └── App.tsx              # Main app with AuthProvider
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Database schema
└── .env.example             # Environment template
```

---

## Excel Import Support

The import system supports the following Excel sheets:

| Sheet Name | Table | Key Fields |
|------------|-------|------------|
| Vendors | vendors | name, code, email, category |
| Packages | packages | number, name, contractor, status |
| Contracts | contracts | contract_number, title, value |
| Cost Tracker | cost_records | reporting_date, package, amounts |
| Procurement | purchase_orders | po_number, vendor, value |
| Risks | risks | risk_id, title, probability, impact |
| RFI | rfis | rfi_number, title, status |
| Transmittals | transmittals | transmittal_number, from/to |
| Drawings | drawings | drawing_number, title, revision |
| Contacts | contacts | name, email, company, position |

### Column Mapping

The system automatically maps common column names to database fields. For example:
- "Vendor Name", "Name", "Company" → `name`
- "Email Address", "Email" → `email`
- "PO Number", "Number", "PO" → `po_number`

---

## Role-Based Access

| Role | Permissions |
|------|-------------|
| Admin | Full access to all features |
| Document Controller | Can edit data, import Excel files |
| Viewer | Read-only access |

---

## Troubleshooting

### "Invalid API Key" Error
- Verify your `VITE_SUPABASE_ANON_KEY` is correct
- Make sure you're using the `anon` key, not the `service_role` key

### RLS Policy Errors
- Ensure RLS is enabled on all tables
- Check that policies allow the operations you need

### Storage Upload Failed
- Verify the `imports` bucket exists and is public
- Check storage policies allow uploads

### Excel Import Not Parsing
- Ensure sheet names match exactly (case-sensitive)
- Check column headers match expected names
- Look at browser console for parsing errors

---

## Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy

### Netlify

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Add environment variables in Netlify settings

---

## Migration from Express API

If you're migrating from the old Express backend:

1. **Remove** the old API server code
2. **Keep** the frontend structure
3. **Update** environment variables
4. **Run** the Supabase migration SQL
5. **Test** all features

The new architecture:
- **Before**: React → Express API → PostgreSQL (JWT auth)
- **After**: React → Supabase (built-in auth + API)

---

## Support

For issues or questions:
1. Check Supabase documentation: https://supabase.com/docs
2. Review browser console for error messages
3. Check Supabase logs in Dashboard > Logs
