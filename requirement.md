# Salesforce Lightning Inspired CRM Demo

A lightweight CRM demo website inspired by the **Salesforce Lightning** interface.  
The goal is not to clone Salesforce completely, but to build a clean CRM-style web app that supports common CRM patterns such as **Object List View**, **Record Detail**, **Details / Activity / Related tabs**, **CRUD forms**, **related records**, and **Opportunity Kanban**.

This project is designed for:

- Demoing CRM workflows
- Practicing E2E automation
- Testing Shadow DOM levels
- Building a maintainable MVP that can be extended later

---

## 1. Tech Stack

Recommended stack:

| Layer | Technology |
|---|---|
| Framework | Next.js App Router |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Neon PostgreSQL Free |
| ORM | Prisma |
| Deployment | Vercel |
| Authentication | Mock login for MVP |
| Testing target | E2E-friendly UI with `data-testid` |

---

## 2. Product Goal

Build a sample CRM website with a UI similar to Salesforce Lightning.

Main CRM objects:

```text
Leads
Accounts
Contacts
Opportunities
Activities / Tasks
Dashboard
```

Core UI patterns:

```text
1. App Shell
2. Object List View
3. Record Detail Page
4. Details / Activity / Related tabs
5. New/Edit/Delete modal
6. Related Lists
7. Opportunity Kanban
8. Search / Filter / Sort / Pagination
```

---

## 3. Overall App Layout

```text
┌────────────────────────────────────────────────────────────────────┐
│ App Launcher | CRM Demo | Global Search     Help Settings Profile │
├────────────────────────────────────────────────────────────────────┤
│ Home | Leads | Accounts | Contacts | Opportunities | Reports      │
├────────────────────────────────────────────────────────────────────┤
│ Main Content                                                       │
│                                                                    │
│ List View / Record Detail / Dashboard / Kanban                     │
└────────────────────────────────────────────────────────────────────┘
```

### Main areas

| Area | Description |
|---|---|
| Top Header | Logo, app name, global search, profile menu |
| App Launcher | 9-dot icon, opens app/module list |
| Navigation Bar | Home, Leads, Accounts, Contacts, Opportunities |
| Main Content | Current page content |
| Toast | Success/error notifications |
| Modal | Create, edit, delete confirmation |
| Breadcrumb | Example: `Contacts > Nguyen Van A` |

---

## 4. Visual Style Guide

Suggested Salesforce-like style:

| Item | Value |
|---|---|
| Background | `#f3f6f9` |
| Card background | `#ffffff` |
| Border | `#d8dde6` |
| Primary blue | `#0176d3` |
| Text | `#181818` |
| Border radius | `4px - 8px` |
| Font | System font / Inter / Arial |

General UI style:

```text
- Clean SaaS dashboard layout
- Light background
- White cards
- Thin border
- Compact table
- Blue primary actions
- Small badges for status/stage
```

---

## 5. MVP Scope

### Phase 1 — Core UI

```text
App Shell
Home Dashboard
Accounts List + Detail
Contacts List + Detail
Leads List + Detail
Opportunities List
```

### Phase 2 — CRUD

```text
Create / Edit / Delete Account
Create / Edit / Delete Contact
Create / Edit / Delete Lead
Create / Edit / Delete Opportunity
```

### Phase 3 — Salesforce-like UX

```text
Details / Activity / Related tabs
Activity Timeline
Related Lists
Toast
Confirm modal
Search
Filter
Sort
Pagination
```

### Phase 4 — Demo nâng cao

```text
Opportunity Kanban
Lead Convert mock
Global Search
Role/Permission mock
Shadow DOM level 1/2/3
Reset seed data
```

---

## 6. Home Dashboard

The Home page shows a CRM overview.

```text
┌──────────────────────────────────────────────────────────────┐
│ Home                                                         │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│ Total Leads │ Accounts    │ Open Deals  │ Revenue Pipeline │
│ 128         │ 34          │ 18          │ $120,000         │
├──────────────────────────────────────────────────────────────┤
│ Recent Activities                                            │
│ - Called Nguyen Van A                                        │
│ - Created Opportunity CRM Deal                               │
├──────────────────────────────────────────────────────────────┤
│ Upcoming Tasks                                               │
│ - Follow up ABC Software                                     │
└──────────────────────────────────────────────────────────────┘
```

### Features

