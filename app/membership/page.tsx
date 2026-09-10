import MembershipDashboard from './membership-dashboard';

type MembershipPageProps = {
  searchParams?: Promise<{
    ref?: string;
  }>;
};

export const metadata = {
  title: 'Dashboard Membership | Auto Flow Meta Ads',
  description:
    'Masuk ke dashboard membership Auto Flow Meta Ads untuk melihat video course dan mengunduh file tambahan.',
};

export default async function MembershipPage({ searchParams }: MembershipPageProps) {
  const params = await searchParams;

  return <MembershipDashboard initialReference={params?.ref ?? ''} />;
}
