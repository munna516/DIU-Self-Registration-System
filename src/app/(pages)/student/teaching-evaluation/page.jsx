"use client";

import React, { useState } from "react";
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

export default function TeachingEvaluation() {
  const [selectedSemester, setSelectedSemester] = useState("");
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [evaluationData, setEvaluationData] = useState({});

  // Sample semester data
  const semesters = [
    "Spring 2025",
    "Fall 2024",
    "Summer 2024",
    "Spring 2024",
    "Fall 2023",
    "Summer 2023",
    "Spring 2023",
    "Fall 2022",
  ];

  // Sample course data
  const sampleCourses = [
    {
      id: 1,
      courseName: "FYDP (Title Defense)",
      courseCode: "CSE499",
      section: "61_A",
      teacherName: "Fateme Tuj Johora",
      submitted: false,
    },
    {
      id: 2,
      courseName: "Database Management Systems",
      courseCode: "CSE301",
      section: "61_A",
      teacherName: "Monir Hossain",
      submitted: false,
    },
    {
      id: 3,
      courseName: "Software Engineering",
      courseCode: "CSE401",
      section: "61_A",
      teacherName: "Asaduzzaman",
      submitted: false,
    },
  ];

  const handleSearch = () => {
    if (selectedSemester) {
      setCourses(sampleCourses);
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
    // Update the course submission status
    setCourses((prev) =>
      prev.map((course) =>
        course.id === selectedCourse.id
          ? { ...course, submitted: true }
          : course
      )
    );
    setShowForm(false);
    setSelectedCourse(null);
    setEvaluationData({});
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
    "Below average",
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
          {/* Semester Selection */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="semester">Category</Label>
              <Select
                value={selectedSemester}
                onValueChange={setSelectedSemester}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((semester) => (
                    <SelectItem key={semester} value={semester}>
                      {semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="diu" onClick={handleSearch} disabled={!selectedSemester}>
                Search
              </Button>
            </div>
          </div>

          {/* Course Table */}
          {courses.length > 0 && (
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
                    <tr key={course.id} className="">
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
          )}

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
                    <Button variant="destructive" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>Submit</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