| Feature | Description |
|---|---|
| Summary cards | Count Leads, Accounts, Contacts, Opportunities |
| Recent activities | Show latest call/task/note |
| Upcoming tasks | Show open tasks |
| Quick actions | New Lead, New Contact, New Opportunity |

---

## 7. Object List View

Object List View is the main screen for each CRM module.

Example: Contacts List

```text
┌────────────────────────────────────────────────────────────────────┐
│ Contacts                                             [New Contact] │
│ List View: All Contacts ▼        Search this list...               │
│ Filters: Account ▼ | Owner ▼ | Status ▼ | Created Date ▼           │
├────┬──────────────┬──────────────┬──────────────┬──────────┬──────┤
│ □  │ Name         │ Account      │ Title        │ Email    │ ...  │
├────┼──────────────┼──────────────┼──────────────┼──────────┼──────┤
│ □  │ Nguyen Van A │ ABC Software │ QA Manager   │ a@abc... │ ...  │
│ □  │ Tran Thi B   │ XYZ Corp     │ CEO          │ b@xyz... │ ...  │
└────┴──────────────┴──────────────┴──────────────┴──────────┴──────┘
```

### UI sections

| Section | Description |
|---|---|
| Page title | Object name: Leads, Accounts, Contacts |
| Primary button | New Lead / New Contact / New Account |
| List View dropdown | All, My, Recently Viewed |
| Search box | Search inside current list |
| Filter panel | Status, Owner, Account, Created Date |
| Table | Record list |
| Row action | View, Edit, Delete, Clone |
| Bulk action | Select multiple records |
| Pagination | Previous / Next or page size |
| Empty state | “No records found” |
| Loading state | Skeleton table |
| Error state | Error message + Retry |

### Common list functions

| Function | MVP |
|---|---|
| View list | Required |
| Search | Required |
| Filter | Required |
| Sort column | Recommended |
| Pagination | Recommended |
| Create record | Required |
| Edit record | Required |
| Delete record | Required |
| Row action menu | Required |
| Bulk delete | Later phase |

---

## 8. Record Detail Page

When the user clicks a record, open its detail page.

Example: Contact Detail

```text
┌────────────────────────────────────────────────────────────────────┐
│ Contact                                                            │
│ Nguyen Van A                         [Edit] [Delete] [Clone] ...   │
│ Account: ABC Software | Title: QA Manager | Owner: Duy             │
├────────────────────────────────────────────────────────────────────┤
│ [Details] [Activity] [Related]                                     │
├────────────────────────────────────────────────────────────────────┤
│ Content by selected tab                                            │
└────────────────────────────────────────────────────────────────────┘
```

### Header fields

| Item | Example |
|---|---|
| Object label | Contact |
| Record name | Nguyen Van A |
| Key field 1 | Account: ABC Software |
| Key field 2 | Title: QA Manager |
| Key field 3 | Owner: Duy |
| Actions | Edit, Delete, Clone, New Task |

### Standard tabs

```text
Details | Activity | Related
```

---

## 9. Details Tab

Details tab displays the main record information.

```text
Details
────────────────────────────────────
Personal Information
- First Name
- Last Name
- Title
- Department

Contact Information
- Email
- Phone
- Mobile

System Information
- Owner
- Created Date
- Last Modified Date
```

### Features

| Function | Expected behavior |
|---|---|
| View details | Show all important fields |
| Edit record | Open edit modal |
| Copy value | Copy email/phone |
| Audit info | Show Created Date and Last Modified Date |

---

## 10. Activity Tab

Activity tracks customer interactions.

```text
Activity
────────────────────────────────────────
[Log a Call] [New Task] [Add Note]

Upcoming
┌──────────────────────────────────────┐
│ Follow up proposal                   │
│ Due: Jun 15, 2026 | Status: Open     │
└──────────────────────────────────────┘

Past Activity
┌──────────────────────────────────────┐
│ Called customer                      │
│ Jun 12, 2026 by Duy                  │
└──────────────────────────────────────┘
```

### Activity types

| Type | Description |
|---|---|
| Call | Log a completed call |
| Task | To-do item |
| Note | Simple note |
| Email | Mock email activity |

### Functions

| Function | Expected behavior |
|---|---|
| Log a Call | Create activity with status Completed |
| New Task | Create task with status Open |
| Add Note | Create a note activity |
| Mark Complete | Change Open to Completed |
| Delete Activity | Remove activity |
| Timeline sort | Newest first |

