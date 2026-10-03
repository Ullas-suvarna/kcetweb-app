import React from 'react';
import { AdminDataProvider, useAdminData } from './context/AdminDataContext';
import { AdminLogin } from './components/auth/AdminLogin';
import { Dashboard } from './components/Dashboard';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAdminData();

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => {}} />;
  }

  return <Dashboard />;
};

export default function App() {
  return (
    <AdminDataProvider>
      <AppContent />
    </AdminDataProvider>
  );
}
