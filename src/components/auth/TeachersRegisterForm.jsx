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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import toast from "react-hot-toast";

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

const designation = [
  {
    value: "Dean and Professor",
    label: "Dean and Professor",
  },
  {
    value: "Associate Dean",
    label: "Associate Dean",
  },
  {
    value: "Professor & Head",
    label: "Professor & Head",
  },
  {
    value: "Visiting Professor",
    label: "Visiting Professor",
  },

  {
    value: "Assistant Professor & Associate Head",
    label: "Assistant Professor & Associate Head",
  },
  {
    value: "Assistant Professor & Director",
    label: "Assistant Professor & Director",
  },
  {
    value: "Professor",
    label: "Professor",
  },
  {
    value: "Associate Professor",
    label: "Associate Professor",
  },
  {
    value: "Assistant Professor",
    label: "Assistant Professor",
  },
  {
    value: "Senior Lecturer",
    label: "Senior Lecturer",
  },
  {
    value: "Lecturer",
    label: "Lecturer",
  },
  {
    value: "Contructual Lecturer",
    label: "Contructual Lecturer",
  },
  {
    value: "Visiting Lecturer",
    label: "Visiting Lecturer",
  },
];

export function TeachersRegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const teacherId = formData.get("teacherId");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const designation = formData.get("designation");
    const department = formData.get("department");
    const password = formData.get("password");
    setError("");

    // email validation
    if (!email.includes("@diu.edu.bd")) {
      setError("Email must be a valid Diu email");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)) {
      setError(
        "Password must contain one uppercase, lowercase letter & number"
      );
    }
    try {
      setIsLoading(true);
      const response = await fetch("/api/teacher/request-email", {
        method: "POST",
        body: JSON.stringify({
          name,
          teacherId,
          email,
          phone,
          designation,
          department,
          password,
        }),
      });
      if (response.status === 400) {
        toast.error("Teacher already exists");
        return;
      }
      if (response.ok) {
        e.target.reset();
        router.push("/email-sent");
      } else {
        toast.error("Failed to register teacher");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-6  ">
        {/* First Row: Name and Teacher ID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Label htmlFor="teacherId">Teacher ID</Label>
            <Input
              id="teacherId"
              name="teacherId"
              placeholder="Enter your teacher ID"
              type="text"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Second Row: Email and Cell Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Label htmlFor="phone">Cell Phone</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="Enter your cell phone"
              type="tel"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Third Row: Cell Phone */}
        <div></div>
        {/* Third Row: Designation and Department */}

        <div className="space-y-2">
          <Label htmlFor="designation">Designation</Label>
          <Select required disabled={isLoading} name="designation">
            <SelectTrigger>
              <SelectValue placeholder="Select designation" />
            </SelectTrigger>
            <SelectContent>
              {designation.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

        {/* Fourth Row: Password */}
        <div className="space-y-2 relative">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
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
      {error && (
        <p className="text-red-500 text-sm text-center mb-3 font-semibold">
          {error}
        </p>
      )}
      <CardFooter className="flex flex-col space-y-4">
        <Button
          variant="teacher"
          className="w-full"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <TbFidgetSpinner className="w-4 h-4 animate-spin" />
          ) : (
            "Register"
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/teacher/login"
            className="font-bold text-green-600 hover:underline text-lg"
          >
            Login
          </Link>
        </p>
        <p>
          <Link
            href="/"
            className="hover:underline text-green-600 font-semibold flex items-center justify-center gap-1 "
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
