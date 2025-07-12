import { format, parseISO } from "date-fns";

export function isoStringFormat(isoString: string, dateFormat = "yyyy-MM-dd") {
  const dateObj = parseISO(isoString);

  return format(dateObj, dateFormat);
}
