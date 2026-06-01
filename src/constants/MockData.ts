export interface MinimalService {
  id: string;
  title: string;
  image: string;
  rating: number;
  reviews: number;
  price: number;
  duration: string;
  gender?: 'female' | 'male' | 'unisex'; // optional — used for gender-filtered categories
  subcategories?: string[];
}

export interface BeautyCategory {
  name: string;
  subcategories: (string | { name: string; price: number })[];
}

export const beautyCategories: BeautyCategory[] = [
  {
    name: 'Facial & Skincare',
    subcategories: [
      { name: 'Cleanup', price: 1000 },
      { name: 'Fruit Facial', price: 500 },
      { name: 'Gold Facial', price: 1500 },
      { name: 'Diamond Facial', price: 2000 },
      { name: 'Hydra Facial', price: 2500 },
      { name: 'Anti-Aging Facial', price: 1800 },
      { name: 'Detan Facial', price: 1200 },
      { name: 'Acene Treatment', price: 1600 },
      { name: 'Skin Polishing', price: 2200 },
    ],
  },
  {
    name: 'Waxing',
    subcategories: [
      'Rice Wax',
      'Chocolate Wax',
      'Honey Wax',
      'Full Body Wax',
      'Bikini Wax',
      'Roll On Wax',
    ],
  },
  {
    name: 'Hand & Feet Care',
    subcategories: ['Manicure', 'Pedicure', 'Spa Pedicure','Spa Manicure', ],
  },
  {
    name: 'Hair Services',
    subcategories: [
      'Hair Cut',
      'Hair Spa',
      'Hair Smoothing',
      'Hair Treatment',
      'Rebonding',
      'Hair Color',
      'Global Hair Color',
      'Highlights',
      'Hair Straight',
      'Hair Styling',
    ],
  },
  {
    name: 'Makeup Categories',
    subcategories: [
      ' HD Bridal Makeup',
      ' Airbrush Bridal Makeup',
      'Luxury Bridal Makeup',
      'Signature Bridal Makeup',
      'Royal Bridal Package',
      'Engagement Makeup',
      'Cocktail Party Makeup',
      'Haldi Makeup',
      'Mehndi Makeup',
    ],
  },
  {
    name: 'Eye And Beauty Services',
    subcategories: [
      'Eyebrow',
      'Upper Lips',
      'Eyelash Extension',
      'Lash Lifting',
    ],
  },
  {
    name: 'Home Beauty Services',
    subcategories: [
      'Home Beauty Service',
      'Home Bridal Service',
      'Home Facial Service ',
    ],
  },
  {
    name: 'Beauty Academy Categories',
    subcategories: [
      'Basic Beautician Course',
      'Advance Makeup Course',
      'Hair Course',
      'Nail Art Course',
      'Skin Course',
    ],
  },
  {
    name: 'Premium Categories',
    subcategories: [
      'Luxury Beauty Services',
      'Bridal And Glam Studio',
      'Professional Salon Service ',
      'Beauty And Wellness Care',
      'Complete Makeover Solution',
    ],
  },
  {
    name: 'Party Makeup',
    subcategories: ['Party Glam Makeup', 'Soft Glam Makeup', 'Nude Makeup', 'Shimmer Makeup','Smokey Eyes Makeup', 'Minimal Makeup','Western Party Look','Traditional Makeup',],
  },
  {
    name: 'Nail Art',
    subcategories: ['Gel Polish', 'Extension', 'Nail Art Design',],
  },
];

const beautySubcategoriesByName = Object.fromEntries(
  beautyCategories.map((c) => [c.name, c.subcategories]),
) as Record<string, any[]>;

