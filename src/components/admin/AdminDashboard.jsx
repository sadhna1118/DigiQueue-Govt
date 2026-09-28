import React, { useState } from "react";
import { useQueue } from "../../context/QueueContext";
import {
  ShieldCheck,
  TrendingDown,
  Users,
  CheckCircle2,
  Clock,
  Building2,
  BarChart3,
  Layers,
  PlusCircle,
  Megaphone,
  Download,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Radio,
  FileSpreadsheet,
  Activity,
  Edit2,
  Trash2,
  Sliders,
  Settings
} from "lucide-react";

export const AdminDashboard = () => {
  const {
    departments,
    setDepartments,
    counters,
    setCounters,
    tokens,
    broadcastAnnouncement,
    resetAllData,
    bookToken,
    showToast
  } = useQueue();

  const [activeAdminTab, setActiveAdminTab] = useState("overview"); // "overview" | "departments" | "counters" | "priority" | "reports" | "broadcast"
  const [announcementInput, setAnnouncementInput] = useState("");
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);

  // Form states for VIP / Emergency Priority Token
  const [priorityDeptId, setPriorityDeptId] = useState(departments[0]?.id || "");
  const [priorityCitizenName, setPriorityCitizenName] = useState("");
  const [priorityPhone, setPriorityPhone] = useState("");
  const [priorityReason, setPriorityReason] = useState("Medical / Disability Priority");

  // KPI Calculations
  const totalTokens = tokens.length;
  const completedTokens = tokens.filter(t => t.status === "completed").length;
  const waitingTokens = tokens.filter(t => t.status === "waiting").length;
  const inProgressTokens = tokens.filter(t => t.status === "in_progress" || t.status === "called").length;
  const skippedTokens = tokens.filter(t => t.status === "skipped").length;

  const completionRate = totalTokens > 0 ? Math.round((completedTokens / totalTokens) * 100) : 0;
  const avgWaitReduction = 68; // percentage saved vs manual queues
  const systemUptime = "99.98%";
  const satisfactionScore = "4.8 / 5.0";

  // Hourly traffic mock data for charts
  const hourlyData = [
    { hour: "09:00 AM", tokens: 18, wait: 6 },
    { hour: "10:00 AM", tokens: 42, wait: 12 },
    { hour: "11:00 AM", tokens: 68, wait: 16 }, // Peak
    { hour: "12:00 PM", tokens: 55, wait: 14 },
    { hour: "01:00 PM", tokens: 20, wait: 8 },
    { hour: "02:00 PM", tokens: 48, wait: 11 },
    { hour: "03:00 PM", tokens: 36, wait: 9 },
    { hour: "04:00 PM", tokens: 19, wait: 5 }
  ];

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!announcementInput.trim()) return;
    broadcastAnnouncement(announcementInput.trim());
    setAnnouncementInput("");
  };

  const handleIssuePriorityToken = (e) => {
    e.preventDefault();
    if (!priorityCitizenName.trim()) {
      showToast("Please enter citizen name", "warning");
      return;
    }

    const dept = departments.find(d => d.id === priorityDeptId);
    const service = dept?.services[0];

    bookToken({
      deptId: priorityDeptId,
      serviceId: service?.id || "",
      citizenName: priorityCitizenName.trim(),
      phone: priorityPhone || "+91 99999 00000",
      email: "",
      isPriority: true,
      priorityReason: priorityReason,
      slotTime: "Immediate Fast-Track",
      bookingType: "priority"
    });

    setIsPriorityModalOpen(false);
    setPriorityCitizenName("");
    setPriorityPhone("");
    showToast("Priority Fast-Track Token Issued!", "success");
  };

  const handleExportCSV = () => {
    const headers = "Token Number,Citizen Name,Phone,Department,Service,Status,Slot,Booked At\n";
    const rows = tokens.map(t => 
      `"${t.tokenNumber}","${t.citizenName}","${t.phone}","${t.deptName}","${t.serviceName}","${t.status}","${t.slotTime}","${t.bookedAt}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `digiqueue_gov_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast("Queue Report CSV downloaded successfully", "success");
  };

  return (
    <div className="admin-page container">
      {/* Admin Header */}
      <div className="admin-header-card">
        <div className="admin-title-left">
          <div className="admin-badge">
            <ShieldCheck size={16} />
            <span>EXECUTIVE COMMAND CENTER</span>
          </div>
          <h2>District E-Governance Queue Administration</h2>
          <p className="admin-sub">
            Real-time queue load monitoring, department throughput, counter management & performance analytics.
          </p>
        </div>

        <div className="admin-header-actions">
          <button className="btn-admin-action priority" onClick={() => setIsPriorityModalOpen(true)}>
            <Sparkles size={16} />
            <span>Issue Priority Token</span>
          </button>
          <button className="btn-admin-action" onClick={handleExportCSV}>
            <Download size={16} />
            <span>Export CSV Report</span>
          </button>
          <button className="btn-admin-action danger" onClick={resetAllData}>
            <RotateCcw size={16} />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Admin Sub-Navigation Tabs */}
      <div className="admin-nav-tabs">
        <button
          className={`admin-tab ${activeAdminTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveAdminTab("overview")}
        >
          <Activity size={16} />
          <span>Real-time KPIs & Overview</span>
        </button>

        <button
          className={`admin-tab ${activeAdminTab === "departments" ? "active" : ""}`}
          onClick={() => setActiveAdminTab("departments")}
        >
          <Building2 size={16} />
          <span>Departments & Quotas ({departments.length})</span>
        </button>

        <button
          className={`admin-tab ${activeAdminTab === "counters" ? "active" : ""}`}
          onClick={() => setActiveAdminTab("counters")}
        >
          <Sliders size={16} />
          <span>Counter Desks ({counters.length})</span>
        </button>

        <button
          className={`admin-tab ${activeAdminTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveAdminTab("reports")}
        >
          <BarChart3 size={16} />
          <span>Performance & Peak Reports</span>
        </button>

        <button
          className={`admin-tab ${activeAdminTab === "broadcast" ? "active" : ""}`}
          onClick={() => setActiveAdminTab("broadcast")}
        >
          <Megaphone size={16} />
          <span>Public Display Broadcast</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & REAL-TIME KPIS */}
      {activeAdminTab === "overview" && (
        <div className="admin-tab-content">
          {/* Top KPI Cards Grid */}
          <div className="kpi-cards-grid">
            <div className="gov-kpi-card">
              <div className="kpi-top">
                <span className="kpi-title">Wait Time Reduction</span>
                <TrendingDown size={20} className="kpi-icon green" />
              </div>
              <div className="kpi-big-number text-green">{avgWaitReduction}%</div>
              <p className="kpi-subtext">Compared to traditional manual physical queues</p>
            </div>

            <div className="gov-kpi-card">
              <div className="kpi-top">
                <span className="kpi-title">Daily Token Throughput</span>
                <Users size={20} className="kpi-icon blue" />
              </div>
              <div className="kpi-big-number text-blue">{totalTokens} Tokens</div>
              <p className="kpi-subtext">{completedTokens} Served • {waitingTokens} Waiting</p>
            </div>

            <div className="gov-kpi-card">
              <div className="kpi-top">
                <span className="kpi-title">Service Completion Rate</span>
                <CheckCircle2 size={20} className="kpi-icon purple" />
              </div>
              <div className="kpi-big-number text-purple">{completionRate}%</div>
              <p className="kpi-subtext">{skippedTokens} skipped / no-show today</p>
            </div>

            <div className="gov-kpi-card">
              <div className="kpi-top">
                <span className="kpi-title">Citizen Satisfaction</span>
                <Sparkles size={20} className="kpi-icon gold" />
              </div>
              <div className="kpi-big-number text-gold">{satisfactionScore}</div>
              <p className="kpi-subtext">Based on 124 verified citizen ratings</p>
            </div>
          </div>

          {/* Department Congestion & Counter Real-Time Grid */}
          <div className="admin-split-grid">
            {/* Real-time Department Load */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Live Department Load & Congestion Radar</h3>
              </div>
              <div className="admin-dept-list">
                {departments.map((dept) => {
                  const deptWait = tokens.filter(t => t.deptId === dept.id && t.status === "waiting").length;
                  const deptInProg = tokens.filter(t => t.deptId === dept.id && t.status === "in_progress").length;
                  const deptCompleted = tokens.filter(t => t.deptId === dept.id && t.status === "completed").length;

                  return (
                    <div key={dept.id} className="admin-dept-row">
                      <div className="dept-row-left">
                        <span className="dept-row-code" style={{ backgroundColor: dept.color }}>
                          {dept.code}
                        </span>
                        <div>
                          <strong>{dept.name}</strong>
                          <span className="dept-row-sub">{dept.floor}</span>
                        </div>
                      </div>

                      <div className="dept-row-metrics">
                        <span className="badge-metric waiting">
                          <strong>{deptWait}</strong> Waiting
                        </span>
                        <span className="badge-metric in-prog">
                          <strong>{deptInProg}</strong> Serving
                        </span>
                        <span className="badge-metric completed">
                          <strong>{deptCompleted}</strong> Done
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Counter Real-Time Status Board */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Counter Staff Status & Daily Metrics</h3>
              </div>
              <div className="admin-counters-table-wrap">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>Counter</th>
                      <th>Assigned Officer</th>
                      <th>Dept</th>
                      <th>Status</th>
                      <th>Served</th>
                    </tr>
                  </thead>
                  <tbody>
                    {counters.map((c) => (
                      <tr key={c.id}>
                        <td><strong>Counter {c.number}</strong></td>
                        <td>{c.staffName}</td>
                        <td><span className="dept-pill-small">{c.deptCode}</span></td>
                        <td>
                          <span className={`status-pill ${c.status}`}>
                            {c.status.toUpperCase()}
                          </span>
                        </td>
                        <td><strong>{c.servedToday || 0}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENTS & QUOTA CONFIGURATION */}
      {activeAdminTab === "departments" && (
        <div className="admin-tab-content">
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3>Department Service Timings & Quota Limits</h3>
                <p className="card-sub">Configure daily token quotas, operating hours, and average processing durations.</p>
              </div>
            </div>

            <div className="admin-dept-grid-manage">
              {departments.map((dept) => (
                <div key={dept.id} className="dept-manage-box" style={{ "--dept-color": dept.color }}>
                  <div className="manage-box-top">
                    <span className="dept-tag-lg">{dept.code}</span>
                    <span className="dept-hours-pill">🕒 {dept.operatingHours}</span>
                  </div>

                  <h4>{dept.name}</h4>
                  <p className="manage-desc">{dept.description}</p>

                  <div className="manage-meta-grid">
                    <div className="meta-item">
                      <span className="lbl">Daily Quota Limit:</span>
                      <strong>{dept.dailyTokenLimit} Tokens</strong>
                    </div>
                    <div className="meta-item">
                      <span className="lbl">Avg Processing:</span>
                      <strong>{dept.avgServiceTime} mins / citizen</strong>
                    </div>
                  </div>

                  <div className="manage-services-list">
                    <span className="lbl">Active Services ({dept.services.length}):</span>
                    <ul>
                      {dept.services.map((s) => (
                        <li key={s.id}>
                          <span>{s.name}</span>
                          <span className="fee-tag">{s.fee}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COUNTER DESKS MANAGEMENT */}
      {activeAdminTab === "counters" && (
        <div className="admin-tab-content">
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3>Operational Counter Desks & Staff Allocation</h3>
                <p className="card-sub">Manage physical desks, assigned officers, and department specializations.</p>
              </div>
            </div>

            <div className="counters-manage-grid">
              {counters.map((c) => (
                <div key={c.id} className={`counter-manage-card ${c.status}`}>
                  <div className="cnt-top">
                    <span className="cnt-num">Counter {c.number}</span>
                    <span className={`cnt-status-pill ${c.status}`}>{c.status.toUpperCase()}</span>
                  </div>

                  <h4>{c.name}</h4>
                  <div className="cnt-officer-info">
                    <span className="officer-name">{c.staffName}</span>
                    <span className="officer-role">{c.staffRole}</span>
                  </div>

                  <div className="cnt-stats-strip">
                    <div>Served Today: <strong>{c.servedToday || 0}</strong></div>
                    <div>Avg Speed: <strong>{c.avgServiceTimeMins || 9}m</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PERFORMANCE & PEAK REPORTS */}
      {activeAdminTab === "reports" && (
        <div className="admin-tab-content">
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3>Hourly Token Volume & Peak Traffic Heatmap</h3>
                <p className="card-sub">Visual analysis of citizen arrivals and average waiting duration across operational hours.</p>
              </div>
            </div>

            {/* Hourly SVG Bar Chart */}
            <div className="chart-container">
              <div className="chart-bars-wrap">
                {hourlyData.map((h, i) => {
                  const heightPct = (h.tokens / 70) * 100;
                  const isPeak = h.tokens > 50;

                  return (
                    <div key={i} className="chart-bar-col">
                      <div className="bar-value-tooltip">{h.tokens} tokens</div>
                      <div className="bar-track">
                        <div
                          className={`bar-fill ${isPeak ? "peak-bar" : ""}`}
                          style={{ height: `${heightPct}%` }}
                        ></div>
                      </div>
                      <div className="bar-label">{h.hour}</div>
                      <div className="bar-sub-wait">~{h.wait}m wait</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="chart-legend-row">
              <span className="legend-item"><span className="legend-dot normal"></span> Normal Traffic (&lt;45 tokens/hr)</span>
              <span className="legend-item"><span className="legend-dot peak"></span> Peak Rush Hour (10:30 AM - 12:30 PM)</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PUBLIC DISPLAY BROADCAST */}
      {activeAdminTab === "broadcast" && (
        <div className="admin-tab-content">
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <Megaphone size={20} className="text-blue" />
                <h3>Public Waiting Hall Display Broadcast</h3>
                <p className="card-sub">Publish live scrolling marquee announcements and audio voice broadcasts to all TV screens.</p>
              </div>
            </div>

            <form onSubmit={handleBroadcast} className="broadcast-form">
              <label className="form-label">Announcement Text / Public Notice:</label>
              <textarea
                className="gov-textarea"
                rows={3}
                placeholder="e.g. Notice: Biometric servers will undergo scheduled maintenance at 01:00 PM. Please visit Counter 05 for civil registrations."
                value={announcementInput}
                onChange={(e) => setAnnouncementInput(e.target.value)}
                required
              ></textarea>

              <div className="broadcast-action-bar">
                <span className="broadcast-hint">📢 Will trigger synthesized voice speech + flashing ticker on all displays.</span>
                <button type="submit" className="btn-broadcast-submit">
                  <Megaphone size={16} />
                  <span>Broadcast to All Waiting Halls</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Priority Fast-Track Modal */}
      {isPriorityModalOpen && (
        <div className="book-modal-overlay" onClick={() => setIsPriorityModalOpen(false)}>
          <div className="reschedule-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title-wrap">
              <span className="modal-step-badge">VIP / Fast-Track</span>
              <h3>Issue Emergency Priority Token</h3>
              <p>Direct priority queue injection for VIP, medical, or senior citizen cases.</p>
            </div>

            <form onSubmit={handleIssuePriorityToken} className="my-4">
              <div className="form-group mb-3">
                <label className="form-label">Department:</label>
                <select
                  className="gov-select"
                  value={priorityDeptId}
                  onChange={(e) => setPriorityDeptId(e.target.value)}
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Citizen Name *</label>
                <input
                  type="text"
                  className="gov-input"
                  placeholder="e.g. Smt. Kamala Devi"
                  value={priorityCitizenName}
                  onChange={(e) => setPriorityCitizenName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Mobile Number</label>
                <input
                  type="tel"
                  className="gov-input"
                  placeholder="e.g. 9876543210"
                  value={priorityPhone}
                  onChange={(e) => setPriorityPhone(e.target.value)}
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Priority Ground / Reason</label>
                <select
                  className="gov-select"
                  value={priorityReason}
                  onChange={(e) => setPriorityReason(e.target.value)}
                >
                  <option value="Senior Citizen (Super Senior >75 yrs)">Senior Citizen (Super Senior &gt;75 yrs)</option>
                  <option value="Differently Abled (PWD Special Assistance)">Differently Abled (PWD Special Assistance)</option>
                  <option value="Medical Emergency / Critical Need">Medical Emergency / Critical Need</option>
                  <option value="Administrative / VIP Override">Administrative / VIP Override</option>
                </select>
              </div>

              <div className="wizard-actions">
                <button type="button" className="btn-wizard-back" onClick={() => setIsPriorityModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-wizard-submit">
                  <Sparkles size={16} />
                  <span>Issue & Place at Top of Queue</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
