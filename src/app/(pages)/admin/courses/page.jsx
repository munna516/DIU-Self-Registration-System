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
import { Pencil, Trash2 } from "lucide-react";
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
const categories = ["Theory", "Lab"];
const levels = [
  {
    value: "L1T1",
    label: "Level-1-Term-1",
  },
  {
    value: "L1T2",
    label: "Level-1-Term-2",
  },
  {
    value: "L1T3",
    label: "Level-1-Term-3",
  },
  {
    value: "L2T1",
    label: "Level-2-Term-1",
  },
  {
    value: "L2T2",
    label: "Level-2-Term-2",
  },
  {
    value: "L2T3",
    label: "Level-2-Term-3",
  },
  {
    value: "L3T1",
    label: "Level-3-Term-1",
  },
  {
    value: "L3T2",
    label: "Level-3-Term-2",
  },
  {
    value: "L3T3",
    label: "Level-3-Term-3",
  },
  {
    value: "L4T1",
    label: "Level-4-Term-1",
  },
  {
    value: "L4T2",
    label: "Level-4-Term-2",
  },
  {
    value: "L4T3",
    label: "Level-4-Term-3",
  },
];

// Helper maps
const levelLabelByValue = Object.fromEntries(
  levels.map((l) => [l.value, l.label])
);

