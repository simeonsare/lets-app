import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Bike, Package, CheckCircle, XCircle,
  MapPin, Navigation, LogOut, Clock, User,
} from "lucide-react";

const token = localStorage.getItem("authToken");

// Type for incoming delivery requests (broadcast — rider must accept/reject)
interface DeliveryRequest {
  request_id: number;
  pickup: string;
  dropoff: string;
  package: string;
  quantity: number;
  expires_in: number;
  status: "pending" | "accepted" | "rejected";
  timeLeft?: number;
}

// Type for orders directly assigned by admin (no countdown needed)
interface AssignedOrder {
  request_id: number;
  pickup: string;
  dropoff: string;
  package_details: string;
  quantity: number;
}

interface CompletedDelivery {
  id: string;
  destination: string;
  created_at: string;
}

export default function RiderDashboard() {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const[active_deliveries, setActiveDeliveries] = useState(0);
  const [assigned_orders, setassigned_orders] = useState(0);
  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>([]);
  const [assignedOrders, setAssignedOrders] = useState<AssignedOrder[]>([]);
  const [completedDeliveries, setCompletedDeliveries] = useState<CompletedDelivery[]>([]);
  const [riderId, setRiderId] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const timersRef = useRef<Record<number, ReturnType<typeof setInterval>>>({});
  const name = localStorage.getItem("name") || "Rider";

  // Fetch rider profile on mount
  useEffect(() => {
    fetch("/api/rider/profile/", {
      headers: { "Authorization": `Token ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        setRiderId(data.id);
        setCompletedDeliveries(data.complete_deliveries || []);
        setActiveDeliveries (data.active_deliveries || 0);
        setassigned_orders(data.assigned_deliveries || 0);
      })
      .catch(() => toast.error("Failed to load rider profile"));
  }, []);

  // Connect/disconnect WebSocket based on online status
  useEffect(() => {
    if (isOnline && riderId) {
      connectWebSocket(riderId);
    } else {
      disconnectWebSocket();
    }
    return () => disconnectWebSocket();
  }, [isOnline, riderId]);

  const connectWebSocket = (id: number) => {
    const ws = new WebSocket(`ws://localhost:8000/ws/rider/${id}/`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      toast.success("You are now online and receiving requests");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "delivery_request") {
        if (data.assigned) {
          // ── Direct assignment from admin — no countdown, go straight to assigned orders
          setAssignedOrders((prev) => [
            ...prev,
            {
              request_id: data.request_id,
              pickup: data.pickup,
              dropoff: data.dropoff,
              package_details: data.package,
              quantity: data.quantity,
            },
          ]);
          toast.success("You have been assigned a delivery by admin!");
        } else {
          // ── Broadcast — rider must accept/reject within countdown
          const newRequest: DeliveryRequest = {
            request_id: data.request_id,
            pickup: data.pickup,
            dropoff: data.dropoff,
            package: data.package,
            quantity: data.quantity,
            expires_in: data.expires_in,
            status: "pending",
            timeLeft: data.expires_in,
          };
          setDeliveries((prev) => [...prev, newRequest]);
          toast.info(`New delivery request! You have ${data.expires_in}s to accept.`);
          startCountdown(data.request_id, data.expires_in);
        }
      }

      if (data.type === "accepted") {
        // Rider self-accepted — move from incoming to assigned
        const accepted = deliveries.find((d) => d.request_id === data.request_id);
        if (accepted) {
          setAssignedOrders((prev) => [
            ...prev,
            {
              request_id: data.request_id,
              pickup: data.pickup ?? accepted.pickup,
              dropoff: data.dropoff ?? accepted.dropoff,
              package_details: data.package_details ?? accepted.package,
              quantity: data.quantity ?? accepted.quantity,
            },
          ]);
          setDeliveries((prev) =>
            prev.filter((d) => d.request_id !== data.request_id)
          );
        }
        toast.success(data.message || "Delivery assigned to you!");
      }

      if (data.type === "error") {
        toast.error(data.message);
      }
    };

    ws.onclose = () => console.log("WebSocket disconnected");

    ws.onerror = (error) => {
      console.error("WebSocket error", error);
      toast.error("WebSocket connection error");
    };
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    Object.values(timersRef.current).forEach(clearInterval);
    timersRef.current = {};
  };

  const startCountdown = (requestId: number, seconds: number) => {
    if (timersRef.current[requestId]) {
      clearInterval(timersRef.current[requestId]);
    }

    timersRef.current[requestId] = setInterval(() => {
      setDeliveries((prev) =>
        prev.map((d) => {
          if (d.request_id === requestId) {
            const newTimeLeft = (d.timeLeft ?? seconds) - 1;
            if (newTimeLeft <= 0) {
              clearInterval(timersRef.current[requestId]);
              delete timersRef.current[requestId];
              setTimeout(() => {
                setDeliveries((prev) =>
                  prev.filter((d) => d.request_id !== requestId)
                );
              }, 0);
            }
            return { ...d, timeLeft: newTimeLeft };
          }
          return d;
        })
      );
    }, 1000);
  };

  const handleAccept = (requestId: number) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error("Not connected. Please go online first.");
      return;
    }
    wsRef.current.send(JSON.stringify({ action: "accept", request_id: requestId }));

    if (timersRef.current[requestId]) {
      clearInterval(timersRef.current[requestId]);
      delete timersRef.current[requestId];
    }

    // Mark as accepted in UI — ws.onmessage "accepted" will move it to assignedOrders
    setDeliveries((prev) =>
      prev.map((d) =>
        d.request_id === requestId ? { ...d, status: "accepted" } : d
      )
    );
  };

  const handleReject = (requestId: number) => {
    if (!confirm("Are you sure you want to reject this delivery?")) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "reject", request_id: requestId }));
    }

    if (timersRef.current[requestId]) {
      clearInterval(timersRef.current[requestId]);
      delete timersRef.current[requestId];
    }

    setDeliveries((prev) => prev.filter((d) => d.request_id !== requestId));
    toast.info("Request rejected");
  };

  const handleComplete = async (requestId: number) => {
    try {
      const res = await fetch(`/api/rider/complete/${requestId}/`, {
        method: "POST",
        headers: { "Authorization": `Token ${token}` },
      });
      if (res.ok) {
        // Remove from both lists
        setDeliveries((prev) => prev.filter((d) => d.request_id !== requestId));
        setAssignedOrders((prev) => prev.filter((o) => o.request_id !== requestId));
        toast.success("Delivery marked as completed!");
      } else {
        toast.error("Failed to complete delivery");
      }
    } catch {
      toast.error("Failed to complete delivery");
    }
  };

  const toggleStatus = async () => {
    const newStatus = !isOnline;
    try {
      const res = await fetch("/api/rider/status/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`,
        },
        body: JSON.stringify({ is_online: newStatus }),
      });
      if (res.ok) setIsOnline(newStatus);
      else toast.error("Can't change status now");
    } catch {
      toast.error("Failed to update status");
    }
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
              <p className="text-sm text-gray-600">{name}</p>
            </div>
          </div>

          <button
          onClick={() => {
            // If rider is online and has assigned orders → go to assignments page
            if (assigned_orders > 0) {
              navigate("/rider/assignments");
              return;
            }

            // Otherwise toggle online/offline status
            toggleStatus();
          }}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            assignedOrders.length > 0
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : isOnline
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {assignedOrders.length > 0
            ? `📦 Assigned Orders (${assignedOrders.length})`
            : isOnline
            ? "🟢 Online"
            : "⚫ Offline"}
        </button>

          <div
            onClick={() => navigate("/rider/profile")}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
          >
            <User className="w-5 h-5 text-gray-700" />
            <span>My Profile</span>
          </div>

          <button
            onClick={() => { localStorage.clear(); navigate("/login"); }}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Offline Stats */}
        {!isOnline && (
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
                  <p className="text-3xl font-bold text-gray-900">{completedDeliveries.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">

                <div
                onClick={() => navigate("/rider/assignments")}
                >
                  <p className="text-gray-600 text-sm mb-1">Assigned Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{assigned_orders}</p>
                </div>

                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Bike className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ASSIGNED ORDERS (admin-assigned or self-accepted) ── */}
        {assignedOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Assigned to You ({assignedOrders.length})
            </h2>
            <div className="space-y-4">
              {assignedOrders.map((order) => (
                <div
                  key={order.request_id}
                  className="bg-white rounded-xl shadow-sm border-2 border-green-400 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-mono text-lg font-bold text-gray-900 mb-1">
                        Order #{order.request_id}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Assigned to you
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pickup Location</p>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <p className="text-gray-900">{order.pickup}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Destination</p>
                      <div className="flex items-start gap-2">
                        <Navigation className="w-4 h-4 text-gray-400 mt-0.5" />
                        <p className="text-gray-900">{order.dropoff}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-1">Package Details</p>
                    <p className="text-gray-900 font-medium">{order.package_details}</p>
                    <p className="text-sm text-gray-600 mt-1">Quantity: {order.quantity} kg</p>
                  </div>

                  <button
                    onClick={() => handleComplete(order.request_id)}
                    className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Mark as Completed
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── INCOMING REQUESTS (broadcast — accept/reject with countdown) ── */}
        {(isOnline || deliveries.length > 0) && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Incoming Requests {deliveries.length > 0 && `(${deliveries.length})`}
            </h2>

            {deliveries.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Waiting for delivery requests...</p>
                <p className="text-gray-400 text-sm mt-1">
                  Requests will appear here automatically
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {deliveries.map((delivery) => (
                  <div
                    key={delivery.request_id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-mono text-lg font-bold text-gray-900 mb-1">
                          Request #{delivery.request_id}
                        </h3>
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          Single Delivery
                        </span>
                      </div>

                      {delivery.status === "pending" && (
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                          (delivery.timeLeft ?? 0) <= 10
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          <Clock className="w-4 h-4" />
                          {delivery.timeLeft}s
                        </span>
                      )}

                      {delivery.status === "accepted" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Accepted
                        </span>
                      )}
                    </div>

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
                          <p className="text-gray-900">{delivery.dropoff}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-600 mb-1">Package Details</p>
                      <p className="text-gray-900 font-medium">{delivery.package}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Quantity: {delivery.quantity} kg
                      </p>
                    </div>

                    <div className="flex gap-3">
                      {delivery.status === "pending" ? (
                        <>
                          <button
                            onClick={() => handleAccept(delivery.request_id)}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-5 h-5" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(delivery.request_id)}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-5 h-5" />
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleComplete(delivery.request_id)}
                          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                        >
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── COMPLETED DELIVERIES (shown when offline) ── */}
        {!isOnline && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Completed Deliveries (Today)
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {completedDeliveries.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No completed deliveries today
                </div>
              ) : (
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
                        <td className="px-6 py-4 text-gray-900">{delivery.created_at}</td>
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
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}