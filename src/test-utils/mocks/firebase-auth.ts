// src/test-utils/mocks/firebase-auth.ts
import { vi } from "vitest";

// ---- Tipos mínimos ----
export type MockUser = { uid: string; email: string };

// Usuario por defecto (logueado) para que AuthGuard no bloquee
const defaultUser: MockUser = { uid: "test-uid", email: "test@duoclink.cl" };

// ---- Spies ----
export const browserLocalPersistence = {} as const;

export const setPersistenceSpy = vi.fn(
    async (_auth: unknown, _persistence: unknown): Promise<void> => {
        void _auth;
        void _persistence;
    }
);

export const signInWithEmailAndPasswordSpy = vi.fn(
    async (_auth: unknown, email: string, _password: string): Promise<{ user: MockUser }> => {
        void _auth;
        void _password;
        return { user: { uid: "mock-uid", email } };
    }
);

export const onAuthStateChangedSpy = vi.fn(
    (_auth: unknown, cb: (user: MockUser | null) => void) => {
        void _auth;
        cb(defaultUser); // simula usuario autenticado
        return () => { };
    }
);

// Ese mock base (con currentUser) vive en src/test-utils/mocks/firebase-core.ts

// Mock del SDK de Firebase Auth
vi.mock("firebase/auth", async () => {
    const actual = (await vi.importActual<typeof import("firebase/auth")>("firebase/auth"))!;
    return {
        ...actual,
        setPersistence: (auth: unknown, persistence: unknown) =>
            setPersistenceSpy(auth, persistence),
        signInWithEmailAndPassword: (auth: unknown, email: string, password: string) =>
            signInWithEmailAndPasswordSpy(auth, email, password),
        onAuthStateChanged: (auth: unknown, cb: (user: MockUser | null) => void) =>
            onAuthStateChangedSpy(auth, cb),
        browserLocalPersistence,
    };
});