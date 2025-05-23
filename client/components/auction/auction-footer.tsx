import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Eye, Plus } from "lucide-react";
export default function AuctionFooter() {
  const handleExploreAuctions = () => {
    console.log("Navigate to /auction/all");
  };

  const handleCreateAuction = () => {
    console.log("Navigate to /auction/create");
  };
  return (
    <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="space-y-6"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Start Bidding?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users already buying and selling on AuctionHub
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleExploreAuctions}
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 text-lg"
            >
              <Eye className="w-5 h-5 mr-2" />
              Browse Auctions
            </Button>
            <Button
              onClick={handleCreateAuction}
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3 text-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Auction
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
