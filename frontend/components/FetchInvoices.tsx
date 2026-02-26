import React from 'react';
import { Search, AlertTriangle, ArrowRight, FileText } from 'lucide-react';
import { Invoice } from '../types';
import { styles } from '../styles';

interface FetchInvoicesProps {
  isSimulationMode: boolean;
  psbIdentifier: string;
  setPsbIdentifier: (value: string) => void;
  invoiceLimit: number;
  setInvoiceLimit: (value: number) => void;
  loading: boolean;
  invoices: Invoice[];
  error: string | null;
  onFetch: () => void;
  onSelectInvoice: (frqId: string, financeRequestAmount: string) => void;
}

export const FetchInvoices: React.FC<FetchInvoicesProps> = ({
  isSimulationMode,
  psbIdentifier,
  setPsbIdentifier,
  invoiceLimit,
  setInvoiceLimit,
  loading,
  invoices,
  error,
  onFetch,
  onSelectInvoice,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-fadeIn w-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Search className={`w-5 h-5 ${styles.iconColor}`} /> Fetch Invoices
          {isSimulationMode && (
            <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full border border-yellow-200">
              Simulated
            </span>
          )}
        </h2>
        <p className="text-xs text-gray-500 mt-1">Search invoices by PSB Channel Partner Identifier</p>
      </div>

      {/* Search Form */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-wrap gap-4 items-end">
          {/* PSB Identifier Input */}
          <div className="flex-1 min-w-[300px]">
            <label className={styles.label}>PSB Channel Partner Identifier</label>
            <input
              type="text"
              value={psbIdentifier}
              onChange={(e) => setPsbIdentifier(e.target.value)}
              placeholder="e.g., PSBCPL-DF-0191-0001"
              className={styles.input}
            />
          </div>

          {/* Limit Dropdown */}
          <div className="w-32">
            <label className={styles.label}>Limit</label>
            <select
              value={invoiceLimit}
              onChange={(e) => setInvoiceLimit(parseInt(e.target.value))}
              className={styles.input}
            >
              {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((n) => (
                <option key={n} value={n}>
                  {n} invoices
                </option>
              ))}
            </select>
          </div>

          {/* Fetch Button */}
          <button
            onClick={onFetch}
            disabled={loading}
            className={`${styles.primaryBtn} h-[46px] px-6 rounded-lg disabled:opacity-50`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span className="ml-2">Fetch Invoices</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        {invoices.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">PSB Batch Ref</th>
                <th className="px-4 py-3 text-left">Transaction Invoice Number</th>
                <th className="px-4 py-3 text-left">Transaction Finance Request</th>
                <th className="px-4 py-3 text-right">Invoice Amount</th>
                <th className="px-4 py-3 text-right">Finance Request Amount</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Invoice Date</th>
                <th className="px-4 py-3 text-left">FRQ (MySQL)</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.map((invoice, idx) => (
                <tr key={invoice.transactionfinancerequestid || idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {invoice.psbtransactionbatchreferenceno || '-'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#303087]">
                    {invoice.transactioninvoicenumber || '-'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {invoice.transactionfinancerequestid || '-'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-right">
                    {invoice.transactioninvoiceamount ? `₹${parseFloat(invoice.transactioninvoiceamount).toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-right font-semibold text-[#973795]">
                    {invoice.transactionfinancerequestamount ? `₹${parseFloat(invoice.transactionfinancerequestamount).toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {invoice.product || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {invoice.transactioninvoicedate ? new Date(invoice.transactioninvoicedate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-emerald-600">
                    {invoice.frqId || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onSelectInvoice(invoice.frqId, invoice.transactionfinancerequestamount)}
                      disabled={!invoice.frqId || invoice.frqId === 'N/A'}
                      className={`${styles.primaryBtn} px-3 py-1.5 rounded-lg text-xs disabled:opacity-40 disabled:cursor-not-allowed`}
                      title="Go to Create Response with this FRQ"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Enter a PSB Identifier and click "Fetch Invoices" to search</p>
          </div>
        )}
      </div>

      {/* Results Count */}
      {invoices.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
          Showing {invoices.length} invoice(s)
        </div>
      )}
    </div>
  );
};

