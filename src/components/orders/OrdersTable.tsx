"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import type { OrderSummary, OrderStatus, OrderType } from "@/types/portal"

const STATUS_STYLES: Record<OrderStatus, string> = {
  draft:     "bg-muted text-muted-foreground",
  active:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  done:      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
}
const STATUS_LABELS: Record<OrderStatus, string> = {
  draft:     "Draft",
  active:    "Active",
  done:      "Done",
  cancelled: "Cancelled",
}
const TYPE_LABELS: Record<OrderType, string> = {
  "goods-out": "Goods Out",
  "goods-in":  "Goods In",
  "transport": "Transport",
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("inline-block px-2 py-0.5 rounded text-xs font-medium", STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </span>
  )
}

function fmt(dateStr: string | null): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

interface OrdersTableProps {
  orders: OrderSummary[]
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  const [search, setSearch] = useState("")

  const filtered = search.trim()
    ? orders.filter(o =>
        o.reference.toLowerCase().includes(search.toLowerCase()) ||
        o.createdBy.toLowerCase().includes(search.toLowerCase())
      )
    : orders

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-4">
        <input
          type="search"
          placeholder="Search by reference or created by…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm text-sm px-3 py-1.5 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <span className="text-xs text-muted-foreground shrink-0">
          {filtered.length} / {orders.length}
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-36">Reference</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Order Date</TableHead>
            <TableHead>Collect</TableHead>
            <TableHead>Deliver</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                {search ? "No orders match your search." : "No orders found."}
              </TableCell>
            </TableRow>
          ) : (
            filtered.map(order => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-sm text-foreground">{order.reference}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{TYPE_LABELS[order.type]}</TableCell>
                <TableCell><StatusBadge status={order.status} /></TableCell>
                <TableCell className="text-muted-foreground text-sm">{order.createdBy || "—"}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{fmt(order.createdAt)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{fmt(order.collectDate)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{fmt(order.deliverDate)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
