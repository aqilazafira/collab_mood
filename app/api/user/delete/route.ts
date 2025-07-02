import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSession, clearSession } from "@/lib/auth"

export async function DELETE() {
  try {
    const currentUser = await getSession()
    if (!currentUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = typeof currentUser.id === 'string' ? parseInt(currentUser.id, 10) : currentUser.id;
    if (isNaN(userId)) {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId },
    })

    const response = await clearSession()
    return response
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
