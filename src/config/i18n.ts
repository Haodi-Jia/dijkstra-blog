export const i18nConfig = {
  defaultLocale: 'zh-CN',
  locales: ['zh-CN']
} as const

export type Locale = (typeof i18nConfig.locales)[number]
