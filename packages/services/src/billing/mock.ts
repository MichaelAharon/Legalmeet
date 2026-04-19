import type { IBillingService, CreateCustomerInput, CustomerResult, CheckoutInput, SubscriptionResult } from './interface';

export class MockBillingService implements IBillingService {
  async createCustomer(input: CreateCustomerInput): Promise<CustomerResult> {
    return { customerId: `cus_mock_${Date.now()}`, email: input.email };
  }

  async createCheckoutSession(input: CheckoutInput): Promise<{ url: string }> {
    return { url: `https://checkout.stripe.com/mock?customer=${input.customerId}&price=${input.priceId}` };
  }

  async createPortalSession(customerId: string): Promise<{ url: string }> {
    return { url: `https://billing.stripe.com/mock/portal?customer=${customerId}` };
  }

  async getSubscription(_subscriptionId: string): Promise<SubscriptionResult> {
    return {
      subscriptionId: _subscriptionId,
      status: 'active',
      plan: 'team',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  async cancelSubscription(_subscriptionId: string): Promise<void> {
    // Mock: no-op
  }
}
