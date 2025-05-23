"use client";
import React from "react";

import AuctionHero from "@/components/auction/auction-hero";
import AuctionFeature from "@/components/auction/auction-features";
import AuctionFooter from "@/components/auction/auction-footer";

const AuctionHomepage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <AuctionHero />
      <AuctionFeature />
      <AuctionFooter />
    </div>
  );
};

export default AuctionHomepage;
