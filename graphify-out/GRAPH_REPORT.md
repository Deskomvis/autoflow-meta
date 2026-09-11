# Graph Report - autoflow-meta  (2026-09-11)

## Corpus Check
- 95 files · ~101,105 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 343 nodes · 633 edges · 38 communities (29 shown, 9 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 61 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `16e032cb`
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
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 31|Community 31]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 59 edges
2. `requestSupabase()` - 18 edges
3. `getMembershipAccess()` - 16 edges
4. `POST()` - 13 edges
5. `POST()` - 12 edges
6. `getAffiliateProfile()` - 12 edges
7. `creditAndNotifyAffiliate()` - 11 edges
8. `isMembershipReferencePaid()` - 10 edges
9. `sendRoketchatText()` - 10 edges
10. `POST()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `sendRoketchatText()`  [INFERRED]
  app/api/singapay/webhook/route.ts → lib/roketchat.ts
- `POST()` --calls--> `getMembershipAccess()`  [INFERRED]
  app/api/singapay/webhook/route.ts → lib/membership-access.ts
- `POST()` --calls--> `sendPaidAccessMessage()`  [INFERRED]
  app/api/singapay/webhook/route.ts → lib/roketchat.ts
- `POST()` --calls--> `markMembershipAccessPaid()`  [INFERRED]
  app/api/singapay/webhook/route.ts → lib/membership-access.ts
- `POST()` --calls--> `creditAndNotifyAffiliate()`  [INFERRED]
  app/api/singapay/webhook/route.ts → lib/affiliate.ts

## Communities (38 total, 9 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.12
Nodes (38): fail(), POST(), activateAffiliate(), creditAffiliateCommission(), creditAndNotifyAffiliate(), getAffiliateByOwner(), getAffiliateProfile(), isValidCodeShape() (+30 more)

### Community 3 - "Community 3"
Cohesion: 0.14
Nodes (18): getBaseUrl(), getSiteUrl(), jakartaDate(), POST(), requestAccessToken(), requiredEnv(), GET(), normalizeCode() (+10 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (12): useIsMobile(), SheetTitle(), cn(), SidebarGroupAction(), SidebarGroupLabel(), SidebarMenuAction(), SidebarMenuButton(), SidebarMenuSubButton() (+4 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (3): advance(), startTick(), stopTick()

### Community 8 - "Community 8"
Cohesion: 0.35
Nodes (10): extractPaymentFields(), GET(), greetingMessage(), normalizePhone(), POST(), readString(), safeEqual(), safeEqualHex() (+2 more)

### Community 9 - "Community 9"
Cohesion: 0.36
Nodes (10): markMembershipUnpaidMessageSent(), sendCheckoutGreeting(), getBaseUrl(), getSingapayPaymentLinkReference(), isSingapayPaymentReferencePaid(), jakartaDate(), requestAccessToken(), requiredEnv() (+2 more)

## Knowledge Gaps
- **2 isolated node(s):** `autoflow-meta`, `Belum tersedia`
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 2` to `Community 1`, `Community 3`, `Community 4`, `Community 5`, `Community 7`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 25`, `Community 26`, `Community 27`, `Community 28`?**
  _High betweenness centrality (0.321) - this node is a cross-community bridge._
- **Why does `sendCheckoutGreeting()` connect `Community 9` to `Community 0`, `Community 3`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `normalizeCode()` connect `Community 3` to `Community 0`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `requestSupabase()` (e.g. with `resolveAffiliateByCode()` and `getAffiliateByOwner()`) actually correct?**
  _`requestSupabase()` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `getMembershipAccess()` (e.g. with `POST()` and `POST()`) actually correct?**
  _`getMembershipAccess()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `POST()` (e.g. with `normalizeWhatsappPhone()` and `normalizeCode()`) actually correct?**
  _`POST()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `POST()` (e.g. with `sendRoketchatText()` and `getMembershipAccess()`) actually correct?**
  _`POST()` has 5 INFERRED edges - model-reasoned connections that need verification._