export default function Courses() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: "",
    title: "",
    credit: "",
    department: departments[0].value, // string like "CSE"
    category: categories[0], // "Theory" | "Lab"
    level: levels[0].value, // string like "L1T1"
    prerequisite: "",
  });
  const [editCourseId, setEditCourseId] = useState(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await fetch("/api/admin/add-course");
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to fetch");
      return json.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (payload) => {
      setLoading(true);
      const res = await fetch("/api/admin/add-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to add course");
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course added");
      setLoading(false);
    },
    onError: (e) => toast.error(e.message || "Failed to add"),
  });

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      setLoading(true);
      const res = await fetch("/api/admin/add-course", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to update course");
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course updated");
      setLoading(false);
    },
    onError: (e) => toast.error(e.message || "Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      setLoading(true);
      const res = await fetch("/api/admin/add-course", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to delete course");
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course deleted");
      setLoading(false);
    },
    onError: (e) => toast.error(e.message || "Delete failed"),
  });

  const filteredCourses = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const q = search.toLowerCase();
    return list.filter((course) => {
      const code = (course.courseCode || "").toLowerCase();
      const title = (course.courseTitle || "").toLowerCase();
      const dept = (course.department || "").toLowerCase();
      return code.includes(q) || title.includes(q) || dept.includes(q);
    });
  }, [data, search]);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.code.trim()) return "Course Code is required";
    if (!form.title.trim()) return "Course Title is required";
    const creditNum = Number(form.credit);
    if (Number.isNaN(creditNum)) return "Credit must be a number";
    if (creditNum < 1 || creditNum > 3) return "Credit must be between 1 and 3";
    if (!departments.some((d) => d.value === form.department))
      return "Invalid department";
    if (!levels.some((l) => l.value === form.level)) return "Invalid level";
    if (!categories.includes(form.category)) return "Invalid category";
    return null;
  };

  const handleSave = async () => {

    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    const payload = {
      courseCode: form.code.trim(),
      courseTitle: form.title.trim(),
      department: form.department,
      level: form.level,
      courseType: form.category,
      credit: Number(form.credit),
      prerequisite: form.prerequisite.trim(),
    };

    if (editCourseId) {
      await updateMutation.mutateAsync({ id: editCourseId, ...payload });
    } else {
      await addMutation.mutateAsync(payload);
    }

    setDialogOpen(false);
    setForm({
      code: "",
      title: "",
      credit: "",
      department: departments[0].value,
      category: categories[0],
      level: levels[0].value,
      prerequisite: "",
    });
    setEditCourseId(null);

  };

  const handleEdit = (idx) => {
    const c = filteredCourses[idx];
    setForm({
      code: c.courseCode || "",
      title: c.courseTitle || "",
      credit: String(c.credit ?? ""),
      department: c.department || departments[0].value,
      category: c.courseType || categories[0],
      level: c.level || levels[0].value,
      prerequisite:
        Array.isArray(c.prerequisite) && c.prerequisite.length > 0
          ? c.prerequisite[0]
          : "",
    });
    setEditCourseId(c._id || null);
    setDialogOpen(true);
  };

  const handleDelete = async (idx) => {
    const c = filteredCourses[idx];
    if (!c?._id) return;
    Swal.fire({
      title: "Are you sure to delete this course?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) await deleteMutation.mutateAsync(c._id);
    });
  };

  return (
    <div className="">
      <Card className="p-6 dark:bg-gray-800">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="text-2xl text-blue-700 font-bold w-full md:w-auto text-left">
            Courses
          </CardTitle>
          <div className="w-full md:w-1/2 flex justify-center">
            <Input
              type="text"
              placeholder="Search by code, title, department..."
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
                  setEditCourseId(null);
                  setForm({
                    code: "",
                    title: "",
                    credit: "",
                    department: departments[0].value,
                    category: categories[0],
                    level: levels[0].value,
                    prerequisite: "",
                  });
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="diu"
                  className="w-full md:w-auto"
                  onClick={() => {
                    setEditCourseId(null);
                    setForm({
                      code: "",
                      title: "",
                      credit: "",
                      department: departments[0].value,
                      category: categories[0],
                      level: levels[0].value,
                      prerequisite: "",
                    });
                  }}
                >
                  Add Course
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-blue-700 text-center text-xl">
                    {editCourseId !== null ? "Edit Course" : "Add New Course"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  {/* Row 1: Course Code */}
                  <div>
                    <Label className="text-xs">
                      Course Code <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Course Code"
                      value={form.code}
                      onChange={(e) => handleFormChange("code", e.target.value)}
                    />
                  </div>
                  {/* Row 2: Course Title */}
                  <div>
                    <Label className="text-xs">
                      Course Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Course Title"
                      value={form.title}
                      onChange={(e) =>
                        handleFormChange("title", e.target.value)
                      }
                    />
                  </div>
                  {/* Row 3: Department */}
                  <div>
                    <Label className="text-xs">
                      Department <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={form.department}
                      onValueChange={(v) => handleFormChange("department", v)}
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
                  {/* Row 4: Credit and Category */}
                  <div className="flex gap-4">
                    <div className="w-full">
                      <Label className="text-xs">
                        Credit <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="Credit"
                        type="number"
                        min={1}
                        max={3}
                        value={form.credit}
                        onChange={(e) =>
                          handleFormChange("credit", e.target.value)
                        }
                      />
                    </div>
                    <div className="w-full">
                      <Label className="text-xs">
                        Category <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={form.category}
                        onValueChange={(v) => handleFormChange("category", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* Row 5: Level and Pre-requisite Course Code */}
                  <div className="flex gap-4">
                    <div className="w-full">
                      <Label className="text-xs">
                        Level <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={form.level}
                        onValueChange={(v) => handleFormChange("level", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Level" />
                        </SelectTrigger>
                        <SelectContent>
                          {levels.map((l) => (
                            <SelectItem key={l.value} value={l.value}>
                              {l.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full">
                      <Label className="text-xs">
                        Pre-requisite Course Code
                      </Label>
                      <Input
                        placeholder="e.g., CSE102"
                        value={form.prerequisite}
                        onChange={(e) =>
                          handleFormChange("prerequisite", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter className="mt-4 flex flex-col gap-2">
                  <div className="flex w-full gap-2">
                    {editCourseId !== null && (
                      <Button
                        variant="destructive"
                        className="w-1/2"
                        disabled={loading}
                        onClick={() => {
                          const idx = filteredCourses.findIndex(
                            (c) => c._id === editCourseId
                          );
                          if (idx > -1) handleDelete(idx);
                          setDialogOpen(false);
                        }}
                      >
                        {loading ? "Deleting..." : <Trash2 className="w-4 h-4 mr-2" />} Delete
                      </Button>
                    )}
                    <Button
                      variant="diu"
                      className="w-full"
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : editCourseId !== null ? "Update Course" : "Save Course"}
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
                    Course Title
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Course Code
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Department
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Credit
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Category
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Level
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
                      Failed to load courses
                    </td>
                  </tr>
                ) : filteredCourses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-6 text-center text-gray-500 dark:text-gray-300"
                    >
                      No course added.
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((course, idx) => (
                    <tr key={course._id || course.courseCode + course.level}>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                        {course.courseTitle}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        {course.courseCode}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        {course.department}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        {course.credit}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        {course.courseType}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        {levelLabelByValue[course.level] || course.level}
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
