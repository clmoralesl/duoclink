import { vi } from 'vitest'

export const mockUser = { uid: 'test-uid', email: 'test@duoclink.cl' }

vi.mock('@/lib/firebase', () => ({
    // ← ahora tu componente verá un usuario logueado
    auth: { currentUser: mockUser } as unknown,
    db: {} as unknown,
    storage: {} as unknown,
}))