import { odooCallModelMethod } from "@/lib/odoo/client"

export async function changePassword(
  sessionId: string,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  await odooCallModelMethod(
    "res.users",
    "change_password",
    [oldPassword, newPassword],
    sessionId
  )
}
