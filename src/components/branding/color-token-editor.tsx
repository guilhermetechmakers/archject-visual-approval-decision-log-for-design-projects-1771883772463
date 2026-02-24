/**
 * ColorTokenEditor - Advanced color picker with contrast checker
 * Token exports (CSS/JSON), WCAG AA compliance
 */

import { useState, useCallback } from 'react'
import { Check, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { ColorTokens } from '@/types/branding'

const HEX_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!match) return null
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  }
}

function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function contrastRatio(l1: number, l2: number): number {
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (light + 0.05) / (dark + 0.05)
}

export interface ColorTokenEditorProps {
  tokens: Partial<ColorTokens>
  onChange: (tokens: Partial<ColorTokens>) => void
  onExportCss?: () => void
  onExportJson?: () => void
  className?: string
}

const TOKEN_LABELS: { key: keyof ColorTokens; label: string }[] = [
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'accent', label: 'Accent' },
  { key: 'background', label: 'Background' },
  { key: 'foreground', label: 'Foreground' },
  { key: 'muted', label: 'Muted' },
]

export function ColorTokenEditor({
  tokens,
  onChange,
  onExportCss,
  onExportJson,
  className,
}: ColorTokenEditorProps) {
  const [contrastResults, setContrastResults] = useState<
    Record<string, { ratio: number; passes: boolean }>
  >({})

  const validateHex = useCallback((value: string) => {
    if (!value) return true
    return HEX_REGEX.test(value) || value.startsWith('rgb')
  }, [])

  const checkContrast = useCallback((hex: string) => {
    const rgb = hexToRgb(hex)
    if (!rgb) return null
    const lum = luminance(rgb.r, rgb.g, rgb.b)
    const whiteLum = lum
    const blackLum = lum
    const onWhite = contrastRatio(lum, 1)
    const onBlack = contrastRatio(lum, 0)
    const ratio = Math.max(onWhite, onBlack)
    return { ratio, passes: ratio >= 4.5 }
  }, [])

  const handleColorChange = (key: keyof ColorTokens, value: string) => {
    const next = { ...tokens, [key]: value || undefined }
    onChange(next)
    if (value && validateHex(value)) {
      const result = checkContrast(value.startsWith('#') ? value : `#${value}`)
      if (result) setContrastResults((r) => ({ ...r, [key]: result }))
    }
  }

  const defaultPrimary = tokens.primary ?? '#195C4A'
  const defaultAccent = tokens.accent ?? '#7BE495'

  return (
    <Card
      className={cn(
        'rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <CardHeader>
        <CardTitle className="text-lg">Color tokens</CardTitle>
        <CardDescription>
          Primary, accent, and semantic colors. Contrast checked for WCAG AA.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {TOKEN_LABELS.map(({ key, label }) => {
            const val = tokens[key] ?? (key === 'primary' ? '#195C4A' : key === 'accent' ? '#7BE495' : '')
            const result = contrastResults[key]
            return (
              <div key={key} className="space-y-2">
                <Label htmlFor={`color-${key}`}>{label}</Label>
                <div className="flex gap-2">
                  <Input
                    id={`color-${key}`}
                    type="text"
                    placeholder="#195C4A"
                    value={val}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className={cn(
                      'max-w-[140px] font-mono',
                      !validateHex(val) && val && 'border-destructive'
                    )}
                  />
                  <input
                    type="color"
                    value={val.startsWith('#') ? val : '#195C4A'}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-border"
                    aria-label={`Pick ${label} color`}
                  />
                  {result && (
                    <span
                      className={cn(
                        'flex items-center gap-1 text-xs',
                        result.passes ? 'text-success' : 'text-warning'
                      )}
                      title={`Contrast ratio: ${result.ratio.toFixed(1)}:1`}
                    >
                      {result.passes ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                      {result.ratio.toFixed(1)}:1
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          {onExportCss && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExportCss}
              className="rounded-full transition-all duration-200 hover:scale-[1.02]"
            >
              Export CSS
            </Button>
          )}
          {onExportJson && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExportJson}
              className="rounded-full transition-all duration-200 hover:scale-[1.02]"
            >
              Export JSON
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
