# Graph Report - autoflow-meta  (2026-09-10)

## Corpus Check
- 79 files · ~79,440 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 263 nodes · 383 edges · 31 communities (22 shown, 9 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e0ffb220`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 59 edges
2. `cn()` - 6 edges
3. `verifySignature()` - 5 edges
4. `POST()` - 5 edges
5. `requestSupabase()` - 5 edges
6. `POST()` - 4 edges
7. `requestAccessToken()` - 4 edges
8. `POST()` - 4 edges
9. `createMembershipAccess()` - 4 edges
10. `markMembershipAccessPaid()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `markMembershipAccessPaid()`  [INFERRED]
  app/api/singapay/webhook/route.ts → lib/membership-access.ts
- `POST()` --calls--> `createMembershipAccess()`  [INFERRED]
  app/api/singapay/checkout/route.ts → lib/membership-access.ts
- `POST()` --calls--> `isMembershipReferencePaid()`  [INFERRED]
  app/api/membership/verify/route.ts → lib/membership-access.ts
- `SidebarProvider()` --calls--> `useIsMobile()`  [INFERRED]
  components/ui/sidebar.tsx → hooks/use-mobile.ts

## Communities (31 total, 9 thin omitted)

### Community 1 - "Community 1"
Cohesion: 0.17
Nodes (20): getBaseUrl(), jakartaDate(), POST(), requestAccessToken(), requiredEnv(), createMembershipAccess(), getSupabaseConfig(), isMembershipReferencePaid() (+12 more)

### Community 2 - "Community 2"
Cohesion: 0.13
Nodes (12): useIsMobile(), SheetTitle(), cn(), SidebarGroupAction(), SidebarGroupLabel(), SidebarMenuAction(), SidebarMenuButton(), SidebarMenuSubButton() (+4 more)

### Community 4 - "Community 4"
Cohesion: 0.17
Nodes (4): Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger()

## Knowledge Gaps
- **2 isolated node(s):** `autoflow-meta`, `Belum tersedia`
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 0` to `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 18`, `Community 19`, `Community 20`, `Community 21`?**
  _High betweenness centrality (0.302) - this node is a cross-community bridge._
- **What connects `autoflow-meta`, `Belum tersedia` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._