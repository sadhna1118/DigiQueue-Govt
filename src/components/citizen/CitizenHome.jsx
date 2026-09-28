import React, { useState } from "react";
import { useQueue } from "../../context/QueueContext";
import { getDepartmentCongestion } from "../../utils/waitTimeEstimator";
import {
  Search,
  PlusCircle,
  Smartphone,
  Clock,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MapPin,
  TrendingDown,
  Building2,
  Calendar,
  Layers,
  HelpCircle,
  ChevronDown,
  FileCheck
} from "lucide-react";

export const CitizenHome = () => {
  const {
    departments,
    tokens,
    counters,
    setIsBookModalOpen,
    setActiveView,
    setSelectedTrackTokenNumber,
    setActiveTokenModal
  } = useQueue();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFaq, setActiveFaq] = useState(null);

  // Filter departments or services based on search
  const filteredDepartments = departments.filter(dept => {
    const matchesDept = dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        dept.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesService = dept.services.some(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesDept || matchesService;
  });

  // Recent active waiting tokens
  const activeCitizenTokens = tokens.filter(t => t.status === "waiting" || t.status === "called" || t.status === "in_progress");

  const faqs = [
    {
      q: "How does the Digital Queue System reduce waiting time?",
      a: "Instead of standing in physical queues for hours, you receive a digital token with a specific time slot and live wait-time predictions. You can track your position from anywhere and arrive only when your turn is near."
    },
    {
      q: "What if I don't have a smartphone or internet?",
      a: "Government office entrances have Self-Service Touchscreen Kiosks. You can tap 3 buttons to get an instant paper token with your queue number and monitor the live TV display board."
    },
    {
      q: "How will I be alerted when my token is called?",
      a: "You will receive automated SMS text alerts when: (1) Your booking is confirmed, (2) You are next in line (approx 5-10 mins prior), and (3) Your token number is announced at the counter."
    },
    {
      q: "Can senior citizens or persons with disability get priority?",
      a: "Yes! When booking online or at the helpdesk kiosk, choose the 'Priority Assistance' category to receive expedited routing to Counter 08 (Accessible Special Care)."
    }
  ];

  return (
    <div className="citizen-page">
      {/* Hero Section */}
      <section className="citizen-hero">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={14} className="hero-sparkle" />
              <span>DIGITAL INDIA INITIATIVE • SEVA QUEUE 2.0</span>
            </div>

            <h1 className="hero-title">
              Skip Long Physical Queues. <br />
              <span className="gradient-text">Book & Track Online Tokens</span> in Real-Time.
            </h1>

            <p className="hero-description">
              Experience transparent, hassle-free public service delivery. Book digital appointments,
              receive accurate AI-powered wait-time predictions, and get SMS alerts when your counter is ready.
            </p>

            {/* Quick Hero Search */}
            <div className="hero-search-bar">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search services (e.g. Driving License, Property Tax, Caste Certificate, Passport)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hero-search-input"
              />
              {searchQuery && (
                <button className="btn-clear-search" onClick={() => setSearchQuery("")}>
                  Clear
                </button>
              )}
            </div>

            {/* Hero Quick CTA Action Buttons */}
            <div className="hero-cta-buttons">
              <button className="btn-hero-primary" onClick={() => setIsBookModalOpen(true)}>
                <PlusCircle size={18} />
                <span>Book Online Token Now</span>
              </button>

              <button
                className="btn-hero-secondary"
                onClick={() => {
                  setSelectedTrackTokenNumber("REV-103");
                  setActiveView("tracker");
                }}
              >
                <Smartphone size={18} />
                <span>Track Live Token Status</span>
              </button>
            </div>

            {/* Hero KPI Stats Bar */}
            <div className="hero-stats-row">
              <div className="hero-stat-card">
                <div className="stat-number">
                  <TrendingDown size={20} className="stat-icon-green" />
                  <span>65%</span>
                </div>
                <div className="stat-label">Average Wait Time Reduction</div>
              </div>

              <div className="hero-stat-card">
                <div className="stat-number">
                  <Clock size={20} className="stat-icon-blue" />
                  <span>&lt; 12 mins</span>
                </div>
                <div className="stat-label">Average Service Turnaround</div>
              </div>

              <div className="hero-stat-card">
                <div className="stat-number">
                  <ShieldCheck size={20} className="stat-icon-purple" />
                  <span>100%</span>
                </div>
                <div className="stat-label">Queue Transparency & Zero Bribes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Tokens Quick Tracker Bar */}
      {activeCitizenTokens.length > 0 && (
        <section className="active-tokens-bar container">
          <div className="active-tokens-card">
            <div className="active-tokens-left">
              <span className="live-pulse-badge">LIVE ACTIVE QUEUE</span>
              <div>
                <strong>Active Tokens in System:</strong> {activeCitizenTokens.length} citizen(s) currently progressing
              </div>
            </div>
            <div className="active-tokens-pills">
              {activeCitizenTokens.slice(0, 3).map((t) => (
                <button
                  key={t.id}
                  className="active-token-pill"
                  onClick={() => {
                    setSelectedTrackTokenNumber(t.tokenNumber);
                    setActiveView("tracker");
                  }}
                >
                  <span className="pill-num">#{t.tokenNumber}</span>
                  <span className="pill-name">{t.citizenName}</span>
                  <span className={`pill-status status-${t.status}`}>
                    {t.status === "in_progress" ? "In Progress" : t.status === "called" ? "Called" : "Waiting"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Live Department Wait-Time Radar & Service Directory */}
      <section className="departments-section container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Public Service Departments & Live Load</h2>
            <p className="section-subtitle">
              Check real-time counter traffic and estimated waiting times before generating your token.
            </p>
          </div>
          <button className="btn-view-all" onClick={() => setActiveView("services")}>
            <span>View All Services & Document Checklist</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="dept-cards-grid">
          {filteredDepartments.map((dept) => {
            const congestion = getDepartmentCongestion(dept.id, tokens, counters);
            const deptTokens = tokens.filter(t => t.deptId === dept.id && t.status === "waiting");
            const deptActiveCounters = counters.filter(c => c.deptId === dept.id && c.status === "serving");

            return (
              <div key={dept.id} className="dept-overview-card" style={{ "--dept-accent": dept.color }}>
                <div className="dept-card-top">
                  <div className="dept-code-tag">{dept.code}</div>
                  <div
                    className="dept-congestion-tag"
                    style={{ color: congestion.color, backgroundColor: congestion.bg }}
                  >
                    <span className="congestion-dot" style={{ backgroundColor: congestion.color }}></span>
                    <span>{congestion.text}</span>
                  </div>
                </div>

                <h3 className="dept-title">{dept.name}</h3>
                <p className="dept-desc">{dept.description}</p>

                <div className="dept-location-info">
                  <MapPin size={14} />
                  <span>{dept.floor}</span>
                </div>

                {/* Dept Live Metrics */}
                <div className="dept-metrics-row">
                  <div className="dept-metric">
                    <span className="metric-val">{deptTokens.length}</span>
                    <span className="metric-lbl">In Queue</span>
                  </div>
                  <div className="dept-metric">
                    <span className="metric-val">{deptActiveCounters.length}</span>
                    <span className="metric-lbl">Active Counters</span>
                  </div>
                  <div className="dept-metric">
                    <span className="metric-val">~{dept.avgServiceTime}m</span>
                    <span className="metric-lbl">Avg Duration</span>
                  </div>
                </div>

                {/* Key Services Pills */}
                <div className="dept-services-preview">
                  {dept.services.slice(0, 3).map((srv) => (
                    <span key={srv.id} className="dept-srv-pill">
                      {srv.name}
                    </span>
                  ))}
                  {dept.services.length > 3 && (
                    <span className="dept-srv-pill more">+{dept.services.length - 3} more</span>
                  )}
                </div>

                {/* Card Action */}
                <button
                  className="btn-dept-book"
                  onClick={() => setIsBookModalOpen(true)}
                >
                  <PlusCircle size={16} />
                  <span>Book Token for {dept.code}</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">4 Simple Steps to Seamless Governance</h2>
            <p className="section-subtitle">
              How the Digital Queue System eliminates congestion and streamlines your visit.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number-badge">01</div>
              <div className="step-icon-wrap">
                <Calendar size={28} />
              </div>
              <h4>1. Book Online or at Kiosk</h4>
              <p>Select your required service and pick a convenient 30-minute arrival slot.</p>
            </div>

            <div className="step-card">
              <div className="step-number-badge">02</div>
              <div className="step-icon-wrap">
                <Smartphone size={28} />
              </div>
              <h4>2. Get Digital E-Token</h4>
              <p>Receive your unique QR token slip along with SMS confirmation & estimated wait time.</p>
            </div>

            <div className="step-card">
              <div className="step-number-badge">03</div>
              <div className="step-icon-wrap">
                <Clock size={28} />
              </div>
              <h4>3. Real-Time Tracking</h4>
              <p>Track live queue progression on your mobile and walk in right before your turn.</p>
            </div>

            <div className="step-card">
              <div className="step-number-badge">04</div>
              <div className="step-icon-wrap">
                <CheckCircle2 size={28} />
              </div>
              <h4>4. Direct Counter Service</h4>
              <p>Proceed straight to your assigned counter when called for swift document verification.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="faq-section container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Citizen Helpdesk & FAQs</h2>
            <p className="section-subtitle">Common queries regarding digital tokens, priority routing, and document checklists.</p>
          </div>
        </div>

        <div className="faq-list">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className={`faq-card ${isOpen ? "open" : ""}`} onClick={() => setActiveFaq(isOpen ? null : idx)}>
                <div className="faq-question-row">
                  <div className="faq-q-left">
                    <HelpCircle size={18} className="faq-icon" />
                    <span className="faq-question-text">{faq.q}</span>
                  </div>
                  <ChevronDown size={18} className={`faq-chevron ${isOpen ? "rotate" : ""}`} />
                </div>
                {isOpen && <div className="faq-answer-body">{faq.a}</div>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
