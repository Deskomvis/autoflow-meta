import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Auto Flow Meta Ads dengan Claude AI | Gus Rezha Cozy',
  description:
    'Bangun alur riset, landing page, creative, dan campaign melalui Claude AI untuk produk fisik, produk digital, maupun jasa. 9 video teknis, 8 file modul, grup support, dan bonus riset. Harga launch Rp497.000.',
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
