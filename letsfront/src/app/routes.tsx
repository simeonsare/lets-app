import { createBrowserRouter, Navigate } from "react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TraderDashboard from "./pages/TraderDashboard";
import TraderProfile from "./pages/TraderProfile";
import RiderDashboard from "./pages/RiderDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Admin_addlsp from "./pages/Admin_addlsp";
import DeliveryRequest from "./pages/DeliveryRequest";
import BatchDelivery from "./pages/BatchDelivery";
import RiderAssignment from "./pages/RiderAssignment";
import DeliveryTracking from "./pages/DeliveryTracking";
import ProofOfDelivery from "./pages/ProofOfDelivery";
import Reports from "./pages/Reports";
import Layout from "./components/Layout";
import { JSX } from "react";
import ForgotPassword from "./pages/ForgotPassword";
import RiderProfile from "./pages/RiderProfile";
import Assignmentpage from "./pages/Assignmentpage";

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
        path: "trader/profile",
        element: (
          <ProtectedRoute allowedRoles={["trader"]}>
            <TraderProfile />
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
        path: "rider/profile", 
        element: (
          <ProtectedRoute allowedRoles={["rider"]}>
            <RiderProfile />
          </ProtectedRoute>
        )
      },
       {
        path: "rider/assignments",
        element: (
          <ProtectedRoute allowedRoles={["rider"]}>
            <Assignmentpage />
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
        path: "admin/addlsp",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <Admin_addlsp />
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
