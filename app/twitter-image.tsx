import { ImageResponse } from 'next/og';
import { OgCardContent } from '@/components/og-card';

export const runtime = 'edge';

export const alt = 'Lunara — Your cycle. Your comfort.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function TwitterImage() {
  return new ImageResponse(<OgCardContent />, {
    ...size,
  });
}
