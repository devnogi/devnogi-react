// Gateway Server: http://168.107.43.221:8080/

// Auction API Endpoints (prefix: /oab)
export const AUCTION_HISTORY_ENDPOINT = "/oab/auction-history";
export const HORN_BUGLE_ENDPOINT = "/oab/horn-bugle";

// Ranking API Endpoints (prefix: /oab/rankings)
export const RANKINGS_VOLUME_ENDPOINT = "/oab/rankings/volume";
export const RANKINGS_PRICE_ENDPOINT = "/oab/rankings/price";
export const RANKINGS_PRICE_CHANGE_ENDPOINT = "/oab/rankings/price-change";
export const RANKINGS_ALL_TIME_ENDPOINT = "/oab/rankings/all-time";
export const RANKINGS_CATEGORY_ENDPOINT = "/oab/rankings/category";

// Community API Endpoints (prefix: /dcs/api)
export const BOARDS_ENDPOINT = "/dcs/api/boards";
export const POSTS_ENDPOINT = "/dcs/api/posts";
export const COMMENTS_ENDPOINT = "/dcs/api/comments";
export const NOTICES_ENDPOINT = "/dcs/api/notices";
export const REPORTS_ENDPOINT = "/dcs/api/reports";

// Statistics API Endpoints (prefix: /oab)
export const STATISTICS_DAILY_ITEMS_ENDPOINT = "/oab/statistics/daily/items";
export const STATISTICS_WEEKLY_ITEMS_ENDPOINT = "/oab/statistics/weekly/items";
export const STATISTICS_DAILY_SUBCATEGORIES_ENDPOINT = "/oab/statistics/daily/subcategories";
export const STATISTICS_WEEKLY_SUBCATEGORIES_ENDPOINT = "/oab/statistics/weekly/subcategories";
export const STATISTICS_DAILY_TOP_CATEGORIES_ENDPOINT = "/oab/statistics/daily/top-categories";
export const STATISTICS_WEEKLY_TOP_CATEGORIES_ENDPOINT = "/oab/statistics/weekly/top-categories";

// Auth API Endpoints (prefix: /das/api)
export const AUTH_ENDPOINT = "/das/api/auth";
export const USER_ENDPOINT = "/das/api/user";
export const USER_VERIFICATION_ENDPOINT = "/das/api/user/verification";
// Admin batch/sync endpoints (prefix: /oab)
export const AUCTION_HISTORY_BATCH_ENDPOINT = "/oab/auction-history/batch";
export const HORN_BUGLE_BATCH_ENDPOINT = "/oab/horn-bugle/batch";
export const ITEM_INFO_SYNC_ENDPOINT = "/oab/api/item-infos/sync";
export const METALWARE_INFO_ENDPOINT = "/oab/api/metalware-infos";
export const METALWARE_INFO_SYNC_ENDPOINT = "/oab/api/metalware-infos/sync";
export const METALWARE_ATTRIBUTE_SYNC_ENDPOINT = "/oab/api/metalware-attribute-infos/sync";
export const ENCHANT_INFO_SYNC_ENDPOINT = "/oab/api/enchant-infos/sync";
export const ENCHANT_INFO_FULLNAMES_ENDPOINT = "/oab/api/enchant-infos/fullnames";
