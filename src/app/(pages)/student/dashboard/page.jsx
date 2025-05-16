"use client";
import { useSession } from "next-auth/react";
import React from "react";

export default function Dashboard() {
  const session = useSession();
  return (
    <div className="text-center mt-10  space-y-4">
      <h1>This is Student Dashboard </h1>
    </div>
  );
}
