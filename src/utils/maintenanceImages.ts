/**
 * Utility to map maintenance categories and services to high-quality, professional,
 * and unique images. This ensures consistent aesthetic design across local and remote databases.
 */

const IMAGE_MAP: Record<string, any> = {
  // Categories
  'AC Repair & Service': require('../../assets/images/maintenance/ac_repair_category_cover.png'),
  'Electrical Services': require('../../assets/images/maintenance/electrical_category_cover.png'),
  'Plumbing Services': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=500',

  // AC Services
  'AC Regular Service': require('../../assets/images/maintenance/ac_regular_service.png'),
  'AC Deep Cleaning': require('../../assets/images/maintenance/ac_deep_cleaning.png'),
  'AC Installation': require('../../assets/images/maintenance/ac_installation.png'),

  // Electrical Services
  'Switch / Socket Repair': require('../../assets/images/maintenance/switch_socket_repair.png'),
  'Switch/Socket Repair': require('../../assets/images/maintenance/switch_socket_repair.png'),
  'Ceiling Fan Repair': require('../../assets/images/maintenance/ceiling_fan_repair.png'),
  'Complete House Inspection': require('../../assets/images/maintenance/complete_house_inspection.png'),

  // Plumbing Services
  'Tap Repair / Replacement': require('../../assets/images/maintenance/tap_repair.png'),
  'Tap Repair/Replacement': require('../../assets/images/maintenance/tap_repair.png'),
  'Drain Unclogging': require('../../assets/images/maintenance/drain_unclogging.png'),
  'Toilet Jet Spray Install': require('../../assets/images/maintenance/toilet_jet_spray.png'),
  'Toilet Jet Spray Installation': require('../../assets/images/maintenance/toilet_jet_spray.png'),
};

export const getMaintenanceImage = (name: string, fallback?: string): any => {
  const cleanName = name?.trim();
  if (IMAGE_MAP[cleanName]) {
    const val = IMAGE_MAP[cleanName];
    if (typeof val === 'number') {
      return val; // Local require asset
    }
    return { uri: val }; // URL string
  }
  return fallback ? { uri: fallback } : require('../../assets/app_logo.jpeg');
};
