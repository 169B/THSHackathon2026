# Authentication Pages

This directory contains all authentication-related pages for Verdant Horizon.

## Pages

### 1. Email Entry (`/auth/email`)
- **Purpose**: Initial email verification screen
- **CTA**: Users enter their email to start the sign-in process
- **Next Step**: Routes to password entry

### 2. Password Entry (`/auth/password`)
- **Purpose**: Password verification screen
- **CTA**: Users enter password for their account
- **Features**: 
  - Show/hide password toggle
  - Forgot password link
  - Change account link

### 3. Reset Password (`/auth/reset-password`)
- **Purpose**: Password reset flow
- **CTA**: Users enter email to receive reset link
- **Features**: 
  - 24-hour reset link expiration notice
  - Back to sign in link

## Layout

All pages use a shared auth layout (`src/app/auth/layout.js`) that:
- Applies the Verdant Horizon color scheme via Tailwind CSS config
- Loads required fonts (Manrope, Inter, Material Symbols)
- Applies consistent styling across all auth pages

## Components

### Shared Components
- **TopNavBar** (`src/components/TopNavBar.js`): Navigation header with logo and links
- **Footer** (`src/components/Footer.js`): Footer with copyright and links

## Getting Started

All pages are interactive React components. To navigate between auth pages:

- `/auth/email` → Entry point
- `/auth/password` → After email verification
- `/auth/reset-password` → From password entry screen

## Customization

To modify the color scheme, edit the Tailwind config in `src/app/auth/layout.js`. All custom colors follow Material Design 3 naming conventions.

## Testing

Run the development server:
```bash
npm run dev
```

Visit `http://localhost:3000/auth/email` to see the auth pages.
