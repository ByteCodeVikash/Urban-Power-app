import { Image } from 'react-native';

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
}export const beautyCategories: BeautyCategory[] = [
  {
    name: 'Facial & Skincare',
    subcategories: [
      { name: 'Cleanup', price: 249 },
      { name: 'Fruit Facial', price: 499 },
      { name: 'Gold Facial', price: 799 },
      { name: 'Diamond Facial', price: 999 },
      { name: 'Hydra Facial', price: 1999 },
      { name: 'Anti-Aging Facial', price: 1499 },
      { name: 'Detan Facial', price: 799 },
      { name: 'Acene Treatment', price: 1499 },
      { name: 'Skin Polishing', price: 1499 },
    ],
  },
  {
    name: 'Waxing',
    subcategories: [
      { name: 'Rice Wax', price: 999 },
      { name: 'Chocolate Wax', price: 350 },
      { name: 'Honey Wax', price: 349 },
      { name: 'Full Body Wax', price: 1499 },
      { name: 'Bikini Wax', price: 1499 },
      { name: 'Roll On Wax', price: 250 },
    ],
  },
  {
    name: 'Hand & Feet Care',
    subcategories: [
      { name: 'Manicure', price: 399 },
      { name: 'Pedicure', price: 499 },
      { name: 'Spa Pedicure', price: 799 },
      { name: 'Spa Manicure', price: 699 },
    ],
  },
  {
    name: 'Hair Services',
    subcategories: [
      { name: 'Hair Cut', price: 199 },
      { name: 'Hair Spa', price: 799 },
      { name: 'Hair Smoothing', price: 2999 },
      { name: 'Hair Treatment', price: 1499 },
      { name: 'Rebonding', price: 3499 },
      { name: 'Hair Color', price: 999 },
      { name: 'Global Hair Color', price: 2499 },
      { name: 'Highlights', price: 1999 },
      { name: 'Hair Straight', price: 2999 },
      { name: 'Hair Styling', price: 499 },
    ],
  },
  {
    name: 'Makeup Categories',
    subcategories: [
      { name: 'HD Bridal Makeup', price: 15999 },
      { name: 'Airbrush Bridal Makeup', price: 21999 },
      { name: 'Luxury Bridal Makeup', price: 17999 },
      { name: 'Signature Bridal Makeup', price: 12999 },
      { name: 'Royal Bridal Package', price: 21000 },
      { name: 'Engagement Makeup', price: 7999 },
      { name: 'Cocktail Party Makeup', price: 3999 },
      { name: 'Reception Makeup', price: 3999 },
      { name: 'Haldi Makeup', price: 3499 },
      { name: 'Mehndi Makeup', price: 2499 },
    ],
  },
  {
    name: 'Eye And Beauty Services',
    subcategories: [
      { name: 'Eyebrow', price: 30 },
      { name: 'Upper Lips', price: 40 },
      { name: 'Eyelash Extension', price: 1999 },
      { name: 'Lash Lifting', price: 1299 },
    ],
  },
  {
    name: 'Home Beauty Services',
    subcategories: [
      { name: 'Home Beauty Service', price: 999 },
      { name: 'Home Bridal Service', price: 4999 },
      { name: 'Home Facial Service', price: 1499 },
    ],
  },
  {
    name: 'Beauty Academy Categories',
    subcategories: [
      { name: 'Basic Beautician Course', price: 9999 },
      { name: 'Advance Makeup Course', price: 19999 },
      { name: 'Hair Course', price: 14999 },
      { name: 'Nail Art Course', price: 9999 },
      { name: 'Skin Course', price: 14999 },
      { name: 'Bridal Course', price: 14999 },
      { name: 'Salon Management Training', price: 14999 },
    ],
  },
  {
    name: 'Premium Categories',
    subcategories: [
      { name: 'Luxury Beauty Services', price: 4999 },
      { name: 'Bridal And Glam Studio', price: 8999 },
      { name: 'Professional Salon Service', price: 6499 },
      { name: 'Beauty And Wellness Care', price: 4999 },
      { name: 'Complete Makeover Solution', price: 14999 },
      { name: 'Home Salon Expert', price: 14999 },
    ],
  },
  {
    name: 'Party Makeup',
    subcategories: [
      { name: 'Party Glam Makeup', price: 2499 },
      { name: 'Soft Glam Makeup', price: 3499 },
      { name: 'Nude Makeup', price: 4999 },
      { name: 'Shimmer Makeup', price: 1999 },
      { name: 'Smokey Eyes Makeup', price: 2499 },
      { name: 'Minimal Makeup', price: 1499 },
      { name: 'Western Party Look', price: 1999 },
      { name: 'Traditional Makeup', price: 2999 },
    ],
  },
  {
    name: 'Nail Art',
    subcategories: [
      { name: 'Gel Polish', price: 1199 },
      { name: ' Name Extension', price: 1999 },
      { name: 'Nail Art Design', price: 299 },
    ],
  },
];

