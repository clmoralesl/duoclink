import { vi } from "vitest";


export const browserLocalPersistence = {} as any;

export const setPersistenceSpy = vi.fn(async (_auth: any, _persistence: any): Promise<void> => {
});

export const signInWithEmailAndPasswordSpy = vi.fn(async (_auth: any, email: string, _password: string) => {
    return { user: { uid: "mock-uid", email } };
});

/**
 * El componente importa `auth` desde "@/lib/firebase",
 * así que se provee un objeto auth simulado.
 */
vi.mock("@/lib/firebase", () => ({
    auth: {} as any,
}));

vi.mock("firebase/auth", async () => {
    const actual = await vi.importActual<any>("firebase/auth");
    return {
        ...actual,
        setPersistence: (auth: any, persistence: any) => setPersistenceSpy(auth, persistence),
        signInWithEmailAndPassword: (auth: any, email: string, password: string) =>
            signInWithEmailAndPasswordSpy(auth, email, password),
        browserLocalPersistence,
    };
});