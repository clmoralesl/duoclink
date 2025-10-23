import { vi } from "vitest";

// ===== Tipos mínimos =====
export type FirestoreData = Record<string, unknown>;
export type CollectionRef = { name: string };

// ===== Spies Firestore =====
export const collectionSpy = vi.fn((_db: unknown, name: string): CollectionRef => {
    void _db;
    return { name };
});

export const addDocSpy = vi.fn(async (_col: CollectionRef, _data: FirestoreData) => {
    void _col; void _data;
    return { id: "mock-id" };
});

export const updateDocSpy = vi.fn(async (_ref: { id: string }, _partial: Partial<FirestoreData>) => {
    void _ref; void _partial;
});

export const getDocsSpy = vi.fn(async (_col: CollectionRef) => {
    void _col;
    return { docs: [] };
});

export const serverTimestampMock = Symbol("serverTimestamp");
export const serverTimestamp = vi.fn(() => serverTimestampMock);

// ===== Spies Storage =====
export type StorageRef = { path: string };

export const refSpy = vi.fn((_storage: unknown, path: string): StorageRef => {
    void _storage;
    return { path };
});

export const uploadBytesSpy = vi.fn(async (_ref: StorageRef, _file: Blob | Uint8Array | ArrayBuffer) => {
    void _ref; void _file;
});

export const getDownloadURLSpy = vi.fn(async (_ref: StorageRef) => {
    void _ref;
    return "https://example.com/mock.png";
});

export const deleteObjectSpy = vi.fn(async (_ref: StorageRef) => {
    void _ref;
});

// ===== Mock de módulos Firebase =====
// SDK modular "full"
vi.mock("firebase/firestore", () => ({
    collection: collectionSpy,
    addDoc: addDocSpy,
    getDocs: getDocsSpy,
    updateDoc: updateDocSpy,
    serverTimestamp,
}));

// SDK "lite" (algunos proyectos lo usan sin darse cuenta)
vi.mock("firebase/firestore/lite", () => ({
    collection: collectionSpy,
    addDoc: addDocSpy,
    getDocs: getDocsSpy,
    updateDoc: updateDocSpy,
    serverTimestamp,
}));

vi.mock("firebase/storage", () => ({
    ref: refSpy,
    uploadBytes: uploadBytesSpy,
    getDownloadURL: getDownloadURLSpy,
    deleteObject: deleteObjectSpy,
}));