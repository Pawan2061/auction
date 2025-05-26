/* eslint-disable */
"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  DollarSign,
  Package,
  FileText,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import { useAuctionStore } from "@/store/auction";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

interface AuctionFormData {
  name: string;
  description: string;
  startingPrice: string;
  duration: string;
}

const AuctionCreationPage = () => {
  const [formData, setFormData] = useState<AuctionFormData>({
    name: "",
    description: "",
    startingPrice: "",
    duration: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<AuctionFormData>>({});
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    const token = localStorage.getItem("user-token");
    setToken(token);
  });

  const durationOptions = [
    { value: "2", label: "2 minutes", description: "Quick auction" },
    { value: "5", label: "5 minutes", description: "Standard" },
    { value: "10", label: "10 minutes", description: "Extended" },
    { value: "30", label: "30 minutes", description: "Long auction" },
  ];
  // const token = localStorage.getItem("user-token");
  const { addAuction } = useAuctionStore();
  const { mutate: createAuction, isPending } = useMutation({
    mutationFn: (data: AuctionFormData) =>
      axios.post(`${API_BASE}/api/v1/auction`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),

    onSuccess: (res) => {
      toast.success("Auction created successfully!");

      const createdAuction = res.data.auction;

      console.log(createAuction, "is here");

      addAuction({
        id: createdAuction.id,
        name: createdAuction.name,
        description: createdAuction.description,
        startingPrice: createdAuction.startingPrice,
        duration: createdAuction.duration,
        status: createdAuction.status,
        highestBidId: createdAuction.highestBidId,
        userId: createdAuction.userId,
        createdAt: createdAuction.createdAt,
        updatedAt: createdAuction.updatedAt,
        endTime: createdAuction.endTime,
        seller: {
          id: createdAuction.seller.id,
          name: createdAuction.seller.username,
        },
      });

      setIsSuccess(true);
      setFormData({
        name: "",
        description: "",
        startingPrice: "",
        duration: "",
      });

      router.push("/auction/explore");
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    },
    onError: (error: any) => {
      console.error("Error creating auction:", error);
      toast.error("Failed to create auction. Please try again.");
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<AuctionFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Item name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.startingPrice) {
      newErrors.startingPrice = "Starting price is required";
    } else if (
      isNaN(Number(formData.startingPrice)) ||
      Number(formData.startingPrice) <= 0
    ) {
      newErrors.startingPrice = "Please enter a valid price";
    }

    if (!formData.duration) {
      newErrors.duration = "Please select auction duration";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    console.log(formData, "formdata is here");

    createAuction(formData);
  };

  const handleInputChange = (field: keyof AuctionFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-bold text-slate-800 mb-2"
          >
            Auction Created Successfully!
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-slate-600"
          >
            Your auction is now live and ready for bidding
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-2xl mx-auto p-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Start Your Auction
              </CardTitle>
              <p className="text-slate-600 mt-2">
                Fill in the details below to create your auction
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <Label
                    htmlFor="name"
                    className="flex items-center gap-2 text-slate-700 font-medium"
                  >
                    <Package className="w-4 h-4" />
                    Item Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Vintage Guitar, Rare Book, Artwork..."
                    className={`h-12 border-2 transition-all duration-200 ${
                      errors.name
                        ? "border-red-300 focus:border-red-500"
                        : "border-slate-200 focus:border-blue-500"
                    }`}
                  />
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm"
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <Label
                    htmlFor="description"
                    className="flex items-center gap-2 text-slate-700 font-medium"
                  >
                    <FileText className="w-4 h-4" />
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e: any) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Describe your item's condition, features, and any special details..."
                    rows={4}
                    className={`border-2 transition-all duration-200 resize-none ${
                      errors.description
                        ? "border-red-300 focus:border-red-500"
                        : "border-slate-200 focus:border-blue-500"
                    }`}
                  />
                  {errors.description && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm"
                    >
                      {errors.description}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <Label
                    htmlFor="startingPrice"
                    className="flex items-center gap-2 text-slate-700 font-medium"
                  >
                    <DollarSign className="w-4 h-4" />
                    Starting Price ($)
                  </Label>
                  <Input
                    id="startingPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.startingPrice}
                    onChange={(e) =>
                      handleInputChange("startingPrice", e.target.value)
                    }
                    placeholder="0.00"
                    className={`h-12 border-2 transition-all duration-200 ${
                      errors.startingPrice
                        ? "border-red-300 focus:border-red-500"
                        : "border-slate-200 focus:border-blue-500"
                    }`}
                  />
                  {errors.startingPrice && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm"
                    >
                      {errors.startingPrice}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
                  <Label className="flex items-center gap-2 text-slate-700 font-medium">
                    <Clock className="w-4 h-4" />
                    Auction Duration
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {durationOptions.map((option, index) => (
                      <motion.div
                        key={option.value}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleInputChange("duration", option.value)
                          }
                          className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-105 ${
                            formData.duration === option.value
                              ? "border-blue-500 bg-blue-50 shadow-md"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-slate-800">
                                {option.label}
                              </p>
                              <p className="text-sm text-slate-600">
                                {option.description}
                              </p>
                            </div>
                            {formData.duration === option.value && (
                              <Badge
                                variant="secondary"
                                className="bg-blue-100 text-blue-800"
                              >
                                Selected
                              </Badge>
                            )}
                          </div>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                  {errors.duration && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm"
                    >
                      {errors.duration}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="pt-4"
                >
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    <AnimatePresence mode="wait">
                      {isSubmitting ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Creating Auction...
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Sparkles className="w-5 h-5" />
                          Start Auction
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
        >
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-800">Real-Time</h3>
              <p className="text-sm text-slate-600">Live bidding updates</p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-800">Secure</h3>
              <p className="text-sm text-slate-600">Protected transactions</p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-800">Easy</h3>
              <p className="text-sm text-slate-600">Simple auction setup</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AuctionCreationPage;
