# Graph Report - autoflow-meta  (2026-09-10)

## Corpus Check
- 84 files · ~85,646 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 294 nodes · 474 edges · 41 communities (32 shown, 9 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `936d07d5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 59 edges
2. `POST()` - 11 edges
3. `POST()` - 9 edges
4. `POST()` - 8 edges
5. `requestSupabase()` - 8 edges
6. `getMembershipAccess()` - 8 edges
7. `verifySignature()` - 7 edges
8. `sendRoketchatText()` - 7 edges
9. `POST()` - 6 edges
10. `cn()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `getMembershipAccess()`  [INFERRED]
  app/api/singapay/webhook/route.ts → lib/membership-access.ts
- `POST()` --calls--> `markMembershipAccessPaid()`  [INFERRED]
  app/api/singapay/webhook/route.ts → lib/membership-access.ts
- `POST()` --calls--> `sendCheckoutGreeting()`  [INFERRED]
  app/api/roketchat/resend-pending/route.ts → lib/roketchat.ts
- `POST()` --calls--> `createMembershipAccess()`  [INFERRED]
  app/api/singapay/checkout/route.ts → lib/membership-access.ts
- `POST()` --calls--> `markMembershipUnpaidMessageSent()`  [INFERRED]
  app/api/singapay/checkout/route.ts → lib/membership-access.ts

## Communities (41 total, 9 thin omitted)

### Community 1 - "Community 1"
Cohesion: 0.17
Nodes (22): getBaseUrl(), getSiteUrl(), jakartaDate(), POST(), requestAccessToken(), requiredEnv(), getMessagesBaseUrl(), getRoketchatToken() (+14 more)

### Community 2 - "Community 2"
Cohesion: 0.2
Nodes (20): createMembershipAccess(), getMembershipAccess(), getPaidMembershipAccessCount(), getSupabaseConfig(), isMembershipReferencePaid(), markMembershipAccessPaid(), markMembershipUnpaidMessageSent(), requestSupabase() (+12 more)

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (12): useIsMobile(), SheetTitle(), cn(), SidebarGroupAction(), SidebarGroupLabel(), SidebarMenuAction(), SidebarMenuButton(), SidebarMenuSubButton() (+4 more)

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (4): Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger()

### Community 8 - "Community 8"
Cohesion: 0.22
Nodes (3): advance(), startTick(), stopTick()

## Knowledge Gaps
- **2 isolated node(s):** `autoflow-meta`, `Belum tersedia`
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 4` to `Community 0`, `Community 3`, `Community 5`, `Community 6`, `Community 7`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 26`, `Community 27`, `Community 28`, `Community 29`, `Community 30`, `Community 31`?**
  _High betweenness centrality (0.241) - this node is a cross-community bridge._
- **Why does `POST()` connect `Community 1` to `Community 2`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `getMembershipAccess()` connect `Community 2` to `Community 1`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `POST()` (e.g. with `sendRoketchatText()` and `getMembershipAccess()`) actually correct?**
  _`POST()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `POST()` (e.g. with `normalizeWhatsappPhone()` and `createMembershipAccess()`) actually correct?**
  _`POST()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `POST()` (e.g. with `isMembershipReferencePaid()` and `isSingapayPaymentReferencePaid()`) actually correct?**
  _`POST()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `autoflow-meta`, `Belum tersedia` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._