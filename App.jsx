import { useEffect, useMemo, useRef, useState } from 'react'
import { t, getLanguage, setLanguage as persistLanguage } from './lib/i18n'
import { authManager, issueManager } from './lib/store'
import {
  CATEGORIES,
  formatDate,
  getBotReply,
  JOB_ROLES,
  STATUS_LABELS,
  STATUS_MAP,
  STATUS_STEPS,
  starString,
} from './lib/utils'

const PAGES = ['home', 'track', 'submit', 'workers', 'agent', 'dashboard', 'reviews']

function App() {
  const [, setTick] = useState(0)
  const refresh = () => setTick((n) => n + 1)
  const [page, setPage] = useState(() => {
    const hash = window.location.hash.slice(1)
    return PAGES.includes(hash) ? hash : 'home'
  })
  const [lang, setLang] = useState(getLanguage())
  const [user, setUser] = useState(authManager.getCurrentUser())
  const [toast, setToast] = useState(null)
  const [authModal, setAuthModal] = useState(null)
  const [workerModal, setWorkerModal] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [issueModal, setIssueModal] = useState(null)
  const [commentIssueId, setCommentIssueId] = useState(null)
  const [trackPrefill, setTrackPrefill] = useState('')
  const [preferredWorker, setPreferredWorker] = useState('')

  useEffect(() => {
    issueManager.checkOverdueIssues()
  }, [])

  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash.slice(1)
      if (PAGES.includes(hash)) setPage(hash)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const go = (next) => {
    setPage(next)
    window.location.hash = next
    setMenuOpen(false)
    setNavOpen(false)
  }

  const changeLang = (value) => {
    persistLanguage(value)
    setLang(value)
  }

  const context = {
    t: (key) => t(key),
    lang,
    page,
    go,
    user,
    setUser,
    refresh,
    showToast,
    setAuthModal,
    setWorkerModal,
    setIssueModal,
    setCommentIssueId,
    setTrackPrefill,
    preferredWorker,
    setPreferredWorker,
  }

  return (
    <>
      <Navbar
        context={context}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        navOpen={navOpen}
        setNavOpen={setNavOpen}
        changeLang={changeLang}
      />
      {page === 'home' && <Home context={context} />}
      {page === 'track' && <Track context={context} prefill={trackPrefill} />}
      {page === 'submit' && <Submit context={context} />}
      {page === 'workers' && <Workers context={context} />}
      {page === 'agent' && <Agent context={context} />}
      {page === 'dashboard' && <Dashboard context={context} />}
      {page === 'reviews' && <Reviews context={context} />}

      {authModal && (
        <AuthModal
          type={authModal}
          context={context}
          onClose={() => setAuthModal(null)}
        />
      )}
      {workerModal && <WorkerRegisterModal context={context} onClose={() => setWorkerModal(false)} />}
      {issueModal && <IssueDetailModal issueId={issueModal} context={context} onClose={() => setIssueModal(null)} />}
      {commentIssueId && <CommentModal issueId={commentIssueId} context={context} onClose={() => setCommentIssueId(null)} />}
      {toast && (
        <div className={`toast show ${toast.type}`} role="alert">
          <span>{toast.message}</span>
        </div>
      )}
      <Chatbot />
    </>
  )
}

