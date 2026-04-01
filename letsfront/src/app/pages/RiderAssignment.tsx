import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  User,
  Bike,
  CheckCircle,
  XCircle,
  MapPin,
  Package,
} from "lucide-react";

// Mock riders
const mockRiders = [
  {
    id: "R001",
    name: "John Kamau",
    phone: "0712345678",
    status: "available",
    rating: 4.8,
    completedDeliveries: 145,
  },
  {
    id: "R002",
    name: "Mary Wanjiru",
    phone: "0723456789",
    status: "busy",
    rating: 4.9,
    completedDeliveries: 198,
  },
  {
    id: "R003",
    name: "Peter Ochieng",
    phone: "0734567890",
    status: "available",
    rating: 4.7,
    completedDeliveries: 132,
  },
  {
    id: "R004",
    name: "Grace Akinyi",
    phone: "0745678901",
    status: "available",
    rating: 4.9,
    completedDeliveries: 167,
  },
  {
    id: "R005",
    name: "James Mwangi",
    phone: "0756789012",
    status: "busy",
    rating: 4.6,
    completedDeliveries: 89,
  },
];

// Mock pending deliveries/batches
const pendingAssignments = [
  {
    id: "BATCH001",
    type: "batch",
    destination: "Modern Coast",
    deliveries: 3,
    totalItems: 18,
  },
  {
    id: "DEL010",
    type: "single",
    destination: "Easy Coach",
    trader: "Trader X",
    items: 5,
  },
];

export default function RiderAssignment() {
  const navigate = useNavigate();
  const [selectedRider, setSelectedRider] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);

  const handleAssign = () => {
    if (selectedRider && selectedAssignment) {
      alert(`Assigned ${selectedAssignment} to rider ${selectedRider}`);
      setSelectedRider(null);
      setSelectedAssignment(null);
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
            <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-lg">
              <Bike className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Rider Assignment</h1>
              <p className="text-sm text-gray-600">Assign deliveries to available riders</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <p className="text-gray-600 text-sm mb-1">Total Riders</p>
            <p className="text-3xl font-bold text-gray-900">{mockRiders.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <p className="text-gray-600 text-sm mb-1">Available</p>
            <p className="text-3xl font-bold text-green-600">
              {mockRiders.filter((r) => r.status === "available").length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <p className="text-gray-600 text-sm mb-1">Busy</p>
            <p className="text-3xl font-bold text-orange-600">
              {mockRiders.filter((r) => r.status === "busy").length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <p className="text-gray-600 text-sm mb-1">Pending Assignments</p>
            <p className="text-3xl font-bold text-gray-900">
              {pendingAssignments.length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Riders */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Riders</h2>
            <div className="space-y-3">
              {mockRiders.map((rider) => (
                <div
                  key={rider.id}
                  onClick={() =>
                    rider.status === "available" && setSelectedRider(rider.id)
                  }
                  className={`bg-white rounded-xl shadow-sm border-2 p-5 transition cursor-pointer ${
                    selectedRider === rider.id
                      ? "border-indigo-500 bg-indigo-50"
                      : rider.status === "available"
                      ? "border-gray-200 hover:border-indigo-300"
                      : "border-gray-200 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {rider.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{rider.name}</h3>
                        <p className="text-sm text-gray-600">{rider.phone}</p>
                      </div>
                    </div>
                    {rider.status === "available" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                        <XCircle className="w-3 h-3" />
                        Busy
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium">{rider.rating}</span>
                    </div>
                    <div>
                      <span className="font-medium">{rider.completedDeliveries}</span>{" "}
                      deliveries
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Manual/Auto Toggle */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Assignment Mode</h3>
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium">
                  Manual
                </button>
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                  Automatic
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                In automatic mode, the system assigns riders based on availability and
                proximity.
              </p>
            </div>
          </div>

          {/* Pending Assignments */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Pending Assignments
            </h2>
            <div className="space-y-3 mb-6">
              {pendingAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  onClick={() => setSelectedAssignment(assignment.id)}
                  className={`bg-white rounded-xl shadow-sm border-2 p-5 transition cursor-pointer ${
                    selectedAssignment === assignment.id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-mono font-bold text-gray-900 mb-1">
                        {assignment.id}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{assignment.destination}</span>
                      </div>
                    </div>
                    {assignment.type === "batch" ? (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        Batch
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        Single
                      </span>
                    )}
                  </div>
                  {assignment.type === "batch" ? (
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span>
                          {assignment.deliveries} deliveries
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">{assignment.totalItems}</span> items
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{assignment.trader}</span>
                      </div>
                      <div>
                        <span className="font-medium">{assignment.items}</span> items
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Assign Button */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Confirm Assignment
              </h3>
              {selectedRider && selectedAssignment ? (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-900">
                    <span className="font-semibold">Rider:</span>{" "}
                    {mockRiders.find((r) => r.id === selectedRider)?.name}
                  </p>
                  <p className="text-sm text-green-900 mt-1">
                    <span className="font-semibold">Assignment:</span> {selectedAssignment}
                  </p>
                </div>
              ) : (
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Select a rider and an assignment to proceed
                  </p>
                </div>
              )}
              <button
                onClick={handleAssign}
                disabled={!selectedRider || !selectedAssignment}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Assign Rider
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
