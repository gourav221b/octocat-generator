import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as Blob;
    const apiKey = formData.get('apiKey') as string;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json(
        { error: 'No API key provided' },
        { status: 400 }
      );
    }

    // Initialize Gemini with user-provided API key
    const genAI = new GoogleGenerativeAI(apiKey.trim());

    // Convert image to base64
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Use Gemini Vision to analyze the image
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const analysisPrompt = `Analyze this person's photo and describe their key features in detail for creating a personalized GitHub Octocat avatar. Focus on:
- Hair style and color
- Facial features (glasses, facial hair, distinctive features)
- Clothing style or accessories
- Any unique characteristics or style elements
- Overall personality vibe

Provide a concise but detailed description.`;

    const analysisParts = [
      { text: analysisPrompt },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image,
        },
      },
    ];

    const analysisResult = await model.generateContent(analysisParts);
    const description = analysisResult.response.text();

    // Generate Octocat image using Imagen
    const octocatPrompt = `Create a GitHub Octocat character with the following characteristics: ${description}

Style requirements:
- Must be a cute, cartoon octopus-cat hybrid (Octocat) similar to GitHub's mascot
- Prominent GitHub Octocat features: round head, cat ears, tentacle body
- Incorporate the person's unique features creatively into the Octocat design
- Friendly, welcoming expression
- Clean, vector-art style with smooth gradients
- Professional quality suitable for a profile picture
- White or transparent background
- Centered composition

The Octocat should clearly be recognizable as GitHub's mascot while having personalized touches that reflect the individual's characteristics.`;

    // Use Imagen 3 to generate the image
    const imageModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

    const imageResult = await imageModel.generateContent([
      { text: octocatPrompt }
    ]);

    // Extract the generated image
    const response = imageResult.response;
    const candidates = response.candidates;

    if (!candidates || candidates.length === 0) {
      throw new Error('No image generated');
    }

    // Get the first candidate's content
    const generatedContent = candidates[0].content;
    const parts = generatedContent.parts;

    if (!parts || parts.length === 0) {
      throw new Error('No image data in response');
    }

    // Find the inline data part
    const imagePart = parts.find((part: any) => part.inlineData);

    if (!imagePart || !imagePart.inlineData) {
      throw new Error('No image data found');
    }

    const imageData = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType || 'image/png';

    // Return the generated image as base64
    const imageUrl = `data:${mimeType};base64,${imageData}`;

    return NextResponse.json({
      success: true,
      imageUrl,
      description,
    });

  } catch (error: any) {
    console.error('Error generating Octocat:', error);

    // Provide helpful error messages
    let errorMessage = 'Failed to generate Octocat';

    if (error.message?.includes('API key')) {
      errorMessage = 'Invalid API key. Please check your Gemini API key.';
    } else if (error.message?.includes('quota')) {
      errorMessage = 'API quota exceeded. Please try again later.';
    } else if (error.message?.includes('model')) {
      errorMessage = 'Image generation model not available. Please check your API access.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
