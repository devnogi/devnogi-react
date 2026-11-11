import type {
  ExperienceHistoryPage,
  ExperienceSummary,
} from "@/types/experience";

export const experienceSummaryFixture: ExperienceSummary = {
  eligible: true,
  activityGrade: "SENIOR",
  totalXp: 70,
  currentGradeMinXp: 45,
  nextGrade: "EXPERT",
  nextGradeMinXp: 250,
  xpToNextGrade: 180,
  progressPercent: 12.2,
  grades: [
    { code: "APPRENTICE", label: "견습", minXp: 0 },
    { code: "SENIOR", label: "수석", minXp: 45 },
    { code: "EXPERT", label: "달인", minXp: 250 },
    { code: "CHAMPION", label: "챔피언", minXp: 1000 },
    { code: "MASTER", label: "마스터", minXp: 2500 },
    { code: "GRANDMASTER", label: "그랜드마스터", minXp: 5000 },
  ],
};

export const experienceHistoryFixture: ExperienceHistoryPage = {
  items: [
    {
      id: 3,
      activityType: "COMMENT_CREATED",
      activityName: "댓글 작성",
      deltaXp: -5,
      totalXp: 70,
      occurredAt: "2026-11-11T01:00:00Z",
      processedAt: "2026-11-11T01:00:01Z",
    },
    {
      id: 2,
      activityType: "POST_PUBLISHED",
      activityName: "게시글 작성",
      deltaXp: 20,
      totalXp: 75,
      occurredAt: "2026-11-11T00:30:00Z",
      processedAt: "2026-11-11T00:30:01Z",
    },
  ],
  nextCursor: 2,
};
