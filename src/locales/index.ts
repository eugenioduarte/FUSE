import * as Localization from 'expo-localization'
import { I18n } from 'i18n-js'

import en from '../locales/en.json'

const i18n = new I18n({
  en,
})

const locales = Localization.getLocales()
i18n.locale = locales.length > 0 ? (locales[0].languageCode ?? 'en') : 'en'

i18n.enableFallback = true

export function t(key: string, options: any = {}) {
  return i18n.t(key, options)
}
