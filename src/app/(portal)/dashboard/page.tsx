import type { Metadata } from "next"
import Link from "next/link"
import PageHeader from "@/components/shared/PageHeader"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { getBlogPosts } from "@/lib/odoo/news"
import type { BlogPost } from "@/types/portal"

export const metadata: Metadata = { title: "Dashboard" }

const NAV_CARDS = [
  { label: "Orders", href: "/orders", description: "Track and create orders" },
  { label: "Stock", href: "/stock", description: "View and manage your inventory" },
]

export default async function DashboardPage() {
  let recentPosts: BlogPost[] = []
  try {
    recentPosts = await getBlogPosts(3)
  } catch (err) {
    console.error("[dashboard/news]", err)
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Welcome to the MySAE client portal."
      />

      <div className="grid grid-cols-2 gap-4">
        {NAV_CARDS.map(({ label, href, description }) => (
          <Link key={href} href={href} className="block">
            <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
              <CardHeader>
                <CardTitle>{label}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>News &amp; Updates</CardTitle>
            <Link href="/news" className="text-xs text-muted-foreground hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentPosts.length === 0 ? (
              <p className="text-muted-foreground">No updates at this time.</p>
            ) : (
              <ul className="space-y-3">
                {recentPosts.map(post => (
                  <li key={post.id}>
                    <a
                      href={post.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium hover:underline"
                    >
                      {post.title}
                    </a>
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reports &amp; Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No documents available.</p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
