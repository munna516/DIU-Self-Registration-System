"use client";
import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";

// Sample departments
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

const departmentLabelByValue = Object.fromEntries(
  departments.map((d) => [d.value, d.label])
);

export default function Announcement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    department: "",
  });
  const [editId, setEditId] = useState(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const res = await fetch("/api/admin/announcement");
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to fetch");
      return json.data;
    },
  });

  const list = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const addMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/admin/announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to add");
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement added");
    },
    onError: (e) => toast.error(e.message || "Failed to add"),
  });

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/admin/announcement", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to update");
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement updated");
    },
    onError: (e) => toast.error(e.message || "Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch("/api/admin/announcement", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to delete");
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement deleted");
    },
    onError: (e) => toast.error(e.message || "Failed to delete"),
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      department: "",
    });
  };

  const validate = () => {
    if (!formData.title.trim()) return "Title is required";
    if (!formData.message.trim()) return "Message is required";
    if (!departments.some((d) => d.value === formData.department))
      return "Invalid department";
    return null;
  };

  const handleAdd = async () => {
    const error = validate();
    if (error) return toast.error(error);
    await addMutation.mutateAsync({
      title: formData.title.trim(),
      message: formData.message.trim(),
      department: formData.department,
    });
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title,
      message: announcement.message,
      department: announcement.department,
    });
    setEditId(announcement._id);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    const error = validate();
    if (error) return toast.error(error);
    await updateMutation.mutateAsync({
      id: editId,
      title: formData.title.trim(),
      message: formData.message.trim(),
      department: formData.department,
    });
    resetForm();
    setEditId(null);
    setIsEditDialogOpen(false);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete this announcement?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) await deleteMutation.mutateAsync(id);
    });
  };

  const handleCancel = () => {
    resetForm();
    setEditingAnnouncement(null);
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  return (
    <div className="">
      <Card className="dark:bg-slate-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-left text-blue-700">
              Announcements
            </CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="diu" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader className="">
                  <DialogTitle className="text-blue-700 text-xl text-center">
                    Add New Announcement
                  </DialogTitle>
                  <DialogDescription className="text-center">
                    Create a new announcement for the selected department.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Enter announcement title"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">
                      Message <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Enter announcement message"
                      value={formData.message}
                      onChange={(e) =>
                        handleInputChange("message", e.target.value)
                      }
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">
                      Department <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) =>
                        handleInputChange("department", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
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
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleAdd}>Submit</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                    Title
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Message
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Department
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Post Date
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-red-500">
                      Failed to load announcements
                    </td>
                  </tr>
                ) : list.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-500">
                      No announcements found.
                    </td>
                  </tr>
                ) : (
                  list.map((announcement, idx) => (
                    <tr
                      key={announcement._id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <td className="border border-gray-300 px-4 py-2">
                        {idx + 1}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {announcement.title}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 max-w-xs">
                        <div className="truncate" title={announcement.message}>
                          {announcement.message}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {departmentLabelByValue[announcement.department] ||
                          announcement.department}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {
                          new Date(announcement.postDate)
                            .toISOString()
                            .split("T")[0]
                        }
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(announcement)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(announcement._id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
            <DialogDescription>
              Update the announcement information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="Enter announcement title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-message">Message</Label>
              <Textarea
                id="edit-message"
                placeholder="Enter announcement message"
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  handleInputChange("department", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
