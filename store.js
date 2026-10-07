const SAMPLE_WORKERS = [
  {
    id: 'worker_sample_1',
    name: 'Ramesh Kumar',
    phone: '+91-9876543210',
    email: 'ramesh.electrician@example.com',
    jobRole: 'electrician',
    experience: 8,
    address: 'Hyderabad, Telangana',
    password: 'password123',
    rating: 4.8,
    totalJobs: 45,
    completedJobs: 43,
    earnings: 125000,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'worker_sample_2',
    name: 'Suresh Reddy',
    phone: '+91-9876543211',
    email: 'suresh.plumber@example.com',
    jobRole: 'plumber',
    experience: 12,
    address: 'Hyderabad, Telangana',
    password: 'password123',
    rating: 4.9,
    totalJobs: 78,
    completedJobs: 76,
    earnings: 210000,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: 'worker_sample_3',
    name: 'Kiran Sharma',
    phone: '+91-9876543212',
    email: 'kiran.carpenter@example.com',
    jobRole: 'carpenter',
    experience: 6,
    address: 'Hyderabad, Telangana',
    password: 'password123',
    rating: 4.6,
    totalJobs: 32,
    completedJobs: 30,
    earnings: 95000,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
]

export class AuthManager {
  constructor() {
    this.storageKey = 'civicPulseUsers'
    this.workerStorageKey = 'civicPulseWorkers'
    this.currentUserKey = 'civicPulseCurrentUser'
    if (this.getWorkers().length === 0) this.saveWorkers(SAMPLE_WORKERS)
  }

  getUsers() {
    const stored = localStorage.getItem(this.storageKey)
    return stored ? JSON.parse(stored) : []
  }

  saveUsers(users) {
    localStorage.setItem(this.storageKey, JSON.stringify(users))
  }

  register(userData) {
    const users = this.getUsers()
    if (userData.email && users.find((u) => u.email === userData.email)) {
      return { success: false, message: 'Email already registered' }
    }
    if (userData.phone && users.find((u) => u.phone === userData.phone)) {
      return { success: false, message: 'Phone number already registered' }
    }
    const newUser = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: userData.name,
      email: userData.email || null,
      phone: userData.phone || null,
      password: userData.password,
      createdAt: new Date().toISOString(),
    }
    users.push(newUser)
    this.saveUsers(users)
    localStorage.setItem(this.currentUserKey, JSON.stringify(newUser))
    return { success: true, user: newUser }
  }

  login(identifier, password) {
    const user = this.getUsers().find(
      (u) => (u.email === identifier || u.phone === identifier) && u.password === password
    )
    if (user) {
      localStorage.setItem(this.currentUserKey, JSON.stringify(user))
      return { success: true, user }
    }
    return { success: false, message: 'Invalid credentials' }
  }

  logout() {
    localStorage.removeItem(this.currentUserKey)
  }

  getCurrentUser() {
    const stored = localStorage.getItem(this.currentUserKey)
    return stored ? JSON.parse(stored) : null
  }

  getWorkers() {
    const stored = localStorage.getItem(this.workerStorageKey)
    return stored ? JSON.parse(stored) : []
  }

  saveWorkers(workers) {
    localStorage.setItem(this.workerStorageKey, JSON.stringify(workers))
  }

  registerWorker(workerData) {
    const workers = this.getWorkers()
    if (workers.find((w) => w.phone === workerData.phone)) {
      return { success: false, message: 'Phone number already registered as worker' }
    }
    const newWorker = {
      id: 'worker_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: workerData.name,
      phone: workerData.phone,
      email: workerData.email || null,
      jobRole: workerData.jobRole,
      experience: workerData.experience || 0,
      address: workerData.address || '',
      password: workerData.password,
      rating: 5.0,
      totalJobs: 0,
      completedJobs: 0,
      earnings: 0,
      createdAt: new Date().toISOString(),
    }
    workers.push(newWorker)
    this.saveWorkers(workers)
    return { success: true, worker: newWorker }
  }
}

