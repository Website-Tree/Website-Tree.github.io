# Movie Streaming Website

A movie streaming platform with modern UI and admin functionality.

## Features

- User authentication (login/register)
- Movie browsing and streaming
- Admin panel for user management
- Responsive design for all devices

## GitHub Pages Deployment

This repository is configured to automatically deploy to GitHub Pages when changes are pushed to the main branch. The deployment process is handled by the GitHub Actions workflow defined in `.github/workflows/deploy.yml`.

### Manual Deployment

If you prefer to deploy manually:

1. Build the project:
   ```
   npm run build
   ```

2. The build output will be in the `dist` directory.

3. Push the `dist` directory to the `gh-pages` branch:
   ```
   git subtree push --prefix dist origin gh-pages
   ```

## Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Admin Access

Default admin credentials:
- Username: Syfer-eng
- Password: admin

## Technology Stack

- React
- Vite
- TailwindCSS
- Shadcn UI Components
- TanStack Query for data fetching