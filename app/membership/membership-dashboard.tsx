'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ProfileSection from './profile-section';

const filesUrl =
  'https://drive.google.com/drive/folders/1GlUFAsbVnToGVeD9cpcLAYxnd__S7eJr?usp=sharing';
const telegramUrl = 'https://t.me/+v8NHYYcrq-9jMWM1';

const seriesCourses = [
  {
    image: '/images/claude-mcp-ws.webp',
    title: 'Auto Flow Meta Ads',
    subtitle: 'Flow Orchestration Claude AI MCP · Scalev, Meta Ads, Vistudio, Cloudinary',
    unlocked: true,
  },
  {
    image: '/images/vibecoding-monetize.webp',
    title: 'Vibe Coding Monetize Plan',
    subtitle: 'Membangun pabrik digital ala vibe coding jalanan',
    unlocked: false,
  },
  {
    image: '/images/aichat-ctwa.webp',
    title: '24/7 AI Chat for CTWA',
    subtitle: 'CRM auto flow untuk iklan CTWA yang bekerja non stop',
    unlocked: false,
  },
  {
    image: '/images/hermes-agent-flow.webp',
    title: 'Hermes Agent Flow for Business',
    subtitle: 'Agent auto flow 24 jam untuk daily task bisnis',
    unlocked: false,
  },
];

// A note line that starts with "*" renders as an italic hint instead of a bullet.
const lessons = [
  {
    id: 'h69NhYHnvCM',
    title: 'Intro Claude MCP',
    notes: [
      'Silakan langganan Claude Pro.',
      'Download Claude for Desktop dan login dengan akun Claude browser yang sudah upgrade Pro.',
      'Buka menu Customize lalu klik tab Connectors.',
    ],
  },
  {
    id: 'm0Ee0wluBpE',
    title: 'Menghubungkan Meta Ads MCP di Claude Connector',
    notes: [
      'Input URL MCP Meta Ads: https://mcp.facebook.com/ads',
      '*Pastikan sudah login Facebook di browser (akun yang terhubung Business Manager).',
    ],
  },
  {
    id: 'iLj4hnRTcbk',
    title: 'Menghubungkan Scalev MCP di Claude Connector',
    notes: [
      'Input URL MCP Scalev: https://mcp.scalev.com/mcp',
      '*Pastikan sudah login Scalev di browser (membership masih aktif).',
    ],
  },
  {
    id: 'Cgi8QuN2iW4',
    title: 'Menghubungkan Vistudio MCP di Claude Connector',
    notes: [
      'Input URL MCP Vistudio: https://vistudio.id/mcp',
      '*Pastikan sudah login Vistudio di browser (membership masih aktif).',
    ],
  },
  {
    id: 'OjUu5oRyc2g',
    title: 'Menghubungkan Cloudinary MCP ke Claude Connector',
    notes: [
      'Bikin akun gratis di https://cloudinary.com',
      'Isikan key sesuai yang ditunjukkan di video.',
    ],
  },
  {
    id: 'bNBMBu3IIYs',
    title: 'Install Skill dan Schema LP Scalev Builder',
    notes: [
      'Download modul Google Drive, buka folder "Upload Skill & Schema". Atau lewat link: https://drive.google.com/drive/folders/1B1uh_M_4LJHEFSjn1vR7jU4Y3KCTp9QD?usp=sharing',
      'Stepnya: Upload skill > Upload 2 file referensi schema > Upload contoh file template Scalev berisi komponen untuk LP model builder.',
    ],
  },
  {
    id: 'P4S2N_O3Uz4',
    title: 'Generate Ad Creative menggunakan Vistudio.id MCP di Claude',
    notes: [
      'Generate static ad creative (gambar) menggunakan Vistudio MCP dan minta upload ke Cloudinary.',
      '*Coba lebih kreatif memberi instruksi prompt. Contoh di video hanya contoh. Kamu juga bisa membuat video pakai model yang tersedia di Vistudio, cukup ketik perintah dan prompt-nya.',
    ],
  },
  {
    id: 'vlsV_BDfJAo',
    title: 'Create Campaign Menggunakan Meta Ads MCP di Claude',
    notes: [
      'Prompt dan eksplorasi custom bisa dikreasikan lagi, misal pakai struktur campaign selain 1-1-3. Edit budget default, pakai Page FB tertentu, atau penargetan custom bisa ditambahkan ke prompt.',
      'Sesi Meta Ad MCP ini juga bisa dipakai untuk: analisa iklan, buat rules campaign, tambah ad creative, editing campaign, riset, dan semua hal yang bisa diakses Claude.',
    ],
  },
  {
    id: 'sBS3uB2pE1M',
    title: 'Cara Riset Menggunakan META MCP di Claude',
    notes: [
      'Buat riset mendalam dengan niche/kategori pilihanmu. Kamu bisa eksplor iklan di Ad Library dengan Claude + MCP Meta Ad.',
    ],
  },
];

