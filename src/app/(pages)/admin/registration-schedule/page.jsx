"use client";
import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Calendar, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const departments = [
  {
    value: "CSE",
    label: "Computer Science & Engineering",
  },
  {
    value: "SWE",
    label: "Software Engineering",
  },
  {
    value: "CIS",
    label: "Computing and Information System",
  },
  {
    value: "EEE",
    label: "Electrical & Electronic Engineering",
  },
  {
    value: "CE",
    label: "Civil Engineering",
  },
  {
    value: "TE",
    label: "Textile Engineering",
  },
  {
    value: "ARC",
    label: "Architecture",
  },
  {
    value: "ICE",
    label: "Information and Communication Engineering",
  },
  {
    value: "LAW",
    label: "Law",
  },
  {
    value: "ENG",
    label: "English",
  },
  {
    value: "JMC",
    label: "Journalism and Mass Communication",
  },
  {
    value: "BBA",
    label: "Business Administration",
  },
  {
    value: "THM",
    label: "Tourism and Hospitality Management",
  },
  {
    value: "IE",
    label: "Innovation and Entrepreneurship",
  },
  {
    value: "PH",
    label: "Pharmacy",
  },
  {
    value: "NFE",
    label: "Nutrition and Food Engineering",
  },
  {
    value: "GEB",
    label: "Genetic Engineering and Biotechnology",
  },
];

