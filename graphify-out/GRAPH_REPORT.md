# Graph Report - autoflow-meta  (2026-09-14)

## Corpus Check
- 113 files · ~111,503 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 396 nodes · 766 edges · 44 communities (36 shown, 8 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 82 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `afa7ae59`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 37|Community 37]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 59 edges
2. `requestSupabase()` - 25 edges
3. `getMembershipAccess()` - 16 edges
4. `POST()` - 15 edges
5. `POST()` - 12 edges
6. `getAffiliateProfile()` - 12 edges
7. `isAdminRequestAuthorized()` - 11 edges
8. `creditAndNotifyAffiliate()` - 11 edges
9. `isMembershipReferencePaid()` - 10 edges
10. `sendRoketchatText()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `getMembershipAccess()`  [INFERRED]
  app/api/singapay/webhook/route.ts → lib/membership-access.ts
- `POST()` --calls--> `creditAndNotifyAffiliate()`  [INFERRED]
  app/api/singapay/webhook/route.ts → lib/affiliate.ts
- `POST()` --calls--> `getMembershipAccess()`  [INFERRED]
  app/api/roketchat/resend-pending/route.ts → lib/membership-access.ts
- `POST()` --calls--> `normalizeCode()`  [INFERRED]
  app/api/singapay/checkout/route.ts → lib/affiliate.ts
- `POST()` --calls--> `resolveAffiliateByCode()`  [INFERRED]
  app/api/singapay/checkout/route.ts → lib/affiliate.ts

## Communities (44 total, 8 thin omitted)

### Community 1 - "Community 1"
Cohesion: 0.18
Nodes (27): fail(), POST(), proxy(), activateAffiliate(), creditAffiliateCommission(), creditAndNotifyAffiliate(), getAffiliateByOwner(), getAffiliateProfile() (+19 more)

### Community 2 - "Community 2"
Cohesion: 0.13
Nodes (23): GET(), LogoutButton(), createAdminSessionToken(), getSecret(), isAdminRequestAuthorized(), readCookie(), safeEqual(), sign() (+15 more)

### Community 4 - "Community 4"
Cohesion: 0.16
Nodes (23): markMembershipAccessPaid(), getMessagesBaseUrl(), getRoketchatToken(), rp(), sendAffiliateSaleMessage(), sendPaidAccessMessage(), sendRoketchatText(), sendWithdrawalRequestAdminMessage() (+15 more)

### Community 5 - "Community 5"
Cohesion: 0.19
Nodes (16): getBaseUrl(), getSiteUrl(), jakartaDate(), POST(), requestAccessToken(), requiredEnv(), GET(), RangePicker() (+8 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (12): useIsMobile(), SheetTitle(), cn(), SidebarGroupAction(), SidebarGroupLabel(), SidebarMenuAction(), SidebarMenuButton(), SidebarMenuSubButton() (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.13
Nodes (3): advance(), startTick(), stopTick()

### Community 8 - "Community 8"
Cohesion: 0.17
Nodes (6): clamp(), render(), Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger()

### Community 10 - "Community 10"
Cohesion: 0.36
Nodes (10): markMembershipUnpaidMessageSent(), sendCheckoutGreeting(), getBaseUrl(), getSingapayPaymentLinkReference(), isSingapayPaymentReferencePaid(), jakartaDate(), requestAccessToken(), requiredEnv() (+2 more)

### Community 21 - "Community 21"
Cohesion: 0.4
Nodes (4): Auto Flow Meta Ads, Belum tersedia, Hero revision, Scroll motion — September 11 update

## Knowledge Gaps
- **4 isolated node(s):** `autoflow-meta`, `Belum tersedia`, `Scroll motion — September 11 update`, `Hero revision`
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 3` to `Community 0`, `Community 6`, `Community 8`, `Community 9`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 23`, `Community 24`, `Community 25`, `Community 26`, `Community 27`, `Community 28`, `Community 29`, `Community 30`, `Community 31`, `Community 32`, `Community 33`?**
  _High betweenness centrality (0.298) - this node is a cross-community bridge._
- **Why does `formatIDR()` connect `Community 5` to `Community 8`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `requestSupabase()` connect `Community 1` to `Community 10`, `Community 2`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Are the 14 inferred relationships involving `requestSupabase()` (e.g. with `resolveAffiliateByCode()` and `getAffiliateByOwner()`) actually correct?**
  _`requestSupabase()` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `getMembershipAccess()` (e.g. with `POST()` and `POST()`) actually correct?**
  _`getMembershipAccess()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 10 inferred relationships involving `POST()` (e.g. with `normalizeWhatsappPhone()` and `getPaidMembershipAccessCount()`) actually correct?**
  _`POST()` has 10 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `POST()` (e.g. with `sendRoketchatText()` and `getMembershipAccess()`) actually correct?**
  _`POST()` has 5 INFERRED edges - model-reasoned connections that need verification._