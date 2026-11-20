import { validateHeroLink } from "@/lib/hero/validation";

export default function HeroAdminLink({ value }: { value: string | null }) {
  let safe: string | null = null;
  try {
    safe = validateHeroLink(value ?? "");
  } catch {
    /* Invalid saved URLs are text only. */
  }
  return safe ? (
    <a
      href={safe}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center break-all text-sm underline underline-offset-4"
    >
      {value}
      <span className="sr-only"> (새 창)</span>
    </a>
  ) : (
    <p className="break-all text-sm text-muted-foreground">
      {value || "링크 없음"}
    </p>
  );
}
