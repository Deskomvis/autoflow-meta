'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';

const filesUrl =
  'https://drive.google.com/drive/folders/1GlUFAsbVnToGVeD9cpcLAYxnd__S7eJr?usp=sharing';
const telegramUrl = 'https://t.me/+v8NHYYcrq-9jMWM1';

const lessons = [
  { id: 'h69NhYHnvCM', title: 'Video 1' },
  { id: 'm0Ee0wluBpE', title: 'Video 2' },
  { id: 'iLj4hnRTcbk', title: 'Video 3' },
  { id: 'Cgi8QuN2iW4', title: 'Video 4' },
  { id: 'OjUu5oRyc2g', title: 'Video 5' },
  { id: 'bNBMBu3IIYs', title: 'Video 6' },
  { id: 'P4S2N_O3Uz4', title: 'Video 7' },
  { id: 'vlsV_BDfJAo', title: 'Video 8' },
  { id: 'sBS3uB2pE1M', title: 'Video 9' },
];

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
  const [activeLesson, setActiveLesson] = useState(0);

  useEffect(() => {
    const savedReference = sessionStorage.getItem('afm-membership-ref');
    if (!savedReference) return;

    setReference(savedReference);

    // A saved code must be re-checked with the server before the course is
    // shown again — sessionStorage on its own is not proof of access.
    let cancelled = false;
    fetch('/api/membership/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: savedReference }),
    })
      .then(async response => {
        const body = (await response.json().catch(() => null)) as {
          reference?: string;
        } | null;
        if (cancelled) return;
        if (response.ok && body?.reference) {
          setVerifiedReference(body.reference);
        } else {
          sessionStorage.removeItem('afm-membership-ref');
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
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
          <div className="course-main">
            <div className="course-player">
              <iframe
                key={lessons[activeLesson].id}
                src={`https://www.youtube-nocookie.com/embed/${lessons[activeLesson].id}?rel=0`}
                title={`${lessons[activeLesson].title} — Auto Flow Meta Ads`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="course-now">
              <p className="eyebrow">
                Sedang diputar · Video {activeLesson + 1} dari {lessons.length}
              </p>
              <h2>{lessons[activeLesson].title}</h2>
            </div>
          </div>

          <aside className="course-playlist">
            <div className="course-playlist-head">
              <p className="eyebrow">Playlist Video Kursus</p>
              <span>{lessons.length} video</span>
            </div>
            <ol>
              {lessons.map((lesson, index) => (
                <li key={lesson.id}>
                  <button
                    type="button"
                    className={index === activeLesson ? 'is-active' : undefined}
                    aria-current={index === activeLesson ? 'true' : undefined}
                    onClick={() => setActiveLesson(index)}
                  >
                    <span className="lesson-num">{index + 1}</span>
                    <span className="lesson-title">{lesson.title}</span>
                  </button>
                </li>
              ))}
            </ol>
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
          </aside>

          <div className="course-resources">
            <h3>Modul dan support</h3>
            <a className="cta" href={filesUrl} target="_blank" rel="noreferrer">
              Download Modul (Google Drive)
            </a>
            <a
              className="resource-link"
              href={telegramUrl}
              target="_blank"
              rel="noreferrer"
            >
              Gabung grup support Telegram
            </a>
          </div>

          <p className="fineprint course-fineprint">
            Link ini khusus pembeli Auto Flow Meta Ads. Jangan bagikan akses
            dashboard, modul, atau grup support ke orang lain.
          </p>
        </section>
      ) : null}
    </main>
  );
}