const beautySubcategoriesByName = Object.fromEntries(
  beautyCategories.map(c => [c.name, c.subcategories]),
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
        id: 's1a',
        title: 'Home Deep Cleaning',
        image: 'http://www.cleanmyplace.in/assets/img/services/1.jpg',
        rating: 4.8,
        reviews: 12.4,
        price: 3499,
        duration: '4-5 hrs',
      },
      {
        id: 's1b',
        title: 'Sofa Cleaning',
        image:
          'https://hometriangle.com/blogs/content/images/2023/12/Sofa-Cleaning---hometriangle-blog.jpg',
        rating: 4.6,
        reviews: 5.2,
        price: 599,
        duration: '1 hr',
      },
      {
        id: 's1c',
        title: 'Carpet Cleaning',
        image:
          'https://365cleaners.com.au/wp-content/uploads/2020/07/carpet-cleaning-1.jpg',
        rating: 4.5,
        reviews: 8.1,
        price: 799,
        duration: '2 hrs',
      },
      {
        id: 's1d',
        title: 'Bathroom Cleaning',
        image:
          'https://www.vip-cleaning-london.com/wp-content/uploads/2016/02/17-commercial-washroom-cleaners.jpg',
        rating: 4.7,
        reviews: 18.1,
        price: 499,
        duration: '45 mins',
      },
      {
        id: 's1e',
        title: 'Kitchen Cleaning',
        image:
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=600&auto=format&fit=crop',
        rating: 4.7,
        reviews: 9.4,
        price: 699,
        duration: '1.5 hrs',
      },
      {
        id: 's1f',
        title: 'Office Cleaning',
        image:
          'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop',
        rating: 4.6,
        reviews: 7.8,
        price: 2499,
        duration: '3-4 hrs',
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
        image:
          'https://images.openai.com/static-rsc-4/RuCWFJOqPAdlKNwCiyt5WgUOafWka9DbDktSMlyST_SUdDF_yUQiHaEmKhh5XDasK3wMsrIGZ3TVGE30qQaGWKz2ZXvCe1RnXhsTVeWY-rA_C6efL6ApWoiq5yAmjFDwPd2LqDZdDrMPuGgi0NtAnGzbMQFP4vvYt9fPTmftu7lfIvB2b_h69RRoCqkUNVBb?purpose=inline',
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
        image:
          'https://images.openai.com/static-rsc-4/VLWNi3FmxEU2zxNOFdlMPAzH641cFE7pg65vQGItCfaXavu4LjeyiruWijG55lqZHHirJwYNWMiwbJzcNCb010tgSfBQMQC6Mqh-ljCap7wGOmTzdrTwWTBR_glZeRsBqVyI1fOFu9X_8shw0W3pcAGz91pSQ_WBHUfzn9e_nz0x6tCzHakeGDr5ePC5qNXJ?purpose=inline',
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
        image:
          'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=600&auto=format&fit=crop',
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
        image:
          'https://images.openai.com/static-rsc-4/XNW-ldD5how3BqAzq8p9VGV4PErxol6zG8B2lzdl6fmhNCWB9ttw8bnj4EhY4McJUtlwtmnTUxm2kE4rrF0XRwQccZB9TQceZd4fQ23DTe7zSPsvCbA9ssLMzpOTUQdsFsmw3HLtmvI7UKXs4CQG9Gr1AqmyOqAqCkUds2xt_12WHOpq2engsZSHl2fQh0az?purpose=inline',
        rating: 4.9,
        reviews: 12.7,
        price: 4999,
        duration: '4-5 hrs',
        gender: 'female',
      },
      {
        id: 's2i',
        title: 'Hair Services',
        image:
          'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop',
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
        image:
          'https://images.openai.com/static-rsc-4/27hFKxwmKIlVE5vwVIqN2V0-z8ihwdflKWXDwiq0IU0sVkvQ4ZrSWCPNed76-COiUQHT5IR_4zasZFSpUurDDDWoKuxdjR81Znv--RviX-tvtVBDSWZJHlsNewNqQpkshx3JuF8SmdrA7TZ2Gt49F24Ijwr_kFMI6Z-IW-6ruFw?purpose=inline',
        rating: 4.9,
        reviews: 12.7,
        price: 4999,
        duration: '4-5 hrs',
        gender: 'female',
      },
      {
        id: 's2e',
        title: 'Makeup Categories',
        image:
          'https://images.openai.com/static-rsc-4/RZndDD0CPfX1vRGFgSzMdg1Lf7pdqGXpcbCRAAlNvB4deDXenHEhijcWwpZpFXAEISPzd1QNRGepq9vhKHgSbZHeDzEh8jGq2em2boSRROBq2Qgjt5oWP57-jFmYJxX_F8lcAzt6N0ivTNVYXgmnDu1fenPyHSe-mff5ZeWu9RADLzOjhqBsGeHiSlwTAFpV?purpose=inline',
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
        image:
          'https://images.openai.com/static-rsc-4/mTPM-Zy7vcLOwOKZejkqurF1sdEGPXBbEo450bzxbpDgDc3b4oaj2sXoGF586TDRiiT-BKeQUcWk1d19zVsYVSBtt32gNoOFgUB0NK9K1q3MBsvVVoN7z6HWDByMEO7grw5-ocLV8M2_xblkDL2ODy3A5zWx3KNSIgy3LTKPwtzQXj-vfnJz6hbranzMFMw5?purpose=inline',
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
        image:
          'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=600&auto=format&fit=crop',
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
        image:
          'https://images.unsplash.com/photo-1583241800698-e8ab01830a07?q=80&w=600&auto=format&fit=crop',
        rating: 4.9,
        reviews: 12.7,
        price: 999,
        duration: '1hrs',
        gender: 'female',
        subcategories: beautySubcategoriesByName['Eye And Beauty Services'],
      },
      {
        id: 's2m',
        title: 'Premium Categories',
        image:
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop',
        rating: 4.9,
        reviews: 12.7,
        price: 2999,
        duration: '1hrs',
        gender: 'female',
        subcategories: beautySubcategoriesByName['Premium Categories'],
      },
      // Male
      {
        id: 's2n',
        title: 'Home Salon Service',
        image:
          'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600&auto=format&fit=crop',
        rating: 4.7,
        reviews: 14.5,
        price: 599,
        duration: '1 hr',
        gender: 'male',
      },
    ],
  },
  // ── Maintenance (c3) ──────────────────────────────────────────────────────
  {
    id: 'c3',
    name: 'Maintenance',
    icon: 'wrench',
    services: [
      {
        id: 'c3s1',
        title: 'Electrician',
        image:
          'https://www.welltreated.co.uk/wp-content/uploads/2025/10/commercial-electrician-works-service.jpeg',
        rating: 4.8,
        reviews: 25.4,
        price: 199,
        duration: '1 hr',
      },
      {
        id: 'c3s2',
        title: 'Carpenter',
        image:
          'https://carpenterabudhabi.ae/wp-content/uploads/2024/01/Commercial-Carpentry-Service-Abu-Dhabi.jpg',
        rating: 4.7,
        reviews: 18.2,
        price: 249,
        duration: '1 hr',
      },
      {
        id: 'c3s3',
        title: 'AC Repair & Service',
        image:
          'https://i5.walmartimages.com/asr/12fd7efd-b367-42f7-ba1f-39d20f2902c7_1.fa1233d81728cfbebc76de166aff6cc8.jpeg',
        rating: 4.9,
        reviews: 44.2,
        price: 499,
        duration: '45 mins',
      },
      {
        id: 'c3s4',
        title: 'RO / Water Purifier Service',
        image:
          'https://roservice.org.in/wp-content/uploads/2025/02/RO-Water-Purifier-Repair.jpg',
        rating: 4.6,
        reviews: 12.1,
        price: 299,
        duration: '1 hr',
      },
      {
        id: 'c3s5',
        title: 'Plumber',
        image:
          'https://wallpapers.com/images/hd/service-plumber-plumbing-system-maintenance-x0tn63qvfcup31a7.jpg',
        rating: 4.8,
        reviews: 21.3,
        price: 249,
        duration: '1 hr',
      },
    ],
  },

  // ── Repair (c4) ───────────────────────────────────────────────────────────
  {
    id: 'c4',
    name: 'Repair',
    icon: 'wrench',
    services: [
      {
        id: 'c4s1',
        title: 'Mobile Repair',
        image:
          'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=600&auto=format&fit=crop',
        rating: 4.7,
        reviews: 15.3,
        price: 199,
        duration: '30-60 mins',
      },
      {
        id: 'c4s2',
        title: 'Laptop Repair',
        image:
          'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?q=80&w=600&auto=format&fit=crop',
        rating: 4.6,
        reviews: 8.4,
        price: 499,
        duration: '1-3 hrs',
      },
      {
        id: 'c4s3',
        title: 'TV Repair',
        image:
          'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=600&auto=format&fit=crop',
        rating: 4.5,
        reviews: 6.2,
        price: 399,
        duration: '1-2 hrs',
      },
      {
        id: 'c4s4',
        title: 'Appliance Repair',
        image:
          'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=600&auto=format&fit=crop',
        rating: 4.6,
        reviews: 11.1,
        price: 299,
        duration: '1-2 hrs',
      },
    ],
  },

  // ── Auto Service (c5) ─────────────────────────────────────────────────────
  {
    id: 'c5',
    name: 'Auto Service',
    icon: 'autoservice',
    services: [
      {
        id: 'c5s1',
        title: 'Car Repair',
        image:
          'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=600&auto=format&fit=crop',
        rating: 4.7,
        reviews: 9.8,
        price: 799,
        duration: '2-4 hrs',
      },
      {
        id: 'c5s2',
        title: 'Bike Repair',
        image:
          'https://images.unsplash.com/photo-1673870861514-8c72efb696f3?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        rating: 4.6,
        reviews: 12.1,
        price: 299,
        duration: '1-2 hrs',
      },
      {
        id: 'c5s3',
        title: 'Car Wash',
        image:
          'https://i5.walmartimages.com/asr/00ffec30-8b87-475b-b899-a2a0859233eb.b03cc0c3359acebafc34678c5101be99.jpeg',
        rating: 4.8,
        reviews: 20.4,
        price: 399,
        duration: '45 mins',
      },
      {
        id: 'c5s4',
        title: 'Denting & Painting',
        image:
          'https://zicaauto.com/wp-content/uploads/2023/06/car-denting-painting.png',
        rating: 4.5,
        reviews: 4.7,
        price: 1999,
        duration: '1-2 days',
      },
    ],
  },

  // ── Learning (c6) ─────────────────────────────────────────────────────────
  {
    id: 'c6',
    name: 'Learning',
    icon: 'learning',
    services: [
      {
        id: 'c6s1',
        title: 'Home Tuition',
        image:
          'https://images.openai.com/static-rsc-4/lnlQGTxAAwvWMBpvM6tF8tKvIfDUkd2gAoNGaCpEV5lxuqceL-OECT9jq7MTCc3kFYEudq7ivrvT0aC4pWlrNgYMYYt1PMB8MvlftDwDY-vhXy7VVZvGRn2mqNQfdEltDeT7lng9rr5AmV9d6Rb-WQ79nP6FknUtJMeDCGD5ny4?purpose=inline',
        rating: 4.8,
        reviews: 6.4,
        price: 499,
        duration: '1 hr/session',
      },
      {
        id: 'c6s2',
        title: 'Online Classes',
        image:
          'https://penntoday.upenn.edu/sites/default/files/2021-06/covid-education-teaser-social.jpg',
        rating: 4.7,
        reviews: 11.2,
        price: 299,
        duration: '1 hr/session',
      },
      {
        id: 'c6s3',
        title: 'Skill Courses',
        image:
          'https://open.ecdl.com.bd/wp-content/uploads/2023/07/skill-development-banner-illustration-600x376.png',
        rating: 4.6,
        reviews: 5.3,
        price: 1499,
        duration: '10 sessions',
      },
      {
        id: 'c6s4',
        title: 'Computer Training',
        image: 'https://ice.edug.in/area_admin/img_logo/2712.jpg',
        rating: 4.7,
        reviews: 7.8,
        price: 799,
        duration: '8 sessions',
      },
      {
        id: 'c6s5',
        title: 'Beauty Learning',
        image:
          'https://orane.com/wp-content/uploads/2024/07/basic-beauty-2048x2048.jpg',
        rating: 4.8,
        reviews: 3.9,
        price: 2999,
        duration: '15 sessions',
      },
    ],
  },

  // ── Event (c7) ────────────────────────────────────────────────────────────
  {
    id: 'c7',
    name: 'Event',
    icon: 'event',
    services: [
      {
        id: 'c7s1',
        title: 'Photography',
        image:
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop',
        rating: 4.9,
        reviews: 14.2,
        price: 3999,
        duration: 'Full day',
      },
      {
        id: 'c7s2',
        title: 'Videography',
        image:
          'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?q=80&w=600&auto=format&fit=crop',
        rating: 4.8,
        reviews: 8.7,
        price: 5999,
        duration: 'Full day',
      },
      {
        id: 'c7s3',
        title: 'Event Planning',
        image:
          'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=600&auto=format&fit=crop',
        rating: 4.7,
        reviews: 5.1,
        price: 9999,
        duration: 'Custom',
      },
      {
        id: 'c7s4',
        title: 'Decoration Services',
        image:
          'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=600&auto=format&fit=crop',
        rating: 4.8,
        reviews: 9.4,
        price: 4999,
        duration: 'Half day',
      },
    ],
  },

  // ── Business (c8) ─────────────────────────────────────────────────────────
  {
    id: 'c8',
    name: 'Business',
    icon: 'business',
    services: [
      {
        id: 'c8s1',
        title: 'CA / Accounting',
        image:
          'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=600&auto=format&fit=crop',
        rating: 4.8,
        reviews: 4.3,
        price: 1999,
        duration: 'Per session',
      },
      {
        id: 'c8s2',
        title: 'Legal Services',
        image:
          'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=600&auto=format&fit=crop',
        rating: 4.7,
        reviews: 3.1,
        price: 2499,
        duration: 'Per consultation',
      },
      {
        id: 'c8s3',
        title: 'Digital Marketing',
        image:
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop',
        rating: 4.6,
        reviews: 6.8,
        price: 4999,
        duration: 'Per month',
      },
      {
        id: 'c8s4',
        title: 'Website Development',
        image:
          'https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=600&auto=format&fit=crop',
        rating: 4.8,
        reviews: 7.5,
        price: 9999,
        duration: 'Per project',
      },
    ],
  },

  // ── Pest Control (c9) ─────────────────────────────────────────────────────
  {
    id: 'c9',
    name: 'Pest Control',
    icon: 'pest',
    services: [
      {
        id: 'c9s1',
        title: 'Cockroach Control',
        image:
          'https://accurateservice.in/main-pro/cockroaches-pest-control-services.jpg',
        rating: 4.7,
        reviews: 18.4,
        price: 699,
        duration: '2-3 hrs',
      },
      {
        id: 'c9s2',
        title: 'Termite Control',
        image:
          'https://ardentpest.com.sg/wp-content/uploads/2024/12/Termites-Control-1.webp',
        rating: 4.8,
        reviews: 9.2,
        price: 1499,
        duration: '3-4 hrs',
      },
      {
        id: 'c9s3',
        title: 'Bed Bugs Control',
        image:
          'https://accurateservice.in/pest-control/bedbugs-control-services.jpg',
        rating: 4.6,
        reviews: 7.1,
        price: 999,
        duration: '2-3 hrs',
      },
      {
        id: 'c9s4',
        title: 'Ant Control',
        image:
          'https://pestcontrolwheelerhills.com.au/wp-content/uploads/2024/12/DALL%C2%B7E-2024-11-16-14.01.20-A-professional-pest-control-technician-in-a-clean-uniform-spraying-eco-friendly-insecticide-around-a-modern-home-in-a-suburban-Brighton-setting.-Inclu.webp',
        rating: 4.5,
        reviews: 5.8,
        price: 599,
        duration: '1-2 hrs',
      },
    ],
  },

  // ── Massage (c10) — Gender-based ──────────────────────────────────────────
  {
    id: 'c10',
    name: 'Massage',
    icon: 'massage',
    services: [
      {
        id: 'c10s1',
        title: 'Full Body Massage',
        image:
          'https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=600&auto=format&fit=crop',
        rating: 4.9,
        reviews: 14.6,
        price: 1299,
        duration: '1 hr',
        gender: 'female',
      },
      {
        id: 'c10s2',
        title: 'Head & Shoulder Massage',
        image:
          'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=600&auto=format&fit=crop',
        rating: 4.8,
        reviews: 9.3,
        price: 699,
        duration: '45 mins',
        gender: 'female',
      },
      {
        id: 'c10s3',
        title: 'Deep Tissue Massage',
        image:
          'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=600&auto=format&fit=crop',
        rating: 4.8,
        reviews: 12.1,
        price: 1499,
        duration: '1 hr',
        gender: 'male',
      },
      {
        id: 'c10s4',
        title: 'Swedish Massage',
        image:
          'https://mimismassagesandiego.com/wp-content/uploads/2025/10/A-professional-therapist-giving-a-relaxing-Swedish-massage-in-a-calm-spa-setting-with-candles-and-white-towels.jpg',
        rating: 4.7,
        reviews: 8.4,
        price: 999,
        duration: '1 hr',
        gender: 'male',
      },
    ],
  },

  // ── Workforce (c12) ───────────────────────────────────────────────────────
  {
    id: 'c12',
    name: 'Workforce',
    icon: 'workforce',
    services: [
      {
        id: 'c12s1',
        title: 'Daily Labour',
        image:
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop',
        rating: 4.5,
        reviews: 8.2,
        price: 699,
        duration: 'Per day',
      },
      {
        id: 'c12s2',
        title: 'Construction Workers',
        image:
          'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600&auto=format&fit=crop',
        rating: 4.6,
        reviews: 5.4,
        price: 999,
        duration: 'Per day',
      },
      {
        id: 'c12s3',
        title: 'Helpers',
        image:
          'https://i.pinimg.com/736x/68/b3/72/68b372ddc7f448409632a5a22614cd1c.jpg',
        rating: 4.4,
        reviews: 11.3,
        price: 499,
        duration: 'Per day',
      },
    ],
  },

  // ── Gardening / Security (c13) — as per client data ───────────────────────
  {
    id: 'c13',
    name: 'Gardening',
    icon: 'gardening',
    services: [
      {
        id: 'c13s1',
        title: 'Security Guards',
        image:
          'https://cbisecurity.com/wp-content/uploads/2021/04/RosSmithersCBI2020-56.jpg',
        rating: 4.6,
        reviews: 7.2,
        price: 1299,
        duration: 'Per day',
      },
      {
        id: 'c13s2',
        title: 'CCTV Installation',
        image:
          'https://www.shutterstock.com/image-photo/professional-cctv-technician-working-260nw-296480216.jpg',
        rating: 4.7,
        reviews: 5.8,
        price: 2499,
        duration: '3-5 hrs',
      },
      {
        id: 'c13s3',
        title: 'Fire Safety Service',
        image:
          'https://synergyfireandsecurity.co.uk/wp-content/uploads/2023/04/fire-extinguisher-services-install-min.jpg',
        rating: 4.5,
        reviews: 3.4,
        price: 1999,
        duration: '2-3 hrs',
      },
    ],
  },

  // ── Pet Care (c14) ────────────────────────────────────────────────────────
  {
    id: 'c14',
    name: 'Pet Care',
    icon: 'petcare',
    services: [
      {
        id: 'c14s1',
        title: 'Pet Grooming',
        image:
          'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=600&auto=format&fit=crop',
        rating: 4.8,
        reviews: 11.6,
        price: 799,
        duration: '1.5 hrs',
      },
      {
        id: 'c14s2',
        title: 'Pet Training',
        image:
          'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=600&auto=format&fit=crop',
        rating: 4.7,
        reviews: 6.3,
        price: 999,
        duration: '1 hr/session',
      },
      {
        id: 'c14s3',
        title: 'Pet Boarding',
        image:
          'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=600&auto=format&fit=crop',
        rating: 4.6,
        reviews: 4.8,
        price: 599,
        duration: 'Per day',
      },
    ],
  },

  // ── Packers (c15) ─────────────────────────────────────────────────────────
  {
    id: 'c15',
    name: 'Packers',
    icon: 'packers',
    services: [
      {
        id: 'c15s1',
        title: 'House Shifting',
        image:
          'https://i.pinimg.com/originals/8e/d5/15/8ed5151d51c011922ca7dded28ac8891.jpg',
        rating: 4.8,
        reviews: 22.4,
        price: 4999,
        duration: '1 day',
      },
      {
        id: 'c15s2',
        title: 'Office Shifting',
        image:
          'https://officemovers.com/wp-content/uploads/2016/08/moveco-37.jpg',
        rating: 4.7,
        reviews: 15.1,
        price: 8999,
        duration: '1-2 days',
      },
      {
        id: 'c15s3',
        title: 'Movers & Packers',
        image:
          'https://www.duckbrand.com/uploads/activities/packing-tips-make-moving-easier/_largeTile/Duck-Cares-21_171002_161330.jpg',
        rating: 4.8,
        reviews: 35.3,
        price: 2999,
        duration: '4-6 hrs',
      },
      {
        id: 'c15s4',
        title: 'Goods Transport',
        image:
          'https://png.pngtree.com/thumb_back/fw800/background/20231219/pngtree-logistics-industrial-port-transport-truck-for-container-import-and-export-photo-image_15526855.png',
        rating: 4.6,
        reviews: 14.2,
        price: 1999,
        duration: 'Custom',
      },
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
  {
    id: 'o1',
    title: 'Flat 50% Off on AC Service',
    subtitle: 'Use code: AC50',
    image:
      'https://images.unsplash.com/photo-1518081461904-9d8f136351c2?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'o2',
    title: 'Free Deep Cleaning Add-on',
    subtitle: 'With any Premium Salon Package',
    image:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'o3',
    title: 'Winter Hair Spa',
    subtitle: 'Get glowing hair at 20% off',
    image:
      'https://spinsalon.in/wp-content/uploads/2025/12/BlogSpinsalon_Top-Winter-Hair-Spa-Treatments-at-Spin-Salon-2025-Edition-1-1024x576.jpg',
  },
];

export const PAST_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    serviceId: 's1',
    title: 'Full Home Deep Cleaning',
    date: '12 Oct, 2025',
    status: 'Completed',
    price: 3499,
  },
  {
    id: 'b2',
    serviceId: 's6',
    title: 'AC Service & Repair',
    date: '05 Sep, 2025',
    status: 'Completed',
    price: 499,
  },
];

