import React, { useState } from "react";
import { useQueue } from "../../context/QueueContext";
import { TIME_SLOTS } from "../../data/initialData";
import confetti from "canvas-confetti";
import {
  X,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Shield,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Printer,
  ChevronRight,
  FileText,
  AlertCircle
} from "lucide-react";

export const BookTokenModal = () => {
  const {
    isBookModalOpen,
    setIsBookModalOpen,
    departments,
    bookToken,
    setActiveTokenModal,
    setActiveView,
    setSelectedTrackTokenNumber
  } = useQueue();

  const [step, setStep] = useState(1);
  const [selectedDeptId, setSelectedDeptId] = useState(departments[0]?.id || "");
  const [selectedServiceId, setSelectedServiceId] = useState(departments[0]?.services[0]?.id || "");
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[2]);
  const [citizenName, setCitizenName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [isPriority, setIsPriority] = useState(false);
  const [priorityReason, setPriorityReason] = useState("");
  const [createdToken, setCreatedToken] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isBookModalOpen) return null;

  const currentDept = departments.find(d => d.id === selectedDeptId);
  const currentService = currentDept?.services?.find(s => s.id === selectedServiceId);

  const handleDeptChange = (deptId) => {
    setSelectedDeptId(deptId);
    const dept = departments.find(d => d.id === deptId);
    if (dept && dept.services.length > 0) {
      setSelectedServiceId(dept.services[0].id);
    }
  };

  const handleProceedToStep2 = () => {
    if (!selectedDeptId || !selectedServiceId) {
      setErrorMsg("Please choose a department and service to proceed.");
      return;
    }
    setErrorMsg("");
    setStep(2);
  };

  const handleProceedToStep3 = () => {
    if (!selectedSlot) {
      setErrorMsg("Please select a time slot.");
      return;
    }
    setErrorMsg("");
    setStep(3);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!citizenName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      setErrorMsg("Please provide a valid 10-digit mobile number for SMS queue updates.");
      return;
    }

    setErrorMsg("");

    const tokenData = {
      deptId: selectedDeptId,
      serviceId: selectedServiceId,
      citizenName: citizenName.trim(),
      phone: phone.trim().startsWith("+91") ? phone.trim() : `+91 ${phone.trim()}`,
      email: email.trim(),
      isPriority,
      priorityReason: isPriority ? (priorityReason || "Senior / PWD Priority") : "",
      slotTime: selectedSlot,
      bookingType: isPriority ? "priority" : "online"
    };

    const token = bookToken(tokenData);
    setCreatedToken(token);
    setStep(4);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }
  };

  const handleViewSlip = () => {
    if (createdToken) {
      setActiveTokenModal(createdToken);
      setIsBookModalOpen(false);
    }
  };

  const handleTrackDirectly = () => {
    if (createdToken) {
      setSelectedTrackTokenNumber(createdToken.tokenNumber);
      setActiveView("tracker");
      setIsBookModalOpen(false);
    }
  };

  const handleClose = () => {
    setIsBookModalOpen(false);
    setStep(1);
    setCitizenName("");
    setPhone("");
    setEmail("");
    setCreatedToken(null);
    setErrorMsg("");
  };

  return (
    <div className="book-modal-overlay" onClick={handleClose}>
      <div className="book-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="book-modal-header">
          <div className="modal-title-wrap">
            <span className="modal-step-badge">
              {step === 4 ? "Confirmed" : `Step ${step} of 3`}
            </span>
            <h3>
              {step === 1 && "Select Department & Service"}
              {step === 2 && "Choose Date & Time Slot"}
              {step === 3 && "Citizen Verification & Priority"}
              {step === 4 && "🎉 Token Generated Successfully"}
            </h3>
          </div>
          <button className="btn-close-modal" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Wizard Progress Bar */}
        <div className="wizard-progress-bar">
          <div
            className="wizard-progress-fill"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>

        {errorMsg && (
          <div className="modal-alert-error">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Body: STEP 1 - Select Department & Service */}
        {step === 1 && (
          <div className="wizard-step-body">
            <label className="form-label-bold">1. Select Government Department</label>
            <div className="dept-grid-select">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className={`dept-select-card ${selectedDeptId === dept.id ? "selected" : ""}`}
                  onClick={() => handleDeptChange(dept.id)}
                  style={{ "--dept-color": dept.color }}
                >
                  <div className="dept-select-code">{dept.code}</div>
                  <div className="dept-select-info">
                    <div className="dept-select-name">{dept.name}</div>
                    <div className="dept-select-floor">{dept.floor}</div>
                  </div>
                  {selectedDeptId === dept.id && (
                    <CheckCircle2 size={18} className="dept-checked-icon" />
                  )}
                </div>
              ))}
            </div>

            {currentDept && (
              <div className="service-select-section">
                <label className="form-label-bold">2. Select Service Required</label>
                <div className="service-list-select">
                  {currentDept.services.map((srv) => (
                    <div
                      key={srv.id}
                      className={`service-item-radio ${selectedServiceId === srv.id ? "selected" : ""}`}
                      onClick={() => setSelectedServiceId(srv.id)}
                    >
                      <div className="srv-radio-dot">
                        {selectedServiceId === srv.id && <div className="srv-radio-inner"></div>}
                      </div>
                      <div className="srv-item-content">
                        <div className="srv-item-top">
                          <span className="srv-item-name">{srv.name}</span>
                          <span className="srv-item-fee">{srv.fee}</span>
                        </div>
                        <p className="srv-item-desc">{srv.description}</p>
                        <div className="srv-item-meta">
                          <span className="srv-meta-pill">⏱️ Avg ~{srv.duration} mins</span>
                          <span className="srv-meta-pill">📄 {srv.docs.length} Documents Required</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="wizard-actions">
              <div></div>
              <button className="btn-wizard-next" onClick={handleProceedToStep2}>
                <span>Continue to Slot Selection</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 - Select Time Slot */}
        {step === 2 && (
          <div className="wizard-step-body">
            <div className="selected-summary-box">
              <span className="sum-label">Selected:</span>
              <strong>{currentDept?.name}</strong> • {currentService?.name}
            </div>

            <div className="slot-selection-wrap">
              <label className="form-label-bold">Choose Preferred Arrival Slot (Today)</label>
              <p className="form-hint">Select a convenient 30-minute arrival window to minimize physical waiting.</p>

              <div className="time-slots-grid">
                {TIME_SLOTS.map((slot, index) => {
                  const isSelected = selectedSlot === slot;
                  const isAvailable = index % 5 !== 0; // realistic mock availability
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={!isAvailable}
                      className={`slot-chip ${isSelected ? "selected" : ""} ${!isAvailable ? "disabled" : ""}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <Clock size={14} />
                      <span>{slot}</span>
                      <span className="slot-status-tag">
                        {isAvailable ? "Available" : "Full"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="wizard-actions">
              <button className="btn-wizard-back" onClick={() => setStep(1)}>
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button className="btn-wizard-next" onClick={handleProceedToStep3}>
                <span>Continue to Citizen Details</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 - Citizen Verification & Priority Option */}
        {step === 3 && (
          <form onSubmit={handleFormSubmit} className="wizard-step-body">
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  <User size={14} /> Full Name (As per ID Proof) *
                </label>
                <input
                  type="text"
                  className="gov-input"
                  placeholder="e.g. Anjali Sharma"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Phone size={14} /> Mobile Number (for SMS Alerts) *
                </label>
                <input
                  type="tel"
                  className="gov-input"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  <Mail size={14} /> Email Address (Optional for E-Slip)
                </label>
                <input
                  type="email"
                  className="gov-input"
                  placeholder="e.g. anjali.sharma@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Shield size={14} /> Aadhaar / ID Last 4 Digits
                </label>
                <input
                  type="text"
                  maxLength={4}
                  className="gov-input"
                  placeholder="e.g. 8921"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Special / Priority Option */}
            <div className="priority-option-box">
              <label className="priority-checkbox-label">
                <input
                  type="checkbox"
                  checked={isPriority}
                  onChange={(e) => setIsPriority(e.target.checked)}
                />
                <div>
                  <span className="priority-title">⭐ Request Priority / Fast-Track Assistance</span>
                  <p className="priority-desc">
                    Eligible for Senior Citizens (&gt;60 yrs), Differently-Abled (PWD), or Medical Emergencies.
                  </p>
                </div>
              </label>

              {isPriority && (
                <div className="priority-select-wrap">
                  <select
                    className="gov-select"
                    value={priorityReason}
                    onChange={(e) => setPriorityReason(e.target.value)}
                  >
                    <option value="">Select Priority Category</option>
                    <option value="Senior Citizen (Above 60 Years)">Senior Citizen (Above 60 Years)</option>
                    <option value="Differently Abled (PWD / Accessible Counter)">Differently Abled (PWD / Accessible Counter)</option>
                    <option value="Expectant Mother / Infant Care">Expectant Mother / Infant Care</option>
                    <option value="Armed Forces / Ex-Servicemen">Armed Forces / Ex-Servicemen</option>
                  </select>
                </div>
              )}
            </div>

            <div className="wizard-actions">
              <button type="button" className="btn-wizard-back" onClick={() => setStep(2)}>
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button type="submit" className="btn-wizard-submit">
                <Sparkles size={16} />
                <span>Confirm & Generate Token</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 4 - Confirmation Success */}
        {step === 4 && createdToken && (
          <div className="wizard-step-body text-center">
            <div className="token-success-icon-wrap">
              <CheckCircle2 size={56} className="success-check-icon" />
            </div>

            <h4 className="success-heading">Your Token is Confirmed!</h4>
            <p className="success-sub">
              An SMS confirmation with the live queue tracker link has been dispatched to{" "}
              <strong>{createdToken.phone}</strong>.
            </p>

            {/* Big Token Number Display */}
            <div className="confirmed-token-card">
              <div className="conf-token-dept">{createdToken.deptName}</div>
              <div className="conf-token-number">{createdToken.tokenNumber}</div>
              <div className="conf-token-service">{createdToken.serviceName}</div>
              <div className="conf-token-slot">
                <Clock size={14} />
                <span>Allocated Slot: <strong>{createdToken.slotTime}</strong></span>
              </div>
            </div>

            <div className="conf-actions-grid">
              <button className="btn-print-conf" onClick={handleViewSlip}>
                <Printer size={16} />
                <span>View & Print Official E-Slip</span>
              </button>
              <button className="btn-track-conf" onClick={handleTrackDirectly}>
                <ChevronRight size={16} />
                <span>Track Live Queue Position</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
