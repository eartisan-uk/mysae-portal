"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"

import type { StockProduct } from "@/types/portal"


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
    <div className="bg-card rounded-lg border border-border">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-4">
        <input
          type="search"
          placeholder="Search by name, SKU, or category…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm text-sm px-3 py-1.5 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <span className="text-xs text-muted-foreground shrink-0">
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                {search ? "No products match your search." : "No stock data."}
              </TableCell>
            </TableRow>
          ) : (
            filtered.map(product => (
              <TableRow key={product.id} className="cursor-pointer">
                <TableCell>
                  <Link href={`/stock/${product.id}`} className="block inset-0 text-muted-foreground font-mono">
                    {product.code ?? "—"}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/stock/${product.id}`} className="block font-medium text-foreground hover:text-muted-foreground">
                    {product.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{product.category}</TableCell>
                <TableCell className="text-right text-foreground">{product.onHand}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
