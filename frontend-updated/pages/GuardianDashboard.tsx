import Courses from "@/components/Courses";
import Greeting from "@/components/Greeting";
import Header from "@/components/Header";
import Results from "@/components/Results";
import Sidebar from "@/components/Sidebar";

export default function GuardianDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-4 md:p-8 font-sans">
      <div className="bg-white shadow-2xl rounded-3xl max-w-6xl mx-auto flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-8 space-y-6">
            <Header />
            <Greeting />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Courses />
                <Results />
            </div>
        </main>
      </div>
    </div>
  );
} 
