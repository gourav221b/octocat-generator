# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Octocat Generator is a Next.js application that transforms user photos into personalized GitHub Octocat avatars using Google's Gemini AI. Users can capture photos via camera or upload existing images, which are then processed to create unique Octocat variations.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API (gemini-1.5-flash for analysis, imagen-3.0-generate-001 for image generation)

### Directory Structure
```
app/
├── api/
│   └── generate-octocat/
│       └── route.ts          # API endpoint for Gemini integration
├── layout.tsx                 # Root layout with metadata
├── page.tsx                   # Main UI component
└── globals.css               # Global styles and Tailwind directives
```

### Key Components

**Frontend (app/page.tsx)**
- File upload with drag-and-drop support
- Sample images for quick testing
- Session-based history with individual delete functionality
- Image preview and management
- Download functionality for generated images
- Rate limit tracking and display
- Responsive design with dark mode support

**Backend (app/api/generate-octocat/route.ts)**
- Receives image uploads via FormData
- Uses Gemini Vision (gemini-1.5-flash) to analyze user photo
- Generates detailed prompt for Octocat creation
- Uses Imagen 3 (imagen-3.0-generate-001) to generate the Octocat image
- Returns base64-encoded image for immediate display

### API Flow
1. User uploads photo or selects sample → Frontend
2. Image converted to base64 → POST to `/api/generate-octocat`
3. Gemini Vision analyzes features → Generates description
4. Imagen 3 creates Octocat → Returns base64 image
5. Frontend displays result → User can download
6. Generation saved to session history → User can view/delete past results

## Environment Setup

Required environment variables in `.env.local`:
```
GEMINI_API_KEY=your_key_here
```

Get your API key from: https://aistudio.google.com/app/apikey

**Important**: The API key must have access to both Gemini Vision models and Imagen 3 for image generation.

## API Integration Notes

### Gemini Models Used
- **gemini-1.5-flash**: Analyzes uploaded photos to extract key features
- **imagen-3.0-generate-001**: Generates the actual Octocat image based on the analysis

### Error Handling
The API route handles common errors:
- Missing/invalid API key
- Quota exceeded
- Model availability issues
- Image processing failures

The frontend tracks rate limit errors and displays a dismissible banner showing quota error count. Rate limit tracking persists for 1 hour before auto-resetting.

## Security Considerations

- API key stored in localStorage for user convenience
- Image processing happens in API route (not client-side)
- FormData validation on API endpoint
- No persistent storage of user photos - history is session-only to avoid localStorage quota issues
- Rate limit tracking stored in localStorage (auto-expires after 1 hour)
