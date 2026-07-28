/**
 * Laravel API'sine (bkz. app/Http/Controllers/Api/V1) bağlanan minimal fetch sarmalayıcı.
 * NEXT_PUBLIC_API_URL .env.local'de tanımlanmalı, ör: https://api.example.com/api/v1
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';
// /sanctum/csrf-cookie, /api/v1 ÖNEKİ OLMADAN kök domainde yaşar (Sanctum paketinin
// kendi route'u) — bu yüzden API_BASE_URL'den '/api/v1' kısmını ayırıyoruz.
const APP_BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

/**
 * Sanctum'un SPA (çerez tabanlı) kimlik doğrulaması için ZORUNLU ilk adım.
 * Uygulama açılışında (AuthProvider mount olduğunda) ve her login/register
 * denemesinden ÖNCE çağrılmalı — XSRF-TOKEN çerezini set eder, apiFetch bunu
 * okuyup X-XSRF-TOKEN header'ı olarak gönderir.
 */
export async function primeCsrfCookie(): Promise<void> {
  await fetch(`${APP_BASE_URL}/sanctum/csrf-cookie`, { credentials: 'include' });
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));

  return match ? decodeURIComponent(match[1]) : null;
}

export interface Product {
  id: number;
  slug: string;
  sku: string;
  name: string;
  shortDescription: string | null;
  thumbnailUrl: string | null;
  basePrice: string;
  discountedPrice: string | null;
  currentPrice: string;
  currency: string;
  deliveryType: 'pin' | 'code' | 'license_key' | 'file' | 'account_credentials';
  warrantyDays: number;
  platformName: string | null;
  categoryName: string;
  availableStockCount: number;
  isInStock: boolean;
}

export interface CartLine {
  productId: number;
  quantity: number;
}

export interface OrderSummary {
  uuid: string;
  orderNumber: string;
  grandTotal: string;
  currency: string;
  status: string;
}

export interface DeliveryDetail {
  id: number;
  deliveredAt: string | null;
  deliveryType: Product['deliveryType'];
  maskedContent: string;
  warrantyExpiresAt: string | null;
  warrantyValid: boolean;
  warrantyClaimed: boolean;
}

export interface OrderItemDetail {
  id: number;
  productName: string;
  unitPrice: string;
  quantity: number;
  lineTotal: string;
  status: string;
  delivery: DeliveryDetail | null;
}

export interface OrderDetail {
  uuid: string;
  orderNumber: string;
  status: string;
  subtotal: string;
  discountTotal: string;
  taxTotal: string;
  grandTotal: string;
  currency: string;
  createdAt: string;
  paidAt: string | null;
  deliveredAt: string | null;
  invoicePdfUrl: string | null;
  items: OrderItemDetail[];
}

export interface TicketMessage {
  id: number;
  message: string;
  isFromStaff: boolean;
  authorName: string;
  attachmentPaths: string[];
  createdAt: string;
}

export interface Ticket {
  id: number;
  ticketNumber: string;
  subject: string;
  department: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'pending_customer' | 'pending_staff' | 'resolved' | 'closed';
  orderNumber: string | null;
  createdAt: string;
  messages: TicketMessage[];
}

export interface AdminProduct {
  id: number;
  uuid: string;
  sku: string;
  slug: string;
  status: 'draft' | 'active' | 'out_of_stock' | 'archived';
  categoryId: number;
  categoryName: string | null;
  platformId: number | null;
  platformName: string | null;
  basePrice: string;
  baseCurrency: string;
  discountedPrice: string | null;
  deliveryType: Product['deliveryType'];
  stockMode: 'manual' | 'bulk_upload' | 'api_supplier';
  warrantyDays: number;
  salesCount: number;
  viewCount: number;
  availableStockCount: number;
  translations: {
    tr: { name: string | null; shortDescription: string | null };
    en: { name: string | null; shortDescription: string | null };
  };
  createdAt: string;
}

export interface AdminTicket extends Ticket {
  customerName: string;
  assigneeName: string | null;
  slaBreached: boolean;
  firstResponseDueAt: string | null;
}

export interface AdminPaymentMethod {
  id: number;
  slug: string;
  name: string;
  type: 'card' | 'wallet_transfer' | 'bank_transfer' | 'crypto' | 'cash_on_delivery' | 'internal';
  isActive: boolean;
  requiresManualApproval: boolean;
  minAmount: string | null;
  maxAmount: string | null;
  sortOrder: number;
  hasCredentialsConfigured: boolean;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  locale: string;
  roles: string[];
}

class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? 'GET').toUpperCase();
  const xsrfToken = method !== 'GET' ? readCookie('XSRF-TOKEN') : null;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    // Sanctum'un SPA (çerez tabanlı) kimlik doğrulaması için ZORUNLU — bu
    // olmadan farklı origin'deki (localhost:3000 -> localhost:8000) istekler
    // oturum çerezini taşımaz ve tüm auth:sanctum uç noktaları 401 döner.
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Bilinmeyen hata' }));
    throw new ApiError(body.message ?? `İstek başarısız (${res.status})`, res.status);
  }

  return res.json() as Promise<T>;
}

