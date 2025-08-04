"use client";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User,
  Mail,
  IdCard,
  Building,
  Shield,
  Eye,
  EyeOff,
  Crown,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Profile() {
  const session = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!passwordData.oldPassword) {
      newErrors.oldPassword = "Old password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Here you would typically make an API call to change the password
      console.log("Password change request:", passwordData);

      // Reset form
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
      setIsDialogOpen(false);

      // You can add a success message here
      toast.success("Password changed successfully!");
    }
  };

  const handleCancel = () => {
    setPasswordData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
    setIsDialogOpen(false);
  };

  return (
    <div className="mb-20">
      <Card className="dark:bg-slate-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Admin Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Information */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <div>
                <Label className="text-sm text-gray-500 dark:text-gray-400">
                  Name
                </Label>
                <p className="font-medium">
                  {session?.data?.user?.name || "Not available"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <div>
                <Label className="text-sm text-gray-500 dark:text-gray-400">
                  Email
                </Label>
                <p className="font-medium">
                  {session?.data?.user?.email || "Not available"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <IdCard className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <div>
                <Label className="text-sm text-gray-500 dark:text-gray-400">
                  Admin ID
                </Label>
                <p className="font-medium">
                  {session?.data?.user?.adminId || "Not available"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <Building className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <div>
                <Label className="text-sm text-gray-500 dark:text-gray-400">
                  Department
                </Label>
                <p className="font-medium">
                  {session?.data?.user?.department || "Not available"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <Crown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <div>
                <Label className="text-sm text-gray-500 dark:text-gray-400">
                  Position
                </Label>
                <p className="font-medium">
                  {session?.data?.user?.position || "Administrator"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <div>
                <Label className="text-sm text-gray-500 dark:text-gray-400">
                  Role
                </Label>
                <p className="font-medium capitalize">
                  {session?.data?.user?.role || "Admin"}
                </p>
              </div>
            </div>
          </div>

          {/* Change Password Button */}
          <div className="pt-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="diu" className="w-full">
                  <Shield className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and choose a new password.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Old Password */}
                  <div className="space-y-2">
                    <Label htmlFor="oldPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="oldPassword"
                        type={showOldPassword ? "text" : "password"}
                        placeholder="Enter current password"
                        value={passwordData.oldPassword}
                        onChange={(e) =>
                          handlePasswordChange("oldPassword", e.target.value)
                        }
                        className={errors.oldPassword ? "border-red-500" : ""}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                      >
                        {showOldPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.oldPassword && (
                      <p className="text-sm text-red-500">
                        {errors.oldPassword}
                      </p>
                    )}
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          handlePasswordChange("newPassword", e.target.value)
                        }
                        className={errors.newPassword ? "border-red-500" : ""}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.newPassword && (
                      <p className="text-sm text-red-500">
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          handlePasswordChange(
                            "confirmPassword",
                            e.target.value
                          )
                        }
                        className={
                          errors.confirmPassword ? "border-red-500" : ""
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>Change Password</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
