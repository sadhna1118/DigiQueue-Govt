import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  INITIAL_DEPARTMENTS,
  INITIAL_COUNTERS,
  INITIAL_TOKENS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NOTIFICATIONS
} from "../data/initialData";
import { announcer } from "../utils/audioAnnouncer";
import { calculateTokenWaitTime } from "../utils/waitTimeEstimator";

const QueueContext = createContext(null);

const STORAGE_KEYS = {
  DEPARTMENTS: "digiqueue_departments_v1",
  COUNTERS: "digiqueue_counters_v1",
  TOKENS: "digiqueue_tokens_v1",
  ANNOUNCEMENTS: "digiqueue_announcements_v1",
  NOTIFICATIONS: "digiqueue_notifications_v1",
  THEME: "digiqueue_theme_v1"
};

export const QueueProvider = ({ children }) => {
  // 1. Core State
  const [departments, setDepartments] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
  });

  const [counters, setCounters] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COUNTERS);
    return saved ? JSON.parse(saved) : INITIAL_COUNTERS;
  });

  const [tokens, setTokens] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TOKENS);
    return saved ? JSON.parse(saved) : INITIAL_TOKENS;
  });

  const [announcements, setAnnouncements] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // UI Navigation & View State
  const [activeView, setActiveView] = useState("citizen"); // "citizen" | "tracker" | "display" | "staff" | "admin" | "kiosk" | "services"
  const [selectedStaffCounterId, setSelectedStaffCounterId] = useState("cnt-1");
  const [selectedTrackTokenNumber, setSelectedTrackTokenNumber] = useState("REV-103");
  const [activeTokenModal, setActiveTokenModal] = useState(null); // for viewing/printing a token slip
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastCalledToken, setLastCalledToken] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.THEME) || "dark";
  });

  const simulationTimerRef = useRef(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(counters));
  }, [counters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
  }, [tokens]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Audio Sync
  const toggleAudio = useCallback(() => {
    setIsAudioMuted(prev => {
      const next = !prev;
      announcer.setMuted(next);
      return next;
    });
  }, []);

  const showToast = useCallback((msg, type = "info") => {
    setToastMessage({ msg, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(curr => (curr && curr.id === msg.id ? null : curr));
    }, 4000);
  }, []);

  // Push SMS/Email simulated notification
  const pushNotification = useCallback((recipient, title, message, type = "sms", tokenNumber = "") => {
    const newNotif = {
      id: "notif-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      type,
      recipient: recipient || "Citizen",
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      tokenNumber
    };
    setNotifications(prev => [newNotif, ...prev]);
    showToast(`📱 Notification sent: ${title}`, "success");
  }, [showToast]);

  // 2. Book New Token (Citizen / Kiosk)
  const bookToken = useCallback((data) => {
    const { deptId, serviceId, citizenName, phone, email, isPriority, priorityReason, slotTime, bookingType } = data;

    const dept = departments.find(d => d.id === deptId);
    const service = dept ? dept.services.find(s => s.id === serviceId) : null;
    const deptCode = dept ? dept.code : "GEN";

    // Generate Token Number e.g. REV-106, RTO-205
    const deptTokens = tokens.filter(t => t.deptId === deptId);
    const nextSeq = deptTokens.length + 101;
    const tokenNumber = `${deptCode}-${nextSeq}`;
    const tokenId = `T-${tokenNumber}`;

    const newToken = {
      id: tokenId,
      tokenNumber,
      citizenName: citizenName || "Citizen",
      phone: phone || "+91 98000 00000",
      email: email || "",
      deptId,
      deptCode,
      deptName: dept ? dept.name : "General Seva",
      serviceId,
      serviceName: service ? service.name : "General Consultation",
      status: "waiting",
      counterId: null,
      counterNumber: null,
      staffName: null,
      bookingType: bookingType || "online",
      isPriority: !!isPriority,
      priorityReason: priorityReason || "",
      slotTime: slotTime || "11:00 AM - 11:30 AM",
      bookedAt: new Date().toISOString(),
      calledAt: null,
      startedAt: null,
      completedAt: null,
      estimatedWaitMins: 12,
      queuePosition: 1
    };

    setTokens(prev => [...prev, newToken]);

    // Push simulated SMS & Email
    const smsMsg = `DigiQueue Gov: Token #${tokenNumber} confirmed for ${service ? service.name : dept.name}. Turn slot: ${slotTime}. Live Tracker: dqueue.gov.in/t/${tokenNumber}`;
    pushNotification(phone, `Token Confirmed (#${tokenNumber})`, smsMsg, "sms", tokenNumber);

    if (email) {
      const emailMsg = `Dear ${citizenName}, your e-token #${tokenNumber} for ${service ? service.name : dept.name} has been booked. Please bring all necessary original identity proofs.`;
      pushNotification(email, `E-Governance Token Slip (#${tokenNumber})`, emailMsg, "email", tokenNumber);
    }

    // Set selected token for tracking
    setSelectedTrackTokenNumber(tokenNumber);

    return newToken;
  }, [departments, tokens, pushNotification]);

  // 3. Staff Action: Call Next Token
  const callNextToken = useCallback((counterId) => {
    const counter = counters.find(c => c.id === counterId);
    if (!counter) return null;

    // Find next eligible waiting token
    // Prioritize: (1) isPriority = true, (2) oldest bookedAt
    const waitingTokens = tokens.filter(t => t.deptId === counter.deptId && t.status === "waiting");
    if (waitingTokens.length === 0) {
      showToast(`No citizens waiting in queue for ${counter.name}`, "warning");
      return null;
    }

    waitingTokens.sort((a, b) => {
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;
      return new Date(a.bookedAt).getTime() - new Date(b.bookedAt).getTime();
    });

    const nextToken = waitingTokens[0];
    const updatedToken = {
      ...nextToken,
      status: "called",
      counterId: counter.id,
      counterNumber: counter.number,
      staffName: counter.staffName,
      calledAt: new Date().toISOString()
    };

    // Update tokens list
    setTokens(prev => prev.map(t => t.id === nextToken.id ? updatedToken : t));

    // Update counter status
    setCounters(prev => prev.map(c => 
      c.id === counterId ? { ...c, status: "serving", currentTokenId: nextToken.id } : c
    ));

    // Audio & Display Announcement
    setLastCalledToken(updatedToken);
    announcer.announceToken(nextToken.tokenNumber, counter.number, nextToken.citizenName);

    // SMS to Citizen
    const alertMsg = `Attention ${nextToken.citizenName}: Your Token #${nextToken.tokenNumber} has been CALLED at Counter ${counter.number} (${counter.staffRole}). Please proceed immediately.`;
    pushNotification(nextToken.phone, `🚨 Turn Called at Counter ${counter.number}`, alertMsg, "sms", nextToken.tokenNumber);

    showToast(`Called Token #${nextToken.tokenNumber} to Counter ${counter.number}`, "success");
    return updatedToken;
  }, [counters, tokens, pushNotification, showToast]);

  // 4. Staff Action: Recall / Ring Bell
  const recallToken = useCallback((counterId) => {
    const counter = counters.find(c => c.id === counterId);
    if (!counter || !counter.currentTokenId) {
      showToast("No active token currently assigned to this counter", "warning");
      return;
    }

    const currentToken = tokens.find(t => t.id === counter.currentTokenId);
    if (!currentToken) return;

    setLastCalledToken(currentToken);
    announcer.announceToken(currentToken.tokenNumber, counter.number, currentToken.citizenName);
    showToast(`🔔 Recalled Token #${currentToken.tokenNumber} on public speakers`, "info");
  }, [counters, tokens, showToast]);

  // 5. Staff Action: Start Service (Mark In Progress)
  const startService = useCallback((counterId) => {
    const counter = counters.find(c => c.id === counterId);
    if (!counter || !counter.currentTokenId) return;

    setTokens(prev => prev.map(t => {
      if (t.id === counter.currentTokenId) {
        return {
          ...t,
          status: "in_progress",
          startedAt: new Date().toISOString()
        };
      }
      return t;
    }));

    showToast(`Service started for Counter ${counter.number}`, "info");
  }, [counters, showToast]);

  // 6. Staff Action: Mark Completed
  const completeService = useCallback((counterId, rating = 5, feedback = "") => {
    const counter = counters.find(c => c.id === counterId);
    if (!counter || !counter.currentTokenId) return;

    const currentToken = tokens.find(t => t.id === counter.currentTokenId);

    // Update token
    setTokens(prev => prev.map(t => {
      if (t.id === counter.currentTokenId) {
        return {
          ...t,
          status: "completed",
          completedAt: new Date().toISOString(),
          rating,
          feedback: feedback || "Completed by officer"
        };
      }
      return t;
    }));

    // Update Counter
    setCounters(prev => prev.map(c => {
      if (c.id === counterId) {
        return {
          ...c,
          status: "idle",
          currentTokenId: null,
          servedToday: (c.servedToday || 0) + 1
        };
      }
      return c;
    }));

    if (currentToken) {
      const smsMsg = `DigiQueue Gov: Service for Token #${currentToken.tokenNumber} is marked COMPLETED. Thank you for your cooperation! Rate your experience: dqueue.gov.in/feedback`;
      pushNotification(currentToken.phone, `Service Completed (#${currentToken.tokenNumber})`, smsMsg, "sms", currentToken.tokenNumber);
      showToast(`Token #${currentToken.tokenNumber} completed successfully!`, "success");
    }
  }, [counters, tokens, pushNotification, showToast]);

  // 7. Staff Action: Skip / No Show
  const skipToken = useCallback((counterId, reason = "Citizen not present") => {
    const counter = counters.find(c => c.id === counterId);
    if (!counter || !counter.currentTokenId) return;

    const currentToken = tokens.find(t => t.id === counter.currentTokenId);

    setTokens(prev => prev.map(t => {
      if (t.id === counter.currentTokenId) {
        return {
          ...t,
          status: "skipped",
          skippedReason: reason,
          skippedAt: new Date().toISOString()
        };
      }
      return t;
    }));

    setCounters(prev => prev.map(c => 
      c.id === counterId ? { ...c, status: "idle", currentTokenId: null } : c
    ));

    if (currentToken) {
      const smsMsg = `DigiQueue Gov: Token #${currentToken.tokenNumber} was skipped due to non-availability. Please report to the Helpdesk or Counter within 30 mins to re-queue.`;
      pushNotification(currentToken.phone, `Token Skipped / No Show`, smsMsg, "sms", currentToken.tokenNumber);
      showToast(`Token #${currentToken.tokenNumber} marked as skipped`, "warning");
    }
  }, [counters, tokens, pushNotification, showToast]);

  // 8. Staff / Admin Action: Transfer Token
  const transferToken = useCallback((tokenId, targetDeptId, targetCounterId = null) => {
    const dept = departments.find(d => d.id === targetDeptId);
    setTokens(prev => prev.map(t => {
      if (t.id === tokenId) {
        return {
          ...t,
          deptId: targetDeptId,
          deptCode: dept ? dept.code : t.deptCode,
          deptName: dept ? dept.name : t.deptName,
          status: "waiting",
          counterId: targetCounterId,
          transferredAt: new Date().toISOString()
        };
      }
      return t;
    }));
    showToast(`Token transferred to ${dept ? dept.name : "new department"}`, "info");
  }, [departments, showToast]);

  // 9. Update Counter Operator Status
  const updateCounterStatus = useCallback((counterId, status) => {
    setCounters(prev => prev.map(c => {
      if (c.id === counterId) {
        return {
          ...c,
          status,
          currentTokenId: status === "break" || status === "offline" ? null : c.currentTokenId
        };
      }
      return c;
    }));
    showToast(`Counter status updated to: ${status.toUpperCase()}`, "info");
  }, [showToast]);

  // 10. Reschedule / Cancel Token
  const rescheduleToken = useCallback((tokenId, newSlot) => {
    setTokens(prev => prev.map(t => {
      if (t.id === tokenId) {
        return { ...t, slotTime: newSlot, status: "waiting" };
      }
      return t;
    }));
    showToast("Token slot successfully rescheduled", "success");
  }, [showToast]);

  const cancelToken = useCallback((tokenId) => {
    setTokens(prev => prev.map(t => {
      if (t.id === tokenId) {
        return { ...t, status: "cancelled", cancelledAt: new Date().toISOString() };
      }
      return t;
    }));
    showToast("Token booking cancelled", "info");
  }, [showToast]);

  // 11. Broadcast Announcement
  const broadcastAnnouncement = useCallback((text) => {
    if (!text.trim()) return;
    setAnnouncements(prev => [text, ...prev]);
    announcer.speakGeneralAnnouncement(text);
    showToast("Announcement broadcasted to public display", "success");
  }, [showToast]);

  // 12. Reset All Data
  const resetAllData = useCallback(() => {
    localStorage.clear();
    setDepartments(INITIAL_DEPARTMENTS);
    setCounters(INITIAL_COUNTERS);
    setTokens(INITIAL_TOKENS);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    showToast("System reset to default state", "info");
  }, [showToast]);

  // 13. Auto Simulation Mode (Dynamic Live Queue Traffic)
  useEffect(() => {
    if (!isSimulating) {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
      return;
    }

    simulationTimerRef.current = setInterval(() => {
      // Pick a random active counter to advance
      const eligibleCounters = counters.filter(c => c.status === "serving" || c.status === "idle");
      if (eligibleCounters.length === 0) return;

      const randomCounter = eligibleCounters[Math.floor(Math.random() * eligibleCounters.length)];

      if (randomCounter.currentTokenId) {
        // If serving, complete service
        completeService(randomCounter.id, 5, "Automated demo simulation completion");
      } else {
        // If idle, call next token
        callNextToken(randomCounter.id);
      }
    }, 6000); // every 6 seconds

    return () => {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    };
  }, [isSimulating, counters, completeService, callNextToken]);

  // Compute Global System Metrics & KPIs
  const totalTokensToday = tokens.length;
  const completedTokensCount = tokens.filter(t => t.status === "completed").length;
  const waitingTokensCount = tokens.filter(t => t.status === "waiting").length;
  const inProgressTokensCount = tokens.filter(t => t.status === "in_progress" || t.status === "called").length;
  const activeCountersCount = counters.filter(c => c.status === "serving").length;

  const value = {
    departments,
    setDepartments,
    counters,
    setCounters,
    tokens,
    setTokens,
    announcements,
    notifications,
    activeView,
    setActiveView,
    selectedStaffCounterId,
    setSelectedStaffCounterId,
    selectedTrackTokenNumber,
    setSelectedTrackTokenNumber,
    activeTokenModal,
    setActiveTokenModal,
    isBookModalOpen,
    setIsBookModalOpen,
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    isAudioMuted,
    toggleAudio,
    isSimulating,
    setIsSimulating,
    lastCalledToken,
    toastMessage,
    showToast,
    theme,
    setTheme,
    // Actions
    bookToken,
    callNextToken,
    recallToken,
    startService,
    completeService,
    skipToken,
    transferToken,
    updateCounterStatus,
    rescheduleToken,
    cancelToken,
    broadcastAnnouncement,
    pushNotification,
    resetAllData,
    // Metrics
    totalTokensToday,
    completedTokensCount,
    waitingTokensCount,
    inProgressTokensCount,
    activeCountersCount
  };

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
};

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error("useQueue must be used within a QueueProvider");
  }
  return context;
};
