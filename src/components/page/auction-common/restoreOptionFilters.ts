import type { ActiveFilter, SearchOptionMetadata } from "@/types/search-filter";

export function restoreOptionFilters(
  request: object,
  metadata: SearchOptionMetadata[],
): ActiveFilter[] {
  const fields = Object.assign(
    {},
    ...Object.values(request),
  ) as ActiveFilter["values"];
  return metadata.flatMap((option) => {
    const values = Object.fromEntries(
      Object.keys(option.searchCondition)
        .filter((key) => fields[key] !== undefined)
        .map((key) => [key, fields[key]]),
    );
    return Object.keys(values).length ? [{ ...option, values }] : [];
  });
}
