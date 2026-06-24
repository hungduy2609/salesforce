# CRM Roles and Permissions

This document summarizes the current role model used by the CRM demo.

## Roles

| Role | Purpose |
| --- | --- |
| System Administrator | Full CRM access for configuration, support, and data administration. |
| Sales Manager | Team-level sales user with permission to manage records and delete data. |
| Sales Rep | Standard sales user who can view, create, and update CRM data. |
| Read Only | Viewer role for demos, review, or reporting without write access. |

## Effective Permission Rules

The current implementation uses a simple role-to-capability mapping.

| Internal Role | Write | Delete | Transfer Owner |
| --- | --- | --- | --- |
| `SYSTEM_ADMINISTRATOR` | Yes | Yes | Yes |
| `SALES_MANAGER` | Yes | Yes | Yes |
| `SALES_REP` | Yes | No | No |
| `READ_ONLY` | No | No | No |

`canTransferOwner` is currently derived from the same permission level as delete access.

## User-Facing Permission Matrix

| Permission | System Administrator | Sales Manager | Sales Rep | Read Only |
| --- | --- | --- | --- | --- |
| Access authenticated CRM routes | Yes | Yes | Yes | Yes |
| View CRM data | Yes | Yes | Yes | Yes |
| Create or update accounts | Yes | Yes | Yes | No |
| Create or update contacts | Yes | Yes | Yes | No |
| Create or update leads | Yes | Yes | Yes | No |
| Create or update opportunities | Yes | Yes | Yes | No |
| Create activities | Yes | Yes | Yes | No |
| Convert leads | Yes | Yes | Yes | No |
| Transfer record owner | Yes | Yes | No | No |
| Delete CRM records | Yes | Yes | No | No |
| Delete activities | Yes | Yes | No | No |

## API Enforcement

| API | Method | Required Permission |
| --- | --- | --- |
| `/api/crm/records` | `POST` / `PUT` | `write` |
| `/api/crm/records` | `DELETE` | `delete` |
| `/api/crm/activities` | `POST` | `write` |
| `/api/crm/leads/convert` | `POST` | `write` |

Unauthenticated requests return `401`.
Authenticated users without the required role permission return `403`.

## Sample Accounts

All sample users use password `demo-password`.

| Email | Name | Initials | Role | Expected Access |
| --- | --- | --- | --- | --- |
| `admin@example.com` | Admin User | AD | System Administrator | Full access, including delete and owner transfer. |
| `manager@example.com` | Mai Tran | MT | Sales Manager | Full CRM access, including delete and owner transfer. |
| `duy@example.com` | Duy Nguyen | DU | Sales Rep | Can view, create, update, and convert leads. Cannot delete. |
| `readonly@example.com` | Read Only | RO | Read Only | Can view only. Cannot create, update, convert, or delete. |

## Enforcement Notes

- Permissions are enforced server-side in API routes, not only in the UI.
- The authenticated app layout also computes client-side capability flags so the workspace can hide or disable unavailable actions.
