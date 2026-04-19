export interface IBillingService {
  createCustomer(input: CreateCustomerInput): Promise<CustomerResult>;
  createCheckoutSession(input: CheckoutInput): Promise<{ url: string }>;
  createPortalSession(customerId: string): Promise<{ url: string }>;
  getSubscription(subscriptionId: string): Promise<SubscriptionResult>;
  cancelSubscription(subscriptionId: string): Promise<void>;
}

export interface CreateCustomerInput {
  email: string;
  name: string;
  metadata?: Record<string, string>;
}

export interface CustomerResult {
  customerId: string;
  email: string;
}

export interface CheckoutInput {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface SubscriptionResult {
  subscriptionId: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  plan: string;
  currentPeriodEnd: string;
}
