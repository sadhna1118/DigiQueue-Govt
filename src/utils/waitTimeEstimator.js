// AI-assisted Wait-Time Prediction & Queue Estimator Algorithm for DigiQueue Gov

/**
 * Calculates accurate predicted wait time for a token in the queue
 * @param {Object} token - The citizen's token
 * @param {Array} allTokens - All tokens in the system
 * @param {Array} counters - All counters in the system
 * @param {Array} departments - Department metadata with service times
 * @returns {Object} Calculated metrics { waitMins, queuePosition, aheadCount, estimatedTurnTime, formattedRange }
 */
export function calculateTokenWaitTime(token, allTokens, counters, departments) {
  if (!token) return { waitMins: 0, queuePosition: 0, aheadCount: 0, estimatedTurnTime: "Now" };

  // If already in progress or called
  if (token.status === "in_progress" || token.status === "called") {
    return {
      waitMins: 0,
      queuePosition: 0,
      aheadCount: 0,
      estimatedTurnTime: "Immediate / Now at Counter " + (token.counterNumber || "Assigned"),
      formattedRange: "Now Serving"
    };
  }

  if (token.status === "completed" || token.status === "skipped" || token.status === "cancelled") {
    return {
      waitMins: 0,
      queuePosition: 0,
      aheadCount: 0,
      estimatedTurnTime: token.status.toUpperCase(),
      formattedRange: token.status
    };
  }

  // Find active counters for this department
  const deptCounters = counters.filter(
    c => c.deptId === token.deptId && (c.status === "serving" || c.status === "idle")
  );

  const activeCounterCount = Math.max(1, deptCounters.length);

  // Find all waiting tokens ahead in the same department
  const deptWaitingTokens = allTokens
    .filter(t => t.deptId === token.deptId && t.status === "waiting")
    .sort((a, b) => {
      // Priority tokens come first
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;
      return new Date(a.bookedAt).getTime() - new Date(b.bookedAt).getTime();
    });

  // Find position of this token
  const tokenIndex = deptWaitingTokens.findIndex(t => t.id === token.id);
  const queuePosition = tokenIndex !== -1 ? tokenIndex + 1 : 1;
  const aheadCount = Math.max(0, queuePosition - 1);

  // Department base service time
  const dept = departments.find(d => d.id === token.deptId);
  const baseServiceDuration = dept ? dept.avgServiceTime : 10;

  // Currently serving tokens count
  const currentlyServingInDept = allTokens.filter(
    t => t.deptId === token.deptId && t.status === "in_progress"
  ).length;

  // Queue prediction formula:
  // (aheadCount * baseServiceDuration) / activeCounterCount + residual of in-progress tokens
  const rawWaitMins = Math.ceil((aheadCount * baseServiceDuration) / activeCounterCount) + 
                      (currentlyServingInDept > 0 ? 3 : 0);

  // Priority adjustment
  const finalWaitMins = token.isPriority ? Math.max(2, Math.floor(rawWaitMins * 0.6)) : Math.max(2, rawWaitMins);

  // Calculate estimated turn time clock
  const now = new Date();
  const turnTime = new Date(now.getTime() + finalWaitMins * 60000);
  const formattedTurnTime = turnTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const minRange = Math.max(1, finalWaitMins - 2);
  const maxRange = finalWaitMins + 3;

  return {
    waitMins: finalWaitMins,
    queuePosition,
    aheadCount,
    estimatedTurnTime: `${formattedTurnTime} (approx. ${finalWaitMins} mins)`,
    formattedRange: `${minRange} - ${maxRange} mins`
  };
}

/**
 * Computes live load and congestion score for a department
 */
export function getDepartmentCongestion(deptId, tokens, counters) {
  const waiting = tokens.filter(t => t.deptId === deptId && t.status === "waiting").length;
  const inProgress = tokens.filter(t => t.deptId === deptId && t.status === "in_progress").length;
  const activeCounters = counters.filter(c => c.deptId === deptId && c.status === "serving").length;

  const loadIndex = waiting / Math.max(1, activeCounters);

  if (loadIndex <= 1.5) {
    return { level: "Low", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)", text: "Fast Moving", score: 20 };
  } else if (loadIndex <= 3.5) {
    return { level: "Moderate", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", text: "Normal Traffic", score: 55 };
  } else {
    return { level: "High", color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)", text: "Heavy Queue", score: 90 };
  }
}