---

## 11. Related Tab

Related tab shows records connected to the current record.

Example: Contact Related Tab

```text
Related
────────────────────────────────────────
Account
┌────────────────────────────┐
│ ABC Software               │
│ Industry: Software         │
└────────────────────────────┘

Opportunities
┌──────────────┬──────────────┬────────────┐
│ Name         │ Stage        │ Amount     │
├──────────────┼──────────────┼────────────┤
│ CRM Deal     │ Proposal     │ $5,000     │
└──────────────┴──────────────┴────────────┘

Activities
- Called customer
- Follow up proposal
```

### Related records by object

| Object | Related sections |
|---|---|
| Account | Contacts, Opportunities, Activities |
| Contact | Account, Opportunities, Activities |
| Lead | Activities |
| Opportunity | Account, Contact, Activities |

---

## 12. New/Edit Form Modal

Use the same form component for create and edit.

Example: New Contact

```text
New Contact
────────────────────────────────────
Personal Information
First Name
Last Name *

Contact Information
Email *
Phone
Mobile

Relationship
Account *
Owner
Status

[Cancel] [Save]
```

### Form behavior

| Case | Expected behavior |
|---|---|
| Save valid data | Close modal, refresh list, show toast |
| Missing required field | Show inline error |
| Invalid email | Show validation message |
| Cancel | Close modal without saving |
| Edit | Pre-fill data |
| Delete | Show confirmation modal |

### Common validation rules

| Field | Rule |
|---|---|
| Name | Required depending on object |
| Email | Valid email format |
| Phone | Optional |
| Amount | Number |
| Close Date | Date |
| Status/Stage | Select option |

---

## 13. Leads Module

Lead is a potential customer that has not yet become an official Account/Contact.

### Leads List columns

| Column | Description |
|---|---|
| Name | Link to detail |
| Company | Company name |
| Title | Job title |
| Email | Email |
| Phone | Phone number |
| Lead Source | Website, Facebook, Referral |
| Status | New, Working, Qualified, Converted |
| Owner | Record owner |
| Created Date | Creation date |

### Lead functions

| Function | MVP |
|---|---|
| Create Lead | Required |
| Edit Lead | Required |
| Delete Lead | Required |
| Change Status | Required |
| Convert Lead | Later phase or mock |
| Log Activity | Required |

---

## 14. Accounts Module

Account is a company or organization.

### Accounts List columns

| Column | Description |
|---|---|
| Account Name | Link to detail |
| Industry | Software, Finance, Retail |
| Website | URL |
| Phone | Phone number |
| Owner | Record owner |
| Created Date | Creation date |

### Account Detail related sections

```text
Details
- Account Name
- Industry
- Website
- Phone
- Owner

Related
- Contacts
- Opportunities
- Activities
```

### Account functions

| Function | MVP |
|---|---|
| Create Account | Required |
| Edit Account | Required |
| Delete Account | Required |
| View Contacts of Account | Required |
| View Opportunities of Account | Required |

---

## 15. Contacts Module

Contact is a real person connected to an Account.

### Contacts List columns

| Column | Description |
|---|---|
| Name | Link to detail |
| Account | Related company |
| Title | Job title |
| Email | Email |
| Phone | Phone number |
| Status | Active / Inactive |
| Owner | Record owner |

### Contact Detail sections

```text
Details
- First Name
- Last Name
- Account
- Title
- Email
- Phone
- Owner

Activity
- Log a Call
- New Task
- Add Note

Related
- Account
- Opportunities
- Activities
```

### Contact functions

| Function | MVP |
|---|---|
| Create Contact | Required |
| Edit Contact | Required |
| Delete Contact | Required |
| Link with Account | Required |
| Add Activity | Required |

---

## 16. Opportunities Module

Opportunity is a sales deal.

### Opportunities List columns

| Column | Description |
|---|---|
| Opportunity Name | Link to detail |
| Account | Related company |
| Stage | Sales stage |
| Amount | Deal value |
| Close Date | Expected close date |
| Owner | Record owner |

### Opportunity stages

```text
Prospecting
Qualification
Proposal
Negotiation
Closed Won
Closed Lost
```

### Opportunity functions

