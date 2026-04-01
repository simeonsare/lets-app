import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Upload, CheckCircle, Camera, Image as ImageIcon } from "lucide-react";

export default function ProofOfDelivery() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmDelivery = () => {
    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      setUploading(false);
      setConfirmed(true);

      // Redirect after confirmation
      setTimeout(() => {
        navigate("/rider/dashboard");
      }, 2000);
    }, 1500);
  };

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
            <h1 className="text-xl font-bold text-gray-900">Proof of Delivery</h1>
            <p className="text-sm text-gray-600 font-mono">{id || "DEL002"}</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!confirmed ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                <Camera className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Upload Delivery Proof
              </h2>
              <p className="text-gray-600">
                Take a photo of the receipt or delivery confirmation
              </p>
            </div>

            {/* Upload Area */}
            {!imagePreview ? (
              <div className="mb-8">
                <label className="block">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-indigo-500 hover:bg-indigo-50 transition cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-700 font-medium mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, or JPEG (Max 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    capture="environment"
                  />
                </label>
              </div>
            ) : (
              <div className="mb-8">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Preview
                </p>
                <div className="relative border border-gray-200 rounded-xl overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Proof of delivery"
                    className="w-full h-auto"
                  />
                  <button
                    onClick={() => setImagePreview(null)}
                    className="absolute top-4 right-4 px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition text-sm font-medium"
                  >
                    Change Image
                  </button>
                </div>
              </div>
            )}

            {/* Additional Notes */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                placeholder="Add any notes about the delivery..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <h3 className="font-semibold text-blue-900 mb-2">📸 Photo Guidelines</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ensure the receipt or confirmation is clearly visible</li>
                <li>• Make sure the image is well-lit and in focus</li>
                <li>• Include any relevant stamps or signatures</li>
                <li>• The parcel office name should be visible</li>
              </ul>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmDelivery}
              disabled={!imagePreview || uploading}
              className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Confirm Delivery
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Delivery Confirmed!
              </h2>
              <p className="text-gray-600 mb-8">
                The proof of delivery has been uploaded successfully. The trader will be
                notified.
              </p>

              {/* Success Stats */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-green-600">+1</p>
                    <p className="text-sm text-green-800">Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">+10</p>
                    <p className="text-sm text-green-800">Points</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">4.8</p>
                    <p className="text-sm text-green-800">Rating</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Redirecting to dashboard...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
