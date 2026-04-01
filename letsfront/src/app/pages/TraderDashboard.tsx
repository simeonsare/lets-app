import { useNavigate } from "react-router";
import {
  Package,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  LogOut,
  MapPin,
  User,
} from "lucide-react";

// Mock delivery data
const mockDeliveries = [
  {
    id: "DEL001",
    destination: "Modern Coast",
    packageDesc: "Electronics",
    quantity: 5,
    status: "delivered",
    date: "2026-03-28",
    rider: "John Kamau",
  },
  {
    id: "DEL002",
    destination: "Easy Coach",
    packageDesc: "Clothing",
    quantity: 3,
    status: "assigned",
    date: "2026-03-28",
    rider: "Mary Wanjiru",
  },
  {
    id: "DEL003",
    destination: "Modern Coast",
    packageDesc: "Books",
    quantity: 10,
    status: "pending",
    date: "2026-03-28",
    rider: null,
  },
  {
    id: "DEL004",
    destination: "Easy Coach",
    packageDesc: "Shoes",
    quantity: 7,
    status: "assigned",
    date: "2026-03-27",
    rider: "Peter Ochieng",
  },
];

export default function TraderDashboard() {
  const navigate = useNavigate();

  const pendingCount = mockDeliveries.filter((d) => d.status === "pending").length;
  const assignedCount = mockDeliveries.filter((d) => d.status === "assigned").length;
  const deliveredCount = mockDeliveries.filter((d) => d.status === "delivered").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Pending
          </span>
        );
      case "assigned":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            Assigned
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Delivered
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-indigo-600 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Trader Dashboard</h1>
              <p className="text-sm text-gray-600">Kamukunji Market</p>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Pending Requests</p>
                <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">In Progress</p>
                <p className="text-3xl font-bold text-gray-900">{assignedCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{deliveredCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Create Request Button */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">My Deliveries</h2>
          <button
            onClick={() => navigate("/trader/request")}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
          >
            <Plus className="w-5 h-5" />
            Create Delivery Request
          </button>
        </div>

        {/* Deliveries Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Destination
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Package
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Rider
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockDeliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {delivery.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{delivery.destination}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{delivery.packageDesc}</td>
                    <td className="px-6 py-4 text-gray-900">{delivery.quantity} items</td>
                    <td className="px-6 py-4">
                      {delivery.rider ? (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{delivery.rider}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(delivery.status)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/tracking/${delivery.id}`)}
                        className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                      >
                        Track
                      </button>
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
