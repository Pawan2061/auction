"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gavel, Plus, Search, TrendingUp, Clock, Users } from "lucide-react";

const AuctionMainPage = () => {
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
          <motion.div variants={itemVariants} className="text-center space-y-4">
            <div className="flex justify-center items-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full">
                <Gavel className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Auction Hub
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover amazing items, place bids in real-time, and create your
              own auctions
            </p>
            <Badge variant="secondary" className="text-sm">
              Real-time bidding platform
            </Badge>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          >
            <Card className="group border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <CardHeader className="text-center space-y-4 pb-4">
                <div className="mx-auto p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full group-hover:from-green-600 group-hover:to-emerald-700 transition-all duration-300">
                  <Search className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  Explore Auctions
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Browse live auctions, place bids, and find amazing deals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Real-time bidding</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>Live price updates</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>Active community</span>
                  </div>
                </div>
                <Link href="/auction/explore" className="block">
                  <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 transition-all duration-300">
                    Start Exploring
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <CardHeader className="text-center space-y-4 pb-4">
                <div className="mx-auto p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full group-hover:from-blue-600 group-hover:to-indigo-700 transition-all duration-300">
                  <Plus className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  Create Auction
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  List your items and start receiving bids from buyers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Gavel className="h-4 w-4" />
                    <span>Easy listing process</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Flexible duration</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>Real-time notifications</span>
                  </div>
                </div>
                <Link href="/auction/create" className="block">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 transition-all duration-300">
                    Create Auction
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  How It Works
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Get started in just a few simple steps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-3">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">1</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      Browse or Create
                    </h3>
                    <p className="text-sm text-gray-600">
                      Explore existing auctions or create your own listing
                    </p>
                  </div>
                  <div className="text-center space-y-3">
                    <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-lg">
                        2
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      Bid in Real-time
                    </h3>
                    <p className="text-sm text-gray-600">
                      Place bids and see live updates from other participants
                    </p>
                  </div>
                  <div className="text-center space-y-3">
                    <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-lg">
                        3
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      Win & Complete
                    </h3>
                    <p className="text-sm text-gray-600">
                      Get notified when you win and complete the transaction
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuctionMainPage;
