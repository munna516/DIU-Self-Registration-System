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
import { Pencil } from "lucide-react";

const departments = ["CSE", "BBA", "EEE", "LAW", "ENG"];
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

const initialSections = [
  { department: "CSE", level: "Level-1-Term-1", count: 5 },
  { department: "EEE", level: "Level-2-Term-2", count: 3 },
  { department: "BBA", level: "Level-3-Term-1", count: 2 },
  { department: "ENG", level: "Level-4-Term-2", count: 4 },
];

export default function CreateSection() {
  const [search, setSearch] = useState("");
  const [sections, setSections] = useState(initialSections);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    department: departments[0],
    level: levels[0],
    count: 1,
  });
  const [editIndex, setEditIndex] = useState(null);

  const filteredSections = sections.filter((section) =>
    section.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!form.department || !form.level || !form.count) return;
    if (editIndex !== null) {
      // Edit mode
      const updated = [...sections];
      updated[editIndex] = {
        department: form.department,
        level: form.level,
        count: Number(form.count),
      };
      setSections(updated);
    } else {
      // Add mode
      setSections([
        ...sections,
        {
          department: form.department,
          level: form.level,
          count: Number(form.count),
        },
      ]);
    }
    setDialogOpen(false);
    setForm({ department: departments[0], level: levels[0], count: 1 });
    setEditIndex(null);
  };

  const handleEdit = (idx) => {
    const s = filteredSections[idx];
    // Find the index in the original sections array
    const realIdx = sections.findIndex(
      (section) =>
        section.department === s.department &&
        section.level === s.level &&
        section.count === s.count
    );
    setForm({
      department: s.department,
      level: s.level,
      count: s.count,
    });
    setEditIndex(realIdx);
    setDialogOpen(true);
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
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setEditIndex(null);
                setForm({ department: departments[0], level: levels[0], count: 1 });
              }
            }}>
              <DialogTrigger asChild>
                <Button variant="diu" className="w-full md:w-auto" onClick={() => { setEditIndex(null); setForm({ department: departments[0], level: levels[0], count: 1 }); }}>Create Section</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editIndex !== null ? "Edit Section" : "Create Section"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
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
                    <Input
                      placeholder="Count"
                      type="number"
                      min={1}
                      max={30}
                      value={form.count}
                      onChange={(e) => handleFormChange("count", Math.max(1, Math.min(30, Number(e.target.value))))}
                    />
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button variant="diu" className="w-full" onClick={handleSave}>
                    {editIndex !== null ? "Update Section" : "Save Section"}
                  </Button>
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
                {filteredSections.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500 dark:text-gray-300">
                      No sections found.
                    </td>
                  </tr>
                ) : (
                  filteredSections.map((section, idx) => (
                    <tr key={section.department + section.level}>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{idx + 1}</td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{section.department}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{section.level}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{section.count}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(idx)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
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
