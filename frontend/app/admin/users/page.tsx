"use client";
import AdminSidebar from "../../../components/AdminSidebar";

export default function Employee() {
  const employees = [
    { id: "#ZY9653", name: "Arlene McCoy", role: "Student" },
    { id: "#ZY9654", name: "Darlene Robertson", role: "Teacher" },
    { id: "#ZY9655", name: "Wade Warren", role: "Guardian" },
    { id: "#ZY9656", name: "Devon Lane", role: "Admin" },
  ];

  return (
    <div className="flex">
      <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 z-60">
        <AdminSidebar />
      </div>
      <div className="bg-[#0D0E12] p-6 text-white w-full" style={{ marginLeft: '16rem' }}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Employee List</h2>
            <button className="bg-purple-600 hover:bg-purple-700 transition px-4 py-2 rounded-lg text-sm">
            + Add New User
            </button>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-gray-700">
                <tr>
                <th className="py-3">ID</th>
                <th className="py-3">Name</th>
                <th className="py-3">Role</th>
                <th className="py-3 text-center">Actions</th>
                </tr>
            </thead>
            <tbody className="text-white">
                {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-gray-800 last:border-b-0">
                    <td className="py-3">{emp.id}</td>
                    <td className="py-3">{emp.name}</td>
                    <td className="py-3">{emp.role}</td>
                    <td className="py-3 text-center">
                    <div className="flex gap-3 justify-center">
                        <button className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md text-xs">
                        Edit
                        </button>
                        <button className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-xs">
                        Delete
                        </button>
                    </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        </div>
    </div>
  );
}
