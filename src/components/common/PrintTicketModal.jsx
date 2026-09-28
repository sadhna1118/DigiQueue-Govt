import React from "react";
import { useQueue } from "../../context/QueueContext";
import { generateTokenQR, printTokenSlip } from "../../utils/ticketGenerator";
import { X, Printer, CheckCircle2, QrCode, ShieldAlert, Sparkles, MapPin, Calendar, Clock, User } from "lucide-react";

export const PrintTicketModal = () => {
  const { activeTokenModal, setActiveTokenModal } = useQueue();

  if (!activeTokenModal) return null;

  const token = activeTokenModal;
  const qrData = generateTokenQR(token.tokenNumber, token.deptCode);

  return (
    <div className="ticket-modal-overlay" onClick={() => setActiveTokenModal(null)}>
      <div className="ticket-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        {/* Modal Controls Bar */}
        <div className="ticket-modal-actions no-print">
          <button className="btn-print-action" onClick={printTokenSlip}>
            <Printer size={16} />
            <span>Print E-Token Slip</span>
          </button>
          <button className="btn-close-ticket" onClick={() => setActiveTokenModal(null)}>
            <X size={18} />
          </button>
        </div>

        {/* The Printable Official E-Token Paper Slip */}
        <div className="e-token-slip printable-area">
          {/* Slip Header */}
          <div className="slip-gov-header">
            <div className="slip-emblem">🏛️</div>
            <div className="slip-header-text">
              <h4>GOVERNMENT OF INDIA / STATE ADMINISTRATION</h4>
              <p>Integrated Citizen Seva Kendra • Digital Queue Token</p>
            </div>
          </div>

          <div className="slip-divider-dashed"></div>

          {/* Big Token Number Display */}
          <div className="slip-token-hero">
            <span className="slip-token-label">YOUR ELECTRONIC QUEUE TOKEN</span>
            <div className="slip-token-number">{token.tokenNumber}</div>
            <div className="slip-service-badge">{token.serviceName}</div>
          </div>

          {/* Department & Location */}
          <div className="slip-dept-block">
            <div className="slip-dept-title">{token.deptName}</div>
            <div className="slip-dept-floor">
              <MapPin size={13} />
              <span>Assigned Zone: Counter 0{token.counterNumber || "1"} • Ground Floor, Hall A</span>
            </div>
          </div>

          <div className="slip-divider-solid"></div>

          {/* Key Details Grid */}
          <div className="slip-details-grid">
            <div className="slip-detail-item">
              <span className="slip-lbl">Citizen Name</span>
              <span className="slip-val">{token.citizenName}</span>
            </div>
            <div className="slip-detail-item">
              <span className="slip-lbl">Contact No.</span>
              <span className="slip-val">{token.phone}</span>
            </div>
            <div className="slip-detail-item">
              <span className="slip-lbl">Booking Date</span>
              <span className="slip-val">{new Date(token.bookedAt).toLocaleDateString()}</span>
            </div>
            <div className="slip-detail-item">
              <span className="slip-lbl">Allocated Slot</span>
              <span className="slip-val">{token.slotTime}</span>
            </div>
            <div className="slip-detail-item">
              <span className="slip-lbl">Category</span>
              <span className="slip-val">
                {token.isPriority ? `⭐ Priority (${token.priorityReason || "Fast-Track"})` : "General Citizen"}
              </span>
            </div>
            <div className="slip-detail-item">
              <span className="slip-lbl">Estimated Turn</span>
              <span className="slip-val highlight-val">{token.estimatedWaitMins > 0 ? `~${token.estimatedWaitMins} mins` : "Immediate"}</span>
            </div>
          </div>

          {/* QR Code & Barcode Verification Box */}
          <div className="slip-verification-box">
            <div className="slip-qr-render">
              <svg width="100" height="100" viewBox={`0 0 ${qrData.size} ${qrData.size}`} className="qr-svg">
                {qrData.cells.map((cell, i) => (
                  <rect
                    key={i}
                    x={cell.c}
                    y={cell.r}
                    width="1"
                    height="1"
                    fill="#0f172a"
                  />
                ))}
              </svg>
              <span className="qr-caption">Scan at Entrance Kiosk</span>
            </div>

            <div className="slip-instructions">
              <div className="instruct-title">Important Instructions:</div>
              <ul>
                <li>Please arrive 10 minutes prior to your allocated slot.</li>
                <li>Keep original ID & necessary verification documents ready.</li>
                <li>Watch the waiting hall live TV display or your SMS alerts.</li>
                <li>Tokens are non-transferable and valid for today only.</li>
              </ul>
            </div>
          </div>

          {/* Barcode Graphic */}
          <div className="slip-barcode-strip">
            <div className="mock-barcode">
              {Array.from({ length: 44 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    width: (i % 3 === 0 ? "3px" : i % 2 === 0 ? "1px" : "2px"),
                    height: "28px",
                    backgroundColor: "#0f172a",
                    marginRight: (i % 4 === 0 ? "2px" : "1px")
                  }}
                ></span>
              ))}
            </div>
            <div className="barcode-number">*{token.tokenNumber.replace("-", "")}*</div>
          </div>

          {/* Footer Security Seal */}
          <div className="slip-footer">
            <span>Official E-Gov System Generated Token • DigiQueue Gov</span>
          </div>
        </div>
      </div>
    </div>
  );
};
