// import { Search, Filter, ChevronRight } from "lucide-react";

import ChevronRight from "@/icons/ChevronRight";
import FilterIcon from "@/icons/FilterIcon";
import SearchIcon from "@/icons/SearchIcon";

const courses = [
  { initial: "E", name: "English", section: "BCS-4A", progress: "70%", color: "text-yellow-500" },
  { initial: "S", name: "Science", section: "BCS-4A", progress: "30%", color: "text-red-500" },
  { initial: "S", name: "Social", section: "BCS-4A", progress: "50%", color: "text-yellow-500" },
  { initial: "P", name: "Projects", section: "BCS-4A", progress: "40%", color: "text-red-500" },
  { initial: "A", name: "Arts", section: "BCS-4A", progress: "100%", color: "text-green-500" },
];

export default function CourseList() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-[#1e3a8a]">Your Courses</h2>
        <div className="relative w-48">
          <input
            type="text"
            placeholder="Search Course"
            className="w-full text-sm px-3 py-1.5 rounded-md bg-[#f1f5f9] pr-10 outline-none"
          />
          <SearchIcon className="absolute right-8 top-2.5 w-4 h-4 text-gray-400" />
          <FilterIcon className="absolute right-2 top-2.5 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {courses.map((course, i) => (
          <div
            key={i}
            className="bg-[#f8fafc] hover:bg-[#f1f5f9] rounded-md px-3 py-2 flex items-center justify-between transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-[#dce4f9] text-[#1e3a8a] font-bold flex items-center justify-center">
                {course.initial}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">{course.name}</div>
                <div className="text-xs text-gray-500">{course.section}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`text-sm font-bold ${course.color}`}>{course.progress}</div>
              <button className="text-sm text-[#1e3a8a] font-medium flex items-center gap-1 hover:underline">
                View <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between mt-6">
        <button className="border border-blue-600 text-blue-600 text-sm px-4 py-2 rounded-md hover:bg-blue-50">
          View More
        </button>
        <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 transition">
          Enroll Course
        </button>
      </div>
    </div>
  );
}