export const SAVED_ADDRESSES: Address[] = [
  {
    id: 'a1',
    type: 'Home',
    details: 'A-421, Shunya Apartments, Sector 12, Azamgarh, UP - 276001',
  },
  {
    id: 'a2',
    type: 'Work',
    details: 'Tower C, 4th Floor, Tech Hub, Gorakhpur Road, UP - 276002',
  },
];

export const REVIEWS = [
  {
    id: 'r1',
    user: 'Amit K.',
    rating: 5,
    date: '1 week ago',
    text: 'Very professional behavior and thorough cleaning.',
  },
  {
    id: 'r2',
    user: 'Priya S.',
    rating: 4,
    date: '2 weeks ago',
    text: 'Good service, but arrived 10 minutes late.',
  },
];

export const FAQS = [
  {
    id: 'f1',
    question: 'Do I need to provide any equipment?',
    answer:
      'No, our professionals carry all necessary industry-grade equipment and chemicals.',
  },
  {
    id: 'f2',
    question: 'Are the cleaning chemicals safe for pets?',
    answer: 'Yes, we use strictly eco-friendly and pet-safe products.',
  },
  {
    id: 'f3',
    question: 'What is the cancellation policy?',
    answer:
      'You can cancel for free up to 4 hours before the service time. Late cancellations incur a 10% fee.',
  },
];

