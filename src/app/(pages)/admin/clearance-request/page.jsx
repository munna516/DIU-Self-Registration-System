"use client";

import React, { useMemo, useState } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const departments = [
  { value: "ALL", label: "All Departments" },
  { value: "CSE", label: "Computer Science & Engineering" },
  { value: "SWE", label: "Software Engineering" },
  { value: "CIS", label: "Computing and Information System" },
  { value: "EEE", label: "Electrical & Electronic Engineering" },
  { value: "CE", label: "Civil Engineering" },
  { value: "TE", label: "Textile Engineering" },
  { value: "ARC", label: "Architecture" },
  { value: "ICE", label: "Information and Communication Engineering" },
  { value: "LAW", label: "Law" },
  { value: "ENG", label: "English" },
  { value: "JMC", label: "Journalism and Mass Communication" },
  { value: "BBA", label: "Business Administration" },
  { value: "THM", label: "Tourism and Hospitality Management" },
  { value: "IE", label: "Innovation and Entrepreneurship" },
  { value: "PH", label: "Pharmacy" },
  { value: "NFE", label: "Nutrition and Food Engineering" },
  { value: "GEB", label: "Genetic Engineering and Biotechnology" },
];

const statusColors = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  approved:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export default function AdminClearanceRequestPage() {
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("ALL");

  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-clearance-requests", studentId, department],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (studentId) params.set("studentId", studentId);
      if (department && department !== "ALL") {
        params.set("department", department);
      }

      const res = await fetch(
        `/api/admin/clearance-request${
          params.toString() ? `?${params.toString()}` : ""
        }`
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch clearance requests");
      }
      return json;
    },
  });

  const semesterLabel = data?.semester || "";
  const requests = useMemo(
    () => (Array.isArray(data?.data) ? data.data : []),
    [data]
  );

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await fetch("/api/admin/clearance-request", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to update status");
      }
      return json.data;
    },
    onSuccess: () => {
      toast.success("Status updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["admin-clearance-requests"],
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const handleSearch = () => {
    refetch();
  };

  const handleClearFilters = () => {
    setStudentId("");
    setDepartment("ALL");
    refetch();
  };

  const handleUpdateStatus = (id, status) => {
    updateStatusMutation.mutate({ id, status });
  };

  return (
    <div className="">
      <Card className="dark:bg-slate-800">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-2xl font-bold text-left text-blue-700">
              Clearance Requests
            </CardTitle>
            {semesterLabel && (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Current Semester:{" "}
                <span className="font-semibold">{semesterLabel}</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-semibold">
                Search by Student ID
              </label>
              <Input
                placeholder="Enter Student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <div className="flex-1 flex flex-col gap-2 max-w-xs">
              <label className="text-sm font-semibold">Department</label>
              <Select
                value={department}
                onValueChange={(value) => setDepartment(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="diu" onClick={handleSearch}>
                Search
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                Reset
              </Button>
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
                    Student ID
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Name
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Department
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Batch
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Status
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-6 text-gray-500 dark:text-gray-300"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-6 text-red-500 dark:text-red-400"
                    >
                      Failed to load clearance requests
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-6 text-gray-500 dark:text-gray-300"
                    >
                      No clearance requests found.
                    </td>
                  </tr>
                ) : (
                  requests.map((req, idx) => (
                    <tr
                      key={req._id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <td className="border border-gray-300 px-4 py-2">
                        {idx + 1}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {req.student?.studentId || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {req.student?.name || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {req.student?.department || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {req.student?.batch || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[req.requestStatus] ||
                            statusColors.pending
                          }`}
                        >
                          {req.requestStatus || "pending"}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleUpdateStatus(req._id, "approved")
                            }
                            disabled={
                              updateStatusMutation.isPending ||
                              req.requestStatus === "approved"
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleUpdateStatus(req._id, "rejected")
                            }
                            disabled={
                              updateStatusMutation.isPending ||
                              req.requestStatus === "rejected"
                            }
                            className="text-red-600 hover:text-red-700"
                          >
                            Reject
                          </Button>
                        </div>
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


