import { Mail, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
  });

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) =>  {
    e.preventDefault();
    if (!formData.email) {
      toast.error("Please enter your email address.");
      return;
    }
    try {
        const res=await fetch("/api/forgot-password/", {
            method:"POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });
        if(res.ok){
            toast.success("Password reset link sent to your email.");
            const link = await res.json();

            navigate(`/${link.link}`);
        } else {
            toast.error("Failed to send reset link. Please try again.");
        }
    } catch (error) {
        toast.error("An error occurred while processing your request.");
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
            Enter your email to reset your password
          </h2>

          <form onSubmit={handleForgotPassword} className="space-y-6">
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
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Reset Password
            </button>
          </form>
        </div>
        </div>
    </div>
  );
}