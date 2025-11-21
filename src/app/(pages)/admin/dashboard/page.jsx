"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, UserCheck, BookOpen, ClipboardList, Calendar, ClipboardCheck } from "lucide-react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useQuery } from "@tanstack/react-query";

ChartJS.register(ArcElement, Tooltip, Legend);

// Generate colors for pie chart
const generateColors = (count) => {
  const colors = [
    "#2563eb", // blue-600
    "#059669", // green-600
    "#a21caf", // purple-800
    "#f59e42", // orange-400
    "#e11d48", // rose-600
    "#8b5cf6", // violet-500
    "#06b6d4", // cyan-500
    "#84cc16", // lime-500
    "#f97316", // orange-500
    "#ec4899", // pink-500
  ];
  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
};

const pieOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        color: "#334155",
        font: { size: 14 },
      },
    },
  },
};

export default function AdminDashboard() {
  // Fetch dashboard data
  const { data: dashboardData, isLoading, isError } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard");
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to fetch dashboard data");
      return json.data;
    },
  });

  // Prepare stats data
  const stats = [
    {
      title: "Total Students",
      icon: <Users className="w-8 h-8 text-blue-600" />,
      count: dashboardData?.totalStudents || 0,
      color: "bg-blue-50",
    },
    {
      title: "Total Teachers",
      icon: <UserCheck className="w-8 h-8 text-green-600" />,
      count: dashboardData?.totalTeachers || 0,
      color: "bg-green-50",
    },
    {
      title: "Total Courses",
      icon: <BookOpen className="w-8 h-8 text-purple-600" />,
      count: dashboardData?.totalCourses || 0,
      color: "bg-purple-50",
    },
    {
      title: "Total Registration",
      icon: <ClipboardList className="w-8 h-8 text-yellow-600" />,
      count: dashboardData?.totalRegistrations || 0,
      color: "bg-yellow-50",
    },
    {
      title: "Ongoing Semester",
      icon: <Calendar className="w-8 h-8 text-pink-600" />,
      count: dashboardData?.ongoingSemester || "N/A",
      color: "bg-pink-50",
    },
    {
      title: "Teaching Evaluation",
      icon: <ClipboardCheck className="w-8 h-8 text-red-600" />,
      count: dashboardData?.teachingEvaluationStatus || "Disabled",
      color: "bg-red-50",
    },
  ];

  // Prepare pie chart data
  const pieData = {
    labels: dashboardData?.departmentRegistrations?.labels || [],
    datasets: [
      {
        label: "Registrations",
        data: dashboardData?.departmentRegistrations?.data || [],
        backgroundColor: generateColors(
          dashboardData?.departmentRegistrations?.labels?.length || 0
        ),
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="">
      {isLoading ? (
        <div className="text-center py-8">
          <div className="text-lg font-semibold text-blue-600 dark:text-gray-400">
            Loading dashboard data...
          </div>
        </div>
      ) : isError ? (
        <div className="text-center py-8">
          <div className="text-lg font-semibold text-red-600 dark:text-red-400">
            Failed to load dashboard data
          </div>
        </div>
      ) : (
        <>
          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, idx) => (
              <Card
                key={idx}
                className={`flex items-center justify-between p-6 ${stat.color} dark:bg-slate-800`}
              >
                <div className="flex flex-col gap-4">
                  <div className="p-5">{stat.icon}</div>
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {stat.title}
                    </CardTitle>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-700 dark:text-white">
                  {stat.count}
                </div>
              </Card>
            ))}
          </div>
          {/* Chart */}
          <Card className="p-6 mt-10 mb-20 dark:bg-slate-800">
            <CardHeader>
              <CardTitle>Course Registration Per Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full flex flex-col items-center justify-center">
                {dashboardData?.departmentRegistrations?.labels &&
                dashboardData.departmentRegistrations.labels.length > 0 ? (
                  <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                    <Doughnut data={pieData} options={pieOptions} />
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No registration data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
