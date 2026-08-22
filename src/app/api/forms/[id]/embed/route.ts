import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Form from '@/modules/forms/schemas/Form';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const { id } = await params;
    const form = await Form.findById(id);

    if (!form || !form.isActive) {
      return NextResponse.json({ error: "Form not found or inactive" }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Generate an iFrame embed string as Javascript
    const scriptContent = `
      (function() {
        var container = document.getElementById('crmos-form-${id}');
        if (!container) {
          console.error("CRM OS Form Error: Container div with id 'crmos-form-${id}' not found on the page.");
          return;
        }
        var iframe = document.createElement('iframe');
        iframe.src = '${appUrl}/f/${id}';
        iframe.style.width = '100%';
        iframe.style.minHeight = '500px';
        iframe.style.border = 'none';
        iframe.style.background = 'transparent';
        container.appendChild(iframe);
      })();
    `;

    return new NextResponse(scriptContent, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
