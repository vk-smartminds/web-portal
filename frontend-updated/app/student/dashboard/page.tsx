import StudentDashboard from "../../../pages/StudentDashboard";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';


export default function Dashboard() {
    async function getTokenAndRender() {
        const cookieStore = await cookies();
        const token = cookieStore.get('token');
        if (!token) {
          redirect('/login');
        }
        return (
          <div>
            <StudentDashboard />
          </div>
        );
      }
      return getTokenAndRender();
}