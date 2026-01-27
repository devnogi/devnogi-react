import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import auctionHistory from "./data/auctionHistoryData.json";

const BASE_URL = `${process.env.GATEWAY_URL}`;

export const handlers = [
  http.get(`${BASE_URL}/auction-history`, () => {
    return HttpResponse.json(auctionHistory);
  }),
];

export const server = setupServer(...handlers);
