import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Property from '@/modules/properties/schemas/Property';

export async function POST(req: Request) {
  try {
    const { propertyId } = await req.json();
    
    if (!propertyId) {
      return NextResponse.json({ error: "Property ID required" }, { status: 400 });
    }

    await dbConnect();
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Prepare semantic text for OpenAI
    const textToEmbed = `
      Title: ${property.title}
      Description: ${property.description || 'N/A'}
      Type: ${property.type}
      Price: ${property.price} ${property.currency || 'USD'}
      Location: ${property.location}
      Bedrooms: ${property.bedrooms || 'N/A'}
      Bathrooms: ${property.bathrooms || 'N/A'}
      Status: ${property.status}
    `.trim();

    // Call OpenAI Embeddings API (Mocked for safety if API key is missing)
    let embedding: number[] = [];
    
    if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: textToEmbed,
          model: "text-embedding-3-small"
        })
      });
      
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        embedding = data.data[0].embedding;
      } else {
        throw new Error("Failed to generate embedding from OpenAI");
      }
    } else {
      // Generate a mock 1536-dimensional array for testing without an API key
      embedding = Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
    }

    // Save the vector back to MongoDB
    property.embedding = embedding;
    await property.save();

    return NextResponse.json({ 
      success: true, 
      message: "Property semantically embedded successfully" 
    });

  } catch (error: any) {
    console.error("Embedding Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