| Function | MVP |
|---|---|
| Create Opportunity | Required |
| Edit Opportunity | Required |
| Delete Opportunity | Required |
| Change Stage | Required |
| Kanban View | Recommended |
| Link Account | Required |
| Add Activity | Required |

---

## 17. Opportunity Kanban

Kanban is useful for Opportunities or Leads.

```text
Opportunity Kanban
────────────────────────────────────────────────────────────
Prospecting       Proposal          Negotiation       Closed Won
┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
│ Deal A    │     │ Deal B    │     │ Deal C    │     │ Deal D    │
│ $3,000    │     │ $5,000    │     │ $8,000    │     │ $10,000   │
└───────────┘     └───────────┘     └───────────┘     └───────────┘
```

### Kanban functions

| Function | MVP |
|---|---|
| Group by Stage | Required |
| Show card summary | Required |
| Drag and drop stage | Recommended |
| Click card to detail | Required |
| Filter by Owner | Recommended |
| Total amount per column | Recommended |

---

## 18. Action Patterns

### Global actions

```text
New Lead
New Contact
New Account
New Opportunity
```

### Page actions

```text
New
Import
Refresh
Filter
```

### Record actions

```text
Edit
Delete
Clone
New Task
Log a Call
```

### Row actions

```text
View
Edit
Delete
Change Owner
```

---

## 19. UI States

| State | UI |
|---|---|
| Loading | Skeleton table/card |
| Empty | Icon + “No records found” |
| Error | Error message + Retry |
| Success | Toast message |
| Delete confirm | Confirmation modal |
| Form validation | Inline error |
| No permission | Mock “You don’t have access” screen |

Example empty state:

```text
No contacts found
Try changing your filters or create a new contact.

[New Contact]
```

---

## 20. Route Structure

```text
/login
/app/home

/app/leads
/app/leads/:id

/app/accounts
/app/accounts/:id

/app/contacts
/app/contacts/:id

/app/opportunities
/app/opportunities/:id
/app/opportunities/kanban

/app/reports
```

---

## 21. Suggested Component Structure

```text
components/
├── app-shell/
│   ├── AppHeader.tsx
│   ├── AppNavigation.tsx
│   ├── AppLauncher.tsx
│   └── GlobalSearch.tsx
│
├── object/
│   ├── ObjectPageHeader.tsx
│   ├── ListViewToolbar.tsx
│   ├── RecordTable.tsx
│   ├── RowActionMenu.tsx
│   └── FilterPanel.tsx
│
├── record/
│   ├── RecordHeader.tsx
│   ├── RecordTabs.tsx
│   ├── DetailsPanel.tsx
│   ├── ActivityTimeline.tsx
│   └── RelatedList.tsx
│
├── forms/
│   ├── LeadForm.tsx
│   ├── AccountForm.tsx
│   ├── ContactForm.tsx
│   └── OpportunityForm.tsx
│
└── shared/
    ├── Modal.tsx
    ├── ConfirmDialog.tsx
    ├── Toast.tsx
    ├── Badge.tsx
    └── EmptyState.tsx
```

---

## 22. Data Model MVP

```text
Account
- id
- name
- industry
- website
- phone
- owner
- createdAt
- updatedAt

Contact
- id
- firstName
- lastName
- accountId
- title
- email
- phone
- status
- owner
- createdAt
- updatedAt

Lead
- id
- firstName
- lastName
- company
- title
- email
- phone
- source
- status
- owner
- createdAt
- updatedAt

Opportunity
- id
- name
- accountId
- amount
- stage
- closeDate
- owner
- createdAt
- updatedAt

Activity
- id
- relatedType
- relatedId
- type
- subject
- description
- dueDate
- status
- createdBy
- createdAt
```

---

## 23. Prisma Schema Draft

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

enum LeadStatus {
  NEW
  WORKING
  QUALIFIED
  CONVERTED
  LOST
}

enum ContactStatus {
  ACTIVE
  INACTIVE
}

enum OpportunityStage {
  PROSPECTING
  QUALIFICATION
  PROPOSAL
  NEGOTIATION
  CLOSED_WON
  CLOSED_LOST
}

enum ActivityType {
  CALL
  TASK
  NOTE
  EMAIL
}

enum ActivityStatus {
  OPEN
  COMPLETED
}

model Account {
  id          String   @id @default(cuid())
  name        String
  industry    String?
  website     String?
  phone       String?
  owner       String   @default("Duy")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  contacts      Contact[]
  opportunities Opportunity[]

  @@map("accounts")
}

