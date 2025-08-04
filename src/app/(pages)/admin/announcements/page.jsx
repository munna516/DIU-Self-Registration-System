"use client";
import React, { useState } from "react";
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

// Sample departments
const departments = [
  "All Departments",
  "Computer Science & Engineering",
  "Software Engineering",
  "Computing and Information System",
  "Multimedia and Creative Technology",
  "Information Technology and Management",
  "Physical Education and Sports Science",
  "Environmental Science and Disaster Management",
  "Electrical & Electronic Engineering",
  "Civil Engineering",
  "Textile Engineering",
  "Architecture",
  "Information and Communication Engineering",
  "Law",
  "English",
  "Journalism and Mass Communication",
  "Development Studies",
  "Information Science and Library Management",
  "Business Administration",
  "Management",
  "Real Estate",
  "Accounting",
  "Finance and Banking",
  "Marketing",
  "Tourism and Hospitality Management",
  "Innovation and Entrepreneurship",
  "Pharmacy",
  "Public Health",
  "Nutrition and Food Engineering",
  "Agricultural Science",
  "Genetic Engineering and Biotechnology",
];

// Sample announcements data
const initialAnnouncements = [
  {
    id: 1,
    title: "Mid-term Examination Schedule",
    message:
      "The mid-term examinations will be held from 15th to 20th December 2024. All students are requested to check their examination schedule.",
    department: "Computer Science & Engineering",
    postDate: "2024-12-01",
  },
  {
    id: 2,
    title: "Holiday Notice",
    message:
      "The university will remain closed on 16th December 2024 for Victory Day. Classes will resume on 17th December.",
    department: "All Departments",
    postDate: "2024-12-10",
  },
  {
    id: 3,
    title: "Lab Equipment Maintenance",
    message:
      "The computer lab will be closed for maintenance on 18th December 2024. Alternative arrangements will be made for practical classes.",
    department: "Computer Science & Engineering",
    postDate: "2024-12-12",
  },
];

export default function Announcement() {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    department: "",
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

  const handleAdd = () => {
    if (!formData.title || !formData.message || !formData.department) {
      toast.error("Please fill in all fields");
      return;
    }

    const newAnnouncement = {
      id: Date.now(),
      title: formData.title,
      message: formData.message,
      department: formData.department,
      postDate: new Date().toISOString().split("T")[0],
    };

    setAnnouncements((prev) => [newAnnouncement, ...prev]);
    resetForm();
    setIsAddDialogOpen(false);
    toast.success("Announcement added successfully!");
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      department: announcement.department,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!formData.title || !formData.message || !formData.department) {
      toast.error("Please fill in all fields");
      return;
    }

    setAnnouncements((prev) =>
      prev.map((announcement) =>
        announcement.id === editingAnnouncement.id
          ? {
              ...announcement,
              title: formData.title,
              message: formData.message,
              department: formData.department,
            }
          : announcement
      )
    );

    resetForm();
    setEditingAnnouncement(null);
    setIsEditDialogOpen(false);
    toast.success("Announcement updated successfully!");
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      setAnnouncements((prev) =>
        prev.filter((announcement) => announcement.id !== id)
      );
      toast.success("Announcement deleted successfully!");
    }
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
            <CardTitle className="text-2xl font-bold text-left text-blue-500">
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
                <DialogHeader>
                  <DialogTitle>Add New Announcement</DialogTitle>
                  <DialogDescription>
                    Create a new announcement for the selected department.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
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
                    <Label htmlFor="message">Message</Label>
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
                    <Label htmlFor="department">Department</Label>
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
                        {departments.slice(1).map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
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
                {announcements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-500">
                      No announcements found.
                    </td>
                  </tr>
                ) : (
                  announcements.map((announcement, idx) => (
                    <tr
                      key={announcement.id}
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
                        {announcement.department}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {announcement.postDate}
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
                            onClick={() => handleDelete(announcement.id)}
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
                  {departments.slice(1).map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
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
