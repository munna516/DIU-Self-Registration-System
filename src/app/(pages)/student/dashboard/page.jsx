"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpen, Layers, Calendar, Clock } from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Generate colors for bar chart
const generateColors = (count) => {
  const colors = [
    "#2563eb",
    "#059669",
    "#a21caf",
    "#f59e42",
    "#e11d48",
    "#fbbf24",
    "#10b981",
    "#8b5cf6",
    "#06b6d4",
    "#84cc16",
  ];
  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
};

const barOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: "#334155",
        font: { size: 14 },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: "#e5e7eb",
      },
      ticks: {
        color: "#334155",
        font: { size: 14 },
        stepSize: 1,
      },
    },
  },
};

export default function Dashboard() {
  const { data: session } = useSession();

  // Fetch dashboard data
  const { data: dashboardData, isLoading, isError } = useQuery({
    queryKey: ["student-dashboard", session?.user?.studentId],
    queryFn: async () => {
      const res = await fetch(
        `/api/student/dashboard?studentId=${session?.user?.studentId}`
      );
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to fetch dashboard data");
      return json.data;
    },
    enabled: !!session?.user?.studentId,
  });

  // Determine deadline card title and value based on registration status
  const getDeadlineCardInfo = () => {
    if (dashboardData?.registrationStatus === "notOpen") {
      return {
        title: "Not Opened",
        value: dashboardData?.registrationStartDate
          ? new Date(dashboardData.registrationStartDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          : "N/A",
      };
    } else if (dashboardData?.registrationStatus === "open") {
      return {
        title: "Deadline",
        value: dashboardData?.registrationEndDate
          ? new Date(dashboardData.registrationEndDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          : dashboardData?.deadline || "N/A",
      };
    } else if (dashboardData?.registrationStatus === "closed") {
      return {
        title: "Closed",
        value: dashboardData?.registrationEndDate
          ? new Date(dashboardData.registrationEndDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          : "Closed",
      };
    } else {
      return {
        title: "Deadline",
        value: dashboardData?.deadline || "N/A",
      };
    }
  };

  const deadlineCardInfo = getDeadlineCardInfo();

  // Prepare stats data
  const stats = [
    {
      title: "Registered Courses",
      icon: <BookOpen className="w-8 h-8 text-blue-600" />,
      value: dashboardData?.registeredCourses || 0,
      color: "bg-blue-50",
    },
    {
      title: "Total Credit",
      icon: <Layers className="w-8 h-8 text-green-600" />,
      value: dashboardData?.totalCredits || 0,
      color: "bg-green-50",
    },
    {
      title: "Semester",
      icon: <Calendar className="w-8 h-8 text-purple-600" />,
      value: dashboardData?.semester || "N/A",
      color: "bg-purple-50",
    },
    {
      title: "Deadline",
      icon: <Clock className="w-8 h-8 text-red-600" />,
      value: dashboardData?.deadline || "N/A",
      color: "bg-red-50",
    },
  ];

  // Prepare bar chart data
  const barData = {
    labels: dashboardData?.courses?.map((c) => c.code) || [],
    datasets: [
      {
        label: "Credit Hours",
        data: dashboardData?.courses?.map((c) => c.credit) || [],
        backgroundColor: generateColors(dashboardData?.courses?.length || 0),
        borderRadius: 8,
        borderWidth: 1,
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <Card
                key={idx}
                className={`flex items-center justify-between p-6 ${stat.color} dark:bg-slate-800`}
              >
                <div className="">
                  <div className="p-5">{stat.icon}</div>
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {stat.title}
                    </CardTitle>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-700 dark:text-white">
                  {stat.value}
                </div>
              </Card>
            ))}
          </div>
          
          {/* Registration Status Banner */}
          <div className="mt-8 flex justify-center">
            <div className="w-full max-w-4xl">
              {dashboardData?.registrationStatus === "notOpen" ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-500 rounded-lg p-6 text-center">
                  <p className="text-xl font-bold text-yellow-800 dark:text-yellow-300">
                    Registration is not opened yet
                  </p>
                  {dashboardData?.registrationStartDate && (
                    <p className="text-lg text-yellow-700 dark:text-yellow-400 mt-2">
                      Opening Date: {new Date(dashboardData.registrationStartDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  )}
                </div>
              ) : dashboardData?.registrationStatus === "open" ? (
                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-400 dark:border-green-500 rounded-lg p-6 text-center">
                  <p className="text-xl font-bold text-green-800 dark:text-green-300">
                    Registration is open
                  </p>
                  {dashboardData?.registrationEndDate && (
                    <p className="text-lg text-green-700 dark:text-green-400 mt-2">
                      Last Date: {new Date(dashboardData.registrationEndDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  )}
                </div>
              ) : dashboardData?.registrationStatus === "closed" ? (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-500 rounded-lg p-6 text-center">
                  <p className="text-xl font-bold text-red-800 dark:text-red-300">
                    Registration is closed
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <p className="text-xl font-bold text-gray-700 dark:text-gray-300">
                    Registration schedule not available
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bar Chart */}
          <Card className="p-6 mt-10 mb-20 dark:bg-slate-800">
            <CardHeader>
              <CardTitle>Credit Hours by Course</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full flex flex-col items-center justify-center ">
                {dashboardData?.courses && dashboardData.courses.length > 0 ? (
                  <div className="w-full sm:max-w-sm md:max-w-md lg:max-w-2xl ">
                    <Bar data={barData} options={barOptions} />
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No courses registered yet
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
