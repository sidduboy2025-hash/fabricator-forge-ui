# Fabricator Forge: Comprehensive Product Overview

This document provides an exhaustive, end-to-end breakdown of everything present within the **Fabricator Forge UI**. It is generated strictly by analyzing the application's source code, completely ignoring external PRD or scoping documents, answering precisely *what* every option does and *why* it exists in the product.

---

## 1. Application Shell & Global Layout
The layout wrap the main content and provides global utilities accessible from anywhere in the app.

### A. Sidebar Navigation (`AppSidebar`)
The sidebar groups application modules into four macro-categories to streamline navigation:
- **Operations:** Execution-focused (Dashboard, Projects, Inventory)
- **Business:** Financial-focused (Pricing, Billing, Payments)
- **Intelligence:** AI and Data-focused (OCR Uploads, Reports, Batch Processing)
- **System:** Admin and Setup-focused (Supply Chain, Admin, Settings)
- **System Status Indicator:** Always shows "All systems online" at the bottom to reassure users of cloud/database uptime.

### B. Global Header (`AppHeader`)
The header provides quick actions and state indicators without leaving the current screen.
- **Organization Switcher (Top Left):** Dropdown allowing users to switch contexts if they manage multiple fabrication units or entities (e.g., Owner of "Acme Fabricators" vs Admin of "Southern Glass Works"). **Why:** Essential for multi-tenant or umbrella users.
- **Global Search Bar:** For quickly finding projects, invoices, or inventory items by name or ID. **Why:** Eliminates the need to navigate to specific pages for quick lookups.
- **Offline Indicator:** A dynamic dot (Green/Red) indicating network connectivity. **Why:** Prevents users from losing work or making requests when their internet connection drops.
- **Language Switcher (Globe Icon):** Allows toggling between EN (English), తెలుగు (Telugu), and हिंदी (Hindi). **Why:** Localizes the UI for regional site managers or ground staff.
- **Wallet Quick View:** Displays the real-time prepaid wallet balance. Clicking or viewing this reminds users of their current credit limits for SFT processing.
- **Notification Bell:** Shows an unread count bug. Clicking lists real-time updates like overdue invoices, stock alerts, OCR completions, or received payments. **Why:** Central hub for asynchronous system alerts.
- **User Profile:** Displays the user initials, name, and email. Includes links for Profile, Preferences, and Log out.

---

## 2. Operations Module

### 2.1 Dashboard (`DashboardPage`)
The nerve center of the app providing a high-level summary.
- **Metric Cards:**
  - **Total SFT:** Showcases volume of work (e.g., 12.4% trend vs last month).
  - **Wallet Balance:** Financial health of the account.
  - **Revenue:** Summarized billed amounts for quick financial reference.
  - **Pending Invoices:** Number of overdue/unpaid customer bills.
  - **Low Stock Alerts:** Number of inventory items close to depletion.
  - **Active Projects:** Number of ongoing fabrications.
- **Usage Meter (SFT vs Credits):** Dual progress bars comparing Monthly SFT used versus Prepaid Credits consumed. **Why:** Fabrication Forge likely charges users based on SFT processed or API credits used. This warrants constant visibility to prevent unexpected service limits.
- **Stock Alerts Widget:** Lists top 4 items not "in-stock". **Why:** Quick operational action without navigating to inventory.
- **Recent Activity Timeline:** Logs what just happened in the system (e.g., payments received, OCR finished).
- **Pending/Overdue Payments Widget:** List of urgent invoices that require collection.

### 2.2 Projects (`ProjectsPage`)
Manages ongoing fabrication jobs.
- **New Project Button:** To instantiate a new job.
- **Projects Data Table:**
  - **Columns:** ID, Project Name, Client, Total SFT, Status (Active/Complete), Cost Estimate, Progress Bar.
  - **Why:** To track execution percentage of jobs and identify which client owns which work, ensuring deadlines and estimated costs align.

### 2.3 Inventory (`InventoryPage`)
Tracks raw materials across various categories.
- **Metric Cards:** Splits counts between Profiles, Glass, and Hardware. Indicates trends like "items need restock".
- **Inventory Data Table:**
  - **Columns:** ID, Item Name, Category, Quantity, Unit, Location, Status (In-stock, Low-stock, Out-of-stock).
  - **Why:** Fabricators must know exactly what physical goods they have on hand (e.g., Corner Profile 90°, Clear Glass 6mm) and exactly where they are located. Status badges instantly inform procurement needs.

---

## 3. Business Module

