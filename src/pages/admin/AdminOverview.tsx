import { useState, useEffect } from "react";
import axios from "axios";
import { Users, FileText, DollarSign, Activity } from "lucide-react";
import { motion } from "motion/react";

export default function AdminOverview() {
  const [stats, setStats] = useState({ usersCount: 0, ordersCount: 0, totalFunds: 0 });

  useEffect(() => {
    axios.get("/api/admin/stats").then(res => setStats(res.data));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center space-x-3 mb-2">
         <Activity className="h-8 w-8 text-blue-600" />
         <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h2>
      </div>
      
      <motion.div 
         variants={containerVariants}
         initial="hidden"
         animate="show"
         className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:opacity-10 transition-opacity"></div>
           <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Total Users</p>
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <Users className="w-6 h-6" />
              </div>
           </div>
           <p className="text-4xl font-black text-gray-900 font-mono tracking-tighter">{stats.usersCount}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
           <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 opacity-5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:opacity-10 transition-opacity"></div>
           <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Total Orders</p>
              <div className="p-3 rounded-xl bg-green-50 text-green-600">
                <FileText className="w-6 h-6" />
              </div>
           </div>
           <p className="text-4xl font-black text-gray-900 font-mono tracking-tighter">{stats.ordersCount}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
           <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 opacity-5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:opacity-10 transition-opacity"></div>
           <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Total Revenue</p>
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                <DollarSign className="w-6 h-6" />
              </div>
           </div>
           <p className="text-4xl font-black text-gray-900 font-mono tracking-tighter">₹{stats.totalFunds.toFixed(2)}</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
