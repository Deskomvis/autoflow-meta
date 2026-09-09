import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Auto Flow Prodig Meta Ads dengan Claude AI | Gus Rezha Cozy',
  description:
    'Bangun alur riset, landing page, creative, dan campaign melalui Claude AI. 9 video teknis, 8 file modul, grup support, dan bonus 100+ data riset iklan produk digital. Rp499.000.',
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className="dark">
      <body>{children}</body>
    </html>
  );
}
