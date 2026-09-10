# Graph Report - autoflow-meta  (2026-09-10)

## Corpus Check
- 84 files · ~85,230 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 290 nodes · 468 edges · 40 communities (31 shown, 9 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5ad0240d`
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
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]

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
- `POST()` --calls--> `sendPaidAccessMessage()`  [INFERRED]
  app/api/membership/verify/route.ts → lib/roketchat.ts
- `POST()` --calls--> `sendRoketchatText()`  [INFERRED]
  app/api/singapay/webhook/route.ts → lib/roketchat.ts
- `POST()` --calls--> `sendPaidAccessMessage()`  [INFERRED]
  app/api/singapay/webhook/route.ts → lib/roketchat.ts

## Communities (40 total, 9 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.15
Nodes (28): getBaseUrl(), getSiteUrl(), jakartaDate(), POST(), requestAccessToken(), requiredEnv(), createMembershipAccess(), getMembershipAccess() (+20 more)

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (12): useIsMobile(), SheetTitle(), cn(), SidebarGroupAction(), SidebarGroupLabel(), SidebarMenuAction(), SidebarMenuButton(), SidebarMenuSubButton() (+4 more)

### Community 4 - "Community 4"
Cohesion: 0.26
Nodes (14): getMessagesBaseUrl(), getRoketchatToken(), sendPaidAccessMessage(), sendRoketchatText(), extractPaymentFields(), GET(), greetingMessage(), normalizePhone() (+6 more)

### Community 5 - "Community 5"
Cohesion: 0.17
Nodes (4): Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger()

## Knowledge Gaps
- **2 isolated node(s):** `autoflow-meta`, `Belum tersedia`
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 1` to `Community 2`, `Community 3`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 20`, `Community 21`, `Community 22`, `Community 23`, `Community 24`, `Community 25`, `Community 26`, `Community 27`, `Community 28`, `Community 29`, `Community 30`?**
  _High betweenness centrality (0.248) - this node is a cross-community bridge._
- **Why does `POST()` connect `Community 4` to `Community 0`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `getMembershipAccess()` connect `Community 0` to `Community 4`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `POST()` (e.g. with `sendRoketchatText()` and `getMembershipAccess()`) actually correct?**
  _`POST()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `POST()` (e.g. with `normalizeWhatsappPhone()` and `createMembershipAccess()`) actually correct?**
  _`POST()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `POST()` (e.g. with `isMembershipReferencePaid()` and `isSingapayPaymentReferencePaid()`) actually correct?**
  _`POST()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `autoflow-meta`, `Belum tersedia` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._