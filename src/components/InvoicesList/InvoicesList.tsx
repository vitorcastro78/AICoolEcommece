tsx
import React, { useMemo, useCallback } from 'react'
import { useInvoices } from '../hooks/useInvoices'
import { useInvoiceFile } from '../hooks/useInvoiceFile'
import { motion, AnimatePresence } from 'framer-motion'

export interface InvoicesListProps {
  customerId?: string
  subscriptionId?: string
  status?: string
  fromDate?: string
  toDate?: string
  pageSize?: number
  page?: number
  onDownload?: (invoiceId: string, fileUrl: string) => void
  className?: string
}

/**
 * Responsive, accessible, animated list of invoices for subscriptions ecommerce.
 */
export const InvoicesList: React.FC<InvoicesListProps> = React.memo(
  ({
    customerId,
    subscriptionId,
    status,
    fromDate,
    toDate,
    pageSize = 10,
    page = 1,
    onDownload,
    className = '',
  }) => {
    const {
      data,
      isLoading,
      isError,
      error,
      refetch,
      isFetching,
    } = useInvoices(
      {
        customerId,
        subscriptionId,
        status,
        fromDate,
        toDate,
        page,
        pageSize,
      },
      { keepPreviousData: true }
    )

    const [downloadingId, setDownloadingId] = React.useState<string | null>(null)
    const [downloadError, setDownloadError] = React.useState<string | null>(null)
    const { data: invoiceFile, isLoading: isFileLoading } = useInvoiceFile(
      downloadingId ?? undefined,
      useMemo(() => {
        if (!downloadingId || !data?.entries) return undefined
        const inv = data.entries.find((i) => i.id === downloadingId)
        return inv?.id ? inv?.id : undefined
      }, [downloadingId, data?.entries]),
      { enabled: !!downloadingId }
    )

    React.useEffect(() => {
      if (invoiceFile && downloadingId) {
        if (onDownload) onDownload(downloadingId, invoiceFile.url)
        else {
          const link = document.createElement('a')
          link.href = invoiceFile.url
          link.download = invoiceFile.fileName
          link.target = '_blank'
          link.rel = 'noopener noreferrer'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
        setDownloadingId(null)
      }
    }, [invoiceFile, downloadingId, onDownload])

    const handleDownload = useCallback(
      (invoiceId: string) => {
        setDownloadError(null)
        setDownloadingId(invoiceId)
      },
      []
    )

    const handleRetry = useCallback(() => {
      refetch()
    }, [refetch])

    const invoices = useMemo(() => data?.entries ?? [], [data])

    return (
      <section
        aria-label="Invoices list"
        className={`w-full max-w-5xl mx-auto px-2 sm:px-4 py-4 ${className}`}
      >
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white" id="invoices-heading">
            Invoices
          </h2>
          {isFetching && (
            <span className="text-sm text-gray-500 animate-pulse ml-0 sm:ml-4 mt-2 sm:mt-0" aria-live="polite">
              Updating...
            </span>
          )}
        </header>
        <div className="overflow-x-auto rounded-lg shadow bg-white dark:bg-gray-900">
          <AnimatePresence>
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center items-center h-40"
                aria-busy="true"
                aria-live="polite"
              >
                <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="ml-3 text-gray-700 dark:text-gray-200">Loading invoices...</span>
              </motion.div>
            ) : isError || downloadError ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center h-40"
                role="alert"
                aria-live="assertive"
              >
                <span className="text-red-600 font-medium">
                  {downloadError ||
                    (typeof error === 'object' && error && 'title' in error
                      ? (error as any).title
                      : 'Failed to load invoices.')}
                </span>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-3 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Retry loading invoices"
                >
                  Retry
                </button>
              </motion.div>
            ) : invoices.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-40"
                aria-live="polite"
              >
                <span className="text-gray-500">No invoices found.</span>
              </motion.div>
            ) : (
              <motion.table
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
                aria-labelledby="invoices-heading"
              >
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      #
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Due
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                  <AnimatePresence>
                    {invoices.map((invoice) => (
                      <motion.tr
                        key={invoice.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.18 }}
                        tabIndex={0}
                        aria-label={`Invoice ${invoice.id}`}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 focus-within:bg-blue-50 dark:focus-within:bg-blue-900"
                      >
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {invoice.id.slice(0, 8)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                          {new Date(invoice.issuedAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                          {new Date(invoice.dueAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {invoice.amount.toLocaleString(undefined, {
                            style: 'currency',
                            currency: invoice.currency,
                          })}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          <span
                            className={`
                              inline-block px-2 py-1 rounded-full text-xs font-semibold
                              ${
                                invoice.status === 'paid'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : invoice.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : invoice.status === 'failed' || invoice.status === 'overdue'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                              }
                            `}
                            aria-label={`Status: ${invoice.status}`}
                          >
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <button
                            type="button"
                            className={`inline-flex items-center px-3 py-1.5 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition
                              ${downloadingId === invoice.id || isFileLoading ? 'opacity-60 cursor-not-allowed' : ''}
                            `}
                            aria-label={`Download invoice ${invoice.id}`}
                            disabled={downloadingId === invoice.id || isFileLoading}
                            onClick={() => handleDownload(invoice.id)}
                          >
                            {downloadingId === invoice.id || isFileLoading ? (
                              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                              </svg>
                            )}
                            <span>Download</span>
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </motion.table>
            )}
          </AnimatePresence>
        </div>
        {data && data.total > pageSize && (
          <nav
            className="flex items-center justify-between mt-4"
            aria-label="Pagination"
          >
            <button
              type="button"
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={() => data.page > 1 && refetch({ page: data.page - 1 })}
              disabled={data.page <= 1}
              aria-label="Previous page"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Page {data.page} of {Math.ceil(data.total / pageSize)}
            </span>
            <button
              type="button"
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={() =>
                data.page < Math.ceil(data.total / pageSize) &&
                refetch({ page: data.page + 1 })
              }
              disabled={data.page >= Math.ceil(data.total / pageSize)}
              aria-label="Next page"
            >
              Next
            </button>
          </nav>
        )}
      </section>
    )
  }
)
