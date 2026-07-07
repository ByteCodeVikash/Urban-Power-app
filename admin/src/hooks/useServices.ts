/**
 * useServices — fetches live service/category data from the three domain APIs:
 *   - GET /api/v1/scrap/categories      (ScrapCategory + items)
 *   - GET /api/v1/beautician/categories  (BeauticianCategory + services)
 *   - GET /api/v1/maintenance/categories (MaintenanceCategory + services)
 *
 * All three are normalised into a common ServiceItem / ServiceCategory shape
 * so the Services and Categories pages can work uniformly.
 *
 * NOTE: The backend exposes read-only endpoints only (no write mutations).
 *       Add / Edit / Delete in the admin UI are handled with local optimistic
 *       state that is merged on top of live data.
 */
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/apiClient';

// ─── Shared normalised types ───────────────────────────────────────────────────

export type ServiceDomain = 'Scrap' | 'Beautician' | 'Maintenance';

/** A single service item (leaf node). */
export interface ServiceItem {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  domain: ServiceDomain;
  /** For Beautician/Maintenance: flat price in ₹. For Scrap: price per kg in ₹. */
  price: number;
  /** Readable label, e.g. "₹1,200" or "₹10/kg" */
  priceLabel: string;
  description: string | null;
  duration: number | null; // minutes — Beautician & Maintenance only
  active: boolean;
  /** True if this record came from the backend (false = locally-added) */
  fromApi: boolean;
}

/** A category that groups service items. */
export interface ServiceCategory {
  id: string;
  name: string;
  domain: ServiceDomain;
  description: string | null;
  icon: string | null;
  image: string | null;
  active: boolean;
  services: ServiceItem[];
  fromApi: boolean;
}

// ─── Raw API shapes ────────────────────────────────────────────────────────────

interface RawScrapItem {
  id: string;
  name: string;
  category_id: string;
  description?: string | null;
  price_per_kg: number;
  image?: string | null;
  active: boolean;
}

interface RawScrapCategory {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  active: boolean;
  items: RawScrapItem[];
}

interface RawService {
  id: string;
  name: string;
  category_id: string;
  description?: string | null;
  price: number;
  duration?: number | null;
  image?: string | null;
  active: boolean;
}

interface RawCategory {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  active: boolean;
  services: RawService[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(amount: number, perKg = false): string {
  const formatted = new Intl.NumberFormat('en-IN').format(Math.round(amount));
  return perKg ? `₹${formatted}/kg` : `₹${formatted}`;
}

function normaliseScrapCategories(raw: RawScrapCategory[]): ServiceCategory[] {
  return raw.map(cat => ({
    id: cat.id,
    name: cat.name,
    domain: 'Scrap' as ServiceDomain,
    description: cat.description ?? null,
    icon: cat.icon ?? null,
    image: cat.image ?? null,
    active: cat.active,
    fromApi: true,
    services: cat.items.map(item => ({
      id: item.id,
      name: item.name,
      categoryId: cat.id,
      categoryName: cat.name,
      domain: 'Scrap' as ServiceDomain,
      price: item.price_per_kg,
      priceLabel: formatPrice(item.price_per_kg, true),
      description: item.description ?? null,
      duration: null,
      active: item.active,
      fromApi: true,
    })),
  }));
}

function normaliseDomainCategories(
  raw: RawCategory[],
  domain: 'Beautician' | 'Maintenance',
): ServiceCategory[] {
  return raw.map(cat => ({
    id: cat.id,
    name: cat.name,
    domain,
    description: cat.description ?? null,
    icon: cat.icon ?? null,
    image: cat.image ?? null,
    active: cat.active,
    fromApi: true,
    services: cat.services.map(svc => ({
      id: svc.id,
      name: svc.name,
      categoryId: cat.id,
      categoryName: cat.name,
      domain,
      price: svc.price,
      priceLabel: formatPrice(svc.price, false),
      description: svc.description ?? null,
      duration: svc.duration ?? null,
      active: svc.active,
      fromApi: true,
    })),
  }));
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface AllServicesData {
  scrap: ServiceCategory[];
  beautician: ServiceCategory[];
  maintenance: ServiceCategory[];
  /** Flat list of all categories across all three domains */
  allCategories: ServiceCategory[];
  /** Flat list of all service items across all three domains */
  allServices: ServiceItem[];
}

export const useServices = () => {
  return useQuery<AllServicesData>({
    queryKey: ['services-all'],
    queryFn: async () => {
      const [scrapRes, beauticianRes, maintenanceRes] = await Promise.allSettled([
        apiClient.get<RawScrapCategory[]>('/api/v1/scrap/categories'),
        apiClient.get<RawCategory[]>('/api/v1/beautician/categories'),
        apiClient.get<RawCategory[]>('/api/v1/maintenance/categories'),
      ]);

      const scrap =
        scrapRes.status === 'fulfilled'
          ? normaliseScrapCategories(scrapRes.value.data ?? [])
          : [];

      const beautician =
        beauticianRes.status === 'fulfilled'
          ? normaliseDomainCategories(beauticianRes.value.data ?? [], 'Beautician')
          : [];

      const maintenance =
        maintenanceRes.status === 'fulfilled'
          ? normaliseDomainCategories(maintenanceRes.value.data ?? [], 'Maintenance')
          : [];

      const allCategories = [...scrap, ...beautician, ...maintenance];
      const allServices = allCategories.flatMap(cat => cat.services);

      return { scrap, beautician, maintenance, allCategories, allServices };
    },
    staleTime: 2 * 60_000, // 2 minutes
  });
};

export default useServices;
