"use client";
import React, { useState } from "react";
import AdminSidebar from "../../../components/AdminSidebar";

export default function CreateEvent() {
  const [receivers, setReceivers] = useState(["Students", "Guardians", "Teachers", "Admins"]);
  const [files, setFiles] = useState([
    { name: "Presentation.pptx", size: "1.2MB" },
    { name: "Documents.pdf", size: "43.5MB" },
  ]);

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="bg-[#1A1B21] p-6 w-full text-white space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Create Announcement</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Topic Name</label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                placeholder="Enter announcement topic"
                className="w-6/12 bg-[#0D0E12] border border-[#2A2B32] rounded-lg px-3 py-2 text-sm outline-none placeholder:text-gray-500"
              />
              {/* <button className="bg-[#2A2B32] text-sm px-4 rounded-lg hover:bg-[#32343E]">Add description</button> */}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Description</label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                placeholder="Write your announcement here..."
                className="w-full bg-[#0D0E12] border border-[#2A2B32] rounded-lg px-3 py-2 text-sm outline-none placeholder:text-gray-500"
              />
              {/* <button className="bg-[#2A2B32] text-sm px-4 rounded-lg hover:bg-[#32343E]">Add description</button> */}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Add receivers</label>
            <div className="flex gap-2 mt-1">
              <input
                type="email"
                placeholder="contact@example.com"
                className="w-full bg-[#0D0E12] border border-[#2A2B32] rounded-lg px-3 py-2 text-sm outline-none placeholder:text-gray-500"
              />
              <button className="bg-[#2A2B32] text-sm px-4 rounded-lg hover:bg-[#32343E]">Add</button>
            </div>
            <div className="flex mt-3 gap-2">
              {receivers.slice(0, 5).map((r, idx) => (
                <div key={idx} className="w-20 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold">{r}</div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm text-gray-400">Notification</label>
              <div className="w-5/12 mt-1 bg-[#0D0E12] border border-[#2A2B32] rounded-lg px-3 py-2 text-sm text-left">Email</div>
            </div>
            {/* <div className="flex-1">
              <label className="text-sm text-gray-400">Set reminder</label>
              <button className="w-full mt-1 bg-[#0D0E12] border border-[#2A2B32] rounded-lg px-3 py-2 text-sm text-left">1 hour before event</button>
            </div> */}
          </div>

          <div>
            <label className="text-sm text-gray-400">Upload attachments</label>
            <div className="mt-1 bg-[#0D0E12] border border-[#2A2B32] rounded-lg p-3 text-sm space-y-3">
              <button className="bg-[#2A2B32] px-4 py-2 rounded-lg w-full text-center hover:bg-[#32343E]">Select Files</button>
              {files.map((file, idx) => (
                <div key={idx} className="flex justify-between items-center bg-[#2A2B32] px-3 py-2 rounded-lg">
                  <div className="flex gap-2 items-center">
                    <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h16v16H4V4z"/></svg>
                    <span>{file.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{file.size}</span>
                </div>
              ))}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>50% / 34 sec</span>
                </div>
                <div className="w-full h-2 bg-[#2A2B32] rounded-full overflow-hidden">
                  <div className="h-2 bg-purple-500 w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button className="bg-[#2A2B32] px-4 py-2 rounded-lg text-sm hover:bg-[#32343E]">Cancel</button>
          <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm">Create</button>
        </div>
      </div>
    </div>
  );
}
