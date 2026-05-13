# Odoo Field Name Questionnaire
## MySAE Portal — Integration Reference

Please fill in the **Answer** column for each item. Where a field does not exist yet,
indicate whether it should be created as a custom field (`x_` prefix) or if there is
an alternative approach.

> **How to find field names:** Enable Developer Mode (Settings → Activate Developer
> Mode), then navigate to Settings → Technical → Database Structure → Fields.
> Filter by model name and inspect the **Field Name** column.

---

## 1. `res.users` — Portal User Record

| # | What we need | Context | Answer |
|---|---|---|---|
| 1.1 | Field name that links a user to their assigned `stock.warehouse` | Used to scope all stock queries and order writes to the correct virtual warehouse. Currently set to `null` in `UserProfile`. | |
| 1.2 | Is the warehouse link a Many2one directly on `res.users`, or is it on the related `res.partner` / a custom model? | Affects where we read it from during login. | |
| 1.3 | If no warehouse field exists yet — what is the intended data model for assigning a client company to a warehouse? | e.g. custom field, portal group, company property | |

---

## 2. `sale.order` — Order Header Fields

| # | What we need | Context | Answer |
|---|---|---|---|
| 2.1 | Technical field name for **Order Type** (Goods Out / Goods In / Transport) | Must be set on every order create. If it's a Selection field, also provide the selection key values for each type. | |
| 2.2 | Technical field name for **Cost Centre** | Displayed and required on all order forms. | |
| 2.3 | Technical field name for **Collection Date** (pickup date) | Used on Goods In and Transport orders. Is this `scheduled_date`, a custom field, or something else? | |
| 2.4 | Technical field name for **Delivery / Commit Date** | Is this `commitment_date` (standard) or a custom field? | |
| 2.5 | Technical field name for **Collection Address** | Is collection address stored as a `res.partner` Many2one, inline char fields, or a custom model? | |
| 2.6 | Technical field name for **Delivery Address** | Same question — partner link or inline fields? | |
| 2.7 | Technical field name for **Collection Note** / pickup instructions | | |
| 2.8 | Technical field name for **Delivery Note** / delivery instructions | Is this the standard `note` field or a custom field? | |

---

## 3. `sale.order` — Export / International Fields

These are only required for international Goods Out orders.

| # | What we need | Context | Answer |
|---|---|---|---|
| 3.1 | Technical field name for **Consignee EORI number** | | |
| 3.2 | Technical field name for **Consignee VAT number** | | |
| 3.3 | Technical field name for **Export Reason** | e.g. Selection field or free text | |
| 3.4 | Technical field name for **Export Terms / Incoterms** | Is this the standard `incoterm_id` Many2one or a custom field? | |

---

## 4. `sale.order` — Transport Order Fields

Transport orders carry no stock lines but have cargo details.

| # | What we need | Context | Answer |
|---|---|---|---|
| 4.1 | Are Transport orders stored on `sale.order` (distinguished by order type) or a separate model? | Affects entire order creation flow. | |
| 4.2 | Technical field name for cargo **Quantity** (number of pallets / parcels) | | |
| 4.3 | Technical field name for cargo **Description** | | |
| 4.4 | Technical field name for **Dimension Details** (free text describing L×W×H) | | |
| 4.5 | Technical field name for **Total Weight** (kg) | | |

---

## 5. `product.template` — Product Dimensions

| # | What we need | Context | Answer |
|---|---|---|---|
| 5.1 | Technical field name for **Length** (cm or mm?) | Client can update via portal. Standard Odoo does not have per-template L/W/H — may be on `product.packaging` or custom. | |
| 5.2 | Technical field name for **Width** | Same as above. | |
| 5.3 | Technical field name for **Height** | Same as above. | |
| 5.4 | Is the dimension unit cm, mm, or m? | Needed to display correct label in UI. | |
| 5.5 | Confirm weight field is `weight` on `product.template` (kg)? | Standard Odoo field — just confirming it is active and used. | |

---

## 6. Order Lifecycle & Permissions

| # | What we need | Context | Answer |
|---|---|---|---|
| 6.1 | Can an Odoo **Portal User** (`base.group_portal`) create a `sale.order` in `draft` state via the API? | If not, all creates must go through the service account. | |
| 6.2 | What is the **minimum permission set** required for the service account? | We need to write `sale.order`, `sale.order.line`, `product.template` (image + dimensions). List the access groups or record rules required. | |
| 6.3 | What method should be called to **cancel / rollback** a confirmed `sale.order`? | Used if the second step of a dual-write fails. Is it `action_cancel()` or another method? | |
| 6.4 | After cancelling, is the order deletable via `unlink()`, or should it remain as cancelled? | Affects our rollback strategy. | |

---

## 7. Stock & Warehouse Queries

| # | What we need | Context | Answer |
|---|---|---|---|
| 7.1 | To filter `product.template` stock by warehouse, should we query `stock.quant` with a `location_id` domain, or pass a `warehouse_id` context key to `qty_available`? | The standard Odoo approach uses context; custom setups may differ. | |
| 7.2 | What is the `stock.location` ID (or external ID) for each client virtual warehouse? | Needed for item picker domain on Goods Out orders. Provide a mapping or confirm it can be derived from `stock.warehouse.lot_stock_id`. | |
| 7.3 | For **Goods In** orders — does the item picker show the same product catalogue as Goods Out, or a different set? | Affects whether we reuse the same stock query or need a separate one. | |

---

## 8. Document Downloads

| # | What we need | Context | Answer |
|---|---|---|---|
| 8.1 | How are **Packing Slips** generated in Odoo? Report action name / technical ID? | Portal needs a download link once generated. | |
| 8.2 | How are **Invoices** accessed for a `sale.order`? Via `account.move` linked to the order? | | |
| 8.3 | How are **PODs** (Proof of Delivery) stored? Attachment on `stock.picking`, custom model, or external URL? | | |

---

## 9. Staging Environment

| # | What we need | Context | Answer |
|---|---|---|---|
| 9.1 | Confirm staging URL (`ODOO_BASE_URL`) | | |
| 9.2 | Confirm database name (`ODOO_DB`) | Default `odoo`? | |
| 9.3 | Provide service account login and password for `.env.local` | | |
| 9.4 | Provide at least one portal user test account (email + password) | For end-to-end testing of the portal flow. | |
| 9.5 | Mapping of test company → warehouse ID → stock location ID | For integration testing with real data. | |

---

*Document prepared by MySAE Portal development team. Version 1.0 — 2026-05-13.*
