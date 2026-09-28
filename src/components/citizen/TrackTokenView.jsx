import React, { useState } from "react";
import { useQueue } from "../../context/QueueContext";
import { calculateTokenWaitTime } from "../../utils/waitTimeEstimator";
import { TIME_SLOTS } from "../../data/initialData";
import {
  Search,
  CheckCircle2,
  Clock,
  Users,
  MapPin,
  Calendar,
  AlertTriangle,
  RotateCcw,
  XCircle,
  Printer,
  Smartphone,
  Sparkles,
  ArrowRight,
  Star,
  MessageSquare,
  ShieldCheck,
  UserCheck
} from "lucide-react";

export const TrackTokenView = () => {
  const {
    tokens,
    counters,
    departments,
    selectedTrackTokenNumber,
    setSelectedTrackTokenNumber,
    rescheduleToken,
    cancelToken,
    setActiveTokenModal,
    pushNotification,
    completeService,
    showToast
  } = useQueue();

  const [searchInput, setSearchInput] = useState(selectedTrackTokenNumber || "");
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [newSlot, setNewSlot] = useState(TIME_SLOTS[3]);
  const [userRating, setUserRating] = useState(5);
  const [userFeedback, setUserFeedback] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Find token by Token Number or Phone
  const currentToken = tokens.find(
    t => t.tokenNumber.toLowerCase() === (searchInput.trim().toLowerCase()) ||
         t.phone.includes(searchInput.trim()) ||
         t.tokenNumber.toLowerCase() === selectedTrackTokenNumber.toLowerCase()
  ) || tokens.find(t => t.status === "waiting" || t.status === "in_progress") || tokens[0];

  const waitMetrics = calculateTokenWaitTime(currentToken, tokens, counters, departments);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const match = tokens.find(
      t => t.tokenNumber.toLowerCase() === searchInput.trim().toLowerCase() ||
           t.phone.includes(searchInput.trim())
    );
    if (match) {
      setSelectedTrackTokenNumber(match.tokenNumber);
      showToast(`Found Token #${match.tokenNumber}`, "success");
    } else {
      showToast(`No token found for "${searchInput}". Try REV-101, REV-103, RTO-201`, "warning");
    }
  };

  const handleRescheduleSubmit = () => {
    if (currentToken) {
      rescheduleToken(currentToken.id, newSlot);
      setIsRescheduleOpen(false);
    }
  };

  const handleCancelClick = () => {
    if (window.confirm(`Are you sure you want to cancel Token #${currentToken.tokenNumber}?`)) {
      cancelToken(currentToken.id);
    }
  };

  const handleSendSimulatedSMS = () => {
    if (currentToken) {
      const msg = `DigiQueue Gov: Token #${currentToken.tokenNumber} is currently position #${waitMetrics.queuePosition}. Estimated turn in ~${waitMetrics.waitMins} mins at Counter 0${currentToken.counterNumber || "1"}.`;
      pushNotification(currentToken.phone, `Live Status (#${currentToken.tokenNumber})`, msg, "sms", currentToken.tokenNumber);
    }
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    showToast("Thank you! Your citizen satisfaction feedback has been recorded.", "success");
  };

  // Determine active step in progress bar (1 to 4)
  let activeStepNum = 1;
  if (currentToken?.status === "waiting") activeStepNum = 2;
  if (currentToken?.status === "called") activeStepNum = 3;
  if (currentToken?.status === "in_progress") activeStepNum = 3;
  if (currentToken?.status === "completed") activeStepNum = 4;
  if (currentToken?.status === "cancelled") activeStepNum = 0;

  return (
    <div className="track-page container">
      {/* Header & Quick Search Form */}
      <div className="track-header-card">
        <div className="track-header-top">
          <div>
            <span className="gov-track-badge">CITIZEN SELF-SERVICE TRACKER</span>
            <h2>Real-Time E-Governance Queue Monitor</h2>
            <p className="track-desc">Enter your Token Number or Registered Mobile Number to view live position and counter updates.</p>
          </div>

          {/* Quick Search Box */}
          <form onSubmit={handleSearchSubmit} className="track-search-form">
            <div className="track-input-wrap">
              <Search size={18} className="track-search-icon" />
              <input
                type="text"
                placeholder="Enter Token (e.g. REV-103) or Phone..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="track-input"
              />
            </div>
            <button type="submit" className="btn-track-submit">
              Track Status
            </button>
          </form>
        </div>

        {/* Quick Sample Token Selector Chips */}
        <div className="quick-token-chips">
          <span className="chips-label">Sample Active Tokens:</span>
          {tokens.slice(0, 6).map((t) => (
            <button
              key={t.id}
              className={`token-select-chip ${currentToken?.id === t.id ? "active" : ""}`}
              onClick={() => {
                setSearchInput(t.tokenNumber);
                setSelectedTrackTokenNumber(t.tokenNumber);
              }}
            >
              <strong>#{t.tokenNumber}</strong> ({t.status})
            </button>
          ))}
        </div>
      </div>

      {/* Main Tracker Card */}
      {currentToken && (
        <div className="tracker-main-card">
          {/* Top Token Summary Bar */}
          <div className="tracker-top-bar">
            <div className="tracker-token-id-box">
              <span className="tracker-label">TOKEN NUMBER</span>
              <div className="tracker-token-num">{currentToken.tokenNumber}</div>
              <div className="tracker-service-title">{currentToken.serviceName}</div>
            </div>

            <div className="tracker-status-box">
              <span className="tracker-label">CURRENT STATUS</span>
              <div className={`tracker-status-badge status-${currentToken.status}`}>
                {currentToken.status === "in_progress" && "▶️ In Progress (At Counter)"}
                {currentToken.status === "called" && "📢 Turn Called — Proceed Now!"}
                {currentToken.status === "waiting" && "⏳ In Queue (Waiting Turn)"}
                {currentToken.status === "completed" && "✅ Service Completed"}
                {currentToken.status === "skipped" && "⚠️ Skipped / No Show"}
                {currentToken.status === "cancelled" && "❌ Cancelled"}
              </div>
              <div className="tracker-dept-name">{currentToken.deptName}</div>
            </div>
          </div>

          {/* Progress Tracker Stepper */}
          <div className="tracker-stepper">
            <div className={`step-item ${activeStepNum >= 1 ? "completed" : ""}`}>
              <div className="step-circle">1</div>
              <div className="step-label">Token Booked</div>
              <div className="step-sub">{new Date(currentToken.bookedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
            </div>

            <div className={`step-line ${activeStepNum >= 2 ? "active" : ""}`}></div>

            <div className={`step-item ${activeStepNum >= 2 ? "completed" : ""} ${activeStepNum === 2 ? "current" : ""}`}>
              <div className="step-circle">2</div>
              <div className="step-label">Waiting in Queue</div>
              <div className="step-sub">
                {currentToken.status === "waiting" ? `Position #${waitMetrics.queuePosition}` : "Cleared"}
              </div>
            </div>

            <div className={`step-line ${activeStepNum >= 3 ? "active" : ""}`}></div>

            <div className={`step-item ${activeStepNum >= 3 ? "completed" : ""} ${activeStepNum === 3 ? "current" : ""}`}>
              <div className="step-circle">3</div>
              <div className="step-label">Called to Counter</div>
              <div className="step-sub">
                {currentToken.counterNumber ? `Counter 0${currentToken.counterNumber}` : "Assigning..."}
              </div>
            </div>

            <div className={`step-line ${activeStepNum >= 4 ? "active" : ""}`}></div>

            <div className={`step-item ${activeStepNum >= 4 ? "completed" : ""}`}>
              <div className="step-circle">4</div>
              <div className="step-label">Service Completed</div>
              <div className="step-sub">
                {currentToken.completedAt ? "Finished" : "Pending"}
              </div>
            </div>
          </div>

          {/* Real-time Dynamic Metrics Grid */}
          <div className="tracker-metrics-grid">
            {/* Live Queue Position Card */}
            <div className="metric-box">
              <div className="metric-box-icon queue-icon">
                <Users size={24} />
              </div>
              <div className="metric-box-info">
                <span className="metric-box-lbl">Queue Position</span>
                <div className="metric-box-val">
                  {currentToken.status === "waiting" ? (
                    <span><strong>#{waitMetrics.queuePosition}</strong> in Line</span>
                  ) : currentToken.status === "in_progress" ? (
                    <span className="text-success">At Counter</span>
                  ) : currentToken.status === "completed" ? (
                    <span className="text-muted">Served</span>
                  ) : (
                    "Called"
                  )}
                </div>
                <span className="metric-box-sub">
                  {waitMetrics.aheadCount > 0
                    ? `${waitMetrics.aheadCount} citizen(s) ahead of you`
                    : "You are next in line!"}
                </span>
              </div>
            </div>

            {/* Wait-Time Prediction Card */}
            <div className="metric-box">
              <div className="metric-box-icon time-icon">
                <Clock size={24} />
              </div>
              <div className="metric-box-info">
                <span className="metric-box-lbl">Predicted Wait Time</span>
                <div className="metric-box-val">
                  {currentToken.status === "waiting" ? (
                    <span>~{waitMetrics.waitMins} mins</span>
                  ) : currentToken.status === "in_progress" ? (
                    <span>0 mins (Serving)</span>
                  ) : (
                    <span>Completed</span>
                  )}
                </div>
                <span className="metric-box-sub">Estimated Turn: {waitMetrics.estimatedTurnTime}</span>
              </div>
            </div>

            {/* Assigned Counter Location Card */}
            <div className="metric-box">
              <div className="metric-box-icon counter-icon">
                <MapPin size={24} />
              </div>
              <div className="metric-box-info">
                <span className="metric-box-lbl">Counter Assignment</span>
                <div className="metric-box-val">
                  {currentToken.counterNumber ? `Counter 0${currentToken.counterNumber}` : "Counter 01 / 02"}
                </div>
                <span className="metric-box-sub">
                  Officer: {currentToken.staffName || "Designated Service Desk"}
                </span>
              </div>
            </div>
          </div>

          {/* Citizen Details & Service Summary Box */}
          <div className="tracker-citizen-info-strip">
            <div className="info-strip-item">
              <span className="lbl">Citizen:</span>
              <strong>{currentToken.citizenName}</strong>
            </div>
            <div className="info-strip-item">
              <span className="lbl">Mobile:</span>
              <strong>{currentToken.phone}</strong>
            </div>
            <div className="info-strip-item">
              <span className="lbl">Slot Window:</span>
              <strong>{currentToken.slotTime}</strong>
            </div>
            <div className="info-strip-item">
              <span className="lbl">Category:</span>
              <strong>{currentToken.isPriority ? `⭐ Priority (${currentToken.priorityReason})` : "General Citizen"}</strong>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="tracker-action-buttons">
            <button className="btn-tracker-action" onClick={() => setActiveTokenModal(currentToken)}>
              <Printer size={16} />
              <span>Print E-Token Slip</span>
            </button>

            <button className="btn-tracker-action" onClick={handleSendSimulatedSMS}>
              <Smartphone size={16} />
              <span>Send SMS Status Update</span>
            </button>

            {currentToken.status === "waiting" && (
              <>
                <button
                  className="btn-tracker-action warning"
                  onClick={() => setIsRescheduleOpen(true)}
                >
                  <RotateCcw size={16} />
                  <span>Reschedule Slot</span>
                </button>

                <button
                  className="btn-tracker-action danger"
                  onClick={handleCancelClick}
                >
                  <XCircle size={16} />
                  <span>Cancel Token</span>
                </button>
              </>
            )}
          </div>

          {/* Post-Service Citizen Rating Box (Shown if token completed) */}
          {currentToken.status === "completed" && (
            <div className="citizen-feedback-box">
              <div className="feedback-box-header">
                <Sparkles size={20} className="sparkle-gold" />
                <h4>Citizen Service Experience & Feedback</h4>
              </div>

              {feedbackSubmitted ? (
                <div className="feedback-thanks">
                  <CheckCircle2 size={32} className="text-success" />
                  <p>Thank you for submitting your feedback! Your rating helps improve government service delivery.</p>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="feedback-form">
                  <p>How was your queue and counter service experience today?</p>
                  <div className="star-rating-row">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn ${userRating >= star ? "active" : ""}`}
                        onClick={() => setUserRating(star)}
                      >
                        <Star size={24} fill={userRating >= star ? "#f59e0b" : "none"} color="#f59e0b" />
                      </button>
                    ))}
                    <span className="rating-label">
                      {userRating === 5 && "Outstanding & Fast (5/5)"}
                      {userRating === 4 && "Very Good (4/5)"}
                      {userRating === 3 && "Satisfactory (3/5)"}
                      {userRating === 2 && "Needs Improvement (2/5)"}
                      {userRating === 1 && "Poor (1/5)"}
                    </span>
                  </div>

                  <div className="feedback-textarea-wrap">
                    <textarea
                      placeholder="Share additional suggestions or feedback for the counter officer (optional)..."
                      value={userFeedback}
                      onChange={(e) => setUserFeedback(e.target.value)}
                      rows={2}
                      className="gov-textarea"
                    ></textarea>
                  </div>

                  <button type="submit" className="btn-submit-feedback">
                    Submit Citizen Rating
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reschedule Modal */}
      {isRescheduleOpen && (
        <div className="book-modal-overlay" onClick={() => setIsRescheduleOpen(false)}>
          <div className="reschedule-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title-wrap">
              <h3>Reschedule Token #{currentToken?.tokenNumber}</h3>
              <p>Pick a new time slot for today:</p>
            </div>

            <div className="time-slots-grid my-4">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  className={`slot-chip ${newSlot === slot ? "selected" : ""}`}
                  onClick={() => setNewSlot(slot)}
                >
                  <Clock size={14} />
                  <span>{slot}</span>
                </button>
              ))}
            </div>

            <div className="wizard-actions">
              <button className="btn-wizard-back" onClick={() => setIsRescheduleOpen(false)}>
                Cancel
              </button>
              <button className="btn-wizard-submit" onClick={handleRescheduleSubmit}>
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
