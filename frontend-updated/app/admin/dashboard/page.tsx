import AdminDashboardComponent from "../../../pages/AdminDashboard";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function AdminDashboard() {
  async function getTokenAndRender() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    if (!token) {
      redirect('/login');
    }
    return (
      <div>
        <AdminDashboardComponent />
      </div>
    );
  }
  return getTokenAndRender();
}
