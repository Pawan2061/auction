import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export const useAcceptBid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bidId: string) => {
      const { data } = await axios.put(
        `${API_BASE}/api/v1/bid/accept//${bidId}`
      );
      return data;
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ["auctionBids"] });
      queryClient.invalidateQueries({ queryKey: ["auction"] });
    },
  });
};

export const useRejectBid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bidId: string) => {
      const { data } = await axios.put(
        `${API_BASE}/api/v1/bid/reject/${bidId}`
      );
      return data;
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ["auctionBids"] });
      queryClient.invalidateQueries({ queryKey: ["auction"] });
    },
  });
};
