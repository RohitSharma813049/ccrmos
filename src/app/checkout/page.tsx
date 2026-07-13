"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing checkout token.");
      setLoading(false);
      return;
    }
    
    fetchDetails();
  }, [token]);

  const fetchDetails = async (coupon?: string) => {
    try {
      setLoading(true);
      setCouponError("");
      let url = `/api/checkout?token=${token}`;
      if (coupon) url += `&coupon=${coupon}`;
      
      const res = await fetch(url);
      const resData = await res.json();
      
      if (!res.ok) {
        if (coupon) {
          setCouponError(resData.error || "Invalid coupon");
        } else {
          setError(resData.error || "Failed to load checkout details");
        }
      } else {
        setData(resData);
      }
    } catch (err) {
      console.error(err);
      if (!coupon) setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    fetchDetails(couponCode);
  };

  const removeCoupon = () => {
    setCouponCode("");
    fetchDetails();
  };

  const handlePayment = async () => {
    setIsPaying(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, couponId: data?.validCouponId })
      });
      
      if (res.ok) {
        alert("Payment successful! Your account is now active.");
        router.push("/login");
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Payment failed");
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setIsPaying(false);
    }
  };

  if (loading && !data) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading checkout details...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-xl font-medium">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="bg-white max-w-4xl w-full rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Details */}
        <div className="flex-1 p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">CRM OS</h1>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete your setup</h2>
          <p className="text-gray-600 mb-8">Review your subscription details for <strong>{data.companyName}</strong>.</p>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Subscription Plan</span>
              <span className="text-gray-900 font-bold">{data.planName}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Admin Account</span>
              <span className="text-gray-900 font-medium">{data.adminEmail}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Users Quota</span>
              <span className="text-gray-900 font-medium">{data.usersQuota} Users</span>
            </div>
          </div>
        </div>

        {/* Right Side: Payment */}
        <div className="w-full md:w-[400px] bg-gray-50 p-8 md:p-12 flex flex-col justify-center">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{data.originalPrice}</span>
            </div>
            
            {data.discount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Discount applied</span>
                <span>-₹{data.discount}</span>
              </div>
            )}
            
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t border-gray-200">
              <span>Total</span>
              <span>₹{data.finalPrice}</span>
            </div>
          </div>

          <div className="mb-8">
            {data.validCouponId ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex justify-between items-center">
                <div className="flex items-center gap-2 text-green-700">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-sm">Coupon Applied</span>
                </div>
                <button onClick={removeCoupon} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
              </div>
            ) : (
              <form onSubmit={applyCoupon} className="flex gap-2">
                <input 
                  type="text" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Discount code" 
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" disabled={!couponCode || loading} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 rounded-xl font-medium transition-colors disabled:opacity-50">
                  Apply
                </button>
              </form>
            )}
            {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
          </div>

          <button 
            onClick={handlePayment} 
            disabled={isPaying}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isPaying ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </>
            ) : (
              `Pay ₹${data.finalPrice}`
            )}
          </button>
          
          <p className="text-xs text-center text-gray-500 mt-4 flex items-center justify-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure checkout powered by Razorpay
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
