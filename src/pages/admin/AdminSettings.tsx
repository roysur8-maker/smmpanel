import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminSettings() {
  const [settings, setSettings] = useState({ provider_url: "", provider_key: "", commission_percent: "10", payment_instructions: "", qr_url: "", upi_id: "" });
  const [message, setMessage] = useState("");
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    axios.get("/api/admin/settings").then(res => {
       setSettings({
         provider_url: res.data.provider_url || "",
         provider_key: res.data.provider_key || "",
         commission_percent: res.data.commission_percent || "10",
         payment_instructions: res.data.payment_instructions || "",
         qr_url: res.data.qr_url || "",
         upi_id: res.data.upi_id || "",
       });
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/admin/settings", settings);
      setMessage("Settings saved successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      alert("Error saving settings");
    }
  };

  const handleSync = async () => {
    setSyncMessage("Syncing...");
    try {
      const res = await axios.post("/api/admin/provider/sync");
      setSyncMessage(`Success: Sync complete. Imported ${res.data.count} services.`);
    } catch (e: any) {
      setSyncMessage("Error: " + (e.response?.data?.error || e.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <h2 className="text-xl font-semibold mb-6 border-b pb-2">Provider API Settings</h2>
        
        {message && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded border border-green-200">{message}</div>}
        
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider API URL</label>
            <input type="url" value={settings.provider_url} onChange={e => setSettings({...settings, provider_url: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 py-2 border px-3" placeholder="https://provider.com/api/v2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider API Key</label>
            <input type="password" value={settings.provider_key} onChange={e => setSettings({...settings, provider_key: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 py-2 border px-3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commission % (Added to Provider Prices)</label>
            <input type="number" value={settings.commission_percent} onChange={e => setSettings({...settings, commission_percent: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 py-2 border px-3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
            <div className="flex space-x-2">
              <input type="text" value={settings.upi_id} onChange={e => setSettings({...settings, upi_id: e.target.value})} className="flex-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 py-2 border px-3" placeholder="surya.roy@ptyes" />
              <button type="button" onClick={() => {
                if(settings.upi_id) {
                  setSettings({...settings, qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(settings.upi_id)}%26pn=SMM_Panel`});
                }
              }} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium whitespace-nowrap">
                Generate QR
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Enter your UPI ID and click "Generate QR" to instantly create a payment QR code.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Instructions</label>
            <textarea value={settings.payment_instructions} onChange={e => setSettings({...settings, payment_instructions: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 py-2 border px-3" rows={3} placeholder="Scan the QR code..."></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">QR Code Image</label>
            <div className="flex items-center space-x-4">
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                   const reader = new FileReader();
                   reader.onloadend = () => {
                     setSettings({...settings, qr_url: reader.result as string});
                   };
                   reader.readAsDataURL(file);
                }
              }} className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100" 
              />
              {settings.qr_url && (
                <div className="flex flex-col items-center">
                  <img src={settings.qr_url} alt="QR Preview" className="h-16 w-16 object-cover border rounded" />
                  <button type="button" onClick={() => setSettings({...settings, qr_url: ''})} className="text-xs text-red-500 mt-1 hover:underline">Remove</button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Upload a QR code to be displayed on the 'Add Funds' page for users to scan and pay.</p>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
            Save Settings
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
         <h2 className="text-xl font-semibold mb-4 border-b pb-2">Sync Services</h2>
         <p className="text-gray-600 text-sm mb-4">Fetch the latest services from the provider. Your commission percentage will be applied automatically.</p>
         
         <button onClick={handleSync} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">
            Fetch & Sync Services
         </button>

         {syncMessage && <div className="mt-4 p-3 bg-gray-50 text-gray-800 rounded border text-sm font-mono">{syncMessage}</div>}
      </div>
    </div>
  );
}
