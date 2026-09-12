import { NextResponse } from 'next/server';

const primaryVideoUrl = 'https://cdn.vistudio.id/Teaser%20autoflow.mp4';
const fallbackVideoUrl = 'https://vistudio.b-cdn.net/Teaser%20autoflow.mp4';

export async function GET() {
  return NextResponse.json({
    videoUrl: primaryVideoUrl,
    fallbackVideoUrl,
    playlistUrl: primaryVideoUrl,
    posterUrl: '/images/autoflow-teaser-cover.webp',
  });
}
