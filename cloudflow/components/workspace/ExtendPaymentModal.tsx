'use client';

import React, { useState } from 'react';
import { PRICING_PLANS, PricingPlan } from '@/config/vm-service';
import {
  X,
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  Lock,
  Smartphone,
  ChevronRight,
  Receipt,
} from 'lucide-react';

interface ExtendPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (addedSeconds: number, plan: PricingPlan) => void;
  initialPlan?: PricingPlan;
  isInitialPurchase?: boolean;
}

export function ExtendPaymentModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  initialPlan,
  isInitialPurchase = false,
}: ExtendPaymentModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(
    initialPlan || PRICING_PLANS[0] // Default to ₹100 for 2 hours
  );
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('user@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('742');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    const txId = 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    setTransactionId(txId);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentDone(true);
    }, 1200);
  };

  const handleCompleteAndResume = () => {
    onPaymentSuccess(selectedPlan.durationSeconds, selectedPlan);
    setPaymentDone(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="extend-payment-modal"
        className="relative w-full max-w-2xl rounded-2xl border border-zinc-700/80 bg-zinc-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {isInitialPurchase ? 'Start Remote VM Workspace' : 'Extend VM Session Time'}
              </h3>
              <p className="text-xs text-zinc-400">
                Seamless cloud compute payment gateway
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {paymentDone ? (
            /* Payment Success Screen */
            <div className="text-center py-6 space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h4 className="text-2xl font-black text-white">Payment Confirmed!</h4>
                <p className="text-sm text-zinc-300">
                  ₹{selectedPlan.priceInr} received via {paymentMethod.toUpperCase()}.
                </p>
                <p className="text-xs font-mono text-zinc-500">Transaction ID: {transactionId}</p>
              </div>

              <div className="max-w-md mx-auto p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-left space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Allocated Time:</span>
                  <span className="font-bold text-white">+{selectedPlan.durationHours} Hours (Hot-Swap)</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Compute Node:</span>
                  <span className="font-bold text-white">ap-south-1.mumbai.internal</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>State Protection:</span>
                  <span className="text-emerald-400 font-medium">Memory and terminals intact</span>
                </div>
              </div>

              <button
                id="payment-success-resume-btn"
                onClick={handleCompleteAndResume}
                className="w-full max-w-md mx-auto py-3.5 px-6 rounded-xl font-black text-white bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Resume Active Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              {/* Step 1: Select Duration & Plan */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    1. Choose Compute Time Package
                  </label>
                  <span className="text-[11px] text-amber-300 font-medium">
                    Standard Rule: ₹100 for 2 Hours
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PRICING_PLANS.map((plan) => {
                    const isSelected = selectedPlan.id === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/10 shadow-md ring-1 ring-blue-500'
                            : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                        }`}
                      >
                        {plan.isPopular && (
                          <span className="absolute -top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-zinc-950 uppercase">
                            Default
                          </span>
                        )}
                        <div className="font-bold text-white text-sm">{plan.name}</div>
                        <div className="text-xs text-zinc-400 mt-0.5">{plan.durationHours} Hours compute</div>
                        <div className="mt-2 text-lg font-black text-amber-300">
                          ₹{plan.priceInr}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Payment Method */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  2. Select Payment Method
                </label>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`py-3 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'upi'
                        ? 'border-blue-500 bg-blue-500/15 text-white ring-1 ring-blue-500'
                        : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-emerald-400" />
                    <span>UPI / QR Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-3 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-blue-500 bg-blue-500/15 text-white ring-1 ring-blue-500'
                        : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-blue-400" />
                    <span>Debit / Credit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`py-3 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'netbanking'
                        ? 'border-blue-500 bg-blue-500/15 text-white ring-1 ring-blue-500'
                        : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Building className="w-5 h-5 text-amber-400" />
                    <span>Net Banking</span>
                  </button>
                </div>
              </div>

              {/* Payment Details Subform */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                {paymentMethod === 'upi' && (
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Simulated QR Code */}
                    <div className="p-3 bg-white rounded-xl shadow-md shrink-0 text-center">
                      <div className="w-28 h-28 bg-zinc-900 rounded-lg p-1.5 flex flex-col justify-between items-center text-[9px] text-white">
                        <div className="grid grid-cols-4 gap-1 w-full h-full p-1 bg-zinc-950 rounded">
                          <div className="bg-white rounded-xs"></div>
                          <div className="bg-white rounded-xs"></div>
                          <div className="bg-white rounded-xs"></div>
                          <div className="bg-zinc-800 rounded-xs"></div>
                          <div className="bg-white rounded-xs"></div>
                          <div className="bg-zinc-800 rounded-xs"></div>
                          <div className="bg-white rounded-xs"></div>
                          <div className="bg-white rounded-xs"></div>
                          <div className="bg-zinc-800 rounded-xs"></div>
                          <div className="bg-white rounded-xs"></div>
                          <div className="bg-white rounded-xs"></div>
                          <div className="bg-white rounded-xs"></div>
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-700 font-bold mt-1 block">Scan with any UPI App</span>
                    </div>

                    <div className="space-y-3 flex-1 w-full">
                      <label className="text-xs text-zinc-400 block">Or enter Virtual Payment Address (VPA)</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="username@okhdfcbank"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-blue-500 font-mono"
                      />
                      <div className="flex gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                          Google Pay
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                          PhonePe
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                          Paytm
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-zinc-400 block mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-zinc-400 block mb-1">Valid Thru</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 block mb-1">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div className="space-y-3 text-xs">
                    <label className="text-zinc-400 block">Select Authorized Bank</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((b) => (
                        <button
                          key={b}
                          type="button"
                          className="p-2.5 rounded-lg border border-zinc-800 hover:border-blue-500 bg-zinc-900 text-zinc-200 text-center text-[11px] cursor-pointer"
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Workspace Time:</span>
                  <span className="text-white font-medium">+{selectedPlan.durationHours} Hours Session</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Cloud Compute Base Rate:</span>
                  <span className="text-zinc-300">₹{selectedPlan.priceInr}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Taxes & GST (18% inclusive):</span>
                  <span className="text-zinc-300">₹0 extra</span>
                </div>
                <div className="pt-2 border-t border-zinc-800 flex justify-between items-baseline font-bold text-sm">
                  <span className="text-white">Total Amount Payable:</span>
                  <span className="text-xl font-black text-amber-300">₹{selectedPlan.priceInr}</span>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 space-y-2">
                <button
                  id="submit-payment-btn"
                  onClick={handlePay}
                  disabled={isProcessing}
                  className="w-full py-4 px-6 rounded-xl font-black text-sm sm:text-base text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 active:scale-98 shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Payment (₹{selectedPlan.priceInr})...</span>
                    </div>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-amber-300" />
                      <span>Pay ₹{selectedPlan.priceInr} & {isInitialPurchase ? 'Start Session' : 'Extend +2h'}</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>256-bit encrypted checkout • Zero setup fee</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