model Contact {
  id          String        @id @default(cuid())
  firstName   String?
  lastName    String
  email       String        @unique
  phone       String?
  mobile      String?
  title       String?
  department  String?
  status      ContactStatus @default(ACTIVE)
  owner       String        @default("Duy")
  address     String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  accountId   String
  account     Account       @relation(fields: [accountId], references: [id], onDelete: Cascade)

  activities  Activity[]

  @@map("contacts")
}

model Lead {
  id          String     @id @default(cuid())
  firstName   String?
  lastName    String
  company     String
  title       String?
  email       String?
  phone       String?
  source      String?
  status      LeadStatus  @default(NEW)
  owner       String      @default("Duy")
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@map("leads")
}

model Opportunity {
  id          String            @id @default(cuid())
  name        String
  amount      Decimal?          @db.Decimal(12, 2)
  stage       OpportunityStage  @default(PROSPECTING)
  closeDate   DateTime?
  owner       String            @default("Duy")
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  accountId   String
  account     Account           @relation(fields: [accountId], references: [id], onDelete: Cascade)

  @@map("opportunities")
}

model Activity {
  id          String         @id @default(cuid())
  type        ActivityType
  subject     String
  description String?
  dueDate     DateTime?
  status      ActivityStatus @default(OPEN)
  createdBy   String         @default("Duy")
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  contactId   String
  contact     Contact        @relation(fields: [contactId], references: [id], onDelete: Cascade)

  @@map("activities")
}
```

---

## 24. API Routes MVP

```text
GET    /api/accounts
GET    /api/accounts/:id
POST   /api/accounts
PUT    /api/accounts/:id
DELETE /api/accounts/:id

GET    /api/contacts
GET    /api/contacts/:id
POST   /api/contacts
PUT    /api/contacts/:id
DELETE /api/contacts/:id

GET    /api/leads
GET    /api/leads/:id
POST   /api/leads
PUT    /api/leads/:id
DELETE /api/leads/:id

GET    /api/opportunities
GET    /api/opportunities/:id
POST   /api/opportunities
PUT    /api/opportunities/:id
DELETE /api/opportunities/:id

GET    /api/contacts/:id/activities
POST   /api/contacts/:id/activities
PUT    /api/activities/:id
DELETE /api/activities/:id
```

Example query:

```text
/api/contacts?search=nguyen&accountId=acc_001&status=ACTIVE&page=1&pageSize=10
```

---

## 25. E2E-friendly Attributes

Because this app is also used for E2E demo, every important UI element should have a stable `data-testid`.

```html
<button data-testid="btn-new-contact">New Contact</button>

<input data-testid="input-contact-search" />

<table data-testid="table-contacts">
  <tr data-testid="row-contact">
    <td data-testid="cell-contact-name">Nguyen Van A</td>
  </tr>
</table>

<button data-testid="btn-edit-contact">Edit</button>
<button data-testid="btn-delete-contact">Delete</button>
```

Recommended naming convention:

```text
btn-new-contact
btn-save-contact
btn-cancel-contact
input-contact-search
select-contact-status
row-contact
cell-contact-name
modal-contact-form
tab-contact-details
tab-contact-activity
tab-contact-related
```

---

## 26. Shadow DOM Demo Plan

Use Shadow DOM to create nested testing scenarios.

Example:

```html
<crm-contact-page data-testid="shadow-host-contact-page">
  #shadow-root
    <crm-contact-list data-testid="shadow-host-contact-list">
      #shadow-root
        <crm-record-table data-testid="shadow-host-record-table">
          #shadow-root
            <button data-testid="btn-new-contact">
              New Contact
            </button>
        </crm-record-table>
    </crm-contact-list>
</crm-contact-page>
```

Suggested Shadow DOM levels:

| Shadow level | Component |
|---|---|
| Level 1 | Page wrapper |
| Level 2 | List / Detail container |
| Level 3 | Table / Form / Action menu |

Example modules for Shadow DOM testing:

```text
Login Widget
Contact List
Contact Form
Opportunity Kanban
Action Menu
```

---

## 27. Project Setup

Create project:

```bash
npx create-next-app@latest salesforce-crm-demo
cd salesforce-crm-demo
```

Install dependencies:

```bash
npm install @prisma/client @prisma/adapter-neon dotenv
npm install prisma tsx --save-dev
```

Optional UI dependencies:

```bash
npx shadcn@latest init
```

---

## 28. Environment Variables

Create `.env`:

```env
DATABASE_URL="postgresql://user:password@endpoint-pooler.region.aws.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@endpoint.region.aws.neon.tech/dbname?sslmode=require"
```

Usage:

| Env | Purpose |
|---|---|
| `DATABASE_URL` | App runtime connection |
| `DIRECT_URL` | Prisma migration connection |

---

## 29. Prisma Commands

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma migrate deploy
npx prisma studio
```