export class IssueManager {
  constructor(authManager) {
    this.authManager = authManager
    this.storageKey = 'civicPulseIssues'
    this.issues = this.loadIssues()
    this.currentUser = this.getAnonymousId()
    this.updateOldIssues()
  }

  getAnonymousId() {
    let userId = localStorage.getItem('civicPulseUserId')
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('civicPulseUserId', userId)
    }
    return userId
  }

  loadIssues() {
    const stored = localStorage.getItem(this.storageKey)
    if (stored) return JSON.parse(stored)
    return [
      {
        id: '1',
        title: 'Pothole on Main Street',
        description: 'Large pothole causing damage to vehicles. Located near the intersection with Oak Avenue.',
        category: 'infrastructure',
        status: 'open',
        location: 'Main Street, Downtown',
        lat: 40.7128,
        lng: -74.006,
        image: null,
        upvotes: 15,
        upvotedBy: [],
        comments: [{ id: 'c1', text: 'This has been here for weeks!', date: new Date(Date.now() - 86400000).toISOString() }],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        priority: 'moderate',
        escalationHistory: [],
      },
      {
        id: '2',
        title: 'Broken Streetlight',
        description: 'Streetlight not working on Elm Street, making it unsafe at night.',
        category: 'safety',
        status: 'in-progress',
        location: 'Elm Street, Residential Area',
        lat: 40.758,
        lng: -73.9855,
        image: null,
        upvotes: 8,
        upvotedBy: [],
        comments: [],
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        priority: 'moderate',
        escalationHistory: [],
      },
      {
        id: '3',
        title: 'Garbage Collection Issue',
        description: 'Garbage bins not being collected on schedule for the past two weeks.',
        category: 'utilities',
        status: 'resolved',
        location: 'Park Avenue, Suburb',
        lat: 40.7489,
        lng: -73.968,
        image: null,
        upvotes: 12,
        upvotedBy: [],
        comments: [{ id: 'c2', text: 'Issue has been resolved. Collection resumed.', date: new Date(Date.now() - 43200000).toISOString() }],
        createdAt: new Date(Date.now() - 345600000).toISOString(),
        updatedAt: new Date(Date.now() - 43200000).toISOString(),
        priority: 'moderate',
        escalationHistory: [],
      },
    ]
  }

  saveIssues() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.issues))
  }

  updateOldIssues() {
    let updated = false
    this.issues = this.issues.map((issue) => {
      if (!issue.priority || !issue.assignedTo || !issue.expectedResolution) {
        updated = true
        if (!issue.priority) issue.priority = this.calculatePriority(issue.category, issue.description, issue.upvotes || 0)
        if (!issue.assignedTo) issue.assignedTo = this.assignRepresentative(issue.category)
        if (!issue.expectedResolution) issue.expectedResolution = this.calculateExpectedResolution(issue.priority)
        if (!issue.escalationHistory) issue.escalationHistory = []
      }
      return issue
    })
    if (updated) this.saveIssues()
  }

  categorizeIssue(text) {
    if (!text) return 'other'
    const lowerText = text.toLowerCase()
    const keywords = {
      infrastructure: ['pothole', 'road', 'bridge', 'building', 'construction', 'crack', 'damage', 'repair'],
      safety: ['light', 'streetlight', 'lamp', 'dark', 'unsafe', 'danger', 'crime', 'security', 'emergency'],
      environment: ['garbage', 'waste', 'trash', 'dump', 'pollution', 'air', 'water', 'tree', 'park', 'green'],
      transportation: ['traffic', 'signal', 'bus', 'vehicle', 'parking', 'road', 'highway', 'junction'],
      utilities: ['water', 'electricity', 'power', 'drainage', 'sewer', 'pipe', 'leak', 'connection'],
    }
    let maxScore = 0
    let bestCategory = 'other'
    for (const [category, words] of Object.entries(keywords)) {
      const score = words.filter((word) => lowerText.includes(word)).length
      if (score > maxScore) {
        maxScore = score
        bestCategory = category
      }
    }
    return bestCategory
  }

  calculatePriority(category, description, upvotes) {
    const categoryScores = { safety: 30, infrastructure: 25, utilities: 20, environment: 15, transportation: 15, other: 10 }
    let score = categoryScores[category] || 10
    const lowerDesc = (description || '').toLowerCase()
    const criticalKeywords = ['emergency', 'urgent', 'danger', 'dangerous', 'critical', 'severe', 'immediate', 'accident', 'fire', 'flood']
    const moderateKeywords = ['broken', 'damaged', 'not working', 'issue', 'problem', 'need']
    if (criticalKeywords.some((w) => lowerDesc.includes(w))) score += 40
    else if (moderateKeywords.some((w) => lowerDesc.includes(w))) score += 20
    score += Math.min((upvotes || 0) * 2, 30)
    if (score >= 70) return 'critical'
    if (score >= 40) return 'moderate'
    return 'minor'
  }

  getRepresentatives() {
    const stored = localStorage.getItem('civicPulseRepresentatives')
    if (stored) return JSON.parse(stored)
    const defaults = [
      { id: 'rep1', name: 'Rajesh Kumar', phone: '+91-9876543210', email: 'rajesh.kumar@civicpulse.gov', categories: ['infrastructure', 'transportation'], rating: 4.5, salary: 50000, resolvedCount: 150, pendingCount: 5 },
      { id: 'rep2', name: 'Priya Sharma', phone: '+91-9876543211', email: 'priya.sharma@civicpulse.gov', categories: ['safety', 'environment'], rating: 4.8, salary: 52000, resolvedCount: 180, pendingCount: 3 },
      { id: 'rep3', name: 'Amit Patel', phone: '+91-9876543212', email: 'amit.patel@civicpulse.gov', categories: ['utilities', 'other'], rating: 4.2, salary: 48000, resolvedCount: 120, pendingCount: 7 },
    ]
    localStorage.setItem('civicPulseRepresentatives', JSON.stringify(defaults))
    return defaults
  }

  getRepresentativeWorkload(repId) {
    return this.issues.filter((issue) => issue.assignedTo && issue.assignedTo.id === repId && issue.status !== 'resolved').length
  }

  assignRepresentative(category) {
    const representatives = this.getRepresentatives()
    const categoryReps = representatives.filter((rep) => rep.categories.includes(category))
    const pool = categoryReps.length ? categoryReps : representatives
    return [...pool].sort((a, b) => {
      const wa = this.getRepresentativeWorkload(a.id)
      const wb = this.getRepresentativeWorkload(b.id)
      if (wa !== wb) return wa - wb
      return b.rating - a.rating
    })[0]
  }

  calculateExpectedResolution(priority) {
    const hours = { critical: 24, moderate: 72, minor: 168 }
    return new Date(Date.now() + (hours[priority] || 168) * 3600000).toISOString()
  }

  addIssue(issueData) {
    let category = issueData.category
    if (!category || category === 'other') category = this.categorizeIssue(issueData.description || issueData.title)
    const priority = this.calculatePriority(category, issueData.description || issueData.title, 0)
    const representative = this.assignRepresentative(category)
    const expectedResolution = this.calculateExpectedResolution(priority)
    const issueId = `CP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    let assignedWorker = null
    if (issueData.type === 'private' && issueData.preferredWorkerId) {
      assignedWorker = this.authManager.getWorkers().find((w) => w.id === issueData.preferredWorkerId)
    }
    const newIssue = {
      id: issueId,
      title: issueData.title,
      description: issueData.description,
      category,
      status: 'submitted',
      location: issueData.location,
      lat: issueData.lat,
      lng: issueData.lng,
      image: issueData.image,
      addressDetails: issueData.addressDetails || {},
      upvotes: 0,
      upvotedBy: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      otp: null,
      otpVerified: false,
      priority,
      assignedTo: assignedWorker || (issueData.type === 'private' ? null : representative),
      expectedResolution,
      escalationHistory: [],
      resolvedAt: null,
      customerCareNumber: '+91-1800-123-4567',
      type: issueData.type || 'public',
      preferredWorkerId: issueData.preferredWorkerId || null,
      estimatedBudget: issueData.estimatedBudget || null,
      userId: issueData.userId || null,
      paymentStatus: issueData.paymentStatus || (issueData.type === 'private' ? 'pending' : null),
    }
    this.issues.unshift(newIssue)
    this.saveIssues()
    return newIssue
  }

  getIssue(id) {
    return this.issues.find((issue) => issue.id === id)
  }

  getAllIssues() {
    return [...this.issues]
  }

  updateRepresentativeRating(repId, resolved) {
    const reps = this.getRepresentatives()
    const rep = reps.find((r) => r.id === repId)
    if (!rep) return
    if (resolved) {
      rep.resolvedCount++
      rep.pendingCount = Math.max(0, rep.pendingCount - 1)
      rep.rating = Math.min(5.0, rep.rating + 0.01)
    } else {
      rep.rating = Math.max(1.0, rep.rating - 0.1)
      rep.salary = Math.max(30000, rep.salary - 500)
      rep.pendingCount++
    }
    localStorage.setItem('civicPulseRepresentatives', JSON.stringify(reps))
  }

  updateIssueStatus(id, status) {
    const issue = this.getIssue(id)
    if (!issue) return null
    issue.status = status
    issue.updatedAt = new Date().toISOString()
    if (status === 'resolved') {
      issue.resolvedAt = new Date().toISOString()
      if (issue.assignedTo) this.updateRepresentativeRating(issue.assignedTo.id, true)
      if (issue.type === 'private' && issue.assignedTo && issue.paymentStatus !== 'paid') {
        const workers = this.authManager.getWorkers()
        const worker = workers.find((w) => w.id === issue.assignedTo.id)
        if (worker) {
          worker.completedJobs = (worker.completedJobs || 0) + 1
          this.authManager.saveWorkers(workers)
        }
      }
    }
    this.saveIssues()
    return issue
  }

  // Agent step 1: issue is routed/dispatched to a field agent or worker
  dispatchIssue(id) {
    return this.updateIssueStatus(id, 'dispatched')
  }

  // Agent step 2: work finished -> generate an OTP that the citizen shares to confirm
  requestCompletionOtp(id) {
    const issue = this.getIssue(id)
    if (!issue) return null
    issue.status = 'otp-verification'
    issue.otpVerified = false
    issue.otp = Math.floor(100000 + Math.random() * 900000).toString()
    issue.updatedAt = new Date().toISOString()
    this.saveIssues()
    return issue
  }

  // Agent step 3: agent types the OTP given by the citizen -> issue is resolved
  resolveWithOtp(id, otp) {
    if (!this.verifyOTP(id, String(otp || '').trim())) return false
    this.updateIssueStatus(id, 'resolved')
    return true
  }

  processPrivateWorkerPayment(issueId) {
    const issue = this.getIssue(issueId)
    if (!issue || issue.type !== 'private') return null
    issue.paymentStatus = 'paid'
    issue.updatedAt = new Date().toISOString()
    if (issue.assignedTo && issue.estimatedBudget) {
      const workers = this.authManager.getWorkers()
      const worker = workers.find((w) => w.id === issue.assignedTo.id)
      if (worker) {
        worker.earnings = (worker.earnings || 0) + issue.estimatedBudget
        this.authManager.saveWorkers(workers)
      }
    }
    this.saveIssues()
    return issue
  }

  escalateIssue(issueId, reason) {
    const issue = this.getIssue(issueId)
    if (!issue) return null
    issue.escalationHistory.push({ date: new Date().toISOString(), reason, escalatedBy: 'Higher Official' })
    if (issue.assignedTo) this.updateRepresentativeRating(issue.assignedTo.id, false)
    issue.assignedTo = { id: 'higher_official', name: 'Higher Official', phone: '+91-9999999999', email: 'official@civicpulse.gov' }
    issue.status = 'escalated'
    issue.updatedAt = new Date().toISOString()
    this.saveIssues()
    return issue
  }

  checkOverdueIssues() {
    const now = new Date()
    this.issues.forEach((issue) => {
      if (issue.status !== 'resolved' && issue.expectedResolution) {
        if (now > new Date(issue.expectedResolution) && issue.status !== 'escalated') {
          this.escalateIssue(issue.id, 'Issue not resolved within expected time frame')
        }
      }
    })
  }

  upvoteIssue(id) {
    const issue = this.getIssue(id)
    if (!issue) return null
    const index = issue.upvotedBy.indexOf(this.currentUser)
    if (index > -1) {
      issue.upvotedBy.splice(index, 1)
      issue.upvotes--
    } else {
      issue.upvotedBy.push(this.currentUser)
      issue.upvotes++
    }
    issue.priority = this.calculatePriority(issue.category, issue.description, issue.upvotes)
    issue.expectedResolution = this.calculateExpectedResolution(issue.priority)
    this.saveIssues()
    return issue
  }

  hasUserUpvoted(id) {
    const issue = this.getIssue(id)
    return issue ? issue.upvotedBy.includes(this.currentUser) : false
  }

  addComment(id, commentText) {
    const issue = this.getIssue(id)
    if (!issue) return null
    const comment = { id: 'comment_' + Date.now(), text: commentText, date: new Date().toISOString() }
    issue.comments.push(comment)
    issue.updatedAt = new Date().toISOString()
    this.saveIssues()
    return comment
  }

  filterIssues(category, status) {
    return this.issues.filter((issue) => {
      if (category && issue.category !== category) return false
      if (status && issue.status !== status) return false
      return true
    })
  }

  sortIssues(issues, sortBy) {
    const sorted = [...issues]
    if (sortBy === 'oldest') return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    if (sortBy === 'upvotes') return sorted.sort((a, b) => b.upvotes - a.upvotes)
    return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  getStats() {
    return {
      total: this.issues.length,
      open: this.issues.filter((i) => i.status === 'submitted' || i.status === 'open').length,
      inProgress: this.issues.filter((i) => i.status === 'dispatched' || i.status === 'in-progress').length,
      resolved: this.issues.filter((i) => i.status === 'resolved').length,
    }
  }

  getReviews() {
    const stored = localStorage.getItem('civicPulseReviews')
    if (stored) return JSON.parse(stored)
    return [
      { id: 'review_1', author: 'John Doe', rating: 5, text: 'Great platform! My issue was resolved quickly. Very satisfied with the service.', date: new Date(Date.now() - 86400000).toISOString() },
      { id: 'review_2', author: 'Jane Smith', rating: 4, text: 'Easy to use and track issues. The response time could be better, but overall good experience.', date: new Date(Date.now() - 172800000).toISOString() },
    ]
  }

  saveReviews(reviews) {
    localStorage.setItem('civicPulseReviews', JSON.stringify(reviews))
  }

  addReview(reviewData) {
    const reviews = this.getReviews()
    const newReview = {
      id: 'review_' + Date.now(),
      author: 'User',
      rating: parseInt(reviewData.rating, 10),
      text: reviewData.text,
      date: new Date().toISOString(),
    }
    reviews.unshift(newReview)
    this.saveReviews(reviews)
    return newReview
  }

  generateOTP(issueId) {
    const issue = this.getIssue(issueId)
    if (!issue) return null
    if (!issue.otp) {
      issue.otp = Math.floor(100000 + Math.random() * 900000).toString()
      this.saveIssues()
    }
    return issue.otp
  }

  verifyOTP(issueId, otp) {
    const issue = this.getIssue(issueId)
    if (issue && issue.otp === otp) {
      issue.otpVerified = true
      issue.status = 'otp-verification'
      this.saveIssues()
      return true
    }
    return false
  }
}

export const authManager = new AuthManager()
export const issueManager = new IssueManager(authManager)
