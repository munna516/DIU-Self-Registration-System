import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import diulogos from "../../public/assets/logos/diulogos.png";
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with Logo and Greeting */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Image
              src={diulogos}
              alt="DIU Logo"
              width={250}
              height={150}
              className=""
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-blue-900">DIU Self Registration System</span>
          </h1>
          <p className="text-xl text-gray-600">
            Your gateway to academic excellence
          </p>
        </div>

        {/* Description Section */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-lg text-gray-700 leading-relaxed">
            The DIU Course Registration System is designed to streamline the
            course registration process for both students and teachers. With our
            user-friendly interface, you can easily manage your courses, track
            your academic progress, and stay connected with your educational
            journey.
          </p>
        </div>

        {/* Login Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-md mx-auto">
          <Link href="/student/login" className="w-full sm:w-auto">
            <Button
              variant="diu"
              className="w-full h-14 text-lg transition-colors"
              size="lg"
            >
              Login as Student
            </Button>
          </Link>
          <Link href="/teacher/login" className="w-full sm:w-auto">
            <Button
              variant="teacher"
              className="w-full h-14 text-lg transition-colors"
              size="lg"
            >
              Login as Teacher
            </Button>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center text-gray-600">
          <p className="text-sm">
            Need help? Contact the IT Support at support@diu.edu.bd
          </p>
        </div>
      </div>
    </div>
  );
}
