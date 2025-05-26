/* eslint-disable */

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  Wifi,
  WifiOff,
  DollarSign,
  Clock,
  User,
  TrendingUp,
  Volume2,
  VolumeX,
  Radio,
  X,
  Trophy,
  AlertCircle,
} from "lucide-react";

interface BidUpdate {
  auctionId: string;
  auctionName?: string;
  currentPrice: number;
  previousPrice: number;
  bidder: {
    id: string;
    username: string;
  };
  timestamp: string;
  bidCount: number;
  id?: string;
  type?: string;
}

interface AuctionActivity {
  type: "bid_placed" | "bid_rejected" | "auction_ended";
  auctionId: string;
  auctionName?: string;
  currentPrice?: number;
  bidder?: {
    id: string;
    username: string;
  };
  winner?: {
    id: string;
    username: string;
  };
  winningBid?: number;
  timestamp: string;
}

interface SocketStreamDialogProps {
  socketUrl?: string;
  userId?: string;
  onBidUpdate?: (update: BidUpdate) => void;
  onAuctionActivity?: (activity: AuctionActivity) => void;
  maxStreamItems?: number;
  enableSound?: boolean;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SocketStreamDialog: React.FC<SocketStreamDialogProps> = ({
  socketUrl = "http://localhost:3001",
  userId = "",
  onBidUpdate,
  onAuctionActivity,
  maxStreamItems = 100,
  enableSound = true,
  trigger,
  open,
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(open || false);
  const [isConnected, setIsConnected] = useState(false);
  const [bidUpdates, setBidUpdates] = useState<BidUpdate[]>([]);
  const [auctionActivities, setAuctionActivities] = useState<AuctionActivity[]>(
    []
  );
  const [soundEnabled, setSoundEnabled] = useState(enableSound);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [activeTab, setActiveTab] = useState<"bids" | "activities">("bids");

  const socketRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  useEffect(() => {
    if (
      soundEnabled &&
      !audioContextRef.current &&
      typeof window !== "undefined"
    ) {
      try {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn("Audio context not supported");
      }
    }
  }, [soundEnabled]);

  const playNotificationSound = (
    type: "bid" | "error" | "auction_ended" = "bid"
  ) => {
    if (!soundEnabled || !audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (type === "bid") {
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
      } else if (type === "auction_ended") {
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(1200, ctx.currentTime + 0.2);
      } else {
        oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      }

      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (error) {
      console.warn("Failed to play notification sound");
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    let socket: any = null;
    const processedUpdates = new Set<string>();
    const processedActivities = new Set<string>();

    const connectSocket = () => {
      try {
        if (typeof window !== "undefined") {
          const io = require("socket.io-client");

          socket = io(socketUrl, {
            transports: ["websocket", "polling"],
            timeout: 5000,
            forceNew: true,
          });

          socket.on("connect", () => {
            console.log("Socket connected for global stream");
            setIsConnected(true);
            setConnectionError(null);
            setConnectionAttempts(0);
            processedUpdates.clear();
            processedActivities.clear();
          });

          socket.on("disconnect", () => {
            console.log("Socket disconnected from global stream");
            setIsConnected(false);
            attemptReconnect();
          });

          socket.on("connect_error", (error: any) => {
            console.error("Socket connection error:", error);
            setConnectionError(`Connection failed: ${error.message}`);
            setIsConnected(false);
            attemptReconnect();
          });

          // Listen to global bid updates (no room joining required)
          socket.on("bidUpdate", (update: BidUpdate) => {
            console.log("Received global bid update:", update);

            const updateId = `${update.auctionId}-${update.currentPrice}-${update.bidder.id}-${update.timestamp}`;

            if (processedUpdates.has(updateId)) {
              console.log("Duplicate bid update detected, skipping:", updateId);
              return;
            }

            processedUpdates.add(updateId);

            const enrichedUpdate = {
              ...update,
              timestamp: update.timestamp || new Date().toISOString(),
              id: updateId,
            };

            setBidUpdates((prev) => {
              const isDuplicate = prev.some(
                (existing) =>
                  existing.auctionId === update.auctionId &&
                  existing.currentPrice === update.currentPrice &&
                  existing.bidder.id === update.bidder.id &&
                  Math.abs(
                    new Date(existing.timestamp).getTime() -
                      new Date(enrichedUpdate.timestamp).getTime()
                  ) < 1000
              );

              if (isDuplicate) {
                console.log("Duplicate bid update in state detected, skipping");
                return prev;
              }

              const newUpdates = [enrichedUpdate, ...prev].slice(
                0,
                maxStreamItems
              );
              return newUpdates;
            });

            playNotificationSound("bid");

            if (onBidUpdate) {
              onBidUpdate(enrichedUpdate);
            }
          });

          // Listen to global auction activities
          socket.on("auctionActivity", (activity: AuctionActivity) => {
            console.log("Received auction activity:", activity);

            const activityId = `${activity.type}-${activity.auctionId}-${activity.timestamp}`;

            if (processedActivities.has(activityId)) {
              console.log("Duplicate activity detected, skipping:", activityId);
              return;
            }

            processedActivities.add(activityId);

            setAuctionActivities((prev) => {
              const newActivities = [activity, ...prev].slice(
                0,
                maxStreamItems
              );
              return newActivities;
            });

            if (activity.type === "auction_ended") {
              playNotificationSound("auction_ended");
            }

            if (onAuctionActivity) {
              onAuctionActivity(activity);
            }
          });

          // Listen to global auction ended events
          socket.on("auctionEnded", (data: any) => {
            console.log("Received auction ended event:", data);

            const activity: AuctionActivity = {
              type: "auction_ended",
              auctionId: data.auctionId,
              auctionName: data.auctionName || data.auctionTitle,
              winner: data.winner,
              winningBid: data.winningBid,
              timestamp: data.timestamp,
            };

            const activityId = `auction_ended-${data.auctionId}-${data.timestamp}`;

            if (!processedActivities.has(activityId)) {
              processedActivities.add(activityId);
              setAuctionActivities((prev) =>
                [activity, ...prev].slice(0, maxStreamItems)
              );
              playNotificationSound("auction_ended");
            }
          });

          // Listen to global bid errors
          socket.on(
            "bidError",
            (error: { error: string; auctionId: string }) => {
              console.error("Global bid error:", error);
              playNotificationSound("error");
            }
          );

          socketRef.current = socket;
        }
      } catch (error) {
        console.error("Failed to create socket connection:", error);
        setConnectionError("Failed to initialize socket connection");
        setIsConnected(false);
        attemptReconnect();
      }
    };

    const attemptReconnect = () => {
      if (connectionAttempts < 5) {
        const delay = Math.min(1000 * Math.pow(2, connectionAttempts), 10000);

        reconnectTimeoutRef.current = setTimeout(() => {
          setConnectionAttempts((prev) => prev + 1);
          connectSocket();
        }, delay);
      } else {
        setConnectionError("Max reconnection attempts reached");
      }
    };

    connectSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket) {
        socket.disconnect();
      }
    };
  }, [
    isOpen,
    socketUrl,
    onBidUpdate,
    onAuctionActivity,
    maxStreamItems,
    connectionAttempts,
  ]);

  useEffect(() => {
    if (
      scrollRef.current &&
      (bidUpdates.length > 0 || auctionActivities.length > 0)
    ) {
      scrollRef.current.scrollTop = 0;
    }
  }, [bidUpdates, auctionActivities, activeTab]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
    if (!newOpen) {
      setBidUpdates([]);
      setAuctionActivities([]);
      setConnectionError(null);
      setConnectionAttempts(0);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getUpdateColor = (update: BidUpdate) => {
    if (update.bidder.id === userId) return "border-l-blue-500 bg-blue-50";
    if (update.type === "bid_rejected") return "border-l-red-500 bg-red-50";
    const priceIncrease = update.currentPrice - update.previousPrice;
    if (priceIncrease > 100) return "border-l-green-500 bg-green-50";
    if (priceIncrease > 50) return "border-l-yellow-500 bg-yellow-50";
    return "border-l-gray-300 bg-gray-50";
  };

  const getActivityColor = (activity: AuctionActivity) => {
    switch (activity.type) {
      case "auction_ended":
        return "border-l-purple-500 bg-purple-50";
      case "bid_rejected":
        return "border-l-red-500 bg-red-50";
      default:
        return "border-l-green-500 bg-green-50";
    }
  };

  const defaultTrigger = (
    <Button variant="outline" className="flex items-center gap-2">
      <Radio className="h-4 w-4" />
      Live Stream
      {isConnected && (
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      )}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Activity className="h-6 w-6 text-red-500" />
              Global Auction Stream
              {isConnected && (
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant={isConnected ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                {isConnected ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    Live
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    Disconnected
                  </>
                )}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="h-8 w-8 p-0"
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">
          {connectionError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm text-red-600">
                {connectionError}
                {connectionAttempts > 0 && (
                  <span className="block mt-1">
                    Reconnection attempt {connectionAttempts}/5
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
            <span>{bidUpdates.length} live updates received</span>
            <span>
              {bidUpdates[0]
                ? `Last: ${formatTime(bidUpdates[0].timestamp)}`
                : "Waiting for bids..."}
            </span>
          </div>

          <ScrollArea className="h-96 w-full border rounded-lg" ref={scrollRef}>
            <div className="p-4 space-y-3">
              {bidUpdates.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <Activity className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-medium mb-2">
                    Waiting for Live Bids
                  </h3>
                  <p className="text-sm">
                    {isConnected
                      ? "Connected and ready to stream auction updates..."
                      : "Connecting to auction stream..."}
                  </p>
                </div>
              ) : (
                bidUpdates.map((update, index) => {
                  const priceIncrease =
                    update.currentPrice - update.previousPrice;

                  return (
                    <Card
                      key={
                        update.id ||
                        `${update.auctionId}-${update.timestamp}-${index}`
                      }
                      className={`border-l-4 transition-all duration-300 hover:shadow-md ${getUpdateColor(
                        update
                      )}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {update.auctionName ||
                                `Auction ${update.auctionId.slice(-6)}`}
                            </h4>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{update.bidder.username}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatTime(update.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Bid #{update.bidCount}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-5 w-5 text-green-600" />
                              <span className="text-xl font-bold text-green-600">
                                {formatPrice(update.currentPrice)}
                              </span>
                            </div>
                            {priceIncrease > 0 && (
                              <div className="flex items-center text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                                <TrendingUp className="h-3 w-3 mr-1" />+
                                {formatPrice(priceIncrease)}
                              </div>
                            )}
                          </div>
                          {update.bidder.id === userId && (
                            <Badge className="bg-blue-500">Your Bid</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {bidUpdates.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {bidUpdates.length}
                  </div>
                  <div className="text-gray-600">Live Updates</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(
                      Math.max(...bidUpdates.map((u) => u.currentPrice))
                    )}
                  </div>
                  <div className="text-gray-600">Highest Bid</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {new Set(bidUpdates.map((u) => u.auctionId)).size}
                  </div>
                  <div className="text-gray-600">Active Auctions</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocketStreamDialog;