export const PRODUCTS = [
  {
    id: 'p1',
    title: 'Professional Cleaning Kit',
    price: 1299,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800',
    category: 'Cleaning',
    description:
      'Complete set of 12 industrial-grade cleaners and microfiber cloths.',
  },
  {
    id: 'p2',
    title: 'Premium Hair Wax',
    price: 499,
    image:
      'https://hdsalonandacademy.co.uk/wp-content/uploads/2023/07/Full-body-waxing-scaled-e1692185226745.jpg',
    category: "Men's Grooming",
    description: 'Strong hold, matte finish wax for professional styling.',
  },
  {
    id: 'p3',
    title: 'Eco-friendly Paint 5L',
    price: 2499,
    image:
      'https://integratedpaintsandalliedproductsltd.com/wp-content/uploads/2025/01/A-close-up-image-of-eco-friendly-paint-buckets-with-eco-labels.webp',
    category: 'Home Painting',
    description: 'Non-toxic, low VOC paint with anti-fungal properties.',
  },
  {
    id: 'p4',
    title: 'Smart LED Bulb Pack',
    price: 899,
    image: 'https://images.unsplash.com/photo-1550985543-f47f38aeee65?w=800',
    category: 'Electrical',
    description: 'Pack of 3 Wi-Fi enabled RGB bulbs with voice control.',
  },
  {
    id: 'p_atta_ash',
    title: 'Aashirvaad Atta 5kg',
    price: 275,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
    category: 'Grains',
    subcategory: 'Atta',
    description: 'Aashirvaad Superior MP Atta.',
  },
  {
    id: 'p_rice_bas',
    title: 'India Gate Basmati Rice 1kg',
    price: 145,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800',
    category: 'Grains',
    subcategory: 'Rice',
    description: 'India Gate Basmati Rice Premium.',
  },
  {
    id: 'p_dal_arhar',
    title: 'Arhar Dal (Toor) 1kg',
    price: 160,
    image: 'https://images.unsplash.com/photo-1585914924626-45adac9e6b42?w=800',
    category: 'Pulses',
    subcategory: 'Arhar Dal',
    description: 'Unpolished premium Arhar Dal.',
  },
  {
    id: 'p_mustard_oil',
    title: 'Fortune Mustard Oil 1L',
    price: 175,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800',
    category: 'Oil & Ghee',
    subcategory: 'Mustard Oil',
    description: 'Fortune Kacchi Ghani Mustard Oil.',
  },
  {
    id: 'p_tea_red',
    title: 'Red Label Tea 500g',
    price: 310,
    image: 'https://images.unsplash.com/photo-1594631252845-29fc458681b7?w=800',
    category: 'Beverages',
    subcategory: 'Tea',
    description: 'Brooke Bond Red Label Strong Tea.',
  },
  {
    id: 'p_milk_amul',
    title: 'Amul Taaza 1L',
    price: 66,
    image: 'https://images.unsplash.com/photo-1550583724-1255818c0533?w=800',
    category: 'Dairy',
    subcategory: 'Milk',
    description: 'Amul Taaza Toned Milk.',
  },
  {
    id: 'p_surf_excel',
    title: 'Surf Excel Matic 1kg',
    price: 240,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800',
    category: 'Cleaning & Household',
    subcategory: 'Detergent',
    description: 'Surf Excel Matic Front Load Detergent.',
  },
  {
    id: 'p_colgate',
    title: 'Colgate Strong Teeth 200g',
    price: 110,
    image: 'https://images.unsplash.com/photo-1559591937-e43542385153?w=800',
    category: 'Personal Care',
    subcategory: 'Toothpaste',
    description: 'Colgate Strong Teeth Anticavity Toothpaste.',
  },
  {
    id: 'p_bread_harvest',
    title: 'Harvest Gold White Bread',
    price: 45,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
    category: 'Bakery',
    subcategory: 'Breads',
    description: 'Fresh White Bread Harvest Gold.',
  },
  {
    id: 'p_banana',
    title: 'Banana (Dozen)',
    price: 60,
    image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=800',
    category: 'Fruits',
    subcategory: 'Fresh Fruits',
    description: 'Fresh ripe bananas.',
  },
  {
    id: 'p_potato',
    title: 'Potato 1kg',
    price: 30,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?w=800',
    category: 'Vegetables',
    subcategory: 'Fresh Vegetables',
    description: 'Fresh organic potatoes.',
  },
  {
    id: 'p_men_tshirt',
    title: "Men's Cotton T-Shirt",
    price: 599,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
    category: 'Fashion',
    subcategory: "Men's Wear",
    description: '100% Cotton, regular fit t-shirt.',
  },
  {
    id: 'p_iphone_15',
    title: 'iPhone 15 Pro 128GB',
    price: 119900,
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800',
    category: 'Electronic',
    subcategory: 'Mobile Phones',
    description: 'Titanium design, A17 Pro chip, 48MP Main camera.',
  },
  {
    id: 'p_mixer_grinder',
    title: 'Prestige Mixer Grinder',
    price: 3499,
    image: 'https://images.unsplash.com/photo-1585676801854-bd701bd6426f?w=800',
    category: 'Home & Kitchen',
    subcategory: 'Kitchen Appliances',
    description: '750W motor, 3 stainless steel jars.',
  },
  {
    id: 'p_lipstick_mac',
    title: 'MAC Matte Lipstick',
    price: 1850,
    image: 'https://images.unsplash.com/photo-1586776977607-310e9c725c37?w=800',
    category: 'Beauty',
    subcategory: 'Makeup Products',
    description: 'Iconic matte finish, long-wearing lipstick.',
  },
  {
    id: 'p_dumbbells_5kg',
    title: 'PVC Dumbbells 5kg x 2',
    price: 899,
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
    category: 'Sports',
    subcategory: 'Gym Equipment',
    description: 'Set of 2 PVC dumbbells for home workout.',
  },
  {
    id: 'p_car_perfume',
    title: 'Godrej Aer Twist Car Perfume',
    price: 349,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
    category: 'Automobile',
    subcategory: 'Car Accessories',
    description: 'Long-lasting gel car air freshener.',
  },
  {
    id: 'p_pedigree_1kg',
    title: 'Pedigree Adult Dog Food 1kg',
    price: 320,
    image: 'https://images.unsplash.com/photo-1589924691106-073b19f5538d?w=800',
    category: 'Pet Care',
    subcategory: 'Pet Food',
    description: 'Complete and balanced food for adult dogs.',
  },
  {
    id: 'p_drill_machine',
    title: 'Bosch GSB 500W Drill',
    price: 2499,
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800',
    category: 'Hardware & Tools',
    subcategory: 'Electrical',
    description: 'Powerful impact drill for masonry and wood.',
  },
];

