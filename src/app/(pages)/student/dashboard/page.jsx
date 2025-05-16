"use client";
import { signOut, useSession } from "next-auth/react";
import React from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function Dashboard() {
  const session = useSession();

  console.log(session);
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
    toast.success("Logged out successfully");
  };
  return (
    <div className="text-center mt-10">
      <h1>Student Dashboard {session?.data?.user?.name}</h1>
      <p>Welcome to the student dashboard</p>
      <Button onClick={() => handleLogout()}>Logout</Button>
    </div>
  );
}
