import Link from 'next/link';
import { syncPaidMembershipAccessFromPaymentLink } from '@/lib/singapay-paid-sync';

type ThankYouPageProps = {
  searchParams?: Promise<{
    ref?: string;
  }>;
};

export const metadata = {
  title: 'Pembayaran Selesai | Auto Flow Meta Ads',
  description:
    'Terima kasih. Pembayaran Auto Flow Meta Ads sudah selesai dan akses paket sedang diproses.',
};

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const params = await searchParams;
  const reference = params?.ref;

  if (reference) {
    await syncPaidMembershipAccessFromPaymentLink(reference, 'thank_you_return').catch(
      error => {
        console.warn(
          'thank-you-paid-sync-failed',
          JSON.stringify({
            reference,
            message: error instanceof Error ? error.message : 'Unknown error',
          }),
        );
      },
    );
  }

  return (
    <main className="thankyou-page">
      <section className="thankyou-panel wrap" aria-labelledby="thankyou-title">
        <p className="eyebrow">PEMBAYARAN SELESAI</p>
        <h1 id="thankyou-title">
          Terima kasih.
          <br />
          Aksesmu sedang kami siapkan.
        </h1>
        <p className="thankyou-lead">
          Transaksi Auto Flow Meta Ads sudah diterima. Simpan halaman ini jika
          kamu butuh mencocokkan nomor referensi saat proses aktivasi akses.
        </p>

        <div className="thankyou-summary" aria-label="Ringkasan pembayaran">
          <div>
            <span>Paket</span>
            <strong>Auto Flow Meta Ads dengan Claude AI</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>Selesai</strong>
          </div>
          {reference ? (
            <div>
              <span>Referensi</span>
              <strong>{reference}</strong>
            </div>
          ) : null}
        </div>

        <div className="thankyou-next">
          <h2>Langkah berikutnya</h2>
          <ol>
            <li>Simpan kode referensi untuk akses.</li>
            <li>Masuk dashboard membership dan input kode akses.</li>
            <li>Lihat video dan download modul.</li>
            <li>Join grup Telegram.</li>
          </ol>
          <p className="thankyou-help">
            Jika kode akses gagal, info saya: Wa 085741813147
          </p>
        </div>

        <Link
          className="cta"
          href={`/membership${reference ? `?ref=${encodeURIComponent(reference)}` : ''}`}
        >
          Buka Dashboard Membership
        </Link>
      </section>
    </main>
  );
}
