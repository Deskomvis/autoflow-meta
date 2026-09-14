import { requestSupabase } from '@/lib/membership-access';
import { getVotableSeriesCourse, seriesCourses } from '@/lib/course-series';

type CourseVoteRow = {
  course_id: string;
  voter_reference?: string;
};

export type CourseVotesSnapshot = {
  totals: Record<string, number>;
  votedCourseIds: string[];
};

function emptyTotals() {
  return Object.fromEntries(seriesCourses.map((course) => [course.id, 0]));
}

async function parseRows<T>(response: Response | null, context: string): Promise<T[]> {
  if (!response) return [];

  if (!response.ok) {
    console.warn(
      `course-votes-${context}-failed`,
      JSON.stringify({ status: response.status, body: await response.text().catch(() => '') }),
    );
    return [];
  }

  return ((await response.json().catch(() => [])) as T[]) ?? [];
}

export async function getCourseVotes(reference: string): Promise<CourseVotesSnapshot> {
  const [allVotes, myVotes] = await Promise.all([
    requestSupabase('course_votes?select=course_id', {
      method: 'GET',
      headers: { Prefer: '' },
    }),
    requestSupabase(
      `course_votes?voter_reference=eq.${encodeURIComponent(reference)}&select=course_id`,
      {
        method: 'GET',
        headers: { Prefer: '' },
      },
    ),
  ]);

  const totals = emptyTotals();
  for (const row of await parseRows<CourseVoteRow>(allVotes, 'list')) {
    totals[row.course_id] = (totals[row.course_id] ?? 0) + 1;
  }

  return {
    totals,
    votedCourseIds: (await parseRows<CourseVoteRow>(myVotes, 'mine')).map((row) => row.course_id),
  };
}

export async function voteForCourse(input: {
  courseId: string;
  reference: string;
}): Promise<{ ok: true; alreadyVoted: boolean; snapshot: CourseVotesSnapshot } | { ok: false; status: number; error: string }> {
  if (!getVotableSeriesCourse(input.courseId)) {
    return { ok: false, status: 400, error: 'INVALID_COURSE' };
  }

  const response = await requestSupabase('course_votes', {
    method: 'POST',
    body: JSON.stringify({
      course_id: input.courseId,
      voter_reference: input.reference,
    }),
  });

  if (response && !response.ok && response.status !== 409) {
    console.warn(
      'course-votes-create-failed',
      JSON.stringify({ status: response.status, body: await response.text().catch(() => '') }),
    );
    return { ok: false, status: 500, error: 'DB' };
  }

  return {
    ok: true,
    alreadyVoted: response?.status === 409,
    snapshot: await getCourseVotes(input.reference),
  };
}
