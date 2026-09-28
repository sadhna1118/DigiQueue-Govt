import React from "react";
import { QueueProvider, useQueue } from "./context/QueueContext";
import { Navbar } from "./components/common/Navbar";
import { NotificationDrawer } from "./components/common/NotificationDrawer";
import { PrintTicketModal } from "./components/common/PrintTicketModal";
import { BookTokenModal } from "./components/citizen/BookTokenModal";
import { CitizenHome } from "./components/citizen/CitizenHome";
import { TrackTokenView } from "./components/citizen/TrackTokenView";
import { DepartmentDirectory } from "./components/citizen/DepartmentDirectory";
import { PublicDisplayBoard } from "./components/display/PublicDisplayBoard";
import { StaffDashboard } from "./components/staff/StaffDashboard";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { SelfServiceKiosk } from "./components/kiosk/SelfServiceKiosk";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

const MainAppContent = () => {
  const { activeView, toastMessage } = useQueue();

  return (
    <div className="app-shell">
      {/* Navbar is shown on all views except Fullscreen Waiting Hall TV & Kiosk mode */}
      {activeView !== "display" && activeView !== "kiosk" && <Navbar />}

      {/* View Switcher */}
      <main className="main-content">
        {activeView === "citizen" && <CitizenHome />}
        {activeView === "tracker" && <TrackTokenView />}
        {activeView === "services" && <DepartmentDirectory />}
        {activeView === "display" && <PublicDisplayBoard />}
        {activeView === "staff" && <StaffDashboard />}
        {activeView === "admin" && <AdminDashboard />}
        {activeView === "kiosk" && <SelfServiceKiosk />}
      </main>

      {/* Global Modals & Drawers */}
      <BookTokenModal />
      <PrintTicketModal />
      <NotificationDrawer />

      {/* Global Toast Alert */}
      {toastMessage && (
        <div className={`gov-toast toast-${toastMessage.type}`}>
          {toastMessage.type === "success" && <CheckCircle2 size={18} className="text-success" />}
          {toastMessage.type === "warning" && <AlertTriangle size={18} className="text-warning" />}
          {toastMessage.type === "info" && <Info size={18} className="text-info" />}
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Subtle Floating Navigation Quick Return if in TV or Kiosk mode */}
      {(activeView === "display" || activeView === "kiosk") && (
        <div className="floating-portal-return no-print">
          <button
            className="btn-return-portal"
            onClick={() => window.location.reload()}
            title="Return to Citizen Portal"
          >
            ← Exit to Main Portal
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <QueueProvider>
      <MainAppContent />
    </QueueProvider>
  );
}
