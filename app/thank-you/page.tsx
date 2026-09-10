import Link from 'next/link';

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
            <li>Cek pesan atau email yang kamu gunakan saat pembayaran.</li>
            <li>Simpan bukti pembayaran sampai akses paket aktif.</li>
            <li>Masuk ke grup support saat undangan akses sudah diterima.</li>
          </ol>
        </div>

        <Link className="cta" href="/">
          Kembali ke halaman utama
        </Link>
      </section>
    </main>
  );
}
