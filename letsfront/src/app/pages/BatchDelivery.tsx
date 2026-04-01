import { useNavigate } from "react-router";
import { Package, ArrowLeft, Users, MapPin, Calendar, Layers } from "lucide-react";

// Mock batch delivery data
const mockBatches = [
  {
    id: "BATCH001",
    destination: "Modern Coast",
    deliveries: ["DEL001", "DEL003", "DEL007"],
    traders: ["Trader A", "Trader B", "Trader C"],
    totalItems: 18,
    status: "ready",
    createdAt: "2026-03-28 10:00",
  },
  {
    id: "BATCH002",
    destination: "Easy Coach",
    deliveries: ["DEL002", "DEL004", "DEL005"],
    traders: ["Trader D", "Trader E", "Trader F"],
    totalItems: 15,
    status: "assigned",
    createdAt: "2026-03-28 09:30",
    rider: "John Kamau",
  },
  {
    id: "BATCH003",
    destination: "Guardian Coach",
    deliveries: ["DEL006", "DEL008"],
    traders: ["Trader G", "Trader H"],
    totalItems: 12,
    status: "completed",
    createdAt: "2026-03-27 14:00",
    rider: "Mary Wanjiru",
  },
];

const pendingDeliveries = [
  {
    id: "DEL009",
    trader: "Trader J",
    destination: "Modern Coast",
    items: 5,
  },
  {
    id: "DEL010",
    trader: "Trader K",
    destination: "Modern Coast",
    items: 7,
  },
  {
    id: "DEL011",
    trader: "Trader L",
    destination: "Easy Coach",
    items: 4,
  },
];

export default function BatchDelivery() {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            Ready to Assign
          </span>
        );
      case "assigned":
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            Assigned
          </span>
        );
      case "completed":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-600 rounded-lg">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Batch Delivery Management</h1>
              <p className="text-sm text-gray-600">Group deliveries by destination</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <p className="text-gray-600 text-sm mb-1">Active Batches</p>
            <p className="text-3xl font-bold text-gray-900">
              {mockBatches.filter((b) => b.status !== "completed").length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <p className="text-gray-600 text-sm mb-1">Total Items</p>
            <p className="text-3xl font-bold text-gray-900">
              {mockBatches.reduce((sum, b) => sum + b.totalItems, 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <p className="text-gray-600 text-sm mb-1">Pending Deliveries</p>
            <p className="text-3xl font-bold text-gray-900">{pendingDeliveries.length}</p>
          </div>
        </div>

        {/* Existing Batches */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Batches</h2>
          <div className="space-y-4">
            {mockBatches.map((batch) => (
              <div
                key={batch.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-mono text-lg font-bold text-gray-900 mb-1">
                      {batch.id}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{batch.destination}</span>
                    </div>
                  </div>
                  {getStatusBadge(batch.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Deliveries</p>
                      <p className="font-semibold text-gray-900">
                        {batch.deliveries.length}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Traders</p>
                      <p className="font-semibold text-gray-900">{batch.traders.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Total Items</p>
                      <p className="font-semibold text-gray-900">{batch.totalItems}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-semibold text-gray-900">{batch.createdAt}</p>
                    </div>
                  </div>
                </div>

                {batch.rider && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">Assigned to:</span> {batch.rider}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => navigate("/admin/rider-assignment")}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                  >
                    {batch.status === "ready" ? "Assign Rider" : "View Details"}
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                    View Deliveries
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Deliveries - Available for Batching */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Pending Deliveries (Available for Batching)
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Delivery ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Trader
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Destination
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Items
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingDeliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="w-4 h-4 rounded" />
                    </td>
                    <td className="px-6 py-4 font-mono text-sm font-medium text-gray-900">
                      {delivery.id}
                    </td>
                    <td className="px-6 py-4 text-gray-900">{delivery.trader}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{delivery.destination}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{delivery.items}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold">
              Create Batch from Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
