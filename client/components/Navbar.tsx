"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Gavel,
  User,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Trophy,
  Menu,
  X,
  LogOut,
  Settings,
  CreditCard,
  Bell,
  ChevronDown,
} from "lucide-react";
import { useUserStore } from "@/store/user";

interface FormData {
  email: string;
  password: string;
  confirmPassword?: string;
  name?: string;
}

interface User {
  id: string;
  email: string;
  username: string;
  password?: string;
}

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
}

const Navbar = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user, isAuthenticated, setUser, clearUser } = useUserStore();

  const [loginData, setLoginData] = useState<FormData>({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
  });

  const navLinks = [
    { href: "/auction", label: "Auctions", icon: Gavel },
    { href: "/your-bids", label: "Your Bids", icon: Trophy, badge: "3" },
  ];

  const loginMutation = useMutation({
    mutationFn: (data: FormData) =>
      axios.post("http://localhost:3000/api/v1/auth/login", data),
    onSuccess: (res) => {
      console.log("Login Success:", res.data);
      localStorage.setItem("user-token", res.data.token);
      setUser({
        username: res.data.user.username,
        id: res.data.user.id,
        email: res.data.user.email,
      });
      setIsAuthModalOpen(false);
      setLoginData({ email: "", password: "" });
    },
    onError: (err) => {
      console.error("Login Error:", err);
    },
  });

  const handleLogin = () => {
    setIsLoading(true);
    console.log("Login data:", loginData);
    loginMutation.mutate(loginData, {
      onSettled: () => setIsLoading(false),
    });
  };

  const signupMutation = useMutation({
    mutationFn: (data: FormData) =>
      axios.post("http://localhost:3000/api/v1/auth/signup", {
        username: data.name,
        email: data.email,
        password: data.password,
      }),
    onSuccess: (res) => {
      console.log("Signup Success:", res.data);
      // Set user using Zustand store
      setUser({
        username: res.data.user.username,
        id: res.data.user.id,
        email: res.data.user.email,
      });
      setIsAuthModalOpen(false);
      setSignupData({ name: "", email: "", password: "", confirmPassword: "" });
    },
    onError: (err) => {
      console.error("Signup Error:", err);
    },
  });

  const handleSignup = () => {
    setIsLoading(true);
    console.log("Signup data:", signupData);
    signupMutation.mutate(signupData, {
      onSettled: () => setIsLoading(false),
    });
  };

  const handleLogout = () => {
    clearUser();
    setLoginData({ email: "", password: "" });
    setSignupData({ name: "", email: "", password: "", confirmPassword: "" });
    console.log("User logged out");
    // axios.post("http://localhost:3000/api/v1/auth/logout");
  };

  const getInitials = (username: string) => {
    return username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isLoginValid = loginData.email && loginData.password;
  const isSignupValid =
    signupData.name &&
    signupData.email &&
    signupData.password &&
    signupData.confirmPassword &&
    signupData.password === signupData.confirmPassword;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Gavel className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                  AuctionHub
                </h1>
                <p className="text-xs text-slate-500 -mt-1">
                  Real-time bidding
                </p>
              </div>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-all duration-200 relative group"
                >
                  <link.icon className="w-4 h-4" />
                  <span className="font-medium">{link.label}</span>
                  {link.badge && (
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5"
                    >
                      {link.badge}
                    </Badge>
                  )}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </motion.a>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated && user ? (
                // User Profile Dropdown
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-all duration-200 border border-slate-200"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="" alt={user.username} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                          {getInitials(user.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-medium text-slate-900">
                          {user.username}
                        </p>
                        <p className="text-xs text-slate-500 truncate max-w-32">
                          {user.email}
                        </p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 shadow-xl">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.username}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Billing</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Bell className="mr-2 h-4 w-4" />
                      <span>Notifications</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                // Sign In Modal
                <Dialog
                  open={isAuthModalOpen}
                  onOpenChange={setIsAuthModalOpen}
                >
                  <DialogTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        className="hidden sm:flex items-center space-x-2 border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Sign In</span>
                      </Button>
                    </motion.div>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-md border-0 shadow-2xl">
                    <Tabs defaultValue="login" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger
                          value="login"
                          className="flex items-center space-x-2"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>Login</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="signup"
                          className="flex items-center space-x-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Sign Up</span>
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="login" className="space-y-4">
                        <DialogHeader>
                          <DialogTitle className="text-center text-xl font-bold">
                            Welcome Back
                          </DialogTitle>
                          <DialogDescription className="text-center">
                            Sign in to your account to continue bidding
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="login-email"
                              className="flex items-center space-x-2"
                            >
                              <Mail className="w-4 h-4" />
                              <span>Email</span>
                            </Label>
                            <Input
                              id="login-email"
                              type="email"
                              placeholder="your@email.com"
                              value={loginData.email}
                              onChange={(e) =>
                                setLoginData((prev) => ({
                                  ...prev,
                                  email: e.target.value,
                                }))
                              }
                              className="h-11"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="login-password"
                              className="flex items-center space-x-2"
                            >
                              <Lock className="w-4 h-4" />
                              <span>Password</span>
                            </Label>
                            <div className="relative">
                              <Input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={loginData.password}
                                onChange={(e) =>
                                  setLoginData((prev) => ({
                                    ...prev,
                                    password: e.target.value,
                                  }))
                                }
                                className="h-11 pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                {showPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          <Button
                            onClick={handleLogin}
                            disabled={!isLoginValid || isLoading}
                            className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                          >
                            {isLoading ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Signing In...</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <LogIn className="w-4 h-4" />
                                <span>Sign In</span>
                              </div>
                            )}
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="signup" className="space-y-4">
                        <DialogHeader>
                          <DialogTitle className="text-center text-xl font-bold">
                            Create Account
                          </DialogTitle>
                          <DialogDescription className="text-center">
                            Join AuctionHub and start bidding today
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="signup-name"
                              className="flex items-center space-x-2"
                            >
                              <User className="w-4 h-4" />
                              <span>Full Name</span>
                            </Label>
                            <Input
                              id="signup-name"
                              placeholder="John Doe"
                              value={signupData.name}
                              onChange={(e) =>
                                setSignupData((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              className="h-11"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="signup-email"
                              className="flex items-center space-x-2"
                            >
                              <Mail className="w-4 h-4" />
                              <span>Email</span>
                            </Label>
                            <Input
                              id="signup-email"
                              type="email"
                              placeholder="your@email.com"
                              value={signupData.email}
                              onChange={(e) =>
                                setSignupData((prev) => ({
                                  ...prev,
                                  email: e.target.value,
                                }))
                              }
                              className="h-11"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="signup-password"
                              className="flex items-center space-x-2"
                            >
                              <Lock className="w-4 h-4" />
                              <span>Password</span>
                            </Label>
                            <div className="relative">
                              <Input
                                id="signup-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={signupData.password}
                                onChange={(e) =>
                                  setSignupData((prev) => ({
                                    ...prev,
                                    password: e.target.value,
                                  }))
                                }
                                className="h-11 pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                {showPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="signup-confirm"
                              className="flex items-center space-x-2"
                            >
                              <Lock className="w-4 h-4" />
                              <span>Confirm Password</span>
                            </Label>
                            <div className="relative">
                              <Input
                                id="signup-confirm"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={signupData.confirmPassword}
                                onChange={(e) =>
                                  setSignupData((prev) => ({
                                    ...prev,
                                    confirmPassword: e.target.value,
                                  }))
                                }
                                className="h-11 pr-10"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            {signupData.password &&
                              signupData.confirmPassword &&
                              signupData.password !==
                                signupData.confirmPassword && (
                                <p className="text-red-500 text-sm">
                                  Passwords don't match
                                </p>
                              )}
                          </div>

                          <Button
                            onClick={handleSignup}
                            disabled={!isSignupValid || isLoading}
                            className="w-full h-11 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50"
                          >
                            {isLoading ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Creating Account...</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <UserPlus className="w-4 h-4" />
                                <span>Create Account</span>
                              </div>
                            )}
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              )}

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/50"
            >
              <div className="px-4 py-4 space-y-2">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-100/80 transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <link.icon className="w-5 h-5" />
                      <span className="font-medium">{link.label}</span>
                    </div>
                    {link.badge && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800"
                      >
                        {link.badge}
                      </Badge>
                    )}
                  </motion.a>
                ))}

                <div className="pt-2 border-t border-slate-200">
                  {isAuthenticated && user ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-slate-50">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src="" alt={user.username} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                            {getInitials(user.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">
                            {user.username}
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        variant="outline"
                        className="w-full justify-start space-x-2 border-2 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log out</span>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full justify-start space-x-2 border-2"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;
