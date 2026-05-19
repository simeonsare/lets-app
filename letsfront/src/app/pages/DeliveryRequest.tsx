import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, MapPin, Package, FileText, Hash, Send, DessertIcon } from "lucide-react";
import {toast } from "sonner";


const token =localStorage.getItem("authToken");

export default function DeliveryRequest() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    dropoff_location: "Modern Coast",
    package_details: "",
    quantity: "",
  });
  //GET dropoff location from backend and populate dropdown
  const [dropoffLocations, setDropoffLocations] = useState([]);
  useEffect(() => {
    fetch("/api/lsps/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`,
      },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          toast.error("Failed to fetch dropoff locations");
          throw new Error("Failed to fetch dropoff locations");
        }
        return res.json();
      })
      .then((data) => setDropoffLocations(data.lsps))
      .catch((err) => {
        toast.error("Failed to fetch dropoff locations");
        console.error(err);
      });
  }, []);
//payment modal states
const [showModal, setShowModal] = useState(false);
const [showSpinner, setShowSpinner] = useState(false);
const totalPrice = formData.quantity ? parseFloat(formData.quantity) * 50 : 0;
const [phoneNumber, setPhoneNumber] = useState("");

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    showModal ? setShowModal(false) : setShowModal(true);
    //show the payment modal first, then on confirm, process payment and submit request
    if (showModal) {
      const payres = await fetch("/api/process-payment/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`,
        },
        body: JSON.stringify({
          amount: 1,
          phone_number: phoneNumber,
          description: `Payment for delivery request to ${formData.dropoff_location} with quantity ${formData.quantity}kg`,
        }),
      });
      const payData: any = await payres.json();
      if (!payres.ok || payData.success === false) {
        toast.error(payData?.errorMessage || "Payment failed. Please try again.");
        setShowSpinner(false);
        return;
      } else {
        try {
          setShowSpinner(true);
          toast.success("Payment prompt sent to your phone. Please complete the payment to proceed.");
          const checkoutId = payData.CheckoutRequestID;
              // Poll every 3 seconds
          const interval = setInterval(async () => {
            const statusRes = await fetch(`/api/payment-status/${checkoutId}/`
              , {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Token ${token}`,
                },
              });
            const statusData = await statusRes.json();

            if (statusData.status === "success") {
              clearInterval(interval);
              setShowSpinner(false);
              toast.success("Payment successful! Your delivery request has been submitted.");
              setShowModal(false);
              // Proceed to create delivery request after successful payment
              try {

                const res = await fetch("/api/request-delivery/", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Token ${token}`,
                },
                body: JSON.stringify(formData),
              });

                if (!res.ok) {
                  throw new Error("Request failed");
                }
                const data = await res.json();
                toast.success("Request successful.");
                setTimeout(() => {
                  window.location.href = "/trader/dashboard";
                }, 1000); // 1-second delay 
                
              } catch (error) {
                
              }
            } else if (statusData.status === "failed") {
              clearInterval(interval);
              setShowSpinner(false);
              toast.error("Payment failed: " + statusData.message);
            }
          }, 3000);
        } catch (error) {
          setShowSpinner(false);
          toast.error("Error initiating payment");
        }
  
  };
        }
        return; 
      
    }
    
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
                  value={formData.dropoff_location}
                  onChange={(e) => updateField("dropoff_location", e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition appearance-none bg-white"
                  required
                >
                  <option value="">select an lsp</option>
                  {dropoffLocations.map((dropoffLocation: { name: string; price_per_kg: number }, index: number) => (
                    <option key={index} value={dropoffLocation.name}>
                      {dropoffLocation.name} - {dropoffLocation.price_per_kg} Ksh/kg
                    </option>
                  ))}
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
                  value={formData.package_details}
                  onChange={(e) => updateField("package_details", e.target.value)}
                  placeholder="e.g., Electronics:fridge, Clothing:shoes, Books..."
                  rows={4}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
                  required
                />
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Quantity in Kg
              </label>
              <p className="text-sm text-gray-600 mb-3">
                weight of packages or items
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

          {/*payment modal*/}
          {showModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "8px",
                width: "300px",
                textAlign: "center",
                boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
              }}
            >
              <h2>Payment Details</h2>
              <p>Total Price: {totalPrice} KES</p>
              <label>
                Phone Number:
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  style={{ marginTop: "10px", width: "100%", padding: "8px", border: "1px solid #020202ff", borderRadius: "4px"  }}
                />
              </label>
              <div style={{ marginTop: "15px" }}>
                <button
                  onClick={handleSubmit}
                    style={{
                    marginRight: "10px",
                    padding: "8px 12px",
                    backgroundColor: "#4CAF50",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Confirm Payment
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#f44336",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

       {showSpinner && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2000,
    }}
  >
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "8px",
        textAlign: "center",
        boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
      }}
    >
      <svg
        aria-hidden="true"
        className="w-8 h-8 text-neutral-tertiary animate-spin fill-brand mx-auto mb-3"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <p>Processing Payment...</p>
    </div>
  </div>
)}



        </div>
      </div>

      



    </div>
  );
}


