import { createHash, createHmac } from 'node:crypto';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const DEFAULT_LIBRARY_ID = '569248';
const DEFAULT_VIDEO_ID = '39d09d46-a9b2-4438-b9fa-c23c85a289ef';
const DEFAULT_CDN_HOSTNAME = 'vz-2ac4896e-ee8.b-cdn.net';
const TOKEN_TTL_SECONDS = 60 * 60;

function base64Url(buffer: Buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function signPath({
  cdnHostname,
  key,
  path,
  allowedPath,
  expires,
}: {
  cdnHostname: string;
  key: string;
  path: string;
  allowedPath: string;
  expires: number;
}) {
  const params = new URLSearchParams({ token_path: allowedPath });
  const signingData = Array.from(params.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, value]) => `${name}=${value}`)
    .join('&');
  const signaturePath = allowedPath;
  const version = (process.env.BUNNY_STREAM_TOKEN_VERSION || 'legacy').toLowerCase();

  const token =
    version === 'hmac'
      ? `HS256-${base64Url(createHmac('sha256', key).update(`${signaturePath}${expires}${signingData}`).digest())}`
      : base64Url(createHash('sha256').update(`${key}${signaturePath}${expires}${signingData}`).digest());

  return `https://${cdnHostname}/bcdn_token=${token}&expires=${expires}&token_path=${encodeURIComponent(allowedPath)}${path}`;
}

export async function GET() {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID || DEFAULT_LIBRARY_ID;
  const videoId = process.env.BUNNY_STREAM_VIDEO_ID || DEFAULT_VIDEO_ID;
  const cdnHostname = process.env.BUNNY_STREAM_CDN_HOSTNAME || DEFAULT_CDN_HOSTNAME;
  const signingKey = process.env.BUNNY_STREAM_SIGNING_KEY;

  if (!signingKey) {
    return NextResponse.json(
      {
        error: 'BUNNY_STREAM_SIGNING_KEY belum diisi di .env.local.',
      },
      { status: 500 },
    );
  }

  if (cdnHostname.includes('mediadelivery.net')) {
    return NextResponse.json(
      {
        error: 'BUNNY_STREAM_CDN_HOSTNAME harus memakai hostname CDN HLS, misalnya vz-2ac4896e-ee8.b-cdn.net.',
      },
      { status: 500 },
    );
  }

  const videoPath = `/${videoId}/`;
  const expires = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;

  return NextResponse.json({
    libraryId,
    videoId,
    playlistUrl: signPath({
      cdnHostname,
      key: signingKey,
      path: `${videoPath}playlist.m3u8`,
      allowedPath: videoPath,
      expires,
    }),
    posterUrl: signPath({
      cdnHostname,
      key: signingKey,
      path: `${videoPath}thumbnail_5b505ba4.jpg`,
      allowedPath: videoPath,
      expires,
    }),
  });
}
