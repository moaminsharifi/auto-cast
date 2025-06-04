import createMiddleware from "next-intl/middleware"
import { locales } from "./lib/i18n"

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: "en",

  // Don't add locale prefix to default locale
  localePrefix: "as-needed",
})

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(fa|en)/:path*"],
}