export const GROCERY_CATEGORIES = [
  {
    id: 'g_grains',
    name: 'Grains',
    icon: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Atta', 'Rice', 'Suji', 'Poha'],
  },
  {
    id: 'g_pulses',
    name: 'Pulses',
    icon: 'https://www.myweekendkitchen.in/wp-content/uploads/2020/04/different_types_of_dals_lentils_pulses_hindi_english.jpg',
    subcategories: [
      'Arhar Dal',
      'Moong Dal',
      'Masoor Dal',
      'Chana Dal',
      'Rajma',
      'Chole',
    ],
  },
  {
    id: 'g_oil',
    name: 'Oil & Ghee',
    icon: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Mustard Oil', 'Refined Oil', 'Desi Ghee', 'Vanaspati'],
  },
  {
    id: 'g_spices',
    name: 'Spices',
    icon: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?q=80&w=300&auto=format&fit=crop',
    subcategories: [
      'Whole Spices',
      'Powder Masala',
      'Garam Masala',
      'Kitchen Masala Mix',
    ],
  },
  {
    id: 'g_snacks',
    name: 'Snacks',
    icon: 'https://i0.wp.com/s3.ap-south-1.amazonaws.com/img.paisawapas/images/2023/03/13164101/Frame-1Patanjali-Biscuits.png?resize=998%2C454&ssl=1',
    subcategories: ['Biscuit', 'Namkeen', 'Chips'],
  },
  {
    id: 'g_beverages',
    name: 'Beverages',
    icon: 'https://wallpapercave.com/wp/wp7289345.png',
    subcategories: ['Tea', 'Coffee', 'Soft Drinks', 'Juices'],
  },
  {
    id: 'g_dairy',
    name: 'Dairy',
    icon: 'https://amrada.in/wp-content/uploads/2024/04/Untitled-design-62-1024x1024.jpg',
    subcategories: ['Milk', 'Curd', 'Butter', 'Paneer', 'Cheese'],
  },
  {
    id: 'g_sweets',
    name: 'Sweets & Chocolates',
    icon: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Chocolates', 'Candies', 'Mithai'],
  },
  {
    id: 'g_cleaning',
    name: 'Cleaning & Household',
    icon: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Detergent', 'Dishwash', 'Floor Cleaner', 'Toilet Cleaner'],
  },
  {
    id: 'g_personal',
    name: 'Personal Care',
    icon: 'https://hardtimeproducts.com/wp-content/uploads/2025/03/45070-KIT-6-Comp-Hygiene-Kit-600x600.png',
    subcategories: ['Soap', 'Shampoo', 'Toothpaste', 'Hair Oil'],
  },
  {
    id: 'g_condiments',
    name: 'Condiments',
    icon: 'https://img.joomcdn.net/8de24d9057dd258e77a97a9cfd2959128645b823_original.jpeg',
    subcategories: ['Pickles', 'Sauces & Ketchup', 'Jams & Spreads'],
  },
  {
    id: 'g_fruits',
    name: 'Fruits',
    icon: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Fresh Fruits'],
  },
  {
    id: 'g_vegetables',
    name: 'Vegetables',
    icon: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Fresh Vegetables'],
  },
  {
    id: 'g_bakery',
    name: 'Bakery',
    icon: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Breads', 'Cakes', 'Buns', 'Cookies'],
  },
];

