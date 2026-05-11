import { useMemo } from 'react'
import { motion } from 'motion/react'
import { useCalculatorStore } from '@/store/calculator-store'
import { useThemeStore } from '@/store/theme-store'
import { useClipboard } from '@/hooks/use-clipboard'
import qrcode from 'qrcode-generator'

function generateQrSvg(url: string, theme: 'dark' | 'light'): string {
  const qr = qrcode(0, 'M')
  qr.addData(url)
  qr.make()
  const count = qr.getModuleCount()
  const margin = 2
  const viewBox = count + margin * 2
  const bg = theme === 'dark' ? '#002b36' : '#fdf6e3'
  const fg = theme === 'dark' ? '#93a1a1' : '#586e75'
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBox} ${viewBox}" shape-rendering="crispEdges">`
  svg += `<rect width="${viewBox}" height="${viewBox}" fill="${bg}"/>`
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (qr.isDark(row, col)) {
        svg += `<rect x="${col + margin}" y="${row + margin}" width="1" height="1" fill="${fg}"/>`
      }
    }
  }
  svg += '</svg>'
  return svg
}

function parseUrlParts(url: string): { protocol: string; host: string; pathname: string; search: string } | null {
  try {
    const parsed = new URL(url)
    return {
      protocol: `${parsed.protocol}//`,
      host: parsed.host,
      pathname: parsed.pathname,
      search: parsed.search,
    }
  } catch {
    return null
  }
}

function UrlBreakdown({ url }: { url: string }) {
  const parts = parseUrlParts(url)

  if (!parts) {
    return <span className="font-mono text-xs text-[#657b83] dark:text-[#839496]">{url}</span>
  }

  return (
    <div className="font-mono text-xs break-all leading-relaxed">
      <span className="text-[#93a1a1] dark:text-[#586e75]">{parts.protocol}</span>
      <span className="text-[#93a1a1] dark:text-[#586e75]">{parts.host}</span>
      {parts.pathname !== '/' && (
        <span className="text-[#2aa198]">{parts.pathname}</span>
      )}
      {parts.search && (
        <span className="text-[#268bd2]">{parts.search}</span>
      )}
    </div>
  )
}

export function ShareCard() {
  const { result, splits } = useCalculatorStore()
  const theme = useThemeStore((s) => s.theme)
  const { copy, isCopied } = useClipboard()

  const url = typeof window !== 'undefined' ? window.location.href : ''
  const qrSvg = useMemo(() => generateQrSvg(url, theme), [url, theme])

  if (!result) return null

  const isSupernet = url.includes('/super')
  const cidr = `${result.networkAddress}/${result.prefixLength}`
  const hasSplits = splits.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* URL display */}
      <div className="bg-[#eee8d5] dark:bg-[#073642] rounded-lg p-4">
        <UrlBreakdown url={url} />
      </div>

      {/* State badges */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center text-xs px-2 py-1 rounded-md bg-[#eee8d5] dark:bg-[#073642] text-[#586e75] dark:text-[#93a1a1] font-medium">
          {isSupernet ? 'Supernet' : 'Network'}
        </span>
        <span className="inline-flex items-center text-xs px-2 py-1 rounded-md bg-[#2aa198]/10 text-[#2aa198] font-mono">
          {cidr}
        </span>
        {hasSplits && (
          <span className="inline-flex items-center text-xs px-2 py-1 rounded-md bg-[#268bd2]/10 text-[#268bd2]">
            {splits.length} subnet{splits.length !== 1 ? 's' : ''}
            <span className="ml-1 text-[#93a1a1] dark:text-[#586e75] truncate max-w-32">
              ({splits.map((s) => s.label).join(', ')})
            </span>
          </span>
        )}
      </div>

      {/* Copy button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => copy(url, 'share-url')}
        className={`w-full text-sm px-4 py-2.5 rounded-lg font-medium transition-colors ${
          isCopied('share-url')
            ? 'bg-[#859900]/20 text-[#859900]'
            : 'bg-[#2aa198]/10 text-[#2aa198] hover:bg-[#2aa198]/20'
        }`}
        aria-label={isCopied('share-url') ? 'Copied share URL' : 'Copy share URL'}
      >
        {isCopied('share-url') ? 'Copied to clipboard!' : 'Copy share URL'}
      </motion.button>

      {/* QR code */}
      <div className="flex flex-col items-center gap-2 pt-1">
        <div
          className="rounded-lg overflow-hidden border border-[#93a1a1]/15 dark:border-[#586e75]/20 bg-[#fdf6e3] dark:bg-[#002b36] p-2 [&>svg]:block [&>svg]:w-full [&>svg]:h-full"
          dangerouslySetInnerHTML={{ __html: qrSvg }}
          style={{ width: 120, height: 120 }}
        />
        <span className="text-[10px] text-[#93a1a1] dark:text-[#586e75] uppercase tracking-wider">
          Scan to open
        </span>
      </div>
    </motion.div>
  )
}
