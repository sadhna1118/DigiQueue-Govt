# 🏛️ DigiQueue Gov — Digital Queue Management System for Government Offices
https://sadhna1118.github.io/DigiQueue-Govt/
An ultra-modern, production-grade, full-stack Digital Queue Management System (DQMS) designed to eliminate physical queues, prevent overcrowding, and streamline public service access in government offices (Collectorate, RTO, Revenue, Municipal Corporation, Passport & Seva Kendras).

---

## 🌟 Key Highlights & Features

### 1. 🏛️ Citizen Portal & Online Token Booking
- **Smart Service Directory**: Search and browse 20+ government services across Revenue, Transport (RTO), Civil Registry, Passport/UIDAI, and Social Welfare.
- **4-Step Booking Wizard**: Select Department & Service $\rightarrow$ Choose 30-Minute Arrival Slot $\rightarrow$ Enter Citizen Details & Priority Category $\rightarrow$ Instant E-Token Generation with celebration confetti.
- **Official E-Token Slip**: Printable government slip complete with deterministic SVG QR code, barcode, allocated counter, directions, and required document checklist.
- **Special Care & Priority Access**: Expedited queue routing for Senior Citizens (>60 yrs), Differently-Abled (PWD), and medical emergencies.

### 2. 📍 Real-Time Live Queue Tracker
- **Dynamic Queue Position**: Live updates showing exact queue rank (e.g. `Position #3 in line`, `1 citizen ahead`).
- **AI-Assisted Wait-Time Prediction**: Intelligent wait-time estimation based on active counter throughput, department complexity, and queue load.
- **Animated Progress Stepper**: `Booked` $\rightarrow$ `Waiting in Queue` $\rightarrow$ `Called to Counter` $\rightarrow$ `Service Completed`.
- **Citizen Actions**: Reschedule time slot, cancel token, trigger instant SMS status alert, or submit post-service 5-star ratings & feedback.

### 3. 📺 Public Waiting Hall Digital TV Display
- **Split-Screen Signage Layout**:
  - **NOW SERVING (Counters 01 to 08)**: High-contrast counter cards with glowing visual flash animations upon token call.
  - **UP NEXT IN QUEUE**: Real-time queue waitlist ticker.
  - **Live Digital Clock**: Real-time second-by-second clock with date and department filter.
  - **Public Marquee Ticker**: Scrolling announcement banner for notifications and guidelines.
- **Audio Announcement Engine**: Dual-tone synthesized chime tone via Web Audio API + natural voice synthesizer via Web Speech API (*"Attention please. Token REV 101, please proceed to Counter 01"*).

### 4. 👨‍💼 Staff / Counter Operator Console
- **Counter Profile Switcher**: Operate any of the 8 counters (Revenue Officer, Transport Inspector, Civil Registrar, etc.).
- **Counter Status Control**: Toggle between `Active / Serving`, `On Break (Tea/Lunch)`, and `Offline`.
- **Active Citizen Service Desk**:
  - `📢 Call Next Citizen`: Intelligently prioritizes VIP/PWD tokens and oldest bookings.
  - `🔔 Recall / Ring Bell`: Re-announces the token over waiting hall speakers.
  - `▶️ Start Service` & `⏱️ Active Service Stopwatch`: Live timer tracking handling duration.
  - `✅ Mark Completed`: Concludes interaction with officer notes and SMS completion alert.
  - `⏭️ Skip / No-Show`: Moves absent citizens to a holding queue with recall capabilities.
  - `🔀 Transfer Citizen`: Re-routes citizen to specialized counters or departments.

### 5. 🛡️ Executive Admin Command Center & Analytics
- **Executive KPIs**: Real-time Wait Time Reduction (68%), Daily Token Throughput, Service Completion Rate, and Citizen Satisfaction Score (4.8/5.0).
- **Department & Quota Manager**: Configure daily token quotas, operating hours, and average processing durations.
- **Counter Desks Allocator**: Manage physical desks and assigned officer roles.
- **Peak Hour Traffic Heatmap**: Visual hourly bar chart showing peak arrival windows (10:30 AM – 12:30 PM) and wait duration trends.
- **Priority Token Injection**: Direct administrative fast-track token issuance for VIP or emergency cases.
- **Public Display Broadcaster**: Publish live scrolling marquee text and audio broadcasts to all TV screens.
- **Data Export**: One-click CSV export of full daily queue logs.

### 6. 🖥️ Self-Service Touchscreen Kiosk
- **Walk-in Citizen Mode**: Touch-optimized interface for citizens visiting offices without internet.
- **3-Tap Token Dispenser**: Touch Department $\rightarrow$ Touch Service $\rightarrow$ Enter Mobile via Touch Numpad $\rightarrow$ Dispense physical token slip.

### 7. 📱 Real-Time Simulated Notification Hub
- Integrated SMS & Email dispatch simulation log tray delivering instant alerts on booking, counter calling, reminders, and service completion.

### 8. 🚀 Live Traffic Simulator
- One-click toggle in the navbar to simulate real-time live queue traffic, advancing counters, completing services, and triggering audio announcements dynamically.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, JavaScript (ESNext), Vite
- **Styling**: Modern Vanilla CSS Design System with Glassmorphism, Deep Slate & Navy palette, and high-contrast responsive layouts
- **Icons**: Lucide React
- **Animations & Effects**: Canvas Confetti, CSS Keyframe Glows & Tickers
- **Audio & Voice**: Web Audio API (synthetic dual-frequency chime) + Web Speech API (`SpeechSynthesisUtterance`)
- **State & Storage**: Centralized `QueueContext` with LocalStorage persistence

---

## 🚀 Getting Started Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 📊 System Architecture & Data Model

```
├── src/
│   ├── components/
│   │   ├── admin/          # Executive Admin Dashboard & Reports
│   │   ├── citizen/        # Citizen Portal, Token Booking & Live Tracker
│   │   ├── common/         # Navbar, SMS/Email Hub, Ticket Modal
│   │   ├── display/        # Public TV Waiting Hall Display Board
│   │   ├── kiosk/          # Walk-in Self-Service Touchscreen Kiosk
│   │   └── staff/          # Counter Operator Calling Console
│   ├── context/
│   │   └── QueueContext.jsx# Reactive central state & queue algorithms
│   ├── data/
│   │   └── initialData.js  # Preloaded government departments & counters
│   ├── utils/
│   │   ├── audioAnnouncer.js    # Chime & Voice announcement engine
│   │   ├── ticketGenerator.js   # QR & printable token slip helper
│   │   └── waitTimeEstimator.js # Predictive wait-time algorithm
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
```

---

## 📄 License
This project is developed for government office queue modernization and public digital governance.
