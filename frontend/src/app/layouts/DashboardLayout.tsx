import { useState } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} />
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-20'
        }`}
      >
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
