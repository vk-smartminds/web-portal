
import AdminSidebar from '../components/AdminSidebar';
import AdminDashboardMain from '../components/AdminDashboardMain';
export default function DashboardPage() {
  return (
    <div className='flex'>
      <AdminSidebar />
      <AdminDashboardMain />
    </div>
  );
}