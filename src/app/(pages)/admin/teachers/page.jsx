"use client";
import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

// Department mapping
const departmentMap = {
  CSE: "Computer Science & Engineering",
  SWE: "Software Engineering",
  CIS: "Computing and Information System",
  EEE: "Electrical & Electronic Engineering",
  CE: "Civil Engineering",
  TE: "Textile Engineering",
  ARC: "Architecture",
  ICE: "Information and Communication Engineering",
  LAW: "Law",
  ENG: "English",
  JMC: "Journalism and Mass Communication",
  BBA: "Business Administration",
  THM: "Tourism and Hospitality Management",
  IE: "Innovation and Entrepreneurship",
  PH: "Pharmacy",
  NFE: "Nutrition and Food Engineering",
  GEB: "Genetic Engineering and Biotechnology",
};

const departments = [
  "All Departments",
  ...Object.values(departmentMap),
];

export default function Teacher() {
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const res = await fetch("/api/admin/get-teacher");
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to fetch teachers");
      return json.data;
    },
  });

  const filteredTeachers = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const q = search.toLowerCase();
    return list.filter((teacher) => {
      const deptLabel = departmentMap[teacher.department] || teacher.department;
      const matchesDept =
        selectedDept === "All Departments" || deptLabel === selectedDept;
      const matchesSearch =
        teacher.name?.toLowerCase().includes(q) ||
        teacher.email?.toLowerCase().includes(q) ||
        teacher.teacherId?.toLowerCase().includes(q);
      return matchesDept && matchesSearch;
    });
  }, [data, search, selectedDept]);

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
                    Designation
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-6 text-gray-500 dark:text-gray-300"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-6 text-red-500"
                    >
                      Failed to load teachers
                    </td>
                  </tr>
                ) : filteredTeachers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-6 text-gray-500 dark:text-gray-300"
                    >
                      No teachers found.
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((teacher, idx) => (
                    <tr
                      key={teacher._id || teacher.teacherId}
                      className="hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                        {idx + 1}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                        {teacher.name}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                        {teacher.email}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                        {departmentMap[teacher.department] || teacher.department}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                        {teacher.phone}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                        {teacher.designation || "N/A"}
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
