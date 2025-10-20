import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Activa mocks ANTES del componente
import '@/test-utils/mocks/router'
import {
    setPersistenceSpy,
    signInWithEmailAndPasswordSpy,
    browserLocalPersistence,
} from '@/test-utils/mocks/firebase-auth'
import { mockPush } from '@/test-utils/mocks/router'

// Página real
import LoginPage from '../app/login/page'

describe('Inicio de sesión', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('permite escribir credenciales y habilita el botón', async () => {
        render(<LoginPage />)

        const email = screen.getByLabelText(/correo/i)
        const password = screen.getByLabelText(/contraseñ(a|o)/i)
        const btn = screen.getByRole('button', { name: /entrar/i })

        await userEvent.type(email, 'joe.arancibia@duocuc.cl')
        await userEvent.type(password, '123456')

        expect(email).toHaveValue('joe.arancibia@duocuc.cl')
        expect(password).toHaveValue('123456')
        expect(btn).toBeEnabled()
    })

    it('login exitoso: persiste sesión, llama a Firebase y navega a /home', async () => {
        // Resultado exitoso controlado
        signInWithEmailAndPasswordSpy.mockResolvedValueOnce({
            user: { uid: 'u123', email: 'joe.arancibia@duocuc.cl' },
        } as any)

        render(<LoginPage />)

        const email = screen.getByLabelText(/correo/i)
        const password = screen.getByLabelText(/contraseñ(a|o)/i)
        const btn = screen.getByRole('button', { name: /entrar/i })

        await userEvent.type(email, 'joe.arancibia@duocuc.cl')
        await userEvent.type(password, '123456')
        await userEvent.click(btn)

        // 1) setPersistence(auth, browserLocalPersistence)
        expect(setPersistenceSpy).toHaveBeenCalledTimes(1)
        expect(setPersistenceSpy).toHaveBeenCalledWith(
            expect.anything(),
            browserLocalPersistence
        )

        // 2) signInWithEmailAndPassword(auth, email, password)
        expect(signInWithEmailAndPasswordSpy).toHaveBeenCalledTimes(1)
        expect(signInWithEmailAndPasswordSpy).toHaveBeenCalledWith(
            expect.anything(),
            'joe.arancibia@duocuc.cl',
            '123456'
        )

        // 3) router.push('/home')
        expect(mockPush).toHaveBeenCalledWith('/home')
    })

    it('login con error: muestra mensaje "Correo o contraseña inválidos."', async () => {
        // Simula error típico de Firebase
        signInWithEmailAndPasswordSpy.mockRejectedValueOnce({
            code: 'auth/invalid-credential',
        })

        render(<LoginPage />)

        const email = screen.getByLabelText(/correo/i)
        const password = screen.getByLabelText(/contraseñ(a|o)/i)
        const btn = screen.getByRole('button', { name: /entrar/i })

        await userEvent.type(email, 'wrong@duoclink.cl')
        await userEvent.type(password, 'badpass')
        await userEvent.click(btn)

        // Mensaje exacto que muestra el componente
        expect(
            await screen.findByText(/correo o contraseña inválidos\./i)
        ).toBeInTheDocument()
    })
})