# Snippedia

Live demo: https://snippedia.app/

Snippedia is a short-form knowledge discovery app that turns encyclopedia-style learning into a fast, visual, mobile-friendly feed. It uses Wikipedia content as a foundation and presents articles as swipeable snippets, helping people move from casual curiosity to meaningful exploration with less friction.

The project experiments with a simple idea: credible educational content can feel as engaging and approachable as modern content feeds without losing its usefulness.

## Features

- Wikipedia-powered article search and discovery
- Swipeable full-screen reading experience
- Trending and category-based exploration
- Reading history and favorites
- Reading statistics and activity insights
- Progressive Web App support
- Offline-aware article caching
- Responsive interface for desktop and mobile

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Framer Motion
- Wikipedia and Wikimedia APIs

## Getting Started

Install dependencies:

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

Build for production:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

## Optional API Server

The repository includes a small Express/MySQL API under `server/`. Configure it with environment variables before running it:

```sh
cp server/.env.example server/.env
# edit server/.env with local database credentials
```

Database credentials should never be committed to the repository.

## Project Structure

- `src/components`: reusable UI and product components
- `src/pages`: route-level pages
- `src/hooks`: local state and app behavior hooks
- `src/services`: API integrations, caching, and article transformation logic
- `public`: static assets and PWA files

## Status

Snippedia is an active portfolio project focused on product design, frontend engineering, API integration, and user experience for educational discovery.

## License

A license should be selected before publishing this repository as open source.
