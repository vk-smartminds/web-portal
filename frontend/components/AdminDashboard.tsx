"use client";

import DashboardCommon from '../pages/DashboardCommon';
import Sidebar from './AdminSidebar';

const menuItems = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'users', label: 'Users' },
  { key: 'creative-corner', label: 'Creative Corner' },
  { key: 'activity', label: 'Activity' },
  { key: 'cbse-updates', label: 'CBSE Updates' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'avlrs', label: 'AVLRs' },
  { key: 'dlrs', label: 'DLRs' },
  { key: 'mindmaps', label: 'Mind Maps' },
  { key: 'sqps', label: 'SQPs' },
  { key: 'pyqs', label: 'PYQs' },
  { key: 'pyps', label: 'PYPs' },
  // Add more as needed
];

export default function AdminDashboard() {
  return (
    <DashboardCommon
      SidebarComponent={Sidebar}
      menuItems={menuItems}
      userType="Admin"
      renderContent={({ selectedMenu, ...rest }) => {
        // You can add logic here to render the correct page/component for each menu item
        // For now, just render null or a placeholder
        return null;
      }}
      customProfileFetch={undefined}
      children={null}
    />
  );
}