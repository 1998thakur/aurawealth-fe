import { NextRequest, NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://creditbrain.in';
const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? '';
const INDEXNOW_KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

/**
 * POST /api/indexnow
 * Body: { urls: string[] }  — list of absolute URLs to submit
 * Header: Authorization: Bearer <INDEXNOW_SUBMIT_SECRET>
 *
 * Usage (from a deploy hook or content publish webhook):
 *   curl -X POST https://creditbrain.in/api/indexnow \
 *     -H "Authorization: Bearer $INDEXNOW_SUBMIT_SECRET" \
 *     -H "Content-Type: application/json" \
 *     -d '{"urls":["https://creditbrain.in/cards/hdfc-regalia"]}'
 */
export async function POST(req: NextRequest) {
  if (!INDEXNOW_KEY) {
    return NextResponse.json({ error: 'INDEXNOW_KEY not configured' }, { status: 503 });
  }

  // Simple bearer-token auth so the endpoint can't be abused by third parties
  const secret = process.env.INDEXNOW_SUBMIT_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization') ?? '';
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  let urls: string[] = [];
  try {
    const body = await req.json();
    urls = Array.isArray(body.urls) ? body.urls : [];
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (urls.length === 0) {
    return NextResponse.json({ error: 'No URLs provided' }, { status: 400 });
  }

  const payload = {
    host: new URL(SITE_URL).hostname,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: urls,
  };

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });
    return NextResponse.json({ status: res.status, submitted: urls.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