// Helper function to format date for input
const formatDateForInput = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper function to format date for display
const formatDateForDisplay = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Helper function to format time for display
const formatTimeForDisplay = (time) => {
  if (!time) return "N/A";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export default function RegistrationSchedule() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    department: departments[0].value,
    isEnabled: false,
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
  });
  const [editScheduleId, setEditScheduleId] = useState(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["registration-schedules"],
    queryFn: async () => {
      const res = await fetch("/api/admin/registration-schedule");
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to fetch");
      return json.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/admin/registration-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to add schedule");
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration-schedules"] });
      toast.success("Registration schedule added");
    },
    onError: (e) => toast.error(e.message || "Failed to add"),
  });

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/admin/registration-schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to update schedule");
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration-schedules"] });
      toast.success("Registration schedule updated");
    },
    onError: (e) => toast.error(e.message || "Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch("/api/admin/registration-schedule", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to delete schedule");
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration-schedules"] });
      toast.success("Registration schedule deleted");
    },
    onError: (e) => toast.error(e.message || "Delete failed"),
  });

  const filteredSchedules = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const q = search.toLowerCase();
    return list.filter((schedule) => {
      const dept = (schedule.department || "").toLowerCase();
      const deptLabel =
        departments.find((d) => d.value === schedule.department)?.label || "";
      return (
        dept.includes(q) || deptLabel.toLowerCase().includes(q)
      );
    });
  }, [data, search]);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.department) return "Department is required";

    if (form.isEnabled) {
      if (!form.startDate) return "Start date is required when enabled";
      if (!form.endDate) return "End date is required when enabled";
      if (!form.startTime) return "Start time is required when enabled";
      if (!form.endTime) return "End time is required when enabled";

      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      if (start >= end) return "End date must be after start date";

      // Validate time format
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(form.startTime))
        return "Start time must be in HH:MM format (24-hour)";
      if (!timeRegex.test(form.endTime))
        return "End time must be in HH:MM format (24-hour)";

      // Validate time range if same day
      if (form.startDate === form.endDate && form.startTime >= form.endTime) {
        return "End time must be after start time on the same day";
      }
    }

    return null;
  };

  const handleSave = async () => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    const payload = {
      department: form.department,
      isEnabled: form.isEnabled,
    };

    if (form.isEnabled) {
      payload.startDate = form.startDate;
      payload.endDate = form.endDate;
      payload.startTime = form.startTime;
      payload.endTime = form.endTime;
    }

    if (editScheduleId) {
      await updateMutation.mutateAsync({ id: editScheduleId, ...payload });
    } else {
      await addMutation.mutateAsync(payload);
    }

    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      department: departments[0].value,
      isEnabled: false,
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
    });
    setEditScheduleId(null);
  };

  const handleEdit = (idx) => {
    const s = filteredSchedules[idx];
    setForm({
      department: s.department || departments[0].value,
      isEnabled: s.isEnabled || false,
      startDate: formatDateForInput(s.startDate),
      endDate: formatDateForInput(s.endDate),
      startTime: s.startTime || "",
      endTime: s.endTime || "",
    });
    setEditScheduleId(s._id || null);
    setDialogOpen(true);
  };

  const handleDelete = async (idx) => {
    const s = filteredSchedules[idx];
    if (!s?._id) return;
    Swal.fire({
      title: "Are you sure to delete this schedule?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) await deleteMutation.mutateAsync(s._id);
    });
  };

  const getDepartmentLabel = (deptValue) => {
    return departments.find((d) => d.value === deptValue)?.label || deptValue;
  };

  return (
    <div className="">
      <Card className="p-6 dark:bg-gray-800">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="text-2xl text-blue-700 font-bold w-full md:w-auto text-left">
            Registration Schedule
          </CardTitle>
          <div className="w-full md:w-1/2 flex justify-center">
            <Input
              type="text"
              placeholder="Search by department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-blue-300 dark:border-gray-700"
            />
          </div>
          <div className="w-full md:w-auto flex justify-end">
            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) {
                  resetForm();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="diu"
                  className="w-full md:w-auto"
                  onClick={() => {
                    resetForm();
                  }}
                >
                  <Calendar className="w-4 h-4 mr-2" /> Add Schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-blue-700 text-center text-xl">
                    {editScheduleId !== null
                      ? "Edit Registration Schedule"
                      : "Add New Registration Schedule"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  {/* Department */}
                  <div>
                    <Label className="text-xs">
                      Department <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={form.department}
                      onValueChange={(v) => handleFormChange("department", v)}
                      disabled={editScheduleId !== null}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d.value} value={d.value}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Enable/Disable Toggle */}
                  <div className="flex items-center gap-3 p-3 border rounded-md">
                    <input
                      type="checkbox"
                      id="isEnabled"
                      checked={form.isEnabled}
                      onChange={(e) =>
                        handleFormChange("isEnabled", e.target.checked)
                      }
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label
                      htmlFor="isEnabled"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Enable Registration
                    </Label>
                  </div>

                  {/* Date and Time Fields - Only shown when enabled */}
                  {form.isEnabled && (
                    <>
                      {/* Start Date */}
                      <div>
                        <Label className="text-xs">
                          Start Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="date"
                          value={form.startDate}
                          onChange={(e) =>
                            handleFormChange("startDate", e.target.value)
                          }
                        />
                      </div>

                      {/* End Date */}
                      <div>
                        <Label className="text-xs">
                          End Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="date"
                          value={form.endDate}
                          onChange={(e) =>
                            handleFormChange("endDate", e.target.value)
                          }
                          min={form.startDate || undefined}
                        />
                      </div>

                      {/* Start Time */}
                      <div>
                        <Label className="text-xs">
                          Opening Time <span className="text-red-500">*</span>
                          <span className="text-gray-500 text-xs ml-2">
                            (24-hour format: HH:MM)
                          </span>
                        </Label>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <Input
                            type="time"
                            value={form.startTime}
                            onChange={(e) =>
                              handleFormChange("startTime", e.target.value)
                            }
                            placeholder="09:00"
                          />
                        </div>
                      </div>

                      {/* End Time */}
                      <div>
                        <Label className="text-xs">
                          Closing Time <span className="text-red-500">*</span>
                          <span className="text-gray-500 text-xs ml-2">
                            (24-hour format: HH:MM)
                          </span>
                        </Label>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <Input
                            type="time"
                            value={form.endTime}
                            onChange={(e) =>
                              handleFormChange("endTime", e.target.value)
                            }
                            placeholder="17:00"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter className="mt-4 flex flex-col gap-2">
                  <div className="flex w-full gap-2">
                    {editScheduleId !== null && (
                      <Button
                        variant="destructive"
                        className="w-1/2"
                        onClick={() => {
                          const idx = filteredSchedules.findIndex(
                            (s) => s._id === editScheduleId
                          );
                          if (idx > -1) handleDelete(idx);
                          setDialogOpen(false);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </Button>
                    )}
                    <Button
                      variant="diu"
                      className="w-full"
                      onClick={handleSave}
                    >
                      {editScheduleId !== null
                        ? "Update Schedule"
                        : "Save Schedule"}
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 mt-3">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                    SL
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Department
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Start Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                    End Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Opening Time
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Closing Time
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-6 text-center text-gray-500 dark:text-gray-300"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-6 text-center text-red-500"
                    >
                      Failed to load schedules
                    </td>
                  </tr>
                ) : filteredSchedules.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-6 text-center text-gray-500 dark:text-gray-300"
                    >
                      No registration schedule added.
                    </td>
                  </tr>
                ) : (
                  filteredSchedules.map((schedule, idx) => (
                    <tr key={schedule._id || schedule.department}>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                        {getDepartmentLabel(schedule.department)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${schedule.isEnabled
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                        >
                          {schedule.isEnabled ? "ON" : "OFF"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        {schedule.isEnabled
                          ? formatDateForDisplay(schedule.startDate)
                          : "N/A"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        {schedule.isEnabled
                          ? formatDateForDisplay(schedule.endDate)
                          : "N/A"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        {schedule.isEnabled
                          ? formatTimeForDisplay(schedule.startTime)
                          : "N/A"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        {schedule.isEnabled
                          ? formatTimeForDisplay(schedule.endTime)
                          : "N/A"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(idx)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(idx)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
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
