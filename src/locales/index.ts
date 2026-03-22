import { I18n } from 'i18n-js'

import en from '../locales/en.json'

const i18n = new I18n({ en })

i18n.locale = 'en'
i18n.enableFallback = true

export function t(key: string, options: any = {}) {
  return i18n.t(key, options)
}

export function getCurrentLocale(): string {
  return i18n.locale
}
