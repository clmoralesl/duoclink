import { render, screen } from '@testing-library/react'
import Bienvenida from '../app/page'

test('muestra el texto "Bienvenido"', () => {
    render(<Bienvenida />)

    // busca la palabra "Bienvenido" (ignora mayúsculas/minúsculas)
    const texto = screen.getByText(/bienvenido/i)

    // verifica que esté en el documento
    expect(texto).toBeInTheDocument()
})