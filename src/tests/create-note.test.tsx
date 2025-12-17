import '@/test-utils/mocks/firebase-core'      // mockea auth/db/storage básicos
import '@/test-utils/mocks/firebase-auth'      // mockea onAuthStateChanged, setPersistence, signIn...
import '@/test-utils/mocks/firebase-db-storage'// mockea Firestore/Storage + spies
import '@/test-utils/mocks/router'             // mock de next/navigation

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
    addDocSpy,
    serverTimestampMock,
    uploadBytesSpy,
    getDownloadURLSpy,
} from '@/test-utils/mocks/firebase-db-storage'
import { mockPush } from '@/test-utils/mocks/router'

// Página real
import CreateNote from '../app/apuntes/create-note/page'

describe('Publicar nuevo apunte', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ id: '123' }),
            })
        ) as any
    })

    it('valida campos requeridos en modo Texto (título y contenido)', async () => {
        render(<CreateNote />)

        const publicar = screen.getByRole('button', { name: /publicar/i })
        await userEvent.click(publicar)

        expect(await screen.findByText(/el título es obligatorio/i)).toBeInTheDocument()
        expect(screen.getByText(/el contenido es obligatorio/i)).toBeInTheDocument()
        expect(global.fetch).not.toHaveBeenCalled()
    })

    it('publica un apunte de Texto y redirige a /apuntes', async () => {
        render(<CreateNote />)

        const titulo = screen.getByPlaceholderText(/título \*/i)
        const cuerpo = screen.getByPlaceholderText(/contenido \*/i)

        await userEvent.type(titulo, 'Apunte de Algebra')
        await userEvent.type(cuerpo, 'Definiciones y propiedades…')
        await userEvent.click(screen.getByRole('button', { name: /publicar/i }))

        // Espera a que fetch sea invocado
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))

        expect(global.fetch).toHaveBeenCalledWith('/api/apuntes', expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"titulo":"Apunte de Algebra"'),
        }))
        expect(global.fetch).toHaveBeenCalledWith('/api/apuntes', expect.objectContaining({
            body: expect.stringContaining('"cuerpo":"Definiciones y propiedades…"'),
        }))
        expect(global.fetch).toHaveBeenCalledWith('/api/apuntes', expect.objectContaining({
            body: expect.stringContaining('"tipo":"text"'),
        }))

        await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/apuntes'))
    })

    it('publica un apunte de Media subiendo archivo a Storage', async () => {
        render(<CreateNote />)

        await userEvent.click(screen.getByRole('button', { name: /imagen \/ video/i }))

        const titulo = screen.getByPlaceholderText(/título \*/i)
        await userEvent.type(titulo, 'Foto laboratorio')

        const fileInput = screen.getByLabelText(/seleccionar archivo/i) as HTMLInputElement
        const file = new File([new Uint8Array([1, 2, 3])], 'lab.png', { type: 'image/png' })
        await userEvent.upload(fileInput, file)

        // Mockear URL que devolverá Storage
        getDownloadURLSpy.mockResolvedValueOnce('https://files.example/lab.png')

        await userEvent.click(screen.getByRole('button', { name: /publicar/i }))

        await waitFor(() => expect(uploadBytesSpy).toHaveBeenCalledTimes(1))
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))

        expect(global.fetch).toHaveBeenCalledWith('/api/apuntes', expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"titulo":"Foto laboratorio"'),
        }))
        expect(global.fetch).toHaveBeenCalledWith('/api/apuntes', expect.objectContaining({
            body: expect.stringContaining('"url":"https://files.example/lab.png"'),
        }))
        expect(global.fetch).toHaveBeenCalledWith('/api/apuntes', expect.objectContaining({
            body: expect.stringContaining('"tipo":"media"'),
        }))

        await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/apuntes'))
    })
})