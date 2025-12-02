"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function Clearance() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();

    // Fetch current semester info
    const {
        data: semesterData,
        isLoading: isLoadingSemester,
        isError: isSemesterError,
    } = useQuery({
        queryKey: ["semester-info"],
        queryFn: async () => {
            const res = await fetch("/api/student/get-semester-info");
            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.message || "Failed to fetch semester info");
            }
            return json.data;
        },
    });

    const currentSemesterLabel = semesterData
        ? `${semesterData.semester} ${semesterData.year}`
        : "";

    // Fetch existing clearance request (if any)
    const {
        data: clearanceRequest,
        isLoading: isLoadingRequest,
    } = useQuery({
        queryKey: [
            "clearance-request",
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
            !isLoadingSemester &&
            !isSemesterError,
    });

    const requestStatus = clearanceRequest?.requestStatus || "pending";

    // Fetch all clearance requests for this student (history)
    const {
        data: clearanceHistory,
        isLoading: isLoadingHistory,
        isError: isHistoryError,
    } = useQuery({
        queryKey: ["clearance-history", session?.user?.studentId],
        queryFn: async () => {
            const res = await fetch(
                `/api/student/clearance-request-history?studentId=${session?.user?.studentId}`
            );
            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.message || "Failed to fetch clearance history");
            }
            return json.data;
        },
        enabled: !!session?.user?.studentId,
    });

    const historyRequests = useMemo(
        () => (Array.isArray(clearanceHistory) ? clearanceHistory : []),
        [clearanceHistory]
    );

    const createRequestMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/student/clearance-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: session?.user?.studentId,
                    department: session?.user?.department,
                    semester: currentSemesterLabel,
                }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.message || "Failed to submit clearance request");
            }
            return json.data;
        },
        onSuccess: () => {
            toast.success("Clearance request submitted successfully");
            queryClient.invalidateQueries({
                queryKey: [
                    "clearance-request",
                    session?.user?.studentId,
                    currentSemesterLabel,
                ],
            });
            queryClient.invalidateQueries({
                queryKey: ["clearance-history", session?.user?.studentId],
            });
        },
        onError: (error) => {
            toast.error(error.message || "Failed to submit clearance request");
        },
    });

    const handleSubmitRequest = () => {
        if (!session?.user?.studentId || !currentSemesterLabel) {
            toast.error("Missing student or semester information");
            return;
        }
        createRequestMutation.mutate();
    };

    const isButtonDisabled =
        !session?.user?.studentId ||
        !currentSemesterLabel ||
        isLoadingSemester ||
        isLoadingRequest ||
        !!clearanceRequest ||
        createRequestMutation.isPending;

    const getStatusBadge = () => {
        if (!clearanceRequest) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    Not Requested
                </span>
            );
        }

        if (requestStatus === "approved") {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                    Approved
                </span>
            );
        }

        if (requestStatus === "rejected") {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                    Rejected
                </span>
            );
        }

        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                Pending
            </span>
        );
    };

    return (
        <div className="">
            <Card className="dark:bg-slate-800">
                <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-xl font-bold">
                            Clearance Request
                        </CardTitle>
                        {getStatusBadge()}
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoadingSemester ? (
                        <div className="text-center py-8">
                            <div className="text-lg font-semibold text-blue-600 dark:text-gray-300">
                                Loading semester information...
                            </div>
                        </div>
                    ) : isSemesterError ? (
                        <div className="text-center py-8">
                            <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                                Failed to load semester information. Please try again later.
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
                                Submit a clearance request for the current semester. Once
                                submitted, the administration will review your request and
                                update the status.
                            </p>

                            <div className="grid gap-4 md:grid-cols-2 mb-6">
                                <div>
                                    <Label className="text-sm font-semibold">Student Name</Label>
                                    <Input
                                        value={session?.user?.name || ""}
                                        readOnly
                                        className="bg-gray-100 dark:bg-gray-700 font-semibold"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-semibold">Student ID</Label>
                                    <Input
                                        value={session?.user?.studentId || ""}
                                        readOnly
                                        className="bg-gray-100 dark:bg-gray-700 font-semibold"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-semibold">Department</Label>
                                    <Input
                                        value={session?.user?.department || ""}
                                        readOnly
                                        className="bg-gray-100 dark:bg-gray-700 font-semibold"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-semibold">Semester</Label>
                                    <Input
                                        value={currentSemesterLabel}
                                        readOnly
                                        className="bg-gray-100 dark:bg-gray-700 font-semibold"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    {clearanceRequest ? (
                                        <>
                                            Your clearance request for{" "}
                                            <span className="font-semibold">
                                                {currentSemesterLabel}
                                            </span>{" "}
                                            has been submitted. Current status:{" "}
                                            <span className="font-semibold capitalize">
                                                {requestStatus}
                                            </span>
                                            .
                                        </>
                                    ) : (
                                        <>
                                            You have not submitted a clearance request for{" "}
                                            <span className="font-semibold">
                                                {currentSemesterLabel}
                                            </span>{" "}
                                            yet.
                                        </>
                                    )}
                                </div>
                                <Button
                                    variant="diu"
                                    onClick={handleSubmitRequest}
                                    disabled={isButtonDisabled}
                                    className="min-w-[180px]"
                                >
                                    {createRequestMutation.isPending
                                        ? "Submitting..."
                                        : clearanceRequest
                                            ? "Request Submitted"
                                            : "Submit Clearance Request"}
                                </Button>
                            </div>

                            <div className="mt-4">
                                <h2 className="text-lg font-semibold mb-3">
                                    Clearance Request History
                                </h2>
                                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-100 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                                                    SL
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                                                    Semester
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                                                    Department
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                                                    Status
                                                </th>

                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                                            {isLoadingHistory ? (
                                                <tr>
                                                    <td
                                                        colSpan={5}
                                                        className="px-4 py-6 text-center text-gray-500 dark:text-gray-300"
                                                    >
                                                        Loading history...
                                                    </td>
                                                </tr>
                                            ) : isHistoryError ? (
                                                <tr>
                                                    <td
                                                        colSpan={5}
                                                        className="px-4 py-6 text-center text-red-500 dark:text-red-400"
                                                    >
                                                        Failed to load clearance history.
                                                    </td>
                                                </tr>
                                            ) : historyRequests.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={5}
                                                        className="px-4 py-6 text-center text-gray-500 dark:text-gray-300"
                                                    >
                                                        No clearance requests found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                historyRequests.map((req, index) => (
                                                    <tr key={req._id || index}>
                                                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                                                            {req.semester}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                                                            {req.department}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${req.requestStatus === "approved"
                                                                    ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                                                                    : req.requestStatus === "rejected"
                                                                        ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                                                                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                                                                    }`}
                                                            >
                                                                {req.requestStatus === "approved" ? "Approved" : req.requestStatus === "rejected" ? "Rejected" : "Pending"}
                                                            </span>
                                                        </td>

                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
