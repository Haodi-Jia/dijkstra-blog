import { i18nConfig } from '@/config/i18n'

export function formatPostDate(date: string) {
  return new Intl.DateTimeFormat(i18nConfig.defaultLocale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
    .format(new Date(`${date}T00:00:00`))
    .replaceAll('/', '.')
}
