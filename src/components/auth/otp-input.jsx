/**
 * @file components/auth/otp-input.jsx
 * @description 6-box OTP input with auto-advance, paste support, and backspace navigation.
 */

import { useRef } from "react"
import { cn } from "@/lib/utils"

/**
 * @param {{
 *   value: string,
 *   onChange: (v: string) => void,
 *   disabled?: boolean,
 *   digitLabel?: (n: number) => string, // e.g. (n) => t("otp.digit", { n })
 * }} props
 */
export function OtpInput({ value, onChange, disabled = false, digitLabel }) {
  const inputs = useRef([])
  const digits = (value + "      ").slice(0, 6).split("")
  const labelFor = digitLabel ?? ((n) => `Digit ${n}`)

  const focus = (i) => inputs.current[i]?.focus()

  const handleChange = (i, e) => {
    const char = e.target.value.replace(/\D/g, "").slice(-1)
    const next  = digits.map((d, idx) => (idx === i ? char : d))
    onChange(next.join("").trimEnd())
    if (char && i < 5) focus(i + 1)
  }

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      if (digits[i] && digits[i].trim()) {
        const next = digits.map((d, idx) => (idx === i ? " " : d))
        onChange(next.join("").trimEnd())
      } else if (i > 0) {
        focus(i - 1)
      }
    }
    if (e.key === "ArrowLeft"  && i > 0) focus(i - 1)
    if (e.key === "ArrowRight" && i < 5) focus(i + 1)
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    onChange(pasted)
    focus(Math.min(pasted.length, 5))
  }

  return (
    <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          aria-label={labelFor(i + 1)}
          className={cn(
            "size-11 rounded-lg border text-center text-lg font-bold tabular-nums",
            "border-input bg-background text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-[#7C3AED]",
            "transition-all duration-100",
            d.trim()
              ? "border-[#7C3AED]/60 bg-[#EDE9FE]/30"
              : "border-input",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
      ))}
    </div>
  )
}