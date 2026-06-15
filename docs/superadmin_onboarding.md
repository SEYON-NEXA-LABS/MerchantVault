# Superadmin Client Onboarding Guide

This document outlines the steps for a Superadmin to create and onboard a new client (tenant) in the Seyon system.

## Overview
Onboarding a client automatically provisions:
1. A **Company** registry profile.
2. A primary **Tenant Administrator** user account.
3. A default **Primary Fulfillment Warehouse** (`WH-01`).
4. An initial **Subscription** config record.

---

## Steps to Onboard a Client

### 1. Send Onboarding Request
The superadmin triggers onboarding by sending a `POST` request to the client endpoint:

*   **Endpoint**: `/api/superadmin/tenants`
*   **HTTP Method**: `POST`
*   **Headers**: `Content-Type: application/json`

### 2. Request Body Payload
The request body must be a JSON object containing the client settings:

```json
{
  "name": "Suta Clothings",
  "code": "suta",
  "contactEmail": "admin@suta.in",
  "adminUsername": "sutadmin",
  "adminPassword": "securepassword123",
  "planType": "MONTHLY",
  "amount": 2500,
  "currency": "INR"
}
```

#### Field Description:
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | Yes | The official business/tenant name. |
| `code` | string | Yes | Unique lowercase identifier (e.g., `"suta"`). Used for tenant routing. |
| `contactEmail` | string | No | Email address for corporate communications. |
| `adminUsername` | string | Yes | Alphanumeric username for the Tenant Administrator. |
| `adminPassword` | string | Yes | Access password for the Tenant Administrator. |
| `planType` | string | No | Tier: `"FREE_TRIAL"`, `"MONTHLY"`, `"YEARLY"`, `"ONETIME_AMC"`, etc. |
| `amount` | number | No | Recurring subscription fee rate (default is `0`). |
| `currency` | string | No | Currency for billing charges (default: `"INR"`). |

---

## API Execution Flow
When the request is received, the server executes the following transactional operations:
1. **Validation**: Verifies that the company `code` and the `adminUsername` are globally unique.
2. **Company Provisioning**: Inserts the new Company record with default settings.
3. **Admin User Registration**: Inserts a User with the role `TENANTADMIN` and automatically constructs an internal email (e.g., `sutadmin@suta.local`).
4. **Primary Warehouse Setup**: Automatically registers a default `"Primary Fulfillment Hub"` in Coimbatore with code `WH-01`.
5. **Subscription Activation**: Sets up the billing renewal date based on the chosen `planType`.

---

## Resetting Tenant Administrator Password
If a client administrator forgets their password, a superadmin can reset it by making a request to the same endpoint with the `RESET_PASSWORD` action:

*   **Endpoint**: `/api/superadmin/tenants`
*   **HTTP Method**: `POST`
*   **Payload**:
    ```json
    {
      "action": "RESET_PASSWORD",
      "companyId": "uuid-of-the-company",
      "newPassword": "newsecurepassword123"
    }
    ```
