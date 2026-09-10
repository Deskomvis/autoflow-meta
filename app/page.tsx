'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
const videos = [
  [
    'Intro Claude MCP',
    'Kenali ruang kendali mesin iklanmu. Pahami apa yang bisa dibantu AI dan keputusan yang tetap di tanganmu.',
    'Fondasi',
  ],
  [
    'Hubungkan Meta Ads',
    'Sambungkan akun iklan ke Claude agar riset dan persiapan campaign punya satu pusat kendali.',
    'Koneksi',
  ],
  [
    'Hubungkan Scalev',
    'Siapkan koneksi untuk mengubah brief produk menjadi landing page yang siap ditawarkan.',
    'Koneksi',
  ],
  [
    'Hubungkan Vistudio',
    'Siapkan mesin produksi visual untuk mengeksekusi ide creative dari percakapan.',
    'Koneksi',
  ],
  [
    'Hubungkan Cloudinary',
    'Rapikan penyimpanan aset agar gambar dan file creative siap dipakai dalam campaign.',
    'Aset',
  ],
  [
    'Install Skill & Schema LP',
    'Berikan struktur kerja pada Claude untuk membangun landing page melalui Scalev Builder.',
    'Landing page',
  ],
  [
    'Generate Ad Creative',
    'Ubah angle produk menjadi variasi visual iklan yang bisa kamu review dan uji.',
    'Creative',
  ],
  [
    'Create Campaign Meta Ads',
    'Rakit campaign dari aset yang sudah siap. Periksa pengaturan, lalu putuskan kapan tayang.',
    'Campaign',
  ],
  [
    'Riset 100+ Iklan Produk Digital',
    'Baca sinyal dari Ad Library dan gunakan scoresheet untuk memilih peluang yang layak diuji.',
    'Bonus riset',
  ],
];
const modules = [
  'Setup & Fondasi MCP',
  'Riset Produk di Meta Ad Library',
  'Landing Page dengan Scalev MCP',
  'Ad Creative dengan Vistudio MCP',
  'Publish Campaign Meta Ads',
  'Analisa & Optimasi Meta Ads',
  'Prompt Library & Checklist',
  'Modul Lengkap: Kompilasi 0–5 + Bonus',
];
const flow = [
  [
    'Riset',
    'Temukan sinyal pasar',
    'Baca iklan aktif, penawaran, dan variasi creative. Pilih peluang yang ingin kamu uji berdasarkan temuan, bukan sekadar feeling.',
    'Meta Ad Library + Claude',
  ],
  [
    'Penawaran',
    'Bentuk produk versimu',
    'Ubah hasil riset menjadi brief, persona, dan angle. Kembangkan produk orisinal dengan pembeda yang jelas.',
    'Claude',
  ],
  [
    'Landing page',
    'Siapkan tempat closing',
    'Susun copy dan struktur halaman, bangun lewat Scalev, lalu cek halaman serta pelacakannya.',
    'Scalev + Claude',
  ],
  [
    'Creative',
    'Produksi bahan testing',
    'Buat variasi visual dan copy, review hasilnya, lalu simpan aset agar siap digunakan.',
    'Vistudio + Cloudinary',
  ],
  [
    'Campaign',
    'Dari draft ke iklan tayang',
    'Rakit campaign, periksa pixel, budget, dan preview. Aktivasi tetap atas keputusanmu.',
    'Meta Ads + Claude',
  ],
  [
    'Optimasi',
    'Baca data. Perbaiki. Ulangi.',
    'Telusuri masalah dari tracking sampai konversi. Tentukan apa yang perlu diperbaiki sebelum menambah budget.',
    'Meta Ads + Claude',
  ],
];
const flowTools = [
  ['meta', 'claude'],
  ['claude'],
  ['scalev', 'claude'],
  ['vistudio', 'claudinary', 'claude'],
  ['meta', 'claude'],
  ['meta', 'claude'],
];
const toolNames: Record<string, string> = {
  claude: 'Claude',
  claudinary: 'Cloudinary',
  meta: 'Meta Ads',
  scalev: 'Scalev',
  vistudio: 'Vistudio',
};
const earlybirdLimit = 30;
const initialEarlybirdTaken = 12;
const faqs = [
  [
    'Saya belum pernah pakai MCP. Bisa mengikuti?',
    'Mulai dari video pengantar dan Modul 0. Materinya membahas koneksi dan pengujian tools sebelum masuk ke riset, landing page, creative, dan campaign. Siapkan waktu untuk praktik, akun tools, serta akses akun iklan yang diperlukan.',
  ],
  [
    'Apakah Rp497.000 sudah termasuk biaya tools dan iklan?',
    'Harga earlybird ini untuk materi video webinar dan ecourse, 8 file modul, grup support, serta bonus riset. Langganan Claude, tools pendukung, kredit pembuatan aset, dan budget Meta Ads berada di luar harga materi.',
  ],
  [
    'Apa maksudnya mesin cuan semi-auto pilot?',
    'Ini adalah cara menghubungkan pekerjaan riset, pembuatan halaman, creative, dan campaign melalui Claude. AI membantu eksekusi. Pemilihan produk, kualitas penawaran, budget, dan keputusan tayang tetap kamu kendalikan. Tidak berarti pendapatan otomatis atau dijamin.',
  ],
  [
    'Bonus 100+ itu produk yang pasti profit?',
    'Bonus berisi 118 data iklan produk digital dari 53 page dalam 7 kategori, berdasarkan riset 9 September 2026. Scoresheet membaca sinyal iklan aktif. Data ini tidak membuktikan profit atau ROAS pengiklan dan bukan jaminan produkmu akan laku.',
  ],
  [
    'Apa saja 8 modul yang didapat?',
    'Paket berisi 6 modul inti (Modul 0 sampai 5), 1 Prompt Library & Checklist, dan 1 file kompilasi modul lengkap. Kompilasi menggabungkan materi agar mudah dibaca dalam satu file; bukan 8 topik yang seluruhnya berbeda.',
  ],
  [
    'Apakah saya boleh recreate produk dari hasil riset?',
    'Gunakan riset untuk memahami kebutuhan pasar dan menemukan angle baru. Bangun materi, desain, dan penawaran milikmu sendiri. Bonus ini tidak memberikan hak untuk menyalin atau menjual ulang produk maupun aset milik pengiklan lain.',
  ],
];
type CheckoutResponse = {
  paymentUrl?: string;
  message?: string;
};
type SlotStatsResponse = {
  limit?: number;
  taken?: number;
  remaining?: number;
};
export default function Home() {
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!('IntersectionObserver' in window)) return;
    const elements = document.querySelectorAll('.section-heading, .problem > div, .video-card, .modules-inner > *, .bonus > *, .mentor, .proof > *, .offer > *, .faq > *');
    let observer: IntersectionObserver | undefined;
    function configure() {
      observer?.disconnect();
      elements.forEach(element => element.classList.remove('reveal-ready', 'revealed'));
      if (preference.matches) return;
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer?.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });
      elements.forEach(element => {
        if (element.getBoundingClientRect().top > window.innerHeight) {
          element.classList.add('reveal-ready');
          observer?.observe(element);
        }
      });
    }
    configure();
    preference.addEventListener('change', configure);
    return () => {
      observer?.disconnect();
      preference.removeEventListener('change', configure);
      elements.forEach(element => element.classList.remove('reveal-ready', 'revealed'));
    };
  }, []);
  const [heroPlaying, setHeroPlaying] = useState(false);
  useEffect(() => {
    if (!heroPlaying) return;
    function handlePlayerMessage(event: MessageEvent) {
      if (event.origin !== 'https://www.youtube-nocookie.com') return;
      try {
        const message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (message?.event === 'onStateChange' && message.info === 0) {
          setHeroPlaying(false);
        }
      } catch {
        // Ignore messages from the embedded player that are not JSON events.
      }
    }
    window.addEventListener('message', handlePlayerMessage);
    return () => window.removeEventListener('message', handlePlayerMessage);
  }, [heroPlaying]);
  const [selected, setSelected] = useState<number | null>(null);
  const [checkout, setCheckout] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [slotStats, setSlotStats] = useState({
    limit: earlybirdLimit,
    taken: initialEarlybirdTaken,
    remaining: earlybirdLimit - initialEarlybirdTaken,
  });
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [active, setActive] = useState(0);
  useEffect(() => {
    let activeRequest = true;

    fetch('/api/membership/stats')
      .then((response) =>
        response.ok
          ? (response.json() as Promise<SlotStatsResponse>)
          : null,
      )
      .then((data) => {
        if (!activeRequest || !data) return;

        setSlotStats({
          limit: Number(data.limit) || earlybirdLimit,
          taken: Number(data.taken) || initialEarlybirdTaken,
          remaining:
            typeof data.remaining === 'number'
              ? data.remaining
              : earlybirdLimit - initialEarlybirdTaken,
        });
      })
      .catch(() => {});

    return () => {
      activeRequest = false;
    };
  }, []);
  async function createCheckout() {
    setCheckoutLoading(true);
    setCheckoutError('');
    try {
      const response = await fetch('/api/singapay/checkout', {
        method: 'POST',
      });
      const body = (await response
        .json()
        .catch(() => null)) as CheckoutResponse | null;
      if (!response.ok || !body?.paymentUrl) {
        throw new Error(body?.message || 'Link pembayaran belum bisa dibuat.');
      }
      window.location.assign(body.paymentUrl);
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : 'Link pembayaran belum bisa dibuat.',
      );
      setCheckoutLoading(false);
    }
  }
  async function copyOrder() {
    try {
      await navigator.clipboard.writeText(
        'Saya ingin membeli Auto Flow Meta Ads dengan Claude AI oleh Gus Rezha Cozy, paket earlybird Rp497.000: 9 video teknis, 8 file modul, grup support, dan bonus riset.',
      );
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <>
      <a className="skip-link" href="#main">
        Langsung ke isi
      </a>
      <div className="announcement">
        DARI IDE JADI EKSEKUSI <span>•</span> Video Webinar + Ecourse oleh Gus
        Rezha Cozy
      </div>
      <header className="header wrap">
        <a className="brand" href="#main" aria-label="Auto Flow Meta Ads, beranda">
          AUTO<span>FLOW</span>
          <small>META ADS / CLAUDE AI</small>
        </a>
        <nav aria-label="Navigasi utama">
          <a href="#mesin">Cara kerjanya</a>
          <a href="#materi">Isi materi</a>
          <a href="#bonus">Bonus riset</a>
        </nav>
        <a className="nav-cta" href="#akses">
          Lihat paket <span aria-hidden="true">↗</span>
        </a>
      </header>
      <main id="main">
        <section className="hero wrap">
          <div className="hero-copy">
            <p className="eyebrow">
              AUTO FLOW META ADS DENGAN CLAUDE AI
            </p>
            <h1>
              Jangan habiskan
              <br />
              berbulan-bulan
              <br />
              <span>
                merakit flow
                <br />
                dari nol.
              </span>
            </h1>
            <p className="hero-lead">
              Menemukan autoflow yang benar-benar layak dijalankan itu mahal:
              waktu testing, biaya riset, dan banyak eksperimen yang tidak
              terlihat. Kamu tidak sedang membeli kumpulan video. Kamu membeli{' '}
              <strong>informasi kerja yang sudah dipadatkan</strong> menjadi
              satu mesin dari riset sampai iklan tayang.
            </p>
            <div className="hero-actions">
              <a className="cta" href="#akses">
                Saya mau bangun mesin ini <span aria-hidden="true">↗</span>
              </a>
              <a className="text-link" href="#materi">
                Intip 9 video teknisnya
              </a>
            </div>
            <p className="hero-note">
              Diback test pada satu produk dan menghasilkan profit. Kamu pegang
              strategi. AI bantu eksekusi. Cocok untuk produk fisik, digital,
              maupun jasa.
            </p>
          </div>
          <div className="hero-media">
            <div className="media-heading">
              <span>RUANG KENDALI BARUMU</span>
              <span>01 / 09</span>
            </div>
            <div className={`hero-art ${heroPlaying ? 'hero-video-playing' : ''}`}>
              {heroPlaying ? (
                <>
                  <iframe
                    id="hero-youtube-player"
                    src="https://www.youtube-nocookie.com/embed/c3oPWww8Y2w?autoplay=1&controls=1&enablejsapi=1&modestbranding=1&playsinline=1&rel=0"
                    title="Teaser Auto Flow Meta Ads"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    onLoad={event => {
                      const player = event.currentTarget.contentWindow;
                      const target = 'https://www.youtube-nocookie.com';
                      player?.postMessage(JSON.stringify({ event: 'listening', id: 'hero-youtube-player' }), target);
                      player?.postMessage(JSON.stringify({ event: 'command', func: 'addEventListener', args: ['onStateChange'] }), target);
                    }}
                  />
                  <button className="hero-video-close" onClick={() => setHeroPlaying(false)}>
                    Tutup video
                  </button>
                </>
              ) : (
                <button
                  className="hero-cover"
                  onClick={() => setHeroPlaying(true)}
                  aria-label="Putar teaser Auto Flow Meta Ads di YouTube"
                >
                  <Image
                    unoptimized
                    src="/images/autoflow-teaser-cover.webp"
                    alt="Teaser Auto Flow Meta Ads dengan bukti back test produk"
                    width="1600"
                    height="900"
                    fetchPriority="high"
                  />
                  <span className="hero-cover-shade" aria-hidden="true" />
                  <span className="hero-cover-play" aria-hidden="true">▶</span>
                  <span className="art-caption">
                    <span>
                      Tonton teaser Auto Flow Meta Ads
                      <small>Putar video untuk melihat alur dan hasil back test</small>
                    </span>
                    <span aria-hidden="true">↗</span>
                  </span>
                </button>
              )}
            </div>
            <div className="connection">
              <span>Claude</span>
              <i aria-hidden="true" />
              <span>Scalev</span>
              <i aria-hidden="true" />
              <span>Vistudio</span>
              <i aria-hidden="true" />
              <span>Meta Ads</span>
            </div>
            <div className="hero-statement">
              <span>
                9 video.
                <br />
                Satu rangkaian mesin.
              </span>
              <p>
                Dari “mau jualan apa?”
                <br />
                ke “siap diuji di pasar.”
              </p>
            </div>
          </div>
        </section>
        <div className="included wrap">
          <div>
            <strong>09</strong>
            <span>
              Video teknis
              <br />
              langkah demi langkah
            </span>
          </div>
          <div>
            <strong>08</strong>
            <span>
              File modul
              <br />
              panduan praktik
            </span>
          </div>
          <div>
            <strong>100+</strong>
            <span>
              Data riset iklan
              <br />
              produk digital
            </span>
          </div>
          <div>
            <strong>Grup</strong>
            <span>
              Support
              <br />
              untuk proses belajarmu
            </span>
          </div>
        </div>
        <section className="problem wrap section">
          <div>
            <p className="eyebrow">JUJUR, PERNAH ADA DI POSISI INI?</p>
            <h2>
              Mau testing produk.
              <br />
              Malah habis tenaga
              <br />
              <span className="muted">sebelum iklannya tayang.</span>
            </h2>
          </div>
          <div className="problem-list">
            <p>
              <span>01</span>Riset berjam-jam. Tab makin banyak.
              <strong>Produk mana yang dipilih? Masih bingung.</strong>
            </p>
            <p>
              <span>02</span>Sudah punya ide. Masih harus bikin halaman dan
              desain.<strong>Momentum keburu hilang.</strong>
            </p>
            <p>
              <span>03</span>Akhirnya iklan tayang. Angkanya bikin pusing.
              <strong>Mau matikan atau lanjut? Balik menebak.</strong>
            </p>
          </div>
        </section>
        <section id="mesin" className="machine section">
          <div className="wrap">
            <p className="eyebrow">GANTI CARA MAINNYA</p>
            <h2>
              Ini bukan flow ngiklan biasa.
              <br />
              <span>Ini adalah mesin.</span>
            </h2>
            <p className="section-lead">
              Satu pusat kendali. Pekerjaan saling tersambung. Kamu punya alur
              yang bisa diulang setiap kali menemukan peluang produk baru.
            </p>
            <div className="flow-selector" aria-label="Tahapan mesin">
              {flow.map((f, i) => (
                <button
                  key={f[0]}
                  onClick={() => setActive(i)}
                  aria-pressed={active === i}
                  className={active === i ? 'active' : ''}
                >
                  <small>{String(i + 1).padStart(2, '0')}</small>
                  {f[0]}
                </button>
              ))}
            </div>
            <div className="flow-detail" aria-live="polite">
              <span className="flow-number">
                {String(active + 1).padStart(2, '0')}
              </span>
              <div>
                <p className="eyebrow">{flow[active][3]}</p>
                <h3>{flow[active][1]}</h3>
                <p>{flow[active][2]}</p>
              </div>
              <div className="flow-tools" aria-label={`Tools pada tahap ${flow[active][0]}`}>
                {flowTools[active].map((tool, index) => (
                  <Image
                    unoptimized
                    className={`tool-orb tool-orb-${index + 1}`}
                    key={tool}
                    src={`/images/${tool}.webp`}
                    alt={toolNames[tool]}
                    width="144"
                    height="144"
                  />
                ))}
              </div>
              <span className="flow-output">
                Kamu tetap
                <br />
                <strong>pegang kendali.</strong>
              </span>
            </div>
            <p className="machine-bottom">
              Bayangkan kalau energi yang habis untuk klik berulang bisa kamu
              pakai untuk <strong>menguji penawaran berikutnya.</strong>
            </p>
          </div>
        </section>
        <section className="section wrap" id="materi">
          <div className="section-heading">
            <div>
              <p className="eyebrow">BUKA. IKUTI. PRAKTIKKAN.</p>
              <h2>
                9 video teknis.
                <br />
                <span>Satu mesin yang utuh.</span>
              </h2>
            </div>
            <p>
              Lihat apa yang dihubungkan, apa yang dibuat, dan apa yang perlu
              dicek. Pelajari per langkah, lalu praktikkan di akunmu.
            </p>
          </div>
          <div className="video-grid">
            {videos.map((v, i) => (
              <button
                className="video-card"
                key={v[0]}
                onClick={() => setSelected(i)}
              >
                <div className="thumb">
                  <Image unoptimized
                    src={`/images/video-${i + 1}.webp`}
                    alt={`Thumbnail video ${i + 1}: ${v[0]}`}
                    width="1400"
                    height="788"
                    loading="lazy"
                  />
                  <span className="view-detail">Lihat isi materi ↗</span>
                </div>
                <div className="video-meta">
                  <span>
                    {String(i + 1).padStart(2, '0')} / {v[2]}
                  </span>
                  <span aria-hidden="true">↗</span>
                </div>
                <h3>{v[0]}</h3>
              </button>
            ))}
          </div>
        </section>
        <section className="modules section">
          <div className="wrap modules-inner">
            <div className="module-title">
              <p className="eyebrow">
                VIDEO UNTUK MELIHAT. MODUL UNTUK MENGULANG.
              </p>
              <h2>
                Lupa langkahnya?
                <br />
                <span>Buka panduannya.</span>
              </h2>
              <p>
                8 file modul Autoflow menemani praktikmu. Ada panduan koneksi,
                prompt, checklist, dan diagnosis saat hasilnya belum sesuai
                harapan.
              </p>
              <div className="document-mark">
                <strong>71</strong>
                <span>
                  halaman dalam
                  <br />
                  modul kompilasi lengkap
                </span>
              </div>
              <small>6 modul inti + prompt & checklist + 1 kompilasi.</small>
            </div>
            <ol className="module-list">
              {modules.map((m, i) => (
                <li key={m}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  {m}
                  <small>PDF</small>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section className="bonus section wrap" id="bonus">
          <div className="bonus-visual">
            <Image unoptimized
              src="/images/video-9.webp"
              alt="Bonus tutorial riset iklan produk digital dan scoresheet Meta Ad Library"
              width="1400"
              height="788"
              loading="lazy"
            />
            <div className="research-stats">
              <div>
                <strong>118</strong>
                <span>data iklan</span>
              </div>
              <div>
                <strong>53</strong>
                <span>page unik</span>
              </div>
              <div>
                <strong>7</strong>
                <span>kategori produk</span>
              </div>
            </div>
          </div>
          <div>
            <p className="eyebrow">BONUS RISET + SCORESHEET</p>
            <h2>
              Jangan mulai
              <br />
              dari kertas kosong.
              <br />
              <span>Mulai dari sinyal.</span>
            </h2>
            <p>
              Kamu mendapat{' '}
              <strong>100+ data riset iklan produk digital</strong> lengkap
              dengan kategori, page, link iklan, dan penilaian sinyal. Pilih
              peluang, bedah angle, lalu kembangkan versi produkmu sendiri.
            </p>
            <ul className="check-list">
              <li>Data mentah untuk menelusuri sumber iklan</li>
              <li>Ringkasan untuk membandingkan peluang</li>
              <li>Metodologi agar tahu arti dan batas skornya</li>
            </ul>
            <p className="fineprint">
              Snapshot riset 9 September 2026. Skor menunjukkan sinyal iklan
              aktif, bukan bukti profit atau ROAS pengiklan.
            </p>
          </div>
        </section>
        <section className="mentor wrap">
          <div className="mentor-avatar">
            <Image
              unoptimized
              src="/images/gus-rezha-cozy.jpg"
              alt="Gus Rezha Cozy, Founder Roketmedia"
              width="640"
              height="640"
              loading="lazy"
            />
          </div>
          <div className="mentor-label">
            <span>MATERI OLEH</span>
            <h3>Gus Rezha Cozy</h3>
            <p>Founder Roketmedia · Praktisi AI & Meta Ads</p>
          </div>
          <div className="mentor-copy">
            <p>
              Dari praktik membangun flow, bukan sekadar mengumpulkan prompt.
            </p>
            <span>
              Gus Rezha merangkai materi ini agar kamu bisa melihat hubungan
              antara riset, halaman, creative, campaign, dan evaluasi dalam satu
              alur yang bisa kamu praktikkan ulang.
            </span>
          </div>
        </section>
        <section className="proof wrap section" aria-labelledby="proof-title">
          <div className="proof-copy">
            <p className="eyebrow">BUKTI BACK TEST · SATU PRODUK</p>
            <h2 id="proof-title">
              Bukan teori yang belum
              <br />
              menyentuh <span>market.</span>
            </h2>
            <p>
              Flow ini sudah diback test pada <strong>satu produk</strong>.
              Hasilnya menunjukkan iklan berjalan, order masuk, dan ada profit
              bersih pada periode pengujian yang ditampilkan.
            </p>
            <div className="proof-metrics" aria-label="Ringkasan hasil back test">
              <div>
                <strong>53</strong>
                <span>pembelian</span>
              </div>
              <div>
                <strong>1,98</strong>
                <span>purchase ROAS</span>
              </div>
              <div>
                <strong>Rp2,34 jt</strong>
                <span>profit bersih</span>
              </div>
            </div>
            <p className="fineprint">
              Berdasarkan screenshot Ads Manager untuk 1–22 Agustus 2026: 53
              purchases, purchase conversion value Rp4.717.000, purchase ROAS
              1,98, dan profit bersih tercatat Rp2.340.533. Screenshot dashboard
              order juga menunjukkan 76 order selesai dengan estimasi gross
              revenue Rp6.772.000. Ini satu hasil back test, bukan jaminan hasil
              yang sama untuk setiap produk atau campaign.
            </p>
          </div>
          <div className="proof-visuals">
            <figure className="proof-meta">
              <Image
                unoptimized
                src="/images/backtest-meta-ads.png"
                alt="Screenshot Meta Ads Manager menampilkan 53 purchases, ROAS 1,98, dan profit bersih Rp2.340.533"
                width="1387"
                height="425"
                loading="lazy"
              />
              <figcaption>Data performa campaign pada Ads Manager</figcaption>
            </figure>
            <figure className="proof-orders">
              <Image
                unoptimized
                src="/images/backtest-order-dashboard.png"
                alt="Screenshot dashboard order dengan estimasi gross revenue Rp6.772.000 dan 76 order selesai"
                width="1152"
                height="586"
                loading="lazy"
              />
              <figcaption>Dashboard order dari produk yang diback test</figcaption>
            </figure>
          </div>
        </section>
        <section className="offer section wrap" id="akses">
          <div className="offer-copy">
            <p className="eyebrow">SEKARANG GILIRANMU</p>
            <h2>
              Kamu tidak sedang
              <br />
              membeli kelas.
              <br />
              <span>Kamu membeli informasi.</span>
            </h2>
            <p>
              Informasi yang tepat bisa memangkas jalan memutar: dari menebak
              produk, membangun halaman, menyiapkan creative, sampai membaca
              hasil campaign.
            </p>
            <p>
              Racikan ini lahir dari proses testing berbulan-bulan dan sudah
              diback test pada satu produk. Pelajari alurnya, praktikkan dengan
              produkmu, lalu gunakan lagi saat kamu siap menguji peluang
              berikutnya.
            </p>
            <div className="support-note">
              <strong>Belajar dengan tempat bertanya.</strong>
              <p>
                Grup support melengkapi video dan modul agar kamu punya ruang
                diskusi selama mempraktikkan materi.
              </p>
            </div>
          </div>
          <div className="offer-card">
            <span className="package-label">PAKET LENGKAP AUTO FLOW META ADS</span>
            <h3>Mesinmu dimulai di sini.</h3>
            <p className="price">Rp497.000</p>
            <p className="price-note">
              Harga earlybird untuk {slotStats.limit} slot pertama
            </p>
            <ul className="check-list">
              <li>9 video teknis webinar & ecourse</li>
              <li>8 file modul Autoflow</li>
              <li>Grup support</li>
              <li>Contoh alur riset sampai iklan tayang</li>
              <li>Bonus 100+ data riset iklan produk digital</li>
              <li>Scoresheet, prompt library & checklist</li>
            </ul>
            <button className="cta" onClick={() => setCheckout(true)}>
              Saya mau akses paket lengkap <span aria-hidden="true">↗</span>
            </button>
            <p className="fineprint">
              Biaya tools, kredit aset, dan budget iklan terpisah. Hasil
              bergantung pada produk, penawaran, dan eksekusimu.
            </p>
          </div>
        </section>
        <section className="faq wrap section">
          <div>
            <p className="eyebrow">SEBELUM KAMU MULAI</p>
            <h2>
              Yang mungkin
              <br />
              masih kamu pikirkan.
            </h2>
          </div>
          <Accordion>
            {faqs.map(([q, a]) => (
              <AccordionItem key={q} value={q}>
                <AccordionTrigger>{q}</AccordionTrigger>
                <AccordionContent>
                  <p>{a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
      <footer className="wrap footer">
        <a className="brand" href="#main">
          AUTO<span>FLOW</span>
          <small>OLEH GUS REZHA COZY</small>
        </a>
        <p>
          Materi edukasi independen. Tidak berafiliasi dengan Meta atau
          Anthropic.
          <br />
          “Mesin cuan” adalah gambaran alur kerja, bukan janji pendapatan.
        </p>
        <span>© 2026</span>
      </footer>
      <div className="mobile-buy">
        <span>
          Harga earlybird<strong>Rp497.000</strong>
        </span>
        <button className="cta" onClick={() => setCheckout(true)}>
          Lihat akses paket
        </button>
      </div>
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="course-dialog">
          {selected !== null && (
            <>
              <Image unoptimized
                src={`/images/video-${selected + 1}.webp`}
                alt={`Materi ${videos[selected][0]}`}
                width="1400"
                height="788"
              />
              <p className="eyebrow">VIDEO {selected + 1} / 9</p>
              <DialogTitle>{videos[selected][0]}</DialogTitle>
              <DialogDescription>{videos[selected][1]}</DialogDescription>
              <p className="fineprint">
                Ini adalah ringkasan materi. Video pembelajaran termasuk dalam
                paket ecourse.
              </p>
              <button
                className="cta"
                onClick={() => {
                  setSelected(null);
                  document
                    .getElementById('akses')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Lihat paket lengkap
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={checkout} onOpenChange={setCheckout}>
        <DialogContent className="checkout-dialog">
          <div className="checkout-left">
            <p className="eyebrow">RINGKASAN PAKET</p>
            <DialogTitle>Auto Flow Meta Ads</DialogTitle>
            <DialogDescription>
              9 video, 8 file modul, grup support, dan bonus riset.
            </DialogDescription>
            <div className="checkout-preview">
              <Image
                unoptimized
                src="/images/claude-mcp-ws.webp"
                alt="Auto Flow Meta Ads, cara setting Claude AI MCP"
                width="720"
                height="720"
              />
            </div>
            <div className="seat-meter">
              <div className="seat-copy">
                <strong>
                  {slotStats.taken}/{slotStats.limit} slot earlybird terisi
                </strong>
                <span>Tersisa {slotStats.remaining} slot di harga ini.</span>
              </div>
              <div className="seat-track" aria-label="Progress slot earlybird">
                <span
                  style={{
                    width:
                      slotStats.limit > 0
                        ? `${Math.min(100, (slotStats.taken / slotStats.limit) * 100)}%`
                        : `${Math.round(
                            (initialEarlybirdTaken / earlybirdLimit) * 100,
                          )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="checkout-right">
            <div className="price-row">
              <div>
                <span className="price-label">Earlybird User</span>
                <strong className="dialog-price">Rp497.000</strong>
              </div>
              <span className="earlybird-badge">Harga earlybird</span>
            </div>
            <div className="pricing-tiers" aria-label="Tier harga">
              <div className="active">
                <span>Earlybird</span>
                <strong>497.000</strong>
              </div>
              <div>
                <span>Reguler</span>
                <strong>697.000</strong>
              </div>
              <div>
                <span>Extended</span>
                <strong>997.000</strong>
              </div>
            </div>
            <div className="checkout-notice">
              <strong>Akses membership otomatis.</strong>
              <p>
                Selesaikan pembayaran, lalu gunakan kode referensi untuk membuka
                dashboard course.
              </p>
            </div>
            <button className="cta" onClick={createCheckout} disabled={checkoutLoading}>
              {checkoutLoading ? 'Menyiapkan pembayaran...' : 'Lanjut ke pembayaran'}
            </button>
            {checkoutError ? (
              <output className="checkout-error">{checkoutError}</output>
            ) : (
              <output className="fineprint">
                Pembayaran diproses aman via Singapay.
              </output>
            )}
            <button className="text-button" onClick={copyOrder}>
              {copied ? 'Ringkasan tersalin' : 'Salin ringkasan paket'}
            </button>
            <output className="fineprint">
              {copyError
                ? 'Penyalinan tidak tersedia. Kamu bisa menyalin nama paket dan harga yang tampil di atas.'
                : copied
                  ? 'Ringkasan paket sudah disalin ke clipboard.'
                  : ''}
            </output>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
