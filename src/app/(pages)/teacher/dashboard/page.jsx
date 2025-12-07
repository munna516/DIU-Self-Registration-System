"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

const barOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: "Weekly Registration Overview",
      font: { size: 18 },
      color: "#1e293b",
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#64748b", font: { size: 14 } },
    },
    y: {
      grid: { color: "#e5e7eb" },
      ticks: { color: "#64748b", font: { size: 14 } },
    },
  },
};

export default function Dashboard() {
  const { data: session } = useSession();

  // Fetch dashboard data
  const { data: dashboardData, isLoading, isError } = useQuery({
    queryKey: ["teacher-dashboard", session?.user?.teacherId],
    queryFn: async () => {
      const res = await fetch(
        `/api/teacher/dashboard?teacherId=${session?.user?.teacherId}`
      );
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to fetch dashboard data");
      return json.data;
    },
    enabled: !!session?.user?.teacherId,
  });

  // Prepare card data
  const cardData = [
    {
      title: "Total Registered Students",
      value: dashboardData?.totalRegisteredStudents || 0,
      color: "from-blue-500 to-blue-700",
      icon: "👨‍🎓",
    },
    {
      title: "Today's Registration",
      value: dashboardData?.todaysRegistrations || 0,
      color: "from-green-500 to-green-700",
      icon: "📝",
    },
    {
      title: "Current Semester",
      value: dashboardData?.currentSemester || "N/A",
      color: "from-purple-500 to-purple-700",
      icon: "📚",
    },
  ];

  // Prepare bar chart data
  const barData = {
    labels: dashboardData?.weeklyRegistrations?.labels || [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ],
    datasets: [
      {
        label: "Registrations",
        data: dashboardData?.weeklyRegistrations?.data || [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: "#2563eb",
        borderRadius: 8,
        maxBarThickness: 40,
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {cardData.map((card, idx) => (
              <Card
                key={idx}
                className={`bg-gradient-to-br ${card.color} text-white shadow-xl hover:scale-105 transition-transform duration-200`}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">
                    {card.title}
                  </CardTitle>
                  <span className="text-3xl">{card.icon}</span>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mt-2">{card.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="p-6 mt-10 mb-20 dark:bg-slate-800">
            <CardContent>
              <div className="w-full flex flex-col items-center justify-center ">
                <div className="w-full sm:max-w-sm md:max-w-md lg:max-w-2xl ">
                  <Bar data={barData} options={barOptions} />
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
