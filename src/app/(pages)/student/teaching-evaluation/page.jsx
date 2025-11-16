"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function TeachingEvaluation() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [selectedSemester, setSelectedSemester] = useState("");
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [evaluationData, setEvaluationData] = useState({});

  // Fetch evaluation status to check if evaluation is enabled
  const { data: evaluationStatus, isLoading: isLoadingEvaluationStatus } = useQuery({
    queryKey: ["evaluation-status"],
    queryFn: async () => {
      const res = await fetch("/api/student/evaluation-status");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch evaluation status");
      }
      return json.data;
    },
  });

  const isEvaluationEnabled = evaluationStatus?.evalutionIsOpen || false;

  // Fetch previous semester
  const { data: previousSemesterData, isLoading: isLoadingPreviousSemester } = useQuery({
    queryKey: ["previous-semester"],
    queryFn: async () => {
      const res = await fetch("/api/student/previous-semester");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch previous semester");
      }
      return json.data;
    },
  });

  // Set the previous semester as selected when it's loaded
  useEffect(() => {
    if (previousSemesterData?.previousSemester) {
      setSelectedSemester(previousSemesterData.previousSemester);
    }
  }, [previousSemesterData]);

  // Fetch courses for the selected semester
  const { data: coursesData, isLoading: isLoadingCourses, refetch: refetchCourses } = useQuery({
    queryKey: ["evaluation-courses", session?.user?.studentId, selectedSemester],
    queryFn: async () => {
      const res = await fetch(
        `/api/student/evaluation-courses?studentId=${session?.user?.studentId}&semester=${selectedSemester}`
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch courses");
      }
      return json.data || [];
    },
    enabled: !!selectedSemester && !!session?.user?.studentId && isEvaluationEnabled,
  });

  // Update courses when data is fetched
  useEffect(() => {
    if (coursesData) {
      setCourses(coursesData);
    }
  }, [coursesData]);

  // Mutation for submitting evaluation
  const submitEvaluationMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await fetch("/api/student/submit-evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to submit evaluation");
      }
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluation-courses"] });
      toast.success("Evaluation submitted successfully!");
      setShowForm(false);
      setSelectedCourse(null);
      setEvaluationData({});
      refetchCourses();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit evaluation");
    },
  });

  const handleSearch = () => {
    if (selectedSemester) {
      refetchCourses();
    }
  };

  const handleNotSubmittedClick = (course) => {
    setSelectedCourse(course);
    setShowForm(true);
    setEvaluationData({});
  };

  const handleEvaluationChange = (questionNumber, value) => {
    setEvaluationData((prev) => ({
      ...prev,
      [questionNumber]: value,
    }));
  };

  const handleSubmit = () => {
    // Validate that all questions are answered
    const evaluationQuestions = [
      "The teacher gave a detailed course outline with the names of the required textbooks and reference materials.",
      "The teacher maintained proper class schedule and was punctual.",
      "The teacher used practical examples to explain theoretical concepts.",
      "The teacher encouraged class discussions and student participation.",
      "The teacher provided constructive feedback on assignments and exams.",
      "The teacher evaluated assignments and exams fairly and promptly.",
      "The teacher communicated clearly and was easily understandable.",
      "The teacher covered the syllabus comprehensively.",
      "The teacher was impartial and treated all students equally.",
      "The teacher was available for consultation and was friendly.",
    ];

    const answers = [];
    let allAnswered = true;

    for (let i = 1; i <= evaluationQuestions.length; i++) {
      if (!evaluationData[i]) {
        allAnswered = false;
        toast.error(`Please answer question ${i}`);
        return;
      }
      answers.push({
        questionText: evaluationQuestions[i - 1],
        rating: evaluationData[i],
      });
    }

    if (!allAnswered) {
      return;
    }

    // Submit evaluation
    submitEvaluationMutation.mutate({
      studentId: session?.user?.studentId,
      semester: selectedSemester,
      courseId: selectedCourse.courseId,
      sectionId: selectedCourse.sectionId,
      answers: answers,
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedCourse(null);
    setEvaluationData({});
  };

  const evaluationQuestions = [
    "The teacher gave a detailed course outline with the names of the required textbooks and reference materials.",
    "The teacher maintained proper class schedule and was punctual.",
    "The teacher used practical examples to explain theoretical concepts.",
    "The teacher encouraged class discussions and student participation.",
    "The teacher provided constructive feedback on assignments and exams.",
    "The teacher evaluated assignments and exams fairly and promptly.",
    "The teacher communicated clearly and was easily understandable.",
    "The teacher covered the syllabus comprehensively.",
    "The teacher was impartial and treated all students equally.",
    "The teacher was available for consultation and was friendly.",
  ];

  const ratingOptions = [
    "Below Average",
    "Average",
    "Good",
    "Very Good",
    "Excellent",
  ];

  return (
    <div className="">
      <Card className=" dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Teaching Evaluation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingEvaluationStatus || isLoadingPreviousSemester ? (
            <div className="text-center py-8">
              <div className="text-lg font-semibold text-blue-600 dark:text-gray-400">
                Loading...
              </div>
            </div>
          ) : !isEvaluationEnabled ? (
            <div className="text-center py-12">
              <div className="text-2xl font-semibold text-red-600 dark:text-red-400">
                Teaching Evaluation is not opened yet.
              </div>
            </div>
          ) : (
            <>
              {/* Semester Selection */}
              <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="semester">Category</Label>
              <Select
                value={selectedSemester}
                onValueChange={setSelectedSemester}
                disabled={!previousSemesterData?.previousSemester}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {previousSemesterData?.previousSemester && (
                    <SelectItem value={previousSemesterData.previousSemester}>
                      {previousSemesterData.previousSemester}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="diu" 
                onClick={handleSearch} 
                disabled={!selectedSemester || isLoadingCourses}
              >
                {isLoadingCourses ? "Loading..." : "Search"}
              </Button>
            </div>
          </div>

          {/* Course Table */}
          {isLoadingCourses ? (
            <div className="text-center py-8">
              <div className="text-lg font-semibold text-blue-600 dark:text-gray-400">
                Loading courses...
              </div>
            </div>
          ) : courses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                <thead>
                  <tr className="bg-gray-100 dark:bg-slate-700">
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Submit Status
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Course Name
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Section
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Teacher Name
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id || course.courseId} className="">
                      <td className="border border-gray-300 px-4 py-2">
                        {course.submitted ? (
                          <Button
                            variant="outline"
                            disabled
                            className="bg-green-100 text-green-800"
                          >
                            Submitted
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => handleNotSubmittedClick(course)}
                            className="bg-red-100 text-red-800 hover:bg-red-200"
                          >
                            Not Submitted
                          </Button>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {course.courseName} ({course.courseCode})
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {course.section}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {course.teacherName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : selectedSemester ? (
            <div className="text-center py-8">
              <div className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                No courses found for {selectedSemester}. Please make sure you were enrolled in courses for this semester.
              </div>
            </div>
          ) : null}

          {/* Evaluation Form */}
          {showForm && selectedCourse && (
            <div className="fixed inset-0 bg-black  bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-2">
                    Teaching Evaluation
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedCourse.courseName} ({selectedCourse.courseCode}),{" "}
                    {selectedCourse.section}
                  </p>
                </div>

                <div className="space-y-6">
                  {evaluationQuestions.map((question, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="mb-3">
                        <span className="font-medium">{index + 1}. </span>
                        {question}
                      </div>
                      <div className="space-y-2">
                        {ratingOptions.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center">
                            <input
                              type="radio"
                              id={`q${index + 1}_${optionIndex}`}
                              name={`question${index + 1}`}
                              value={option}
                              checked={evaluationData[index + 1] === option}
                              onChange={(e) =>
                                handleEvaluationChange(
                                  index + 1,
                                  e.target.value
                                )
                              }
                              className="mr-2"
                            />
                            <Label
                              htmlFor={`q${index + 1}_${optionIndex}`}
                              className="cursor-pointer"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="border border-gray-200 rounded-lg p-4">
                    <Label className="block mb-2">Note</Label>
                    <textarea
                      className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-blue-300"
                      placeholder="Add any additional comments or notes..."
                      value={evaluationData.note || ""}
                      onChange={(e) =>
                        setEvaluationData((prev) => ({
                          ...prev,
                          note: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button 
                      variant="destructive" 
                      onClick={handleCancel}
                      disabled={submitEvaluationMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={submitEvaluationMutation.isPending}
                    >
                      {submitEvaluationMutation.isPending ? "Submitting..." : "Submit"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
