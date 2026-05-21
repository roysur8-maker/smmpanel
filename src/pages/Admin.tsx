import { useState } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { LogOut, Users, Settings, CreditCard, LayoutDashboard, Menu, X, List } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AdminOverview from "./admin/AdminOverview";
import AdminUsers from "./admin/AdminUsers";
import AdminFunds from "./admin/AdminFunds";
import AdminSettings from "./admin/AdminSettings";
import AdminServices from "./admin/AdminServices";

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { name: "Overview", path: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Users", path: "/admin/users", icon: <Users className="w-5 h-5" /> },
    { name: "Services", path: "/admin/services", icon: <List className="w-5 h-5" /> },
    { name: "Fund Requests", path: "/admin/funds", icon: <CreditCard className="w-5 h-5" /> },
    { name: "Settings & API", path: "/admin/settings", icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center z-20">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 768) && (
          <motion.div 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed md:static inset-y-0 left-0 w-64 bg-gray-900 text-white shadow-xl flex flex-col z-10"
          >
            <div className="p-6 border-b border-gray-700 hidden md:block">
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-gray-400 mt-1">{user?.email}</p>
            </div>
            
            <div className="p-4 md:hidden border-b border-gray-700">
               <p className="text-sm text-gray-300">Logged in as {user?.email}</p>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center space-x-3 p-3 rounded-md font-medium transition-colors ${
                    location.pathname === link.path 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {link.icon} <span>{link.name}</span>
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-gray-700">
              <button onClick={handleLogout} className="flex items-center space-x-3 p-3 w-full text-red-400 hover:bg-gray-800 rounded-md transition-colors">
                <LogOut className="w-5 h-5" /> <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-0 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-60px)] md:h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Routes>
              <Route path="/" element={<AdminOverview />} />
              <Route path="/users" element={<AdminUsers />} />
              <Route path="/services" element={<AdminServices />} />
              <Route path="/funds" element={<AdminFunds />} />
              <Route path="/settings" element={<AdminSettings />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
