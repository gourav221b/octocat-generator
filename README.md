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
- **Deployment**: Ready for Vercel, Netlify, or any Node.js hosting

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
├── .env.local                 # Environment variables (create this)
├── .env.example               # Example environment file
├── package.json               # Dependencies
└── README.md                  # This file
```

## Deployment

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

### "Invalid API key" error
- Verify your API key is correct in `.env.local`
- Ensure the API key has the necessary permissions
- Check that you're using the Gemini API (not a different Google API key)

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
