import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export default function EmailSent() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="text-2xl font-bold text-green-500">
          Your Registration is Successfully Submitted
        </div>
        <div className="text-base text-gray-500">
          Please check your email for{" "}
          <span className="text-green-500 font-bold">verification</span>
        </div>
        <div className="text-sm text-gray-500">
          If you don't receive an email, please check your spam folder
        </div>
        <div className="text-sm text-gray-500">
          If you still don't receive an email, please contact us
        </div>
        <div className="text-sm text-gray-500">Email: support@diu.edu.bd</div>

        <div className="flex gap-2 mt-4">
          <Link href="/student/login">
            <Button variant="diu">Student Login</Button>
          </Link>
          <Link href="/teacher/login">
            <Button variant="diu">Teacher Login</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
