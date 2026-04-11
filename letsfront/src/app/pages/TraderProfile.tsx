import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Package,
  LogOut,
  User,
} from "lucide-react";

const token = localStorage.getItem("authToken");

export default function TraderProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    stall_building: "",
    stall_number: "",
    floor: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  // Fetch existing profile details on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/trader/profile/", {
          method: "GET",
          headers: {
            "Authorization": `Token ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setFormData({
            stall_building: data.stall_building || "",
            stall_number: data.stall_number || "",
            floor: data.floor || "",
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            phone: data.phone || "",
          });
        } else {
          toast.error("Failed to load profile");
        }
      } catch (error) {
        toast.error("Error fetching profile");
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/update_profile/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("Error updating profile");
    }
  };

  const handlelogout = async () => {
    try {
      const res = await fetch("/api/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`,
        },
        credentials: "include",
      });

      if (!res.ok) {
        toast.error("Logout failed");
      } else {
        toast.success("Logout successful");
      }
    } catch (error) {
      toast.error("An error occurred during logout");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-indigo-600 rounded-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div
          onClick={()=>{
            navigate('/trader/dashboard/');
          }

          }>
            <h1 className="text-xl font-bold text-gray-900">Trader Dashboard</h1>
            <p className="text-sm text-gray-600">Kamukunji Market</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div
            onClick={() => { navigate("/trader/profile"); }}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
          >
            <User className="w-5 h-5 text-gray-700" />
            <span>My Profile</span>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
              handlelogout();
            }}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Profile Update Form */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Stall Building</label>
            <input
              type="text"
              name="stall_building"
              value={formData.stall_building}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Floor number</label>
            <input
              type="text"
              name="floor"
              value={formData.floor}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stall Number</label>
            <input
              type="text"
              name="stall_number"
              value={formData.stall_number}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
          >
            Save Changes
          </button>
        </form>
      </div>
    </header>
  );
}