export const api = {
  setup: {
    status: () => apiFetch<{ needsSetup: boolean }>('/setup/status'),
    complete: async (payload: {
      site_name: string;
      admin_name: string;
      admin_email: string;
      admin_password: string;
      admin_password_confirmation: string;
      default_locale: string;
    }) => {
      await primeCsrfCookie();

      return apiFetch<{ message: string; data: { id: number; name: string; email: string } }>('/setup', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },
  auth: {
    register: async (payload: { name: string; email: string; password: string; password_confirmation: string }) => {
      await primeCsrfCookie();

      return apiFetch<{ data: AuthUser }>('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
    },
    login: async (payload: { email: string; password: string }) => {
      await primeCsrfCookie();

      return apiFetch<{ data: AuthUser }>('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
    },
    logout: () => apiFetch<{ message: string }>('/auth/logout', { method: 'POST' }),
    me: () => apiFetch<{ data: AuthUser | null }>('/auth/me'),
  },
  categories: {
    list: () => apiFetch<{ data: { id: number; slug: string; name: string }[] }>('/categories'),
  },
  products: {
    list: (params?: { category?: string; platform?: string; search?: string }) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';

      return apiFetch<{ data: Product[] }>(`/products${qs}`);
    },
    bySlug: (slug: string) => apiFetch<{ data: Product }>(`/products/${slug}`),
  },
  checkout: {
    create: (items: CartLine[], couponCode?: string) =>
      apiFetch<{ order: OrderSummary }>('/checkout', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
          coupon_code: couponCode || undefined,
        }),
      }),
    pay: (orderUuid: string, paymentMethod: string) =>
      apiFetch<{ transaction_uuid: string; status: string }>(`/checkout/${orderUuid}/pay`, {
        method: 'POST',
        body: JSON.stringify({ payment_method: paymentMethod }),
      }),
  },
  orders: {
    get: (orderUuid: string) => apiFetch<{ data: OrderDetail }>(`/orders/${orderUuid}`),
    revealDelivery: (orderUuid: string, deliveryId: number) =>
      apiFetch<{ content: string }>(`/orders/${orderUuid}/deliveries/${deliveryId}/reveal`, {
        method: 'POST',
      }),
  },
  tickets: {
    list: () => apiFetch<{ data: Ticket[] }>('/tickets'),
    get: (id: number) => apiFetch<{ data: Ticket }>(`/tickets/${id}`),
    create: (payload: { department: string; subject: string; message: string; orderUuid?: string }) =>
      apiFetch<{ data: Ticket }>('/tickets', {
        method: 'POST',
        body: JSON.stringify({
          department: payload.department,
          subject: payload.subject,
          message: payload.message,
          order_uuid: payload.orderUuid,
        }),
      }),
    reply: (ticketId: number, message: string) =>
      apiFetch<{ data: TicketMessage }>(`/tickets/${ticketId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
  },
  adminTickets: {
    list: (filters?: { status?: string; priority?: string; assigned_to_me?: boolean; sla_breached_only?: boolean }) => {
      const qs = filters
        ? '?' + new URLSearchParams(filters as Record<string, string>).toString()
        : '';

      return apiFetch<{ data: AdminTicket[] }>(`/admin/tickets${qs}`);
    },
    get: (id: number) => apiFetch<{ data: AdminTicket }>(`/admin/tickets/${id}`),
    reply: (id: number, message: string, isInternalNote: boolean) =>
      apiFetch<{ data: TicketMessage }>(`/admin/tickets/${id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ message, is_internal_note: isInternalNote }),
      }),
    assign: (id: number, userId: number) =>
      apiFetch<{ data: AdminTicket }>(`/admin/tickets/${id}/assign`, {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
      }),
    updateStatus: (id: number, status: AdminTicket['status']) =>
      apiFetch<{ data: AdminTicket }>(`/admin/tickets/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },
  adminProducts: {
    list: (filters?: { status?: string; search?: string }) => {
      const qs = filters ? '?' + new URLSearchParams(filters).toString() : '';

      return apiFetch<{ data: AdminProduct[] }>(`/admin/products${qs}`);
    },
    get: (id: number) => apiFetch<{ data: AdminProduct }>(`/admin/products/${id}`),
    create: (payload: Record<string, unknown>) =>
      apiFetch<{ data: AdminProduct }>('/admin/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: number, payload: Record<string, unknown>) =>
      apiFetch<{ data: AdminProduct }>(`/admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    archive: (id: number) => apiFetch<{ message: string }>(`/admin/products/${id}`, { method: 'DELETE' }),
    importStock: async (productId: number, file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE_URL}/admin/products/${productId}/stock/import`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: { Accept: 'application/json' }, // Content-Type TARAYICI tarafından otomatik ayarlanmalı (multipart boundary)
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: 'Yükleme başarısız' }));
        throw new ApiError(body.message, res.status);
      }

      return res.json() as Promise<{
        batch: { id: number; totalRows: number; importedRows: number; failedRows: number; status: string };
      }>;
    },
  },
  dashboard: {
    get: () =>
      apiFetch<{
        todayRevenue: string;
        ordersByStatus: Record<string, number>;
        pendingReviewOrdersCount: number;
        openTicketsCount: number;
        slaBreachedTicketsCount: number;
        lowStockProducts: { id: number; sku: string; name: string; availableStockCount: number }[];
        recentOrders: {
          uuid: string;
          orderNumber: string;
          customerName: string | null;
          grandTotal: string;
          status: string;
          createdAt: string;
        }[];
      }>('/admin/dashboard'),
  },
  staff: {
    list: () =>
      apiFetch<{
        data: {
          id: number;
          name: string;
          email: string;
          status: string;
          roles: { id: number; slug: string; name: string }[];
        }[];
      }>('/admin/staff'),
    roles: () => apiFetch<{ data: { id: number; slug: string; name: string; isProtected: boolean }[] }>('/admin/roles'),
    updateRoles: (userId: number, roleIds: number[]) =>
      apiFetch(`/admin/staff/${userId}/roles`, {
        method: 'POST',
        body: JSON.stringify({ role_ids: roleIds }),
      }),
    revoke: (userId: number) => apiFetch(`/admin/staff/${userId}`, { method: 'DELETE' }),
  },
  paymentMethods: {
    list: () => apiFetch<{ data: AdminPaymentMethod[] }>('/admin/payment-methods'),
    create: (payload: Record<string, unknown>) =>
      apiFetch<{ data: AdminPaymentMethod }>('/admin/payment-methods', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: number, payload: Record<string, unknown>) =>
      apiFetch<{ data: AdminPaymentMethod }>(`/admin/payment-methods/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    toggle: (id: number) =>
      apiFetch<{ data: AdminPaymentMethod }>(`/admin/payment-methods/${id}/toggle`, { method: 'PATCH' }),
  },
  pushSubscriptions: {
    subscribe: (subscription: PushSubscriptionJSON) =>
      apiFetch('/push-subscriptions', { method: 'POST', body: JSON.stringify(subscription) }),
    unsubscribe: (endpoint: string) =>
      apiFetch('/push-subscriptions', { method: 'DELETE', body: JSON.stringify({ endpoint }) }),
  },
  adminThemes: {
    list: () =>
      apiFetch<{
        data: { id: number; name: string; isActive: boolean; tokens: Record<string, string> }[];
      }>('/admin/themes'),
    create: (name: string, tokens: Record<string, string>) =>
      apiFetch('/admin/themes', { method: 'POST', body: JSON.stringify({ name, tokens }) }),
    activate: (id: number) => apiFetch(`/admin/themes/${id}/activate`, { method: 'POST' }),
    remove: (id: number) => apiFetch(`/admin/themes/${id}`, { method: 'DELETE' }),
  },
  affiliate: {
    get: () =>
      apiFetch<{
        data: {
          id: number;
          referralCode: string;
          referralUrl: string;
          commissionRate: string;
          status: 'pending' | 'approved' | 'suspended';
          totalEarned: string;
          totalPending: string;
          commissions: { id: number; orderNumber: string | null; amount: string; status: string; createdAt: string }[];
        } | null;
      }>('/affiliate'),
    apply: () => apiFetch('/affiliate/apply', { method: 'POST' }),
  },
  adminAffiliates: {
    list: (status?: string) =>
      apiFetch<{
        data: {
          id: number;
          userName: string;
          userEmail: string;
          referralCode: string;
          commissionRate: string;
          status: string;
          totalPending: string;
          totalPaid: string;
        }[];
      }>(`/admin/affiliates${status ? `?status=${status}` : ''}`),
    approve: (id: number) => apiFetch(`/admin/affiliates/${id}/approve`, { method: 'POST' }),
    suspend: (id: number) => apiFetch(`/admin/affiliates/${id}/suspend`, { method: 'POST' }),
    updateCommissionRate: (id: number, rate: number) =>
      apiFetch(`/admin/affiliates/${id}/commission-rate`, {
        method: 'PUT',
        body: JSON.stringify({ commission_rate: rate }),
      }),
  },
  accountPrivacy: {
    exportData: () => apiFetch<Record<string, unknown>>('/account/export'),
    requestDeletion: (password: string) =>
      apiFetch<{ message: string }>('/account/delete-request', {
        method: 'POST',
        body: JSON.stringify({ password }),
      }),
  },
};

export { ApiError };