export const SHOP_CATEGORIES = [
  {
    id: 's_fashion',
    name: 'Fashion',
    icon: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=300&auto=format&fit=crop',
    subcategories: [
      "Men's Wear",
      "Women's Wear",
      'Kids Wear',
      'Footwear',
      'Bags & Accessories',
      'Jewellery',
    ],
  },
  {
    id: 's_electronics',
    name: 'Electronic',
    icon: 'https://images.stockcake.com/public/3/6/7/367edbed-0797-47e0-80cb-41626818586f_large/tech-gadget-assortment-stockcake.jpg',
    subcategories: [
      'Mobile Phones',
      'Laptop & Computers',
      'Accessories',
      'Charger',
      'Earphones',
      'Home Entertainment',
      'TV',
      'Speaker',
      'Smart Gadgets',
    ],
  },
  {
    id: 's_home',
    name: 'Home & Kitchen',
    icon: 'https://www.brylanehome.com/on/demandware.static/-/Sites-masterCatalog_BrylaneHome/default/dwc13091e8/images/hi-res/1543_02659_mc_0002.jpg',
    subcategories: [
      'Kitchen Appliances',
      'Cookware & Utensils',
      'Home Decor',
      'Furniture',
      'Storage & Organizer',
    ],
  },
  {
    id: 's_beauty',
    name: 'Beauty',
    icon: 'https://alurusa.com/wp-content/uploads/2024/04/DALL%C2%B7E-2024-04-11-15.09.59-Create-a-photo-realistic-image-of-Makeup-And-Skin-Care-using-vivid-colors.-The-image-should-depict-a-variety-of-makeup-and-skincare-products-arrange-1024x585.webp',
    subcategories: [
      'Makeup Products',
      'Skincare',
      'Hair Care',
      'Salon Products',
      'Grooming Kits',
    ],
  },
  {
    id: 's_kids',
    name: 'Kids',
    icon: 'https://cdn.firstcry.com/education/2022/11/06094158/Toy-Names-For-Kids.jpg',
    subcategories: ['Toys & Games', 'Baby Care', 'School Supplies', 'Clothing'],
  },
  {
    id: 's_sports',
    name: 'Sports',
    icon: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Gym Equipment', 'Yoga Accessories', 'Sports Items'],
  },
  {
    id: 's_automobile',
    name: 'Automobile',
    icon: 'https://image.made-in-china.com/2f0j00cpUokOqnkLby/Perfectrail-4X4-Car-Accessories-Auto-Spare-Parts-for-Toyota-Hilux-Pickup.webp',
    subcategories: ['Car Accessories', 'Bike Accessories', 'Spare Parts'],
  },
  {
    id: 's_stationery',
    name: 'Stationery',
    icon: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?q=80&w=300&auto=format&fit=crop',
    subcategories: [
      'Books',
      'Notebooks',
      'Office Supplies',
      'Printer Accessories',
    ],
  },
  {
    id: 's_pet',
    name: 'Pet Care',
    icon: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=300&auto=format&fit=crop',
    subcategories: ['Pet Food', 'Accessories', 'Grooming Products'],
  },
  {
    id: 's_hardware',
    name: 'Hardware & Tools',
    icon: 'https://sc04.alicdn.com/kf/Hdd9620153d734f6387031d322b74397cl/243793070/Hdd9620153d734f6387031d322b74397cl.png',
    subcategories: ['Electrical', 'Plumbing', 'Construction'],
  },
];

