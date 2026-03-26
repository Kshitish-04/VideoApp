// Supabase Edge Function: delete-video
// Deploy this at: supabase/functions/delete-video/index.ts
// Deploy with:  supabase functions deploy delete-video

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CLOUDINARY_CLOUD_NAME = Deno.env.get('CLOUDINARY_CLOUD_NAME') ?? 'db9bs07ak';
const CLOUDINARY_API_KEY = Deno.env.get('CLOUDINARY_API_KEY') ?? '727966384386125';
const CLOUDINARY_API_SECRET = Deno.env.get('CLOUDINARY_API_SECRET') ?? 'haYk2Sggt5zK4lrnYIuPu_mmP74';

async function sha1(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const { public_id } = await req.json();
    if (!public_id) {
      return new Response(JSON.stringify({ error: 'public_id required' }), { status: 400 });
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signatureString = `public_id=${public_id}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    const signature = await sha1(signatureString);

    const formData = new FormData();
    formData.append('public_id', public_id);
    formData.append('timestamp', timestamp);
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('signature', signature);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/destroy`,
      { method: 'POST', body: formData }
    );

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
