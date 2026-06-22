/**
 * @file components/admin/user/user-avatar.jsx
 * @description Initials avatar for the admin user table.
 */

function initials(firstName, lastName) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase()
}

export function UserAvatar({ user }) {
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EDE9FE] text-xs font-bold text-[#7C3AED]">
      {initials(user.firstName, user.lastName)}
    </div>
  )
}