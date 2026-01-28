# name-checker

As the name suggests, it fetches cheapest TLDs, social account availabilities, & generates names using AI models

## Tech Stack

This is a Next.js project with the following technologies:

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS v4** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **Framer Motion** - Animation library
- **Biome** - Fast linter and formatter (instead of ESLint)

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run Biome linter
- `npm run format` - Format code with Biome

## Project Structure

```
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles with Tailwind
├── components/
│   └── ui/             # shadcn/ui components
├── lib/
│   └── utils.ts        # Utility functions
├── public/             # Static assets
└── ...config files
```
