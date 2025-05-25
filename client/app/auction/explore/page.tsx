"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import {
  Search,
  Filter,
  Clock,
  DollarSign,
  Eye,
  Gavel,
  ArrowLeft,
  Timer,
  TrendingUp,
  Users,
  AlertCircle,
  Zap,
  Radio,
} from "lucide-react";
import { useAuctionStore } from "@/store/auction";
import { useUserStore } from "@/store/user";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";
import SocketStreamComponent from "@/components/stream-socket";
import SocketStreamDialog from "@/components/stream-socket";
import { useAcceptBid, useRejectBid } from "@/hooks/bid";

interface Auction {
  id: string;
  name: string;
  description: string;
  startingPrice: number;
  currentBid?: number;
  currentPrice?: number;
  highestBidId?: string;
  status: "active" | "ended" | "closed";
  endTime: string;
  bidCount: number;
  userId: string;
  seller: {
    name: string;
    id: string;
  };
}

interface BidUpdate {
  auctionId: string;
  currentPrice: number;
  previousPrice: number;
  bidder: {
    id: string;
    username: string;
  };
  timestamp: string;
  bidCount: number;
}

const ExploreAuctionsPage = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [filteredAuctions, setFilteredAuctions] = useState<Auction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("ending-soon");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidSubmitting, setBidSubmitting] = useState(false);
  const { mutate: acceptBid, isPending: accepting } = useAcceptBid();
  const { mutate: rejectBid, isPending: rejecting } = useRejectBid();
  const handleAccept = () => {
    toast.success("Bid placed successfully!");
  };

  const handleReject = () => {
    toast.success("Bid rejected successfully");
  };

  const { user } = useUserStore();
  const queryClient = useQueryClient();

  const { data, refetch } = useQuery({
    queryKey: ["auctions"],
    queryFn: () => axios.get("http://localhost:3000/api/v1/auction/all"),
    refetchInterval: 30000,
  });

  const token = localStorage.getItem("user-token");
  const placeBidMutation = useMutation({
    mutationFn: async ({
      auctionId,
      amount,
    }: {
      auctionId: string;
      amount: number;
    }) => {
      console.log(auctionId, "auction id and ", amount);

      const response = await axios.post(
        "http://localhost:3000/api/v1/bid",
        { auctionId, amount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response, "response ofc");

      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Bid placed successfully!");
      setBidDialogOpen(false);
      setBidAmount("");
      setBidSubmitting(false);

      if (selectedAuction) {
        const newBidAmount = variables.amount;
        setAuctions((prevAuctions) =>
          prevAuctions.map((auction) =>
            auction.id === selectedAuction.id
              ? {
                  ...auction,
                  currentPrice: newBidAmount,
                  currentBid: newBidAmount,
                  bidCount: auction.bidCount + 1,
                }
              : auction
          )
        );
      }

      queryClient.invalidateQueries({ queryKey: ["auctions"] });
    },
    onError: (error: any) => {
      console.log(error, "error here");

      const errorMessage = error.response?.data?.error || "Failed to place bid";
      toast.error(errorMessage);
      setBidSubmitting(false);
    },
  });

  useEffect(() => {
    console.log("inside sockert socket");

    const socketInstance = io("http://localhost:3001", {});
    console.log("conected socket");

    setSocket(socketInstance);

    socketInstance.on("bidUpdate", (update: BidUpdate) => {
      console.log("Received bid update:", update);

      setAuctions((prevAuctions) =>
        prevAuctions.map((auction) =>
          auction.id === update.auctionId
            ? {
                ...auction,
                currentPrice: update.currentPrice,
                currentBid: update.currentPrice,
                bidCount: update.bidCount,
              }
            : auction
        )
      );

      if (update.bidder.id !== user?.id) {
        toast.info(
          `New bid of $${update.currentPrice} placed by ${update.bidder.username}`,
          {
            duration: 3000,
          }
        );
      }
    });

    socketInstance.on(
      "bidError",
      (error: { error: string; auctionId: string }) => {
        toast.error(error.error);
      }
    );

    return () => {
      socketInstance.disconnect();
    };
  }, [token, user?.id]);

  useEffect(() => {
    if (socket && auctions.length > 0) {
      auctions.forEach((auction) => {
        socket.emit("joinAuction", auction.id);

        socket.on(`newBid_${auction.id}`, (bidData: any) => {
          console.log(`New bid for auction ${auction.id}:`, bidData);

          setAuctions((prevAuctions) =>
            prevAuctions.map((a) =>
              a.id === auction.id
                ? {
                    ...a,
                    currentPrice: bidData.currentPrice || bidData.amount,
                    currentBid: bidData.currentPrice || bidData.amount,
                    bidCount: bidData.bidCount || a.bidCount + 1,
                  }
                : a
            )
          );
        });
      });

      return () => {
        auctions.forEach((auction) => {
          socket.off(`newBid_${auction.id}`);
        });
      };
    }
  }, [socket, auctions]);

  useEffect(() => {
    let filtered = auctions.filter((auction) => {
      const matchesSearch =
        auction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auction.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || auction.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case "ending-soon":
          return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
        case "highest-bid":
          const aPrice = a.currentPrice || a.currentBid || a.startingPrice;
          const bPrice = b.currentPrice || b.currentBid || b.startingPrice;
          return bPrice - aPrice;
        case "most-bids":
          return b.bidCount - a.bidCount;
        case "newest":
          return new Date(b.endTime).getTime() - new Date(a.endTime).getTime();
        default:
          return 0;
      }
    });

    setFilteredAuctions(filtered);
  }, [auctions, searchTerm, sortBy, statusFilter]);

  useEffect(() => {
    if (data?.data.auctions) {
      console.log("API Response:", data.data.auctions);
      setAuctions(data.data.auctions);
      setLoading(false);
    }
  }, [data]);

  const getTimeRemaining = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const timeLeft = end - now;

    if (timeLeft <= 0) return "Ended";

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "ended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCurrentPrice = (auction: Auction) => {
    if (auction.currentPrice && auction.currentPrice > 0)
      return auction.currentPrice;
    if (auction.currentBid && auction.currentBid > 0) return auction.currentBid;
    return auction.startingPrice;
  };

  const getMinimumBid = (auction: Auction) => {
    const currentPrice = getCurrentPrice(auction);
    return currentPrice + 1;
  };

  const handleBidClick = (auction: Auction) => {
    setSelectedAuction(auction);
    setBidAmount(getMinimumBid(auction).toString());
    setBidDialogOpen(true);
  };

  const handlePlaceBid = () => {
    if (!selectedAuction || !bidAmount) return;

    const amount = parseFloat(bidAmount);
    const minimumBid = getMinimumBid(selectedAuction);

    if (amount < minimumBid) {
      toast.error(`Bid must be at least $${minimumBid}`);
      return;
    }

    setBidSubmitting(true);
    placeBidMutation.mutate({
      auctionId: selectedAuction.id,
      amount,
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <SocketStreamDialog
        socketUrl="http://localhost:3001"
        userId={user?.id}
        onBidUpdate={(update) => {
          setAuctions((prevAuctions) =>
            prevAuctions.map((auction) =>
              auction.id === update.auctionId
                ? {
                    ...auction,
                    currentPrice: update.currentPrice,
                    currentBid: update.currentPrice,
                    bidCount: update.bidCount,
                  }
                : auction
            )
          );
        }}
        enableSound={true}
        trigger={
          <Button variant="outline" className="flex items-center gap-2">
            <Radio className="h-4 w-4" />
            Live Stream
          </Button>
        }
      />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <Link href="/auction">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/70 backdrop-blur-sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Explore Auctions
                </h1>
                <p className="text-gray-600">
                  Discover amazing items and place your bids
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="hidden sm:flex">
              {filteredAuctions.length} Active Auctions
            </Badge>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search auctions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/50"
                    />
                  </div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-white/50">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ending-soon">Ending Soon</SelectItem>
                      <SelectItem value="highest-bid">Highest Bid</SelectItem>
                      <SelectItem value="most-bids">Most Bids</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-white/50">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="ended">Ended</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="bg-white/50">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card
                    key={i}
                    className="border-0 shadow-lg bg-white/70 backdrop-blur-sm animate-pulse"
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        <div className="flex justify-between">
                          <div className="h-6 bg-gray-200 rounded w-16"></div>
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <AnimatePresence>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAuctions.map((auction, index) => {
                    const currentPrice = getCurrentPrice(auction);
                    const isOwner = auction.userId === user?.id;
                    const timeRemaining = getTimeRemaining(auction.endTime);
                    const isActive =
                      auction.status === "active" && timeRemaining !== "Ended";
                    const hasBids = currentPrice > auction.startingPrice;

                    return (
                      <motion.div
                        key={auction.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="group border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer relative overflow-hidden">
                          {isActive && (
                            <div className="absolute top-2 right-2 z-10">
                              <div className="flex items-center space-x-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                <span>LIVE</span>
                              </div>
                            </div>
                          )}

                          <CardHeader className="space-y-3">
                            <div className="flex justify-between items-start">
                              <Badge className={getStatusColor(auction.status)}>
                                {auction.status}
                              </Badge>
                              <div className="flex items-center text-sm text-gray-500">
                                <Timer className="h-4 w-4 mr-1" />
                                {timeRemaining}
                              </div>
                            </div>
                            <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {auction.name}
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600 line-clamp-2">
                              {auction.description}
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-xs text-gray-500">
                                  {hasBids ? "Current Bid" : "Starting Price"}
                                </p>
                                <p className="text-xl font-bold text-green-600 flex items-center">
                                  ${currentPrice}
                                  {hasBids && (
                                    <TrendingUp className="h-4 w-4 ml-1 text-green-500" />
                                  )}
                                </p>
                                {!hasBids && (
                                  <p className="text-xs text-gray-500">
                                    No bids yet
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">
                                  {hasBids ? "Starting Price" : "Minimum Bid"}
                                </p>
                                <p className="text-sm text-gray-700">
                                  $
                                  {hasBids
                                    ? auction.startingPrice
                                    : getMinimumBid(auction)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Users className="h-4 w-4" />
                                <span>{auction.bidCount} bids</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Gavel className="h-4 w-4" />
                                <span>{auction.seller.name}</span>
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              {isOwner ? (
                                <>
                                  <Button
                                    size="sm"
                                    className="flex-1 bg-green-500 text-white hover:bg-green-600"
                                    onClick={handleAccept}
                                    disabled={accepting}
                                  >
                                    {accepting ? "Accepting..." : "Accept"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 bg-white/50"
                                    onClick={handleReject}
                                    disabled={rejecting}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    {rejecting ? "Rejecting..." : "Reject"}
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 bg-white/50 hover:bg-gradient-to-r hover:from-green-500 hover:to-green-600 hover:text-white"
                                    disabled={!isActive}
                                    onClick={() => handleBidClick(auction)}
                                  >
                                    <Zap className="h-4 w-4 mr-2" />
                                    {isActive ? "Bid Now" : "Ended"}
                                  </Button>
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </AnimatePresence>
            )}
          </motion.div>

          {!loading && filteredAuctions.length === 0 && (
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Gavel className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No auctions found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your search terms or filters
                  </p>
                  <Link href="/auction/create">
                    <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                      Create First Auction
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
      <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Gavel className="h-5 w-5" />
              <span>Place Your Bid</span>
            </DialogTitle>
            <DialogDescription>
              {selectedAuction && (
                <>
                  Bidding on <strong>{selectedAuction.name}</strong>
                  <br />
                  Current price:{" "}
                  <strong>${getCurrentPrice(selectedAuction)}</strong>
                  <br />
                  Minimum bid:{" "}
                  <strong>${getMinimumBid(selectedAuction)}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bid-amount" className="text-right">
                Amount ($)
              </Label>
              <div className="col-span-3 relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="bid-amount"
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="pl-10"
                  min={selectedAuction ? getMinimumBid(selectedAuction) : 1}
                  step="1"
                />
              </div>
            </div>
            {selectedAuction &&
              parseFloat(bidAmount) < getMinimumBid(selectedAuction) && (
                <div className="flex items-center space-x-2 text-amber-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    Bid must be at least ${getMinimumBid(selectedAuction)}
                  </span>
                </div>
              )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setBidDialogOpen(false)}
              disabled={bidSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handlePlaceBid}
              // @ts-ignore
              disabled={
                bidSubmitting ||
                !bidAmount ||
                (selectedAuction &&
                  parseFloat(bidAmount) < getMinimumBid(selectedAuction))
              }
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {bidSubmitting ? "Placing Bid..." : "Place Bid"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExploreAuctionsPage;
