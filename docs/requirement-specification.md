# Requirement Specification: SAE Logistics Client Portal

## 1. Project Introduction
**Project Name:** SAE Logistics Client Portal (MySAE)
**Owner:** SAE Logistics
**Objective:** A high-performance self-service portal for 3PL clients to manage inventory, update product master data, and execute logistics orders via an Odoo-backed frontend.

---

## 2. Licensing & User Architecture
To maintain cost-efficiency while scaling to hundreds of users across 40-50 companies :
* **Portal User Model:** Clients are registered as **Odoo Portal Users** (Free/Unlimited) to avoid per-user Enterprise licensing costs .
* **Headless Proxy:** A single **Internal Service Account** acts as the API bridge to perform "write" actions (e.g., updating dimensions) restricted for standard portal users .
* **Client Admin Role:** Client-side administrators can manage (create/deactivate) their own internal user accounts.

---

## 3. Product & Inventory Management
### 3.1 Inventory Visibility
* **Stock Metrics:** Real-time display of "On Hand" and "Available" stock.
* **Backorder Policy:** Stock levels are **informational only**; users are permitted to place orders for items even if they are not currently in stock.
* **Warehouse Logic:** Users are locked to their specific assigned virtual warehouse in Odoo.

### 3.2 Master Data Maintenance
* **Self-Service Editing:** Clients can update specific product attributes through the portal:
    * Upload/update **Product Photos**.
    * Update **Dimensions** (L, W, H) and **Weights**.

---

## 4. Order Management Workflows
The portal supports three distinct order types. Stock-based orders (Goods In/Out) utilize a **Storefront/Catalog** interface.

| Order Type | Catalog | Workflow Details |
| :--- | :--- | :--- |
| **Goods Out (Stock)** | **Yes** | Items picked from SAE warehouse for delivery to a client destination. |
| **Goods In (Stock)** | **Yes** | Refills or returns sent back to the SAE warehouse. |
| **Transport Orders** | No | Requesting collection at Point A and delivery to Point B (No stock movement). |

### 4.1 Functional Features
* **Drafting:** Saving orders as drafts to revisit later is an **essential requirement**.
* **Google Maps Integration:** Required for all order types to facilitate address entry and validation .
* **Document Access:** Downloadable Packing Slips, Invoices, or PODs once generated in the backend.
* **Status Tracking:** Visibility into the order lifecycle (e.g., Processing, Picking, Packed, Shipped).

---

## 5. Technical Requirements
* **Maps API:** Google Maps API for cost-effective address validation .
* **Integration:** All orders and product updates are pushed to Odoo; Odoo handles external marketplace integrations (Shopify/Amazon) in the background.