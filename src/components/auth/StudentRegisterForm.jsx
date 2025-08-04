"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { TbFidgetSpinner } from "react-icons/tb";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const department = [
  {
    value: "Computer Science & Engineering",
    label: "Computer Science & Engineering",
  },
  {
    value: "Software Engineering",
    label: "Software Engineering",
  },
  {
    value: "Computing and Information System",
    label: "Computing and Information System",
  },
  {
    value: "Multimedia and Creative Technology",
    label: "Multimedia and Creative Technology",
  },
  {
    value: "Information Technology and Management",
    label: "Information Technology and Management",
  },
  {
    value: "Physical Education and Sports Science",
    label: "Physical Education and Sports Science",
  },
  {
    value: "Environmental Science and Disaster Management",
    label: "Environmental Science and Disaster Management",
  },
  {
    value: "Electrical & Electronic Engineering",
    label: "Electrical & Electronic Engineering",
  },
  {
    value: "Civil Engineering",
    label: "Civil Engineering",
  },
  {
    value: "Textile Engineering",
    label: "Textile Engineering",
  },
  {
    value: "Architecture",
    label: "Architecture",
  },
  {
    value: "Information and Communication Engineering",
    label: "Information and Communication Engineering",
  },
  {
    value: "Law",
    label: "Law",
  },
  {
    value: "English",
    label: "English",
  },
  {
    value: "Journalism and Mass Communication",
    label: "Journalism and Mass Communication",
  },
  {
    value: "Development Studies",
    label: "Development Studies",
  },
  {
    value: "Information Science and Library Management",
    label: "Information Science and Library Management",
  },
  {
    value: "Business Administration",
    label: "Business Administration",
  },
  {
    value: "Management",
    label: "Management",
  },
  {
    value: "Real Estate",
    label: "Real Estate",
  },
  {
    value: "Accounting",
    label: "Accounting",
  },
  {
    value: "Finance and Banking",
    label: "Finance and Banking",
  },
  {
    value: "Marketing",
    label: "Marketing",
  },
  {
    value: "Tourism and Hospitality Management",
    label: "Tourism and Hospitality Management",
  },
  {
    value: "Innovation and Entrepreneurship",
    label: "Innovation and Entrepreneurship",
  },
  {
    value: "Pharmacy",
    label: "Pharmacy",
  },
  {
    value: "Public Health",
    label: "Public Health",
  },
  {
    value: "Nutrition and Food Engineering",
    label: "Nutrition and Food Engineering",
  },

  {
    value: "Agricultural Science",
    label: "Agricultural Science",
  },
  {
    value: "Genetic Engineering and Biotechnology",
    label: "Genetic Engineering and Biotechnology",
  },
];

export function StudentRegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get("name");
    const email = formData.get("email");
    const studentId = formData.get("studentId");
    const department = formData.get("department");
    const password = formData.get("password");
    setError("");

    // email validation
    if (!email.includes("@diu.edu.bd")) {
      setError("Email must be a valid Diu email");
      return;
    }

    // Password  Length validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    // password Format validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "Password must contain one uppercase, lowercase letter & number"
      );
      return;
    }

    // Student ID validation
    const parts = studentId.split("-");
    if (parts.length !== 3) {
      setError("Student ID must be in the format of 201-15-0000");
      return;
    }

    // email and Id both validation
    const shortId = `${parts[1]}-${parts[2]}`;
    if (!email.includes(shortId)) {
      setError("Email or Student id is invalid.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/student/request-email", {
        method: "POST",
        body: JSON.stringify({ email, name, department, studentId, password }),
      });
      if (response.status === 400) {
        toast.error("Student already exists");
        return;
      }
      if (response.ok) {
        event.target.reset();
        router.push("/email-sent");
      } else {
        toast.error("Failed to send email");
      }
    } catch (error) {
      toast.error("Failed to send email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter your full name"
            type="text"
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            placeholder="Enter your email"
            type="email"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select required disabled={isLoading} name="department">
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {department.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="studentId">Student ID</Label>
          <Input
            id="studentId"
            name="studentId"
            placeholder="Enter your student ID"
            type="text"
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2 relative">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            placeholder="Create a password"
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
      {error && (
        <p className="text-red-500 text-sm text-center mb-3 font-semibold">
          {error}
        </p>
      )}
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
            "Create Account"
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/student/login"
            className="hover:underline text-blue-900 font-bold text-lg"
          >
            Login
          </Link>
        </p>
        <p>
          <Link
            href="/"
            className="hover:underline text-blue-900 font-semibold flex items-center justify-center gap-1 mt-3"
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