Suggested scripts in `package.json`:

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  }
}
```

---

## 30. Seed Data

Recommended sample data:

| Type | Example |
|---|---|
| Account | ABC Software, XYZ Corp, Demo Ltd |
| Contact | Nguyen Van A, Tran Thi B, Le Van C |
| Lead | Website Lead, Facebook Lead, Referral Lead |
| Opportunity | CRM Automation Deal, QA Platform Deal |
| Activity | Intro call, Follow up proposal, Sent email |

Seed script should create:

```text
3 Accounts
5 Contacts
5 Leads
4 Opportunities
10 Activities
```

---

## 31. Vercel Deployment

Basic flow:

```bash
git add .
git commit -m "init crm mvp"
git push
```

On Vercel:

```text
Import GitHub repo
Add DATABASE_URL
Add DIRECT_URL
Deploy
```

Recommended build command:

```bash
npx prisma generate && next build
```

For production migration, run separately:

```bash
npx prisma migrate deploy
```

For a simple personal MVP, this can be used temporarily:

```bash
npx prisma migrate deploy && npx prisma generate && next build
```

---

## 32. MVP Checklist

| Feature | Status |
|---|---|
| Mock Login | Todo |
| App Header | Todo |
| Navigation Bar | Todo |
| Home Dashboard | Todo |
| Leads List | Todo |
| Lead Detail | Todo |
| Accounts List | Todo |
| Account Detail | Todo |
| Contacts List | Todo |
| Contact Detail | Todo |
| Opportunities List | Todo |
| Opportunity Detail | Todo |
| Opportunity Kanban | Todo |
| New/Edit/Delete Modal | Todo |
| Details Tab | Todo |
| Activity Tab | Todo |
| Related Tab | Todo |
| Search | Todo |
| Filter | Todo |
| Sort | Todo |
| Pagination | Todo |
| Toast Message | Todo |
| Empty State | Todo |
| Loading State | Todo |
| Error State | Todo |
| Seed Data | Todo |
| Reset Data | Todo |
| Shadow DOM Level 1 | Todo |
| Shadow DOM Level 2 | Todo |
| Shadow DOM Level 3 | Todo |
| `data-testid` | Todo |

---

## 33. Final MVP Structure

```text
CRM Demo App
├── Home
│   ├── Summary Cards
│   ├── Recent Activities
│   └── Upcoming Tasks
│
├── Leads
│   ├── Leads List View
│   ├── Lead Detail
│   └── New/Edit Lead Modal
│
├── Accounts
│   ├── Accounts List View
│   ├── Account Detail
│   └── Related Contacts / Opportunities
│
├── Contacts
│   ├── Contacts List View
│   ├── Contact Detail
│   ├── Activity Timeline
│   └── Related Account / Opportunities
│
└── Opportunities
    ├── Opportunities List View
    ├── Opportunity Detail
    └── Kanban View
```

---

## 34. Development Priority

Recommended order:

```text
1. Setup Next.js project
2. Setup Tailwind/shadcn UI
3. Setup Prisma + Neon PostgreSQL
4. Create database schema
5. Add seed data
6. Build App Shell
7. Build Account CRUD
8. Build Contact CRUD
9. Build Lead CRUD
10. Build Opportunity CRUD
11. Add Details / Activity / Related tabs
12. Add Opportunity Kanban
13. Add search/filter/sort/pagination
14. Add Shadow DOM demo components
15. Deploy to Vercel
```

---

## 35. Notes

This project should stay simple and maintainable.

Avoid building too many advanced features at the beginning. Focus first on:

```text
App Shell
Object List View
Record Detail
CRUD Modal
Activity Timeline
Related Lists
Opportunity Kanban
```

These patterns are enough to make the website feel like a real Salesforce Lightning-style CRM demo.
