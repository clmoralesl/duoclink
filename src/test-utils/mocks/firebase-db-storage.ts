import { vi } from "vitest";

export const addDocSpy = vi.fn(async (_colRef: any, _data: any): Promise<void> => { });
export const collectionSpy = vi.fn((_db: any, _col: string) => ({ col: _col }));

export const refSpy = vi.fn((_storage: any, path: string) => ({ path }));
export const uploadBytesSpy = vi.fn(async (_ref: any, _file: any): Promise<void> => { });
export const getDownloadURLSpy = vi.fn(async (r: any): Promise<string> => `https://files.example/${r.path}`);

// Valores “db” y “storage” que exporta tu lib
vi.mock("@/lib/firebase", () => ({
    db: {} as any,
    storage: {} as any,
}));

// Mock de Firestore
export const serverTimestampMock = Symbol("serverTimestamp") as any;

vi.mock("firebase/firestore", async () => {
    const actual = await vi.importActual<any>("firebase/firestore");
    return {
        ...actual,
        addDoc: (colRef: any, data: any) => addDocSpy(colRef, data),
        collection: (db: any, name: string) => collectionSpy(db, name),
        serverTimestamp: () => serverTimestampMock,
    };
});

// Mock de Storage
vi.mock("firebase/storage", async () => {
    const actual = await vi.importActual<any>("firebase/storage");
    return {
        ...actual,
        ref: (storage: any, path: string) => refSpy(storage, path),
        uploadBytes: (r: any, f: any) => uploadBytesSpy(r, f),
        getDownloadURL: (r: any) => getDownloadURLSpy(r),
    };
});

// AuthGuard: deja pasar los children en tests
vi.mock("@/components/AuthGuard", () => ({
    default: ({ children }: { children: React.ReactNode }) => children,
}));