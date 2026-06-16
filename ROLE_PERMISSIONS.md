# CRM Roles and Permissions

## Roles

| Role | Purpose |
| --- | --- |
| System Administrator | Full CRM access for configuration, support, and data administration. |
| Sales Manager | Team-level sales user with permission to manage CRM records and clean up data. |
| Sales Rep | Standard sales user who can create and update CRM activity and records. |
| Read Only | Viewer role for reporting, review, audit, or demo access without data changes. |

## Permission Matrix

| Permission | System Administrator | Sales Manager | Sales Rep | Read Only |
| --- | --- | --- | --- | --- |
| Login to `/app/*` | Yes | Yes | Yes | Yes |
| View CRM data | Yes | Yes | Yes | Yes |
| Create or update accounts | Yes | Yes | Yes | No |
| Create or update contacts | Yes | Yes | Yes | No |
| Create or update leads | Yes | Yes | Yes | No |
| Create or update opportunities | Yes | Yes | Yes | No |
| Create activities | Yes | Yes | Yes | No |
| Delete CRM records | Yes | Yes | No | No |
| Delete activities | Yes | Yes | No | No |

## API Enforcement

| API | Method | Required Permission |
| --- | --- | --- |
| `/api/crm/records` | `PUT` | `write` |
| `/api/crm/records` | `DELETE` | `delete` |
| `/api/crm/activities` | `POST` | `write` |

Unauthenticated requests return `401`. Authenticated users without the required role permission return `403`.

## Sample Accounts

All sample users use password `demo-password`.

| Email | Name | Initials | Role | Expected Access |
| --- | --- | --- | --- | --- |
| `admin@example.com` | Admin User | AD | System Administrator | Full access, including delete. |
| `manager@example.com` | Mai Tran | MT | Sales Manager | Full CRM data access, including delete. |
| `duy@example.com` | Duy Nguyen | DU | Sales Rep | Can view, create, and update. Cannot delete. |
| `readonly@example.com` | Read Only | RO | Read Only | Can view only. Cannot create, update, or delete. |

## Current Role Rules

The current implementation uses a simple Salesforce-inspired role model:

| Internal Role | Write | Delete |
| --- | --- | --- |
| `SYSTEM_ADMINISTRATOR` | Yes | Yes |
| `SALES_MANAGER` | Yes | Yes |
| `SALES_REP` | Yes | No |
| `READ_ONLY` | No | No |

These rules are enforced server-side in the CRM API routes, not only in the UI.
