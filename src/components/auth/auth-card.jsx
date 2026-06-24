/**
 * @file components/auth/auth-card.jsx
 * @description Shared shell for standalone auth pages (forgot-password,
 * reset-password, confirm-email, admin-login): centered card, icon badge,
 * title, subtitle, and a footer slot for back-links.
 */

import { Layout } from "@/components/layout/layout"

/**
 * @param {{
 *   icon: React.ReactNode,
 *   title: string,
 *   subtitle?: string,
 *   children: React.ReactNode,
 *   footer?: React.ReactNode,
 * }} props
 */
export function AuthCard({ icon, title, subtitle, children, footer }) {
  return (
    <Layout hideSearch hideNav hideUserSection>
      <div className="min-h-screen bg-[#f4f4f6] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">

          {icon && (
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center size-12 rounded-lg bg-[#EDE9FE]">
                {icon}
              </div>
            </div>
          )}

          <h1 className="text-center text-2xl font-bold mb-1 text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-center text-sm text-gray-500 mb-8">{subtitle}</p>
          )}

          {children}

          {footer && <div className="mt-6 flex justify-center">{footer}</div>}
        </div>
      </div>
    </Layout>
  )
}

/**
 * Standard "success" variant: big icon badge + centered text + actions.
 * @param {{ icon: React.ReactNode, title: string, children: React.ReactNode }} props
 */
export function AuthSuccessCard({ icon, title, children }) {
  return (
    <Layout hideSearch hideNav hideUserSection>
      <div className="min-h-screen bg-[#f4f4f6] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-green-100">
            {icon}
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{title}</h1>
          {children}
        </div>
      </div>
    </Layout>
  )
}