"use client";
import { signOut } from "next-auth/react";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function Dashboard() {
  const router = useRouter();
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
    toast.success("Logged out successfully");
  };
  return (
    <div className="text-center mt-10">
      <h1>Teachers Dashboard</h1>
      <p>Welcome to the teachers dashboard</p>
      <Button onClick={() => handleLogout()}>Logout</Button>
    </div>
  );
}
