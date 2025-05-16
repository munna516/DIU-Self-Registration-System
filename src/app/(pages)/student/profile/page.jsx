"use client";
import { useSession } from "next-auth/react";
import React from "react";

export default function Profile() {
  const session = useSession();
  return (
    <div className="text-center mt-10">
      <h1> Student Profile</h1>
      <p>Name: {session?.data?.user?.name}</p>
      <p>Email: {session?.data?.user?.email}</p>
      <p>ID : {session?.data?.user?.studentId}</p>
      <p>Role: {session?.data?.user?.role}</p>
    </div>
  );
}
