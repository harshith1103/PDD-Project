import Colors from './colors';

/**
 * Format an ISO date string to a readable format
 * @param {string} dateStr - ISO date string
 * @param {boolean} includeTime - Whether to include time
 * @returns {string}
 */
export const formatDate = (dateStr, includeTime = false) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  const options = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  return date.toLocaleDateString('en-IN', options);
};

/**
 * Format a date relative to now (e.g., "2 hours ago", "in 3 hours")
 * @param {string} dateStr - ISO date string
 * @returns {string}
 */
export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = date - now;
  const diffMins = Math.round(diffMs / 60000);
  const absMins = Math.abs(diffMins);

  if (absMins < 1) return 'just now';
  if (absMins < 60) {
    const label = `${absMins} min${absMins !== 1 ? 's' : ''}`;
    return diffMins > 0 ? `in ${label}` : `${label} ago`;
  }

  const hours = Math.round(absMins / 60);
  if (hours < 24) {
    const label = `${hours} hr${hours !== 1 ? 's' : ''}`;
    return diffMins > 0 ? `in ${label}` : `${label} ago`;
  }

  const days = Math.round(hours / 24);
  const label = `${days} day${days !== 1 ? 's' : ''}`;
  return diffMins > 0 ? `in ${label}` : `${label} ago`;
};

/**
 * Get human-readable label for a status
 * @param {string} status
 * @returns {string}
 */
export const formatStatusLabel = (status) => {
  const map = {
    pending: 'Pending',
    matched: 'Matched',
    picked_up: 'Picked Up',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    confirmed: 'Confirmed',
  };
  return map[status] || status || 'Unknown';
};

/**
 * Get color for a donation status
 * @param {string} status
 * @returns {string}
 */
export const getStatusColor = (status) => {
  return Colors.status[status] || Colors.textSecondary;
};

/**
 * Calculate distance between two lat/lng points using Haversine formula
 * @param {object} loc1 - { lat, lng }
 * @param {object} loc2 - { lat, lng }
 * @returns {number} distance in km
 */
export const calculateDistance = (loc1, loc2) => {
  if (!loc1 || !loc2) return null;
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLng = toRad(loc2.lng - loc1.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(loc1.lat)) * Math.cos(toRad(loc2.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Format distance for display
 * @param {number} km
 * @returns {string}
 */
export const formatDistance = (km) => {
  if (km === null || km === undefined) return '';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

/**
 * Get a food emoji based on food type string
 * @param {string} foodType
 * @returns {string}
 */
export const getFoodEmoji = (foodType) => {
  if (!foodType) return '🍽️';
  const lower = foodType.toLowerCase();
  if (lower.includes('rice') || lower.includes('biryani')) return '🍚';
  if (lower.includes('bread') || lower.includes('roti')) return '🍞';
  if (lower.includes('fruit')) return '🍎';
  if (lower.includes('milk') || lower.includes('curd') || lower.includes('dairy')) return '🥛';
  if (lower.includes('dal') || lower.includes('curry') || lower.includes('sambar')) return '🍛';
  if (lower.includes('vegetable') || lower.includes('salad')) return '🥗';
  if (lower.includes('cake') || lower.includes('pastry') || lower.includes('sweet')) return '🍰';
  if (lower.includes('juice') || lower.includes('drink')) return '🧃';
  return '🍽️';
};

/**
 * Get expiry urgency (for visual cues)
 * @param {string} expiryStr - ISO date
 * @returns {'expired'|'urgent'|'soon'|'safe'}
 */
export const getExpiryUrgency = (expiryStr) => {
  if (!expiryStr) return 'safe';
  const now = new Date();
  const expiry = new Date(expiryStr);
  const hoursLeft = (expiry - now) / 3600000;
  if (hoursLeft <= 0) return 'expired';
  if (hoursLeft <= 2) return 'urgent';
  if (hoursLeft <= 6) return 'soon';
  return 'safe';
};
