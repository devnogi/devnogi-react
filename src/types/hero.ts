export interface HeroSlide {
  id: number;
  imageUrl: string;
  altText: string;
  linkUrl: string | null;
  position: number;
  advertisement: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

export interface HeroResponse {
  items: HeroSlide[];
  nextChangeAt: string | null;
  serverTime: string;
}

export interface HeroCreative {
  id: number;
  imageUrl: string;
  altText: string;
  linkUrl: string | null;
  blocked: boolean;
  createdAt: string;
}

export interface HeroAuction {
  id: number;
  weekStart: string;
  slot: number;
  status: "OPEN" | "SETTLED" | "CANCELLED";
  opensAt: string;
  closesAt: string;
  displayStartsAt: string;
  displayEndsAt: string;
  highestBid: number;
  highestBidderId: number | null;
  winningBidId: number | null;
  reason: string | null;
}

export interface HeroAuctionsResponse {
  auctions: HeroAuction[];
  serverTime: string;
  enabled: boolean;
}

export interface HeroHistory {
  bids: Array<{
    id: number;
    auctionId: number;
    creativeId: number;
    amount: number;
    status: string;
    reason: string | null;
    createdAt: string;
  }>;
  charges: Array<{
    id: number;
    auctionId: number;
    kind: string;
    amount: number;
    createdAt: string;
  }>;
}
