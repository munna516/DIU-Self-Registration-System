"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { TbFidgetSpinner } from "react-icons/tb";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

export function TeachersLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("teacherEmail");
    const password = formData.get("password");
    try {
      setIsLoading(true);
      const res = await signIn("credentials", {
        email,
        password,
        role: "teacher",
        redirect: false,
      });
      if (res.status === 401) {
        toast.error("Invalid credentials or email not verified");
      }
      if (res.status === 200) {
        toast.success("Login successful");
        router.push("/teacher/dashboard");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="teacherEmail">Teacher Email*</Label>
          <Input
            id="teacherEmail"
            name="teacherEmail"
            placeholder="Enter your teacher email"
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
          variant="teacher"
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
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/teacher/registration"
            className=" hover:underline text-green-600 font-bold text-lg"
          >
            Register
          </Link>
        </p>
        <p>
          <Link
            href="/"
            className="hover:underline text-green-500 font-semibold flex items-center justify-center gap-1 mt-3"
          >
            <span>
              <FaArrowLeft />
            </span>
            Back to Home
          </Link>
        </p>
      </CardFooter>
    </form>
  );
}