### 3.1 Pricing Engine (`PricingPage`)
A rules engine defining how the system quotes projects or generates estimates.
- **Pricing Rules Data Table:**
  - **Columns:** ID, Region (e.g., South-India), Customer Type (e.g., B2B, B2C), Material, Price per SFT, Margin %, Markup %, Status.
  - **Why:** Fabricators charge different rates dynamically based on geography, customer relationship type, and material used. This centralizes those configurations so estimates are consistently generated without manual calculations.

### 3.2 Billing & Wallet (`BillingPage`)
Manages the application's internal credits economy.
- **Metric Cards:** Wallet Balance, Total Credits Used, Total Purchased.
- **Ledger Table:** Tracks every transaction (Credit Purchases, SFT Deductions, Refunds). Each describes the act (e.g., "Monthly SFT platform fee") with the resulting amount and SFT Units associated.
- **Why:** A transparent audit log so the user understands exactly how their pre-paid wallet balance is being drained by the platform's usage.

### 3.3 Payments (`PaymentsPage`)
Manages external accounts receivable (what clients owe the fabricator).
- **Metric Cards:** Sum totals for Paid, Pending, and Overdue invoices.
- **Invoices Data Table:**
  - **Columns:** Invoice ID, Client, Amount, GST (tax), Total amount, Status, Due Date.
  - **Why:** Cash flow management. Provides clear visibility into who needs to be chased for overdue balances and tracks exact tax variables per bill.

---

## 4. Intelligence Module

### 4.1 OCR Uploads (`OcrPage`)
AI-assisted document reading automation.
- **File Upload Zone:** Drag-and-drop area for `.pdf, .jpg, .png` files.
- **Uploads Data Table:**
  - **Columns:** File Name, Type (e.g., Architectural Drawing, BOQ), Status, Confidence %, Upload Date.
  - **Why:** Users receive complex architectural plans or physical PDFs. They upload them here, and the AI extracts dimensions or bill of quantities (BOQ). The "Confidence %" tells the user whether they can trust the AI data or if they need to manually verify it.

### 4.2 Reports (`ReportsPage`)
Analytical summarization and compliance.
- **Action Buttons:** Expand to Excel or PDF. **Why:** Necessary for sharing with accountants or offline filing.
- **Metrics:** Total Revenue (excl. GST), Total GST Collected, Invoices Paid.
- **GST Summary Table:** A quarterly breakdown showing Taxable Amount, CGST, SGST, and Total GST per month.
- **Why:** Purely for regulatory tax compliance and easing the burden of month-end or quarter-end accounting.

### 4.3 Batch Processing (`BatchPage`)
Optimization utility for physical fabrication yield.
- **Selection List:** Checkboxes to select multiple active projects.
- **Optimization Calculator:** Aggregates selected projects to show Total SFT, Combined Cost, and Estimated Savings (Cost * 12%).
- **Why:** If a fabricator runs multiple projects using the same material profile, batch-cutting them together saves waste material. This tool allows them to select a set of projects and let the engine optimize the cut-lists, predicting exact financial savings.

---

## 5. System Module

### 5.1 Supply Chain (`SupplyChainPage`)
Ecosystem management and integration.
- **Entity View:** Splits network into Traders, Distributors, and Fabricators.
- **Entity Cards:** Shows the business name, location, number of linked entities, sync status (Synced, Pending, Failed), and date of last sync.
- **Why:** Fabricator Forge likely operates as a connected network. This panel shows if the application is communicating successfully with the systems of raw material suppliers (Distributors/Traders).

### 5.2 Admin Panel (`AdminPage`)
High-level SaaS oversight, primarily meant for the platform owner to view usage.
- **Metric Cards:** Total Revenue, Active Users, ARPU (Average Revenue Per User), System Uptime.
- **Revenue Trend View:** Shows monthly user growth against revenue generation.
- **Usage Analytics:** Shows platform-wide SFT processed, credit consumption %, avg response time, and support tickets.
- **Why:** This is the internal health monitor ensuring the business logic of the SaaS application is thriving and stable.

### 5.3 Settings (`SettingsPage`)
User and organization preferences.
- **Organization Setup:** Modifying the company name and default operating region (e.g., South/North India). **Why:** The default region impacts the Pricing Engine rules automatically applied to new projects.
- **Notifications Toggles:** Switches to configure whether alerts for low stock, payment reminders, project updates, or OCR completions are received. **Why:** To prevent alert fatigue by allowing users to silence irrelevant notifications.

---

## Conclusion
The application functions as a vertical SaaS ERP tailored specifically for fabrication businesses. It uses a prepaid credit model (wallet) to meter usage while providing full operational tools—from AI-driven plan extraction (OCR) and material optimization (Batching) to traditional business operations like Inventory control, AR (Payments), and GST reporting. Everything built into the UI is designed to minimize material waste, automate manual data entry, and assure financial compliance.
