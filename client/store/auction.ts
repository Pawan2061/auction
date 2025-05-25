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

  fetchAuctions: () => Promise<void>;
  setSelectedAuction: (auction: Auction | null) => void;
  addAuction: (newAuction: Auction) => void;
  removeAuction: (auctionId: string) => void;
  getUserAuctions: () => Auction[];
}

export const useAuctionStore = create<AuctionStore>((set, get) => ({
  auctions: [],
  selectedAuction: null,
  isLoading: false,
  error: null,

  fetchAuctions: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3000/api/v1/auction/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(res.data, "data okay");

      set({ auctions: res.data.auctions, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch auctions",
        isLoading: false,
      });
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
