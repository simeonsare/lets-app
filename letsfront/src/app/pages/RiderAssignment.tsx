import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  User,
  Bike,
  CheckCircle,
  XCircle,
  MapPin,
  Package,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Rider {
  id: string;
  name: string;
  phone: string;
  is_online: boolean;
  is_busy: boolean;
  completed_deliveries: number;
  rating?: number;
}

interface PendingRequest {
  id: string;
  type?: string;
  destination: string;
  trader?: string;
  quantity?: number;
  status: string;
  pickup_location: string;
  dropoff_location: string;
  package_details: string;
}

export default function RiderAssignment() {
  const navigate = useNavigate();

  const [selectedRider, setSelectedRider] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [totalRiders, setTotalRiders]=useState(0);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Token ${localStorage.getItem("authToken")}`,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/rider-assignment-data/", { headers });
        if (res.ok) {
          const data = await res.json();

          const ridersData = data.availanble_riders;
          const requestsData = data.pending_requests;
          const total_riders = data.total_riders;

          setRiders(Array.isArray(ridersData) ? ridersData : []);
          setPendingRequests(Array.isArray(requestsData) ? requestsData : []);
          setTotalRiders(total_riders);
        }
      } catch (err) {
        toast.error("Failed to load assignment data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAssign = async () => {
    if (!selectedRider || !selectedAssignment) return;
    setAssigning(true);
    try {
      const res = await fetch("/api/assign-rider/", {
        method: "POST",
        headers,
        body: JSON.stringify({
          rider_id: selectedRider,
          request_id: selectedAssignment,
        }),
      });

      if (!res.ok) throw new Error("Assignment failed");

      toast.success("Rider assigned successfully");

      // Remove assigned request from pending list
      setPendingRequests((prev) =>
        prev.filter((r) => String(r.id) !== selectedAssignment)
      );
      // Mark rider as busy in UI
      setRiders((prev) =>
        prev.map((r) =>
          String(r.id) === selectedRider ? { ...r, is_busy: true } : r
        )
      );
      setSelectedRider(null);
      setSelectedAssignment(null);
    } catch {
      toast.error("Failed to assign rider");
    } finally {
      setAssigning(false);
    }
  };

  const availableCount = riders.filter((r) => r.is_online && !r.is_busy).length;
  const busyCount = riders.filter((r) => r.is_busy).length;

  const selectedRiderData = riders.find((r) => String(r.id) === selectedRider);
  const selectedRequestData = pendingRequests.find(
    (r) => String(r.id) === selectedAssignment
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading assignment data...</span>
        </div>
      </div>
    );
  }

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
              <p className="text-sm text-gray-600">
                Assign deliveries to available riders
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <p className="text-gray-600 text-sm mb-1">Total Riders</p>
            <p className="text-3xl font-bold text-gray-900">{totalRiders}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <p className="text-gray-600 text-sm mb-1">Available Riders</p>
            <p className="text-3xl font-bold text-green-600">{availableCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <p className="text-gray-600 text-sm mb-1">Busy Riders</p>
            <p className="text-3xl font-bold text-orange-600">{busyCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <p className="text-gray-600 text-sm mb-1">Pending Assignments</p>
            <p className="text-3xl font-bold text-gray-900">
              {pendingRequests.length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Riders List */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Riders</h2>
            <div className="space-y-3">
              {riders.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                  No riders found
                </div>
              ) : (
                riders.map((rider) => {
                  const isAvailable = rider.is_online && !rider.is_busy;
                  return (
                    <div
                      key={rider.id}
                      onClick={() =>
                        isAvailable && setSelectedRider(String(rider.id))
                      }
                      className={`bg-white rounded-xl shadow-sm border-2 p-5 transition ${
                        selectedRider === String(rider.id)
                          ? "border-indigo-500 bg-indigo-50"
                          : isAvailable
                          ? "border-gray-200 hover:border-indigo-300 cursor-pointer"
                          : "border-gray-200 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {rider.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {rider.name}
                            </h3>
                            <p className="text-sm text-gray-600">{rider.phone}</p>
                          </div>
                        </div>
                        {isAvailable ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Available
                          </span>
                        ) : rider.is_busy ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                            <XCircle className="w-3 h-3" />
                            Busy
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            <XCircle className="w-3 h-3" />
                            Offline
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {rider.rating && (
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="font-medium">{rider.rating}</span>
                          </div>
                        )}
                        <div>
                          <span className="font-medium">
                            {rider.completed_deliveries ?? 0}
                          </span>{" "}
                          deliveries
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Assignment Mode */}
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
                In automatic mode, the system assigns riders based on availability
                and proximity.
              </p>
            </div>
          </div>

          {/* Pending Requests */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Pending Assignments
            </h2>
            <div className="space-y-3 mb-6">
              {pendingRequests.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                  No pending assignments
                </div>
              ) : (
                pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => setSelectedAssignment(String(request.id))}
                    className={`bg-white rounded-xl shadow-sm border-2 p-5 transition cursor-pointer ${
                      selectedAssignment === String(request.id)
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-mono font-bold text-gray-900 mb-1">
                          REQ-{request.id}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{request.dropoff_location}</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {request.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{request.trader ?? "Unknown trader"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span>{request.quantity ?? 1} items</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 truncate">
                      Pickup: {request.pickup_location}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Confirm Assignment */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Confirm Assignment
              </h3>
              {selectedRiderData && selectedRequestData ? (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg space-y-1">
                  <p className="text-sm text-green-900">
                    <span className="font-semibold">Rider:</span>{" "}
                    {selectedRiderData.name}
                  </p>
                  <p className="text-sm text-green-900">
                    <span className="font-semibold">Request:</span> REQ-
                    {selectedRequestData.id}
                  </p>
                  <p className="text-sm text-green-900">
                    <span className="font-semibold">Destination:</span>{" "}
                    {selectedRequestData.dropoff_location}
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
                disabled={!selectedRider || !selectedAssignment || assigning}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {assigning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  "Assign Rider"
                )}
              </button>
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
}