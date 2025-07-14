"use client";
import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [selected, setSelected] = useState("All users");
  const [open, setOpen] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [chartData2, setChartData2] = useState(null);


  const options = ["All users", "Students", "Guardians", "Teachers", "Admins"];
  const today = new Date();

    const BarChartData = {
        labels: ["January", "February", "March", "April"],
        data: [65, 59, 80, 81]
    };

    const PieChartData = {
        labels: ["Students", "Teachers", "Admins", "Guardians"],
        data: [65, 20, 5, 10],
    }

    useEffect(() => {
    function fetchData() {
      const barData = BarChartData;
      setChartData({
        labels: barData.labels,
        datasets: [
          {
            label: "Employee Performance",
            data: barData.data,
            backgroundColor: "rgba(168, 85, 247, 0.7)", // purple-500
            borderRadius: 8,
          },
        ],
      });

      const pieData = PieChartData;
      setChartData2({
        labels: pieData.labels,
        datasets: [
          {
            label: "User Distribution",
            data: pieData.data,
            backgroundColor: [
              "rgba(168, 85, 247, 0.7)", // purple
              "rgba(59, 130, 246, 0.7)", // blue
              "rgba(34, 197, 94, 0.7)", // green
              "rgba(239, 68, 68, 0.7)", // red
            ],
            borderColor: "#0D0E12",
            borderWidth: 4,
          },
        ],
      });
    }
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#0D0E12] text-white min-h-screen w-full">
      {/* Search and header */}
      <div className="flex justify-between items-center">
        <div className="text-2xl font-semibold">Dashboard</div>
        <div className="flex gap-3 items-center">
            <div className="flex items-center bg-[#1A1B21] rounded-lg px-4 py-2 w-full max-w-md">
                <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    placeholder="Search something..."
                    className="bg-transparent outline-none border-none text-sm text-white ml-3 placeholder:text-gray-400 w-full"
                />
            </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Students" value="12600" percentage="↑2% from last quarter" />
        <StatCard label="Total Teachers" value="1186" percentage="↑15% from last quarter" />
        <StatCard label="New Students" value="22" percentage="↑2% from last quarter" />
        <StatCard label="Daily Usage Rate" value="89.9%" percentage="↑5% from last quarter" />
      </div>

      {/* Performance and Attendance */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1A1B21] p-4 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <div className="font-medium">Employees Performance</div>
            <div className="bg-[#0D0E12] px-3 py-1 rounded-md text-xs">Weekly</div>
          </div>
          <div className="h-64 bg-gradient-to-b from-purple-800/60 to-transparent rounded-lg flex justify-center items-center text-gray-400">
            {chartData && (
              <Bar
                data={chartData}
                options={{
                plugins: {
                    legend: { display: false },
                },
                scales: {
                    y: {
                    ticks: { color: "#ffffff" },
                    },
                    x: {
                    ticks: { color: "#ffffff" },
                    },
                },
                }}
            />)}
          </div>
        </div>

        <div className="bg-[#1A1B21] p-4 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div className="font-medium">Employee Attendance</div>
            <div className="text-xs text-gray-400">{today.toDateString()}</div>
          </div>
          <div className="flex justify-center items-center mb-4 h-64">
            {chartData2 && (
              <div className="w-64 h-64">
                <Pie
                  data={chartData2}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          color: "white",
                        },
                      },
                    },
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button className="bg-[#0D0E12] px-4 py-2 rounded-lg text-sm">View Full Details</button>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-[#1A1B21] p-4 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <div className="font-medium">Employees</div>
          <div className="relative inline-block text-left w-48">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex justify-between items-center bg-[#1A1B21] text-white px-4 py-2 rounded-lg text-sm"
            >
                {selected}
                <svg
                className={`w-4 h-4 ml-2 transition-transform ${
                    open ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                >
                <path d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute z-10 mt-2 w-full bg-[#1A1B21] rounded-lg shadow-lg border border-[#2A2B32]">
                {options.map((option) => (
                    <button
                    key={option}
                    onClick={() => {
                        setSelected(option);
                        setOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-[#2A2B32] ${
                        selected === option ? "text-purple-400" : "text-gray-300"
                    }`}
                    >
                    {option}
                    </button>
                ))}
                </div>
            )}
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b border-gray-700">
              <tr>
                <th className="py-2 text-left">ID</th>
                <th className="py-2 text-left">Employee Name</th>
                <th className="py-2 text-left">Role</th>
                <th className="py-2 text-left">Contract</th>
                <th className="py-2 text-left">Team</th>
                <th className="py-2 text-left">Workspace</th>
                <th className="py-2 text-left">Status</th>
                <th className="py-2 text-left">Attendance Rate</th>
              </tr>
            </thead>
            <tbody className="text-white">
              <EmployeeRow id="#ZY9653" name="Arlene McCoy" role="UX Engineer" contract="Full Time" team="Team Alpha" workspace="Remote" status="Active" attendance="83%" />
              <EmployeeRow id="#ZY9652" name="Darlene Robertson" role="Sales Manager" contract="Part-time" team="Team Phinix" workspace="On-site" status="Active" attendance="96%" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, percentage }) {
  return (
    <div className="bg-[#1A1B21] p-4 rounded-xl flex flex-col justify-between">
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-2xl font-bold mt-2 mb-1">{value}</div>
      <div className="text-xs text-green-400">{percentage}</div>
    </div>
  );
}

function EmployeeRow({ id, name, role, contract, team, workspace, status, attendance }) {
  return (
    <tr className="border-b border-gray-800 last:border-b-0">
      <td className="py-3">{id}</td>
      <td className="py-3">{name}</td>
      <td className="py-3">{role}</td>
      <td className="py-3">{contract}</td>
      <td className="py-3">{team}</td>
      <td className="py-3">{workspace}</td>
      <td className="py-3">
        <span className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-400">{status}</span>
      </td>
      <td className="py-3">
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-2 bg-purple-500" style={{ width: attendance }}></div>
          </div>
          <span className="text-xs">{attendance}</span>
        </div>
      </td>
    </tr>
  );
}