export interface Review {
  id: string;
  user: string;
  rating: number;
  date: string;
  text: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface DetailedService extends MinimalService {
  detailedReviews: Review[];
  faqs: FAQ[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  services: MinimalService[];
}

export interface Booking {
  id: string;
  serviceId: string;
  title: string;
  date: string;
  status: 'Completed' | 'Upcoming' | 'Cancelled';
  price: number;
}

export interface Address {
  id: string;
  type: 'Home' | 'Work' | 'Other';
  details: string;
}

export const CATEGORIES: Category[] = [
  // ── Cleaning ─────────────────────────────────────────────────────────────
  {
    id: 'c1',
    name: 'Cleaning',
    icon: 'sparkles',
    services: [
      {
        id: 's1a', title: 'Home Deep Cleaning',
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop',
        rating: 4.8, reviews: 12.4, price: 3499, duration: '4-5 hrs',
      },
      {
        id: 's1b', title: 'Sofa Cleaning',
        image: 'https://images.unsplash.com/photo-1550963295-019d8a8a61c5?q=80&w=600&auto=format&fit=crop',
        rating: 4.6, reviews: 5.2, price: 599, duration: '1 hr',
      },
      {
        id: 's1c', title: 'Carpet Cleaning',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop',
        rating: 4.5, reviews: 8.1, price: 799, duration: '2 hrs',
      },
      {
        id: 's1d', title: 'Bathroom Cleaning',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop',
        rating: 4.7, reviews: 18.1, price: 499, duration: '45 mins',
      },
      {
        id: 's1e', title: 'Kitchen Cleaning',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=600&auto=format&fit=crop',
        rating: 4.7, reviews: 9.4, price: 699, duration: '1.5 hrs',
      },
      {
        id: 's1f', title: 'Office Cleaning',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop',
        rating: 4.6, reviews: 7.8, price: 2499, duration: '3-4 hrs',
      },
    ],
  },

  // ── Beauty (gender-based) ─────────────────────────────────────────────────
  {
    id: 'c2',
    name: 'Beauty',
    icon: 'scissors',
    services: [
      // Female
      {
        id: 's2a',
        title: 'Facial & Skincare',
        image: 'https://images.unsplash.com/photo-1487412947147-5cebf100d293?q=80&w=600&auto=format&fit=crop',
        rating: 4.9,
        reviews: 15.3,
        price: 1499,
        duration: '2 hrs',
        gender: 'female',
        subcategories: beautySubcategoriesByName['Facial & Skincare'],
      },
      {
        id: 's2b',
        title: 'Waxing',
        image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop',
        rating: 4.8,
        reviews: 20.1,
        price: 799,
        duration: '1 hr',
        gender: 'female',
        subcategories: beautySubcategoriesByName['Waxing'],
      },
      {
        id: 's2c',
        title: 'Hand & Feet Care',
        image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=600&auto=format&fit=crop',
        rating: 4.9,
        reviews: 18.2,
        price: 999,
        duration: '1.5 hrs',
        gender: 'female',
        subcategories: beautySubcategoriesByName['Hand & Feet Care'],
      },
      {
        id: 's2h',
        title: 'Home Beauty Services',
        image: 'https://images.unsplash.com/photo-1766763845883-020866685bb6?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        rating: 4.9,
        reviews: 12.7,
        price: 4999,
        duration: '4-5 hrs',
        gender: 'female',
      },
      {
        id: 's2i',
        title: 'Hair Services',
        image: 'https://images.unsplash.com/photo-1776850476481-2bccba2e35c7?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        rating: 4.9,
        reviews: 12.7,
        price: 4999,
        duration: '4-5 hrs',
        gender: 'female',
        subcategories: beautySubcategoriesByName['Hair Services'],
      },
      {
        id: 's2j',
        title: 'Beauty Academy Categories',
        image: 'https://images.unsplash.com/photo-1746723375184-5f537d2e6f31?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        rating: 4.9,
        reviews: 12.7,
        price: 4999,
        duration: '4-5 hrs',
        gender: 'female',
      },
      {
        id: 's2e',
        title: 'Makeup Categories',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop',
        rating: 4.8,
        reviews: 22.4,
        price: 1199,
        duration: '2 hrs',
        gender: 'female',
        subcategories: beautySubcategoriesByName['Makeup Categories'],
      },
      {
        id: 's2f',
        title: 'Party Makeup',
        image: 'https://images.unsplash.com/photo-1768039376092-70e587cb7b94?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        rating: 4.9,
        reviews: 12.7,
        price: 4999,
        duration: '4-5 hrs',
        gender: 'female',
        subcategories: beautySubcategoriesByName['Party Makeup'],
      },
      {
        id: 's2g',
        title: 'Nail Art',
        image: 'https://images.unsplash.com/photo-1754799670380-17640d939e32?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        rating: 4.9,
        reviews: 12.7,
        price: 4999,
        duration: '4-5 hrs',
        gender: 'female',
        subcategories: beautySubcategoriesByName['Nail Art'],
      },
      {
        id: 's2l',
        title: 'Eye And Beauty Services',
        image: 'https://images.unsplash.com/photo-1768039376092-70e587cb7b94?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        rating: 5.9,
        reviews: 12.7,
        price: 999,
        duration: '1hrs',
        gender: 'female',
        subcategories: beautySubcategoriesByName['Eye And Beauty Services'],
      },
      {
        id: 's2m',
        title: 'Premium Services',
        image: 'https://images.unsplash.com/photo-1768039376092-70e587cb7b94?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        rating: 5.9,
        reviews: 12.7,
        price: 2999,
        duration: '1hrs',
        gender: 'female',
        subcategories: beautySubcategoriesByName['Premium Services'],
      },

      // Male
      {
        id: 's2m', title: 'Home Salon Service',
        image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600&auto=format&fit=crop',
        rating: 4.7, reviews: 14.5, price: 599, duration: '1 hr', gender: 'male',
      },
    ],
  },

  // ── Maintenance (c3) ──────────────────────────────────────────────────────
  {
    id: 'c3',
    name: 'Maintenance',
    icon: 'wrench',
    services: [
      { id: 'c3s1', title: 'Electrician', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop', rating: 4.8, reviews: 25.4, price: 199, duration: '1 hr' },
      { id: 'c3s2', title: 'Carpenter', image: 'https://images.unsplash.com/photo-1595844730298-b9f0ff98ffd0?q=80&w=600&auto=format&fit=crop', rating: 4.7, reviews: 18.2, price: 249, duration: '1 hr' },
      { id: 'c3s3', title: 'AC Repair & Service', image: 'https://images.unsplash.com/photo-1518081461904-9d8f136351c2?q=80&w=600&auto=format&fit=crop', rating: 4.9, reviews: 44.2, price: 499, duration: '45 mins' },
      { id: 'c3s4', title: 'RO / Water Purifier Service', image: 'https://images.unsplash.com/photo-1585837582813-e1518ed41aa1?q=80&w=600&auto=format&fit=crop', rating: 4.6, reviews: 12.1, price: 299, duration: '1 hr' },
      { id: 'c3s5', title: 'Plumber', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=600&auto=format&fit=crop', rating: 4.8, reviews: 21.3, price: 249, duration: '1 hr' },
    ],
  },

  // ── Repair (c4) ───────────────────────────────────────────────────────────
  {
    id: 'c4',
    name: 'Repair',
    icon: 'wrench',
    services: [
      { id: 'c4s1', title: 'Mobile Repair', image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=600&auto=format&fit=crop', rating: 4.7, reviews: 15.3, price: 199, duration: '30-60 mins' },
      { id: 'c4s2', title: 'Laptop Repair', image: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?q=80&w=600&auto=format&fit=crop', rating: 4.6, reviews: 8.4, price: 499, duration: '1-3 hrs' },
      { id: 'c4s3', title: 'TV Repair', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=600&auto=format&fit=crop', rating: 4.5, reviews: 6.2, price: 399, duration: '1-2 hrs' },
      { id: 'c4s4', title: 'Appliance Repair', image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=600&auto=format&fit=crop', rating: 4.6, reviews: 11.1, price: 299, duration: '1-2 hrs' },
    ],
  },

  // ── Auto Service (c5) ─────────────────────────────────────────────────────
  {
    id: 'c5',
    name: 'Auto Service',
    icon: 'autoservice',
    services: [
      { id: 'c5s1', title: 'Car Repair', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=600&auto=format&fit=crop', rating: 4.7, reviews: 9.8, price: 799, duration: '2-4 hrs' },
      { id: 'c5s2', title: 'Bike Repair', image: 'https://images.unsplash.com/photo-1673870861514-8c72efb696f3?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', rating: 4.6, reviews: 12.1, price: 299, duration: '1-2 hrs' },
      { id: 'c5s3', title: 'Car Wash', image: 'https://images.unsplash.com/photo-1520340719-da78c7eaf7d4?q=80&w=600&auto=format&fit=crop', rating: 4.8, reviews: 20.4, price: 399, duration: '45 mins' },
      { id: 'c5s4', title: 'Denting & Painting', image: 'https://images.unsplash.com/photo-1552158939-d94b13cdb51e?q=80&w=600&auto=format&fit=crop', rating: 4.5, reviews: 4.7, price: 1999, duration: '1-2 days' },
    ],
  },

  // ── Learning (c6) ─────────────────────────────────────────────────────────
  {
    id: 'c6',
    name: 'Learning',
    icon: 'learning',
    services: [
      { id: 'c6s1', title: 'Home Tuition', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop', rating: 4.8, reviews: 6.4, price: 499, duration: '1 hr/session' },
      { id: 'c6s2', title: 'Online Classes', image: 'https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=600&auto=format&fit=crop', rating: 4.7, reviews: 11.2, price: 299, duration: '1 hr/session' },
      { id: 'c6s3', title: 'Skill Courses', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop', rating: 4.6, reviews: 5.3, price: 1499, duration: '10 sessions' },
      { id: 'c6s4', title: 'Computer Training', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop', rating: 4.7, reviews: 7.8, price: 799, duration: '8 sessions' },
      { id: 'c6s5', title: 'Beautician Learning', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop', rating: 4.8, reviews: 3.9, price: 2999, duration: '15 sessions' },
    ],
  },

  // ── Event (c7) ────────────────────────────────────────────────────────────
  {
    id: 'c7',
    name: 'Event',
    icon: 'event',
    services: [
      { id: 'c7s1', title: 'Photography', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop', rating: 4.9, reviews: 14.2, price: 3999, duration: 'Full day' },
      { id: 'c7s2', title: 'Videography', image: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?q=80&w=600&auto=format&fit=crop', rating: 4.8, reviews: 8.7, price: 5999, duration: 'Full day' },
      { id: 'c7s3', title: 'Event Planning', image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=600&auto=format&fit=crop', rating: 4.7, reviews: 5.1, price: 9999, duration: 'Custom' },
      { id: 'c7s4', title: 'Decoration Services', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=600&auto=format&fit=crop', rating: 4.8, reviews: 9.4, price: 4999, duration: 'Half day' },
    ],
  },

  // ── Business (c8) ─────────────────────────────────────────────────────────
  {
    id: 'c8',
    name: 'Business',
    icon: 'business',
    services: [
      { id: 'c8s1', title: 'CA / Accounting', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=600&auto=format&fit=crop', rating: 4.8, reviews: 4.3, price: 1999, duration: 'Per session' },
      { id: 'c8s2', title: 'Legal Services', image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=600&auto=format&fit=crop', rating: 4.7, reviews: 3.1, price: 2499, duration: 'Per consultation' },
      { id: 'c8s3', title: 'Digital Marketing', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop', rating: 4.6, reviews: 6.8, price: 4999, duration: 'Per month' },
      { id: 'c8s4', title: 'Website Development', image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=600&auto=format&fit=crop', rating: 4.8, reviews: 7.5, price: 9999, duration: 'Per project' },
    ],
  },

  // ── Pest Control (c9) ─────────────────────────────────────────────────────
  {
    id: 'c9',
    name: 'Pest Control',
    icon: 'pest',
    services: [
      { id: 'c9s1', title: 'Cockroach Control', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=600&auto=format&fit=crop', rating: 4.7, reviews: 18.4, price: 699, duration: '2-3 hrs' },
      { id: 'c9s2', title: 'Termite Control', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop', rating: 4.8, reviews: 9.2, price: 1499, duration: '3-4 hrs' },
      { id: 'c9s3', title: 'Bed Bugs Control', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop', rating: 4.6, reviews: 7.1, price: 999, duration: '2-3 hrs' },
      { id: 'c9s4', title: 'Ant Control', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop', rating: 4.5, reviews: 5.8, price: 599, duration: '1-2 hrs' },
    ],
  },

  // ── Massage (c10) — Gender-based ──────────────────────────────────────────
  {
    id: 'c10',
    name: 'Massage',
    icon: 'massage',
    services: [
      { id: 'c10s1', title: 'Full Body Massage', image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=600&auto=format&fit=crop', rating: 4.9, reviews: 14.6, price: 1299, duration: '1 hr', gender: 'female' },
      { id: 'c10s2', title: 'Head & Shoulder Massage', image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=600&auto=format&fit=crop', rating: 4.8, reviews: 9.3, price: 699, duration: '45 mins', gender: 'female' },
      { id: 'c10s3', title: 'Deep Tissue Massage', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=600&auto=format&fit=crop', rating: 4.8, reviews: 12.1, price: 1499, duration: '1 hr', gender: 'male' },
      { id: 'c10s4', title: 'Swedish Massage', image: 'https://images.unsplash.com/photo-1598901847919-b0b2fee2bc7c?q=80&w=600&auto=format&fit=crop', rating: 4.7, reviews: 8.4, price: 999, duration: '1 hr', gender: 'male' },
    ],
  },

  // ── Workforce (c12) ───────────────────────────────────────────────────────
  {
    id: 'c12',
    name: 'Workforce',
    icon: 'workforce',
    services: [
      { id: 'c12s1', title: 'Daily Labour', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop', rating: 4.5, reviews: 8.2, price: 699, duration: 'Per day' },
      { id: 'c12s2', title: 'Construction Workers', image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600&auto=format&fit=crop', rating: 4.6, reviews: 5.4, price: 999, duration: 'Per day' },
      { id: 'c12s3', title: 'Helpers', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=600&auto=format&fit=crop', rating: 4.4, reviews: 11.3, price: 499, duration: 'Per day' },
    ],
  },

  // ── Gardening / Security (c13) — as per client data ───────────────────────
  {
    id: 'c13',
    name: 'Gardening',
    icon: 'gardening',
    services: [
      { id: 'c13s1', title: 'Security Guards', image: 'https://images.unsplash.com/photo-1517022812141-23620debb3b7?q=80&w=600&auto=format&fit=crop', rating: 4.6, reviews: 7.2, price: 1299, duration: 'Per day' },
      { id: 'c13s2', title: 'CCTV Installation', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=600&auto=format&fit=crop', rating: 4.7, reviews: 5.8, price: 2499, duration: '3-5 hrs' },
      { id: 'c13s3', title: 'Fire Safety Service', image: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?q=80&w=600&auto=format&fit=crop', rating: 4.5, reviews: 3.4, price: 1999, duration: '2-3 hrs' },
    ],
  },

  // ── Pet Care (c14) ────────────────────────────────────────────────────────
  {
    id: 'c14',
    name: 'Pet Care',
    icon: 'petcare',
    services: [
      { id: 'c14s1', title: 'Pet Grooming', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=600&auto=format&fit=crop', rating: 4.8, reviews: 11.6, price: 799, duration: '1.5 hrs' },
      { id: 'c14s2', title: 'Pet Training', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=600&auto=format&fit=crop', rating: 4.7, reviews: 6.3, price: 999, duration: '1 hr/session' },
      { id: 'c14s3', title: 'Pet Boarding', image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=600&auto=format&fit=crop', rating: 4.6, reviews: 4.8, price: 599, duration: 'Per day' },
    ],
  },

  // ── Packers (c15) ─────────────────────────────────────────────────────────
  {
    id: 'c15',
    name: 'Packers',
    icon: 'packers',
    services: [
      { id: 'c15s1', title: 'House Shifting', image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?q=80&w=600&auto=format&fit=crop', rating: 4.8, reviews: 22.4, price: 4999, duration: '1 day' },
      { id: 'c15s2', title: 'Office Shifting', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=600&auto=format&fit=crop', rating: 4.7, reviews: 15.1, price: 8999, duration: '1-2 days' },
      { id: 'c15s3', title: 'Movers & Packers', image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=600&auto=format&fit=crop', rating: 4.8, reviews: 35.3, price: 2999, duration: '4-6 hrs' },
      { id: 'c15s4', title: 'Goods Transport', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop', rating: 4.6, reviews: 14.2, price: 1999, duration: 'Custom' },
    ],
  },
];

export const ALL_SERVICES = CATEGORIES.flatMap(c => c.services);

export const TRENDING_SERVICES: MinimalService[] = [
  ALL_SERVICES[0], // Deep Clean
  ALL_SERVICES[3], // Salon Prime
  ALL_SERVICES[5], // AC Service
];

export const MOST_BOOKED_SERVICES: MinimalService[] = [
  ALL_SERVICES[4], // Men's Haircut
  ALL_SERVICES[2], // Bathroom Deep Clean
  ALL_SERVICES[6], // Washing Machine
];

export const RECOMMENDED_SERVICES: MinimalService[] = [
  ALL_SERVICES[5], // AC Service
  ALL_SERVICES[0], // Deep Clean
  ALL_SERVICES[1], // Sofa Clean
  ALL_SERVICES[3], // Salon Prime
];

export const OFFERS = [
  { id: 'o1', title: 'Flat 50% Off on AC Service', subtitle: 'Use code: AC50', image: 'https://images.unsplash.com/photo-1518081461904-9d8f136351c2?q=80&w=600&auto=format&fit=crop' },
  { id: 'o2', title: 'Free Deep Cleaning Add-on', subtitle: 'With any Premium Salon Package', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop' },
  { id: 'o3', title: 'Winter Hair Spa', subtitle: 'Get glowing hair at 20% off', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop' },
];

export const PAST_BOOKINGS: Booking[] = [
  { id: 'b1', serviceId: 's1', title: 'Full Home Deep Cleaning', date: '12 Oct, 2025', status: 'Completed', price: 3499 },
  { id: 'b2', serviceId: 's6', title: 'AC Service & Repair', date: '05 Sep, 2025', status: 'Completed', price: 499 },
];

export const SAVED_ADDRESSES: Address[] = [
  { id: 'a1', type: 'Home', details: 'A-421, Shunya Apartments, Sector 12, Azamgarh, UP - 276001' },
  { id: 'a2', type: 'Work', details: 'Tower C, 4th Floor, Tech Hub, Gorakhpur Road, UP - 276002' }
];

export const REVIEWS = [
  { id: 'r1', user: 'Amit K.', rating: 5, date: '1 week ago', text: 'Very professional behavior and thorough cleaning.' },
  { id: 'r2', user: 'Priya S.', rating: 4, date: '2 weeks ago', text: 'Good service, but arrived 10 minutes late.' },
];

export const FAQS = [
  { id: 'f1', question: 'Do I need to provide any equipment?', answer: 'No, our professionals carry all necessary industry-grade equipment and chemicals.' },
  { id: 'f2', question: 'Are the cleaning chemicals safe for pets?', answer: 'Yes, we use strictly eco-friendly and pet-safe products.' },
  { id: 'f3', question: 'What is the cancellation policy?', answer: 'You can cancel for free up to 4 hours before the service time. Late cancellations incur a 10% fee.' },
];

export const PRODUCTS = [
  { 
    id: 'p1', 
    title: 'Professional Cleaning Kit', 
    price: 1299, 
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800', 
    category: 'Cleaning',
    description: 'Complete set of 12 industrial-grade cleaners and microfiber cloths.'
  },
  { 
    id: 'p2', 
    title: 'Premium Hair Wax', 
    price: 499, 
    image: 'https://images.unsplash.com/photo-1590159703338-748958737f2a?w=800', 
    category: "Men's Grooming",
    description: 'Strong hold, matte finish wax for professional styling.'
  },
  { 
    id: 'p3', 
    title: 'Eco-friendly Paint 5L', 
    price: 2499, 
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800', 
    category: 'Home Painting',
    description: 'Non-toxic, low VOC paint with anti-fungal properties.'
  },
  { 
    id: 'p4', 
    title: 'Smart LED Bulb Pack', 
    price: 899, 
    image: 'https://images.unsplash.com/photo-1550985543-f47f38aeee65?w=800', 
    category: 'Electrical',
    description: 'Pack of 3 Wi-Fi enabled RGB bulbs with voice control.'
  },
  { 
    id: 'p_atta_ash', 
    title: 'Aashirvaad Atta 5kg', 
    price: 275, 
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', 
    category: 'Grains',
    subcategory: 'Atta',
    description: 'Aashirvaad Superior MP Atta.'
  },
  { 
    id: 'p_rice_bas', 
    title: 'India Gate Basmati Rice 1kg', 
    price: 145, 
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800', 
    category: 'Grains',
    subcategory: 'Rice',
    description: 'India Gate Basmati Rice Premium.'
  },
  { 
    id: 'p_dal_arhar', 
    title: 'Arhar Dal (Toor) 1kg', 
    price: 160, 
    image: 'https://images.unsplash.com/photo-1585914924626-45adac9e6b42?w=800', 
    category: 'Pulses',
    subcategory: 'Arhar Dal',
    description: 'Unpolished premium Arhar Dal.'
  },
  { 
    id: 'p_mustard_oil', 
    title: 'Fortune Mustard Oil 1L', 
    price: 175, 
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800', 
    category: 'Oil & Ghee',
    subcategory: 'Mustard Oil',
    description: 'Fortune Kacchi Ghani Mustard Oil.'
  },
  { 
    id: 'p_tea_red', 
    title: 'Red Label Tea 500g', 
    price: 310, 
    image: 'https://images.unsplash.com/photo-1594631252845-29fc458681b7?w=800', 
    category: 'Beverages',
    subcategory: 'Tea',
    description: 'Brooke Bond Red Label Strong Tea.'
  },
  { 
    id: 'p_milk_amul', 
    title: 'Amul Taaza 1L', 
    price: 66, 
    image: 'https://images.unsplash.com/photo-1550583724-1255818c0533?w=800', 
    category: 'Dairy',
    subcategory: 'Milk',
    description: 'Amul Taaza Toned Milk.'
  },
  { 
    id: 'p_surf_excel', 
    title: 'Surf Excel Matic 1kg', 
    price: 240, 
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800', 
    category: 'Cleaning & Household',
    subcategory: 'Detergent',
    description: 'Surf Excel Matic Front Load Detergent.'
  },
  { 
    id: 'p_colgate', 
    title: 'Colgate Strong Teeth 200g', 
    price: 110, 
    image: 'https://images.unsplash.com/photo-1559591937-e43542385153?w=800', 
    category: 'Personal Care',
    subcategory: 'Toothpaste',
    description: 'Colgate Strong Teeth Anticavity Toothpaste.'
  },
  { 
    id: 'p_bread_harvest', 
    title: 'Harvest Gold White Bread', 
    price: 45, 
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', 
    category: 'Bakery',
    subcategory: 'Breads',
    description: 'Fresh White Bread Harvest Gold.'
  },
  { 
    id: 'p_banana', 
    title: 'Banana (Dozen)', 
    price: 60, 
    image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=800', 
    category: 'Fruits',
    subcategory: 'Fresh Fruits',
    description: 'Fresh ripe bananas.'
  },
  { 
    id: 'p_potato', 
    title: 'Potato 1kg', 
    price: 30, 
    image: 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?w=800', 
    category: 'Vegetables',
    subcategory: 'Fresh Vegetables',
    description: 'Fresh organic potatoes.'
  },
  { 
    id: 'p_men_tshirt', 
    title: 'Men\'s Cotton T-Shirt', 
    price: 599, 
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800', 
    category: 'Fashion',
    subcategory: 'Men\'s Wear',
    description: '100% Cotton, regular fit t-shirt.'
  },
  { 
    id: 'p_iphone_15', 
    title: 'iPhone 15 Pro 128GB', 
    price: 119900, 
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800', 
    category: 'Electronic',
    subcategory: 'Mobile Phones',
    description: 'Titanium design, A17 Pro chip, 48MP Main camera.'
  },
  { 
    id: 'p_mixer_grinder', 
    title: 'Prestige Mixer Grinder', 
    price: 3499, 
    image: 'https://images.unsplash.com/photo-1585676801854-bd701bd6426f?w=800', 
    category: 'Home & Kitchen',
    subcategory: 'Kitchen Appliances',
    description: '750W motor, 3 stainless steel jars.'
  },
  { 
    id: 'p_lipstick_mac', 
    title: 'MAC Matte Lipstick', 
    price: 1850, 
    image: 'https://images.unsplash.com/photo-1586776977607-310e9c725c37?w=800', 
    category: 'Beauty',
    subcategory: 'Makeup Products',
    description: 'Iconic matte finish, long-wearing lipstick.'
  },
  { 
    id: 'p_dumbbells_5kg', 
    title: 'PVC Dumbbells 5kg x 2', 
    price: 899, 
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800', 
    category: 'Sports',
    subcategory: 'Gym Equipment',
    description: 'Set of 2 PVC dumbbells for home workout.'
  },
  { 
    id: 'p_car_perfume', 
    title: 'Godrej Aer Twist Car Perfume', 
    price: 349, 
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', 
    category: 'Automobile',
    subcategory: 'Car Accessories',
    description: 'Long-lasting gel car air freshener.'
  },
  { 
    id: 'p_pedigree_1kg', 
    title: 'Pedigree Adult Dog Food 1kg', 
    price: 320, 
    image: 'https://images.unsplash.com/photo-1589924691106-073b19f5538d?w=800', 
    category: 'Pet Care',
    subcategory: 'Pet Food',
    description: 'Complete and balanced food for adult dogs.'
  },
  { 
    id: 'p_drill_machine', 
    title: 'Bosch GSB 500W Drill', 
    price: 2499, 
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800', 
    category: 'Hardware & Tools',
    subcategory: 'Electrical',
    description: 'Powerful impact drill for masonry and wood.'
  },
];

export const GROCERY_CATEGORIES = [
  { 
    id: 'g_grains', 
    name: 'Grains', 
    icon: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Atta', 'Rice', 'Suji', 'Poha']
  },
  { 
    id: 'g_pulses', 
    name: 'Pulses', 
    icon: 'https://images.unsplash.com/photo-1585914924626-45adac9e6b42?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Arhar Dal', 'Moong Dal', 'Masoor Dal', 'Chana Dal', 'Rajma', 'Chole']
  },
  { 
    id: 'g_oil', 
    name: 'Oil & Ghee', 
    icon: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Mustard Oil', 'Refined Oil', 'Desi Ghee', 'Vanaspati']
  },
  { 
    id: 'g_spices', 
    name: 'Spices', 
    icon: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Whole Spices', 'Powder Masala', 'Garam Masala', 'Kitchen Masala Mix']
  },
  { 
    id: 'g_snacks', 
    name: 'Snacks', 
    icon: 'https://images.unsplash.com/photo-1599490659213-e2b9527bb087?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Biscuit', 'Namkeen', 'Chips']
  },
  { 
    id: 'g_beverages', 
    name: 'Beverages', 
    icon: 'https://images.unsplash.com/photo-1544787210-2211d430c72d?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Tea', 'Coffee', 'Soft Drinks', 'Juices']
  },
  { 
    id: 'g_dairy', 
    name: 'Dairy', 
    icon: 'https://images.unsplash.com/photo-1550583724-1255818c0533?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Milk', 'Curd', 'Butter', 'Paneer', 'Cheese']
  },
  { 
    id: 'g_sweets', 
    name: 'Sweets & Chocolates', 
    icon: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Chocolates', 'Candies', 'Mithai']
  },
  { 
    id: 'g_cleaning', 
    name: 'Cleaning & Household', 
    icon: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Detergent', 'Dishwash', 'Floor Cleaner', 'Toilet Cleaner']
  },
  { 
    id: 'g_personal', 
    name: 'Personal Care', 
    icon: 'https://images.unsplash.com/photo-1559591937-e43542385153?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Soap', 'Shampoo', 'Toothpaste', 'Hair Oil']
  },
  { 
    id: 'g_condiments', 
    name: 'Condiments', 
    icon: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Pickles', 'Sauces & Ketchup', 'Jams & Spreads']
  },
  { 
    id: 'g_fruits', 
    name: 'Fruits', 
    icon: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Fresh Fruits']
  },
  { 
    id: 'g_vegetables', 
    name: 'Vegetables', 
    icon: 'https://images.unsplash.com/photo-1716558836636-cf1a81f798ca?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    subcategories: ['Fresh Vegetables']
  },
  { 
    id: 'g_bakery', 
    name: 'Bakery', 
    icon: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Breads', 'Cakes', 'Buns', 'Cookies']
  },
];

export const SHOP_CATEGORIES = [
  { 
    id: 's_fashion', 
    name: 'Fashion', 
    icon: 'https://images.unsplash.com/photo-1777628530456-bb93d3a03faf?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    subcategories: ['Men\'s Wear', 'Women\'s Wear', 'Kids Wear', 'Footwear', 'Bags & Accessories', 'Jewellery']
  },
  { 
    id: 's_electronics', 
    name: 'Electronic', 
    icon: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Mobile Phones', 'Laptop & Computers', 'Accessories', 'Charger', 'Earphones', 'Home Entertainment', 'TV', 'Speaker', 'Smart Gadgets']
  },
  { 
    id: 's_home', 
    name: 'Home & Kitchen', 
    icon: 'https://images.unsplash.com/photo-1556911220-e150223eaa77?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Kitchen Appliances', 'Cookware & Utensils', 'Home Decor', 'Furniture', 'Storage & Organizer']
  },
  { 
    id: 's_beauty', 
    name: 'Beauty', 
    icon: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Makeup Products', 'Skincare', 'Hair Care', 'Salon Products', 'Grooming Kits']
  },
  { 
    id: 's_kids', 
    name: 'Kids', 
    icon: 'https://images.unsplash.com/photo-1513159419869-1134277df677?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Toys & Games', 'Baby Care', 'School Supplies', 'Clothing']
  },
  { 
    id: 's_sports', 
    name: 'Sports', 
    icon: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Gym Equipment', 'Yoga Accessories', 'Sports Items']
  },
  { 
    id: 's_automobile', 
    name: 'Automobile', 
    icon: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Car Accessories', 'Bike Accessories', 'Spare Parts']
  },
  { 
    id: 's_stationery', 
    name: 'Stationery', 
    icon: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Books', 'Notebooks', 'Office Supplies', 'Printer Accessories']
  },
  { 
    id: 's_pet', 
    name: 'Pet Care', 
    icon: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Pet Food', 'Accessories', 'Grooming Products']
  },
  { 
    id: 's_hardware', 
    name: 'Hardware & Tools', 
    icon: 'https://images.unsplash.com/photo-1581147036324-c17da42e16c2?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Electrical', 'Plumbing', 'Construction']
  },
];

export const KABADI_ITEMS = [
  { 
    id: 'k1', 
    title: 'Paper Scrap', 
    icon: 'https://images.unsplash.com/photo-1764116858740-832d0f86b86b?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    subcategories: [
      { id: 'k1s1', title: 'Newspaper (Raddi)', price: 14 },
      { id: 'k1s2', title: 'Books & Copies', price: 12 },
      { id: 'k1s3', title: 'Office Paper', price: 15 },
      { id: 'k1s4', title: 'Carton / Cardboard', price: 10 },
    ]
  },
  { 
    id: 'k2', 
    title: 'Plastic Scrap', 
    icon: 'https://images.unsplash.com/photo-1764116858740-832d0f86b86b?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    subcategories: [
      { id: 'k2s1', title: 'Plastic Bottles', price: 15 },
      { id: 'k2s2', title: 'Hard Plastic', price: 18 },
      { id: 'k2s3', title: 'Soft Plastic', price: 12 },
      { id: 'k2s4', title: 'Plastic Container', price: 14 },
    ]
  },
  { 
    id: 'k3', 
    title: 'Metal Scrap', 
    icon: 'https://images.unsplash.com/photo-1764116858740-832d0f86b86b?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    subcategories: [
      { id: 'k3s1', title: 'Heavy Iron', price: 32 },
      { id: 'k3s2', title: 'Light Iron', price: 28 },
      { id: 'k3s3', title: 'Steel Items', price: 40 },
      { id: 'k3s4', title: 'Copper', price: 450 },
      { id: 'k3s5', title: 'Aluminium', price: 120 },
      { id: 'k3s6', title: 'Brass (Peetal)', price: 320 },
      { id: 'k3s7', title: 'Copper (Tamba)', price: 450 },
    ]
  },
  { 
    id: 'k4', 
    title: 'E-Waste', 
    icon: 'https://images.unsplash.com/photo-1764116858740-832d0f86b86b?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    subcategories: [
      { id: 'k4s1', title: 'Old TV / LED', price: 500 },
      { id: 'k4s2', title: 'Computer / Laptop', price: 800 },
      { id: 'k4s3', title: 'Fridge / AC', price: 1500 },
      { id: 'k4s4', title: 'Washing Machine', price: 1000 },
      { id: 'k4s5', title: 'Mobile Phones', price: 150 },
    ]
  },
  { 
    id: 'k5', 
    title: 'Automobile Scrap', 
    icon: 'https://images.unsplash.com/photo-1764116858740-832d0f86b86b?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    subcategories: [
      { id: 'k5s1', title: 'Old Car', price: 15000 },
      { id: 'k5s2', title: 'Bike Scrap', price: 3500 },
      { id: 'k5s3', title: 'Car Parts', price: 100 },
    ]
  },
  { 
    id: 'k6', 
    title: 'Household Scrap', 
    icon: 'https://images.unsplash.com/photo-1764116858740-832d0f86b86b?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    subcategories: [
      { id: 'k6s1', title: 'Mixed Kabadi', price: 18 },
      { id: 'k6s2', title: 'Old Furniture', price: 50 },
      { id: 'k6s3', title: 'Broken Items', price: 15 },
    ]
  },
  { 
    id: 'k7', 
    title: 'Industrial Scrap', 
    icon: 'https://images.unsplash.com/photo-1764116858740-832d0f86b86b?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    subcategories: [
      { id: 'k7s1', title: 'Factory Scrap', price: 45 },
      { id: 'k7s2', title: 'Construction Scrap', price: 38 },
      { id: 'k7s3', title: 'Sariya', price: 42 },
      { id: 'k7s4', title: 'Pipe', price: 35 },
    ]
  },
  { 
    id: 'k8', 
    title: 'Battery Scrap', 
    icon: 'https://images.unsplash.com/photo-1764116858740-832d0f86b86b?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    subcategories: [
      { id: 'k8s1', title: 'Inverter Battery', price: 800 },
      { id: 'k8s2', title: 'Car Battery', price: 600 },
      { id: 'k8s3', title: 'UPS Battery', price: 200 },
    ]
  },
  { 
    id: 'k9', 
    title: 'Glass Scrap', 
    icon: 'https://images.unsplash.com/photo-1764116858740-832d0f86b86b?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    subcategories: [
      { id: 'k9s1', title: 'Glass Bottles', price: 5 },
      { id: 'k9s2', title: 'Window Glass', price: 8 },
      { id: 'k9s3', title: 'Normal Glass', price: 4 },
    ]
  },
  { 
    id: 'k10', 
    title: 'Textile Scrap', 
    icon: 'https://images.unsplash.com/photo-1764116858740-832d0f86b86b?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    subcategories: [
      { id: 'k10s1', title: 'Old Clothes', price: 15 },
      { id: 'k10s2', title: 'Fabric Waste', price: 12 },
    ]
  },
];
