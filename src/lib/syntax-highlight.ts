export type Language = 'hcl' | 'json' | 'shell' | 'csv' | 'xml'

export type TokenType =
  | 'keyword'
  | 'string'
  | 'comment'
  | 'number'
  | 'type'
  | 'property'
  | 'punctuation'
  | 'command'
  | 'flag'
  | 'variable'
  | 'plain'

export interface Token {
  type: TokenType
  value: string
}

const TOKEN_COLORS_DARK: Record<TokenType, string> = {
  keyword: '#859900',
  string: '#2aa198',
  comment: '#586e75',
  number: '#d33682',
  type: '#268bd2',
  property: '#b58900',
  punctuation: '#839496',
  command: '#cb4b16',
  flag: '#6c71c4',
  variable: '#d33682',
  plain: '#839496',
}

const TOKEN_COLORS_LIGHT: Record<TokenType, string> = {
  keyword: '#859900',
  string: '#2aa198',
  comment: '#93a1a1',
  number: '#d33682',
  type: '#268bd2',
  property: '#b58900',
  punctuation: '#657b83',
  command: '#cb4b16',
  flag: '#6c71c4',
  variable: '#d33682',
  plain: '#657b83',
}

export function getTokenColor(type: TokenType, theme: 'dark' | 'light' = 'dark'): string {
  return theme === 'dark' ? TOKEN_COLORS_DARK[type] : TOKEN_COLORS_LIGHT[type]
}

type TokenRule = [RegExp, TokenType]

const HCL_KEYWORDS = /^(resource|variable|output|data|locals|module|provider|terraform|for_each|count|depends_on|lifecycle|dynamic|for|in|if|else|true|false|null)\b/
const HCL_RULES: TokenRule[] = [
  [/^#.*/, 'comment'],
  [/^\/\/.*/, 'comment'],
  [HCL_KEYWORDS, 'keyword'],
  [/^"(?:[^"\\]|\\.)*"/, 'string'],
  [/^[a-z_][a-z0-9_]*(?=\s*=)/, 'property'],
  [/^[a-z_][a-z0-9_]*(?=\s*\{)/, 'type'],
  [/^[a-z_][a-z0-9_]*\.[a-z_][a-z0-9_.]*/, 'variable'],
  [/^-?\d+(\.\d+)?/, 'number'],
  [/^[{}()[\]=,.]/, 'punctuation'],
]

const JSON_RULES: TokenRule[] = [
  [/^"(?:[^"\\]|\\.)*"\s*(?=:)/, 'property'],
  [/^"(?:[^"\\]|\\.)*"/, 'string'],
  [/^-?\d+(\.\d+)?([eE][+-]?\d+)?/, 'number'],
  [/^(true|false|null)\b/, 'keyword'],
  [/^[{}()[\]:,]/, 'punctuation'],
]

const SHELL_COMMANDS = /^(aws|az|gcloud|docker|kubectl|terraform|pulumi|curl|set|export)\b/
const SHELL_RULES: TokenRule[] = [
  [/^#.*/, 'comment'],
  [SHELL_COMMANDS, 'command'],
  [/^--?[a-zA-Z][a-zA-Z0-9-]*/, 'flag'],
  [/^\$[A-Z_][A-Z0-9_]*/, 'variable'],
  [/^\$\([^)]*\)/, 'variable'],
  [/^"(?:[^"\\]|\\.)*"/, 'string'],
  [/^'(?:[^'\\]|\\.)*'/, 'string'],
  [/^[|>&;\\]/, 'punctuation'],
  [/^-?\d+(\.\d+)?/, 'number'],
]

const CSV_RULES: TokenRule[] = [
  [/^"(?:[^"\\]|\\.)*"/, 'string'],
  [/^,/, 'punctuation'],
  [/^-?\d+(\.\d+)?/, 'number'],
  [/^(true|false)\b/i, 'keyword'],
]

const XML_RULES: TokenRule[] = [
  [/^<!--[\s\S]*?-->/, 'comment'],
  [/^<\/?[a-zA-Z][a-zA-Z0-9:.-]*/, 'keyword'],
  [/^[a-zA-Z][a-zA-Z0-9:.-]*(?=\s*=)/, 'property'],
  [/^"(?:[^"\\]|\\.)*"/, 'string'],
  [/^'(?:[^'\\]|\\.)*'/, 'string'],
  [/^-?\d+(\.\d+)?/, 'number'],
  [/^[<>\/=]/, 'punctuation'],
]

function getRules(language: Language): TokenRule[] {
  switch (language) {
    case 'hcl': return HCL_RULES
    case 'json': return JSON_RULES
    case 'shell': return SHELL_RULES
    case 'csv': return CSV_RULES
    case 'xml': return XML_RULES
  }
}

function tokenizeLine(line: string, rules: TokenRule[]): Token[] {
  const tokens: Token[] = []
  let remaining = line

  while (remaining.length > 0) {
    // Skip whitespace as plain
    const wsMatch = remaining.match(/^\s+/)
    if (wsMatch) {
      tokens.push({ type: 'plain', value: wsMatch[0] })
      remaining = remaining.slice(wsMatch[0].length)
      continue
    }

    let matched = false
    for (const [pattern, type] of rules) {
      const m = remaining.match(pattern)
      if (m) {
        tokens.push({ type, value: m[0] })
        remaining = remaining.slice(m[0].length)
        matched = true
        break
      }
    }

    if (!matched) {
      // Consume one character as plain text
      const nextSpecial = remaining.slice(1).search(/[\s"'#$\-\d{}[\]()=,.|>&;\\]/)
      if (nextSpecial === -1) {
        tokens.push({ type: 'plain', value: remaining })
        remaining = ''
      } else {
        tokens.push({ type: 'plain', value: remaining.slice(0, nextSpecial + 1) })
        remaining = remaining.slice(nextSpecial + 1)
      }
    }
  }

  return tokens
}

export function tokenize(code: string, language: Language): Token[][] {
  const rules = getRules(language)
  return code.split('\n').map((line) => tokenizeLine(line, rules))
}
