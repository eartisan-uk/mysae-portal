"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import type { OrderSummary, OrderStatus, OrderType } from "@/types/portal"

const STATUS_STYLES: Record<OrderStatus, string> = {
  draft:     "bg-slate-100 text-slate-600",
  active:    "bg-blue-100 text-blue-700",
  done:      "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-700",
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
    <div className="bg-white rounded-lg border border-slate-200">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-4">
        <input
          type="search"
          placeholder="Search by reference or created by…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm text-sm px-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        <span className="text-xs text-slate-400 shrink-0">
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
              <TableCell colSpan={7} className="text-center text-slate-400 py-10">
                {search ? "No orders match your search." : "No orders found."}
              </TableCell>
            </TableRow>
          ) : (
            filtered.map(order => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-sm text-slate-700">{order.reference}</TableCell>
                <TableCell className="text-slate-600 text-sm">{TYPE_LABELS[order.type]}</TableCell>
                <TableCell><StatusBadge status={order.status} /></TableCell>
                <TableCell className="text-slate-600 text-sm">{order.createdBy || "—"}</TableCell>
                <TableCell className="text-slate-600 text-sm">{fmt(order.createdAt)}</TableCell>
                <TableCell className="text-slate-600 text-sm">{fmt(order.collectDate)}</TableCell>
                <TableCell className="text-slate-600 text-sm">{fmt(order.deliverDate)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
