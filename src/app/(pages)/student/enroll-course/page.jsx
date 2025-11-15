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
import { useSession } from "next-auth/react";
import { getStudentTerm } from "@/utils/studentTerm";

const courses = [
  {
    code: "CSE112",
    title: "Introduction To Computer Science",
    credit: 3,
    pre: [],
    isLab: false,
  },
  {
    code: "CSE113",
    title: "Programming Fundamentals",
    credit: 3,
    pre: [],
    isLab: false,
  },
  { code: "CSE114", title: "Data Structures", credit: 3, pre: [], isLab: false },
  { code: "CSE115", title: "Algorithms", credit: 3, pre: ["CSE114"], isLab: false },
  { code: "CSE116", title: "Database Systems", credit: 3, pre: [], isLab: false },
  { code: "CSE112L", title: "Introduction To Computer Science Lab", credit: 1, pre: [], isLab: true },
  { code: "CSE113L", title: "Programming Fundamentals Lab", credit: 1, pre: [], isLab: true },
];
const sections = ["A", "B", "C", "D"];
const labSubsections = ["1", "2"]; // For A1, A2, etc.
const retakeSections = ["Retake-A", "Retake-B"];

export default function EnrollCourse() {
  const { data: session } = useSession();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSection, setSelectedSection] = useState(""); // Section for regular courses
  const [selectedLabSubsection, setSelectedLabSubsection] = useState(""); // Subsection for lab courses
  const [pendingCourses, setPendingCourses] = useState([]); // {code, title, credit, section, isLab, isPrereq}
  const [enrolledCourses, setEnrolledCourses] = useState([]); // {code, title, credit, section}
  const [commonSection, setCommonSection] = useState(""); // Common section for all regular courses
  const [isEnrolled, setIsEnrolled] = useState(false); // Track if enrollment is complete

  // Disable already enrolled courses and courses already in pending list (for dropdown)
  const fullyDisabledCodes = [
    ...new Set([
      ...enrolledCourses.map((ec) => ec.code),
      ...pendingCourses.map((pc) => pc.code),
    ]),
  ];

  // Disable courses that have prerequisites that are not enrolled
  const coursesWithUnmetPrereqs = courses
    .filter((course) => {
      if (course.pre.length === 0) return false;
      return course.pre.some((preCode) => {
        const isEnrolled = enrolledCourses.some((ec) => ec.code === preCode);
        return !isEnrolled;
      });
    })
    .map((c) => c.code);

  const allDisabledCodes = [
    ...new Set([...fullyDisabledCodes, ...coursesWithUnmetPrereqs]),
  ];

  // Calculate available courses (courses that can be enrolled)
  // Exclude courses with prerequisites - students should not add prerequisite courses
  // IMPORTANT: Only exclude enrolled courses, NOT pending courses (pending courses should be counted)
  const availableCourses = courses.filter(
    (course) => {
      const isEnrolled = enrolledCourses.some((ec) => ec.code === course.code);
      const hasUnmetPrereq = coursesWithUnmetPrereqs.includes(course.code);
      return !isEnrolled && !hasUnmetPrereq && course.pre.length === 0; // Only courses without prerequisites
    }
  );

  // Check if all available courses are in pending list
  const allCoursesAdded = availableCourses.length > 0 &&
    availableCourses.every((course) =>
      pendingCourses.some((pc) => pc.code === course.code)
    );

  // Debug logging
  console.log("Available courses (no prerequisites):", availableCourses.map(c => c.code));
  console.log("Pending courses:", pendingCourses.map(pc => pc.code));
  console.log("All courses added:", allCoursesAdded);

  const handleCourseChange = (value) => {
    const course = courses.find((c) => `${c.code} - ${c.title}` === value);
    setSelectedCourse(course);
    setSelectedSection("");
    setSelectedLabSubsection("");
  };

  // Add course to pending list
  const handleAddCourse = () => {
    if (!selectedCourse) {
      alert("Please select a course first.");
      return;
    }

    // Check if course is already in pending list
    if (pendingCourses.some((pc) => pc.code === selectedCourse.code)) {
      alert("This course is already in your pending list.");
      return;
    }

    // Validate section selection
    if (selectedCourse.isLab) {
      // For lab courses, need both section and subsection
      if (!selectedSection || !selectedLabSubsection) {
        alert("Please select both section and subsection for lab course.");
        return;
      }

      // If regular courses are already added, lab must use the same base section
      if (commonSection && selectedSection !== commonSection) {
        alert(`Lab courses must be in subsections of section ${commonSection}. Please select section ${commonSection}.`);
        return;
      }

      // If this is the first course (lab course), set common section
      if (!commonSection && pendingCourses.length === 0) {
        setCommonSection(selectedSection);
      }
    } else {
      // For regular courses, need section
      if (!selectedSection) {
        alert("Please select a section for the course.");
        return;
      }

      // Check if this is the first regular course or if section matches common section
      const regularCourses = pendingCourses.filter((pc) => !pc.isLab && !pc.isPrereq);

      // If commonSection is already set (from lab courses or previous regular courses), must match it
      if (commonSection) {
        if (selectedSection !== commonSection) {
          alert(`All courses must be in the same section. Please select section ${commonSection}.`);
          return;
        }
      } else if (regularCourses.length > 0) {
        // Check if section matches existing regular courses (extract base section for comparison)
        const firstRegularSection = regularCourses[0].section.charAt(0); // Get first character (A, B, C, D)
        if (selectedSection !== firstRegularSection) {
          alert(`All regular courses must be in the same section. Please select section ${firstRegularSection}.`);
          return;
        }
        // Set common section if not already set
        setCommonSection(selectedSection);
      } else {
        // First regular course - set common section
        setCommonSection(selectedSection);
      }
    }

    // Build section string
    let finalSection = selectedSection;
    if (selectedCourse.isLab) {
      finalSection = `${selectedSection}${selectedLabSubsection}`; // e.g., A1, A2
    }

    // Add to pending courses
    setPendingCourses((prev) => [
      ...prev,
      {
        code: selectedCourse.code,
        title: selectedCourse.title,
        credit: selectedCourse.credit,
        section: finalSection,
        isLab: selectedCourse.isLab || false,
        isPrereq: false,
      },
    ]);

    // Reset selection
    setSelectedCourse(null);
    setSelectedSection("");
    setSelectedLabSubsection("");
  };

  // Remove course from pending list
  const handleRemovePendingCourse = (courseCode) => {
    const courseToRemove = pendingCourses.find((pc) => pc.code === courseCode);
    const updatedPending = pendingCourses.filter((pc) => pc.code !== courseCode);
    setPendingCourses(updatedPending);

    // Check if there are any courses left
    if (updatedPending.length === 0) {
      // No courses left, reset common section
      setCommonSection("");
    } else {
      // If removing a regular course, update common section if needed
      if (courseToRemove && !courseToRemove.isLab && !courseToRemove.isPrereq) {
        const remainingRegular = updatedPending.filter(
          (pc) => !pc.isLab && !pc.isPrereq
        );
        if (remainingRegular.length > 0) {
          // Extract base section (first character) for regular courses
          const baseSection = remainingRegular[0].section.charAt(0);
          setCommonSection(baseSection);
        } else {
          // No regular courses left, but lab courses might still exist
          // Keep common section as is (lab courses are subsections of it)
          const remainingLab = updatedPending.filter((pc) => pc.isLab);
          if (remainingLab.length === 0) {
            // No courses at all, reset (shouldn't happen due to check above, but just in case)
            setCommonSection("");
          }
          // If lab courses exist, keep commonSection as they are subsections of it
        }
      }
    }
  };


  // Enroll all courses
  const handleEnrollAll = () => {
    if (pendingCourses.length === 0) {
      alert("No courses to enroll.");
      return;
    }

    // Check if all courses have sections
    const coursesWithoutSection = pendingCourses.filter(
      (pc) => !pc.section
    );
    if (coursesWithoutSection.length > 0) {
      alert("All courses must have sections selected.");
      return;
    }

    // Enroll all pending courses (they already have sections assigned)
    const coursesToEnroll = pendingCourses.map((pc) => ({
      code: pc.code,
      title: pc.title,
      credit: pc.credit,
      section: pc.section,
    }));

    console.log("Enrolling courses:", coursesToEnroll);
    console.log("Total courses to enroll:", coursesToEnroll.length);

    // Use functional update to ensure we get the latest state
    setEnrolledCourses((prev) => {
      const updated = [...prev, ...coursesToEnroll];
      console.log("Updated enrolled courses:", updated);
      return updated;
    });

    // Clear pending courses and reset
    setPendingCourses([]);
    setSelectedSection("");
    setSelectedLabSubsection("");
    setCommonSection("");
    setIsEnrolled(true); // Mark enrollment as complete

    alert(`Successfully enrolled in ${coursesToEnroll.length} course(s)!`);
  };

  return (
    <div className="">
      <Card className="p-6 dark:bg-slate-800">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold">Enroll Course</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Show course selection only if not enrolled */}
          {!isEnrolled && (
            <>
              {/* 1st row: Department & Level */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="w-full sm:w-1/2">
                  <Label className="text-sm font-semibold">Department</Label>
                  <Input
                    value={session?.user?.department ? session?.user?.department : ""}
                    readOnly
                    className="bg-gray-100 dark:bg-gray-700 font-semibold"
                    label="Department"
                  />
                </div>
                <div className="w-full sm:w-1/2">
                  <Label className="text-sm font-semibold">Level</Label>
                  <Input
                    value={
                      session?.user?.studentId
                        ? "Level-" + getStudentTerm(session?.user?.studentId).split("L")[1].split("T")[0] + "   Term-" + getStudentTerm(session?.user?.studentId).split("T")[1]
                        : ""
                    }
                    readOnly
                    className="bg-gray-100 dark:bg-gray-700 font-semibold w-full"
                    label="Level"
                  />
                </div>
              </div>
              {/* 2nd row: Course Dropdown, Section Selection and Add Button */}
              <div className="mb-4">
                <Label className="text-sm font-semibold">Select Your Course</Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
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
                            disabled={allDisabledCodes.includes(c.code)}
                          >
                            {c.code} - {c.title}
                            {coursesWithUnmetPrereqs.includes(c.code) && " (Prerequisites Required)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Section Selection */}
                  {selectedCourse && (
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label className="text-sm font-semibold">
                          Select Section {
                            commonSection
                              ? (selectedCourse.isLab
                                ? `(Must be ${commonSection} for lab subsections)`
                                : `(Must be ${commonSection})`)
                              : ""
                          }
                        </Label>
                        <Select
                          value={selectedSection}
                          onValueChange={(value) => {
                            setSelectedSection(value);
                            if (selectedCourse.isLab) {
                              setSelectedLabSubsection(""); // Reset subsection when section changes
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Section" />
                          </SelectTrigger>
                          <SelectContent>
                            {sections.map((s) => (
                              <SelectItem
                                key={s}
                                value={s}
                                disabled={commonSection && s !== commonSection}
                              >
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Lab Subsection Selection */}
                      {selectedCourse.isLab && selectedSection && (
                        <div className="flex-1">
                          <Label className="text-sm font-semibold">Select Subsection</Label>
                          <Select
                            value={selectedLabSubsection}
                            onValueChange={setSelectedLabSubsection}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Subsection" />
                            </SelectTrigger>
                            <SelectContent>
                              {labSubsections.map((sub) => (
                                <SelectItem key={sub} value={sub}>
                                  {selectedSection}{sub}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="flex items-end">
                        <Button
                          variant="diu"
                          onClick={handleAddCourse}
                          disabled={!selectedCourse || !selectedSection || (selectedCourse.isLab && !selectedLabSubsection)}
                          className="whitespace-nowrap"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pending Courses Table */}
              {pendingCourses.length > 0 && (
                <div className="mb-4">
                  <div className="text-green-700 dark:text-green-400 font-semibold mb-2">
                    Pending Courses ({pendingCourses.length}):
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
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                            Type
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                        {pendingCourses.map((c) => (
                          <tr key={c.code}>
                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                              {c.code}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                              {c.title}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                              {c.credit}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 font-semibold">
                              {c.section || "Not Selected"}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                              {c.isPrereq ? (
                                <span className="text-orange-600 dark:text-orange-400">
                                  Prerequisite (Retake)
                                </span>
                              ) : c.isLab ? (
                                <span className="text-purple-600 dark:text-purple-400">
                                  Lab
                                </span>
                              ) : (
                                <span className="text-blue-600 dark:text-blue-400">
                                  Regular
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemovePendingCourse(c.code)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Remove
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Enroll Button - Only enable when all available courses (without prerequisites) are added */}
              {pendingCourses.length > 0 && !isEnrolled && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-green-700 dark:text-green-400 font-semibold mb-3">
                    {allCoursesAdded
                      ? `All ${availableCourses.length} available course(s) added. Ready to enroll!`
                      : availableCourses.length > 0
                        ? `Added ${pendingCourses.length} of ${availableCourses.length} available course(s). Please add all courses (without prerequisites) before enrolling.`
                        : "No courses available to enroll."}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="diu"
                      className="whitespace-nowrap"
                      onClick={handleEnrollAll}
                      disabled={!allCoursesAdded || availableCourses.length === 0}
                    >
                      Enroll All Courses ({pendingCourses.length})
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Enrolled Courses Table */}
          {isEnrolled && enrolledCourses.length > 0 && (
            <div className="mt-8">
              <div className="text-blue-700 dark:text-blue-400 font-semibold mb-2">
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