function renderNoteText(text: string) {
  return text.split(/(https?:\/\/[^\s]+)/g).map((part, index) =>
    /^https?:\/\//.test(part) ? (
      <a key={index} href={part} target="_blank" rel="noreferrer">
        {part}
      </a>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

function LessonNotes({ notes }: { notes: string[] }) {
  if (!notes.length) return null;

  return (
    <div className="course-notes">
      <h3>Catatan video</h3>
      <ul>
        {notes.map((note, index) => {
          const isHint = note.startsWith('*');
          return (
            <li key={index} className={isHint ? 'is-hint' : undefined}>
              {renderNoteText(isHint ? note.slice(1).trim() : note)}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Jump to the next video just before the current one ends so YouTube's
// end-screen (branding + recommended videos) never gets a chance to render.
const END_SKIP_SECONDS = 0.4;

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function loadYouTubeApi(): Promise<any> {
  if (window.YT?.Player) return Promise.resolve(window.YT);

  return new Promise(resolve => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT);
    };
    if (!document.querySelector('script[data-yt-api]')) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.dataset.ytApi = 'true';
      document.head.appendChild(script);
    }
  });
}

function forceHd(player: any) {
  try {
    player.setPlaybackQualityRange?.('hd1080', 'hd1080');
    player.setPlaybackQuality?.('hd1080');
  } catch {
    // YouTube may ignore the hint; nothing else we can do from the embed.
  }
}

type CoursePlayerProps = {
  videoId: string;
  title: string;
  hasNext: boolean;
  onRequestNext: () => void;
};

function CoursePlayer({
  videoId,
  title,
  hasNext,
  onRequestNext,
}: CoursePlayerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const advancedRef = useRef(false);
  const videoIdRef = useRef(videoId);
  videoIdRef.current = videoId;
  const hasNextRef = useRef(hasNext);
  hasNextRef.current = hasNext;
  const onRequestNextRef = useRef(onRequestNext);
  onRequestNextRef.current = onRequestNext;

  useEffect(() => {
    let disposed = false;

    const stopTick = () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };

    const advance = () => {
      if (advancedRef.current || !hasNextRef.current) return;
      advancedRef.current = true;
      stopTick();
      onRequestNextRef.current();
    };

    const startTick = () => {
      stopTick();
      tickRef.current = setInterval(() => {
        const player = playerRef.current;
        if (!player?.getDuration) return;
        const duration = player.getDuration();
        const current = player.getCurrentTime();
        if (duration > 0 && duration - current <= END_SKIP_SECONDS) {
          advance();
        }
      }, 200);
    };

    loadYouTubeApi().then(YT => {
      if (disposed || !mountRef.current || playerRef.current) return;

      playerRef.current = new YT.Player(mountRef.current, {
        width: '100%',
        height: '100%',
        videoId: videoIdRef.current,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          iv_load_policy: 3,
          vq: 'hd1080',
        },
        events: {
          onReady: (event: any) => forceHd(event.target),
          onPlaybackQualityChange: (event: any) => {
            if (event.data !== 'hd1080' && event.data !== 'highres') {
              forceHd(event.target);
            }
          },
          onStateChange: (event: any) => {
            if (event.data === YT.PlayerState.PLAYING) {
              startTick();
            } else {
              stopTick();
            }
            if (event.data === YT.PlayerState.ENDED) {
              advance();
            }
          },
        },
      });
    });

    return () => {
      disposed = true;
      stopTick();
      try {
        playerRef.current?.destroy?.();
      } catch {
        // player already torn down
      }
      playerRef.current = null;
    };
  }, []);

  useEffect(() => {
    advancedRef.current = false;
    const player = playerRef.current;
    if (player?.loadVideoById) {
      player.loadVideoById(videoId);
      forceHd(player);
    }
  }, [videoId]);

  return (
    <div
      className="course-player"
      onContextMenu={event => event.preventDefault()}
    >
      <div ref={mountRef} title={title} />
      <span className="course-player-guard" aria-hidden="true" />
    </div>
  );
}

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
  const [activeTab, setActiveTab] = useState<'course' | 'profile'>('course');

  const goToNextLesson = useCallback(() => {
    setActiveLesson(current =>
      current < lessons.length - 1 ? current + 1 : current,
    );
  }, []);

  useEffect(() => {
    const savedReference = sessionStorage.getItem('afm-membership-ref');
    if (!savedReference) return;

    setReference(savedReference);

    // A saved code must be re-checked with the server before the course is
    // shown again. sessionStorage on its own is not proof of access.
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
        <>
          <nav className="membership-tabs wrap" aria-label="Menu membership">
            <button
              type="button"
              className={activeTab === 'course' ? 'is-active' : undefined}
              aria-current={activeTab === 'course' ? 'page' : undefined}
              onClick={() => setActiveTab('course')}
            >
              Course
            </button>
            <button
              type="button"
              className={activeTab === 'profile' ? 'is-active' : undefined}
              aria-current={activeTab === 'profile' ? 'page' : undefined}
              onClick={() => setActiveTab('profile')}
            >
              Profil &amp; Affiliate
            </button>
          </nav>

          {activeTab === 'profile' ? (
            <ProfileSection reference={verifiedReference} />
          ) : (
            <section className="membership-content wrap" aria-live="polite">
              <div className="course-main">
                <CoursePlayer
                  videoId={lessons[activeLesson].id}
                  title={`${lessons[activeLesson].title} · Auto Flow Meta Ads`}
                  hasNext={activeLesson < lessons.length - 1}
                  onRequestNext={goToNextLesson}
                />
            <div className="course-now">
              <p className="eyebrow">
                Sedang diputar · Video {activeLesson + 1} dari {lessons.length}
              </p>
              <h2>{lessons[activeLesson].title}</h2>
            </div>
            <LessonNotes notes={lessons[activeLesson].notes} />
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
          )}

          <section className="course-series wrap">
            <p className="eyebrow">E-Course Series Lanjutan</p>
            <h2>Roadmap course berikutnya</h2>
            <div className="series-grid">
              {seriesCourses.map(course => (
                <div
                  className={`series-card${course.unlocked ? ' is-unlocked' : ''}`}
                  key={course.title}
                >
                  <div className="series-thumb">
                    <img src={course.image} alt={course.title} loading="lazy" />
                    <span className="series-status">
                      {course.unlocked ? (
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M7 10V7a5 5 0 0 1 9.9-1" />
                          <rect x="5" y="10" width="14" height="10" rx="2" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M7 10V7a5 5 0 0 1 10 0v3" />
                          <rect x="5" y="10" width="14" height="10" rx="2" />
                        </svg>
                      )}
                      {course.unlocked ? 'Dimiliki' : 'Coming soon'}
                    </span>
                  </div>
                  <h3>{course.title}</h3>
                  <p>{course.subtitle}</p>
                </div>
              ))}
            </div>
            <p className="fineprint">
              Course baru akan otomatis muncul di dashboard membership begitu
              rilis. Tidak perlu kode referensi tambahan.
            </p>
          </section>
        </>
      ) : null}
    </main>
  );
}
