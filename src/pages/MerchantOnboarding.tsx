import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { merchantService } from '../services/api'
import type { MerchantRegistrationRequest } from '../types/api'

type FormData = MerchantRegistrationRequest

export default function MerchantOnboarding() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await merchantService.register(data)
      setSuccess(true)
      
      // Store token
      localStorage.setItem('merchant_token', response.token)
      localStorage.setItem('merchant_user', JSON.stringify(response.user))
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/merchant/dashboard')
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data || 'Registrazione fallita. Riprova.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-6">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
        <div className="max-w-md w-full text-center animate-fade-in-up">
          <div className="mb-6 text-7xl animate-bounce">✓</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Registrazione completata!
          </h1>
          <p className="text-gray-600 mb-4">
            Il tuo negozio è stato registrato con successo.
          </p>
          <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-4">
            ⏳ Il negozio è in attesa di verifica. Riceverai una notifica quando sarà attivato.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link to="/" className="text-2xl font-bold text-gray-900">
            TCG Arena
          </Link>
        </div>
      </nav>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Registra il tuo negozio
          </h1>
          <p className="text-lg text-gray-600">
            Inizia a gestire il tuo negozio TCG in pochi minuti
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Account Information */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informazioni Account
            </h2>
            <div className="space-y-4">
              <Input
                label="Username"
                {...register('username', {
                  required: 'Username obbligatorio',
                  minLength: { value: 3, message: 'Minimo 3 caratteri' },
                })}
                error={errors.username?.message}
                placeholder="johndoe"
              />
              <Input
                label="Email"
                type="email"
                {...register('email', {
                  required: 'Email obbligatoria',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Indirizzo email non valido',
                  },
                })}
                error={errors.email?.message}
                placeholder="mario@esempio.it"
              />
              <Input
                label="Password"
                type="password"
                {...register('password', {
                  required: 'Password obbligatoria',
                  minLength: { value: 8, message: 'Minimo 8 caratteri' },
                })}
                error={errors.password?.message}
                placeholder="••••••••"
              />
              <Input
                label="Nome visualizzato"
                {...register('displayName', {
                  required: 'Nome visualizzato obbligatorio',
                })}
                error={errors.displayName?.message}
                placeholder="Mario Rossi"
              />
            </div>
          </section>

          {/* Shop Information */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informazioni Negozio
            </h2>
            <div className="space-y-4">
              <Input
                label="Nome negozio"
                {...register('shopName', {
                  required: 'Nome negozio obbligatorio',
                })}
                error={errors.shopName?.message}
                placeholder="Il mio Negozio TCG"
              />
              <Input
                label="Indirizzo"
                {...register('address', {
                  required: 'Indirizzo obbligatorio',
                })}
                error={errors.address?.message}
                placeholder="Via Roma 123"
              />
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Città"
                  {...register('city', {
                    required: 'Città obbligatoria',
                  })}
                  error={errors.city?.message}
                  placeholder="Milano"
                />
                <Input
                  label="CAP"
                  {...register('zipCode', {
                    required: 'CAP obbligatorio',
                  })}
                  error={errors.zipCode?.message}
                  placeholder="20100"
                />
              </div>
              <Input
                label="Telefono"
                type="tel"
                {...register('phone', {
                  required: 'Telefono obbligatorio',
                })}
                error={errors.phone?.message}
                placeholder="+39 02 1234567"
              />
              <Textarea
                label="Descrizione (Opzionale)"
                {...register('description')}
                error={errors.description?.message}
                placeholder="Raccontaci del tuo negozio..."
                rows={4}
              />
            </div>
          </section>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 text-lg font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creazione account...' : 'Crea account'}
          </button>

          <p className="text-center text-gray-600">
            Hai già un account?{' '}
            <a href="#" className="font-medium text-gray-900 hover:underline">
              Accedi
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {label}
        </label>
        <input
          ref={ref}
          className={`w-full px-4 py-3 text-gray-900 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            error
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-200 focus:ring-gray-900 focus:border-transparent'
          }`}
          {...props}
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    )
  }
)

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {label}
        </label>
        <textarea
          ref={ref}
          className={`w-full px-4 py-3 text-gray-900 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
            error
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-200 focus:ring-gray-900 focus:border-transparent'
          }`}
          {...props}
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    )
  }
)
