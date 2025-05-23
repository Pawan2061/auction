"use client";
import React, { useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowRight,
  Gavel,
  Timer,
  Zap,
  Users,
  Shield,
  TrendingUp,
  Play,
  Clock,
  DollarSign,
  Bell,
  Eye,
  ChevronDown,
  Star,
  Heart,
  Share2,
  Sparkles,
} from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AuctionLanding = () => {
  const [activeAuctions, setActiveAuctions] = useState(12);
  const [totalUsers, setTotalUsers] = useState(2847);
  const [currentBid, setCurrentBid] = useState(15420);
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 34,
    seconds: 17,
  });
  const [bidAmount, setBidAmount] = useState("");
  const [isWatching, setIsWatching] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showBidForm, setShowBidForm] = useState(false);

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 30]);
  const y2 = useTransform(scrollY, [0, 300], [0, -30]);

  // Live stats animation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAuctions((prev) =>
        Math.max(8, prev + Math.floor(Math.random() * 3) - 1)
      );
      setTotalUsers((prev) => prev + Math.floor(Math.random() * 5));

      // Random bid updates
      if (Math.random() > 0.7) {
        setCurrentBid((prev) => prev + Math.floor(Math.random() * 500) + 50);
        addNotification(
          `New bid placed: $${(
            currentBid +
            Math.floor(Math.random() * 500) +
            50
          ).toLocaleString()}`
        );
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [currentBid]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addNotification = (message: string) => {
    const id = Date.now();
    // @ts-ignore
    setNotifications((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      // @ts-ignore
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  const handleBid = () => {
    const bid = parseInt(bidAmount);
    if (bid > currentBid) {
      setCurrentBid(bid);
      setBidAmount("");
      setShowBidForm(false);
      addNotification(`Your bid of $${bid.toLocaleString()} has been placed!`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-slate-800 overflow-hidden">
      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            //   @ts-ignore
            key={notification.id}
            initial={{ opacity: 0, y: -50, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -50, x: 50 }}
            className="fixed top-4 right-4 z-50"
          >
            <Alert className="bg-emerald-50 border-emerald-200 shadow-lg backdrop-blur-sm">
              <Bell className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-800">
                {/* @ts-ignore */}
                {notification.message}
              </AlertDescription>
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          style={{ y: y1 }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 0],
            transition: { duration: 20, repeat: Infinity, ease: "easeInOut" },
          }}
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-200/30 to-orange-200/30 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            rotate: [90, 0, 90],
            transition: {
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 5,
            },
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-indigo-200/20 to-cyan-200/20 rounded-full blur-2xl"
          animate={{
            x: [-100, 100, -100],
            y: [-50, 50, -50],
            transition: { duration: 25, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="relative z-50 flex items-center justify-between p-6 lg:px-12 bg-white/80 backdrop-blur-md border-b border-slate-200/50"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
            <Gavel className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AuctionHub
          </span>
        </motion.div>

        <div className="hidden md:flex items-center space-x-8">
          <Button
            variant="ghost"
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            Live Auctions
          </Button>
          <Button
            variant="ghost"
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            How It Works
          </Button>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg">
            Sign In
          </Button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-40 px-6 lg:px-12 pt-20 pb-32"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                variants={itemVariants}
                className="flex items-center space-x-3 mb-6"
              >
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2" />
                  Live Now
                </Badge>
                <div className="flex items-center space-x-2 text-slate-500">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm">
                    {activeAuctions} Active Auctions
                  </span>
                </div>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-5xl lg:text-7xl font-bold mb-6 leading-tight text-slate-900"
              >
                Win Big in
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Real-Time
                </span>
                Auctions
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-xl text-slate-600 mb-8 leading-relaxed max-w-lg"
              >
                Experience the thrill of live bidding with instant
                notifications, secure transactions, and seamless seller
                confirmations.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 mb-12"
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r cursor-pointer from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-lg py-6 px-8 shadow-xl hover:shadow-2xl transition-all"
                  onClick={() =>
                    addNotification("Redirecting to live auctions...")
                  }
                >
                  Join Live Auction
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-300 cursor-pointer hover:border-slate-400 text-slate-700 text-lg py-6 px-8 hover:bg-slate-50 shadow-lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Create Auction
                </Button>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-200"
              >
                <div className="text-center">
                  <motion.div
                    key={totalUsers}
                    initial={{ scale: 1.2, color: "#3b82f6" }}
                    animate={{ scale: 1, color: "#1e293b" }}
                    className="text-3xl font-bold text-slate-800"
                  >
                    {totalUsers.toLocaleString()}
                  </motion.div>
                  <div className="text-sm text-slate-500 font-medium">
                    Active Users
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">
                    98.5%
                  </div>
                  <div className="text-sm text-slate-500 font-medium">
                    Success Rate
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500">
                    $2.4M
                  </div>
                  <div className="text-sm text-slate-500 font-medium">
                    Total Sales
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Interactive Auction Card */}
            <motion.div variants={itemVariants} className="relative">
              <Card className="bg-white/90 backdrop-blur-xl border-slate-200 shadow-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-slate-800">
                      Featured Auction
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-1" />
                        Live
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsWatching(!isWatching)}
                        className={`${
                          isWatching
                            ? "text-red-500 hover:bg-red-50"
                            : "text-slate-400 hover:bg-slate-100"
                        } transition-colors`}
                      >
                        {isWatching ? (
                          <Heart className="w-4 h-4 fill-current" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 p-6">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <img
                      src="/api/placeholder/300/200"
                      alt="Vintage Rolex Submariner"
                      className="w-full h-48 object-cover rounded-xl mb-4 border border-slate-200"
                    />
                    <h4 className="text-lg font-semibold mb-2 text-slate-800">
                      Vintage Rolex Submariner
                    </h4>
                    <p className="text-slate-600 text-sm mb-4">
                      Rare 1960s diving watch in excellent condition
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <div className="flex items-center space-x-1 bg-blue-50 px-2 py-1 rounded-full">
                        <Eye className="w-4 h-4 text-blue-500" />
                        <span>124 watching</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-purple-50 px-2 py-1 rounded-full">
                        <Users className="w-4 h-4 text-purple-500" />
                        <span>18 bidders</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <span className="text-slate-600 font-medium">
                        Current Bid
                      </span>
                      <motion.span
                        key={currentBid}
                        initial={{ scale: 1.2, color: "#059669" }}
                        animate={{ scale: 1, color: "#1e293b" }}
                        className="text-2xl font-bold text-slate-800"
                      >
                        ${currentBid.toLocaleString()}
                      </motion.span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                      <span className="text-slate-600 font-medium">
                        Time Left
                      </span>
                      <div className="flex items-center space-x-1 text-orange-600 font-bold">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono text-lg">
                          {String(timeLeft.hours).padStart(2, "0")}:
                          {String(timeLeft.minutes).padStart(2, "0")}:
                          {String(timeLeft.seconds).padStart(2, "0")}
                        </span>
                      </div>
                    </div>

                    <AnimatePresence>
                      {showBidForm ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3 p-4 bg-blue-50 rounded-xl border border-blue-100"
                        >
                          <Input
                            type="number"
                            placeholder={`Minimum: $${(
                              currentBid + 50
                            ).toLocaleString()}`}
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="bg-white border-blue-200 focus:border-blue-400"
                          />
                          <div className="flex space-x-2">
                            <Button
                              className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg"
                              onClick={handleBid}
                              disabled={
                                !bidAmount || parseInt(bidAmount) <= currentBid
                              }
                            >
                              Place Bid
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowBidForm(false)}
                              className="border-slate-300 hover:bg-slate-50"
                            >
                              Cancel
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        <Button
                          className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg text-lg py-3"
                          onClick={() => setShowBidForm(true)}
                        >
                          Place Bid
                        </Button>
                      )}
                    </AnimatePresence>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-slate-300 hover:bg-slate-50"
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-slate-300 hover:bg-slate-50"
                      >
                        <Bell className="w-4 h-4 mr-1" />
                        Notify Me
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative z-40 px-6 lg:px-12 py-20 bg-white/50 backdrop-blur-sm"
        id="features"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-slate-900">
              Why Choose
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AuctionHub?
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Built for speed, security, and seamless real-time experiences
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Real-Time Bidding",
                description:
                  "Instant bid updates with WebSocket technology for lightning-fast auction experiences.",
                color: "from-yellow-400 to-orange-500",
                bgColor: "from-yellow-50 to-orange-50",
              },
              {
                icon: Shield,
                title: "Secure Transactions",
                description:
                  "Bank-level security with encrypted payments and verified seller confirmations.",
                color: "from-emerald-400 to-green-500",
                bgColor: "from-emerald-50 to-green-50",
              },
              {
                icon: Timer,
                title: "Smart Timers",
                description:
                  "Precise countdown timers with automatic auction closure and notification systems.",
                color: "from-blue-400 to-cyan-500",
                bgColor: "from-blue-50 to-cyan-50",
              },
              {
                icon: Users,
                title: "Community Driven",
                description:
                  "Join thousands of active bidders in our thriving auction community.",
                color: "from-purple-400 to-pink-500",
                bgColor: "from-purple-50 to-pink-50",
              },
              {
                icon: TrendingUp,
                title: "Market Insights",
                description:
                  "Real-time analytics and bidding trends to help you make informed decisions.",
                color: "from-indigo-400 to-blue-500",
                bgColor: "from-indigo-50 to-blue-50",
              },
              {
                icon: DollarSign,
                title: "Instant Payouts",
                description:
                  "Automated invoicing and fast payouts for successful auction completions.",
                color: "from-green-400 to-emerald-500",
                bgColor: "from-green-50 to-emerald-50",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className="h-full bg-white/90 backdrop-blur-xl border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-lg hover:shadow-xl">
                  <CardHeader>
                    <div
                      className={`bg-gradient-to-r ${feature.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-slate-800">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() =>
                        addNotification("Feature demo coming soon!")
                      }
                    >
                      Learn More <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative z-40 px-6 lg:px-12 py-20"
      >
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 backdrop-blur-xl border-slate-200 shadow-2xl">
            <CardContent className="p-12">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-slate-900">
                  Ready to Start
                  <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Bidding?
                  </span>
                </h2>
                <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                  Join the excitement of live auctions. Create your account and
                  start bidding in seconds.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-lg py-6 px-8 shadow-xl hover:shadow-2xl transition-all"
                    onClick={() => addNotification("Welcome to AuctionHub! 🎉")}
                  >
                    Join Live Auction
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-slate-300 hover:border-slate-400 text-slate-700 text-lg py-6 px-8 hover:bg-white/80 shadow-lg"
                  >
                    Create Auction
                  </Button>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-40 px-6 lg:px-12 py-12 bg-white/80 backdrop-blur-md border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                <Gavel className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AuctionHub
              </span>
            </div>
            <div className="text-slate-500 text-sm">
              © 2025 AuctionHub. Built with 💙 for real-time bidding.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuctionLanding;
