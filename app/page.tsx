'use client';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  BASE_PRICE,
  INITIAL_PAID_SLOTS,
  PRICING_TIERS,
  formatIDR,
} from '@/lib/pricing';
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
const mcpFlow = [
  ['Discover', 'ads_library_search'],
  ['Filter', 'AI filtering + scoring'],
  ['Validate', 'winning signal'],
  ['Launch', 'campaign + ad set + ad'],
  ['Monitor', 'trend + anomaly'],
  ['Optimize', 'kill / keep'],
  ['Scale', 'budget + creative'],
];
const toolNames: Record<string, string> = {
  claude: 'Claude',
  claudinary: 'Cloudinary',
  meta: 'Meta Ads',
  scalev: 'Scalev',
  vistudio: 'Vistudio',
};
const faqs = [
  [
    'Apa itu MCP?',
    'MCP (Model Context Protocol) adalah standar terbuka yang menghubungkan Claude ke aplikasi luar seperti Meta Ads, Scalev, Vistudio, dan Cloudinary. Lewat koneksi ini Claude bisa membaca data dan menjalankan aksi di tools tersebut langsung dari satu percakapan, tanpa kamu pindah-pindah dashboard. Di course ini kamu belajar memasang dan memakai koneksi MCP untuk riset, landing page, creative, dan campaign.',
  ],
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
  discountApplied?: boolean;
};
type AffiliateContextResponse = {
  active?: boolean;
  code?: string | null;
  basePrice?: number;
  discountedPrice?: number;
  discountAmount?: number;
};
type SlotStatsResponse = {
  tier?: string;
  label?: string;
  badge?: string;
  price?: number;
  limit?: number | null;
  taken?: number;
  remaining?: number | null;
  totalTaken?: number;
};
type SlotStats = {
  tier: string;
  label: string;
  badge: string;
  price: number;
  limit: number | null;
  taken: number;
  remaining: number | null;
  totalTaken: number;
};
const teaserVideoSources = [
  'https://cdn.vistudio.id/Teaser%20autoflow.mp4',
  'https://vistudio.b-cdn.net/Teaser%20autoflow.mp4',
];
function TeaserVideoPlayer({ onEnded }: { onEnded: () => void }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="bunny-player">
      <video
        controls
        playsInline
        autoPlay
        preload="auto"
        poster="/images/autoflow-teaser-cover.webp"
        onEnded={onEnded}
        onError={() => setFailed(true)}
        controlsList="nodownload noplaybackrate"
        aria-label="Teaser Auto Flow Meta Ads"
      >
        {teaserVideoSources.map((src) => (
          <source key={src} src={src} type="video/mp4" />
        ))}
        Browser ini belum bisa memutar video.
      </video>
      {failed && (
        <div className="bunny-player-status" role="alert">
          Video belum bisa dimuat. Coba refresh halaman, lalu putar lagi.
        </div>
      )}
    </div>
  );
}
export default function Home() {
  const [heroPlaying, setHeroPlaying] = useState(false);
  function playHero() {
    setHeroPlaying(true);
  }
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const elements = Array.from(document.querySelectorAll<HTMLElement>('.proof-visuals figure, .proof-metrics > div, .machine .video-card, #materi .video-card, .modules-inner > div, .mcp-copy > *, .mcp-stage'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scroll-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    function setup() {
      observer.disconnect();
      elements.forEach((element, index) => {
        element.style.setProperty('--reveal-delay', `${element.classList.contains('video-card') ? (index % 3) * 80 : 0}ms`);
        element.classList.toggle('scroll-reveal', !preference.matches);
        if (!preference.matches) observer.observe(element);
      });
    }
    setup();
    preference.addEventListener('change', setup);
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', setup);
      elements.forEach(element => element.classList.remove('scroll-reveal', 'scroll-visible'));
    };
  }, []);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 901px)');
    const stage = document.querySelector<HTMLElement>('.duo-stage');
    const track = document.querySelector<HTMLElement>('.hero-scroll-track');
    const media = document.querySelector<HTMLElement>('.hero-media');
    const scenes = Array.from(document.querySelectorAll<HTMLElement>('.problem, .machine, #materi, .modules, .bonus, .mentor, .proof, .meta-mcp, .offer'));
    if (!stage || !track || !media) return;
    let frame = 0;
    let current = 0;
    let previous = 0;
    const clamp = (value: number) => Math.max(0, Math.min(1, value));
    function render(time: number) {
      const elapsed = Math.min(time - previous || 16, 64);
      previous = time;
      const bounds = (desktop.matches ? track! : media!).getBoundingClientRect();
      const target = preference.matches ? 0 : clamp((-bounds.top / Math.max(1, bounds.height - window.innerHeight) - 0.12) / 0.88);
      current += (target - current) * (1 - Math.exp(-elapsed / 260));
      const progress = preference.matches ? 0 : current;
      stage!.style.setProperty('--fold-angle', `${progress * 76}deg`);
      stage!.style.setProperty('--device-tilt', `${progress * 12}deg`);
      stage!.style.setProperty('--device-turn', `${progress * -16}deg`);
      stage!.style.setProperty('--device-scale', `${1 - progress * 0.16}`);
      stage!.style.setProperty('--screen-opacity', `${1 - clamp(progress / 0.04)}`);
      stage!.classList.toggle('duo-ready', progress < 0.04);
      scenes.forEach(scene => {
        const rect = scene.getBoundingClientRect();
        const reveal = preference.matches ? 1 : clamp((window.innerHeight - rect.top) / (window.innerHeight * 0.72));
        scene.style.setProperty('--scene-y', `${(1 - reveal) * 65}px`);
        scene.style.setProperty('--scene-opacity', `${0.3 + reveal * 0.7}`);
        scene.style.setProperty('--scene-scale', `${0.95 + reveal * 0.05}`);
        scene.style.setProperty('--parallax-y', `${preference.matches ? 0 : Math.max(-35, Math.min(35, (rect.top - window.innerHeight * 0.2) * 0.08))}px`);
      });
      frame = Math.abs(target - current) > 0.0001 ? requestAnimationFrame(render) : 0;
    }
    function schedule() { if (!frame) { previous = 0; frame = requestAnimationFrame(render); } }
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    preference.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      preference.removeEventListener('change', schedule);
    };
  }, []);
  const [selected, setSelected] = useState<number | null>(null);
  const [checkout, setCheckout] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [affiliate, setAffiliate] = useState<{
    active: boolean;
    price: number;
    discount: number;
  }>({ active: false, price: BASE_PRICE, discount: 0 });
  const [slotStats, setSlotStats] = useState<SlotStats>({
    tier: PRICING_TIERS[0].id,
    label: PRICING_TIERS[0].label,
    badge: PRICING_TIERS[0].badge,
    price: PRICING_TIERS[0].price,
    limit: PRICING_TIERS[0].limit,
    taken: INITIAL_PAID_SLOTS,
    remaining: PRICING_TIERS[0].limit - INITIAL_PAID_SLOTS,
    totalTaken: INITIAL_PAID_SLOTS,
  });
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [active, setActive] = useState(0);
  const currentPrice = affiliate.active ? affiliate.price : slotStats.price;
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
          tier: data.tier || PRICING_TIERS[0].id,
          label: data.label || PRICING_TIERS[0].label,
          badge: data.badge || PRICING_TIERS[0].badge,
          price: Number(data.price) || PRICING_TIERS[0].price,
          limit:
            typeof data.limit === 'number' || data.limit === null
              ? data.limit
              : PRICING_TIERS[0].limit,
          taken: Number(data.taken) || INITIAL_PAID_SLOTS,
          remaining:
            typeof data.remaining === 'number' || data.remaining === null
              ? data.remaining
              : PRICING_TIERS[0].limit - INITIAL_PAID_SLOTS,
          totalTaken: Number(data.totalTaken) || INITIAL_PAID_SLOTS,
        });
      })
      .catch(() => {});

    return () => {
      activeRequest = false;
    };
  }, []);
  useEffect(() => {
    let live = true;

    fetch('/api/affiliate/context')
      .then((response) =>
        response.ok
          ? (response.json() as Promise<AffiliateContextResponse>)
          : null,
      )
      .then((data) => {
        if (!live || !data?.active) return;

        setAffiliate({
          active: true,
          price: Number(data.discountedPrice) || slotStats.price,
          discount: Number(data.discountAmount) || 0,
        });
        if (data.code) setCouponCode(data.code);
      })
      .catch(() => {});

    return () => {
      live = false;
    };
  }, []);
  async function createCheckout() {
    setCheckoutLoading(true);
    setCheckoutError('');
    try {
      const response = await fetch('/api/singapay/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          whatsappPhone: checkoutPhone,
          couponCode: couponCode.trim() || undefined,
        }),
      });
      const body = (await response
        .json()
        .catch(() => null)) as CheckoutResponse | null;
      if (!response.ok || !body?.paymentUrl) {
        throw new Error(body?.message || 'Link pembayaran belum bisa dibuat.');
      }
      if (couponCode.trim() && body.discountApplied === false) {
        setAffiliate((current) => ({ ...current, active: false }));
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
        <div className="hero-scroll-track">
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
          <div className="hero-media-sticky">
            <div className="duo-stage duo-ready">
              <div className="duo-device">
                <div className="duo-panels" aria-hidden="true">
                  <div className="duo-hinge" />
                  <div className="duo-half duo-left"><div className="duo-back" /><div className="duo-edge" /><div className="duo-face"><div className="duo-display" /></div></div>
                  <div className="duo-half duo-right"><div className="duo-back" /><div className="duo-edge" /><div className="duo-face"><div className="duo-display" /></div><div className="duo-side-button" /></div>
                </div>
            <div className="hero-art duo-content">
                <button
                  className="hero-cover"
                  onClick={playHero}
                  aria-label="Putar teaser Auto Flow Meta Ads"
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
                </button>
            </div>
              </div>
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
          </div>
          </div>
        </section>
        </div>
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
            <article className="video-card bonus-update-card" aria-label="Bonus Update Video">
              <div className="thumb">
                <Image unoptimized
                  src="/images/update-materi-autoflow.webp"
                  alt="Thumbnail Bonus Update Video Auto Flow Meta Ads"
                  width="1400"
                  height="788"
                  loading="lazy"
                />
                <span className="bonus-update-badge">Bonus Update Video</span>
              </div>
              <div className="video-meta"><span>10 / Bonus update</span><span aria-hidden="true">↗</span></div>
              <h3>Bonus Update Video</h3>
            </article>
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
              src="/images/flow-riset-adlibrary.webp"
              alt="Flow riset Meta Ad Library dengan Claude AI"
              width="700"
              height="357"
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
              <div className="profit-highlight">
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
        <section className="meta-mcp section wrap" aria-labelledby="mcp-title">
          <div className="mcp-copy">
            <p className="eyebrow">META ADS AUTOFLOW</p>
            <h2 id="mcp-title">
              Claude bukan cuma
              <br />
              melihat dashboard.
              <br />
              <span>Ia bisa jadi operator iklan.</span>
            </h2>
            <p>
              Saat Claude terhubung ke Meta Ads MCP, alurnya bisa mencakup hampir
              seluruh siklus: riset Ad Library, analisis competitor, persiapan
              asset, pembuatan campaign, targeting, tracking, monitoring,
              optimasi, testing, sampai scale.
            </p>
            <div className="mcp-sequence">
              <span>DISCOVER</span>
              <span>FILTER</span>
              <span>VALIDATE</span>
              <span>LAUNCH</span>
              <span>MONITOR</span>
              <span>OPTIMIZE</span>
              <span>SCALE</span>
            </div>
            <p className="fineprint">
              Aktivasi, budget, dan keputusan akhir tetap di tanganmu. Claude
              membantu membaca sinyal, merapikan eksekusi, dan mempercepat
              putaran testing.
            </p>
          </div>
          <div className="mcp-stage" aria-label="Visualisasi workflow Meta Ads Autoflow">
            <div className="mcp-orbit" aria-hidden="true">
              <div className="mcp-core">
                <span>Claude</span>
                <strong>Meta Ads MCP</strong>
              </div>
              {mcpFlow.map(([label, tool], index) => {
                const angle = index * 51.43 - 90;

                return (
                  <div
                    className="mcp-node"
                    key={label}
                    style={{
                      '--node-index': index,
                      '--node-angle': `${angle}deg`,
                      '--node-angle-reverse': `${-angle}deg`,
                    } as CSSProperties}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{label}</strong>
                    <small>{tool}</small>
                  </div>
                );
              })}
            </div>
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
            <div className="offer-topline"><span className="package-label">AUTO FLOW META ADS</span><span className="offer-badge">PAKET LENGKAP</span></div>
            <h3>Dari ide produk.<br /><span>Sampai iklan tayang.</span></h3>
            <p className="offer-intro">Pelajari alurnya. Pakai modulnya. Mulai praktik dengan produkmu.</p>
            <div className="offer-price-stage">
              <div className="offer-price-main">
                <span className="offer-price-label">AKSES PAKET {slotStats.label.toUpperCase()}</span>
                <p className="price"><span>Rp</span>{slotStats.price.toLocaleString('id-ID').replace(/^Rp/, '')}</p>
                <p className="price-note">
                  {slotStats.limit
                    ? `Harga ${slotStats.label.toLowerCase()} untuk ${slotStats.limit} slot`
                    : 'Harga extended setelah kuota reguler habis'}
                </p>
              </div>
              <div className="slot-badge" aria-label={slotStats.remaining === null ? `Akses paket ${slotStats.label}` : `Tersisa ${slotStats.remaining} slot ${slotStats.label}`}>
                <span className="slot-badge-ring" aria-hidden="true">
                  <span>{slotStats.remaining === null ? '∞' : slotStats.remaining}</span>
                </span>
                <strong>{slotStats.remaining === null ? 'Slot fleksibel' : 'Slot tersisa'}</strong>
                <small>{slotStats.label}</small>
              </div>
            </div>
            <div className="offer-includes" aria-label="Isi utama paket"><div><strong>09</strong><span>Video teknis</span></div><div><strong>08</strong><span>File modul</span></div><div><strong>100+</strong><span>Data riset iklan</span></div></div>
            <ul className="check-list">
              <li>Alur praktik dari riset sampai iklan tayang</li>
              <li>Scoresheet, prompt library & checklist siap pakai</li>
              <li>Grup support untuk diskusi saat praktik</li>
              <li>Bonus update video, tips & trik terbaru</li>
            </ul>
            <button className="cta" onClick={() => setCheckout(true)}>
              Saya mau mulai sekarang <span aria-hidden="true">↗</span>
            </button>
            <p className="offer-next-step">Pilih paket & lihat detail pembayaran di langkah berikutnya.</p>
            <p className="offer-private">Butuh pendampingan? Tersedia pilihan Private 1on1 + Setup Hermes Agent.</p>
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
          Harga {slotStats.label.toLowerCase()}<strong>{formatIDR(currentPrice)}</strong>
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
      <Dialog open={heroPlaying} onOpenChange={setHeroPlaying}>
        <DialogContent className="teaser-dialog">
          <DialogTitle className="sr-only">Teaser Auto Flow Meta Ads</DialogTitle>
          <DialogDescription className="sr-only">Video teaser. Tekan Escape untuk kembali ke halaman.</DialogDescription>
          {heroPlaying && <TeaserVideoPlayer onEnded={() => setHeroPlaying(false)} />}
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
                  {slotStats.limit
                    ? `${slotStats.taken}/${slotStats.limit} slot ${slotStats.label.toLowerCase()} terisi`
                    : `${slotStats.totalTaken} total pembeli`}
                </strong>
                <span>
                  {slotStats.remaining === null
                    ? 'Harga extended sedang aktif.'
                    : `Tersisa ${slotStats.remaining} slot di harga ini.`}
                </span>
              </div>
              <div className="seat-track" aria-label={`Progress slot ${slotStats.label.toLowerCase()}`}>
                <span
                  style={{
                    width:
                      typeof slotStats.limit === 'number' && slotStats.limit > 0
                        ? `${Math.min(100, (slotStats.taken / slotStats.limit) * 100)}%`
                        : '100%',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="checkout-right">
            <div className="price-row">
              <div>
                <span className="price-label">{slotStats.label} User</span>
                <strong className="dialog-price">
                  {formatIDR(currentPrice)}
                </strong>
              </div>
              <span className="earlybird-badge">{slotStats.badge}</span>
            </div>
            {affiliate.active ? (
              <p className="fineprint">
                Potongan afiliasi 15% ({formatIDR(affiliate.discount)}) sudah
                dihitung dari {formatIDR(slotStats.price)}.
              </p>
            ) : null}
            <div className="pricing-tiers" aria-label="Tier harga">
              {PRICING_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={slotStats.tier === tier.id ? 'active' : undefined}
                >
                  <span>{tier.label}</span>
                  <strong>{tier.price.toLocaleString('id-ID')}</strong>
                  {tier.limit ? <small>{tier.limit} slot</small> : null}
                </div>
              ))}
              <div>
                <span>Private 1on1</span>
                <strong>2.999.000</strong>
                <small>+ Setup Hermes Agent</small>
              </div>
            </div>
            <div className="checkout-notice">
              <strong>Akses membership otomatis.</strong>
              <p>
                Selesaikan pembayaran, lalu gunakan kode referensi untuk membuka
                dashboard course.
              </p>
            </div>
            <label className="checkout-phone">
              <span>Nomor WhatsApp aktif</span>
              <input
                inputMode="tel"
                autoComplete="tel"
                placeholder="Contoh: 085741813147"
                value={checkoutPhone}
                onChange={(event) => setCheckoutPhone(event.target.value)}
                disabled={checkoutLoading}
              />
            </label>
            <label className="checkout-phone">
              <span>Kode kupon afiliasi (opsional)</span>
              <input
                autoComplete="off"
                spellCheck={false}
                placeholder="Isi kalau punya kode dari teman"
                value={couponCode}
                onChange={(event) =>
                  setCouponCode(
                    event.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, '')
                      .slice(0, 16),
                  )
                }
                disabled={checkoutLoading}
              />
            </label>
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
