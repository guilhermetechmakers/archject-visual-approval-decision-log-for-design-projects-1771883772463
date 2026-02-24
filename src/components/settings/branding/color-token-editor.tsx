/**
 * ColorTokenEditor - advanced color picker with contrast checker.
 * Exports tokens as CSS/JSON; WCAG AA contrast validation.
 */

import { useState, useCallback } from 'react'
import { Palette, Check, AlertTriangle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ColorTokens } from '@/types/settings'

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
  const [light, dark] = l1 >= l2 ? [l1, l2] : [l2, l1]
  return (light + 0.05) / (dark + 0.05)
}

export interface ColorTokenEditorProps {
  tokens: Partial<ColorTokens>
  onChange: (tokens: Partial<ColorTokens>) => void
  showContrast?: boolean
  className?: string
}

const TOKEN_KEYS: { key: keyof ColorTokens; label: string }[] = [
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'accent', label: 'Accent' },
  { key: 'success', label: 'Success' },
  { key: 'warning', label: 'Warning' },
  { key: 'destructive', label: 'Destructive' },
]

export function ColorTokenEditor({
  tokens,
  onChange,
  showContrast = true,
  className,
}: ColorTokenEditorProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [contrastResult, setContrastResult] = useState<{
    primary: number | null
    accent: number | null
  }>({ primary: null, accent: null })

  const validateAndUpdate = useCallback(
    (key: keyof ColorTokens, value: string) => {
      if (!value) {
        const next = { ...tokens, [key]: undefined }
        onChange(next)
        setErrors((e) => ({ ...e, [key]: '' }))
        return
      }
      if (!HEX_REGEX.test(value)) {
        setErrors((e) => ({ ...e, [key]: 'Use 6-digit hex (e.g. #195C4A)' }))
        return
      }
      setErrors((e) => ({ ...e, [key]: '' }))
      const next = { ...tokens, [key]: value }
      onChange(next)

      if (showContrast && (key === 'primary' || key === 'accent')) {
        const rgb = hexToRgb(value)
        if (rgb) {
          const l = luminance(rgb.r, rgb.g, rgb.b)
          const whiteLum = 1
          const ratio = contrastRatio(l, whiteLum)
          setContrastResult((prev) => ({
            ...prev,
            [key]: ratio,
          }))
        }
      }
    },
    [tokens, onChange, showContrast]
  )

  const exportCss = () => {
    const lines = TOKEN_KEYS.map(({ key }) => {
      const v = tokens[key]
      return v ? `  --${key}: ${v};` : null
    }).filter(Boolean)
    return `:root {\n${lines.join('\n')}\n}`
  }

  const exportJson = () => JSON.stringify(tokens, null, 2)

  const copyExport = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const wcagPass = (ratio: number | null) =>
    ratio !== null && ratio >= 4.5

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOKEN_KEYS.map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={`color-${key}`}>{label}</Label>
            <div className="flex gap-2">
              <Input
                id={`color-${key}`}
                type="text"
                placeholder="#195C4A"
                value={tokens[key] ?? ''}
                onChange={(e) => validateAndUpdate(key, e.target.value)}
                className={cn('max-w-[140px] font-mono', errors[key] && 'border-destructive')}
              />
              <input
                type="color"
                value={
                  (tokens[key] as string)?.startsWith('#')
                    ? (tokens[key] as string)
                    : '#195C4A'
                }
                onChange={(e) => validateAndUpdate(key, e.target.value)}
                className="h-10 w-12 cursor-pointer rounded-lg border border-border"
                aria-label={`Pick ${label} color`}
              />
            </div>
            {errors[key] && (
              <p className="text-xs text-destructive">{errors[key]}</p>
            )}
          </div>
        ))}
      </div>

      {showContrast && (contrastResult.primary !== null || contrastResult.accent !== null) && (
        <div className="flex flex-wrap gap-4 rounded-lg border border-border bg-secondary/30 p-4">
          {contrastResult.primary !== null && (
            <div className="flex items-center gap-2">
              {wcagPass(contrastResult.primary) ? (
                <Check className="h-5 w-5 text-success" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-warning" />
              )}
              <span className="text-sm">
                Primary contrast: {contrastResult.primary.toFixed(1)}:1
                {wcagPass(contrastResult.primary) ? ' (WCAG AA)' : ' — aim for 4.5:1'}
              </span>
            </div>
          )}
          {contrastResult.accent !== null && (
            <div className="flex items-center gap-2">
              {wcagPass(contrastResult.accent) ? (
                <Check className="h-5 w-5 text-success" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-warning" />
              )}
              <span className="text-sm">
                Accent contrast: {contrastResult.accent.toFixed(1)}:1
                {wcagPass(contrastResult.accent) ? ' (WCAG AA)' : ' — aim for 4.5:1'}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => copyExport(exportCss())}
          className="gap-2"
        >
          <Palette className="h-4 w-4" />
          Copy CSS
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => copyExport(exportJson())}
          className="gap-2"
        >
          Copy JSON
        </Button>
      </div>
    </div>
  )
}
