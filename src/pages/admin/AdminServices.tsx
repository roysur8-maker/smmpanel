import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminServices() {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = () => {
    axios.get("/api/admin/services").then(res => setServices(res.data));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6 border-b pb-2">
        <h2 className="text-xl font-semibold">Imported Services</h2>
        <span className="text-sm bg-gray-100 px-3 py-1 rounded text-gray-600 font-medium">Total: {services.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Rate (₹)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min / Max</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
             {services.map(s => (
               <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.id}</td>
                 <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{s.name}</td>
                 <td className="px-6 py-4 text-sm text-gray-500">{s.category}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">₹{s.rate.toFixed(2)}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.min} / {s.max}</td>
               </tr>
             ))}
             {services.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No services found. Go to settings to sync them.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
