import React from "react";
import { useQueue } from "../../context/QueueContext";
import {
  Users,
  Tv,
  UserCheck,
  ShieldCheck,
  Smartphone,
  PlusCircle,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Bell,
  Sun,
  Moon,
  BookOpen,
  Activity,
  Layers
} from "lucide-react";

export const Navbar = () => {
  const {
    activeView,
    setActiveView,
    setIsBookModalOpen,
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    notifications,
    isAudioMuted,
    toggleAudio,
    isSimulating,
    setIsSimulating,
    theme,
    setTheme,
    waitingTokensCount,
    activeCountersCount
  } = useQueue();

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="gov-header">
      {/* Top Gov Strip */}
      <div className="gov-top-strip">
        <div className="gov-top-strip-inner container">
          <div className="gov-seal-badge">
            <span className="gov-emblem-text">🏛️ Government of India • E-Governance Seva Portal</span>
            <span className="gov-live-dot"></span>
            <span className="gov-status-tag">DIGITAL QUEUE MANAGEMENT SYSTEM (DQMS)</span>
          </div>
          <div className="gov-top-metrics">
            <span className="metric-pill">
              <Activity size={12} className="metric-icon" />
              <strong>{activeCountersCount}</strong> Active Counters
            </span>
            <span className="metric-pill">
              <Users size={12} className="metric-icon" />
              <strong>{waitingTokensCount}</strong> Citizens in Queue
            </span>
            <span className="gov-portal-tag">Official Public Service Portal</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="gov-main-nav">
        <div className="container nav-container">
          {/* Brand Logo */}
          <div className="brand-logo" onClick={() => setActiveView("citizen")}>
            <div className="logo-icon-box">
              <Layers className="logo-icon" size={24} />
            </div>
            <div className="brand-info">
              <div className="brand-title">
                <span className="brand-highlight">DigiQueue</span> Gov
              </div>
              <div className="brand-subtitle">Smart Token & Real-time Public Queue System</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="nav-links">
            <button
              className={`nav-btn ${activeView === "citizen" ? "active" : ""}`}
              onClick={() => setActiveView("citizen")}
            >
              <Users size={16} />
              <span>Citizen Portal</span>
            </button>

            <button
              className={`nav-btn ${activeView === "tracker" ? "active" : ""}`}
              onClick={() => setActiveView("tracker")}
            >
              <Smartphone size={16} />
              <span>Live Tracker</span>
            </button>

            <button
              className={`nav-btn ${activeView === "display" ? "active" : ""}`}
              onClick={() => setActiveView("display")}
            >
              <Tv size={16} />
              <span className="nav-highlight-text">Waiting Hall TV</span>
            </button>

            <button
              className={`nav-btn ${activeView === "staff" ? "active" : ""}`}
              onClick={() => setActiveView("staff")}
            >
              <UserCheck size={16} />
              <span>Staff Counter</span>
            </button>

            <button
              className={`nav-btn ${activeView === "admin" ? "active" : ""}`}
              onClick={() => setActiveView("admin")}
            >
              <ShieldCheck size={16} />
              <span>Admin & KPIs</span>
            </button>

            <button
              className={`nav-btn ${activeView === "kiosk" ? "active" : ""}`}
              onClick={() => setActiveView("kiosk")}
            >
              <Layers size={16} />
              <span>Kiosk Mode</span>
            </button>

            <button
              className={`nav-btn ${activeView === "services" ? "active" : ""}`}
              onClick={() => setActiveView("services")}
            >
              <BookOpen size={16} />
              <span>Directory</span>
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="nav-actions">
            {/* Simulation Toggle */}
            <button
              className={`btn-sim ${isSimulating ? "sim-active" : ""}`}
              onClick={() => setIsSimulating(!isSimulating)}
              title={isSimulating ? "Pause live demo simulation" : "Start live queue demo simulation"}
            >
              {isSimulating ? <Pause size={14} /> : <Play size={14} />}
              <span>{isSimulating ? "Simulating Live" : "Simulate Traffic"}</span>
              {isSimulating && <span className="sim-pulse-dot"></span>}
            </button>

            {/* Audio Toggle */}
            <button
              className={`btn-icon ${!isAudioMuted ? "audio-on" : ""}`}
              onClick={toggleAudio}
              title={isAudioMuted ? "Unmute Public Chime & Voice" : "Mute Public Audio"}
            >
              {isAudioMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            {/* Simulated SMS & Email Notifications Drawer */}
            <button
              className="btn-icon btn-notification"
              onClick={() => setIsNotificationDrawerOpen(!isNotificationDrawerOpen)}
              title="View simulated citizen SMS & Email notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>

            {/* Theme Toggle */}
            <button
              className="btn-icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Book Token Primary CTA */}
            <button
              className="btn-primary-gov"
              onClick={() => setIsBookModalOpen(true)}
            >
              <PlusCircle size={16} />
              <span>Book Token</span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};
