"use client";

import DashboardCommon from '../pages/DashboardCommon';
import Sidebar from './AdminSidebar';
import React from 'react'; // Added missing import for React

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
  { key: 'discussion-panel', label: 'Discussion Panel' }, // Added discussion panel
  // Add more as needed
];

export default function AdminDashboard() {
  // Lazy import for admin discussion panel
  const AdminDiscussionPanel = React.useMemo(() => React.lazy(() => import('../app/admin/discussion/page')), []);
  return (
    <DashboardCommon
      SidebarComponent={Sidebar}
      menuItems={menuItems}
      userType="Admin"
      renderContent={({ selectedMenu, ...rest }) => {
        if (selectedMenu === 'discussion-panel') {
          return (
            <React.Suspense fallback={<div>Loading Discussion Panel...</div>}>
              <AdminDiscussionPanel />
            </React.Suspense>
          );
        }
        // You can add logic here to render the correct page/component for each menu item
        // For now, just render null or a placeholder
        return null;
      }}
      customProfileFetch={undefined}
      children={null}
    />
  );
}