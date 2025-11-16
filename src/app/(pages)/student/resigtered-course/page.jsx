"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

const semesters = [
  "Fall 2026",
  "Summer 2026",
  "Spring 2026",
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
];

export default function RegisteredCourse() {
  const { data: session } = useSession();
  const [selectedSemester, setSelectedSemester] = useState(semesters[0]);
  const [searchSemester, setSearchSemester] = useState(null); // Track which semester to search for

  // Fetch registered courses for the selected semester (only when searchSemester is set)
  const { data: registeredCourses, isLoading, isError } = useQuery({
    queryKey: ["registered-courses", session?.user?.studentId, searchSemester],
    queryFn: async () => {
      const res = await fetch(
        `/api/student/registered-courses?studentId=${session?.user?.studentId}&semester=${searchSemester}`
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch registered courses");
      }
      return json.data || [];
    },
    enabled: !!searchSemester && !!session?.user?.studentId,
  });

  const handleSearch = () => {
    if (selectedSemester) {
      setSearchSemester(selectedSemester);
    }
  };

  const handleSemesterChange = (value) => {
    setSelectedSemester(value);
    setSearchSemester(null); // Reset search results when semester changes
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
              <Select value={selectedSemester} onValueChange={handleSemesterChange}>
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
            <Button
              variant="diu"
              className="w-full sm:w-auto"
              onClick={handleSearch}
              disabled={!selectedSemester}
            >
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

                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                {!searchSemester ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500 dark:text-gray-300">
                      Please select a semester and click Search to view registered courses.
                    </td>
                  </tr>
                ) : isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500 dark:text-gray-300">
                      Loading...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-red-500 dark:text-red-400">
                      Error loading courses. Please try again.
                    </td>
                  </tr>
                ) : !registeredCourses || registeredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500 dark:text-gray-300">
                      No courses found for this semester.
                    </td>
                  </tr>
                ) : (
                  registeredCourses.map((course, idx) => (
                    <tr key={course.code + course.section + idx}>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{idx + 1}</td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{course.code}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{course.title}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{course.credit}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{course.section}</td>

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
