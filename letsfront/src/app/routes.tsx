import { createBrowserRouter, Navigate } from "react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TraderDashboard from "./pages/TraderDashboard";
import RiderDashboard from "./pages/RiderDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DeliveryRequest from "./pages/DeliveryRequest";
import BatchDelivery from "./pages/BatchDelivery";
import RiderAssignment from "./pages/RiderAssignment";
import DeliveryTracking from "./pages/DeliveryTracking";
import ProofOfDelivery from "./pages/ProofOfDelivery";
import Reports from "./pages/Reports";
import Layout from "./components/Layout";
import { JSX } from "react";
import ForgotPassword from "./pages/ForgotPassword";

const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element; allowedRoles?: string[] }) => {
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }
    if (allowedRoles && !allowedRoles.includes(role!)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Login },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "forgot-password", Component: ForgotPassword },
      { 
        path: "trader/dashboard",
        element:(
          <ProtectedRoute allowedRoles={["trader"]}>
            <TraderDashboard />
          </ProtectedRoute>
        ),
        
      },
      { 
        path: "trader/request", 
        element: (
          <ProtectedRoute allowedRoles={["trader"]}>
            <DeliveryRequest />
          </ProtectedRoute>
        )
      },
      { 
        path: "rider/dashboard", 
        element: (
          <ProtectedRoute allowedRoles={["rider"]}>
            <RiderDashboard />
          </ProtectedRoute>
        )
      },
      { 
        path: "admin/dashboard", 
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        )
      },
      { 
        path: "admin/batch-delivery", 
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <BatchDelivery />
          </ProtectedRoute>
        )
      },
      { 
        path: "admin/rider-assignment", 
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <RiderAssignment />
          </ProtectedRoute>
        )
      },
      { path: "tracking/:id", Component: DeliveryTracking },
      { path: "delivery/:id/proof", Component: ProofOfDelivery },
      { path: "reports", Component: Reports },
    ],
  },
]);
