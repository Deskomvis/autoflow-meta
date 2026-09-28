import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(file, mocks = {}, globals = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports,
    require: name => { if (!(name in mocks)) throw new Error(`Unexpected import ${name}`); return mocks[name]; },
    console: { warn() {} }, process: { env: {} }, Response, ...globals,
  });
  return module.exports;
}

for (const alreadyPaid of [false, true]) {
  test(`WhatsApp failure preserves paid access (already paid: ${alreadyPaid})`, async () => {
    const calls = [];
    const lib = load('lib/singapay-paid-sync.ts', {
      '@/lib/membership-access': {
        getMembershipAccess: async () => ({ reference: 'AFM-TEST', status: alreadyPaid ? 'paid' : 'pending', payment_url: alreadyPaid ? null : 'https://example.test/AFM-TEST', whatsapp_phone: '6281234567890' }),
        markMembershipAccessPaid: async () => calls.push('persist'),
        markMembershipPaidMessageSent: async () => calls.push('sent'),
      },
      '@/lib/roketchat': { sendPaidAccessMessage: async () => { calls.push('send'); throw new Error('offline'); } },
      '@/lib/singapay-payment-status': { isSingapayPaymentLinkFullyPaid: async () => { calls.push('verify'); return true; } },
      '@/lib/affiliate': { creditAndNotifyAffiliate: async () => {} },
      '@/lib/meta-conversions': { sendMetaConversion: async () => {} },
    });
    assert.equal((await lib.syncPaidMembershipAccessFromPaymentLink('AFM-TEST', 'test')).synced, true);
    assert.deepEqual(calls, alreadyPaid ? ['send'] : ['verify', 'persist', 'send']);
  });
}

for (const response of [null, new Response('{}', { status: 500 }), new Response('[]')]) {
  test(`paid-message persistence rejects missing/failed/empty database response ${response?.status ?? 'missing'}`, async () => {
    const lib = load('lib/membership-access.ts', {}, {
      process: { env: response ? { SUPABASE_URL: 'https://db.test', SUPABASE_SERVICE_ROLE_KEY: 'test' } : {} },
      fetch: async () => response,
    });
    await assert.rejects(lib.markMembershipPaidMessageSent('AFM-TEST'));
  });
}

test('cron retries previously paid messages and exposes partial failure', async () => {
  const sent = [];
  const persisted = [];
  const access = reference => ({ reference, status: 'paid', whatsapp_phone: '6281234567890' });
  const lib = load('app/api/singapay/sync-pending/route.ts', {
    'next/server': { NextResponse: { json: (body, init) => ({ body, status: init?.status ?? 200 }) } },
    '@/lib/membership-access': {
      listPendingMembershipAccess: async () => [],
      listPaidMembershipAccessWithoutMessage: async () => [access('AFM-FAIL'), access('AFM-GOOD')],
      markMembershipAccessPaid: async () => {},
      markMembershipPaidMessageSent: async reference => persisted.push(reference),
    },
    '@/lib/affiliate': { creditAndNotifyAffiliate: async () => {} },
    '@/lib/roketchat': { sendPaidAccessMessage: async ({ reference }) => { sent.push(reference); if (reference === 'AFM-FAIL') throw new Error('offline'); } },
    '@/lib/singapay-payment-status': { isSingapayPaymentLinkFullyPaid: async () => false },
  }, { process: { env: { CRON_SECRET: 'test' } }, URL });
  assert.equal((await lib.POST(new Request('https://test/api'))).status, 401);
  const result = await lib.POST(new Request('https://test/api', { headers: { authorization: 'Bearer test' } }));
  assert.equal(result.status, 503);
  assert.equal(result.body.ok, false);
  assert.deepEqual(sent, ['AFM-FAIL', 'AFM-GOOD']);
  assert.deepEqual(persisted, ['AFM-GOOD']);
});

test('webhook persists payment before sending and requests redelivery on WhatsApp failure', async () => {
  const calls = [];
  const crypto = await import('node:crypto');
  const lib = load('app/api/singapay/webhook/route.ts', {
    'node:crypto': crypto,
    'next/server': { NextResponse: { json: (body, init) => ({ body, status: init?.status ?? 200 }) } },
    '@/lib/membership-access': {
      getMembershipAccess: async () => ({ status: 'pending', whatsapp_phone: '6281234567890' }),
      markMembershipAccessPaid: async () => calls.push('persist'),
      markMembershipPaidMessageSent: async () => calls.push('sent'),
    },
    '@/lib/roketchat': { sendPaidAccessMessage: async () => { calls.push('send'); throw new Error('offline'); } },
    '@/lib/singapay-payment-status': { isSuccessfulSingapayStatus: status => status === 'paid' },
    '@/lib/affiliate': { creditAndNotifyAffiliate: async () => {} },
    '@/lib/meta-conversions': { getRequestIp: () => '', sendMetaConversion: async () => {} },
  }, { URL, Buffer, console: { info() {}, warn() {} } });
  const result = await lib.POST(new Request('https://test/api/singapay/webhook', {
    method: 'POST', body: JSON.stringify({ reference: 'AFM-TEST', status: 'paid' }),
  }));
  assert.equal(result.status, 503);
  assert.deepEqual(calls, ['persist', 'send']);
});

test('Singapay authentication denial is not reported as unpaid when the page is a JavaScript shell', async () => {
  const lib = load('lib/singapay-payment-status.ts', { 'node:crypto': await import('node:crypto') }, {
    URL, AbortSignal,
    process: { env: { SINGAPAY_CLIENT_ID: 'test', SINGAPAY_CLIENT_SECRET: 'test', SINGAPAY_API_KEY: 'test', SINGAPAY_ACCOUNT_ID: 'test' } },
    fetch: async url => String(url).includes('access-token')
      ? new Response('{}', { status: 403 })
      : new Response('<html><div id="root"></div></html>'),
  });
  await assert.rejects(lib.isSingapayPaymentLinkFullyPaid('https://payment-link.singapay.id/b2b/AFM-MU0UUQGZ'), /authentication failed/);
});
