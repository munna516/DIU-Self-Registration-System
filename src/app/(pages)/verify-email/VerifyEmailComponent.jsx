// app/verify-email/VerifyEmailComponent.jsx

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailComponent() {
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState("verifying");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (!token) {
          setVerificationStatus("error");
          return;
        }
        const response = await fetch("/api/student/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setVerificationStatus("success");
          router.push("/student/login");
        } else {
          setVerificationStatus("error");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setVerificationStatus("error");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {verificationStatus === "verifying" && (
        <h1 className="text-2xl font-bold text-blue-500">
          Verifying your email...
        </h1>
      )}
      {verificationStatus === "success" && (
        <h1 className="text-2xl font-bold text-green-500">
          Your Email Is Now Verified!
        </h1>
      )}
      {verificationStatus === "error" && (
        <h1 className="text-2xl font-bold text-red-500">
          Verification failed. Please try again.
        </h1>
      )}
    </div>
  );
}
