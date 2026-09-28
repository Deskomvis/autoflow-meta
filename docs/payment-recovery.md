# Payment and WhatsApp recovery

Payment confirmation is persisted before calling Roketchat. Failed sends leave
`paid_message_sent_at` empty so reconciliation can retry. Webhook send failures
return HTTP 503 so Singapay can redeliver. Failed database writes must propagate;
they must not be acknowledged as successful.

The `Reconcile paid memberships` GitHub Actions workflow calls the existing
authenticated reconciliation endpoint every ten minutes. GitHub scheduling may
be delayed. To activate it, deploy the updated application, set repository secret
`CRON_SECRET` to the same value as the production server, and merge the workflow
into the default branch. Confirm a successful workflow run after release.

Reconciliation also sends pending paid-access messages. A manual workflow run
therefore contacts customers; use it only when recovery sending is intended.
HTTP 503 indicates at least one item failed; other items continue processing.

`paid_message_sent_at` records API acceptance, not delivery to the customer's phone.
If it is populated but the customer reports no message, inspect Roketchat delivery
logs before resending. A provider acceptance followed by a database failure or
simultaneous webhook/reconciliation requests can still cause duplicate sends;
there is no provider idempotency key or delivery receipt integration in this code.

Run regression checks with `npm test` and `npx tsc --noEmit`.

Investigation on 2026-09-29: the connected database had no paid rows with an empty
message timestamp. Recent records included manual payment confirmations and a
thank-you page confirmation. The GitHub repository listed only the Supabase
keepalive workflow and no repository secrets. The specific reported transaction
was subsequently identified as `AFM-MU0UUQGZ`: it is pending with no paid-message
timestamp. Its public payment page displays "Payment Link Has Been Fully Paid".
The underlying public endpoint returns `PAYMENT_LINK_CLOSED`, which should not
be treated as verified settlement without a documented provider guarantee.
The authenticated API rejected the local machine with HTTP 403 because its IP
is not registered. Production IP allowlisting and webhook delivery logs still
need checking. The old fallback read only the HTML shell and silently converted
authentication errors into an unpaid result; verification errors now propagate
to reconciliation failures. The affected customer has not been messaged by this
investigation, and these changes have not been deployed.
