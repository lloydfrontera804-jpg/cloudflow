'use client';

import React from 'react';
import { PRICING_PLANS, PricingPlan } from '@/config/vm-service';
import { Check, Zap, Sparkles, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

interface PricingCardsProps {
  onSelectPlan: (plan: PricingPlan) => void;
}

export function PricingCards({ onSelectPlan }: PricingCardsProps) {
  return (
    <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5" />
          <span>Transparent Pay-As-You-Go Computing</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Simple, Predictable VM Pricing
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base">
          No subscription traps. Pay only for the computing time you need with our fixed default rate of{' '}
          <strong className="text-amber-300 font-semibold">₹100 for 2 hours</strong>. Extend on-the-fly anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {PRICING_PLANS.map((plan) => {
          const isPopular = plan.isPopular;
          return (
            <div
              key={plan.id}
              id={`pricing-card-${plan.id}`}
              className={`relative flex flex-col justify-between rounded-2xl p-6 sm:p-8 transition-all duration-300 ${
                isPopular
                  ? 'bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-blue-500 shadow-2xl shadow-blue-500/15 scale-[1.03] z-10'
                  : 'bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 shadow-xl'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xs tracking-wider uppercase shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>Core Default Option</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  {plan.savingsBadge && !isPopular && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {plan.savingsBadge}
                    </span>
                  )}
                </div>

                <div className="mt-4 mb-6 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                    ₹{plan.priceInr}
                  </span>
                  <span className="text-zinc-400 text-sm">
                    / {plan.durationHours} Hours session
                  </span>
                </div>

                <p className="text-xs text-zinc-400 pb-4 border-b border-zinc-800">
                  Effective rate: ₹{Math.round(plan.priceInr / plan.durationHours)} per hour of dedicated cloud VM time.
                </p>

                <ul className="mt-6 space-y-3 text-xs sm:text-sm text-zinc-300">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full p-0.5 bg-blue-500/20 text-blue-400">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <button
                  id={`select-plan-${plan.id}`}
                  onClick={() => onSelectPlan(plan)}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isPopular
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-zinc-800 hover:bg-zinc-750 hover:bg-zinc-700 text-zinc-100 border border-zinc-700'
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Start Session for ₹{plan.priceInr}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="mt-2 text-center text-[11px] text-zinc-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-zinc-400" />
                  <span>Instant access • 5-min warning included</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
