/**
 * 숫자를 한국식 단위 (억, 만)로 포맷팅
 */
export function formatKoreanNumber(num: number): string {
  if (num >= 100000000) {
    const eok = num / 100000000;
    return eok >= 10
      ? `${Math.floor(eok)}억`
      : `${eok.toFixed(1).replace(/\.0$/, "")}억`;
  }
  if (num >= 10000) {
    const man = num / 10000;
    return man >= 100
      ? `${Math.floor(man)}만`
      : `${man.toFixed(1).replace(/\.0$/, "")}만`;
  }
  return num.toLocaleString();
}

/**
 * 변동률을 포맷팅 (+/-% 형식)
 */
export function formatChangeRate(rate: number): string {
  const sign = rate >= 0 ? "+" : "";
  return `${sign}${rate.toFixed(1)}%`;
}

/**
 * ISO 날짜/시간을 한국식으로 포맷팅
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

/**
 * 순위에 따른 메달 이모지 반환
 */
export function getRankMedal(rank: number): string {
  switch (rank) {
    case 1:
      return "🥇";
    case 2:
      return "🥈";
    case 3:
      return "🥉";
    default:
      return "";
  }
}
