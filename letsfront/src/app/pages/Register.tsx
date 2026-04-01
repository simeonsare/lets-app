import { useState } from "react";
import { useNavigate } from "react-router";
import { Package, User, Phone, Lock, ArrowLeft, UserCircle } from "lucide-react";
import { toast } from "sonner";


export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    second_name:"",
    phone: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
     if (!formData.role) {
      alert("Please select either Rider or Trader before continuing.");
      return;
    }
      try {
      const res = await fetch("/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Registration failed");
      }
      const data = await res.json();
      alert("Registration successful! Please log in.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000); // 2-second delay
      
    } catch (error) {
      toast.error("Registration failed. Please try again.");
      console.error("Registration error:", error);
    }
   
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Login
        </button>

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">Join our delivery network</p>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I want to register as:
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => updateField("role", "trader")}
                  className={`py-3 px-4 rounded-lg border-2 transition ${
                    formData.role === "trader"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium text-sm">Trader</div>
                </button>
                <button
                
                  type="button"
                  onClick={() => updateField("role", "rider")}
                  className={`py-3 px-4 rounded-lg border-2 transition ${
                    formData.role === "rider"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium text-sm">Rider</div>
                </button>
              
                <button
                  type="button"
                  onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Login
        </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => updateField("first_name", e.target.value)}
                  placeholder="Enter your First name"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                second Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.second_name}
                  onChange={(e) => updateField("second_name", e.target.value)}
                  placeholder="Enter your second name"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>
            </div>
          {/* username*/}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => updateField("username", e.target.value)}
                            placeholder="Enter your username"
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            required
                          />
                        </div>
                      </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  pattern="[0-9]+"

                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="0700123456"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>
            </div>


            
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Create a password"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  name="confirmPassword"
                  onChange={(e) =>{updateField("confirmPassword", e.target.value)}}
                  onInput={(e) => {
                    if (e.currentTarget.value !== formData.password) {
                      e.currentTarget.setCustomValidity("Passwords do not match");
                    } else {
                      e.currentTarget.setCustomValidity("");
                    }
                  }}

                  
                  placeholder="Confirm your password"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <input
                type="checkbox"
                className="w-4 h-4 mt-1 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                required
              />
              <label className="ml-2 text-sm text-gray-600">
                I agree to the{" "}
                <button type="button" className="text-indigo-600 hover:text-indigo-700">
                  Terms of Service
                </button>{" "}
                and{" "}
                <button type="button" className="text-indigo-600 hover:text-indigo-700">
                  Privacy Policy
                </button>
              </label>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Create Account
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
