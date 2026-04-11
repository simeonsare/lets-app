import { useNavigate } from "react-router";
import {
  Package,
  Users,
  Bike,
  TrendingUp,
  LogOut,
  Layers,
  UserCog,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

// Mock data
const stats = {
  totalDeliveries: 245,
  activeDeliveries: 18,
  totalRiders: 12,
  activeRiders: 8,
  totalTraders: 56,
  completedToday: 23,
  pendingAssignments: 5,
  revenue: 125000,
};

const recentDeliveries = [
  {
    id: "DEL010",
    trader: "Trader M",
    destination: "Modern Coast",
    status: "delivered",
    rider: "John Kamau",
    time: "10 mins ago",
  },
  {
    id: "DEL009",
    trader: "Trader N",
    destination: "Easy Coach",
    status: "in_transit",
    rider: "Mary Wanjiru",
    time: "25 mins ago",
  },
  {
    id: "DEL008",
    trader: "Trader P",
    destination: "Guardian Coach",
    status: "pending",
    rider: null,
    time: "1 hour ago",
  },
];

const topRiders = [
  { name: "John Kamau", deliveries: 45, rating: 4.9 },
  { name: "Mary Wanjiru", deliveries: 42, rating: 4.8 },
  { name: "Peter Ochieng", deliveries: 38, rating: 4.7 },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "in_transit":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            <TrendingUp className="w-3 h-3" />
            In Transit
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
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
            <div className="flex items-center justify-center w-10 h-10 bg-purple-600 rounded-lg">
              <UserCog className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">System Overview</p>
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
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-gray-600 text-sm mb-1">Total Deliveries</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalDeliveries}</p>
            <p className="text-sm text-green-600 mt-2">+12% this week</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Bike className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">Active Riders</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.activeRiders}/{stats.totalRiders}
            </p>
            <p className="text-sm text-gray-600 mt-2">On duty now</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">Total Traders</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalTraders}</p>
            <p className="text-sm text-gray-600 mt-2">Registered users</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-1">Completed Today</p>
            <p className="text-3xl font-bold text-gray-900">{stats.completedToday}</p>
            <p className="text-sm text-gray-600 mt-2">Deliveries</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => navigate("/admin/batch-delivery")}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition text-left"
          >
            <Layers className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Batch Deliveries</h3>
            <p className="text-sm text-gray-600">Manage delivery batches</p>
          </button>

          <button
            onClick={() => navigate("/admin/rider-assignment")}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition text-left"
          >
            <Bike className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Rider Assignment</h3>
            <p className="text-sm text-gray-600">Assign riders to deliveries</p>
          </button>

          <button
            onClick={() => navigate("/reports")}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition text-left"
          >
            <FileText className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Reports</h3>
            <p className="text-sm text-gray-600">View system reports</p>
          </button>

          <button 
          onClick={() => navigate("/admin/addlsp")}
          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition text-left">
            <Users className="w-8 h-8 text-indigo-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Manage LSPs</h3>
            <p className="text-sm text-gray-600">Add and manage Logistics Service Providers</p>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Deliveries */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
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
                      Rider
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentDeliveries.map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-sm font-medium text-gray-900">
                        {delivery.id}
                      </td>
                      <td className="px-6 py-4 text-gray-900">{delivery.trader}</td>
                      <td className="px-6 py-4 text-gray-900">{delivery.destination}</td>
                      <td className="px-6 py-4 text-gray-900">
                        {delivery.rider || (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(delivery.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {delivery.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* System Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold text-gray-900">Pending Assignments</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.pendingAssignments}
                </p>
                <button
                  onClick={() => navigate("/admin/rider-assignment")}
                  className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Assign now →
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Active Deliveries</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.activeDeliveries}
                </p>
                <p className="mt-3 text-sm text-gray-600">In progress</p>
              </div>
            </div>
          </div>

          {/* Top Riders */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Top Riders</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                {topRiders.map((rider, index) => (
                  <div
                    key={rider.name}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full text-white font-bold text-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{rider.name}</h4>
                      <p className="text-sm text-gray-600">
                        {rider.deliveries} deliveries
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-semibold text-gray-900">
                          {rider.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Card */}
            <div className="mt-6 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-sm p-6 text-white">
              <h3 className="font-semibold mb-2">Total Revenue (March)</h3>
              <p className="text-3xl font-bold mb-1">
                KSh {stats.revenue.toLocaleString()}
              </p>
              <p className="text-sm text-indigo-200">+18% from last month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
