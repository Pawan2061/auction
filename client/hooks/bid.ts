// hooks/useBidMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useAcceptBid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bidId: string) => {
      const { data } = await axios.put(
        `http://localhost:3000/api/v1/bid/accept//${bidId}`
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
        `http://localhost:3000/api/v1/bid/reject/${bidId}`
      );
      return data;
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ["auctionBids"] });
      queryClient.invalidateQueries({ queryKey: ["auction"] });
    },
  });
};
