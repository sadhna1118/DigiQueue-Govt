import React, { useState, useEffect } from "react";
import { useQueue } from "../../context/QueueContext";
import {
  UserCheck,
  PhoneCall,
  BellRing,
  Play,
  CheckCircle2,
  SkipForward,
  Coffee,
  Power,
  Users,
  Clock,
  ArrowRightLeft,
  AlertCircle,
  FileText,
  Shield,
  Check,
  RotateCcw,
  Sparkles,
  MapPin,
  Send
} from "lucide-react";

export const StaffDashboard = () => {
  const {
    counters,
    selectedStaffCounterId,
    setSelectedStaffCounterId,
    tokens,
    departments,
    callNextToken,
    recallToken,
    startService,
    completeService,
    skipToken,
    transferToken,
    updateCounterStatus,
    showToast
  } = useQueue();

  const [serviceTimerSeconds, setServiceTimerSeconds] = useState(0);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [targetDeptId, setTargetDeptId] = useState("");
  const [skipReason, setSkipReason] = useState("Citizen not present at counter");
  const [isSkipModalOpen, setIsSkipModalOpen] = useState(false);
  const [serviceNotes, setServiceNotes] = useState("");

  const currentCounter = counters.find(c => c.id === selectedStaffCounterId) || counters[0];
  const currentServingToken = tokens.find(t => t.id === currentCounter?.currentTokenId);

  // Queue waiting for this counter's department
  const deptWaitingTokens = tokens.filter(
    t => t.deptId === currentCounter?.deptId && t.status === "waiting"
  );

  // Skipped tokens for this department (hold area)
  const deptSkippedTokens = tokens.filter(
    t => t.deptId === currentCounter?.deptId && t.status === "skipped"
  );

  // Active Service stopwatch timer
  useEffect(() => {
    let interval = null;
    if (currentServingToken && (currentServingToken.status === "in_progress" || currentServingToken.status === "called")) {
      const startTime = currentServingToken.startedAt
        ? new Date(currentServingToken.startedAt).getTime()
        : new Date(currentServingToken.calledAt || Date.now()).getTime();

      interval = setInterval(() => {
        const elapsedSec = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
        setServiceTimerSeconds(elapsedSec);
      }, 1000);
    } else {
      setServiceTimerSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentServingToken]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCallNext = () => {
    callNextToken(currentCounter.id);
  };

  const handleRecall = () => {
    recallToken(currentCounter.id);
  };

  const handleStart = () => {
    startService(currentCounter.id);
  };

  const handleComplete = () => {
    completeService(currentCounter.id, 5, serviceNotes);
    setServiceNotes("");
  };

  const handleSkipConfirm = () => {
    skipToken(currentCounter.id, skipReason);
    setIsSkipModalOpen(false);
  };

  const handleTransferSubmit = () => {
    if (currentServingToken && targetDeptId) {
      transferToken(currentServingToken.id, targetDeptId);
      setIsTransferOpen(false);
    }
  };

  const handleBreakToggle = () => {
    const newStatus = currentCounter.status === "break" ? "serving" : "break";
    updateCounterStatus(currentCounter.id, newStatus);
  };

  return (
    <div className="staff-page container">
      {/* Staff Top Bar & Counter Switcher */}
      <div className="staff-header-card">
        <div className="staff-profile-left">
          <div className="staff-avatar-badge">
            <UserCheck size={28} />
          </div>
          <div>
            <div className="staff-role-badge">OFFICER CONSOLE</div>
            <h2>{currentCounter.staffName}</h2>
            <p className="staff-designation">
              {currentCounter.staffRole} • <strong>Counter {currentCounter.number}</strong> ({currentCounter.deptCode})
            </p>
          </div>
        </div>

        {/* Counter Selection Dropdown & Break Status */}
        <div className="staff-header-actions">
          <div className="counter-switch-box">
            <label className="switch-lbl">Assigned Counter:</label>
            <select
              className="gov-select staff-select"
              value={selectedStaffCounterId}
              onChange={(e) => setSelectedStaffCounterId(e.target.value)}
            >
              {counters.map((c) => (
                <option key={c.id} value={c.id}>
                  Counter {c.number} — {c.name.split("—")[1] || c.deptCode} ({c.staffName})
                </option>
              ))}
            </select>
          </div>

          <button
            className={`btn-break-toggle ${currentCounter.status === "break" ? "on-break" : ""}`}
            onClick={handleBreakToggle}
          >
            <Coffee size={16} />
            <span>{currentCounter.status === "break" ? "Resume Serving" : "Take Break"}</span>
          </button>
        </div>
      </div>

      {/* Main Staff Work Area */}
      <div className="staff-grid-layout">
        {/* Left Column: Active Serving Console */}
        <div className="staff-serving-column">
          {/* Active Serving Card */}
          <div className={`active-serving-box ${currentCounter.status}`}>
            <div className="serving-box-header">
              <div className="serving-box-title">
                <span className="live-pulse-dot"></span>
                <h3>ACTIVE CITIZEN SERVICE DESK</h3>
              </div>
              <div className="service-timer-pill">
                <Clock size={15} />
                <span>Elapsed: <strong>{formatTimer(serviceTimerSeconds)}</strong></span>
              </div>
            </div>

            {currentServingToken ? (
              <div className="serving-citizen-card">
                <div className="serving-top-details">
                  <div className="serving-token-badge">
                    <span className="token-lbl">TOKEN NUMBER</span>
                    <div className="big-token-text">{currentServingToken.tokenNumber}</div>
                    {currentServingToken.isPriority && (
                      <span className="priority-tag-gold">
                        ⭐ PRIORITY ({currentServingToken.priorityReason || "Fast-Track"})
                      </span>
                    )}
                  </div>

                  <div className="serving-citizen-meta">
                    <div className="meta-field">
                      <span className="lbl">Citizen Full Name</span>
                      <span className="val">{currentServingToken.citizenName}</span>
                    </div>
                    <div className="meta-field">
                      <span className="lbl">Contact Mobile</span>
                      <span className="val">{currentServingToken.phone}</span>
                    </div>
                    <div className="meta-field">
                      <span className="lbl">Service Requested</span>
                      <span className="val highlight">{currentServingToken.serviceName}</span>
                    </div>
                    <div className="meta-field">
                      <span className="lbl">Slot Window</span>
                      <span className="val">{currentServingToken.slotTime}</span>
                    </div>
                  </div>
                </div>

                {/* Service Notes */}
                <div className="staff-notes-field">
                  <label className="notes-lbl">Officer Action Notes / Verification Remarks:</label>
                  <input
                    type="text"
                    placeholder="e.g. Original documents verified, biometric captured, approved."
                    value={serviceNotes}
                    onChange={(e) => setServiceNotes(e.target.value)}
                    className="gov-input"
                  />
                </div>

                {/* Action Buttons Matrix */}
                <div className="staff-actions-grid">
                  <button className="btn-staff-action recall" onClick={handleRecall}>
                    <BellRing size={16} />
                    <span>Recall / Bell</span>
                  </button>

                  {currentServingToken.status === "called" ? (
                    <button className="btn-staff-action start" onClick={handleStart}>
                      <Play size={16} />
                      <span>Start Service</span>
                    </button>
                  ) : (
                    <button className="btn-staff-action complete" onClick={handleComplete}>
                      <CheckCircle2 size={16} />
                      <span>Mark Completed</span>
                    </button>
                  )}

                  <button
                    className="btn-staff-action skip"
                    onClick={() => setIsSkipModalOpen(true)}
                  >
                    <SkipForward size={16} />
                    <span>Skip / No Show</span>
                  </button>

                  <button
                    className="btn-staff-action transfer"
                    onClick={() => setIsTransferOpen(true)}
                  >
                    <ArrowRightLeft size={16} />
                    <span>Transfer</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-serving-state">
                <div className="empty-icon-circle">
                  <Users size={36} />
                </div>
                <h4>Counter is Ready & Idle</h4>
                <p>
                  {deptWaitingTokens.length > 0
                    ? `${deptWaitingTokens.length} citizen(s) waiting in queue for ${currentCounter.deptCode}. Click below to call next.`
                    : "No citizens currently waiting for this department."}
                </p>

                <button
                  className="btn-call-next-hero"
                  disabled={deptWaitingTokens.length === 0 || currentCounter.status === "break"}
                  onClick={handleCallNext}
                >
                  <PhoneCall size={20} />
                  <span>📢 Call Next Citizen in Queue</span>
                </button>
              </div>
            )}
          </div>

          {/* Officer Session Metrics */}
          <div className="staff-kpi-row">
            <div className="kpi-mini-card">
              <span className="kpi-mini-lbl">Tokens Served Today</span>
              <div className="kpi-mini-val">{currentCounter.servedToday || 0}</div>
            </div>
            <div className="kpi-mini-card">
              <span className="kpi-mini-lbl">Avg Handling Time</span>
              <div className="kpi-mini-val">{currentCounter.avgServiceTimeMins || 9.2}m</div>
            </div>
            <div className="kpi-mini-card">
              <span className="kpi-mini-lbl">Department Load</span>
              <div className="kpi-mini-val">{deptWaitingTokens.length} Waiting</div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Waiting Queue & Skipped Holding Drawer */}
        <div className="staff-queue-column">
          <div className="staff-queue-card">
            <div className="queue-card-header">
              <div className="header-left">
                <Users size={18} />
                <h4>Department Live Queue ({currentCounter.deptCode})</h4>
              </div>
              <span className="queue-count-badge">{deptWaitingTokens.length} Waiting</span>
            </div>

            <div className="staff-queue-list">
              {deptWaitingTokens.length === 0 ? (
                <div className="queue-empty-msg">
                  <p>Queue is empty for this department.</p>
                </div>
              ) : (
                deptWaitingTokens.map((t, idx) => (
                  <div key={t.id} className="staff-queue-item">
                    <div className="item-left-num">#{idx + 1}</div>
                    <div className="item-main-info">
                      <div className="item-token-header">
                        <strong className="item-token-code">{t.tokenNumber}</strong>
                        {t.isPriority && <span className="item-priority-pill">★ PRIORITY</span>}
                      </div>
                      <div className="item-citizen-name">{t.citizenName}</div>
                      <div className="item-service-name">{t.serviceName}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Skipped / On Hold Citizens Area */}
          {deptSkippedTokens.length > 0 && (
            <div className="staff-skipped-card">
              <div className="skipped-header">
                <AlertCircle size={16} />
                <h4>Skipped / No-Show Holding ({deptSkippedTokens.length})</h4>
              </div>
              <div className="skipped-list">
                {deptSkippedTokens.map((t) => (
                  <div key={t.id} className="skipped-item">
                    <div>
                      <strong>#{t.tokenNumber}</strong> — {t.citizenName}
                      <p className="skipped-reason">{t.skippedReason || "No-show at counter"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Skip Confirmation Modal */}
      {isSkipModalOpen && (
        <div className="book-modal-overlay" onClick={() => setIsSkipModalOpen(false)}>
          <div className="reschedule-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title-wrap">
              <h3>Skip Token #{currentServingToken?.tokenNumber}</h3>
              <p>Select reason for skipping:</p>
            </div>

            <div className="my-4">
              <select
                className="gov-select"
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
              >
                <option value="Citizen not present at counter">Citizen not present at counter (No-show)</option>
                <option value="Missing mandatory original documents">Missing mandatory original documents</option>
                <option value="Citizen requested later slot">Citizen requested later slot</option>
              </select>
            </div>

            <div className="wizard-actions">
              <button className="btn-wizard-back" onClick={() => setIsSkipModalOpen(false)}>
                Cancel
              </button>
              <button className="btn-wizard-submit danger" onClick={handleSkipConfirm}>
                Confirm Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Token Modal */}
      {isTransferOpen && (
        <div className="book-modal-overlay" onClick={() => setIsTransferOpen(false)}>
          <div className="reschedule-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title-wrap">
              <h3>Transfer Token #{currentServingToken?.tokenNumber}</h3>
              <p>Re-route citizen to another department or specialized officer:</p>
            </div>

            <div className="my-4">
              <label className="form-label">Target Department:</label>
              <select
                className="gov-select"
                value={targetDeptId}
                onChange={(e) => setTargetDeptId(e.target.value)}
              >
                <option value="">Select Destination Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="wizard-actions">
              <button className="btn-wizard-back" onClick={() => setIsTransferOpen(false)}>
                Cancel
              </button>
              <button
                className="btn-wizard-submit"
                disabled={!targetDeptId}
                onClick={handleTransferSubmit}
              >
                Complete Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
