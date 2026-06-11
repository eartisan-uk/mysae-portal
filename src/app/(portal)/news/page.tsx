import type { Metadata } from "next"
import PageHeader from "@/components/shared/PageHeader"
import { Card, CardContent } from "@/components/ui/card"
import { getBlogPosts } from "@/lib/odoo/news"
import type { BlogPost } from "@/types/portal"

export const metadata: Metadata = { title: "News & Updates" }

export default async function NewsPage() {
  let posts: BlogPost[] = []
  let error: string | null = null

  try {
    posts = await getBlogPosts()
  } catch (err) {
    console.error("[news/page]", err)
    error = "Could not load news. Please try again later."
  }

  return (
    <>
      <PageHeader
        title="News & Updates"
        description={!error && posts.length > 0 ? `${posts.length} posts` : undefined}
      />

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No news or updates lished yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <Card key={post.id}>
              <CardContent className="py-4">
                <a
                  href={post.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-semibold hover:underline"
                >
                  {post.title}
                </a>
                {post.subtitle && (
                  <p className="mt-0.5 text-sm text-muted-foreground">{post.subtitle}</p>
                )}
                {post.excerpt && (
                  <p className="mt-2 text-sm text-foreground line-clamp-2">{post.excerpt}</p>
                )}
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                  {/* {post.authorName && <span>by {post.authorName}</span>} */}
                  <span>{post.blogName}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
