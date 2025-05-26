import { create } from "zustand";
import axios from "axios";

export type AuctionStatus = "active" | "ended" | "closed";

export interface Auction {
  id: string;
  name: string;
  description: string;
  startingPrice: number;
  duration: number;
  status: AuctionStatus;
  highestBidId?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  endTime: string;
  seller?: {
    id: string;
    name: string;
  };
}

interface AuctionStore {
  auctions: Auction[];
  selectedAuction: Auction | null;
  isLoading: boolean;
  error: string | null;

  fetchAuctions: () => any;
  setSelectedAuction: (auction: Auction | null) => void;
  addAuction: (newAuction: Auction) => void;
  removeAuction: (auctionId: string) => void;
  getUserAuctions: () => Auction[];
}
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export const useAuctionStore = create<AuctionStore>((set, get) => ({
  auctions: [],
  selectedAuction: null,
  isLoading: false,
  error: null,

  fetchAuctions: async () => {
    set({ isLoading: true, error: null });

    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API_BASE}/api/v1/auction/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const auctions = res.data.auctions;
      set({ auctions, isLoading: false });

      return auctions;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Failed to fetch auctions";
      set({ error: message, isLoading: false });

      return [];
    }
  },
  setSelectedAuction: (auction) => set({ selectedAuction: auction }),

  addAuction: (newAuction) =>
    set((state) => ({
      auctions: [...state.auctions, newAuction],
    })),

  removeAuction: (auctionId) =>
    set((state) => ({
      auctions: state.auctions.filter((a) => a.id !== auctionId),
    })),

  getUserAuctions: () => {
    const state = get();

    return state.auctions;
  },
}));
