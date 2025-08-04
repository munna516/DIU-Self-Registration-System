"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// Sample departments
const departments = [
  "All Departments",
  "Computer Science & Engineering",
  "Software Engineering",
  "Computing and Information System",
  "Multimedia and Creative Technology",
  "Information Technology and Management",
  "Physical Education and Sports Science",
  "Environmental Science and Disaster Management",
  "Electrical & Electronic Engineering",
  "Civil Engineering",
  "Textile Engineering",
  "Architecture",
  "Information and Communication Engineering",
  "Law",
  "English",
  "Journalism and Mass Communication",
  "Development Studies",
  "Information Science and Library Management",
  "Business Administration",
  "Management",
  "Real Estate",
  "Accounting",
  "Finance and Banking",
  "Marketing",
  "Tourism and Hospitality Management",
  "Innovation and Entrepreneurship",
  "Pharmacy",
  "Public Health",
  "Nutrition and Food Engineering",
  "Agricultural Science",
  "Genetic Engineering and Biotechnology",
];

// Sample teachers data
const teachersData = [
  {
    id: 1,
    name: "Fateme Tuj Johora",
    email: "fateme@diu.edu.bd",
    department: "Computer Science & Engineering",
    phone: "01711-111111",
    room: "A-201",
  },
  {
    id: 2,
    name: "Monir Hossain",
    email: "monir@diu.edu.bd",
    department: "Software Engineering",
    phone: "01712-222222",
    room: "A-202",
  },
  {
    id: 3,
    name: "Asaduzzaman",
    email: "asad@diu.edu.bd",
    department: "Computing and Information System",
    phone: "01713-333333",
    room: "B-101",
  },
  {
    id: 4,
    name: "Sarah Johnson",
    email: "sarah@diu.edu.bd",
    department: "Multimedia and Creative Technology",
    phone: "01714-444444",
    room: "C-301",
  },
  {
    id: 5,
    name: "Michael Brown",
    email: "michael@diu.edu.bd",
    department: "Information Technology and Management",
    phone: "01715-555555",
    room: "D-105",
  },
];

export default function Teacher() {
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [search, setSearch] = useState("");

  // Filter teachers by department and search
  const filteredTeachers = teachersData.filter((teacher) => {
    const matchesDept =
      selectedDept === "All Departments" || teacher.department === selectedDept;
    const matchesSearch =
      teacher.name.toLowerCase().includes(search.toLowerCase()) ||
      teacher.email.toLowerCase().includes(search.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="">
      <Card className="dark:bg-slate-800">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-2xl font-bold text-left text-blue-500">
              Teachers
            </CardTitle>
            <div className="flex flex-1 gap-4 items-center justify-between">
              <div className="flex-1 flex justify-center">
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-xs"
                />
              </div>
              <div className="min-w-[180px]">
              
                <Select value={selectedDept} onValueChange={setSelectedDept}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto mt-4">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
              <thead>
                <tr className="bg-gray-100 dark:bg-slate-700">
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    SL
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Name
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Email
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Department
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Phone
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Room
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-500">
                      No teachers found.
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((teacher, idx) => (
                    <tr
                      key={teacher.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <td className="border border-gray-300 px-4 py-2">
                        {idx + 1}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {teacher.name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {teacher.email}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {teacher.department}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {teacher.phone}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {teacher.room}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