function Navbar({ context, menuOpen, setMenuOpen, navOpen, setNavOpen, changeLang }) {
  const { t, page, go, user, setUser, showToast, setAuthModal, setWorkerModal } = context
  const logout = () => {
    authManager.logout()
    setUser(null)
    showToast('Logged out', 'success')
    setMenuOpen(false)
  }

  const links = [
    ['home', t('home')],
    ['track', t('trackIssue')],
    ['submit', t('submitIssue')],
    ['workers', t('findWorkers')],
    ['agent', t('agentDashboard')],
    ['dashboard', t('dashboard')],
    ['reviews', t('reviews')],
  ]

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="nav-container">
        <div className="logo">
          <h1 className="logo-text">🏛️ CivicPulse</h1>
        </div>
        <div className="nav-right">
          <div className="language-selector">
            <select className="language-select" value={getLanguage()} onChange={(e) => changeLang(e.target.value)} aria-label="Change Language">
              <option value="en">English</option>
              <option value="hi">Hindi (हिंदी)</option>
              <option value="te">Telugu (తెలుగు)</option>
              <option value="ta">Tamil (தமிழ்)</option>
              <option value="kn">Kannada (ಕನ್ನಡ)</option>
            </select>
          </div>
          <div className="user-profile">
            {user ? (
              <button className="user-icon-btn" aria-label="User profile" title={user.name} onClick={() => setMenuOpen((v) => !v)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4"></circle>
                  <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"></path>
                </svg>
              </button>
            ) : (
              <div className="auth-buttons">
                <button className="btn btn-outline" onClick={() => setAuthModal('login')}>{t('login')}</button>
                <button className="btn btn-primary" onClick={() => setAuthModal('register')}>{t('register')}</button>
              </div>
            )}
          </div>
          <div className="menu-dropdown">
            <button className="menu-icon-btn" aria-label="Menu" onClick={() => setMenuOpen((v) => !v)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </button>
            <ul className={`dropdown-menu ${menuOpen ? 'active' : ''}`}>
              {links.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className={`dropdown-link ${page === id ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); go(id) }}>{label}</a>
                </li>
              ))}
              <li className="dropdown-divider"></li>
              <li>
                <a href="#worker" className="dropdown-link" onClick={(e) => { e.preventDefault(); setWorkerModal(true); setMenuOpen(false) }}>{t('registerAsWorker')}</a>
              </li>
              {user && (
                <li>
                  <a href="#logout" className="dropdown-link" id="logout-link" onClick={(e) => { e.preventDefault(); logout() }}>{t('logout')}</a>
                </li>
              )}
            </ul>
          </div>
        </div>
        <button className="nav-toggle" aria-label="Toggle navigation" onClick={() => setNavOpen((v) => !v)}>
          <span></span><span></span><span></span>
        </button>
        <ul className={`nav-menu ${navOpen ? 'active' : ''}`}>
          {links.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className={`nav-link ${page === id ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); go(id) }}>{label}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

function IssueCard({ issue, context }) {
  const { t, refresh, setIssueModal, setCommentIssueId } = context
  const hasUpvoted = issueManager.hasUserUpvoted(issue.id)
  const statusClass = `status-${issue.status}`
  const statusText = STATUS_LABELS[issue.status] || issue.status
  const categoryLabels = {
    infrastructure: t('infrastructure'),
    safety: t('safety'),
    environment: t('environment'),
    transportation: t('transportation'),
    utilities: t('utilities'),
    other: t('other'),
  }
  const priorityLabels = { critical: t('critical'), moderate: t('moderate'), minor: t('minor') }

  return (
    <div className="issue-card" role="button" tabIndex={0} onClick={() => setIssueModal(issue.id)} onKeyDown={(e) => { if (e.key === 'Enter') setIssueModal(issue.id) }}>
      {issue.image && <img src={issue.image} alt={issue.title} className="issue-image" />}
      <div className="issue-content">
        <div className="issue-header">
          <h3 className="issue-title">{issue.title}</h3>
          <div className="issue-badges">
            {issue.priority && <span className={`priority-badge priority-${issue.priority}`}>{priorityLabels[issue.priority]}</span>}
            <span className={`issue-status ${statusClass}`}>{statusText}</span>
          </div>
        </div>
        <p className="issue-description">{issue.description}</p>
        <div className="issue-meta">
          <span className="issue-category">{categoryLabels[issue.category] || issue.category}</span>
          <span>📍 {issue.location}</span>
          <span>📅 {formatDate(issue.createdAt)}</span>
        </div>
        {issue.assignedTo && (
          <div className="issue-assigned">
            <span>👤 {t('assignedTo')}: {issue.assignedTo.name}</span>
            {issue.expectedResolution && <span>⏰ {t('expectedResolution')}: {formatDate(issue.expectedResolution)}</span>}
          </div>
        )}
        <div className="issue-actions">
          <button className={`upvote-btn ${hasUpvoted ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); issueManager.upvoteIssue(issue.id); refresh() }}>
            👍 <span>{issue.upvotes}</span>
          </button>
          <button className="comment-btn" onClick={(e) => { e.stopPropagation(); setCommentIssueId(issue.id) }}>
            💬 {issue.comments.length} {t('comments')}
          </button>
        </div>
      </div>
    </div>
  )
}

function Home({ context }) {
  const stats = issueManager.getStats()
  const solved = issueManager.getAllIssues().filter((i) => i.status === 'resolved').slice(0, 6)
  const recent = issueManager.sortIssues(issueManager.getAllIssues(), 'newest').slice(0, 6)
  return (
    <section className="page active" role="main">
      <div className="container">
        <div className="hero">
          <h2>{context.t('welcome')}</h2>
          <p className="hero-subtitle">{context.t('subtitle')}</p>
          <div className="hero-stats">
            <div className="stat-card"><div className="stat-number">{stats.total}</div><div className="stat-label">{context.t('totalIssues')}</div></div>
            <div className="stat-card"><div className="stat-number">{stats.open}</div><div className="stat-label">{context.t('open')}</div></div>
            <div className="stat-card"><div className="stat-number">{stats.resolved}</div><div className="stat-label">{context.t('resolved')}</div></div>
          </div>
        </div>
        <div className="achievements-section">
          <h3>{context.t('achievements')}</h3>
          <div className="achievements-grid">
            {['🏆', '⚡', '🤝', '📍', '✅', '🌟'].map((icon, i) => (
              <div className="achievement-item" key={i}><span style={{ fontSize: '3rem' }}>{icon}</span></div>
            ))}
          </div>
        </div>
        <div className="solved-issues-section">
          <h3>{context.t('solvedIssues')}</h3>
          <div className="issues-grid">{solved.map((issue) => <IssueCard key={issue.id} issue={issue} context={context} />)}</div>
        </div>
        <div className="featured-issues">
          <h3>{context.t('recentIssues')}</h3>
          <div className="issues-grid">{recent.map((issue) => <IssueCard key={issue.id} issue={issue} context={context} />)}</div>
        </div>
      </div>
    </section>
  )
}

function Track({ context, prefill }) {
  const [id, setId] = useState(prefill || '')
  const [issue, setIssue] = useState(prefill ? issueManager.getIssue(prefill) : null)
  const [searched, setSearched] = useState(Boolean(prefill))

  useEffect(() => {
    if (prefill) {
      setId(prefill)
      setIssue(issueManager.getIssue(prefill) || null)
      setSearched(true)
    }
  }, [prefill])

  const search = () => {
    if (!id.trim()) {
      context.showToast('Please enter an Issue ID', 'error')
      return
    }
    setIssue(issueManager.getIssue(id.trim()) || null)
    setSearched(true)
  }

  const currentStep = issue ? (STATUS_MAP[issue.status] ?? 0) : 0

  return (
    <section className="page active">
      <div className="container">
        <h2>{context.t('trackIssue')}</h2>
        <div className="track-issue-form">
          <div className="form-group">
            <label>{context.t('enterIssueId')}</label>
            <input value={id} onChange={(e) => setId(e.target.value)} placeholder="Enter your issue ID to track status" />
            <button className="btn btn-primary" onClick={search}>{context.t('track')}</button>
          </div>
        </div>
        {searched && (
          <div className="track-result" style={{ display: 'block' }}>
            {!issue ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: 'var(--danger-color)' }}>Issue not found. Please check your Issue ID.</p>
                <a href="tel:+91-1800-123-4567" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>📞 Call Customer Care: +91-1800-123-4567</a>
              </div>
            ) : (
              <TrackDetails issue={issue} currentStep={currentStep} context={context} onRefresh={() => setIssue({ ...issueManager.getIssue(issue.id) })} />
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function TrackDetails({ issue, currentStep, context, onRefresh }) {
  const otp = issue.otp
  const addr = issue.addressDetails || {}
  return (
    <div className="track-progress">
      <h3>{issue.title}</h3>
      <div className="track-progress-bar">
        {STATUS_STEPS.map((step, index) => (
          <div key={step.key} className={`track-step ${index < currentStep ? 'completed' : index === currentStep ? 'active' : ''}`}>{index + 1}</div>
        ))}
      </div>
      <div className="track-step-labels">{STATUS_STEPS.map((s) => <span key={s.key}>{s.label}</span>)}</div>
      {issue.status === 'otp-verification' && !issue.otpVerified && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
          <h4>OTP Verification</h4>
          <p>The agent says the work is completed. Your OTP: <strong style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}>{otp}</strong></p>
          <p style={{ color: 'var(--text-secondary)' }}>Share this OTP with the agent only after you are satisfied with the work. The agent enters it to mark the issue Resolved.</p>
          <button className="btn btn-secondary" onClick={onRefresh}>Refresh status</button>
        </div>
      )}
      {(issue.status === 'submitted' || issue.status === 'open') && (
        <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Your issue is waiting to be dispatched to an agent.</p>
      )}
      {(issue.status === 'dispatched' || issue.status === 'in-progress' || issue.status === 'escalated') && (
        <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>An agent has been assigned and is working on your issue.</p>
      )}
      {issue.status === 'resolved' && (
        <div className="done-btn-container">
          <button className="btn btn-primary" onClick={() => { if (window.confirm('Are you satisfied with the resolution?')) { context.go('reviews'); context.showToast('Thank you for using CivicPulse!', 'success') } }}>Done</button>
        </div>
      )}
      <div className="track-issue-id" style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', margin: '1.5rem 0', textAlign: 'center' }}>
        <p>{context.t('issueId')}</p>
        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>{issue.id}</p>
      </div>
      {issue.image && <img src={issue.image} alt="" style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)' }} />}
      {issue.addressDetails && (
        <div className="track-address" style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', margin: '1.5rem 0' }}>
          <h4>{context.t('completeAddress')}</h4>
          {addr.houseNumber && <p><strong>House Number:</strong> {addr.houseNumber}</p>}
          {addr.streetName && <p><strong>Street Name:</strong> {addr.streetName}</p>}
          {addr.villageName && <p><strong>Village Name:</strong> {addr.villageName}</p>}
          {addr.mandal && <p><strong>Mandal:</strong> {addr.mandal}</p>}
          {addr.district && <p><strong>District:</strong> {addr.district}</p>}
          {addr.pincode && <p><strong>Pincode:</strong> {addr.pincode}</p>}
        </div>
      )}
      {issue.type === 'private' && issue.estimatedBudget && (
        <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '1.5rem', borderRadius: 'var(--radius-md)', margin: '1.5rem 0', color: 'white' }}>
          <h4 style={{ color: 'white' }}>💳 Payment Information</h4>
          <p>Estimated Budget: ₹{issue.estimatedBudget}</p>
          <p>Payment Status: {issue.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}</p>
          {issue.status === 'resolved' && issue.paymentStatus !== 'paid' && (
            <button className="btn btn-primary" style={{ marginTop: '1rem', background: 'white', color: '#10b981' }} onClick={() => {
              if (window.confirm(`Process payment of ₹${issue.estimatedBudget}?`)) {
                issueManager.processPrivateWorkerPayment(issue.id)
                context.showToast('Payment processed successfully!', 'success')
                context.refresh()
                onRefresh()
              }
            }}>💳 Pay Now (₹{issue.estimatedBudget})</button>
          )}
        </div>
      )}
      <div className="track-details" style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', margin: '1.5rem 0' }}>
        <h4>{context.t('issueDetails')}</h4>
        <p><strong>Title:</strong> {issue.title}</p>
        <p><strong>Description:</strong> {issue.description}</p>
        <p><strong>Category:</strong> {context.t(issue.category)}</p>
        <p><strong>Status:</strong> {STATUS_LABELS[issue.status]}</p>
      </div>
      {issue.assignedTo && (
        <div className="track-representative">
          <h4>{context.t('assignedTo')}</h4>
          <p><strong>{issue.assignedTo.name}</strong></p>
          <p>{context.t('phoneNumber')}: <a href={`tel:${issue.assignedTo.phone}`}>{issue.assignedTo.phone}</a></p>
        </div>
      )}
      <div style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'white' }}>
        <h4 style={{ color: 'white' }}>{context.t('callCustomerCare')}</h4>
        <a href="tel:+91-1800-123-4567" className="btn btn-primary" style={{ background: 'white', color: 'var(--primary-color)' }}>📞 +91-1800-123-4567</a>
      </div>
    </div>
  )
}

function AddressFields({ values, onChange }) {
  return (
    <div className="address-fields">
      <div className="address-row">
        <input className="address-field" placeholder="House Number" value={values.houseNumber} onChange={(e) => onChange({ ...values, houseNumber: e.target.value })} />
        <input className="address-field" placeholder="Street Name *" required value={values.streetName} onChange={(e) => onChange({ ...values, streetName: e.target.value })} />
      </div>
      <div className="address-row">
        <input className="address-field" placeholder="Village Name *" required value={values.villageName} onChange={(e) => onChange({ ...values, villageName: e.target.value })} />
        <input className="address-field" placeholder="Mandal *" required value={values.mandal} onChange={(e) => onChange({ ...values, mandal: e.target.value })} />
      </div>
      <div className="address-row">
        <input className="address-field" placeholder="District *" required value={values.district} onChange={(e) => onChange({ ...values, district: e.target.value })} />
        <input className="address-field" placeholder="Pincode *" required pattern="[0-9]{6}" maxLength={6} value={values.pincode} onChange={(e) => onChange({ ...values, pincode: e.target.value })} />
      </div>
    </div>
  )
}

const emptyAddress = { houseNumber: '', streetName: '', villageName: '', mandal: '', district: '', pincode: '' }

function Submit({ context }) {
  const [type, setType] = useState('public')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [address, setAddress] = useState(emptyAddress)
  const [location, setLocation] = useState('')
  const [coords, setCoords] = useState({ lat: null, lng: null })
  const [image, setImage] = useState(null)
  const [budget, setBudget] = useState('')
  const [submittedId, setSubmittedId] = useState(null)
  const [recording, setRecording] = useState(false)
  const recognitionRef = useRef(null)

  const workers = authManager.getWorkers()

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      context.showToast('Speech recognition is not supported in this browser', 'error')
      return
    }
    const rec = new SR()
    rec.lang = 'en-US'
    rec.onresult = (e) => setDescription((d) => (d ? d + ' ' : '') + e.results[0][0].transcript)
    rec.onend = () => setRecording(false)
    rec.onerror = () => { setRecording(false); context.showToast('Speech recognition error', 'error') }
    recognitionRef.current = rec
    rec.start()
    setRecording(true)
  }

  const readFile = (file) => new Promise((resolve) => {
    if (!file) return resolve(null)
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(file)
  })

  const submitPublic = async (e) => {
    e.preventDefault()
    const parts = [address.houseNumber, address.streetName, address.villageName, address.mandal, address.district, address.pincode].filter(Boolean)
    const fullAddress = parts.join(', ')
    const newIssue = issueManager.addIssue({
      title, description, category,
      location: location || fullAddress,
      lat: coords.lat, lng: coords.lng,
      image, addressDetails: address, type: 'public',
      userId: context.user?.id || null,
    })
    setSubmittedId(newIssue.id)
    context.refresh()
    context.showToast('Issue submitted successfully! ID: ' + newIssue.id, 'success')
  }

  const submitPrivate = async (e) => {
    e.preventDefault()
    if (!context.user) {
      context.showToast('Please login to submit a private issue', 'error')
      context.setAuthModal('login')
      return
    }
    const parts = [address.houseNumber, address.streetName, address.villageName, address.mandal, address.district, address.pincode].filter(Boolean)
    const newIssue = issueManager.addIssue({
      title, description, category,
      location: parts.join(', '),
      image, addressDetails: address, type: 'private',
      preferredWorkerId: context.preferredWorker || null,
      estimatedBudget: parseFloat(budget) || null,
      userId: context.user.id,
      paymentStatus: 'pending',
    })
    context.showToast('Private issue submitted! ID: ' + newIssue.id, 'success')
    context.setTrackPrefill(newIssue.id)
    context.go('track')
  }

  if (submittedId) {
    return (
      <section className="page active">
        <div className="container">
          <div className="submit-success" style={{ display: 'block' }}>
            <div className="success-message">
              <h3>{context.t('issueSubmitted')}</h3>
              <p>{context.t('issueSubmittedDesc')} <strong>{submittedId}</strong></p>
              <button className="btn btn-primary" onClick={() => { context.setTrackPrefill(submittedId); context.go('track') }}>Track Issue</button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="page active">
      <div className="container">
        <h2>{context.t('submitIssue')}</h2>
        <div className="issue-type-selector">
          <button className={`issue-type-btn ${type === 'public' ? 'active' : ''}`} onClick={() => setType('public')}>{context.t('publicIssue')}</button>
          <button className={`issue-type-btn ${type === 'private' ? 'active' : ''}`} onClick={() => setType('private')}>{context.t('privateIssue')}</button>
        </div>
        <form className="issue-form" onSubmit={type === 'public' ? submitPublic : submitPrivate}>
          <div className="form-group">
            <label>{context.t('title')} <span className="required">*</span></label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief description of the issue" />
          </div>
          <div className="form-group">
            <label>{context.t('description')} <span className="required">*</span></label>
            <div className="voice-recording-container">
              <button type="button" className="btn btn-secondary" onClick={startVoice}>🎤 {recording ? context.t('listening') : context.t('startRecording')}</button>
              {recording && <span className="voice-status">{context.t('listening')}</span>}
            </div>
            <textarea required rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide detailed information about the issue..." />
          </div>
          <div className="form-group">
            <label>{context.t('category')} <span className="required">*</span></label>
            <select required value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{context.t(c)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Address Details <span className="required">*</span></label>
            <AddressFields values={address} onChange={setAddress} />
            {type === 'public' && (
              <>
                <label>{context.t('searchLocation')}</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Search for a location on map" />
                <div className="map-container">
                  <div
                    className="map"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)', cursor: 'pointer' }}
                    onClick={() => {
                      if (!navigator.geolocation) {
                        context.showToast('Location is not supported in this browser. Please type the address.', 'error')
                        return
                      }
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          const { latitude: lat, longitude: lng } = pos.coords
                          setCoords({ lat, lng })
                          context.showToast(`Location captured: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, 'success')
                        },
                        () => context.showToast('Could not get your location. Allow location access or type the address.', 'error')
                      )
                    }}
                  >
                    {coords.lat ? `📍 ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : '📍 Click here to use my current location'}
                  </div>
                  <div className="map-instructions">Uses your device GPS (you can also just type the address above)</div>
                </div>
              </>
            )}
          </div>
          {type === 'private' && (
            <>
              <div className="form-group">
                <label>{context.t('selectWorker')}</label>
                <select value={context.preferredWorker} onChange={(e) => context.setPreferredWorker(e.target.value)}>
                  <option value="">None</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>{w.name} ({w.jobRole}) - {(w.rating || 0).toFixed(1)} ⭐</option>
                  ))}
                </select>
                <button type="button" className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={() => context.go('workers')}>{context.t('browseWorkers')}</button>
              </div>
              <div className="form-group">
                <label>{context.t('estimatedBudget')}</label>
                <input type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)} />
              </div>
            </>
          )}
          <div className="form-group">
            <label>{context.t('uploadIssue')}</label>
            <div className="upload-container">
              <input type="file" accept="image/*" onChange={async (e) => setImage(await readFile(e.target.files[0]))} />
            </div>
            {image && <div className="image-preview-container"><img src={image} alt="preview" className="image-preview" style={{ display: 'block' }} /></div>}
          </div>
          <button type="submit" className="btn btn-primary">{context.t('submit')}</button>
        </form>
      </div>
    </section>
  )
}

function Workers({ context }) {
  const [role, setRole] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const workers = useMemo(() => {
    let list = authManager.getWorkers()
    if (role) list = list.filter((w) => w.jobRole === role)
    return [...list].sort((a, b) => {
      if (sortBy === 'completed') return (b.completedJobs || 0) - (a.completedJobs || 0)
      if (sortBy === 'experience') return (b.experience || 0) - (a.experience || 0)
      return (b.rating || 0) - (a.rating || 0)
    })
  }, [role, sortBy, context])

  const labels = { electrician: context.t('electrician'), plumber: context.t('plumber'), carpenter: context.t('carpenter'), painter: context.t('painter'), mechanic: context.t('mechanic'), cleaner: context.t('cleaner'), gardener: context.t('gardener'), appliance_repair: context.t('applianceRepair') }

  return (
    <section className="page active">
      <div className="container">
        <h2>{context.t('findWorkers')}</h2>
        <div className="workers-filter">
          <div className="filter-group">
            <label>{context.t('filterByJobRole')}</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">All Job Roles</option>
              {JOB_ROLES.map((r) => <option key={r} value={r}>{labels[r] || r}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>{context.t('sortBy') === 'sortBy' ? 'Sort by' : context.t('sortBy')}</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="rating">{context.t('highestRating')}</option>
              <option value="completed">{context.t('mostCompleted')}</option>
              <option value="experience">{context.t('mostExperienced')}</option>
            </select>
          </div>
        </div>
        <div className="workers-grid">
          {workers.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No workers found.</p>}
          {workers.map((worker) => (
            <div className="worker-card" key={worker.id}>
              <div className="worker-header">
                <h3>{worker.name}</h3>
                <div className="worker-rating">
                  <span className="rating-stars">{starString(worker.rating)}</span>
                  <span className="rating-value">{(worker.rating || 0).toFixed(1)}</span>
                </div>
              </div>
              <div className="worker-details">
                <p className="worker-job-role">{labels[worker.jobRole] || worker.jobRole}</p>
                <p>Experience: {worker.experience || 0} years</p>
                <p>Completed Jobs: {worker.completedJobs || 0}</p>
                <p>Total Earnings: ₹{(worker.earnings || 0).toLocaleString('en-IN')}</p>
                <p>📞 {worker.phone}</p>
                {worker.address && <p>📍 {worker.address}</p>}
              </div>
              <div className="worker-actions">
                <button className="btn btn-primary btn-sm" onClick={() => {
                  context.setPreferredWorker(worker.id)
                  context.go('submit')
                  context.showToast('Worker selected!', 'success')
                }}>Select Worker</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Agent({ context }) {
  const [id, setId] = useState('')
  const [issue, setIssue] = useState(null)
  const [searched, setSearched] = useState(false)
  const [otpInput, setOtpInput] = useState('')
  const search = () => {
    if (!id.trim()) {
      context.showToast('Please enter a Work ID or Issue ID', 'error')
      return
    }
    setIssue(issueManager.getIssue(id.trim()) || null)
    setOtpInput('')
    setSearched(true)
  }
  const reload = () => {
    setIssue({ ...issueManager.getIssue(issue.id) })
    context.refresh()
  }
  const dispatch = () => {
    issueManager.dispatchIssue(issue.id)
    context.showToast('Issue marked as Dispatched', 'success')
    reload()
  }
  const completeWork = () => {
    issueManager.requestCompletionOtp(issue.id)
    context.showToast('OTP generated. The citizen can see it on the Track Issue page.', 'success')
    reload()
  }
  const verifyOtp = () => {
    if (issueManager.resolveWithOtp(issue.id, otpInput)) {
      context.showToast('OTP verified. Issue resolved!', 'success')
      setOtpInput('')
      reload()
    } else {
      context.showToast('Wrong OTP. Ask the citizen for the correct OTP.', 'error')
    }
  }
  return (
    <section className="page active">
      <div className="container">
        <h2>{context.t('agentDashboard')}</h2>
        <div className="agent-search-section">
          <div className="form-group">
            <label>{context.t('enterWorkId')}</label>
            <input value={id} onChange={(e) => setId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} placeholder="Enter Work ID to view complaint details" />
            <button className="btn btn-primary" onClick={search}>{context.t('search')}</button>
          </div>
        </div>
        {searched && (
          <div className="agent-result" style={{ display: 'block' }}>
            {!issue ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: 'var(--danger-color)' }}>Issue not found. Please check the Work ID.</p>
                <a href="tel:+91-1800-123-4567" className="btn btn-primary">📞 Call Customer Care: +91-1800-123-4567</a>
              </div>
            ) : (
              <div className="agent-issue-details">
                <div className="agent-issue-header">
                  <h3>{issue.title}</h3>
                  <span className={`issue-status status-${issue.status}`}>{STATUS_LABELS[issue.status]}</span>
                </div>
                <div className="agent-issue-info">
                  <div className="info-section"><h4>Issue ID</h4><p className="issue-id-display">{issue.id}</p></div>
                  <div className="info-section"><h4>Description</h4><p>{issue.description}</p></div>
                  <div className="info-section"><h4>Category</h4><p>{context.t(issue.category)}</p></div>
                  {issue.assignedTo && <div className="info-section"><h4>Assigned To</h4><p><strong>{issue.assignedTo.name}</strong><br />Phone: <a href={`tel:${issue.assignedTo.phone}`}>{issue.assignedTo.phone}</a></p></div>}
                </div>
                {issue.image && <img src={issue.image} alt="" style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)' }} />}
                {issue.status !== 'resolved' && (
                  <div className="info-section" style={{ margin: '1rem 0' }}>
                    <h4>Agent Actions</h4>
                    {(issue.status === 'submitted' || issue.status === 'open') && (
                      <button className="btn btn-primary" onClick={dispatch}>🚚 Mark as Dispatched</button>
                    )}
                    {(issue.status === 'dispatched' || issue.status === 'in-progress' || issue.status === 'escalated') && (
                      <button className="btn btn-primary" onClick={completeWork}>✅ Work Completed – Generate OTP</button>
                    )}
                    {issue.status === 'otp-verification' && (
                      <div className="form-group">
                        <label>Enter the OTP given by the citizen</label>
                        <input value={otpInput} onChange={(e) => setOtpInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && verifyOtp()} placeholder="6-digit OTP" maxLength={6} inputMode="numeric" />
                        <button className="btn btn-primary" onClick={verifyOtp}>Verify OTP &amp; Resolve</button>
                      </div>
                    )}
                  </div>
                )}
                <div className="agent-actions"><a href="tel:+91-1800-123-4567" className="btn btn-primary">📞 Call Customer Care: +91-1800-123-4567</a></div>
              </div>
            )}
          </div>
        )}
        <div className="agent-help-section">
          <div className="help-card">
            <h3>Customer Care</h3>
            <p>Need help? Contact our customer care team</p>
            <a href="tel:+91-1800-123-4567" className="btn btn-primary">📞 Call Customer Care: +91-1800-123-4567</a>
          </div>
          <div className="help-card">
            <h3>{context.t('howToUse')}</h3>
            <ul>
              <li>{context.t('helpStep1')}</li>
              <li>{context.t('helpStep2')}</li>
              <li>{context.t('helpStep3')}</li>
              <li>{context.t('helpStep4')}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function Dashboard({ context }) {
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const issues = issueManager.sortIssues(issueManager.filterIssues(category, status), sortBy)
  return (
    <section className="page active">
      <div className="container">
        <h2>Issues Dashboard</h2>
        <div className="filters">
          <div className="filter-group">
            <label>Filter by Category:</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{context.t(c)}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Filter by Status:</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="submitted">Submitted</option>
              <option value="dispatched">Dispatched</option>
              <option value="in-progress">In Progress</option>
              <option value="otp-verification">OTP Verification</option>
              <option value="escalated">Escalated</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="upvotes">Most Upvoted</option>
            </select>
          </div>
        </div>
        <div className="issues-grid">{issues.map((issue) => <IssueCard key={issue.id} issue={issue} context={context} />)}</div>
        {issues.length === 0 && <div className="no-issues" style={{ display: 'block' }}><p>No issues found matching your filters.</p></div>}
      </div>
    </section>
  )
}

function Reviews({ context }) {
  const reviews = issueManager.getReviews()
  const [rating, setRating] = useState('')
  const [text, setText] = useState('')
  return (
    <section className="page active">
      <div className="container">
        <h2>{context.t('reviews')}</h2>
        <div className="reviews-section">
          <div className="reviews-list">
            {reviews.map((review) => (
              <div className="review-item" key={review.id}>
                <div className="review-header">
                  <div>
                    <div className="review-author">{review.author}</div>
                    <div className="review-date">{formatDate(review.date)}</div>
                  </div>
                  <div className="review-rating">{starString(review.rating)}</div>
                </div>
                <div className="review-text">{review.text}</div>
              </div>
            ))}
          </div>
          <div className="review-form-section">
            <h3>{context.t('submitReview')}</h3>
            <form className="review-form" onSubmit={(e) => {
              e.preventDefault()
              if (!rating || !text.trim()) {
                context.showToast('Please fill in all fields', 'error')
                return
              }
              issueManager.addReview({ rating, text: text.trim() })
              context.showToast('Review submitted successfully!', 'success')
              setRating(''); setText(''); context.refresh()
            }}>
              <div className="form-group">
                <label>{context.t('rating')}</label>
                <select required value={rating} onChange={(e) => setRating(e.target.value)}>
                  <option value="">Select Rating</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              <div className="form-group">
                <label>{context.t('yourReview')}</label>
                <textarea required rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder={context.t('shareExperience')} />
              </div>
              <button className="btn btn-primary" type="submit">{context.t('submit')}</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

function AuthModal({ type, context, onClose }) {
  const isLogin = type === 'login'
  return (
    <div className="auth-modal active" role="dialog">
      <div className="auth-modal-content">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>{isLogin ? context.t('login') : context.t('register')}</h2>
        {isLogin ? (
          <form className="auth-form" onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.target)
            const result = authManager.login(fd.get('email'), fd.get('password'))
            if (result.success) {
              context.setUser(result.user)
              onClose()
              context.showToast('Login successful!', 'success')
            } else context.showToast(result.message, 'error')
          }}>
            <div className="form-group"><label>{context.t('emailOrPhone')}</label><input name="email" required /></div>
            <div className="form-group"><label>{context.t('password')}</label><input type="password" name="password" required /></div>
            <button className="btn btn-primary btn-block" type="submit">{context.t('login')}</button>
            <p className="auth-switch">{context.t('dontHaveAccount')} <a href="#register" onClick={(e) => { e.preventDefault(); context.setAuthModal('register') }}>{context.t('register')}</a></p>
          </form>
        ) : (
          <form className="auth-form" onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.target)
            if (fd.get('password') !== fd.get('confirmPassword')) {
              context.showToast('Passwords do not match', 'error')
              return
            }
            const userData = { name: fd.get('name'), email: fd.get('email') || null, phone: fd.get('phone') || null, password: fd.get('password') }
            if (!userData.email && !userData.phone) {
              context.showToast('Please provide either email or phone number', 'error')
              return
            }
            const result = authManager.register(userData)
            if (result.success) {
              context.setUser(result.user)
              onClose()
              context.showToast('Registration successful!', 'success')
            } else context.showToast(result.message, 'error')
          }}>
            <div className="form-group"><label>{context.t('fullName')}</label><input name="name" required /></div>
            <div className="form-group"><label>{context.t('email')}</label><input type="email" name="email" /></div>
            <div className="form-group"><label>{context.t('phoneNumber')}</label><input name="phone" pattern="[0-9]{10}" /></div>
            <div className="form-group"><label>{context.t('password')}</label><input type="password" name="password" required minLength={6} /></div>
            <div className="form-group"><label>{context.t('confirmPassword')}</label><input type="password" name="confirmPassword" required /></div>
            <button className="btn btn-primary btn-block" type="submit">{context.t('register')}</button>
            <p className="auth-switch">{context.t('alreadyHaveAccount')} <a href="#login" onClick={(e) => { e.preventDefault(); context.setAuthModal('login') }}>{context.t('login')}</a></p>
          </form>
        )}
      </div>
    </div>
  )
}

function WorkerRegisterModal({ context, onClose }) {
  return (
    <div className="auth-modal active">
      <div className="auth-modal-content">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>{context.t('registerAsWorker')}</h2>
        <form className="auth-form" onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.target)
          const result = authManager.registerWorker({
            name: fd.get('name'), phone: fd.get('phone'), email: fd.get('email'),
            jobRole: fd.get('jobRole'), experience: Number(fd.get('experience') || 0),
            address: fd.get('address'), password: fd.get('password'),
          })
          if (result.success) {
            context.showToast('Worker registered successfully!', 'success')
            context.refresh()
            onClose()
          } else context.showToast(result.message, 'error')
        }}>
          <div className="form-group"><label>{context.t('fullName')}</label><input name="name" required /></div>
          <div className="form-group"><label>{context.t('phoneNumber')} <span className="required">*</span></label><input name="phone" required pattern="[0-9]{10}" /></div>
          <div className="form-group"><label>{context.t('email')}</label><input type="email" name="email" /></div>
          <div className="form-group">
            <label>{context.t('jobRole')} <span className="required">*</span></label>
            <select name="jobRole" required>
              <option value="">Select Job Role</option>
              {JOB_ROLES.map((r) => <option key={r} value={r}>{context.t(r === 'appliance_repair' ? 'applianceRepair' : r)}</option>)}
            </select>
          </div>
          <div className="form-group"><label>{context.t('experience')}</label><input type="number" name="experience" min="0" /></div>
          <div className="form-group"><label>{context.t('address')}</label><textarea name="address" rows={3} /></div>
          <div className="form-group"><label>{context.t('password')}</label><input type="password" name="password" required minLength={6} /></div>
          <button className="btn btn-primary btn-block" type="submit">{context.t('register')}</button>
        </form>
      </div>
    </div>
  )
}

function IssueDetailModal({ issueId, context, onClose }) {
  const issue = issueManager.getIssue(issueId)
  if (!issue) return null
  const currentStep = STATUS_MAP[issue.status] ?? 0
  return (
    <div className="modal active" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <div id="modal-body">
          {issue.image && <img src={issue.image} alt="" className="modal-issue-image" />}
          <h2 className="modal-issue-title">{issue.title}</h2>
          <div className="modal-issue-meta">
            <span className={`issue-status status-${issue.status}`}>{STATUS_LABELS[issue.status]}</span>
            <span className="issue-category">{context.t(issue.category)}</span>
            {issue.priority && <span className={`priority-badge priority-${issue.priority}`}>{context.t(issue.priority)}</span>}
          </div>
          <p className="modal-issue-description">{issue.description}</p>
          <div className="status-progress">
            {STATUS_STEPS.map((s, i) => <div key={s.key} className={`status-step ${i < currentStep ? 'completed' : i === currentStep ? 'active' : ''}`}>{i + 1}</div>)}
          </div>
          <div className="status-labels">{STATUS_STEPS.map((s) => <span key={s.key}>{s.label}</span>)}</div>
          {issue.assignedTo && (
            <div className="representative-info">
              <h4>{context.t('assignedTo')}</h4>
              <p>{issue.assignedTo.name}</p>
              <p><a href={`tel:${issue.assignedTo.phone}`}>{issue.assignedTo.phone}</a></p>
              {issue.expectedResolution && <p>{context.t('expectedResolution')}: {formatDate(issue.expectedResolution)}</p>}
            </div>
          )}
          {issue.status !== 'resolved' && (
            <div className="escalate-section">
              <button className="btn btn-warning" onClick={() => {
                const reason = window.prompt('Please provide a reason for escalation:')
                if (reason?.trim()) {
                  issueManager.escalateIssue(issue.id, reason.trim())
                  context.showToast('Issue escalated successfully.', 'success')
                  context.refresh()
                }
              }}>Escalate Issue</button>
            </div>
          )}
          <div className="comments-section">
            <div className="comments-header">
              <h4>{context.t('comments')}</h4>
              <button className="btn btn-sm btn-secondary" onClick={() => context.setCommentIssueId(issue.id)}>{context.t('addComment')}</button>
            </div>
            <div className="comments-list">
              {issue.comments.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No comments yet.</p>}
              {issue.comments.map((c) => (
                <div className="comment-item" key={c.id}>
                  <p className="comment-text">{c.text}</p>
                  <span className="comment-date">{formatDate(c.date)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CommentModal({ issueId, context, onClose }) {
  const [text, setText] = useState('')
  return (
    <div className="modal active" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem' }}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h3>{context.t('addComment')}</h3>
        <form onSubmit={(e) => {
          e.preventDefault()
          issueManager.addComment(issueId, text.trim())
          context.showToast('Comment added', 'success')
          context.refresh()
          onClose()
        }}>
          <div className="form-group">
            <label>Your Comment</label>
            <textarea required rows={4} value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <button className="btn btn-primary" type="submit">Submit Comment</button>
        </form>
      </div>
    </div>
  )
}

function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ from: 'bot', text: 'Hi 👋, how can I help you with CivicPulse today?' }])
  const [input, setInput] = useState('')
  const boxRef = useRef(null)
  const send = () => {
    const userText = input.trim()
    if (!userText) return
    setMessages((m) => [...m, { from: 'user', text: userText }])
    setInput('')
    setTimeout(() => setMessages((m) => [...m, { from: 'bot', text: getBotReply(userText) }]), 700)
  }
  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight
  }, [messages])
  return (
    <div className="chatbot-container">
      {!open && <button className="chatbot-btn" onClick={() => setOpen(true)} aria-label="Open chatbot">💬</button>}
      <div className="chatbot-box" style={{ display: open ? 'flex' : 'none' }}>
        <div className="chatbot-header">
          <span>CivicPulse Assistant</span>
          <button onClick={() => setOpen(false)}>&times;</button>
        </div>
        <div className="chatbot-messages" ref={boxRef}>
          {messages.map((m, i) => <div key={i} className={m.from === 'bot' ? 'bot-msg' : 'user-msg'}>{m.text}</div>)}
        </div>
        <div className="chatbot-input">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Type your message..." />
          <button onClick={send}>Send</button>
        </div>
      </div>
    </div>
  )
}

export default App
