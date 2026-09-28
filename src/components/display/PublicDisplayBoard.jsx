import React, { useState, useEffect } from "react";
import { useQueue } from "../../context/QueueContext";
import { announcer } from "../../utils/audioAnnouncer";
import {
  Volume2,
  VolumeX,
  Clock,
  Radio,
  Maximize2,
  Minimize2,
  Sparkles,
  Users,
  BellRing,
  Layers,
  ChevronRight
} from "lucide-react";

export const PublicDisplayBoard = () => {
  const {
    counters,
    tokens,
    announcements,
    lastCalledToken,
    isAudioMuted,
    toggleAudio,
    departments
  } = useQueue();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("all");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Live Digital Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTestChime = () => {
    announcer.announceToken("REV-101", "01", "Rameshwar Prasad");
  };

  const toggleFullscreenMode = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Filter counters and waiting tokens
  const activeCounters = counters.filter(c => 
    selectedDeptFilter === "all" || c.deptId === selectedDeptFilter
  );

  const waitingTokens = tokens
    .filter(t => t.status === "waiting" && (selectedDeptFilter === "all" || t.deptId === selectedDeptFilter))
    .slice(0, 10);

  return (
    <div className={`tv-display-root ${isFullscreen ? "fullscreen-active" : ""}`}>
      {/* TV Header Bar */}
      <div className="tv-header">
        <div className="tv-brand">
          <div className="tv-gov-emblem">🏛️</div>
          <div className="tv-title-box">
            <h1 className="tv-main-title">INTEGRATED CITIZEN SEVA KENDRA</h1>
            <p className="tv-sub-title">Public Digital Queue Display • Central Waiting Hall</p>
          </div>
        </div>

        {/* Live Audio & Fullscreen Quick Controls */}
        <div className="tv-controls-strip">
          <button className="tv-action-btn" onClick={handleTestChime} title="Test Audio Announcement Chime">
            <BellRing size={16} />
            <span>Test Voice Chime</span>
          </button>

          <button className="tv-action-btn" onClick={toggleAudio}>
            {isAudioMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span>{isAudioMuted ? "Sound Muted" : "Voice Active"}</span>
          </button>

          <button className="tv-action-btn" onClick={toggleFullscreenMode}>
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen TV Mode"}</span>
          </button>

          {/* Live Digital Clock */}
          <div className="tv-clock-box">
            <Clock size={18} className="clock-icon-glow" />
            <div className="tv-time-text">
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            <div className="tv-date-text">
              {currentTime.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>
        </div>
      </div>

      {/* Department Quick Filter Pills */}
      <div className="tv-filter-strip">
        <button
          className={`tv-pill-btn ${selectedDeptFilter === "all" ? "active" : ""}`}
          onClick={() => setSelectedDeptFilter("all")}
        >
          All Counters (8)
        </button>
        {departments.map((dept) => (
          <button
            key={dept.id}
            className={`tv-pill-btn ${selectedDeptFilter === dept.id ? "active" : ""}`}
            onClick={() => setSelectedDeptFilter(dept.id)}
          >
            {dept.name}
          </button>
        ))}
      </div>

      {/* Main Grid: Split View (NOW SERVING 70% | UP NEXT 30%) */}
      <div className="tv-main-grid">
        {/* Left Side: NOW SERVING COUNTERS */}
        <div className="tv-counters-section">
          <div className="tv-section-title-bar">
            <div className="title-left">
              <span className="live-broadcast-dot"></span>
              <h2>NOW SERVING AT COUNTERS</h2>
            </div>
            <span className="tv-counter-count">{activeCounters.length} Counters Configured</span>
          </div>

          <div className="tv-counters-grid">
            {activeCounters.map((counter) => {
              const servingToken = tokens.find(t => t.id === counter.currentTokenId);
              const isNewlyCalled = lastCalledToken && lastCalledToken.id === counter.currentTokenId;

              return (
                <div
                  key={counter.id}
                  className={`tv-counter-card ${counter.status} ${isNewlyCalled ? "flash-call-anim" : ""}`}
                >
                  <div className="tv-counter-card-header">
                    <div className="tv-counter-num-badge">
                      COUNTER {counter.number}
                    </div>
                    <div className={`tv-counter-status-tag tag-${counter.status}`}>
                      {counter.status === "serving" ? "🟢 SERVING" : counter.status === "break" ? "☕ ON BREAK" : "⚪ IDLE"}
                    </div>
                  </div>

                  <div className="tv-counter-body">
                    {counter.status === "serving" && servingToken ? (
                      <div className="tv-serving-token-display">
                        <span className="tv-token-prefix">TOKEN NUMBER</span>
                        <div className="tv-big-token-num">{servingToken.tokenNumber}</div>
                        <div className="tv-citizen-name">{servingToken.citizenName}</div>
                        <div className="tv-service-name">{servingToken.serviceName}</div>
                      </div>
                    ) : counter.status === "break" ? (
                      <div className="tv-counter-empty">
                        <span className="empty-title">Counter on Scheduled Break</span>
                        <span className="empty-sub">Resumes in approx. 10 mins</span>
                      </div>
                    ) : (
                      <div className="tv-counter-empty">
                        <span className="empty-title">Ready for Next Citizen</span>
                        <span className="empty-sub">Officer: {counter.staffName}</span>
                      </div>
                    )}
                  </div>

                  <div className="tv-counter-card-footer">
                    <span className="tv-dept-label">{counter.name.split("—")[1] || counter.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: UP NEXT IN QUEUE */}
        <div className="tv-waitlist-section">
          <div className="tv-section-title-bar">
            <div className="title-left">
              <Users size={20} />
              <h2>UP NEXT IN QUEUE</h2>
            </div>
            <span className="tv-badge-count">{waitingTokens.length} Waiting</span>
          </div>

          <div className="tv-waitlist-box">
            {waitingTokens.length === 0 ? (
              <div className="tv-waitlist-empty">
                <p>No citizens currently in queue.</p>
                <span>Walk-in or online tokens will appear here.</span>
              </div>
            ) : (
              <div className="tv-waitlist-items">
                {waitingTokens.map((t, idx) => (
                  <div key={t.id} className="tv-queue-item">
                    <div className="tv-queue-pos">#{idx + 1}</div>
                    <div className="tv-queue-token-info">
                      <div className="tv-queue-token-num">
                        {t.tokenNumber}
                        {t.isPriority && <span className="tv-priority-star">★ PRIORITY</span>}
                      </div>
                      <div className="tv-queue-citizen">{t.citizenName}</div>
                      <div className="tv-queue-service">{t.serviceName}</div>
                    </div>
                    <div className="tv-queue-dept-tag">{t.deptCode}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Marquee Public Announcements Ticker */}
      <div className="tv-marquee-footer">
        <div className="tv-marquee-label">
          <Radio size={16} className="radio-pulse" />
          <span>ANNOUNCEMENTS</span>
        </div>
        <div className="tv-marquee-track">
          <div className="tv-marquee-content">
            {announcements.map((ann, idx) => (
              <span key={idx} className="marquee-msg-item">
                📢 {ann} &nbsp; &nbsp; • &nbsp; &nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
