'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

type Conversion = {
  downlinePhone: string;
  commission: number;
  paidAt: string | null;
  creditedAt: string | null;
};

type Withdrawal = {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'done' | 'rejected';
  note: string | null;
  requestedAt: string;
};

type Profile = {
  phone: string | null;
  activated: boolean;
  affiliateCode: string | null;
  affiliateLink: string | null;
  commissionTotal: number;
  withdrawnOrPending: number;
  availableBalance: number;
  minWithdrawal: number;
  hasOpenWithdrawal: boolean;
  conversions: Conversion[];
  withdrawals: Withdrawal[];
};

const CODE_RE = /^[A-Z0-9]{4,16}$/;

const WITHDRAWAL_LABEL: Record<Withdrawal['status'], string> = {
  pending: 'Menunggu',
  processing: 'Diproses',
  done: 'Selesai',
  rejected: 'Ditolak',
};

function formatIDR(amount: number) {
  return `Rp${amount.toLocaleString('id-ID')}`;
}

function formatDate(value: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ProfileSection({ reference }: { reference: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const [code, setCode] = useState('');
  const [activateError, setActivateError] = useState('');
  const [activating, setActivating] = useState(false);

  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/membership/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      });
      if (!response.ok) throw new Error('gagal memuat');
      const body = (await response.json()) as Profile;
      setProfile(body);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [reference]);

  useEffect(() => {
    load();
  }, [load]);

  async function activate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActivateError('');
    const clean = code.trim().toUpperCase();
    if (!CODE_RE.test(clean)) {
      setActivateError('Kode 4-16 karakter, hanya huruf dan angka.');
      return;
    }
    setActivating(true);
    try {
      const response = await fetch('/api/membership/profile/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, code: clean }),
      });
      const body = (await response.json().catch(() => null)) as
        | (Profile & { message?: string })
        | { message?: string }
        | null;
      if (!response.ok) {
        throw new Error(
          (body && 'message' in body && body.message) || 'Belum bisa mengaktifkan. Coba lagi.',
        );
      }
      setProfile(body as Profile);
    } catch (error) {
      setActivateError(error instanceof Error ? error.message : 'Belum bisa mengaktifkan.');
    } finally {
      setActivating(false);
    }
  }

  async function requestWithdraw() {
    setWithdrawError('');
    setWithdrawing(true);
    try {
      const response = await fetch('/api/membership/profile/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      });
      const body = (await response.json().catch(() => null)) as
        | (Profile & { message?: string })
        | { message?: string }
        | null;
      if (!response.ok) {
        throw new Error(
          (body && 'message' in body && body.message) || 'Belum bisa mengajukan pencairan.',
        );
      }
      setProfile(body as Profile);
    } catch (error) {
      setWithdrawError(error instanceof Error ? error.message : 'Belum bisa mengajukan.');
    } finally {
      setWithdrawing(false);
    }
  }

  async function copyLink() {
    if (!profile?.affiliateLink) return;
    try {
      await navigator.clipboard.writeText(profile.affiliateLink);
      setCopied(true);
      setCopyFailed(false);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyFailed(true);
    }
  }

  if (status === 'loading') {
    return (
      <section className='profile-section wrap'>
        <p className='eyebrow'>PROFIL AFFILIATE</p>
        <p className='fineprint'>Memuat data profil...</p>
      </section>
    );
  }

  if (status === 'error' || !profile) {
    return (
      <section className='profile-section wrap'>
        <p className='eyebrow'>PROFIL AFFILIATE</p>
        <output className='checkout-error'>
          Gagal memuat profil. Periksa koneksi lalu coba lagi.
        </output>
        <button type='button' className='resource-link' onClick={load}>
          Muat ulang
        </button>
      </section>
    );
  }

  const canWithdraw =
    profile.activated &&
    !profile.hasOpenWithdrawal &&
    profile.availableBalance >= profile.minWithdrawal;

  return (
    <section className='profile-section wrap'>
      <div className='profile-block'>
        <p className='eyebrow'>PROFIL AFFILIATE</p>
        <div className='thankyou-summary'>
          <div>
            <span>Nomor WhatsApp</span>
            <strong>{profile.phone ?? '-'}</strong>
          </div>
          <div>
            <span>Kode referensi</span>
            <strong>{reference}</strong>
          </div>
        </div>
      </div>

      {!profile.activated ? (
        <form className='profile-block access-panel' onSubmit={activate}>
          <h2>Aktifkan komisi affiliate</h2>
          <p className='fineprint'>
            Buat 1 kode. Setiap orang yang beli lewat kode itu dapat potongan 15% (bayar{' '}
            {formatIDR(422_450)}), dan kamu dapat komisi 25% dari harga asli = {formatIDR(124_250)}{' '}
            per penjualan. Kode dipakai untuk link maupun sebagai kupon manual, dan tidak bisa
            diganti setelah disimpan.
          </p>
          <label htmlFor='affiliate-code'>Kode pilihanmu</label>
          <div className='access-input-row'>
            <input
              id='affiliate-code'
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase().slice(0, 16))}
              placeholder='Contoh: REZHA15'
              autoComplete='off'
              spellCheck={false}
              disabled={activating}
            />
            <button className='cta' disabled={activating}>
              {activating ? 'Menyimpan...' : 'Simpan & aktifkan'}
            </button>
          </div>
          {activateError ? (
            <output className='checkout-error'>{activateError}</output>
          ) : (
            <p className='fineprint'>
              4-16 karakter, huruf dan angka. Pilih yang mudah diingat orang.
            </p>
          )}
        </form>
      ) : (
        <>
          <div className='profile-block'>
            <h2>Bagikan kode kamu</h2>
            <div className='affiliate-link-row'>
              <input
                readOnly
                value={profile.affiliateLink ?? ''}
                aria-label='Link affiliate'
                onFocus={(event) => event.currentTarget.select()}
              />
              <button type='button' className='resource-link' onClick={copyLink}>
                {copied ? 'Tersalin' : 'Salin link'}
              </button>
            </div>
            <p className='fineprint'>
              Kode <strong>{profile.affiliateCode}</strong> juga bisa dipakai sebagai kupon manual
              di halaman checkout kalau link/cookie sudah kedaluwarsa.
              {copyFailed
                ? ' Salin otomatis gagal, salin link secara manual dari kolom di atas.'
                : ''}
            </p>
          </div>

          <div className='profile-block'>
            <h2>Komisi</h2>
            <div className='thankyou-summary'>
              <div>
                <span>Total komisi</span>
                <strong>{formatIDR(profile.commissionTotal)}</strong>
              </div>
              <div>
                <span>Sudah dicairkan / diproses</span>
                <strong>{formatIDR(profile.withdrawnOrPending)}</strong>
              </div>
              <div>
                <span>Bisa dicairkan</span>
                <strong>{formatIDR(profile.availableBalance)}</strong>
              </div>
              <div>
                <span>Jumlah penjualan</span>
                <strong>{profile.conversions.length}</strong>
              </div>
            </div>
            <button
              type='button'
              className='cta'
              onClick={requestWithdraw}
              disabled={!canWithdraw || withdrawing}
            >
              {withdrawing
                ? 'Mengajukan...'
                : `Ajukan pencairan ${formatIDR(profile.availableBalance)}`}
            </button>
            {withdrawError ? (
              <output className='checkout-error'>{withdrawError}</output>
            ) : (
              <p className='fineprint'>
                {profile.hasOpenWithdrawal
                  ? 'Masih ada permintaan pencairan yang belum selesai.'
                  : profile.availableBalance < profile.minWithdrawal
                    ? `Minimum pencairan ${formatIDR(profile.minWithdrawal)}.`
                    : 'Pencairan diproses manual oleh admin, kamu dikabari lewat WhatsApp.'}
              </p>
            )}
          </div>

          <div className='profile-block'>
            <h2>Riwayat penjualan</h2>
            {profile.conversions.length === 0 ? (
              <p className='fineprint'>Belum ada penjualan dari afiliasimu.</p>
            ) : (
              <ol className='profile-list'>
                {profile.conversions.map((item, index) => (
                  <li key={`${item.downlinePhone}-${index}`}>
                    <span>{item.downlinePhone}</span>
                    <span>{formatDate(item.paidAt)}</span>
                    <strong>{formatIDR(item.commission)}</strong>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className='profile-block'>
            <h2>Riwayat pencairan</h2>
            {profile.withdrawals.length === 0 ? (
              <p className='fineprint'>Belum ada permintaan pencairan.</p>
            ) : (
              <ol className='profile-list'>
                {profile.withdrawals.map((item) => (
                  <li key={item.id}>
                    <span className={`withdrawal-badge is-${item.status}`}>
                      {WITHDRAWAL_LABEL[item.status]}
                    </span>
                    <span>{formatDate(item.requestedAt)}</span>
                    <strong>{formatIDR(item.amount)}</strong>
                    {item.note ? <span className='withdrawal-note'>{item.note}</span> : null}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </>
      )}
    </section>
  );
}
