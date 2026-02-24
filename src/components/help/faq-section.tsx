import { useState } from 'react'
import { Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useFAQs } from '@/hooks/use-help'
import { useDebounce } from '@/hooks/use-debounce'
import { Skeleton } from '@/components/ui/skeleton'
import type { FAQ } from '@/types/help'

const FAQ_CATEGORIES = ['All', 'General', 'Sharing', 'Exports', 'Billing']

export function FAQSection() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const debouncedSearch = useDebounce(search, 250)

  const { data: faqs, isLoading } = useFAQs(category)

  const filtered = (faqs ?? []).filter((f: FAQ) => {
    if (!debouncedSearch.trim()) return true
    const q = debouncedSearch.toLowerCase()
    return (
      f.question.toLowerCase().includes(q) ||
      f.answer.toLowerCase().includes(q)
    )
  })

  const byCategory = filtered.reduce<Record<string, FAQ[]>>(
    (acc, faq) => {
      if (!acc[faq.category]) acc[faq.category] = []
      acc[faq.category].push(faq)
      return acc
    },
    {}
  )

  return (
    <Card className="rounded-xl border border-border shadow-card">
      <CardHeader>
        <CardTitle className="text-xl">Frequently Asked Questions</CardTitle>
        <div className="relative mt-4 max-w-md">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search FAQ"
          />
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              aria-label={`Filter FAQ by ${cat} category`}
              aria-pressed={category === cat}
              className={
                category === cat
                  ? 'rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground'
                  : 'rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No FAQs match your search</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search or category
            </p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(byCategory).map(([cat, items]) => (
              <div key={cat} className="mb-6">
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {cat}
                </h3>
                {items.map((faq: FAQ) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className="border-border"
                  >
                    <AccordionTrigger className="text-left font-medium hover:no-underline [&[data-state=open]]:text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </div>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}
