import { CategoryStatsMap, MistakeItem, UserProfile } from '../types/platform';

export const CLOUD_SYNC_URL =
  'https://yandexcloud.net';

export interface CloudStudentPayload {
  user: UserProfile;
  mistakes?: MistakeItem[];
  categoryStats?: CategoryStatsMap | null;
}

export interface CloudStudentSummary {
  profileId: string;
  displayName: string;
  grade: string;
  payload: CloudStudentPayload | null;
}

const syncTimers = new Map<string, number>();

export function scheduleCloudSync(
  user: UserProfile,
  extra?: {
    mistakes?: MistakeItem[];
    categoryStats?: CategoryStatsMap | null;
  }
): void {
  if (typeof window === 'undefined' || !user?.nickname) return;

  const profileId = user.nickname.trim().toLowerCase();
  const existingTimer = syncTimers.get(profileId);
  if (existingTimer) {
    window.clearTimeout(existingTimer);
  }

  const timerId = window.setTimeout(() => {
    syncTimers.delete(profileId);

    let mistakes = extra?.mistakes;
    if (!mistakes) {
      try {
        const raw = localStorage.getItem(`mogni_kim_mistakes_v1_${profileId}`);
        mistakes = raw ? (JSON.parse(raw) as MistakeItem[]) : [];
      } catch {
        mistakes = [];
      }
    }

    let categoryStats = extra?.categoryStats;
    if (categoryStats === undefined) {
      try {
        const raw = localStorage.getItem(`mogni_kim_cat_stats_v1_${profileId}`);
        categoryStats = raw ? (JSON.parse(raw) as CategoryStatsMap) : null;
      } catch {
        categoryStats = null;
      }
    }

    const payload: CloudStudentPayload = {
      user,
      mistakes,
      categoryStats,
    };

    fetch(CLOUD_SYNC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileId,
        displayName: user.nickname,
        grade: user.grade,
        payload,
      }),
    }).catch(() => {});
  }, 1200);

  syncTimers.set(profileId, timerId);
}

export async function loadProfileFromCloud(
  nickname: string
): Promise<CloudStudentPayload | null> {
  const profileId = nickname.trim().toLowerCase();
  if (!profileId) return null;

  try {
    const url = `${CLOUD_SYNC_URL}?action=load&profileId=${encodeURIComponent(
      profileId
    )}`;
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.ok && data?.profile?.payload?.user) {
      return data.profile.payload as CloudStudentPayload;
    }
    return null;
  } catch {
    return null;
  }
}

export async function listStudentsFromCloud(): Promise<CloudStudentSummary[]> {
  try {
    const url = `${CLOUD_SYNC_URL}?action=list`;
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return [];
    const data = await res.json();
    if (data?.ok && Array.isArray(data.students)) {
      return data.students as CloudStudentSummary[];
    }
    return [];
  } catch {
    return [];
  }
}
