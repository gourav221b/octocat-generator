# Octocat Generator

Transform your photo into a personalized GitHub Octocat avatar using AI! This application uses Google's Gemini AI to analyze your photo and create a custom Octocat character that captures your unique features and style.

## Features

- 📸 **Camera Capture**: Take a photo directly from your device
- 📁 **File Upload**: Upload existing photos from your device
- 🤖 **AI-Powered**: Uses Gemini Vision to analyze your features
- 🎨 **Custom Generation**: Creates unique Octocat variations with Imagen 3
- 💾 **Download**: Save your personalized Octocat avatar
- 🌓 **Dark Mode**: Automatic dark mode support
- 📱 **Responsive**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Google Gemini API key with Imagen 3 access

### Setup

1. **Clone or navigate to this repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```

   Add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

   Get your API key from: https://aistudio.google.com/app/apikey

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm start` - Start production server locally
- `npm run lint` - Run ESLint
- `npm run pages:build` - Build for Cloudflare Pages deployment
- `npm run pages:deploy` - Build and deploy to Cloudflare Pages
- `npm run pages:dev` - Run Cloudflare Pages development server with watch mode

## How It Works

1. **Upload or Capture**: Choose to upload a photo or take one with your camera
2. **AI Analysis**: Gemini Vision analyzes your photo to identify key features (hair, glasses, style, etc.)
3. **Octocat Generation**: Imagen 3 creates a personalized Octocat based on your features
4. **Download & Share**: Save your unique Octocat avatar

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Models**:
  - Gemini 1.5 Flash (image analysis)
  - Imagen 3 (image generation)
- **Deployment**: Cloudflare Pages (optimized), Vercel, or any Node.js hosting

## API Usage

The application uses two Gemini models:
- `gemini-1.5-flash`: Analyzes photos to extract features
- `imagen-3.0-generate-001`: Generates the Octocat image

**Note**: Ensure your API key has access to both models. Image generation may require additional API access or credits.

## Project Structure

```
project-test/
├── app/
│   ├── api/
│   │   └── generate-octocat/
│   │       └── route.ts       # API endpoint for Gemini integration
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Main UI component
│   └── globals.css            # Tailwind styles
├── .vercel/output/            # Build output for Cloudflare Pages (generated)
├── .env.local                 # Environment variables (create this)
├── next.config.js             # Next.js configuration
├── wrangler.toml              # Cloudflare Pages configuration
├── package.json               # Dependencies
└── README.md                  # This file
```

## Deployment

### Deploy to Cloudflare Pages (Recommended)

This application is optimized for Cloudflare Pages deployment with built-in support.

#### Prerequisites

- A Cloudflare account ([Sign up free](https://dash.cloudflare.com/sign-up))
- Wrangler CLI installed (included in dev dependencies)

#### Deployment Steps

1. **Build the application**
   ```bash
   npm run pages:build
   ```

2. **Authenticate with Cloudflare**
   ```bash
   npx wrangler login
   ```
   This will open a browser window to authorize the CLI.

3. **Deploy to Cloudflare Pages**
   ```bash
   npx wrangler pages deploy .vercel/output/static --project-name=octocat-generator
   ```

   Or use the convenience script:
   ```bash
   npm run pages:deploy
   ```

4. **Configure Compatibility Flags** (Important!)

   After your first deployment, you must enable Node.js compatibility:

   a. Go to your [Cloudflare Dashboard](https://dash.cloudflare.com/)

   b. Navigate to: **Workers & Pages** → **octocat-generator** → **Settings** → **Functions**

   c. Under **Compatibility flags**, add:
      - Production: `nodejs_compat`
      - Preview: `nodejs_compat`

   d. (Optional) Set **Compatibility date** to: `2024-11-19`

   e. Click **Save**

5. **Add Environment Variables**

   In the same Settings page:

   a. Go to **Environment variables** section

   b. Add the following for both **Production** and **Preview**:
      ```
      Variable name: GEMINI_API_KEY
      Value: your_actual_api_key_here
      ```

   c. Click **Save**

6. **Access Your Deployment**

   Your app will be available at:
   - Production: `https://octocat-generator.pages.dev`
   - Preview deployments: `https://[hash].octocat-generator.pages.dev`

#### Subsequent Deployments

After the initial setup, redeploy with:
```bash
npm run pages:deploy
```

The compatibility flags and environment variables will persist across deployments.

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add `GEMINI_API_KEY` to environment variables
4. Deploy!

### Other Platforms

The app is a standard Next.js application and can be deployed to any platform that supports Node.js:
- Netlify
- AWS Amplify
- Digital Ocean
- Railway
- Self-hosted

Remember to set the `GEMINI_API_KEY` environment variable on your hosting platform.

## Troubleshooting

### Cloudflare: "no nodejs_compat compatibility flag set" error
This error appears when the Node.js compatibility flag isn't enabled on Cloudflare Pages.

**Solution**:
1. Go to your Cloudflare Dashboard
2. Navigate to **Workers & Pages** → **your-project** → **Settings** → **Functions**
3. Add `nodejs_compat` to the **Compatibility flags** for both Production and Preview
4. Save and redeploy (or just wait a moment - existing deployments will work after saving)

See the [Deployment](#deployment) section for detailed instructions.

### "Invalid API key" error
- Verify your API key is correct in `.env.local` (local dev) or environment variables (production)
- Ensure the API key has the necessary permissions
- Check that you're using the Gemini API (not a different Google API key)
- For Cloudflare: Make sure you've added the environment variable to both Production and Preview

### "Model not available" error
- Imagen 3 access may require additional setup or credits
- Check your API quota and limits at [Google AI Studio](https://aistudio.google.com/)
- Ensure your API key has access to image generation models

### Camera not working
- Grant camera permissions in your browser
- Use HTTPS (camera API requires secure context)
- Try the file upload option instead

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Google Gemini AI](https://ai.google.dev/)
- Inspired by GitHub's [Octocat](https://octodex.github.com/)
