"use client";
import React, { useState, useEffect } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const semesters = ["Fall", "Spring", "Summer"];

export default function Settings() {
  const [semester, setSemester] = useState("");
  const [year, setYear] = useState("");
  const [evalutionIsOpen, setEvalutionIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Fetch current semester
  const { data, isLoading: isFetching } = useQuery({
    queryKey: ["semester"],
    queryFn: async () => {
      const res = await fetch("/api/admin/semester");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch semester");
      }
      return json.data;
    },
  });

  // Set form values when data is loaded
  useEffect(() => {
    if (data) {
      setSemester(data.semester || "");
      setYear(data.year?.toString() || "");
      setEvalutionIsOpen(data.evalutionIsOpen || false);
    } else {
      // Set current year as default if no semester exists
      const currentYear = new Date().getFullYear();
      setYear(currentYear.toString());
      setEvalutionIsOpen(false);
    }
  }, [data]);

  // Mutation for creating/updating semester
  const mutation = useMutation({
    mutationFn: async (formData) => {
      const res = await fetch("/api/admin/semester", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to save semester");
      }
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semester"] });
      toast.success("Semester updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save semester");
    },
  });

  // Separate mutation for evaluation toggle
  const evaluationMutation = useMutation({
    mutationFn: async (evalutionIsOpen) => {
      const res = await fetch("/api/admin/semester", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ evalutionIsOpen }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to update evaluation status");
      }
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semester"] });
      toast.success("Evaluation status updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update evaluation status");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!semester || !year) {
      toast.error("Please select semester and enter year");
      return;
    }

    setIsLoading(true);
    try {
      // Update semester and year only (preserve evaluation status)
      await mutation.mutateAsync({ 
        semester, 
        year: parseInt(year)
      });
    } catch (error) {
      // Error is handled in mutation onError
    } finally {
      setIsLoading(false);
    }
  };

  // Handle evaluation toggle change - update immediately
  const handleEvaluationToggle = async (checked) => {
    setEvalutionIsOpen(checked);
    try {
      await evaluationMutation.mutateAsync(checked);
    } catch (error) {
      // Revert on error
      setEvalutionIsOpen(!checked);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Semester Settings Section */}
      <Card className="p-6 dark:bg-slate-800">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold">Semester Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">
                  Select Semester
                </Label>
                <Select value={semester} onValueChange={setSemester} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Semester (Fall/Spring/Summer)" />
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

              <div>
                <Label className="text-sm font-semibold mb-2 block">
                  Year
                </Label>
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g., 2025"
                  min="2020"
                  max="2100"
                  required
                  className="w-full dark:border dark:border-gray-300"
                />
              </div>

              {/* Current Semester Status - Before Update Button */}
              {data && (
                <div className="p-4 bg-green-50 dark:bg-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-sm text-green-700 dark:text-green-400">
                    <strong>Current Semester:</strong> {data.semester} {data.year}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="submit"
                variant="diu"
                disabled={isLoading || !semester || !year}
                className="min-w-[120px]"
              >
                {isLoading ? "Saving..." : data ? "Update Semester" : "Set Semester"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Evaluation Settings Section */}
      <Card className="p-6 dark:bg-slate-800">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold">Evaluation Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              {/* Enable Evaluation Toggle */}
              <div className="flex items-center gap-3 p-4 border rounded-md dark:border-gray-700">
                <input
                  type="checkbox"
                  id="evalutionIsOpen"
                  checked={evalutionIsOpen}
                  onChange={(e) => setEvalutionIsOpen(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <Label
                  htmlFor="evalutionIsOpen"
                  className="text-sm font-semibold cursor-pointer"
                >
                  Enable Evaluation
                </Label>
              </div>

              {/* Evaluation Status - Before Update Button */}
              {data && (
                <div className="p-4 bg-green-50 dark:bg-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-sm text-green-700 dark:text-green-400">
                    <strong>Status:</strong> {data.evalutionIsOpen ? "Enabled" : "Disabled"}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="diu"
                onClick={() => handleEvaluationToggle(evalutionIsOpen)}
                disabled={evaluationMutation.isPending}
                className="min-w-[120px]"
              >
                {evaluationMutation.isPending ? "Updating..." : "Update Evaluation"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
