import session, { type SessionData } from 'express-session'
import { prisma } from './prisma.js'

const CLEANUP_INTERVAL_MS = 15 * 60 * 1000

export class PrismaSessionStore extends session.Store {
  private lastCleanup = 0

  get(
    sid: string,
    callback: (error?: unknown, session?: SessionData | null) => void,
  ): void {
    void this.read(sid).then(
      (sessionData) => callback(null, sessionData),
      (error) => callback(error),
    )
  }

  set(sid: string, sessionData: SessionData, callback?: (error?: unknown) => void): void {
    const expiresAt = sessionData.cookie?.expires ?? null

    void prisma.session
      .upsert({
        where: { id: sid },
        create: { id: sid, data: JSON.stringify(sessionData), expiresAt },
        update: { data: JSON.stringify(sessionData), expiresAt },
      })
      .then(
        () => callback?.(null),
        (error) => callback?.(error),
      )
  }

  destroy(sid: string, callback?: (error?: unknown) => void): void {
    void prisma.session.deleteMany({ where: { id: sid } }).then(
      () => callback?.(null),
      (error) => callback?.(error),
    )
  }

  touch(sid: string, sessionData: SessionData, callback?: (error?: unknown) => void): void {
    const expiresAt = sessionData.cookie?.expires ?? null

    void prisma.session
      .updateMany({ where: { id: sid }, data: { expiresAt } })
      .then(
        () => callback?.(null),
        (error) => callback?.(error),
      )
  }

  private async read(sid: string): Promise<SessionData | null> {
    await this.maybeCleanup()

    const stored = await prisma.session.findUnique({
      where: { id: sid },
    })

    if (!stored) return null

    if (stored.expiresAt && stored.expiresAt.getTime() < Date.now()) {
      await prisma.session
        .delete({ where: { id: sid } })
        .catch(() => undefined)
      return null
    }

    return JSON.parse(stored.data) as SessionData
  }

  private async maybeCleanup(): Promise<void> {
    const now = Date.now()

    if (now - this.lastCleanup < CLEANUP_INTERVAL_MS) return

    this.lastCleanup = now

    await prisma.session
      .deleteMany({ where: { expiresAt: { lt: new Date(now) } } })
      .catch(() => undefined)
  }
}