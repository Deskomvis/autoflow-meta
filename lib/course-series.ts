export const seriesCourses = [
  {
    id: 'autoflow-meta-ads',
    image: '/images/claude-mcp-ws.webp',
    title: 'Auto Flow Meta Ads',
    subtitle: 'Flow Orchestration Claude AI MCP · Scalev, Meta Ads, Vistudio, Cloudinary',
    unlocked: true,
  },
  {
    id: 'vibe-coding-monetize-plan',
    image: '/images/vibecoding-monetize.webp',
    title: 'Vibe Coding Monetize Plan',
    subtitle: 'Membangun pabrik digital ala vibe coding jalanan',
    unlocked: false,
  },
  {
    id: 'ai-chat-for-ctwa',
    image: '/images/aichat-ctwa.webp',
    title: '24/7 AI Chat for CTWA',
    subtitle: 'CRM auto flow untuk iklan CTWA yang bekerja non stop',
    unlocked: false,
  },
  {
    id: 'hermes-agent-flow-business',
    image: '/images/hermes-agent-flow.webp',
    title: 'Hermes Agent Flow for Business',
    subtitle: 'Agent auto flow 24 jam untuk daily task bisnis',
    unlocked: false,
  },
] as const;

export type SeriesCourseId = (typeof seriesCourses)[number]['id'];

export function getVotableSeriesCourse(courseId: string) {
  return seriesCourses.find((course) => course.id === courseId && !course.unlocked);
}
