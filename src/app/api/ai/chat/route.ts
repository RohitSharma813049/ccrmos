import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Property from '@/modules/properties/schemas/Property';

export async function POST(req: Request) {
  try {
    const { message, companyId } = await req.json();

    if (!message || !companyId) {
      return NextResponse.json({ error: "Message and companyId are required" }, { status: 400 });
    }

    await dbConnect();

    // 1. Embed the User's Query using OpenAI
    let queryEmbedding: number[] = [];
    
    if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: message,
          model: "text-embedding-3-small"
        })
      });
      const data = await response.json();
      queryEmbedding = data.data[0].embedding;
    } else {
      // Mock embedding
      queryEmbedding = Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
    }

    // 2. Perform MongoDB Atlas Vector Search
    // Note: This requires an Atlas Vector Search Index to be created in the MongoDB UI
    // with dimensions: 1536, similarity: "cosine", type: "vector"
    let matchedProperties = [];
    
    try {
       const vectorSearchAggregation = [
        {
          $vectorSearch: {
            index: "vector_index", // Name of the index in Atlas
            path: "embedding",
            queryVector: queryEmbedding,
            numCandidates: 100,
            limit: 3
          }
        },
        {
          $project: {
            title: 1,
            description: 1,
            price: 1,
            currency: 1,
            location: 1,
            bedrooms: 1,
            score: { $meta: "vectorSearchScore" }
          }
        }
      ];
      
      // We wrap this in a try-catch because it will fail locally if the Atlas Index isn't built yet
      matchedProperties = await Property.aggregate(vectorSearchAggregation);
    } catch (vectorError) {
      console.warn("Vector Search Failed (Index likely missing). Falling back to text search.", vectorError);
      // Fallback if vector index doesn't exist yet
      matchedProperties = await Property.find({ companyId, status: "Available" }).limit(3).lean();
    }

    // 3. Construct the RAG Prompt for GPT-4o
    const propertyContext = matchedProperties.map(p => 
      `- ${p.title} in ${p.location} for ${p.price} ${p.currency || 'USD'} (${p.bedrooms} beds). Description: ${p.description}`
    ).join("\n");

    const systemPrompt = `
      You are an expert real estate AI assistant for a luxury brokerage.
      A client has asked the following: "${message}"
      
      Use the following available properties from our database to answer their question:
      ${propertyContext || "No exact matches found. Apologize and offer to keep looking."}
      
      Be conversational, persuasive, and professional.
    `;

    // 4. Generate the Chat Response
    if (process.env.OPENAI_API_KEY) {
       const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "system", content: systemPrompt }]
        })
      });
      
      const chatData = await chatResponse.json();
      return NextResponse.json({ 
        reply: chatData.choices[0].message.content,
        propertiesUsed: matchedProperties
      });
    } else {
       return NextResponse.json({ 
        reply: "This is a mock response from the RAG pipeline. To enable full AI functionality, please add your OPENAI_API_KEY to the .env file.",
        propertiesUsed: matchedProperties
      });
    }

  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
