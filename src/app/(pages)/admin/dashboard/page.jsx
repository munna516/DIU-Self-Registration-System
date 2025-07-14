"use client";
import { useSession } from "next-auth/react";
import React from "react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  console.log(session);
  return <div>AdminDashboard {session?.user?.email}</div>;
}
