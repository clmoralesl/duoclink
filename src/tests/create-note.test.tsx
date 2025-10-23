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
import CreateNote from '../app/create-note/page'

describe('Publicar nuevo apunte', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('valida campos requeridos en modo Texto (título y contenido)', async () => {
        render(<CreateNote />)

        const publicar = screen.getByRole('button', { name: /publicar/i })
        await userEvent.click(publicar)

        expect(await screen.findByText(/el título es obligatorio/i)).toBeInTheDocument()
        expect(screen.getByText(/el contenido del apunte es obligatorio/i)).toBeInTheDocument()
        expect(addDocSpy).not.toHaveBeenCalled()
    })

    it('publica un apunte de Texto y redirige a /apuntes', async () => {
        render(<CreateNote />)

        const titulo = screen.getByPlaceholderText(/título del apunte \*/i)
        const cuerpo = screen.getByPlaceholderText(/escribe tu apunte aquí \*/i)

        await userEvent.type(titulo, 'Apunte de Algebra')
        await userEvent.type(cuerpo, 'Definiciones y propiedades…')
        await userEvent.click(screen.getByRole('button', { name: /publicar/i }))

        // Espera a que addDoc sea invocado (no dependemos de la implementación interna de collection)
        await waitFor(() => expect(addDocSpy).toHaveBeenCalledTimes(1))

        const [, data] = addDocSpy.mock.calls[0]
        expect(data).toMatchObject({
            titulo: 'Apunte de Algebra',
            cuerpo: 'Definiciones y propiedades…',
            tags: [],
            tipo: 'text',
        })
        expect(data.creado).toBe(serverTimestampMock)

        await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/apuntes'))
    })

    it('publica un apunte de Media subiendo archivo a Storage', async () => {
        render(<CreateNote />)

        await userEvent.click(screen.getByRole('button', { name: /imagen \/ video/i }))

        const titulo = screen.getByPlaceholderText(/título del apunte \*/i)
        await userEvent.type(titulo, 'Foto laboratorio')

        const fileInput = screen.getByLabelText(/seleccionar archivo/i) as HTMLInputElement
        const file = new File([new Uint8Array([1, 2, 3])], 'lab.png', { type: 'image/png' })
        await userEvent.upload(fileInput, file)

        // Mockear URL que devolverá Storage
        getDownloadURLSpy.mockResolvedValueOnce('https://files.example/lab.png')

        await userEvent.click(screen.getByRole('button', { name: /publicar/i }))

        await waitFor(() => expect(uploadBytesSpy).toHaveBeenCalledTimes(1))
        await waitFor(() => expect(addDocSpy).toHaveBeenCalledTimes(1))

        const [, data] = addDocSpy.mock.calls[0]
        expect(data).toMatchObject({
            titulo: 'Foto laboratorio',
            cuerpo: 'https://files.example/lab.png',
            tipo: 'media',
        })

        await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/apuntes'))
    })
})