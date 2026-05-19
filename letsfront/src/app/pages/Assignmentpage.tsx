import { useNavigate } from "react-router";
import {
  ArrowLeft,
  MapPin,
  Package,
  CheckCircle,
  User,
  Navigation,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const token = localStorage.getItem("authToken");

interface AssignedOrder {
  request_id: number;
  pickup: string;
  dropoff: string;
  package_details: string;
  quantity: number;
  trader_name?: string;
  trader_phone?: string;
  status?: string;
}

export default function RiderAssignments() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<AssignedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch assigned rider deliveries
  useEffect(() => {
    fetch("/api/rider/assigned-orders/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`,
      },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch assigned orders");
        }
        return res.json();
      })
      .then((data) => {
        setOrders(data.assigned_requests || []);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load assigned deliveries");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Mark delivery complete
  const handleComplete = async (requestId: number) => {
    try {
      const res = await fetch(`/api/rider/complete/${requestId}/`, {
        method: "POST",
        headers: {
          "Authorization": `Token ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed");
      }

      setOrders((prev) =>
        prev.filter((order) => order.request_id !== requestId)
      );

      toast.success("Delivery marked as completed!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete delivery");
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Package className="w-12 h-12 text-indigo-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold text-gray-900">
            Loading assigned deliveries...
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Please wait while we fetch your assignments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Assigned Deliveries
            </h1>
            <p className="text-sm text-gray-600">
              Orders currently assigned to you
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <Package className="w-14 h-14 text-gray-300 mx-auto mb-4" />

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Assigned Deliveries
            </h2>

            <p className="text-gray-600">
              You currently have no active delivery assignments.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.request_id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Top */}
                <div className="border-b border-gray-100 px-6 py-5 flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Order #{order.request_id}
                    </h2>

                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Assigned to you
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-semibold text-indigo-600">
                      {order.status || "In Transit"}
                    </p>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  {/* Locations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Pickup Location
                      </p>

                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <MapPin className="w-5 h-5 text-blue-600" />
                        </div>

                        <p className="text-gray-900 font-medium">
                          {order.pickup}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Delivery Destination
                      </p>

                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-indigo-100">
                          <Navigation className="w-5 h-5 text-indigo-600" />
                        </div>

                        <p className="text-gray-900 font-medium">
                          {order.dropoff}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Package */}
                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-orange-100">
                        <Package className="w-5 h-5 text-orange-600" />
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Package Details
                        </p>

                        <p className="font-semibold text-gray-900">
                          {order.package_details}
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                          Quantity: {order.quantity} Kg
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Trader */}
                  {(order.trader_name || order.trader_phone) && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-indigo-100">
                          <User className="w-5 h-5 text-indigo-600" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-indigo-900 mb-1">
                            Trader Information
                          </p>

                          <p className="text-indigo-900">
                            {order.trader_name}
                          </p>

                          <p className="text-sm text-indigo-700">
                            {order.trader_phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleComplete(order.request_id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 transition text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Mark as Completed
                    </button>

                    
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}