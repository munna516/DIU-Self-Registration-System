"use client";
import React, { useState } from "react";
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

const departments = ["CSE", "BBA", "EEE", "LAW", "ENG"];
const categories = ["Theory", "Lab"];
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

const initialCourses = [
  {
    code: "CSE101",
    title: "Introduction to Computer Science",
    credit: 3,
    department: "CSE",
    category: "Theory",
    level: "Level-1-Term-1",
  },
  {
    code: "CSE102",
    title: "Programming Fundamentals",
    credit: 3,
    department: "CSE",
    category: "Lab",
    level: "Level-1-Term-1",
  },
  {
    code: "BBA201",
    title: "Principles of Management",
    credit: 3,
    department: "BBA",
    category: "Theory",
    level: "Level-2-Term-1",
  },
  {
    code: "EEE301",
    title: "Circuit Analysis",
    credit: 3,
    department: "EEE",
    category: "Theory",
    level: "Level-3-Term-1",
  },
  {
    code: "LAW101",
    title: "Introduction to Law",
    credit: 3,
    department: "LAW",
    category: "Theory",
    level: "Level-1-Term-1",
  },
];

export default function Courses() {
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState(initialCourses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    code: "",
    title: "",
    credit: "",
    department: departments[0],
    category: categories[0],
    level: levels[0],
  });
  const [editIndex, setEditIndex] = useState(null);

  const filteredCourses = courses.filter((course) => {
    const q = search.toLowerCase();
    return (
      course.code.toLowerCase().includes(q) ||
      course.title.toLowerCase().includes(q) ||
      course.department.toLowerCase().includes(q)
    );
  });

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!form.code || !form.title || !form.credit) return;
    if (editIndex !== null) {
      // Edit mode
      const updated = [...courses];
      updated[editIndex] = {
        code: form.code,
        title: form.title,
        credit: Number(form.credit),
        department: form.department,
        category: form.category,
        level: form.level,
      };
      setCourses(updated);
    } else {
      // Add mode
      setCourses([
        ...courses,
        {
          code: form.code,
          title: form.title,
          credit: Number(form.credit),
          department: form.department,
          category: form.category,
          level: form.level,
        },
      ]);
    }
    setDialogOpen(false);
    setForm({
      code: "",
      title: "",
      credit: "",
      department: departments[0],
      category: categories[0],
      level: levels[0],
    });
    setEditIndex(null);
  };

  const handleEdit = (idx) => {
    const c = filteredCourses[idx];
    // Find the index in the original courses array
    const realIdx = courses.findIndex(
      (course) =>
        course.code === c.code &&
        course.title === c.title &&
        course.level === c.level
    );
    setForm({
      code: c.code,
      title: c.title,
      credit: c.credit.toString(),
      department: c.department,
      category: c.category,
      level: c.level,
    });
    setEditIndex(realIdx);
    setDialogOpen(true);
  };

  const handleDelete = (idx) => {
    const c = filteredCourses[idx];
    setCourses((prev) =>
      prev.filter(
        (course) =>
          !(
            course.code === c.code &&
            course.title === c.title &&
            course.level === c.level
          )
      )
    );
    // If editing this, close dialog
    if (editIndex !== null && courses[editIndex].code === c.code) {
      setDialogOpen(false);
      setEditIndex(null);
    }
  };

  return (
    <div className="">
      <Card className="p-6 dark:bg-gray-800">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="text-xl font-bold w-full md:w-auto text-left">Courses</CardTitle>
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
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setEditIndex(null);
                setForm({
                  code: "",
                  title: "",
                  credit: "",
                  department: departments[0],
                  category: categories[0],
                  level: levels[0],
                });
              }
            }}>
              <DialogTrigger asChild>
                <Button variant="diu" className="w-full md:w-auto" onClick={() => { setEditIndex(null); setForm({ code: "", title: "", credit: "", department: departments[0], category: categories[0], level: levels[0] }); }}>Add Course</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editIndex !== null ? "Edit Course" : "Add New Course"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <Input
                      placeholder="Course Code"
                      value={form.code}
                      onChange={(e) => handleFormChange("code", e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Course Title"
                      value={form.title}
                      onChange={(e) => handleFormChange("title", e.target.value)}
                    />
                  </div>
                  <div className="flex gap-4">
                    <Input
                      placeholder="Credit"
                      type="number"
                      min={1}
                      value={form.credit}
                      onChange={(e) => handleFormChange("credit", e.target.value)}
                    />
                    <Select
                      value={form.department}
                      onValueChange={(v) => handleFormChange("department", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-4">
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
                    <Select
                      value={form.level}
                      onValueChange={(v) => handleFormChange("level", v)}
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
                  </div>
                </div>
                <DialogFooter className="mt-4 flex flex-col gap-2">
                  <div className="flex w-full gap-2">
                    {editIndex !== null && (
                      <Button variant="destructive" className="w-1/2" onClick={() => { handleDelete(editIndex); setDialogOpen(false); }}>
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </Button>
                    )}
                    <Button variant="diu" className="w-full" onClick={handleSave}>
                      {editIndex !== null ? "Update Course" : "Save Course"}
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
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">Course Title</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">Course Code</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">Department</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">Credit</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">Category</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">Level</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-gray-500 dark:text-gray-300">
                      No courses found.
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((course, idx) => (
                    <tr key={course.code + course.level}>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{idx + 1}</td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{course.title}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{course.code}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{course.department}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{course.credit}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{course.category}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{course.level}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(idx)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(idx)}>
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
