"use client";

import { Input } from "@/components/ui/input";
import diulogo from "../../../../../public/assets/logos/diulogos.png";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { TbFidgetSpinner } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;
    try {
      const res = await signIn("credentials", {
        email,
        password,
        role: "admin",
        redirect: false,
      });
      if (res.status === 401) {
        toast.error("Invalid credentials");
      }
      if (res.status === 200) {
        toast.success("Login successful");
        router.push("/admin/dashboard");
      }
    } catch (error) {
      
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4">
      <div className="flex  items-center justify-center">
        <Image src={diulogo} alt="Diu Logo" width={250} height={150} />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-blue-900">
            ADMIN Login
          </CardTitle>
          <CardDescription className="text-center"></CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email*</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  type="email"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2 relative">
                <Label htmlFor="password">Password*</Label>
                <Input
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-4 w-4" />
                  ) : (
                    <FaEye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                variant="diu"
                className="w-full"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <TbFidgetSpinner className="w-4 h-4 animate-spin" />
                ) : (
                  "Login"
                )}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
