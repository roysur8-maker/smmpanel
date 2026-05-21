import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../lib/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, ShoppingCart, Info, TrendingUp } from "lucide-react";

export default function NewOrder() {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { user, refreshUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    axios.get("/api/services").then(res => {
      setServices(res.data);
      const cats = [...new Set(res.data.map((s: any) => s.category))] as string[];
      setCategories(cats);
      if (cats.length > 0) setSelectedCategory(cats[0]);
    });
  }, []);

  const filteredServices = services.filter(s => s.category === selectedCategory);
  
  // Update selected service when category changes
  useEffect(() => {
    if (filteredServices.length > 0 && !filteredServices.find(s => s.id.toString() === selectedService)) {
      setSelectedService(filteredServices[0].id.toString());
    }
  }, [selectedCategory, filteredServices]);

  const activeServiceInfo = services.find(s => s.id.toString() === selectedService);
  const quantityNum = parseInt(quantity || "0");
  const charge = activeServiceInfo && quantityNum > 0 ? (activeServiceInfo.rate / 1000) * quantityNum : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(""); setError("");
    setIsSubmitting(true);
    try {
      const res = await axios.post("/api/user/orders", {
        service_id: selectedService, link, quantity: quantityNum
      });
      setMessage("Order placed successfully! Order ID: " + res.data.order_id);
      refreshUser();
      setLink(""); setQuantity("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Error placing order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <motion.div 
         initial={{ opacity: 0, x: -20 }} 
         animate={{ opacity: 1, x: 0 }} 
         className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col items-center sm:flex-row sm:justify-between">
           <div className="flex items-center space-x-3">
             <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <ShoppingCart size={24} />
             </div>
             <h2 className="text-xl font-bold text-gray-800">New Order</h2>
           </div>
        </div>
        
        <div className="p-6">
          <AnimatePresence mode="wait">
            {message && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: "auto" }} 
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-start"
              >
                <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5 mt-0" />
                <span className="font-medium text-sm">{message}</span>
              </motion.div>
            )}
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: "auto" }} 
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start"
              >
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span className="font-medium text-sm">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Category</label>
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3 border px-3 appearance-none bg-gray-50/50 transition-colors hover:bg-gray-50">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Service</label>
              <select value={selectedService} onChange={e => setSelectedService(e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3 border px-3 appearance-none bg-gray-50/50 transition-colors hover:bg-gray-50 text-sm">
                {filteredServices.map(s => <option key={s.id} value={s.id}>{s.id} - {s.name}</option>)}
              </select>
            </div>

            <motion.div layout className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 space-y-2">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-600 flex items-center"><Info className="h-4 w-4 mr-1 text-blue-500" /> Rate per 1000:</span>
                 <span className="font-bold text-gray-900 border bg-white px-2 py-0.5 rounded shadow-sm text-xs border-blue-200">
                   ₹{activeServiceInfo ? activeServiceInfo.rate.toFixed(2) : "0.00"}
                 </span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-600">Limits:</span>
                 <span className="font-medium text-gray-700">
                    Min: {activeServiceInfo?.min || 0} / Max: {activeServiceInfo?.max || 0}
                 </span>
               </div>
            </motion.div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Target Link</label>
              <input type="url" required value={link} onChange={e => setLink(e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3 border px-3 bg-gray-50/50 transition-colors" placeholder="https://instagram.com/p/..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="col-span-2">
                 <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                 <input type="number" required min={activeServiceInfo?.min} max={activeServiceInfo?.max} value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3 border px-3 text-lg font-medium text-blue-700 bg-gray-50/50 transition-colors" placeholder="e.g. 1000" />
               </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <button 
                 type="submit" 
                 disabled={charge === 0 || charge > (user?.balance || 0) || isSubmitting} 
                 className={`px-8 py-3 rounded-lg font-semibold text-white shadow-md transition-all active:scale-95 ${charge > 0 && charge <= (user?.balance || 0) ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30' : 'bg-gray-400 cursor-not-allowed text-gray-100'} min-w-[150px]`}
                 >
                {isSubmitting ? "Processing..." : "Place Order"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Calculator Sidebar */}
      <motion.div 
         initial={{ opacity: 0, x: 20 }} 
         animate={{ opacity: 1, x: 0 }} 
         className="md:col-span-1 space-y-6"
      >
         <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 opacity-5 rounded-full -mr-16 -mt-16 blur-xl"></div>
            <div className="p-6">
              <h3 className="font-semibold text-orange-900 mb-4 flex items-center tracking-tight">
                <TrendingUp className="h-5 w-5 mr-2 text-orange-600" /> Calculator
              </h3>
              
              <div className="space-y-4">
                 <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Quantity</p>
                    <p className="font-mono text-gray-800 text-lg">{quantityNum > 0 ? quantityNum.toLocaleString() : "0"}</p>
                 </div>
                 
                 <div className="border-t border-orange-100 pt-4">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Service Rate</p>
                    <p className="font-mono text-gray-800">₹{activeServiceInfo?.rate.toFixed(2) || "0.00"} <span className="text-xs text-gray-400">/ 1k</span></p>
                 </div>
                 
                 <div className="border-t border-orange-100 pt-4 bg-orange-50/50 -mx-6 px-6 pb-2 mt-4 rounded-b-xl">
                    <p className="text-xs text-orange-600/80 uppercase font-bold mb-1 pt-4">Total Charge</p>
                    <AnimatePresence mode="popLayout">
                       <motion.p 
                          key={charge}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`text-4xl font-black ${charge > (user?.balance || 0) ? 'text-red-500 block' : 'text-orange-600 block'}`}
                          style={{ minHeight: '40px' }}
                       >
                         ₹{charge.toFixed(3)}
                       </motion.p>
                    </AnimatePresence>
                    
                    {charge > (user?.balance || 0) && (
                       <p className="text-xs font-semibold text-red-500 mt-2 bg-red-50 p-2 border border-red-100 rounded inline-block">Insufficient Funds</p>
                    )}
                 </div>
              </div>
            </div>
         </div>

         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Your Balance</h3>
            <p className="text-3xl font-black text-gray-900">₹{(user?.balance || 0).toFixed(2)}</p>
            <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
               <motion.div 
                  className={`h-full ${charge > (user?.balance || 0) ? 'bg-red-500' : 'bg-green-500'}`} 
                  initial={{ width: 0 }}
                  animate={{ width: charge > 0 ? `${Math.min(100, (charge / (user?.balance || 1)) * 100)}%` : '0%' }}
                  transition={{ ease: "easeOut", duration: 0.5 }}
               />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-right">
               {charge > 0 && charge <= (user?.balance || 0) ? `${((charge / (user?.balance || 1)) * 100).toFixed(0)}% used via this order` : ''}
            </p>
         </div>
      </motion.div>
    </div>
  );
}
