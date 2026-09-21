'use client';

import { useEffect } from 'react';

type MetaFbq = (
  command: 'track',
  eventName: 'Purchase',
  parameters: Record<string, unknown>,
  options: { eventID: string },
) => void;

export default function MetaPurchase({
  reference,
  value,
}: {
  reference: string;
  value: number;
}) {
  useEffect(() => {
    let attempts = 0;
    const send = () => {
      const fbq = (window as typeof window & { fbq?: MetaFbq }).fbq;
      if (!fbq && attempts++ < 20) return false;
      fbq?.(
        'track',
        'Purchase',
        {
          currency: 'IDR',
          value,
          content_name: 'Auto Flow Meta Ads dengan Claude AI',
          content_type: 'product',
          content_ids: ['autoflow-meta'],
          num_items: 1,
        },
        { eventID: `purchase-${reference}` },
      );
      return true;
    };
    if (send()) return;
    const interval = window.setInterval(() => {
      if (send()) window.clearInterval(interval);
    }, 250);

    return () => window.clearInterval(interval);
  }, [reference, value]);

  return null;
}
