import { useState } from "react";
import { useNavigate } from "react-router";
import { Package, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";


export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "", remember: false });
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", //  allow cookies
        body: JSON.stringify(formData),
      });

      if (!res.ok) {

        toast.error("Invalid credentials");
        throw new Error("Invalid credentials");
      }else {
        toast.success("Login successful");
      }
        
      // Save user data in context or global store here     
      const data = await res.json();
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("role", data.role);

       // implement role based redirection  
      if (data.role=== "trader") {
        navigate("/trader/dashboard");
        window.location.reload();
      }
      else if (data.role === "rider") {
        navigate("/rider/dashboard");
        window.location.reload();
      }
      else if (data.role === "admin") {
        navigate("/admin/dashboard");
        window.location.reload();
      }
      else {
        toast.error("User role not recognized");
        throw new Error("User role not recognized");
      }
    }
       catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      }
    };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            LETs First-Mile Logistics
          </h1>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Welcome Back
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* email address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
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
                  onChange={(e) => setFormData({ ...formData, password: e.target.value } )}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.remember}
                  onChange={(e) => 
                    setFormData({ ...formData, remember: e.target.checked })
                  }
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                 
                />
                <span className="ml-2 text-gray-600">Remember me (30 days)</span>
              </label>
              <button 
              type="button" 
              onClick={()=> navigate('/forgot-password')}
              className="text-indigo-600 hover:text-indigo-700 font-medium">
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 group"
            >
              Login
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center"> 
            <p className="text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                Register now
              </button>
            </p>
          </div>

          
        </div>
      </div>
    </div>
  );
}
