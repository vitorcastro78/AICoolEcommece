tsx
import React, { useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useCustomers } from '../hooks/useCustomers'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { useInvoices } from '../hooks/useInvoices'
import { usePaymentMethods } from '../hooks/usePaymentMethods'
import { useLogout } from '../hooks/useLogout'
import { GetCustomerResponse } from '../api/customersService'
import { GetSubscriptionDetailResponse } from '../api/types'
import { GetInvoicesResponse } from '../api/GetInvoicesResponse'
import { GetPaymentMethodResponse } from '../api/paymentMethodsService'

export interface UserProfileProps {
  accountId: string
  onEditProfile?: () => void
  onManageSubscription?: (subscriptionNumber: string) => void
  onAddPaymentMethod?: () => void
  onLogoutSuccess?: () => void
  className?: string
}

export const UserProfile: React.FC<UserProfileProps> = React.memo(
  ({
    accountId,
    onEditProfile,
    onManageSubscription,
    onAddPaymentMethod,
    onLogoutSuccess,
    className = '',
  }) => {
    const {
      data: customersData,
      isLoading: isLoadingCustomer,
      isError: isErrorCustomer,
      error: errorCustomer,
      refetch: refetchCustomer,
    } = useCustomers({}, { select: (data) => data.entries.find((c) => c.accountId === accountId) })

    const customer: GetCustomerResponse | undefined = customersData

    const {
      data: subscriptionsData,
      isLoading: isLoadingSubs,
      isError: isErrorSubs,
      error: errorSubs,
      refetch: refetchSubs,
    } = useSubscriptions({})

    const subscriptions = useMemo(
      () =>
        subscriptionsData?.entries?.filter(
          (s: any) => s.customerId === accountId || s.accountId === accountId
        ) ?? [],
      [subscriptionsData, accountId]
    )

    const {
      data: invoicesData,
      isLoading: isLoadingInvoices,
      isError: isErrorInvoices,
      error: errorInvoices,
      refetch: refetchInvoices,
    } = useInvoices({ customerId: accountId })

    const invoices = invoicesData?.entries ?? []

    const {
      data: paymentMethodsData,
      isLoading: isLoadingPM,
      isError: isErrorPM,
      error: errorPM,
      refetch: refetchPM,
    } = usePaymentMethods()

    const paymentMethods: GetPaymentMethodResponse[] = paymentMethodsData?.entries ?? []

    const { logout, isLoading: isLoggingOut } = useLogout()

    const handleLogout = useCallback(() => {
      logout()
      if (onLogoutSuccess) onLogoutSuccess()
    }, [logout, onLogoutSuccess])

    const loading =
      isLoadingCustomer || isLoadingSubs || isLoadingInvoices || isLoadingPM || isLoggingOut

    const error =
      errorCustomer ||
      errorSubs ||
      errorInvoices ||
      errorPM

    return (
      <motion.section
        className={`w-full max-w-3xl mx-auto p-4 md:p-8 bg-white rounded-lg shadow-lg ${className}`}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 32 }}
        aria-label="User Profile"
      >
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <motion.header
              className="mb-6 flex flex-col md:flex-row items-start md:items-center gap-4"
              initial={{ opacity: 0, x: -32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600"
                  aria-label="User Initials"
                >
                  {customer
                    ? `${customer.firstName?.[0] ?? ''}${customer.lastName?.[0] ?? ''}`.toUpperCase()
                    : ''}
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900" tabIndex={0}>
                    {customer
                      ? `${customer.firstName} ${customer.lastName}`
                      : loading
                      ? 'Carregando...'
                      : 'Usuário'}
                  </h1>
                  <p className="text-gray-500 text-sm" tabIndex={0}>
                    {customer?.email}
                  </p>
                </div>
              </div>
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onClick={onEditProfile}
                  aria-label="Editar perfil"
                  disabled={loading}
                >
                  Editar Perfil
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  onClick={handleLogout}
                  aria-label="Sair"
                  disabled={loading}
                >
                  {isLoggingOut ? (
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-t-transparent border-gray-600 rounded-full" />
                  ) : (
                    'Sair'
                  )}
                </button>
              </div>
            </motion.header>
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, x: -32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h2 className="text-lg font-medium text-gray-800 mb-2">Informações de Contato</h2>
              {loading ? (
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" aria-busy="true" />
              ) : error ? (
                <div className="text-red-600" role="alert">
                  Erro ao carregar dados do usuário.
                </div>
              ) : (
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>
                    <span className="font-medium">Email:</span> {customer?.email}
                  </li>
                  <li>
                    <span className="font-medium">Telefone:</span> {customer?.phoneNumber || '—'}
                  </li>
                  <li>
                    <span className="font-medium">Moeda:</span> {customer?.currency}
                  </li>
                  <li>
                    <span className="font-medium">Conta:</span> {customer?.accountNumber}
                  </li>
                </ul>
              )}
            </motion.div>
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, x: -32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-medium text-gray-800 mb-2">Endereços</h2>
              {loading ? (
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" aria-busy="true" />
              ) : (
                <ul className="space-y-2">
                  {customer?.addresses?.length ? (
                    customer.addresses.map((addr, idx) => (
                      <li key={idx} className="text-gray-700 text-sm">
                        <span className="block">
                          {addr.street}, {addr.city}
                          {addr.state ? `, ${addr.state}` : ''} - {addr.postalCode}, {addr.country}
                        </span>
                        <span className="text-xs text-gray-400">
                          {addr.type ? addr.type.charAt(0).toUpperCase() + addr.type.slice(1) : ''}
                          {addr.isDefault || addr.isPrimary ? ' (Principal)' : ''}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400 text-sm">Nenhum endereço cadastrado.</li>
                  )}
                </ul>
              )}
            </motion.div>
          </div>
          <div className="flex-1 flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h2 className="text-lg font-medium text-gray-800 mb-2">Assinaturas</h2>
              {isLoadingSubs ? (
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" aria-busy="true" />
              ) : isErrorSubs ? (
                <div className="text-red-600" role="alert">
                  Erro ao carregar assinaturas.
                </div>
              ) : (
                <ul className="space-y-2">
                  {subscriptions.length ? (
                    subscriptions.map((sub: any) => (
                      <li
                        key={sub.number ?? sub.subscriptionId ?? sub.id}
                        className="flex items-center justify-between bg-gray-50 rounded p-2"
                      >
                        <div>
                          <span className="font-medium text-gray-700">
                            {sub.number ?? sub.subscriptionId ?? sub.id}
                          </span>
                          <span className="ml-2 text-xs text-gray-500">
                            {sub.status}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs"
                          onClick={() =>
                            onManageSubscription?.(sub.number ?? sub.subscriptionId ?? sub.id)
                          }
                          aria-label="Gerenciar assinatura"
                        >
                          Gerenciar
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400 text-sm">Nenhuma assinatura ativa.</li>
                  )}
                </ul>
              )}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.18 }}
            >
              <h2 className="text-lg font-medium text-gray-800 mb-2">Métodos de Pagamento</h2>
              {isLoadingPM ? (
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" aria-busy="true" />
              ) : isErrorPM ? (
                <div className="text-red-600" role="alert">
                  Erro ao carregar métodos de pagamento.
                </div>
              ) : (
                <ul className="space-y-2">
                  {paymentMethods.length ? (
                    paymentMethods.map((pm) => (
                      <li
                        key={pm.id}
                        className="flex items-center justify-between bg-gray-50 rounded p-2"
                      >
                        <div>
                          <span className="font-medium text-gray-700">
                            {pm.paymentMethodType}
                          </span>
                          <span className="ml-2 text-xs text-gray-500">
                            {pm.isDefault ? 'Padrão' : ''}
                          </span>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400 text-sm">Nenhum método cadastrado.</li>
                  )}
                </ul>
              )}
              <button
                type="button"
                className="mt-2 px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                onClick={onAddPaymentMethod}
                aria-label="Adicionar método de pagamento"
                disabled={loading}
              >
                Adicionar Método
              </button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.21 }}
            >
              <h2 className="text-lg font-medium text-gray-800 mb-2">Faturas Recentes</h2>
              {isLoadingInvoices ? (
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" aria-busy="true" />
              ) : isErrorInvoices ? (
                <div className="text-red-600" role="alert">
                  Erro ao carregar faturas.
                </div>
              ) : (
                <ul className="space-y-2">
                  {invoices.length ? (
                    invoices.slice(0, 5).map((inv) => (
                      <li
                        key={inv.id}
                        className="flex items-center justify-between bg-gray-50 rounded p-2"
                      >
                        <div>
                          <span className="font-medium text-gray-700">
                            {inv.number}
                          </span>
                          <span className="ml-2 text-xs text-gray-500">
                            {new Date(inv.date).toLocaleDateString()}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            inv.status === 'paid'
                              ? 'text-green-600'
                              : inv.status === 'pending'
                              ? 'text-yellow-600'
                              : inv.status === 'overdue'
                              ? 'text-red-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400 text-sm">Nenhuma fatura encontrada.</li>
                  )}
                </ul>
              )}
            </motion.div>
          </div>
        </div>
      </motion.section>
    )
  }
)