export const KABADI_ITEMS = [
  {
    id: 'k1',
    title: 'Paper Scrap',
    icon: 'https://www.homelectrical.com/sites/default/files/styles/original_image/public/images/product/blg/blg-cardboard_reuse.jpg',
    subcategories: [
      { id: 'k1s1', title: 'Newspaper (Raddi)', price: 14 },
      { id: 'k1s2', title: 'Books & Copies', price: 12 },
      { id: 'k1s3', title: 'Office Paper', price: 15 },
      { id: 'k1s4', title: 'Carton / Cardboard', price: 10 },
    ],
  },
  {
    id: 'k2',
    title: 'Plastic Scrap',
    icon: 'https://c8.alamy.com/comp/BMC4HW/crushed-green-plastic-bottle-waste-at-a-waste-recycling-plant-BMC4HW.jpg',
    subcategories: [
      { id: 'k2s1', title: 'Plastic Bottles', price: 15 },
      { id: 'k2s2', title: 'Hard Plastic', price: 18 },
      { id: 'k2s3', title: 'Soft Plastic', price: 12 },
      { id: 'k2s4', title: 'Plastic Container', price: 14 },
    ],
  },
  {
    id: 'k3',
    title: 'Metal Scrap',
    icon: 'https://www.scrapware.com/wp-content/uploads/2020/09/We-All-Benefit-from-Metal-Recycling-1.jpg',
    subcategories: [
      { id: 'k3s1', title: 'Heavy Iron', price: 32 },
      { id: 'k3s2', title: 'Light Iron', price: 28 },
      { id: 'k3s3', title: 'Steel Items', price: 40 },
      { id: 'k3s4', title: 'Copper', price: 450 },
      { id: 'k3s5', title: 'Aluminium', price: 120 },
      { id: 'k3s6', title: 'Brass (Peetal)', price: 320 },
      { id: 'k3s7', title: 'Copper (Tamba)', price: 450 },
    ],
  },
  {
    id: 'k4',
    title: 'E-Waste',
    icon: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=300&auto=format&fit=crop',
    subcategories: [
      { id: 'k4s1', title: 'Old TV / LED', price: 500 },
      { id: 'k4s2', title: 'Computer / Laptop', price: 800 },
      { id: 'k4s3', title: 'Fridge / AC', price: 1500 },
      { id: 'k4s4', title: 'Washing Machine', price: 1000 },
      { id: 'k4s5', title: 'Mobile Phones', price: 150 },
    ],
  },
  {
    id: 'k5',
    title: 'Automobile Scrap',
    icon: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=300&auto=format&fit=crop',
    subcategories: [
      { id: 'k5s1', title: 'Old Car', price: 15000 },
      { id: 'k5s2', title: 'Bike Scrap', price: 3500 },
      { id: 'k5s3', title: 'Car Parts', price: 100 },
    ],
  },
  {
    id: 'k6',
    title: 'Household Scrap',
    icon: 'https://www.jdogjunkremoval.com/wp-content/uploads/2019/06/old-appliances-1024x1024.jpg',
    subcategories: [
      { id: 'k6s1', title: 'Mixed Kabadi', price: 18 },
      { id: 'k6s2', title: 'Old Furniture', price: 50 },
      { id: 'k6s3', title: 'Broken Items', price: 15 },
    ],
  },
  {
    id: 'k7',
    title: 'Industrial Scrap',
    icon: 'https://www.okonrecycling.com/wp-content/uploads/2025/09/scrap_metal_factory_floor.png',
    subcategories: [
      { id: 'k7s1', title: 'Factory Scrap', price: 45 },
      { id: 'k7s2', title: 'Construction Scrap', price: 38 },
      { id: 'k7s3', title: 'Sariya', price: 42 },
      { id: 'k7s4', title: 'Pipe', price: 35 },
    ],
  },
  {
    id: 'k8',
    title: 'Battery Scrap',
    icon: 'https://www.battery.co.za/wp-content/uploads/2023/05/battery-Recycling.webp',
    subcategories: [
      { id: 'k8s1', title: 'Inverter Battery', price: 800 },
      { id: 'k8s2', title: 'Car Battery', price: 600 },
      { id: 'k8s3', title: 'UPS Battery', price: 200 },
    ],
  },
  {
    id: 'k9',
    title: 'Glass Scrap',
    icon: 'https://c8.alamy.com/comp/M8JCBP/a-pile-of-glass-bottle-pieces-broken-glass-recycling-M8JCBP.jpg',
    subcategories: [
      { id: 'k9s1', title: 'Glass Bottles', price: 5 },
      { id: 'k9s2', title: 'Window Glass', price: 8 },
      { id: 'k9s3', title: 'Normal Glass', price: 4 },
    ],
  },
  {
    id: 'k10',
    title: 'Textile Scrap',
    icon: 'https://talu.earth/wp-content/uploads/2022/08/3-2.png',
    subcategories: [
      { id: 'k10s1', title: 'Old Clothes', price: 15 },
      { id: 'k10s2', title: 'Fabric Waste', price: 12 },
    ],
  },
];

export const BANNERS = [
  {
    id: 'b1',
    image:
      'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?q=80&w=800&auto=format&fit=crop',
  }, // Cleaning
  {
    id: 'b2',
    image:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
  }, // Shopping
  {
    id: 'b3',
    image:
      'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=800&auto=format&fit=crop',
  }, // Services
];

// Preload banners to avoid blank grey placeholder on initial load
BANNERS.forEach(banner => {
  Image.prefetch(banner.image).catch(() => {});
});
