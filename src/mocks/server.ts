import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import auctionHistory from "./data/auctionHistoryData.json";
import statisticsData from "./data/statisticsData.json";
import noticesData from "./data/noticesData.json";

const BASE_URL = `${process.env.GATEWAY_URL}`;

export const handlers = [
  http.get(`${BASE_URL}/auction-history`, () => {
    return HttpResponse.json(auctionHistory);
  }),

  // Statistics API Handlers
  http.get(`${BASE_URL}/oab/statistics/daily/items`, () => {
    return HttpResponse.json(statisticsData.itemDaily);
  }),
  http.get(`${BASE_URL}/oab/statistics/weekly/items`, () => {
    return HttpResponse.json(statisticsData.itemWeekly);
  }),
  http.get(`${BASE_URL}/oab/statistics/daily/subcategories`, () => {
    return HttpResponse.json(statisticsData.subcategoryDaily);
  }),
  http.get(`${BASE_URL}/oab/statistics/weekly/subcategories`, () => {
    return HttpResponse.json(statisticsData.subcategoryWeekly);
  }),
  http.get(`${BASE_URL}/oab/statistics/daily/top-categories`, () => {
    return HttpResponse.json(statisticsData.topCategoryDaily);
  }),
  http.get(`${BASE_URL}/oab/statistics/weekly/top-categories`, () => {
    return HttpResponse.json(statisticsData.topCategoryWeekly);
  }),

  // Notices API Handlers
  http.get(`${BASE_URL}/dcs/api/notices`, () => {
    return HttpResponse.json(noticesData.list);
  }),
  http.get(`${BASE_URL}/dcs/api/notices/:id`, () => {
    return HttpResponse.json(noticesData.detail);
  }),

  // Enchant Info Fullnames API Handler
  http.get(`${BASE_URL}/oab/api/enchant-infos/fullnames`, ({ request }) => {
    const affixPosition = new URL(request.url).searchParams.get("affix_position");
    const prefixList = ["당당한 (6랭크)", "강한 (5랭크)", "빛나는 (4랭크)", "용감한 (3랭크)"];
    const suffixList = ["의 용사 (6랭크)", "의 전사 (5랭크)", "의 기사 (4랭크)", "의 수호자 (3랭크)"];
    const data = affixPosition === "접두" ? prefixList : suffixList;
    return HttpResponse.json({ success: true, data });
  }),
];

export const server = setupServer(...handlers);
