import { vi } from 'vitest'

export const mockUser = {
    uid: 'test-uid',
    email: 'test@duoclink.cl',
    getIdToken: vi.fn().mockResolvedValue('mock-token'),
}

vi.mock('@/lib/firebase', () => ({
    auth: { currentUser: mockUser } as unknown,
    db: {} as unknown,
    storage: {} as unknown,
}))
