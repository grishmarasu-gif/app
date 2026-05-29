import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Pricing() {
  const { completePricing, logout, token, currentUser } = useAuth();
  const currentPlan = currentUser?.plan || 'Free';
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // Modal states
  const [modalCouponCode, setModalCouponCode] = useState('');
  const [validatedCoupon, setValidatedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validating, setValidating] = useState(false);



  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const initiatePaymentFlow = (planName) => {
    setModalCouponCode('');
    setValidatedCoupon(null);
    setCouponError('');
    setSelectedPlan(planName);
  };

  const handleApplyCoupon = async () => {
    if (!modalCouponCode.trim()) return;
    setValidating(true);
    setCouponError('');
    try {
      const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api` : 'http://localhost:3000/api';
      const res = await fetch(`${API_BASE}/payment/validate-coupon`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ coupon: modalCouponCode })
      });
      const data = await res.json();
      if (data.success) {
        setValidatedCoupon({ code: modalCouponCode.toUpperCase(), discount: data.discount });
      } else {
        setCouponError('Invalid Coupon Code');
        setValidatedCoupon(null);
      }
    } catch (err) {
      console.error(err);
      setCouponError('Error validating coupon');
    } finally {
      setValidating(false);
    }
  };

  const handlePayment = async () => {
    // If they typed a coupon but didn't click Apply, they can't proceed until they apply or clear it
    if (modalCouponCode && !validatedCoupon && !couponError) {
      await handleApplyCoupon();
      // Wait, we need to know if it succeeded to proceed. 
      // To be safe, let's force them to hit Apply first if they typed something.
      return;
    }

    if (couponError) return;

    const planName = selectedPlan;
    const couponToApply = validatedCoupon ? validatedCoupon.code : null;
    
    // Close modal
    setSelectedPlan(null);
    setLoading(true);
    
    try {
      const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api` : 'http://localhost:3000/api';
      
      const orderRes = await fetch(`${API_BASE}/payment/create-order`, {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ plan: planName, coupon: couponToApply })
      });
      
      const orderData = await orderRes.json();
      
      if (!orderData.success) {
        alert(orderData.message || 'Error creating order');
        setLoading(false);
        return;
      }

      if (orderData.bypassed) {
        // FREE100 applied - silent success redirect
        const { ok, error } = await completePricing();
        if (ok) {
          navigate('/dashboard');
        } else {
          alert(error || 'Failed to update user profile after payment');
        }
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || orderData.key,
        amount: orderData.amount, // strictly in cents for Razorpay
        currency: orderData.currency || 'USD',
        name: 'Apply4Works',
        description: `${planName} Plan Upgrade`,
        order_id: orderData.orderId,
        method: {
           upi: true,
           card: true,
           netbanking: true,
           wallet: true
        },
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_BASE}/payment/verify-payment`, {
              method: 'POST',
              credentials: 'include',
              headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            
            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
              const { ok, error } = await completePricing();
              if (ok) {
                navigate('/dashboard');
              } else {
                alert(error || 'Failed to update user profile after payment');
              }
            } else {
              alert(verifyData.message || 'Payment verification failed');
            }
          } catch (err) {
            console.error(err);
            alert('Error verifying payment');
          }
        },
        theme: { color: '#1f7a6c' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error(response.error);
        alert(`Payment failed: ${response.error.description}`);
      });

      rzp.open();
    } catch (error) {
      console.error(error);
      alert('Error initiating payment');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getPlanPrice = (plan) => {
    if (plan === 'Basic') return 9.99;
    if (plan === 'Pro') return 24.99;
    return 0;
  };

  const planPrice = getPlanPrice(selectedPlan);
  const discountAmount = validatedCoupon ? (planPrice * validatedCoupon.discount / 100) : 0;
  const finalAmount = planPrice - discountAmount;

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: 'var(--bg)' }}>
      {/* Navbar matching Landing.jsx */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-4 flex items-center justify-between"
        style={{ background: 'rgba(245,243,239,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'var(--primary)' }}>A</div>
          <span className="font-bold text-base" style={{ color: 'var(--text-h)' }}>
            Apply4<span style={{ color: 'var(--primary)' }}>works</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">Log Out</button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 pt-24 pb-8 flex-1 flex flex-col justify-center w-full">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest"
            style={{ background: 'var(--primary-lt)', color: 'var(--primary)', border: '1px solid rgba(31,122,108,.15)' }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--primary)' }} />
            Upgrade Your Journey
          </div>
          <h1 className="font-extrabold leading-tight mb-3"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: 'var(--text-h)' }}>
            Choose Your Career <span style={{ color: 'var(--primary)' }}>Growth Plan</span>
          </h1>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-b)' }}>
            Unlock AI-powered job search tools and resume optimization.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto w-full items-stretch">
          {/* Basic Plan */}
          <div className="card p-6 sm:p-7 flex flex-col transition-all duration-200 hover:-translate-y-1 relative rounded-2xl"
            style={{ background: '#fff', border: '1px solid var(--primary)', boxShadow: '0 8px 30px -4px rgba(31,122,108,0.15)' }}>
            
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-md whitespace-nowrap"
                style={{ background: currentPlan === 'Basic' ? '#10b981' : 'var(--primary)' }}>
                {currentPlan === 'Basic' ? 'Current Plan' : 'Most Popular'}
              </span>
            </div>
            
            <div className="mb-5 text-center mt-1">
              <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-h)' }}>Basic</h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-3xl font-extrabold" style={{ color: 'var(--text-h)' }}>$9.99</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-m)' }}>/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6 flex-1">
              {[
                'Daily Curated Jobs',
                'Resume Builder Access',
                'Smart Job Matching',
                'Manual One-Click Apply',
                'Resume-Based Recommendations',
                'Application Tracking',
                'Personalized Job Feed',
                'Resume ATS Optimization'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] font-medium" style={{ color: 'var(--text-b)' }}>
                  <div className="rounded-full p-1 flex-shrink-0 mt-0.5" style={{ background: 'var(--primary-lt)', color: 'var(--primary)' }}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="leading-tight text-left">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => initiatePaymentFlow('Basic')}
              disabled={loading || currentPlan === 'Basic' || currentPlan === 'Pro'}
              className={`btn w-full justify-center shadow-md py-2.5 rounded-xl text-sm font-semibold mt-auto ${currentPlan === 'Basic' || currentPlan === 'Pro' ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'btn-primary'}`}
            >
              {currentPlan === 'Basic' || currentPlan === 'Pro' ? 'Already Active' : (loading ? 'Processing...' : 'Continue')}
            </button>
          </div>

          {/* Pro Plan */}
          <div className="card p-6 sm:p-7 flex flex-col transition-all duration-200 relative rounded-2xl"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', opacity: 0.85, boxShadow: '0 4px 20px -4px rgba(0,0,0,0.05)' }}>
            
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full border shadow-sm whitespace-nowrap"
                style={{ background: currentPlan === 'Pro' ? '#10b981' : 'var(--bg)', color: currentPlan === 'Pro' ? 'white' : 'var(--text-m)', borderColor: currentPlan === 'Pro' ? '#10b981' : 'var(--border)' }}>
                {currentPlan === 'Pro' ? 'Current Plan' : 'Coming Soon'}
              </span>
            </div>

            <div className="mb-5 text-center mt-1">
              <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-h)' }}>Pro</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-extrabold" style={{ color: 'var(--text-m)' }}>$24.99</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-m)' }}>/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6 flex-1 opacity-80">
              {[
                'Everything in Basic',
                'AI Auto Apply',
                'Advanced Resume Optimization',
                'Interview Question Generator',
                'Recruiter Insights',
                'Priority Support',
                'Multi Resume Versions',
                'Job Application Analytics'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] font-medium" style={{ color: 'var(--text-b)' }}>
                  <div className="rounded-full p-1 flex-shrink-0 mt-0.5" style={{ background: 'var(--bg)', color: 'var(--text-m)', border: '1px solid var(--border)' }}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="leading-tight text-left">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              disabled={true}
              className="btn w-full justify-center shadow-md py-2.5 rounded-xl text-sm font-semibold mt-auto bg-gray-200 text-gray-500 cursor-not-allowed"
            >
              Temporarily Unavailable
            </button>
          </div>
        </div>

        {/* End of Pricing Cards */}
      </main>
      
      {/* Integrated Coupon Modal (opens only AFTER clicking Get Started) */}
      {selectedPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-sm w-full shadow-2xl relative">
            <button 
              onClick={() => setSelectedPlan(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <h3 className="text-xl font-bold mb-1 text-center" style={{ color: 'var(--text-h)' }}>Checkout</h3>
            <p className="text-sm text-center mb-5" style={{ color: 'var(--text-b)' }}>Have a coupon code? Enter it below.</p>
            
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                placeholder="Enter coupon (optional)" 
                value={modalCouponCode}
                onChange={(e) => {
                  setModalCouponCode(e.target.value.toUpperCase());
                  setCouponError('');
                  setValidatedCoupon(null);
                }}
                className="input w-full uppercase h-11 text-sm px-4 border rounded-lg focus:outline-none"
                style={{ letterSpacing: '1px', fontWeight: 'bold', borderColor: couponError ? '#ef4444' : 'var(--border)' }}
              />
              {!validatedCoupon && (
                <button 
                  onClick={handleApplyCoupon}
                  disabled={validating || !modalCouponCode}
                  className="btn bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-4 rounded-lg text-sm border border-gray-200 transition-colors"
                >
                  {validating ? '...' : 'Apply'}
                </button>
              )}
            </div>

            {couponError && <p className="text-red-500 text-xs font-semibold mb-4 text-center">{couponError}</p>}
            
            {validatedCoupon && (
              <div className="w-full text-left mt-2 mb-4 p-4 rounded-xl border" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                <div className="flex justify-between text-sm mb-1.5 text-gray-600 font-medium">
                  <span>Original Amount:</span>
                  <span>${planPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1.5 text-gray-600 font-medium">
                  <span>Coupon Applied:</span>
                  <span className="font-bold text-gray-800">{validatedCoupon.code}</span>
                </div>
                <div className="flex justify-between text-sm mb-3 text-green-600 font-medium">
                  <span>Discount:</span>
                  <span className="font-bold">-${discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold border-t pt-2" style={{ color: '#0f172a', borderColor: '#e2e8f0' }}>
                  <span>Final Amount:</span>
                  <span>${finalAmount.toFixed(2)}</span>
                </div>
                {finalAmount === 0 && (
                  <div className="text-xs font-bold text-center mt-2 text-green-600 uppercase tracking-wide">
                    100% Discount Applied
                  </div>
                )}
              </div>
            )}
            
            {!validatedCoupon && !couponError && !modalCouponCode && (
               <div className="h-4"></div>
            )}

            <div className="flex flex-col gap-2 mt-2">
              <button 
                onClick={handlePayment}
                disabled={loading || (modalCouponCode && !validatedCoupon && !couponError)}
                className="btn btn-primary w-full flex justify-center text-center shadow-md py-3 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? 'Processing...' : (!modalCouponCode && !validatedCoupon) ? 'Proceed to Payment' : (finalAmount === 0 ? 'Activate Plan for Free' : 'Pay Final Amount')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
