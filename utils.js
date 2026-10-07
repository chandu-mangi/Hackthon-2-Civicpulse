export function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export const STATUS_LABELS = {
  submitted: 'Submitted',
  dispatched: 'Dispatched',
  'otp-verification': 'OTP Verification',
  resolved: 'Resolved',
  open: 'Open',
  'in-progress': 'In Progress',
  escalated: 'Escalated',
}

export const STATUS_STEPS = [
  { key: 'submitted', label: 'Issue Submitted' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'otp-verification', label: 'OTP Verification' },
  { key: 'resolved', label: 'Resolved' },
]

export const STATUS_MAP = {
  submitted: 0,
  dispatched: 1,
  'otp-verification': 2,
  resolved: 3,
  open: 0,
  'in-progress': 1,
  escalated: 1,
}

export const JOB_ROLES = [
  'electrician',
  'plumber',
  'carpenter',
  'painter',
  'mechanic',
  'cleaner',
  'gardener',
  'appliance_repair',
]

export const CATEGORIES = [
  'infrastructure',
  'safety',
  'environment',
  'transportation',
  'utilities',
  'other',
]

export function getBotReply(input) {
  const text = input.toLowerCase()
  if (/\b(hello|hi|hey)\b/.test(text)) return 'Hello! 👋 How can I assist you today?'
  if (text.includes('submit') || text.includes('report')) return "You can report an issue using the 'Submit Issue' page."
  if (text.includes('track') || /\bid\b/.test(text) || text.includes('status')) {
    return "Enter your Issue ID on the 'Track Issue' page to check its status."
  }
  if (text.includes('review')) return "You can leave feedback on the 'Reviews' section."
  if (text.includes('worker')) return "Use 'Find Workers' to browse electricians, plumbers, and more."
  return "I'm here to help with CivicPulse — try asking about submitting or tracking issues!"
}

export function starString(rating) {
  const n = Math.floor(rating || 0)
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}
