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
} from "lucide-react";

interface Auction {
  id: string;
  name: string;
  description: string;
  startingPrice: number;
  currentBid?: number;
  status: "active" | "ended" | "closed";
  endTime: string;
  bidCount: number;
  seller: {
    name: string;
  };
}

const ExploreAuctionsPage = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [filteredAuctions, setFilteredAuctions] = useState<Auction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("ending-soon");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockAuctions: Auction[] = [
      {
        id: "1",
        name: "Vintage Guitar Collection",
        description:
          "Beautiful 1967 Fender Stratocaster in excellent condition",
        startingPrice: 500,
        currentBid: 1250,
        status: "active",
        endTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
        bidCount: 12,
        seller: { name: "John Doe" },
      },
      {
        id: "2",
        name: "Modern Art Painting",
        description: "Abstract expressionist piece by local artist",
        startingPrice: 200,
        currentBid: 350,
        status: "active",
        endTime: new Date(Date.now() + 120 * 60 * 1000).toISOString(),
        bidCount: 8,
        seller: { name: "Art Gallery" },
      },
      {
        id: "3",
        name: "Rare Book Collection",
        description: "First edition classics from the 19th century",
        startingPrice: 800,
        currentBid: 1100,
        status: "active",
        endTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        bidCount: 15,
        seller: { name: "Book Store" },
      },
      {
        id: "4",
        name: "Antique Watch",
        description: "Swiss mechanical watch from 1950s",
        startingPrice: 300,
        status: "active",
        endTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
        bidCount: 3,
        seller: { name: "Watch Collector" },
      },
      {
        id: "5",
        name: "Designer Handbag",
        description: "Limited edition luxury handbag",
        startingPrice: 400,
        currentBid: 650,
        status: "active",
        endTime: new Date(Date.now() + 180 * 60 * 1000).toISOString(),
        bidCount: 9,
        seller: { name: "Fashion House" },
      },
    ];

    setTimeout(() => {
      setAuctions(mockAuctions);
      setFilteredAuctions(mockAuctions);
      setLoading(false);
    }, 1000);
  }, []);

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
          return (
            (b.currentBid || b.startingPrice) -
            (a.currentBid || a.startingPrice)
          );
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
                  {filteredAuctions.map((auction, index) => (
                    <motion.div
                      key={auction.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="group border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer">
                        <CardHeader className="space-y-3">
                          <div className="flex justify-between items-start">
                            <Badge className={getStatusColor(auction.status)}>
                              {auction.status}
                            </Badge>
                            <div className="flex items-center text-sm text-gray-500">
                              <Timer className="h-4 w-4 mr-1" />
                              {getTimeRemaining(auction.endTime)}
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
                                Current Bid
                              </p>
                              <p className="text-xl font-bold text-green-600">
                                ${auction.currentBid || auction.startingPrice}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">
                                Starting Price
                              </p>
                              <p className="text-sm text-gray-700">
                                ${auction.startingPrice}
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
                              className="flex-1 bg-white/50"
                              disabled={auction.status !== "active"}
                            >
                              <DollarSign className="h-4 w-4 mr-2" />
                              Bid Now
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
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
    </div>
  );
};

export default ExploreAuctionsPage;
