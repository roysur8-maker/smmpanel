import { useAuth } from "../../lib/AuthContext";
import { motion } from "motion/react";
import { Copy, Server } from "lucide-react";
import { useState } from "react";

export default function ApiDocs() {
  const { user } = useAuth();
  
  const baseUrl = window.location.origin + "/api/v1";
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const copyToClipboard = (text: string, isKey: boolean) => {
    navigator.clipboard.writeText(text);
    if (isKey) {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-xl shadow-sm border p-6 max-w-4xl"
    >
      <div className="flex items-center space-x-3 mb-6 border-b pb-4">
        <Server className="text-blue-600 h-8 w-8" />
        <h2 className="text-2xl font-bold text-gray-800">API Documentation</h2>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <motion.div variants={itemVariants} className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-5 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <p className="text-sm font-semibold text-blue-900 mb-2 uppercase tracking-wider">API URL</p>
          <div className="flex items-center">
            <code className="text-sm text-blue-700 bg-white/60 p-2.5 rounded-l border border-blue-200 border-r-0 flex-1 truncate select-all font-mono">
              {baseUrl}
            </code>
            <button 
              onClick={() => copyToClipboard(baseUrl, false)}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 outline-none rounded-r border border-blue-600 transition-colors flex items-center justify-center w-12"
              title="Copy URL"
            >
              <Copy size={16} />
            </button>
          </div>
          {copiedUrl && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-blue-600 mt-2 absolute bottom-2">Copied!</motion.p>}
        </motion.div>

        <motion.div variants={itemVariants} className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 opacity-5 rounded-full -mr-10 -mt-10 blur-xl"></div>
           <p className="text-sm font-semibold text-orange-900 mb-2 uppercase tracking-wider">Your API Key</p>
           <div className="flex items-center">
             <code className="text-sm text-orange-700 bg-white/60 p-2.5 rounded-l border border-orange-200 border-r-0 flex-1 truncate select-all font-mono">
               {user?.api_key || "Generating..."}
             </code>
             <button 
                onClick={() => copyToClipboard(user?.api_key || "", true)}
                className="bg-orange-500 hover:bg-orange-600 text-white p-2.5 outline-none rounded-r border border-orange-500 transition-colors flex items-center justify-center w-12"
                title="Copy API Key"
              >
                <Copy size={16} />
              </button>
           </div>
           {copiedKey && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-orange-600 mt-2 absolute bottom-2">Copied!</motion.p>}
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="space-y-6">
         <section className="bg-white border rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-50 border-b px-4 py-3 flex text-sm flex-col sm:flex-row sm:items-center justify-between">
              <h3 className="font-semibold text-gray-800">1. Service List</h3>
              <p className="text-gray-500 text-xs mt-1 sm:mt-0 font-mono"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold mr-2 text-[10px]">POST</span>{baseUrl}</p>
            </div>
            <div className="p-0">
              <pre className="bg-gray-900 text-green-400 p-4 font-mono text-sm overflow-x-auto m-0">
{`{
  "key": "YOUR_API_KEY",
  "action": "services"
}`}
              </pre>
            </div>
         </section>

         <section className="bg-white border rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-50 border-b px-4 py-3 flex text-sm flex-col sm:flex-row sm:items-center justify-between">
              <h3 className="font-semibold text-gray-800">2. Add Order</h3>
              <p className="text-gray-500 text-xs mt-1 sm:mt-0 font-mono"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold mr-2 text-[10px]">POST</span>{baseUrl}</p>
            </div>
            <div className="p-0">
              <pre className="bg-gray-900 text-green-400 p-4 font-mono text-sm overflow-x-auto m-0">
{`{
  "key": "YOUR_API_KEY",
  "action": "add",
  "service": 1,
  "link": "https://instagram.com/p/...",
  "quantity": 1000
}`}
              </pre>
            </div>
         </section>

         <section className="bg-white border rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-50 border-b px-4 py-3 flex text-sm flex-col sm:flex-row sm:items-center justify-between">
              <h3 className="font-semibold text-gray-800">3. Check Balance</h3>
              <p className="text-gray-500 text-xs mt-1 sm:mt-0 font-mono"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold mr-2 text-[10px]">POST</span>{baseUrl}</p>
            </div>
            <div className="p-0">
              <pre className="bg-gray-900 text-green-400 p-4 font-mono text-sm overflow-x-auto m-0">
{`{
  "key": "YOUR_API_KEY",
  "action": "balance"
}`}
              </pre>
            </div>
         </section>

         <section className="bg-white border rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-50 border-b px-4 py-3 flex text-sm flex-col sm:flex-row sm:items-center justify-between">
              <h3 className="font-semibold text-gray-800">4. Order Status</h3>
              <p className="text-gray-500 text-xs mt-1 sm:mt-0 font-mono"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold mr-2 text-[10px]">POST</span>{baseUrl}</p>
            </div>
            <div className="p-0">
              <pre className="bg-gray-900 text-green-400 p-4 font-mono text-sm overflow-x-auto m-0">
{`{
  "key": "YOUR_API_KEY",
  "action": "status",
  "order": 12345
}`}
              </pre>
            </div>
         </section>
      </motion.div>
    </motion.div>
  );
}
