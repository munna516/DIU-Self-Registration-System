"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const semesters = [
  "Fall 2025",
  "Summer 2025",
  "Spring 2025",
  "Fall 2024",
  "Summer 2024",
  "Spring 2024",
  "Fall 2023",
  "Summer 2023",
  "Spring 2023",
  "Fall 2022",
  "Summer 2022",
  "Spring 2022",
  "Fall 2021",
  "Summer 2021",
  "Spring 2021",
  "Fall 2020",
  "Summer 2020",
  "Spring 2020",
];

const registeredCourses = [
  {
    semester: "Summer 2025",
    code: "CSE101",
    title: "Introduction to Computer Science",
    credit: 3,
    section: "A",
    teacher: "Fatema Tuj Johora",
  },
  {
    semester: "Summer 2025",
    code: "CSE102",
    title: "Programming Fundamentals",
    credit: 3,
    section: "B",
    teacher: "Md Ashikur Rahman",
  },
  {
    semester: "Summer 2025",
    code: "CSE201",
    title: "Data Structures",
    credit: 3,
    section: "A",
    teacher: "Md Moniruzzaman",
  },
  {
    semester: "Summer 2025",
    code: "CSE202",
    title: "Algorithms",
    credit: 3,
    section: "B",
    teacher: "Dr. Fazlul Hoque",
  },
  {
    semester: "Summer 2025",
    code: "CSE301",
    title: "Database Systems",
    credit: 3,
    section: "A",
    teacher: "Md Soyeb Hossain",
  },
];

export default function RegisteredCourse() {
  const [selectedSemester, setSelectedSemester] = useState(semesters[0]);
  const [filtered, setFiltered] = useState([]);

  const handleSearch = () => {
    setFiltered(
      registeredCourses.filter((c) => c.semester === selectedSemester)
    );
  };

  return (
    <div className="">
      <Card className="p-4 dark:bg-gray-800">
        <CardHeader className="">
          <CardTitle className="text-xl font-bold">Registered Course</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="w-full sm:w-64">
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((sem) => (
                    <SelectItem key={sem} value={sem}>
                      {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="diu" className="w-full sm:w-auto" onClick={handleSearch}>
              Search
            </Button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 mt-3">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">SL</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">Course Code</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">Course Title</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">Credit</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">Section</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">Teacher</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500 dark:text-gray-300">
                      No courses found for this semester.
                    </td>
                  </tr>
                ) : (
                  filtered.map((course, idx) => (
                    <tr key={course.code + course.section}>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{idx + 1}</td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{course.code}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{course.title}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{course.credit}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{course.section}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{course.teacher}</td>
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
