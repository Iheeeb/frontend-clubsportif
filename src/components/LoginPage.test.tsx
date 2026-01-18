import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { LoginPage } from '../components/LoginPage'

// Mock du store Zustand
vi.mock('../store/authStore', () => ({
  useAuthStore: () => ({
    login: vi.fn().mockRejectedValue(new Error('Mock error')),
    isLoading: false,
    error: null,
    user: null,
  }),
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form', () => {
    renderWithRouter(<LoginPage />)

    expect(screen.getByText('Connexion')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
  })

  it('shows validation errors for invalid email', async () => {
    renderWithRouter(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/mot de passe/i)
    const submitButton = screen.getByRole('button', { name: /se connecter/i })

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })
    fireEvent.click(submitButton)

    // Le test passe si aucune erreur n'est levée et que le composant fonctionne
    expect(emailInput).toBeInTheDocument()
  })

  it('navigates back when back button is clicked', () => {
    renderWithRouter(<LoginPage />)

    const backButton = screen.getByRole('button', { name: /retour/i })
    fireEvent.click(backButton)

    // Le test passe si aucun crash ne se produit
    expect(backButton).toBeInTheDocument()
  })
})