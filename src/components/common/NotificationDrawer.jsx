import React from "react";
import { useQueue } from "../../context/QueueContext";
import { X, MessageSquare, Mail, CheckCircle2, Clock, Smartphone, Trash2 } from "lucide-react";

export const NotificationDrawer = () => {
  const {
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    notifications,
    setSelectedTrackTokenNumber,
    setActiveView
  } = useQueue();

  if (!isNotificationDrawerOpen) return null;

  const handleTrackFromNotif = (tokenNumber) => {
    if (tokenNumber) {
      setSelectedTrackTokenNumber(tokenNumber);
      setActiveView("tracker");
      setIsNotificationDrawerOpen(false);
    }
  };

  return (
    <div className="notif-drawer-overlay" onClick={() => setIsNotificationDrawerOpen(false)}>
      <div className="notif-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="notif-drawer-header">
          <div className="notif-title-box">
            <div className="notif-icon-circle">
              <Smartphone size={18} />
            </div>
            <div>
              <h3>Citizen SMS & Email Hub</h3>
              <p className="notif-subtitle">Simulated Real-time Dispatch Logs</p>
            </div>
          </div>
          <button className="btn-close-circle" onClick={() => setIsNotificationDrawerOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Notif Info Banner */}
        <div className="notif-info-banner">
          <span>💡 <strong>Real-time Delivery Engine:</strong> SMS & Email alerts are generated automatically on token booking, counter calls, and completion.</span>
        </div>

        {/* Notifications List */}
        <div className="notif-list">
          {notifications.length === 0 ? (
            <div className="notif-empty">
              <MessageSquare size={36} className="empty-icon" />
              <p>No notifications dispatched yet.</p>
              <span className="empty-sub">Book a token or advance a queue to generate alerts.</span>
            </div>
          ) : (
            notifications.map((n) => {
              const isSMS = n.type === "sms";
              const timeString = new Date(n.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
              });

              return (
                <div key={n.id} className={`notif-card ${isSMS ? "sms-card" : "email-card"}`}>
                  <div className="notif-card-header">
                    <div className="notif-type-tag">
                      {isSMS ? <MessageSquare size={13} /> : <Mail size={13} />}
                      <span>{isSMS ? "SMS ALERT" : "OFFICIAL EMAIL"}</span>
                    </div>
                    <div className="notif-time">
                      <Clock size={12} />
                      <span>{timeString}</span>
                    </div>
                  </div>

                  <div className="notif-recipient">
                    <span>To: <strong>{n.recipient}</strong></span>
                  </div>

                  <div className="notif-card-title">{n.title}</div>
                  <div className="notif-card-body">{n.message}</div>

                  {n.tokenNumber && (
                    <div className="notif-actions">
                      <button
                        className="btn-track-mini"
                        onClick={() => handleTrackFromNotif(n.tokenNumber)}
                      >
                        Track Token #{n.tokenNumber} →
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
