/**
 * @file components/auth/password-strength.jsx
 * @description Live password-strength checklist, shown under a password
 * field once it's been focused. Rules are evaluated client-side; labels are
 * passed in already translated.
 */

import { Check, Circle } from "lucide-react"

const RULES = [
  { id: "length",    test: (p) => p.length >= 8 },
  { id: "uppercase", test: (p) => /[A-Z]/.test(p) },
  { id: "number",    test: (p) => /[0-9]/.test(p) },
  { id: "special",   test: (p) => /[^A-Za-z0-9]/.test(p) },
]

/**
 * @param {{ password: string, labels: Record<string, string> }} props
 *   labels: { length, uppercase, number, special } — translated strings
 */
export function PasswordStrength({ password, labels }) {
  const evaluated = RULES.map((r) => ({ ...r, ok: r.test(password) }))

  return (
    <div className="mt-2 space-y-1.5 rounded-lg bg-gray-50 p-3">
      {evaluated.map((r) => (
        <div key={r.id} className="flex items-center gap-2">
          {r.ok
            ? <Check className="size-3.5 text-green-500" strokeWidth={2.5} />
            : <Circle className="size-3.5 text-gray-300" />
          }
          <span className={`text-xs ${r.ok ? "text-green-700" : "text-gray-500"}`}>
            {labels[r.id]}
          </span>
        </div>
      ))}
    </div>
  )
}

/** Whether the password satisfies every rule. */
export function isPasswordValid(password) {
  return RULES.every((r) => r.test(password))
}