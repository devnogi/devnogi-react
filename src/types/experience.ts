export const ACTIVITY_GRADE_LABELS = {
  APPRENTICE: "견습",
  SENIOR: "수석",
  EXPERT: "달인",
  CHAMPION: "챔피언",
  MASTER: "마스터",
  GRANDMASTER: "그랜드마스터",
} as const;

export type ActivityGrade = keyof typeof ACTIVITY_GRADE_LABELS;

export interface ExperienceSummary {
  eligible: boolean;
  activityGrade: ActivityGrade | null;
  totalXp: number;
  currentXp?: number;
  spentXp?: number;
  reservedXp?: number;
  availableXp?: number;
  deficitXp?: number;
  currentGradeMinXp: number;
  nextGrade: ActivityGrade | null;
  nextGradeMinXp: number | null;
  xpToNextGrade: number;
  progressPercent: number;
  grades: Array<{ code: ActivityGrade; label: string; minXp: number }>;
}

export interface ExperienceHistoryPage {
  items: Array<{
    id: number;
    activityType: string;
    activityName: string;
    deltaXp: number;
    totalXp: number;
    occurredAt: string;
    processedAt: string;
  }>;
  nextCursor: number | null;
}
