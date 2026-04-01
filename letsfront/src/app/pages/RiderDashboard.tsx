import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Bike,
  Package,
  CheckCircle,
  XCircle,
  MapPin,
  Navigation,
  LogOut,
  Clock,
} from "lucide-react";

// Mock assigned deliveries
const mockAssignedDeliveries = [
  {
    id: "DEL002",
    type: "single",
    trader: "Trader B",
    traderPhone: "0711234567",
    pickup: "Shop 45, Block A, Kamukunji",
    destination: "Easy Coach",
    packageDesc: "Clothing",
    items: 3,
    status: "pending",
  },
  {
    id: "BATCH002",
    type: "batch",
    deliveriesCount: 3,
    traders: ["Trader D", "Trader E", "Trader F"],
    pickup: "Kamukunji Market",
    destination: "Modern Coast",
    totalItems: 15,
    status: "accepted",
  },
];

const completedDeliveries = [
  {
    id: "DEL001",
    destination: "Modern Coast",
    completedAt: "2026-03-28 14:30",
  },
  {
    id: "BATCH001",
    destination: "Easy Coach",
    completedAt: "2026-03-28 12:15",
  },
];

export default function RiderDashboard() {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState(mockAssignedDeliveries);

  const handleAccept = (id: string) => {
    setDeliveries(
      deliveries.map((d) => (d.id === id ? { ...d, status: "accepted" } : d))
    );
  };

  const handleReject = (id: string) => {
    if (confirm("Are you sure you want to reject this delivery?")) {
      setDeliveries(deliveries.filter((d) => d.id !== id));
    }
  };

  const handleUpdateStatus = (id: string) => {
    navigate(`/delivery/${id}/proof`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-lg">
              <Bike className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Rider Dashboard</h1>
              <p className="text-sm text-gray-600">John Kamau</p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Active Deliveries</p>
                <p className="text-3xl font-bold text-gray-900">{deliveries.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Completed Today</p>
                <p className="text-3xl font-bold text-gray-900">
                  {completedDeliveries.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Rating</p>
                <p className="text-3xl font-bold text-gray-900">4.8</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">★</span>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Deliveries */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Assigned Deliveries</h2>
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-mono text-lg font-bold text-gray-900 mb-1">
                      {delivery.id}
                    </h3>
                    {delivery.type === "batch" ? (
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        Batch Delivery ({delivery.deliveriesCount} deliveries)
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        Single Delivery
                      </span>
                    )}
                  </div>
                  {delivery.status === "pending" ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      <Clock className="w-4 h-4" />
                      Pending Response
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Accepted
                    </span>
                  )}
                </div>

                {/* Delivery Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pickup Location</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-gray-900">{delivery.pickup}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Destination</p>
                    <div className="flex items-start gap-2">
                      <Navigation className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-gray-900">{delivery.destination}</p>
                    </div>
                  </div>
                </div>

                {delivery.type === "single" ? (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-2">Package Details</p>
                    <p className="text-gray-900 font-medium mb-1">
                      {delivery.packageDesc}
                    </p>
                    <p className="text-sm text-gray-600">
                      Quantity: {delivery.items} items
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Trader: {delivery.trader} ({delivery.traderPhone})
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-2">Batch Details</p>
                    <p className="text-gray-900 font-medium mb-1">
                      {delivery.totalItems} total items
                    </p>
                    <p className="text-sm text-gray-600">
                      Traders: {delivery.traders?.join(", ")}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  {delivery.status === "pending" ? (
                    <>
                      <button
                        onClick={() => handleAccept(delivery.id)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(delivery.id)}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate(`/tracking/${delivery.id}`)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(delivery.id)}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                      >
                        Update Status
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Deliveries */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Completed Deliveries (Today)
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Delivery ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Destination
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Completed At
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {completedDeliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm font-medium text-gray-900">
                      {delivery.id}
                    </td>
                    <td className="px-6 py-4 text-gray-900">{delivery.destination}</td>
                    <td className="px-6 py-4 text-gray-900">{delivery.completedAt}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Delivered
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
