"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const department = "CSE";
const level = "Level-1-Term-1";
const courses = [
  {
    code: "CSE112",
    title: "Introduction To Computer Science",
    credit: 3,
    pre: [],
  },
  {
    code: "CSE113",
    title: "Programming Fundamentals",
    credit: 3,
    pre: [],
  },
  { code: "CSE114", title: "Data Structures", credit: 3, pre: [] },
  { code: "CSE115", title: "Algorithms", credit: 3, pre: ["CSE114"] },
  { code: "CSE116", title: "Database Systems", credit: 3, pre: [] },
];
const sections = ["A", "B", "C", "D"];
const retakeSections = ["Retake-A", "Retake-B"];

export default function EnrollCourse() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCredit, setShowCredit] = useState(false);
  const [showPrereq, setShowPrereq] = useState(false);
  const [prereqCourses, setPrereqCourses] = useState([]);
  const [prereqSection, setPrereqSection] = useState({}); // {code: section}
  const [selectedSection, setSelectedSection] = useState("");
  const [canEnroll, setCanEnroll] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]); // {code, title, credit, section}

  // Disable a course if any of its prerequisites are enrolled (after enrolling the prereq, main course disables)
  const disabledCourseCodes = courses
    .filter(
      (c) =>
        c.pre.length > 0 &&
        c.pre.some((preCode) =>
          enrolledCourses.some((ec) => ec.code === preCode)
        )
    )
    .map((c) => c.code);
  // Also disable already enrolled courses
  const fullyDisabledCodes = [
    ...new Set([
      ...disabledCourseCodes,
      ...enrolledCourses.map((ec) => ec.code),
    ]),
  ];

  const handleCourseChange = (value) => {
    const course = courses.find((c) => `${c.code} - ${c.title}` === value);
    setSelectedCourse(course);
    setShowCredit(!!course);
    setShowPrereq(false);
    setPrereqCourses([]);
    setCanEnroll(false);
    setSelectedSection("");
  };

  const handleCheckPrereq = () => {
    if (!selectedCourse) return;
    if (selectedCourse.pre.length > 0) {
      // If any prereq not enrolled, show them
      const missing = selectedCourse.pre.filter(
        (code) => !enrolledCourses.some((ec) => ec.code === code)
      );
      if (missing.length > 0) {
        setPrereqCourses(courses.filter((c) => missing.includes(c.code)));
        setShowPrereq(true);
        setCanEnroll(false);
        return;
      }
    }
    setPrereqCourses([]);
    setShowPrereq(false);
    setCanEnroll(true);
  };

  // Enroll a prerequisite course (Retake)
  const handleEnrollPrereq = (prereq) => {
    if (!prereqSection[prereq.code]) {
      alert("Please select a section for the prerequisite.");
      return;
    }
    setEnrolledCourses((prev) => [
      ...prev,
      {
        code: prereq.code,
        title: prereq.title,
        credit: prereq.credit,
        section: prereqSection[prereq.code],
      },
    ]);
    setShowPrereq(false);
    setPrereqCourses([]);
    setCanEnroll(false);
    setSelectedCourse(null);
    setShowCredit(false);
    setPrereqSection((prev) => {
      const copy = { ...prev };
      delete copy[prereq.code];
      return copy;
    });
    alert(
      `Enrolled in prerequisite: ${prereq.code} - ${prereq.title} (${
        prereqSection[prereq.code]
      })`
    );
  };

  // Enroll the main course
  const handleEnroll = () => {
    setEnrolledCourses((prev) => [
      ...prev,
      {
        code: selectedCourse.code,
        title: selectedCourse.title,
        credit: selectedCourse.credit,
        section: selectedSection,
      },
    ]);
    alert(
      `Enrolled in ${selectedCourse.code} - ${selectedCourse.title}, Section ${selectedSection}`
    );
    setSelectedCourse(null);
    setShowCredit(false);
    setShowPrereq(false);
    setPrereqCourses([]);
    setCanEnroll(false);
    setSelectedSection("");
  };

  return (
    <div className="">
      <Card className="p-6 dark:bg-slate-800">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold">Enroll Course</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 1st row: Department & Level */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="w-full sm:w-1/2">
              <Label className="text-sm font-semibold">Department</Label>
              <Input
                value={department}
                readOnly
                className="bg-gray-100 dark:bg-gray-700 font-semibold"
                label="Department"
              />
            </div>
            <div className="w-full sm:w-1/2">
              <Label className="text-sm font-semibold">Level</Label>
              <Input
                value={level}
                readOnly
                className="bg-gray-100 dark:bg-gray-700 font-semibold w-full"
                label="Level"
              />
            </div>
          </div>
          {/* 2nd row: Course Dropdown */}
          <div className="mb-4">
            <Label className="text-sm font-semibold">Select Your Course</Label>
            <Select
              value={
                selectedCourse
                  ? `${selectedCourse.code} - ${selectedCourse.title}`
                  : ""
              }
              onValueChange={handleCourseChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem
                    key={c.code}
                    value={`${c.code} - ${c.title}`}
                    disabled={fullyDisabledCodes.includes(c.code)}
                  >
                    {c.code} - {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* 3rd row: Credit (only if course selected) */}
          {showCredit && selectedCourse && (
            <div className="mb-4">
              <Label className="text-sm font-semibold">Credit</Label>
              <Input
                value={selectedCourse.credit}
                readOnly
                className="bg-gray-100 dark:bg-gray-700 font-semibold"
                label="Credit"
              />
            </div>
          )}
          {/* 4th row: Check Pre-Requisite Button */}
          {selectedCourse && (
            <div className="mb-4">
              <Button
                variant="diu"
                className="w-full"
                onClick={handleCheckPrereq}
              >
                Check Pre-Requisite
              </Button>
            </div>
          )}
          {/* Prerequisite Table */}
          {showPrereq && prereqCourses.length > 0 && (
            <div className="mb-4">
              <div className="text-red-600 font-semibold mb-2">
                Pre-Requisite(s) Required:
              </div>
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Course Code
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Course Title
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Section
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                    {prereqCourses.map((c) => (
                      <tr key={c.code}>
                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                          {c.code}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                          {c.title}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                          <Select
                            value={prereqSection[c.code] || ""}
                            onValueChange={(v) =>
                              setPrereqSection((prev) => ({
                                ...prev,
                                [c.code]: v,
                              }))
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Retake Section" />
                            </SelectTrigger>
                            <SelectContent>
                              {retakeSections.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                          <Button
                            variant="diu"
                            className="w-full"
                            onClick={() => handleEnrollPrereq(c)}
                          >
                            Enroll
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* Section Dropdown & Enroll Button */}
          {canEnroll && (
            <div className="flex flex-col sm:flex-row gap-4 items-center mt-4">
              <Select
                value={selectedSection}
                onValueChange={setSelectedSection}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="diu"
                className="w-full sm:w-auto"
                disabled={!selectedSection}
                onClick={handleEnroll}
              >
                Enroll Course
              </Button>
            </div>
          )}
          {/* Enrolled Courses Table */}
          {enrolledCourses.length > 0 && (
            <div className="mt-8">
              <div className="text-blue-700 font-semibold mb-2">
                Enrolled Courses:
              </div>
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Course Code
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Course Title
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Credit
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Section
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                    {enrolledCourses.map((c) => (
                      <tr key={c.code + c.section}>
                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                          {c.code}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                          {c.title}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                          {c.credit}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                          {c.section}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
