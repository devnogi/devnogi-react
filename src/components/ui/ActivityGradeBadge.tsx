import { ACTIVITY_GRADE_LABELS, type ActivityGrade } from "@/types/experience";

export default function ActivityGradeBadge({
  grade,
  verified,
}: {
  grade?: ActivityGrade | null;
  verified?: boolean;
}) {
  if (!verified || !grade || !ACTIVITY_GRADE_LABELS[grade]) return null;

  return (
    <span
      aria-label={`활동 등급: ${ACTIVITY_GRADE_LABELS[grade]}`}
      className="inline-flex shrink-0 items-center rounded border border-primary/25 bg-primary/5 px-1.5 py-0.5 text-xs font-medium leading-4 text-primary"
    >
      {ACTIVITY_GRADE_LABELS[grade]}
    </span>
  );
}
