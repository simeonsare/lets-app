import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, MapPin, Package, FileText, Hash, Send } from "lucide-react";
import {toast } from "sonner";


const token =localStorage.getItem("authToken");

export default function DeliveryRequest() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    buildingname: "",
    stallnumber:"",
    destination: "Modern Coast",
    packageDesc: "",
    quantity: "",
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await fetch("/api/deliveryrequest/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }
      const data = await res.json();
      toast.success("Request successful.");
      setTimeout(() => {
        window.location.href = "/trader/request${requestid}";
      }, 2000); // 2-second delay
      
    } catch (error) {
      
    }
    // Mock submission - would save to backend
    alert("Delivery request submitted successfully!");
    navigate("/trader/dashboard");
  };
  const handlePinLocation = (e:React.FormEvent) =>{

  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/trader/dashboard")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Create Delivery Request</h1>
            <p className="text-sm text-gray-600">Fill in the details below</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Building Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Building Name
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Your shop location in Kamukunji Market
              </p>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.buildingname}
                  onChange={(e) => updateField("buildingname", e.target.value)}
                  placeholder="e.g., Wameni Complex"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  required
                />
                <div>
                  <p>Your Shop/stall number </p>
                  <input
                  type="text"
                  value={formData.stallnumber}
                  onChange={(e) => updateField("stallnumber", e.target.value)}
                  placeholder="e.g., stall 2F1"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  required
                />
                </div>
                
              </div>
               <button type="button" onClick={handlePinLocation}>
                📍 Pin Location
              </button>
            </div>

            {/* Destination */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Destination (Parcel Office)
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Select the parcel transport office
              </p>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={formData.destination}
                  onChange={(e) => updateField("destination", e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition appearance-none bg-white"
                  required
                >
                  <option value="Modern Coast">Modern Coast</option>
                  <option value="Easy Coach">Easy Coach</option>
                  <option value="Guardian Coach">Guardian Coach</option>
                  <option value="Mash Poa">Mash Poa</option>
                  <option value="Ena Coach">Ena Coach</option>
                </select>
              </div>
            </div>

            {/* Package Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Package Description
              </label>
              <p className="text-sm text-gray-600 mb-3">
                What are you sending?
              </p>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  value={formData.packageDesc}
                  onChange={(e) => updateField("packageDesc", e.target.value)}
                  placeholder="e.g., Electronics, Clothing, Books..."
                  rows={4}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
                  required
                />
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Quantity
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Number of packages or items
              </p>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => updateField("quantity", e.target.value)}
                  placeholder="e.g., 5"
                  min="1"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📦 What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your request will be reviewed by our system</li>
                <li>• A rider will be assigned to your delivery</li>
                <li>• You'll receive updates as your package moves</li>
                <li>• Track your delivery in real-time from your dashboard</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/trader/dashboard")}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
