/**
 * @file lib/i18n.js
 * @description Configuration i18next : détection automatique de la langue du navigateur,
 * chargement HTTP des fichiers de traduction depuis /public/locales/,
 * et support de 4 langues (fr, en, ar, he).
 *
 * Les fichiers de traduction sont organisés par langue et namespace :
 *   /public/locales/{langue}/{namespace}.json
 */
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'
import LanguageDetector from "i18next-browser-languagedetector";

export const LOCALES = ['en', 'fr', 'ar', 'he']
export const DEFAULT_LOCALE = 'en'

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: LOCALES,
    interpolation: { escapeValue: false },
    debug: import.meta.env.DEV,
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  })

export default i18n