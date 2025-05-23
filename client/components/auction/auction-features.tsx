import { motion } from "framer-motion";
import { Clock, ShoppingBag, Star, Zap } from "lucide-react";
import { Card } from "../ui/card";
export default function AuctionFeature() {
  return (
    <section className="py-16 px-6 bg-white/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Why Choose AuctionHub?
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Experience the future of online auctions with our cutting-edge
            platform
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Zap,
              title: "Real-Time",
              desc: "Live bidding updates",
              color: "yellow",
            },
            {
              icon: ShoppingBag,
              title: "Secure",
              desc: "Protected transactions",
              color: "green",
            },
            {
              icon: Clock,
              title: "Fast",
              desc: "Quick auction setup",
              color: "blue",
            },
            {
              icon: Star,
              title: "Trusted",
              desc: "Verified sellers",
              color: "purple",
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.4 + index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="text-center p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div
                  className={`w-16 h-16 bg-${feature.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <feature.icon
                    className={`w-8 h-8 text-${feature.color}-600`}
                  />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
