"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { TbFidgetSpinner } from "react-icons/tb";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export function StudentLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    // Add your login logic here
    // For now, we'll just simulate a delay
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 1000);
  }

  return (
    <form onSubmit={onSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="studentId">Student ID*</Label>
          <Input
            id="studentId"
            placeholder="Enter your student ID"
            type="text"
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2 relative">
          <Label htmlFor="password">Password*</Label>
          <Input
            id="password"
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
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/student/registration"
            className=" hover:underline text-blue-900 font-bold"
          >
            Register here
          </Link>
        </p>
      </CardFooter>
    </form>
  );
}
