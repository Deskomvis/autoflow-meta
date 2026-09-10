'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';

const playlistUrl = 'https://www.youtube.com/playlist?list=PLQW0jrbG2HJ0';
const playlistEmbedUrl =
  'https://www.youtube-nocookie.com/embed/videoseries?list=PLQW0jrbG2HJ0';
const filesUrl =
  'https://drive.google.com/drive/folders/1GlUFAsbVnToGVeD9cpcLAYxnd__S7eJr?usp=sharing';

type MembershipDashboardProps = {
  initialReference: string;
};

export default function MembershipDashboard({
  initialReference,
}: MembershipDashboardProps) {
  const [reference, setReference] = useState(initialReference);
  const [verifiedReference, setVerifiedReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedReference = sessionStorage.getItem('afm-membership-ref');
    if (savedReference) {
      setReference(savedReference);
      setVerifiedReference(savedReference);
    }
  }, []);

  async function verifyAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/membership/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
      });
      const body = (await response.json().catch(() => null)) as {
        reference?: string;
        message?: string;
      } | null;

      if (!response.ok || !body?.reference) {
        throw new Error(body?.message || 'Kode referensi belum cocok.');
      }

      sessionStorage.setItem('afm-membership-ref', body.reference);
      setVerifiedReference(body.reference);
    } catch (verifyError) {
      setVerifiedReference('');
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : 'Kode referensi belum cocok.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="membership-page">
      <section className="membership-hero wrap">
        <div>
          <Link className="brand" href="/">
            AUTO<span>FLOW</span>
            <small>MEMBERSHIP AREA</small>
          </Link>
          <p className="eyebrow">DASHBOARD MEMBERSHIP</p>
          <h1>Masuk dengan kode referensi pembayaranmu.</h1>
          <p>
            Setelah kode cocok, kamu bisa menonton playlist course dan membuka
            folder file tambahan dari satu halaman.
          </p>
        </div>

        <form className="access-panel" onSubmit={verifyAccess}>
          <label htmlFor="reference-code">Kode referensi</label>
          <div className="access-input-row">
            <input
              id="reference-code"
              name="reference"
              value={reference}
              onChange={event => setReference(event.target.value)}
              placeholder="AFM-MTUX9YKZ"
              autoComplete="off"
            />
            <button className="cta" disabled={loading}>
              {loading ? 'Memeriksa...' : 'Buka akses'}
            </button>
          </div>
          {error ? (
            <output className="checkout-error">{error}</output>
          ) : (
            <p className="fineprint">
              Gunakan kode referensi dari halaman sukses pembayaran.
            </p>
          )}
        </form>
      </section>

      {verifiedReference ? (
        <section className="membership-content wrap" aria-live="polite">
          <div className="course-player">
            <iframe
              src={playlistEmbedUrl}
              title="Playlist Auto Flow Meta Ads dengan Claude AI"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <aside className="course-sidebar">
            <p className="eyebrow">AKSES AKTIF</p>
            <h2>Course dan file tambahan</h2>
            <div className="thankyou-summary">
              <div>
                <span>Status</span>
                <strong>Terbuka</strong>
              </div>
              <div>
                <span>Referensi</span>
                <strong>{verifiedReference}</strong>
              </div>
            </div>
            <a
              className="cta"
              href={filesUrl}
              target="_blank"
              rel="noreferrer"
            >
              Download semua file tambahan
            </a>
            <a
              className="text-button"
              href={playlistUrl}
              target="_blank"
              rel="noreferrer"
            >
              Buka playlist di YouTube
            </a>
            <p className="fineprint">
              Link ini khusus pembeli Auto Flow Meta Ads. Jangan bagikan akses
              dashboard atau folder materi ke orang lain.
            </p>
          </aside>
        </section>
      ) : null}
    </main>
  );
}
