import React, { useState } from "react";
import { useQueue } from "../../context/QueueContext";
import {
  Layers,
  CheckCircle2,
  Phone,
  Printer,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  User,
  Clock,
  RotateCcw
} from "lucide-react";

export const SelfServiceKiosk = () => {
  const { departments, bookToken, setActiveTokenModal } = useQueue();

  const [kioskStep, setKioskStep] = useState(1); // 1: Select Dept, 2: Select Service, 3: Citizen Phone, 4: Dispense Slip
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [citizenName, setCitizenName] = useState("");
  const [citizenPhone, setCitizenPhone] = useState("");
  const [isPriority, setIsPriority] = useState(false);
  const [dispensedToken, setDispensedToken] = useState(null);

  const handleDeptSelect = (dept) => {
    setSelectedDept(dept);
    setKioskStep(2);
  };

  const handleServiceSelect = (srv) => {
    setSelectedService(srv);
    setKioskStep(3);
  };

  const handleKeypadPress = (num) => {
    if (citizenPhone.length < 10) {
      setCitizenPhone(prev => prev + num);
    }
  };

  const handleKeypadBackspace = () => {
    setCitizenPhone(prev => prev.slice(0, -1));
  };

  const handleGenerateKioskToken = () => {
    const token = bookToken({
      deptId: selectedDept.id,
      serviceId: selectedService.id,
      citizenName: citizenName.trim() || "Walk-in Citizen",
      phone: citizenPhone ? `+91 ${citizenPhone}` : "+91 98000 00000",
      email: "",
      isPriority,
      priorityReason: isPriority ? "Senior Citizen / Walk-in Priority" : "",
      slotTime: "Immediate Walk-In",
      bookingType: isPriority ? "priority" : "walk_in"
    });

    setDispensedToken(token);
    setKioskStep(4);
  };

  const handleResetKiosk = () => {
    setKioskStep(1);
    setSelectedDept(null);
    setSelectedService(null);
    setCitizenName("");
    setCitizenPhone("");
    setIsPriority(false);
    setDispensedToken(null);
  };

  return (
    <div className="kiosk-fullscreen-container">
      {/* Kiosk Header */}
      <div className="kiosk-header">
        <div className="kiosk-brand">
          <div className="kiosk-emblem">🏛️</div>
          <div>
            <h1>SELF-SERVICE TOKEN DISPENSER</h1>
            <p>TOUCHSCREEN CITIZEN KIOSK • INTEGRATED SEVA KENDRA</p>
          </div>
        </div>

        <button className="kiosk-btn-restart" onClick={handleResetKiosk}>
          <RotateCcw size={18} />
          <span>Start Over</span>
        </button>
      </div>

      {/* KIOSK STEP 1: Touch Department */}
      {kioskStep === 1 && (
        <div className="kiosk-body">
          <div className="kiosk-step-title">
            <span className="step-badge">STEP 1</span>
            <h2>Touch your required Government Department:</h2>
          </div>

          <div className="kiosk-dept-grid">
            {departments.map((dept) => (
              <button
                key={dept.id}
                className="kiosk-touch-card"
                onClick={() => handleDeptSelect(dept)}
                style={{ "--kiosk-color": dept.color }}
              >
                <div className="kiosk-dept-code">{dept.code}</div>
                <div className="kiosk-dept-name">{dept.name}</div>
                <div className="kiosk-dept-sub">{dept.floor}</div>
                <div className="kiosk-services-count">{dept.services.length} Services Available</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KIOSK STEP 2: Touch Service */}
      {kioskStep === 2 && selectedDept && (
        <div className="kiosk-body">
          <div className="kiosk-step-title">
            <button className="kiosk-btn-back" onClick={() => setKioskStep(1)}>
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <div>
              <span className="step-badge">STEP 2 ({selectedDept.code})</span>
              <h2>Select the specific service you need today:</h2>
            </div>
          </div>

          <div className="kiosk-services-grid">
            {selectedDept.services.map((srv) => (
              <button
                key={srv.id}
                className="kiosk-service-card"
                onClick={() => handleServiceSelect(srv)}
              >
                <div className="kiosk-srv-title">{srv.name}</div>
                <div className="kiosk-srv-desc">{srv.description}</div>
                <div className="kiosk-srv-bottom">
                  <span>⏱️ ~{srv.duration} mins</span>
                  <span className="kiosk-fee">{srv.fee}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KIOSK STEP 3: Enter Mobile Number via Touch Keypad */}
      {kioskStep === 3 && selectedService && (
        <div className="kiosk-body">
          <div className="kiosk-step-title">
            <button className="kiosk-btn-back" onClick={() => setKioskStep(2)}>
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <div>
              <span className="step-badge">STEP 3</span>
              <h2>Enter Mobile Number for SMS Turn Alert (Optional):</h2>
            </div>
          </div>

          <div className="kiosk-input-layout">
            <div className="kiosk-phone-display-card">
              <label>Citizen Mobile Number:</label>
              <div className="kiosk-phone-screen">
                {citizenPhone ? `+91 ${citizenPhone}` : "+91 ••••• •••••"}
              </div>

              <label className="kiosk-name-label">Your Name (Optional):</label>
              <input
                type="text"
                placeholder="Touch to type name or skip..."
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                className="kiosk-name-input"
              />

              {/* Priority Checkbox for Touch */}
              <label className="kiosk-priority-touch">
                <input
                  type="checkbox"
                  checked={isPriority}
                  onChange={(e) => setIsPriority(e.target.checked)}
                />
                <span>⭐ Senior Citizen / Differently-Abled Priority</span>
              </label>

              <button
                className="kiosk-btn-dispense-main"
                onClick={handleGenerateKioskToken}
              >
                <Printer size={24} />
                <span>Print & Dispense Token Slip</span>
              </button>
            </div>

            {/* Big Touch Numeric Keypad */}
            <div className="kiosk-numpad">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  className="numpad-key"
                  onClick={() => handleKeypadPress(num.toString())}
                >
                  {num}
                </button>
              ))}
              <button type="button" className="numpad-key clear" onClick={() => setCitizenPhone("")}>
                C
              </button>
              <button
                type="button"
                className="numpad-key"
                onClick={() => handleKeypadPress("0")}
              >
                0
              </button>
              <button type="button" className="numpad-key back" onClick={handleKeypadBackspace}>
                ⌫
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KIOSK STEP 4: Token Dispensed Successfully */}
      {kioskStep === 4 && dispensedToken && (
        <div className="kiosk-body text-center">
          <div className="kiosk-dispensed-card">
            <div className="dispense-icon-circle">
              <CheckCircle2 size={64} className="text-success" />
            </div>

            <h2>TOKEN DISPENSED!</h2>
            <p>Please take your printed ticket below and proceed to the waiting hall.</p>

            <div className="kiosk-big-token-box">
              <span className="lbl">YOUR QUEUE NUMBER</span>
              <div className="token-num">{dispensedToken.tokenNumber}</div>
              <div className="srv-name">{dispensedToken.serviceName}</div>
              <div className="loc-text">{dispensedToken.deptName} • Ground Floor</div>
            </div>

            <div className="kiosk-final-actions">
              <button
                className="kiosk-btn-view-slip"
                onClick={() => setActiveTokenModal(dispensedToken)}
              >
                <Printer size={20} />
                <span>View / Print E-Token Slip</span>
              </button>

              <button className="kiosk-btn-done" onClick={handleResetKiosk}>
                <span>Next Citizen →</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
