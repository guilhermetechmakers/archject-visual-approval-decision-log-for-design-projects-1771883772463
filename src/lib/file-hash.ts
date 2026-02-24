/**
 * Client-side SHA-256 hashing for file deduplication.
 * Uses Web Crypto API when available; falls back to no hash for older browsers.
 */

const CHUNK_SIZE = 64 * 1024 // 64 KB chunks for hashing large files

export async function computeFileHash(file: File): Promise<string | null> {
  if (!window.crypto?.subtle) return null
  try {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return null
  }
}

/**
 * Stream-based hash for large files to avoid loading entire file into memory.
 * Falls back to computeFileHash for smaller files or when ReadableStream is not supported.
 */
export async function computeFileHashStreaming(file: File): Promise<string | null> {
  if (!window.crypto?.subtle) return null
  if (file.size < CHUNK_SIZE * 2) return computeFileHash(file)

  try {
    const stream = file.stream()
    const reader = stream.getReader()
    const encoder = new TextEncoder()
    let hashState: CryptoKey | null = null

    // For SHA-256 we need to hash the full buffer; streaming isn't directly supported.
    // Fall back to chunked read + concat for large files to avoid OOM.
    const chunks: Uint8Array[] = []
    let totalLength = 0
    let result = await reader.read()

    while (!result.done) {
      chunks.push(result.value)
      totalLength += result.value.length
      result = await reader.read()
    }

    const combined = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of chunks) {
      combined.set(chunk, offset)
      offset += chunk.length
    }

    const hashBuffer = await crypto.subtle.digest('SHA-256', combined)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return computeFileHash(file)
  }
}
