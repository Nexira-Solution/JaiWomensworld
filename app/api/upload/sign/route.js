// Save as: app/api/upload/sign/route.js
// Admin-only. Returns a short-lived presigned URL so the browser can PUT a file
// straight into R2, skipping Vercel's 4.5 MB request limit.
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import { r2, R2_BUCKET, IMAGE_TYPES, VIDEO_TYPES, cleanFolder, makeKey, publicUrl, missingR2Env } from '@/lib/r2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Keep these in sync with MAX_IMAGE_MB / MAX_VIDEO_MB in app/admin/reels/page.js
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB (client checks after shrinking)
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB

export const POST = requireAdmin(async (req) => {
  // Fail with a readable message (variable names only, never values) if setup is incomplete
  const missing = missingR2Env();
  if (missing.length) {
    return NextResponse.json(
      { error: `Missing environment variables: ${missing.join(', ')}` },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const contentType = String(body.contentType || '').toLowerCase().trim();
  const size = Number(body.size) || 0;

  const isImage = !!IMAGE_TYPES[contentType];
  const isVideo = !!VIDEO_TYPES[contentType];
  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: `Unsupported file type${contentType ? ` (${contentType})` : ''}` },
      { status: 415 }
    );
  }

  if (size <= 0) {
    return NextResponse.json({ error: 'Empty file' }, { status: 400 });
  }

  const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (size > maxBytes) {
    const maxMb = maxBytes / 1024 / 1024;
    const gotMb = (size / 1024 / 1024).toFixed(1);
    return NextResponse.json(
      { error: `File is ${gotMb} MB. Max is ${maxMb} MB.` },
      { status: 413 }
    );
  }

  try {
    const key = makeKey(cleanFolder(body.folder, 'reels'), contentType);
    const uploadUrl = await getSignedUrl(
      r2,
      // ContentType is part of the signature: the browser PUT must send the same Content-Type
      new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, ContentType: contentType }),
      { expiresIn: 600 } // 10 minutes, enough for slow mobile connections
    );
    return NextResponse.json({ uploadUrl, publicUrl: publicUrl(key) });
  } catch (err) {
    console.error('Sign failed:', err);
    return NextResponse.json(
      { error: `Could not create upload link: ${err.message}` },
      { status: 500 }
    );
  }
});
