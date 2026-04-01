import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Calendar,
  Download,
  Filter,
  FileText,
  TrendingUp,
  Package,
  Users,
  MapPin,
} from "lucide-react";

// Mock report data
const reportData = [
  {
    id: "DEL001",
    date: "2026-03-28",
    trader: "Trader A",
    rider: "John Kamau",
    destination: "Modern Coast",
    items: 5,
    status: "Delivered",
  },
  {
    id: "DEL002",
    date: "2026-03-28",
    trader: "Trader B",
    rider: "Mary Wanjiru",
    destination: "Easy Coach",
    items: 3,
    status: "In Transit",
  },
  {
    id: "DEL003",
    date: "2026-03-28",
    trader: "Trader C",
    rider: "Not Assigned",
    destination: "Modern Coast",
    items: 10,
    status: "Pending",
  },
  {
    id: "DEL004",
    date: "2026-03-27",
    trader: "Trader D",
    rider: "Peter Ochieng",
    destination: "Guardian Coach",
    items: 7,
    status: "Delivered",
  },
  {
    id: "DEL005",
    date: "2026-03-27",
    trader: "Trader E",
    rider: "Grace Akinyi",
    destination: "Easy Coach",
    items: 4,
    status: "Delivered",
  },
];

const summary = {
  totalDeliveries: 245,
  completed: 198,
  pending: 12,
  inTransit: 35,
  totalRevenue: 125000,
  avgDeliveryTime: "2.5 hrs",
};

export default function Reports() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    startDate: "2026-03-27",
    endDate: "2026-03-28",
    rider: "all",
    destination: "all",
    status: "all",
  });

  const updateFilter = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleExport = (format: string) => {
    alert(`Exporting report as ${format.toUpperCase()}...`);
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
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-sm text-gray-600">Generate and export delivery reports</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-gray-400" />
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.totalDeliveries}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{summary.completed}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <p className="text-sm text-gray-600">In Transit</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">{summary.inTransit}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-yellow-500" />
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{summary.pending}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-600">💰</span>
              <p className="text-sm text-gray-600">Revenue</p>
            </div>
            <p className="text-xl font-bold text-gray-900">
              KSh {(summary.totalRevenue / 1000).toFixed(0)}k
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-600">⏱️</span>
              <p className="text-sm text-gray-600">Avg Time</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.avgDeliveryTime}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Filter Reports</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => updateFilter("startDate", e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => updateFilter("endDate", e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
                />
              </div>
            </div>

            {/* Rider Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rider
              </label>
              <select
                value={filters.rider}
                onChange={(e) => updateFilter("rider", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
              >
                <option value="all">All Riders</option>
                <option value="john">John Kamau</option>
                <option value="mary">Mary Wanjiru</option>
                <option value="peter">Peter Ochieng</option>
                <option value="grace">Grace Akinyi</option>
              </select>
            </div>

            {/* Destination Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination
              </label>
              <select
                value={filters.destination}
                onChange={(e) => updateFilter("destination", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
              >
                <option value="all">All Destinations</option>
                <option value="modern">Modern Coast</option>
                <option value="easy">Easy Coach</option>
                <option value="guardian">Guardian Coach</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter("status", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
              >
                <option value="all">All Status</option>
                <option value="delivered">Delivered</option>
                <option value="in_transit">In Transit</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm">
              Apply Filters
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm">
              Reset
            </button>
          </div>
        </div>

        {/* Export Options */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Delivery Report</h2>
          <div className="flex gap-3">
            <button
              onClick={() => handleExport("pdf")}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button
              onClick={() => handleExport("csv")}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Delivery ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Trader
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Rider
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Destination
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm font-medium text-gray-900">
                      {row.id}
                    </td>
                    <td className="px-6 py-4 text-gray-900">{row.date}</td>
                    <td className="px-6 py-4 text-gray-900">{row.trader}</td>
                    <td className="px-6 py-4 text-gray-900">{row.rider}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{row.destination}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{row.items}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          row.status === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : row.status === "In Transit"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">1</span> to{" "}
              <span className="font-medium">5</span> of{" "}
              <span className="font-medium">245</span> results
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm font-medium">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                3
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
