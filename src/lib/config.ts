export interface AppConfig {
  defaultCidr: string
  defaultTheme: 'light' | 'dark' | 'system'
  defaultInputMode: 'guided' | 'cidr'
  themeStorageKey: string
}

export const config: AppConfig = {
  defaultCidr: '10.0.0.0/16',
  defaultTheme: 'system',
  defaultInputMode: 'guided',
  themeStorageKey: 'subnet-fit-theme',
}
