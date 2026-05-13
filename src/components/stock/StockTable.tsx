"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { StockProduct } from "@/types/portal"

function AvailableBadge({ value }: { value: number }) {
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 rounded text-xs font-medium",
        value > 0
          ? "bg-green-100 text-green-800"
          : value === 0
            ? "bg-slate-100 text-slate-600"
            : "bg-red-100 text-red-700"
      )}
    >
      {value}
    </span>
  )
}

interface StockTableProps {
  products: StockProduct[]
}

export default function StockTable({ products }: StockTableProps) {
  const [search, setSearch] = useState("")

  const filtered = search.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.code ?? "").toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      )
    : products

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-4">
        <input
          type="search"
          placeholder="Search by name, SKU, or category…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm text-sm px-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        <span className="text-xs text-slate-400 shrink-0">
          {filtered.length} / {products.length}
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-32">SKU</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">On Hand</TableHead>
            <TableHead className="text-right">Available</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-slate-400 py-10">
                {search ? "No products match your search." : "No stock data."}
              </TableCell>
            </TableRow>
          ) : (
            filtered.map(product => (
              <TableRow key={product.id} className="cursor-pointer">
                <TableCell>
                  <Link href={`/stock/${product.id}`} className="block inset-0 text-slate-500 font-mono">
                    {product.code ?? "—"}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/stock/${product.id}`} className="block font-medium text-slate-900 hover:text-slate-600">
                    {product.name}
                  </Link>
                </TableCell>
                <TableCell className="text-slate-500">{product.category}</TableCell>
                <TableCell className="text-right text-slate-700">{product.onHand}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <AvailableBadge value={product.available} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
