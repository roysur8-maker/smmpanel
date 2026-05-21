import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios.get("/api/admin/users").then(res => setUsers(res.data));
  };
  
  const handleUpdateBalance = async (id: number) => {
     const amount = window.prompt("Enter amount to add (can be negative to deduct):", "0");
     if (!amount || isNaN(parseFloat(amount))) return;
     try {
       await axios.post(`/api/admin/users/${id}/balance`, { amount: parseFloat(amount) });
       fetchUsers();
     } catch(e) {
       alert("Error updating balance");
     }
  };

  const handleToggleBlock = async (id: number, currentStatus: boolean) => {
     try {
       await axios.post(`/api/admin/users/${id}/status`, { blocked: !currentStatus });
       fetchUsers();
     } catch(e) {
       alert("Error updating status");
     }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6 border-b pb-2">User Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
             {users.map(u => (
               <tr key={u.id}>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.id}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.email}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.role}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">₹{u.balance.toFixed(2)}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-mono">{u.api_key}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm">
                   {u.blocked ? <span className="text-red-500 font-medium">Blocked</span> : <span className="text-green-500 font-medium">Active</span>}
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                   <button onClick={() => handleUpdateBalance(u.id)} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-2 py-1 rounded">Edit Balance</button>
                   {u.role !== 'admin' && (
                     <button onClick={() => handleToggleBlock(u.id, u.blocked)} className={`px-2 py-1 rounded ${u.blocked ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                       {u.blocked ? 'Unblock' : 'Block'}
                     </button>
                   )}
                 </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
