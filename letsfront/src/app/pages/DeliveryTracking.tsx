import { useNavigate, useParams } from "react-router";
import { ArrowLeft, MapPin, Package, User, CheckCircle, Clock } from "lucide-react";

const trackingData = {
  DEL001: {
    id: "DEL001",
    trader: "Trader A",
    traderPhone: "0711111111",
    rider: "John Kamau",
    riderPhone: "0712345678",
    pickup: "Shop 45, Block A, Kamukunji",
    destination: "Modern Coast",
    packageDesc: "Electronics",
    items: 5,
    currentStatus: "delivered",
    timeline: [
      {
        status: "Request Submitted",
        timestamp: "2026-03-28 09:00",
        description: "Delivery request created by trader",
        completed: true,
      },
      {
        status: "Rider Assigned",
        timestamp: "2026-03-28 09:15",
        description: "John Kamau assigned to this delivery",
        completed: true,
      },
      {
        status: "Picked Up",
        timestamp: "2026-03-28 10:30",
        description: "Package picked up from Kamukunji Market",
        completed: true,
      },
      {
        status: "In Transit",
        timestamp: "2026-03-28 10:45",
        description: "On the way to Modern Coast",
        completed: true,
      },
      {
        status: "Delivered",
        timestamp: "2026-03-28 11:20",
        description: "Package delivered successfully",
        completed: true,
      },
    ],
  },
  DEL002: {
    id: "DEL002",
    trader: "Trader B",
    traderPhone: "0722222222",
    rider: "Mary Wanjiru",
    riderPhone: "0723456789",
    pickup: "Shop 12, Block C, Kamukunji",
    destination: "Easy Coach",
    packageDesc: "Clothing",
    items: 3,
    currentStatus: "in_transit",
    timeline: [
      {
        status: "Request Submitted",
        timestamp: "2026-03-28 10:00",
        description: "Delivery request created by trader",
        completed: true,
      },
      {
        status: "Rider Assigned",
        timestamp: "2026-03-28 10:20",
        description: "Mary Wanjiru assigned to this delivery",
        completed: true,
      },
      {
        status: "Picked Up",
        timestamp: "2026-03-28 11:00",
        description: "Package picked up from Kamukunji Market",
        completed: true,
      },
      {
        status: "In Transit",
        timestamp: "2026-03-28 11:15",
        description: "On the way to Easy Coach",
        completed: true,
      },
      {
        status: "Delivered",
        timestamp: "-",
        description: "Pending delivery",
        completed: false,
      },
    ],
  },
  DEL003: {
    id: "DEL003",
    trader: "Trader C",
    traderPhone: "0733333333",
    rider: null,
    pickup: "Shop 78, Block B, Kamukunji",
    destination: "Modern Coast",
    packageDesc: "Books",
    items: 10,
    currentStatus: "pending",
    timeline: [
      {
        status: "Request Submitted",
        timestamp: "2026-03-28 12:00",
        description: "Delivery request created by trader",
        completed: true,
      },
      {
        status: "Rider Assigned",
        timestamp: "-",
        description: "Waiting for rider assignment",
        completed: false,
      },
      {
        status: "Picked Up",
        timestamp: "-",
        description: "Pending pickup",
        completed: false,
      },
      {
        status: "In Transit",
        timestamp: "-",
        description: "Pending",
        completed: false,
      },
      {
        status: "Delivered",
        timestamp: "-",
        description: "Pending",
        completed: false,
      },
    ],
  },
};

export default function DeliveryTracking() {
  const navigate = useNavigate();
  const { id } = useParams();

  const delivery = trackingData[id as keyof typeof trackingData] || trackingData.DEL001;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Track Delivery</h1>
            <p className="text-sm text-gray-600 font-mono">{delivery.id}</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Delivery Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="font-semibold text-gray-900 mb-4">Delivery Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <p className="text-gray-900">{delivery.destination}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Package Description</p>
              <div className="flex items-start gap-2">
                <Package className="w-4 h-4 text-gray-400 mt-0.5" />
                <p className="text-gray-900">{delivery.packageDesc} ({delivery.items} items)</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Trader</p>
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-gray-400 mt-0.5" />
                <p className="text-gray-900">
                  {delivery.trader} ({delivery.traderPhone})
                </p>
              </div>
            </div>
          </div>

          {delivery.rider && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-sm text-indigo-900 mb-1 font-semibold">Assigned Rider</p>
              <p className="text-indigo-900">
                {delivery.rider} - {delivery.riderPhone}
              </p>
            </div>
          )}
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Delivery Status</h2>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            {/* Timeline Items */}
            <div className="space-y-8">
              {delivery.timeline.map((event, index) => (
                <div key={index} className="relative flex gap-6">
                  {/* Status Icon */}
                  <div className="relative z-10 flex-shrink-0">
                    {event.completed ? (
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                        <Clock className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 pt-1">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{event.status}</h3>
                        <span className="text-sm text-gray-600 font-mono">
                          {event.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{event.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {delivery.currentStatus === "delivered" && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-green-900">Delivery Completed!</h3>
            </div>
            <p className="text-sm text-green-800 mb-4">
              This delivery has been successfully completed and proof of delivery has been
              uploaded.
            </p>
            <button
              onClick={() => navigate(`/delivery/${delivery.id}/proof`)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              View Proof of Delivery
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
