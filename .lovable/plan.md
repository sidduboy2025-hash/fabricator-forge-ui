

## Fabricator Management Platform — Foundation Build Plan

### Phase 1: Product Foundation

**1. App Shell & Layout**
- Left sidebar with all 12 navigation items (Dashboard, Projects, Inventory, Pricing Engine, Billing & Wallet, Payments, Supply Chain, OCR Uploads, Reports, Batch Processing, Admin Panel, Settings) using collapsible sidebar component with icons
- Top header bar: global search input, org switcher dropdown, notification bell with badge, profile avatar menu, wallet balance chip, language selector, offline indicator
- Main content area with responsive container
- Route setup for all 12 modules (placeholder pages initially)

**2. Visual System & Design Tokens**
- Extend Tailwind config with semantic status colors (success/warning/danger/info) and domain-specific tokens
- Typography scale for headings, body, labels, and data-dense tables
- Consistent badge/chip styles for statuses: Active, Completed, Pending, Error, Overdue, Low Stock, In Stock, Out of Stock, Paid, Draft
- Surface styles: cards with subtle borders, dense table rows, panel sections

**3. Reusable Components**
- `MetricCard` — KPI display with label, value, trend indicator, icon
- `StatusBadge` — semantic colored badges for all status types
- `DataTable` — enterprise table with sorting, filtering, search, pagination, column visibility, row actions, and multi-select
- `FilterBar` — composable filter row with dropdowns and date pickers
- `PageHeader` — title + description + actions layout
- `SideDrawer` — right-side drawer for detail/edit views
- `EmptyState` — illustration + message + CTA
- `ActivityTimeline` — vertical timeline for events
- `CurrencyDisplay` — formatted currency with symbol
- `ProgressBar` — labeled progress indicator
- `FileUploadZone` — drag-and-drop area
- `StepperIndicator` — horizontal workflow steps

**4. Mock Data Layer**
- Create `/src/data/` with realistic JSON datasets:
  - `projects.ts` — 15+ projects with varied statuses, clients, SFT values, costs
  - `inventory.ts` — 30+ items across Profiles/Glass/Hardware with stock levels including low/out states
  - `invoices.ts` — 20+ invoices with Paid/Pending/Overdue mix
  - `wallet.ts` — balance, transaction history, credit purchases
  - `pricingRules.ts` — region/customer-type based rules
  - `supplyChain.ts` — trader/distributor/fabricator entities
  - `ocrFiles.ts` — uploaded files with extraction status
  - `activityLog.ts` — recent system activities
  - `adminMetrics.ts` — revenue, users, ARPU data

### Phase 2: Global Application Experience

**5. Top Header Implementation**
- Global search with command palette feel (dropdown with recent/suggested)
- Org switcher: "Acme Fabricators" dropdown with 2-3 mock orgs
- Notification bell: dropdown with 5+ unread notifications
- Wallet balance: clickable chip showing ₹ balance
- Profile menu: avatar + name + role + logout
- Language toggle: EN / తెలుగు / हिंदी switcher (mock text swap)
- Offline badge: green/red dot indicator

**6. Sidebar Navigation**
- All 12 routes with Lucide icons
- Active route highlighting via NavLink
- Collapsible to icon-only mode
- Grouped sections: Operations (Dashboard, Projects, Inventory), Business (Pricing, Billing, Payments), Intelligence (OCR, Reports, Batch), System (Supply Chain, Admin, Settings)

**7. Global System States**
- Offline banner at top: "You're working offline. Changes will sync when connected."
- Sync queue indicator in sidebar footer
- Toast patterns for success/error/warning
- Empty states for all table views

**8. DataTable Standards**
- Column sorting (click headers)
- Filter dropdowns per column
- Global search input
- Pagination with page size selector
- Row action menus (view, edit, delete, process)
- Multi-select with bulk action bar
- Status column with colored badges

All pages will show placeholder content with the PageHeader component, ready for module-specific implementation in later phases.

