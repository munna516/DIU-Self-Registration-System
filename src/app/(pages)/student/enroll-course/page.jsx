"use client";
import React, { useState, useEffect, useMemo } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { getStudentTerm } from "@/utils/studentTerm";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Helper function to generate section letters based on count
const generateSections = (count) => {
  const sections = [];
  for (let i = 0; i < count; i++) {
    sections.push(String.fromCharCode(65 + i)); // 65 is 'A' in ASCII
  }
  return sections;
};

// Lab subsections - only 2 per section
const labSubsections = ["1", "2"];

export default function EnrollCourse() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedLabSubsection, setSelectedLabSubsection] = useState("");
  const [pendingCourses, setPendingCourses] = useState([]);
  const [commonSection, setCommonSection] = useState("");
  const [showEvaluationToast, setShowEvaluationToast] = useState(false);
  const [showClearanceDialog, setShowClearanceDialog] = useState(false);
  const [prerequisiteCheckStatus, setPrerequisiteCheckStatus] = useState(null); // null, 'checking', 'completed', 'failed', 'notFound'
  const [prerequisiteCheckResult, setPrerequisiteCheckResult] = useState(null);
  const [failedPrerequisiteCourses, setFailedPrerequisiteCourses] = useState([]); // Courses that should be disabled due to failed prerequisites (e.g., Math-II)
  const [enabledPrerequisiteCourses, setEnabledPrerequisiteCourses] = useState([]); // Prerequisite courses that should be enabled (because they failed and need retake, e.g., Math-I)
  const [failedPrerequisiteCodes, setFailedPrerequisiteCodes] = useState([]); // Track which prerequisite codes failed (e.g., ["MAT-101"])
  const [failedPrerequisiteCoursesDetails, setFailedPrerequisiteCoursesDetails] = useState([]); // Full details of failed prerequisite courses to add to dropdown
  const [clearedPrerequisiteCourses, setClearedPrerequisiteCourses] = useState([]); // Courses whose prerequisites have been checked and cleared
  const [selectedRetakeSection, setSelectedRetakeSection] = useState(""); // Section for retake (pre-requisite) courses
  const queryClient = useQueryClient();

  const { data: registrationSchedule, isLoading: isLoadingSchedule } = useQuery(
    {
      queryKey: ["registration-dates"],
      queryFn: async () => {
        const res = await fetch(
          `/api/student/registration-schedule?department=${session?.user?.department}`
        );
        const json = await res.json();
        if (!res.ok || !json.success)
          throw new Error(
            json.message || "Failed to fetch registration schedule"
          );
        return json.data;
      },
      enabled: !!session?.user?.department,
    }
  );

  const { data: teachingEvaluation, isLoading: isLoadingTeachingEvaluation } =
    useQuery({
      queryKey: ["teaching-evaluation"],
      queryFn: async () => {
        const res = await fetch(
          `/api/student/teaching-evaluation?id=${session?.user._id}&studentId=${session?.user?.studentId}`
        );
        const json = await res.json();
        return json.data;
      },
      enabled: !!session?.user?._id,
    });

  // Fetch courses from API
  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["enroll-courses", session?.user?.department, session?.user?.studentId],
    queryFn: async () => {
      const res = await fetch(
        `/api/student/enroll-courses?department=${session?.user?.department}&studentId=${session?.user?.studentId}`
      );
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to fetch courses");
      return json.data;
    },
    enabled: !!session?.user?.department && !!session?.user?.studentId,
  });

  const { data: semesterData, isLoading: isLoadingSemester } = useQuery({
    queryKey: ["semester"],
    queryFn: async () => {
      const res = await fetch("/api/student/get-semester-info");
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to fetch semester");
      return json.data;
    },
    enabled: !!session?.user?.studentId,
  });

  const currentSemesterLabel = useMemo(
    () =>
      semesterData ? `${semesterData.semester} ${semesterData.year}` : "",
    [semesterData]
  );

  // Fetch clearance request for current semester
  const {
    data: clearanceForEnroll,
    isLoading: isLoadingClearance,
  } = useQuery({
    queryKey: [
      "clearance-request-enroll",
      session?.user?.studentId,
      currentSemesterLabel,
    ],
    queryFn: async () => {
      const res = await fetch(
        `/api/student/clearance-request?studentId=${session?.user?.studentId}&semester=${encodeURIComponent(
          currentSemesterLabel
        )}`
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch clearance request");
      }
      return json.data;
    },
    enabled:
      !!session?.user?.studentId &&
      !!currentSemesterLabel &&
      !isLoadingSemester,
  });

  // Transform courses data to match the expected format
  const baseCourses = useMemo(
    () =>
      coursesData
        ? coursesData.map((course) => ({
          code: course.courseCode,
          title: course.courseTitle,
          credit: course.credit,
          pre: course.prerequisite || [],
          isLab: course.courseType === "Lab",
        }))
        : [],
    [coursesData]
  );

  // Add failed prerequisite courses to the courses list (for retake enrollment)
  // These courses might be from previous levels, so we need to include them
  const failedPrereqCourses = useMemo(
    () =>
      failedPrerequisiteCoursesDetails.map((course) => ({
        code: course.courseCode,
        title: course.courseTitle,
        credit: course.credit,
        pre: course.prerequisite || [],
        isLab: course.courseType === "Lab",
        isRetake: true,
      })),
    [failedPrerequisiteCoursesDetails]
  );

  // Merge base courses with failed prerequisite courses, avoiding duplicates
  const courses = useMemo(() => {
    const allCourseCodes = new Set(baseCourses.map((c) => c.code));
    const uniqueFailedPrereqs = failedPrereqCourses.filter(
      (c) => !allCourseCodes.has(c.code)
    );
    return [...baseCourses, ...uniqueFailedPrereqs];
  }, [baseCourses, failedPrereqCourses]);

  // Fetch regular sections (for theory and lab)
  const { data: regularSectionData, isLoading: isLoadingRegularSections } = useQuery({
    queryKey: ["sections", session?.user?.department, session?.user?.studentId, "regular"],
    queryFn: async () => {
      const res = await fetch(
        `/api/student/sections?department=${session?.user?.department}&studentId=${session?.user?.studentId}&sectionType=regular`
      );
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to fetch regular sections");
      return json.data;
    },
    enabled: !!session?.user?.department && !!session?.user?.studentId,
  });

  // Fetch retake sections (for prerequisite/retake courses)
  const { data: retakeSectionData, isLoading: isLoadingRetakeSections } = useQuery({
    queryKey: ["sections", session?.user?.department, session?.user?.studentId, "retake"],
    queryFn: async () => {
      const res = await fetch(
        `/api/student/sections?department=${session?.user?.department}&studentId=${session?.user?.studentId}&sectionType=retake`
      );
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to fetch retake sections");
      return json.data;
    },
    enabled: !!session?.user?.department && !!session?.user?.studentId,
  });

  // Generate sections arrays based on counts from database
  const regularSections = useMemo(
    () =>
      regularSectionData?.count ? generateSections(regularSectionData.count) : [],
    [regularSectionData?.count]
  );

  const retakeSections = useMemo(
    () =>
      retakeSectionData?.count ? generateSections(retakeSectionData.count) : [],
    [retakeSectionData?.count]
  );

  // Fetch enrolled courses for current semester
  const { data: enrolledCoursesData, isLoading: isLoadingEnrolledCourses, refetch: refetchEnrolledCourses } = useQuery({
    queryKey: ["registered-courses", session?.user?.studentId],
    queryFn: async () => {
      const res = await fetch(
        `/api/student/registered-courses?studentId=${session?.user?.studentId}`
      );
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to fetch enrolled courses");
      return json.data;
    },
    enabled: !!session?.user?.studentId,
  });

  // Use enrolledCoursesData for checking enrolled courses
  const enrolledCourses = enrolledCoursesData || [];

  // Check if student has enrolled courses (hide enrollment form if they have)
  const hasEnrolledCourses = enrolledCourses.length > 0;

  const registrationStatusData = useMemo(() => {
    if (!registrationSchedule || !registrationSchedule.isEnabled) {
      return {
        registrationStatus: "notOpen",
        registrationStartDateTime: null,
        registrationEndDateTime: null,
      };
    }

    const now = new Date();

    const [startHours, startMinutes] = (
      registrationSchedule.startTime || "00:00"
    )
      .split(":")
      .map(Number);
    const registrationStartDateTime = new Date(
      new Date(registrationSchedule.startDate)
    );
    registrationStartDateTime.setHours(startHours, startMinutes, 0, 0);

    const [endHours, endMinutes] = (
      registrationSchedule.endTime || "00:00"
    )
      .split(":")
      .map(Number);
    const registrationEndDateTime = new Date(
      new Date(registrationSchedule.endDate)
    );
    registrationEndDateTime.setHours(endHours, endMinutes, 0, 0);

    let status = "open";
    if (now < registrationStartDateTime) {
      status = "notOpen";
    } else if (now > registrationEndDateTime) {
      status = "closed";
    }

    return {
      registrationStatus: status,
      registrationStartDateTime,
      registrationEndDateTime,
    };
  }, [registrationSchedule]);

  const registrationStatus = registrationStatusData.registrationStatus;
  const isRegistrationOpen = registrationStatus === "open";

  // Check if there are any lab courses in the list
  const hasLabCoursesInList = useMemo(
    () => courses.some((c) => c.isLab),
    [courses]
  );

  // Whether there are pending theory or lab courses (used to lock section choices)
  const hasPendingTheory = useMemo(
    () => pendingCourses.some((pc) => !pc.isLab && !pc.isPrereq),
    [pendingCourses]
  );

  const hasPendingLab = useMemo(
    () => pendingCourses.some((pc) => pc.isLab && !pc.isPrereq),
    [pendingCourses]
  );

  const hasPendingRetake = useMemo(
    () => pendingCourses.some((pc) => pc.isPrereq),
    [pendingCourses]
  );

  // Check if evaluation is completed and show toast if needed
  useEffect(() => {
    if (
      !isLoadingSchedule &&
      !isLoadingTeachingEvaluation &&
      isRegistrationOpen &&
      teachingEvaluation === false
    ) {
      setShowEvaluationToast(true);
    }
  }, [
    isLoadingSchedule,
    isLoadingTeachingEvaluation,
    isRegistrationOpen,
    teachingEvaluation,
  ]);

  // Check clearance status for current semester
  useEffect(() => {
    if (
      !isLoadingSemester &&
      !isLoadingClearance &&
      isRegistrationOpen
    ) {
      const isApproved =
        clearanceForEnroll && clearanceForEnroll.requestStatus === "approved";
      if (!isApproved) {
        setShowClearanceDialog(true);
      } else {
        setShowClearanceDialog(false);
      }
    }
  }, [
    isLoadingSemester,
    isLoadingClearance,
    isRegistrationOpen,
    clearanceForEnroll,
  ]);

  // Disable already enrolled courses and courses already in pending list (for dropdown)
  const fullyDisabledCodes = useMemo(
    () => [
      ...new Set([
        ...enrolledCourses.map((ec) => ec.code),
        ...pendingCourses.map((pc) => pc.code),
      ]),
    ],
    [enrolledCourses, pendingCourses]
  );

  // Only disable courses that have been checked and found to have failed prerequisites
  // Allow students to SELECT courses with prerequisites first, then check them
  const coursesWithUnmetPrereqs = useMemo(
    () =>
      courses
        .filter((course) => {
          if (course.pre.length === 0) return false;
          // Disable if any of its prerequisites failed (check against failedPrerequisiteCodes)
          return course.pre.some((preCode) =>
            failedPrerequisiteCodes.includes(preCode)
          );
        })
        .map((c) => c.code),
    [courses, failedPrerequisiteCodes]
  );

  const allDisabledCodes = useMemo(
    () => [...new Set([...fullyDisabledCodes, ...coursesWithUnmetPrereqs])],
    [fullyDisabledCodes, coursesWithUnmetPrereqs]
  );

  // Calculate available courses (courses that can be enrolled)
  // Exclude courses with prerequisites - students should not add prerequisite courses
  // IMPORTANT: Only exclude enrolled courses, NOT pending courses (pending courses should be counted)
  // BUT include prerequisite courses that failed and need retaking
  const availableCourses = useMemo(
    () =>
      courses.filter((course) => {
        const isEnrolled = enrolledCourses.some((ec) => ec.code === course.code);
        const hasUnmetPrereq = coursesWithUnmetPrereqs.includes(course.code);
        const isEnabledPrereq = enabledPrerequisiteCourses.includes(course.code);

        // Include if:
        // 1. Not enrolled
        // 2. Either has no prerequisites OR is a failed prerequisite that needs retaking
        // 3. Doesn't have unmet prerequisites (unless it's an enabled prerequisite)
        return (
          !isEnrolled &&
          (course.pre.length === 0 || isEnabledPrereq) &&
          (!hasUnmetPrereq || isEnabledPrereq)
        );
      }),
    [courses, enrolledCourses, coursesWithUnmetPrereqs, enabledPrerequisiteCourses]
  );

  // Check if all available courses are in pending list
  const allCoursesAdded = useMemo(
    () =>
      availableCourses.length > 0 &&
      availableCourses.every((course) =>
        pendingCourses.some((pc) => pc.code === course.code)
      ),
    [availableCourses, pendingCourses]
  );


  const handleCourseChange = (value) => {
    const course = courses.find((c) => `${c.code} - ${c.title}` === value);
    setSelectedCourse(course);
    setSelectedSection("");
    setSelectedLabSubsection("");
    // Reset prerequisite check status when course changes
    setPrerequisiteCheckStatus(null);
    setPrerequisiteCheckResult(null);
  };

  // Sync theory section and lab subsection - ensure they use the same base section
  // When lab subsection is selected, automatically set theory section to match
  useEffect(() => {
    if (selectedLabSubsection && hasPendingTheory) {
      const labBaseSection = selectedLabSubsection.charAt(0);
      if (!selectedSection || selectedSection !== labBaseSection) {
        setSelectedSection(labBaseSection);
      }
    }
  }, [selectedLabSubsection, hasPendingTheory, selectedSection]);

  // When theory section changes, clear lab subsection if it doesn't match
  useEffect(() => {
    if (selectedSection && selectedLabSubsection && hasPendingLab) {
      const labBaseSection = selectedLabSubsection.charAt(0);
      if (labBaseSection !== selectedSection) {
        setSelectedLabSubsection("");
      }
    }
  }, [selectedSection, hasPendingLab, selectedLabSubsection]);

  // Check prerequisite status
  const handleCheckPrerequisite = async () => {
    if (!selectedCourse || selectedCourse.pre.length === 0) {
      return;
    }

    // Check all prerequisites
    setPrerequisiteCheckStatus("checking");

    try {
      const prerequisiteChecks = await Promise.all(
        selectedCourse.pre.map(async (preCode) => {
          const res = await fetch(
            `/api/student/check-prerequisite?studentId=${session?.user?.studentId}&prerequisiteCode=${preCode}`
          );
          const json = await res.json();
          if (!res.ok || !json.success) {
            throw new Error(json.message || "Failed to check prerequisite");
          }
          return json.data;
        })
      );

      // Check if all prerequisites are completed
      const allCompleted = prerequisiteChecks.every(
        (check) => check.found === true && check.status === "completed"
      );

      // Check if any prerequisite failed (must be found in previous semester and status is failed)
      const anyFailed = prerequisiteChecks.some(
        (check) => check.found === true && check.status === "failed"
      );

      // Check if any prerequisite is not found or still enrolled (not completed)
      const anyNotCompleted = prerequisiteChecks.some(
        (check) => !check.found || check.status === "enrolled" || (check.status !== "completed" && check.status !== "failed")
      );

      if (allCompleted) {
        setPrerequisiteCheckStatus("completed");
        setPrerequisiteCheckResult({
          status: "completed",
          message: "All prerequisites are completed. You can add this course.",
        });
        toast.success("All prerequisites are completed. You can add this course.");

        // Mark this course as having cleared prerequisites
        if (selectedCourse) {
          setClearedPrerequisiteCourses((prev) => [
            ...new Set([...prev, selectedCourse.code]),
          ]);
        }
      } else if (anyFailed) {
        setPrerequisiteCheckStatus("failed");
        const failedPrereqs = prerequisiteChecks.filter(
          (check) => check.found && check.status === "failed"
        );
        setPrerequisiteCheckResult({
          status: "failed",
          failedPrerequisites: failedPrereqs,
          message: "Some prerequisites failed. You need to retake them first.",
        });

        // Track failed prerequisite codes
        const failedCodes = failedPrereqs.map((f) => f.prerequisiteCode);
        setFailedPrerequisiteCodes((prev) => [
          ...new Set([...prev, ...failedCodes]),
        ]);

        // Store full details of failed prerequisite courses to add to dropdown
        const failedPrereqDetails = failedPrereqs
          .filter((f) => f.prerequisiteDetails)
          .map((f) => f.prerequisiteDetails);

        setFailedPrerequisiteCoursesDetails((prev) => {
          const existingCodes = new Set(prev.map((c) => c.courseCode));
          const newDetails = failedPrereqDetails.filter(
            (c) => !existingCodes.has(c.courseCode)
          );
          return [...prev, ...newDetails];
        });

        // Enable failed prerequisite courses in dropdown
        setEnabledPrerequisiteCourses((prev) => [
          ...new Set([...prev, ...failedCodes]),
        ]);

        // Disable the course that requires these failed prerequisites
        setFailedPrerequisiteCourses((prev) => [
          ...new Set([...prev, selectedCourse.code]),
        ]);

        toast.error(
          `Prerequisite(s) failed: ${failedPrereqs.map((f) => f.prerequisiteCode).join(", ")}. Please retake them first.`
        );
      } else if (anyNotCompleted) {
        setPrerequisiteCheckStatus("notCompleted");
        const notCompletedPrereqs = prerequisiteChecks.filter(
          (check) => !check.found || check.status === "enrolled" || (check.status !== "completed" && check.status !== "failed")
        );
        setPrerequisiteCheckResult({
          status: "notCompleted",
          notCompletedPrerequisites: notCompletedPrereqs,
          message: "Some prerequisites are not completed yet. Please complete them first.",
        });
        toast.error("Wait for the teacher evaluation")
      } else {
        setPrerequisiteCheckStatus("notFound");
        setPrerequisiteCheckResult({
          status: "notFound",
          message: "Prerequisites not found in previous semesters.",
        });
        toast.error("Prerequisites not found in previous semesters.");
      }
    } catch (error) {
      setPrerequisiteCheckStatus("error");
      setPrerequisiteCheckResult({
        status: "error",
        message: error.message || "Failed to check prerequisites",
      });
      toast.error(error.message || "Failed to check prerequisites");
    }
  };

  // Add course to pending list (no per-course section here; sections chosen later)
  const handleAddCourse = (courseArg) => {
    const course = courseArg || selectedCourse;
    if (!course) {
      toast.error("Please select a course first.");
      return;
    }

    // Check if course is already in pending list
    if (pendingCourses.some((pc) => pc.code === course.code)) {
      toast.error("This course is already in your pending list.");
      return;
    }

    // Check if this is a retake course
    const isRetakeCourse =
      enabledPrerequisiteCourses.includes(course.code);

    setPendingCourses((prev) => [
      ...prev,
      {
        code: course.code,
        title: course.title,
        credit: course.credit,
        isLab: course.isLab || false,
        isPrereq: isRetakeCourse, // Mark as prerequisite/retake course
      },
    ]);

    if (!courseArg) {
      setSelectedCourse(null);
    }
  };

  // Remove course from pending list
  const handleRemovePendingCourse = (courseCode) => {
    const updatedPending = pendingCourses.filter(
      (pc) => pc.code !== courseCode
    );
    setPendingCourses(updatedPending);
  };

  // Mutation for enrolling courses
  const enrollMutation = useMutation({
    mutationFn: async (coursesToEnroll) => {
      const res = await fetch("/api/student/enroll-courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: session?.user?.studentId,
          department: session?.user?.department,
          courses: coursesToEnroll,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to enroll courses");
      }
      return json;
    },
    onSuccess: async (data) => {
      // Show success toast
      toast.success(`Successfully enrolled in ${pendingCourses.length} courses!`);

      // Clear pending courses and reset
      setPendingCourses([]);
      setSelectedSection("");
      setSelectedLabSubsection("");
      setCommonSection("");

      // Invalidate and refetch queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["sections"] });
      await queryClient.invalidateQueries({ queryKey: ["registered-courses"] });

      // Fetch enrolled courses after successful enrollment
      await refetchEnrolledCourses();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to enroll courses. Please try again.");
    },
  });

  // Enroll all courses
  const handleEnrollAll = () => {
    if (pendingCourses.length === 0) {
      toast.error("No courses to enroll.");
      return;
    }

    // Validate section selections based on selected course types
    if (hasPendingTheory && !selectedSection) {
      toast.error("Please select a theory section for your courses.");
      return;
    }
    if (hasPendingLab && !selectedLabSubsection) {
      toast.error("Please select a lab subsection for your lab courses.");
      return;
    }
    if (hasPendingRetake && !selectedRetakeSection) {
      toast.error("Please select a retake section for your prerequisite courses.");
      return;
    }

    // Validate that theory and lab courses use the same base section
    if (hasPendingTheory && hasPendingLab && selectedSection && selectedLabSubsection) {
      const labBaseSection = selectedLabSubsection.charAt(0);
      if (labBaseSection !== selectedSection) {
        toast.error("Theory and lab courses must be enrolled in the same section.");
        return;
      }
    }

    // Prepare courses for enrollment
    // Include sectionType info for retake courses
    const coursesToEnroll = pendingCourses.map((pc) => {
      let sectionValue;
      if (pc.isPrereq) {
        sectionValue = selectedRetakeSection;
      } else if (pc.isLab) {
        sectionValue = selectedLabSubsection;
      } else {
        sectionValue = selectedSection;
      }
      return {
        code: pc.code,
        section: sectionValue,
        isRetake: pc.isPrereq || false, // Mark retake courses
      };
    });

    // Call the mutation
    enrollMutation.mutate(coursesToEnroll);
  };

  const handleEvaluationToastOK = () => {
    setShowEvaluationToast(false);
    router.push("/student/teaching-evaluation");
  };

  const handleClearanceDialogOK = () => {
    setShowClearanceDialog(false);
    router.push("/student/clearance");
  };

  return (
    <div className="">
      {/* Evaluation Pending Toast/Dialog */}
      <Dialog
        open={showEvaluationToast}
        onOpenChange={(open) => {
          // Prevent closing by clicking outside or pressing ESC
          // Only allow closing via OK button
          if (!open) {
            return;
          }
        }}
      >
        <DialogContent
          className="md:max-w-md max-w-sm"
          onInteractOutside={(e) => {
            // Prevent closing when clicking outside
            e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            // Prevent closing when pressing ESC
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400">
              Evaluation is Pending
            </DialogTitle>
            <DialogDescription className="pt-2">
              You need to complete your teaching evaluation before you can
              enroll in courses.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="diu"
              onClick={handleEvaluationToastOK}
              className="w-full"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clearance Required Dialog */}
      <Dialog
        open={showClearanceDialog}
        onOpenChange={(open) => {
          if (!open) {
            return;
          }
        }}
      >
        <DialogContent
          className="md:max-w-md max-w-sm"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400">
              Clearance Required
            </DialogTitle>
            <DialogDescription className="pt-2">
              You must submit and get clearance for the current semester before
              enrolling in courses. Please submit your clearance request.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="diu"
              onClick={handleClearanceDialogOK}
              className="w-full"
            >
              Go to Clearance Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="p-6 dark:bg-slate-800">
        <CardHeader className="pb-4">

          <CardTitle className="text-xl font-bold text-blue-700 dark:text-blue-400">Enroll Course</CardTitle>

        </CardHeader>
        <CardContent>
          {isLoadingSchedule ||
            isLoadingCourses ||
            isLoadingRegularSections ||
            isLoadingRetakeSections ||
            isLoadingEnrolledCourses ||
            isLoadingSemester ||
            isLoadingClearance ? (
            <div className="text-center py-8">
              <div className="text-lg font-semibold text-blue-600 dark:text-gray-400">
                Loading...
              </div>
            </div>
          ) : hasEnrolledCourses ? (
            /* Show only message when student has enrolled */
            <div className="text-center py-12">
              <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 inline-block">
                <div className="text-green-700 dark:text-green-400 font-semibold text-xl">
                  You have enrolled in courses.
                </div>
              </div>
            </div>
          ) : !isRegistrationOpen ? (
            <div className="text-center py-8 ">
              {registrationStatus === "closed" ? (
                <div className="text-2xl font-semibold text-red-600 dark:text-red-400">
                  Registration Is Closed
                </div>
              ) : (
                <>
                  <div className="text-2xl font-semibold text-red-600 dark:text-red-400">
                    Registration Is Not Open
                  </div>

                  <div className="mt-4 text-center font-semibold text-blue-600 dark:text-blue-400">
                    Note : If
                    you not completed your teaching evaluation, you will not be able
                    to enroll in any course. <br /> Please complete your teaching
                    evaluation first. <br />
                    <Link href="/student/teaching-evaluation">
                      <Button variant="diu" className="ml-2 mt-2">
                        Here
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Show course selection only if not enrolled and registration is open */}
              {isRegistrationOpen && (
                /* 1st row: Department & Level */
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="w-full sm:w-1/2">
                    <Label className="text-sm font-semibold">
                      Department
                    </Label>
                    <Input
                      value={
                        session?.user?.department
                          ? session?.user?.department
                          : ""
                      }
                      readOnly
                      className="bg-gray-100 dark:bg-gray-700 font-semibold"
                      label="Department"
                    />
                  </div>
                  <div className="w-full sm:w-1/2">
                    <Label className="text-sm font-semibold">Level</Label>
                    <Input
                      value={
                        "Level-" + getStudentTerm(session?.user?.studentId, { semester: semesterData?.semester, year: semesterData?.year }).split("L")[1].split("T")[0] + "  Term-" + getStudentTerm(session?.user?.studentId, { semester: semesterData?.semester, year: semesterData?.year }).split("T")[1]
                      }
                      readOnly
                      className="bg-gray-100 dark:bg-gray-700 font-semibold w-full"
                      label="Level"
                    />
                  </div>
                </div>
              )}
              {/* Course checklist */}
              <div className="mt-2">
                <Label className="text-sm font-semibold mb-2 block">
                  Select Your Courses
                </Label>
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                          Select
                        </th>
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
                          Type
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                          Pre-requisite
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                      {courses.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-300"
                          >
                            No courses available.
                          </td>
                        </tr>
                      ) : (
                        courses.map((c) => {
                          const isDisabled = allDisabledCodes.includes(
                            c.code
                          );
                          const isEnabledPrereq =
                            enabledPrerequisiteCourses.includes(c.code);
                          const hasFailedPrereq =
                            failedPrerequisiteCourses.includes(c.code);
                          const hasPrerequisites =
                            c.pre && c.pre.length > 0;
                          const isRetakeCourse = isEnabledPrereq;
                          const needsPrereqCheck =
                            hasPrerequisites &&
                            !isEnabledPrereq &&
                            !hasFailedPrereq;
                          const prereqNotCleared =
                            needsPrereqCheck &&
                            !clearedPrerequisiteCourses.includes(c.code);
                          const isChecked = pendingCourses.some(
                            (pc) => pc.code === c.code
                          );

                          return (
                            <tr key={c.code}>
                              <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4"
                                  checked={isChecked}
                                  disabled={
                                    (isDisabled && !isEnabledPrereq) ||
                                    prereqNotCleared
                                  }
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      handleAddCourse(c);
                                    } else {
                                      handleRemovePendingCourse(c.code);
                                    }
                                  }}
                                />
                              </td>
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
                                {isRetakeCourse
                                  ? "Retake"
                                  : c.isLab
                                    ? "Lab"
                                    : "Theory"}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                                {hasPrerequisites ? (
                                  <div className="flex items-center gap-2">
                                    <span>
                                      {c.pre.join(", ")}
                                      {isEnabledPrereq &&
                                        " (Retake Required)"}
                                      {hasFailedPrereq &&
                                        " (Failed - Disabled)"}
                                    </span>
                                    {prerequisiteCheckStatus ===
                                      "checking" &&
                                      selectedCourse &&
                                      selectedCourse.code === c.code ? (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        disabled
                                      >
                                        Checking...
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedCourse(c);
                                          handleCheckPrerequisite();
                                        }}
                                      >
                                        Check
                                      </Button>
                                    )}
                                  </div>
                                ) : (
                                  "None"
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Prerequisite Check Result (global for selected course) */}
                {selectedCourse &&
                  selectedCourse.pre.length > 0 &&
                  prerequisiteCheckResult && (
                    <div
                      className={`mt-3 p-3 rounded-lg border ${prerequisiteCheckResult.status === "completed"
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : prerequisiteCheckResult.status === "failed"
                          ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                          : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                        }`}
                    >
                      <div
                        className={`text-sm font-semibold ${prerequisiteCheckResult.status === "completed"
                          ? "text-green-700 dark:text-green-400"
                          : prerequisiteCheckResult.status === "failed"
                            ? "text-red-700 dark:text-red-400"
                            : "text-yellow-700 dark:text-yellow-400"
                          }`}
                      >
                        {prerequisiteCheckResult.message}
                      </div>
                    </div>
                  )}
              </div>

              {/* Section selection - shown only after courses selected */}
              {(hasPendingTheory || hasPendingLab || hasPendingRetake) && (
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  {hasPendingTheory && (
                    <div className="flex-1">
                      <Label className="text-sm font-semibold">
                        Theory Section
                      </Label>
                      <Select
                        value={selectedSection}
                        onValueChange={(value) => {
                          setSelectedSection(value);
                          // If lab subsection is selected and doesn't match, clear it
                          if (hasPendingLab && selectedLabSubsection) {
                            const labBaseSection = selectedLabSubsection.charAt(0);
                            if (labBaseSection !== value) {
                              setSelectedLabSubsection("");
                            }
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Theory Section" />
                        </SelectTrigger>
                        <SelectContent>
                          {regularSections.length > 0 ? (
                            regularSections.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-sections" disabled>
                              No sections available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {hasPendingLab && (
                    <div className="flex-1">
                      <Label className="text-sm font-semibold">
                        Lab Subsection
                      </Label>
                      <Select
                        value={selectedLabSubsection}
                        onValueChange={(value) => {
                          setSelectedLabSubsection(value);
                          // Automatically set theory section to match lab subsection base
                          const labBaseSection = value.charAt(0);
                          if (hasPendingTheory && !selectedSection) {
                            setSelectedSection(labBaseSection);
                          } else if (hasPendingTheory && selectedSection !== labBaseSection) {
                            setSelectedSection(labBaseSection);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Lab Subsection" />
                        </SelectTrigger>
                        <SelectContent>
                          {regularSections.length > 0 ? (
                            regularSections.flatMap((section) =>
                              labSubsections.map((sub) => {
                                const subsectionValue = `${section}${sub}`;
                                // If theory section is selected, only show subsections from that section
                                const isDisabled = hasPendingTheory && selectedSection && section !== selectedSection;
                                return (
                                  <SelectItem
                                    key={subsectionValue}
                                    value={subsectionValue}
                                    disabled={isDisabled}
                                  >
                                    {subsectionValue} (25)
                                  </SelectItem>
                                );
                              })
                            )
                          ) : (
                            <SelectItem value="no-subsections" disabled>
                              No subsections available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {hasPendingRetake && (
                    <div className="flex-1">
                      <Label className="text-sm font-semibold">
                        Retake Section
                      </Label>
                      <Select
                        value={selectedRetakeSection}
                        onValueChange={setSelectedRetakeSection}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Retake Section" />
                        </SelectTrigger>
                        <SelectContent>
                          {retakeSections.length > 0 ? (
                            retakeSections.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-retake" disabled>
                              No sections available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}
            </>)}

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
                          {c.isPrereq
                            ? selectedRetakeSection || "Not Selected"
                            : c.isLab
                              ? selectedLabSubsection || "Not Selected"
                              : selectedSection || "Not Selected"}
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
                            onClick={() =>
                              handleRemovePendingCourse(c.code)
                            }
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
          {pendingCourses.length > 0 && !hasEnrolledCourses && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-green-700 dark:text-green-400 font-semibold mb-3">
                {allCoursesAdded
                  ? `All ${availableCourses.length} available courses added. Ready to enroll!`
                  : availableCourses.length > 0
                    ? `Added ${pendingCourses.length} of ${availableCourses.length} available courses. Please add all courses before enrolling.`
                    : "No courses available to enroll."}
              </div>
              <div className="flex justify-end">
                <Button
                  variant="diu"
                  className="whitespace-nowrap"
                  onClick={handleEnrollAll}
                  disabled={
                    !allCoursesAdded ||
                    availableCourses.length === 0 ||
                    enrollMutation.isPending ||
                    (hasPendingTheory && !selectedSection) ||
                    (hasPendingLab && !selectedLabSubsection) ||
                    (hasPendingRetake && !selectedRetakeSection)
                  }
                >
                  {enrollMutation.isPending
                    ? "Enrolling..."
                    : `Enroll All Courses (${pendingCourses.length})`}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}