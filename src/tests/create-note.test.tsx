import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import '@/test-utils/mocks/router'
import '@/test-utils/mocks/firebase-db-storage'
import { addDocSpy, collectionSpy, serverTimestampMock, uploadBytesSpy, getDownloadURLSpy } from '@/test-utils/mocks/firebase-db-storage'
import { mockPush } from '@/test-utils/mocks/router'

// Página real
import CreateNote from '../app/create-note/page'

describe('Publicar nuevo apunte', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('valida campos requeridos en modo Texto (título y contenido)', async () => {
        render(<CreateNote />)

        // Por defecto el tab activo es "text"
        const publicar = screen.getByRole('button', { name: /publicar/i })
        await userEvent.click(publicar)

        expect(await screen.findByText(/el título es obligatorio/i)).toBeInTheDocument()
        expect(screen.getByText(/el contenido del apunte es obligatorio/i)).toBeInTheDocument()
        expect(addDocSpy).not.toHaveBeenCalled()
    })

    it('publica un apunte de Texto y redirige a /apuntes', async () => {
        render(<CreateNote />)

        // Completar título y cuerpo
        const titulo = screen.getByPlaceholderText(/título del apunte \*/i)
        const cuerpo = screen.getByPlaceholderText(/escribe tu apunte aquí \*/i)

        await userEvent.type(titulo, 'Apunte de Algebra')
        await userEvent.type(cuerpo, 'Definiciones y propiedades…')

        await userEvent.click(screen.getByRole('button', { name: /publicar/i }))

        // Debe llamar a addDoc en la colección "notes" con payload correcto
        expect(collectionSpy).toHaveBeenCalledWith(expect.anything(), 'notes')
        expect(addDocSpy).toHaveBeenCalledTimes(1)

        const [, data] = addDocSpy.mock.calls[0]
        expect(data).toMatchObject({
            titulo: 'Apunte de Algebra',
            cuerpo: 'Definiciones y propiedades…',
            tags: [],
            tipo: 'text',
        })
        // creado: serverTimestamp()
        expect(data.creado).toBe(serverTimestampMock)

        // Redirige
        expect(mockPush).toHaveBeenCalledWith('/apuntes')
    })

    it('publica un apunte de Media subiendo archivo a Storage', async () => {
        render(<CreateNote />)

        // Cambiar a tab "Imagen / Video"
        await userEvent.click(screen.getByRole('button', { name: /imagen \/ video/i }))

        // Título
        const titulo = screen.getByPlaceholderText(/título del apunte \*/i)
        await userEvent.type(titulo, 'Foto laboratorio')

        // Seleccionar archivo (el input está asociado al label "Seleccionar archivo")
        const fileInput = screen.getByLabelText(/seleccionar archivo/i) as HTMLInputElement
        const file = new File([new Uint8Array([1, 2, 3])], 'lab.png', { type: 'image/png' })
        await userEvent.upload(fileInput, file)

        // Confirmamos que los mocks de subida devolverán una URL
        getDownloadURLSpy.mockResolvedValueOnce('https://files.example/lab.png')

        // Publicar
        await userEvent.click(screen.getByRole('button', { name: /publicar/i }))

        // Debe subir a storage y luego persistir en firestore
        expect(uploadBytesSpy).toHaveBeenCalledTimes(1)
        expect(addDocSpy).toHaveBeenCalledTimes(1)

        const [, data] = addDocSpy.mock.calls[0]
        expect(data).toMatchObject({
            titulo: 'Foto laboratorio',
            cuerpo: 'https://files.example/lab.png',
            tipo: 'media',
        })

        expect(mockPush).toHaveBeenCalledWith('/apuntes')
    })
})