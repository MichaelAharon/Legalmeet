'use client';

import { useSubscription, useCheckout, useBillingPortal, useCancelSubscription } from '@/hooks/useBilling';
import { CreditCard, Check, ArrowRight } from 'lucide-react';

const plans = [
  { id: 'solo', name: 'Solo', price: '$29', period: '/mo', features: ['10 meetings/mo', 'Basic NDA templates', 'Manual NDA creation'], highlight: false },
  { id: 'team', name: 'Team', price: '$49', period: '/user/mo', features: ['Unlimited meetings', 'AI NDA generation', 'Recording + transcription', 'Meeting summaries'], highlight: true },
  { id: 'business', name: 'Business', price: '$99', period: '/user/mo', features: ['Everything in Team', 'Custom templates', 'Analytics dashboard', 'RBAC', 'Priority support'], highlight: false },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', period: '', features: ['Everything in Business', 'SSO/SAML', 'Custom retention', 'API access', 'Dedicated CSM'], highlight: false },
];

export default function BillingPage() {
  const { data: subscription, isLoading } = useSubscription();
  const checkout = useCheckout();
  const portal = useBillingPortal();
  const cancel = useCancelSubscription();

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Billing & Subscription</h1>

      {/* Current Subscription */}
      {subscription && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-indigo-500" />
                <h3 className="font-medium text-slate-900 dark:text-white capitalize">{subscription.plan} Plan</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${subscription.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400' : 'bg-red-100 text-red-700'}`}>
                  {subscription.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Current period ends {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
              {subscription.meetingsUsed !== undefined && (
                <p className="text-sm text-slate-500">
                  {subscription.meetingsUsed} meetings used {subscription.meetingsLimit ? `/ ${subscription.meetingsLimit}` : '(unlimited)'}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  const result = await portal.mutateAsync();
                  window.open(result.url, '_blank');
                }}
                className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Manage Billing
              </button>
              {subscription.status === 'active' && (
                <button
                  onClick={() => cancel.mutate()}
                  className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plans */}
      <div>
        <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const isCurrent = subscription?.plan === plan.id;
            return (
              <div key={plan.id} className={`rounded-lg border p-5 ${plan.highlight ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800`}>
                {plan.highlight && <span className="text-xs font-medium text-indigo-500 mb-2 block">Most Popular</span>}
                <h4 className="font-bold text-lg text-slate-900 dark:text-white">{plan.name}</h4>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                  <span className="text-sm text-slate-500">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <button
                  disabled={isCurrent}
                  onClick={async () => {
                    const result = await checkout.mutateAsync(plan.id);
                    window.open(result.url, '_blank');
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium ${
                    isCurrent
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-default'
                      : plan.highlight
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : <>Get Started <ArrowRight className="h-4 w-4" /></>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
