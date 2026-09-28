import React, { useState } from "react";
import { useQueue } from "../../context/QueueContext";
import {
  BookOpen,
  Search,
  FileText,
  Clock,
  CheckCircle2,
  DollarSign,
  PlusCircle,
  MapPin,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  Building
} from "lucide-react";

export const DepartmentDirectory = () => {
  const { departments, setIsBookModalOpen } = useQueue();
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("all");
  const [directorySearch, setDirectorySearch] = useState("");

  const filteredServices = [];
  departments.forEach(dept => {
    if (selectedDeptFilter === "all" || selectedDeptFilter === dept.id) {
      dept.services.forEach(srv => {
        const matchesSearch = srv.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
                              srv.description.toLowerCase().includes(directorySearch.toLowerCase()) ||
                              dept.name.toLowerCase().includes(directorySearch.toLowerCase());
        if (matchesSearch) {
          filteredServices.push({
            ...srv,
            deptName: dept.name,
            deptCode: dept.code,
            deptFloor: dept.floor,
            deptColor: dept.color
          });
        }
      });
    }
  });

  return (
    <div className="directory-page container">
      {/* Directory Header */}
      <div className="directory-header-card">
        <div className="dir-badge">
          <BookOpen size={14} />
          <span>E-GOVERNANCE SERVICE COMPENDIUM</span>
        </div>
        <h2>Citizen Services & Document Checklist Directory</h2>
        <p className="dir-sub">
          Review mandatory required documents, official government fee schedules, and average service durations before visiting the counter.
        </p>

        {/* Filter & Search Bar */}
        <div className="dir-controls-grid">
          <div className="dir-search-wrap">
            <Search size={18} className="dir-search-icon" />
            <input
              type="text"
              placeholder="Search across all government certificates, licenses & tax services..."
              value={directorySearch}
              onChange={(e) => setDirectorySearch(e.target.value)}
              className="dir-search-input"
            />
          </div>

          <div className="dir-tabs-scroll">
            <button
              className={`dir-tab-btn ${selectedDeptFilter === "all" ? "active" : ""}`}
              onClick={() => setSelectedDeptFilter("all")}
            >
              All Departments ({filteredServices.length})
            </button>
            {departments.map((dept) => (
              <button
                key={dept.id}
                className={`dir-tab-btn ${selectedDeptFilter === dept.id ? "active" : ""}`}
                onClick={() => setSelectedDeptFilter(dept.id)}
              >
                {dept.code} — {dept.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="dir-services-grid">
        {filteredServices.map((service) => (
          <div key={service.id} className="service-doc-card">
            <div className="srv-doc-top">
              <span className="srv-dept-code" style={{ backgroundColor: service.deptColor }}>
                {service.deptCode}
              </span>
              <span className="srv-fee-badge">{service.fee === "Free" ? "🆓 Free Service" : `Official Fee: ${service.fee}`}</span>
            </div>

            <h3 className="srv-card-title">{service.name}</h3>
            <p className="srv-card-desc">{service.description}</p>

            <div className="srv-location-strip">
              <MapPin size={13} />
              <span>{service.deptName} • {service.deptFloor}</span>
            </div>

            <div className="srv-turnaround-row">
              <div className="turnaround-item">
                <Clock size={14} />
                <span>Avg Counter Time: <strong>~{service.duration} mins</strong></span>
              </div>
              <div className="turnaround-item">
                <ShieldCheck size={14} />
                <span>Daily Quota: <strong>{service.quota} Tokens</strong></span>
              </div>
            </div>

            {/* Document Checklist Accordion Box */}
            <div className="srv-docs-box">
              <div className="docs-box-title">
                <FileText size={14} />
                <span>Mandatory Documents Required Checklist:</span>
              </div>
              <ul className="docs-checklist">
                {service.docs.map((doc, i) => (
                  <li key={i}>
                    <CheckCircle2 size={13} className="doc-check-icon" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Book Token Button */}
            <button
              className="btn-card-book"
              onClick={() => setIsBookModalOpen(true)}
            >
              <PlusCircle size={16} />
              <span>Book Token for this Service</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
