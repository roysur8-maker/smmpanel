import { useState } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { LogOut, Home, FileText, CreditCard, Code, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import NewOrder from "./user/NewOrder";
import Orders from "./user/Orders";
import AddFunds from "./user/AddFunds";
import ApiDocs from "./user/ApiDocs";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { name: "New Order", path: "/dashboard", icon: <Home className="w-5 h-5" /> },
    { name: "Orders History", path: "/dashboard/orders", icon: <FileText className="w-5 h-5" /> },
    { name: "Add Funds", path: "/dashboard/funds", icon: <CreditCard className="w-5 h-5" /> },
    { name: "API Integration", path: "/dashboard/api", icon: <Code className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center z-20 relative">
        <h1 className="text-xl font-bold text-blue-600">SMM Panel</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-700">
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
            className="fixed md:static inset-y-0 left-0 w-64 bg-white shadow-xl md:shadow-md flex flex-col z-10"
          >
            <div className="p-6 border-b hidden md:block">
              <h1 className="text-2xl font-bold text-blue-600">SMM Panel</h1>
              <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
            </div>
            
            <div className="p-4 md:px-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-sm">
                <span className="opacity-80 text-sm">Balance</span>
                <div className="font-bold text-2xl mt-1">₹{(user?.balance || 0).toFixed(2)}</div>
              </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center space-x-3 p-3 rounded-md font-medium transition-colors ${
                    location.pathname === link.path 
                      ? "bg-blue-50 text-blue-700 font-bold" 
                      : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  }`}
                >
                  {link.icon} <span>{link.name}</span>
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t">
              <button onClick={handleLogout} className="flex items-center space-x-3 p-3 w-full text-red-600 hover:bg-red-50 rounded-md transition-colors">
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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <Routes>
              <Route path="/" element={<NewOrder />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/funds" element={<AddFunds />} />
              <Route path="/api" element={<ApiDocs />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
