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
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2 } from "lucide-react";
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

const levels = [
  "Level-1-Term-1",
  "Level-1-Term-2",
  "Level-2-Term-1",
  "Level-2-Term-2",
  "Level-3-Term-1",
  "Level-3-Term-2",
  "Level-4-Term-1",
  "Level-4-Term-2",
];

export default function CreateSection() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    department: departments[0].value,
    level: levels[0],
    count: 1,
  });
  const [editSectionId, setEditSectionId] = useState(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["sections"],
    queryFn: async () => {
      const res = await fetch("/api/admin/section");
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to fetch");
      return json.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/admin/section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to add section");
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      toast.success("Section created successfully");
    },
    onError: (e) => toast.error(e.message || "Failed to create section"),
  });

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/admin/section", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to update section");
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      toast.success("Section updated successfully");
    },
    onError: (e) => toast.error(e.message || "Failed to update section"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch("/api/admin/section", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to delete section");
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      toast.success("Section deleted successfully");
    },
    onError: (e) => toast.error(e.message || "Failed to delete section"),
  });

  const filteredSections = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const q = search.toLowerCase();
    return list.filter((section) => {
      const dept = (section.department || "").toLowerCase();
      const deptLabel =
        departments.find((d) => d.value === section.department)?.label || "";
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
    if (!form.level) return "Level is required";
    if (!form.count || form.count < 1 || form.count > 30)
      return "Count must be between 1 and 30";
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
      level: form.level,
      count: Number(form.count),
    };

    if (editSectionId) {
      await updateMutation.mutateAsync({ id: editSectionId, ...payload });
    } else {
      await addMutation.mutateAsync(payload);
    }

    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      department: departments[0].value,
      level: levels[0],
      count: 1,
    });
    setEditSectionId(null);
  };

  const handleEdit = (idx) => {
    const s = filteredSections[idx];
    setForm({
      department: s.department || departments[0].value,
      level: s.level || levels[0],
      count: s.count || 1,
    });
    setEditSectionId(s._id || null);
    setDialogOpen(true);
  };

  const handleDelete = async (idx) => {
    const s = filteredSections[idx];
    if (!s?._id) return;
    Swal.fire({
      title: "Are you sure to delete this section?",
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
          <CardTitle className="text-xl font-bold w-full md:w-auto text-left">Create Section</CardTitle>
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
                  Create Section
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-blue-700 text-center text-xl">
                    {editSectionId !== null
                      ? "Edit Section"
                      : "Create New Section"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <Select
                      value={form.department}
                      onValueChange={(v) => handleFormChange("department", v)}
                      disabled={editSectionId !== null}
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
                  <div className="flex gap-4">
                    <Select
                      value={form.level}
                      onValueChange={(v) => handleFormChange("level", v)}
                      disabled={editSectionId !== null}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Level" />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map((l) => (
                          <SelectItem key={l} value={l}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Count"
                      type="number"
                      min={1}
                      max={30}
                      value={form.count}
                      onChange={(e) =>
                        handleFormChange(
                          "count",
                          Math.max(1, Math.min(30, Number(e.target.value)))
                        )
                      }
                    />
                  </div>
                </div>
                <DialogFooter className="mt-4 flex flex-col gap-2">
                  <div className="flex w-full gap-2">
                    {editSectionId !== null && (
                      <Button
                        variant="destructive"
                        className="w-1/2"
                        onClick={() => {
                          const idx = filteredSections.findIndex(
                            (s) => s._id === editSectionId
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
                      disabled={
                        addMutation.isPending || updateMutation.isPending
                      }
                    >
                      {editSectionId !== null
                        ? "Update Section"
                        : "Save Section"}
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
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">SL</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">Department</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">Level</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">Count</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-gray-500 dark:text-gray-300"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-red-500"
                    >
                      Failed to load sections
                    </td>
                  </tr>
                ) : filteredSections.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-gray-500 dark:text-gray-300"
                    >
                      No sections found.
                    </td>
                  </tr>
                ) : (
                  filteredSections.map((section, idx) => (
                    <tr key={section._id || section.department + section.level}>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                        {getDepartmentLabel(section.department)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        {section.level}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        {section.count}
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
