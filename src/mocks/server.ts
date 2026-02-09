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
];

export const server = setupServer(...handlers);
