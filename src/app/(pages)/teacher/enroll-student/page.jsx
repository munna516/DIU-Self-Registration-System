"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export default function EnrollStudent() {
    const [studentId, setStudentId] = useState("");
    const [searchStudentId, setSearchStudentId] = useState("");
    const queryClient = useQueryClient();

    // Fetch student courses
    const { data: studentData, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["teacher-student-courses", searchStudentId],
        queryFn: async () => {
            const res = await fetch(
                `/api/teacher/student-courses?studentId=${searchStudentId}`
            );
            const json = await res.json();
            if (!res.ok || !json.success) {
                // Preserve the error message for display
                const error = new Error(json.message || "Failed to fetch student courses");
                error.status = res.status;
                throw error;
            }
            return json.data;
        },
        enabled: !!searchStudentId,
    });

    // Retake course mutation
    const retakeMutation = useMutation({
        mutationFn: async (courseId) => {
            const res = await fetch("/api/teacher/enroll-retake", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: searchStudentId,
                    courseId,
                }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.message || "Failed to enroll retake course");
            }
            return json;
        },
        onSuccess: (data) => {
            toast.success(
                `Successfully added ${data.data.courseCode} as retake course`
            );
            // Refetch student courses
            queryClient.invalidateQueries({
                queryKey: ["teacher-student-courses", searchStudentId],
            });
            refetch();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to add retake course");
        },
    });

    const handleSearch = () => {
        if (!studentId.trim()) {
            toast.error("Please enter a student ID");
            return;
        }
        setSearchStudentId(studentId.trim());
    };

    const handleRetake = (courseId) => {
        Swal.fire({
            title: "Add Retake Course?",
            text: "Are you sure you want to add this course as a retake for the current semester?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, add it",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#16a34a", // green-600 (teacher button color)
            cancelButtonColor: "#dc2626", // red-600
        }).then((result) => {
            if (result.isConfirmed) {
                retakeMutation.mutate(courseId);
            }
        });
    };

    // Check if course is already in current semester
    const isCourseInCurrentSemester = (courseId) => {
        if (!studentData?.currentSemesterCourses) return false;
        return studentData.currentSemesterCourses.some(
            (c) => c._id === courseId
        );
    };

    // Combine all courses for display
    const allCourses = [
        ...(studentData?.currentSemesterCourses || []),
        ...(studentData?.previousSemesterCourses || []),
    ];

    return (
        <div className="mb-20">
            <Card className="dark:bg-slate-800">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Enroll Student</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Search Section */}
                    <div className="mb-6">
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Enter Student ID"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        handleSearch();
                                    }
                                }}
                                className="flex-1"
                            />
                            <Button
                                onClick={handleSearch}
                                variant="teacher"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Search className="w-4 h-4 mr-2" />
                                )}
                                Search
                            </Button>
                        </div>
                    </div>

                    {/* Student Info */}
                    {studentData && (
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">Student Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Name:
                                    </span>
                                    <p className="font-medium">{studentData.student.name}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Student ID:
                                    </span>
                                    <p className="font-medium">{studentData.student.studentId}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Department:
                                    </span>
                                    <p className="font-medium">{studentData.student.department}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {isError && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg">
                            <div className="flex items-center gap-2">
                                <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
                                <p className="text-red-600 dark:text-red-400 font-semibold text-lg">
                                    {error?.message?.includes("Student not found") ||
                                        error?.status === 404 ||
                                        error?.message === "Student not found"
                                        ? "Student not found"
                                        : error?.message || "Failed to load student courses. Please check the student ID and try again."}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="text-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Loading student courses...
                            </p>
                        </div>
                    )}

                    {/* Courses Table */}
                    {studentData && allCourses.length > 0 && (
                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                                            SL
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                                            Course Code
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                                            Course Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                                            Semester
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                                    {allCourses.map((course, idx) => {
                                        const isCurrentSemester = course.semester === studentData.currentSemester;
                                        const alreadyInCurrent = isCourseInCurrentSemester(course._id);
                                        const canRetake = !isCurrentSemester && !alreadyInCurrent;

                                        return (
                                            <tr
                                                key={`${course._id}-${course.semester}`}
                                                className="hover:bg-gray-50 dark:hover:bg-slate-700"
                                            >
                                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                                    {course.courseCode}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                                                    {course.courseTitle}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs font-medium ${isCurrentSemester
                                                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                            }`}
                                                    >
                                                        {course.semester}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs font-medium ${course.status === "completed"
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                            : course.status === "failed"
                                                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                            }`}
                                                    >
                                                        {course.status || "enrolled"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                                                    {canRetake ? (
                                                        <Button
                                                            onClick={() => handleRetake(course._id)}
                                                            variant="teacher"
                                                            size="sm"
                                                            disabled={retakeMutation.isPending}
                                                        >
                                                            {retakeMutation.isPending ? (
                                                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                            ) : null}
                                                            Retake
                                                        </Button>
                                                    ) : alreadyInCurrent ? (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            Already in current semester
                                                        </span>
                                                    ) : isCurrentSemester ? (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            Current semester
                                                        </span>
                                                    ) : null}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* No Courses Found */}
                    {studentData && allCourses.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-600 dark:text-gray-400">
                                No courses found for this student.
                            </p>
                        </div>
                    )}

                    {/* No Search Yet */}
                    {!studentData && !isLoading && !isError && (
                        <div className="text-center py-8">
                            <p className="text-gray-600 dark:text-gray-400">
                                Enter a student ID and click Search to view their courses.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
