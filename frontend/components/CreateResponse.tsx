import React, { useState } from 'react';
import { RefreshCw, FileCode, Download, HardDrive, AlertCircle } from 'lucide-react';
import { ResponseFormData, ResponseType } from '../types';
import { styles } from '../styles';

interface ValidationErrors {
  amount?: string;
  dueDate?: string;
}

interface CreateResponseProps {
  responseType: ResponseType;
  setResponseType: (type: ResponseType) => void;
  formData: ResponseFormData;
  setFormData: React.Dispatch<React.SetStateAction<ResponseFormData>>;
  generatedXml: string;
  batchId: string;
  setBatchId: (value: string) => void;
  fetchingFrq: boolean;
  frqOptions: string[];
  maxFinanceAmount: string | null;
  onFetchFrq: () => void;
  onGenerateXml: () => void;
  onDownloadXml: () => void;
  onSaveToStorage: () => void;
  // CP Lookup props (for Exposure Update)
  cpIdentifier: string;
  setCpIdentifier: (value: string) => void;
  fetchingCp: boolean;
  onFetchCp: () => void;
}

export const CreateResponse: React.FC<CreateResponseProps> = ({
  responseType,
  setResponseType,
  formData,
  setFormData,
  generatedXml,
  batchId,
  setBatchId,
  fetchingFrq,
  frqOptions,
  maxFinanceAmount,
  onFetchFrq,
  onGenerateXml,
  onDownloadXml,
  onSaveToStorage,
  cpIdentifier,
  setCpIdentifier,
  fetchingCp,
  onFetchCp,
}) => {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when user changes the field
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Validate amount against max finance request amount
  const validateAmount = (): boolean => {
    if (!maxFinanceAmount) return true; // No limit if not set
    const amount = parseFloat(formData.amount);
    const maxAmount = parseFloat(maxFinanceAmount);
    if (isNaN(amount) || isNaN(maxAmount)) return true;
    return amount <= maxAmount;
  };

  // Validate due date is in the future
  const validateDueDate = (): boolean => {
    if (!formData.dueDate) return true; // Optional field
    const dueDate = new Date(formData.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    return dueDate > today;
  };

  // Handle blur validation for inline errors
  const handleAmountBlur = () => {
    if (!validateAmount()) {
      setValidationErrors((prev) => ({
        ...prev,
        amount: `Amount cannot exceed the finance request amount of ₹${parseFloat(maxFinanceAmount!).toLocaleString('en-IN')}`,
      }));
    }
  };

  const handleDueDateBlur = () => {
    if (!validateDueDate()) {
      setValidationErrors((prev) => ({
        ...prev,
        dueDate: 'Due date must be a future date',
      }));
    }
  };

  // Validate form before generating XML
  const handleGenerateXmlWithValidation = () => {
    const errors: ValidationErrors = {};

    if (!validateAmount()) {
      errors.amount = `Amount cannot exceed the finance request amount of ₹${parseFloat(maxFinanceAmount!).toLocaleString('en-IN')}`;
    }

    if (!validateDueDate()) {
      errors.dueDate = 'Due date must be a future date';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    onGenerateXml();
  };

  const handleResponseTypeChange = (newType: ResponseType) => {
    setResponseType(newType);
    if (newType === 'repayment') {
      setFormData((prev) => ({ ...prev, action: 'liquidate', comment: 'Finance settlement successful' }));
    } else if (newType === 'exposure') {
      setFormData((prev) => ({ ...prev, comment: '' }));
    } else {
      setFormData((prev) => ({ ...prev, action: 'fund', comment: 'Transaction declined Successfully' }));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Left Column: Form */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <RefreshCw className={`w-5 h-5 ${styles.iconColor}`} />
          <h2 className="text-lg font-bold text-gray-800">Response Parameters</h2>
        </div>

        <div className="p-6 space-y-8">
          {/* Response Type Selection */}
          <div>
            <h3 className={styles.sectionHeader}>Response Type</h3>
            <div>
              <label className={styles.label}>
                Select Response Type <span className="text-[#973795]">*</span>
              </label>
              <select
                value={responseType}
                onChange={(e) => handleResponseTypeChange(e.target.value as ResponseType)}
                className={styles.input}
              >
                <option value="transaction">Transaction Response</option>
                <option value="repayment">Repayment Response</option>
                <option value="exposure">Exposure Update (Limits)</option>
              </select>
            </div>
          </div>

          {/* Header Section */}
          <div>
            <h3 className={styles.sectionHeader}>Header Data</h3>
            <div>
              <label className={styles.label}>Header Datetime</label>
              <input
                type="datetime-local"
                name="headerDatetime"
                value={formData.headerDatetime}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>
          </div>

          {/* Conditional Sections based on Response Type */}
          {responseType === 'exposure' ? (
            /* Exposure Update Section */
            <div>
              <h3 className={styles.sectionHeader}>Exposure Update Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CP Identifier Lookup Section */}
                <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className={styles.label}>Fetch CP Data by CP Identifier</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cpIdentifier}
                      onChange={(e) => setCpIdentifier(e.target.value)}
                      className={`${styles.input} flex-1 font-mono`}
                      placeholder="Enter CP Identifier (e.g., PSBCPL-DF-0191-0001)"
                    />
                    <button
                      onClick={onFetchCp}
                      disabled={fetchingCp}
                      className={`${styles.primaryBtn} px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
                        fetchingCp ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {fetchingCp ? 'Fetching...' : 'Fetch CP'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Enter CP Identifier to auto-fill Bank Customer Code and Related Customer Code from MongoDB
                  </p>
                </div>

                <div className="col-span-1">
                  <label className={styles.label}>
                    Bank Customer Code <span className="text-[#973795]">*</span>
                    <span className="relative group ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded cursor-help inline-flex items-center">
                      ?
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        If DF then give TM CP ID
                        <span className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-800"></span>
                      </span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="bankCustomerCode"
                    value={formData.bankCustomerCode}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="e.g., 12314-16dec2025"
                  />
                </div>
                <div className="col-span-1">
                  <label className={styles.label}>
                    Related Customer Code
                    <span className="relative group ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded cursor-help inline-flex items-center">
                      ?
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        If DF then give TM Program ID
                        <span className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-800"></span>
                      </span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="relatedCustomerCode"
                    value={formData.relatedCustomerCode}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="e.g., RACHIT2026 (optional)"
                  />
                </div>
                <div className="col-span-1">
                  <label className={styles.label}>
                    Action Code <span className="text-[#973795]">*</span>
                  </label>
                  <input
                    type="text"
                    name="actionCode"
                    value={formData.actionCode}
                    readOnly
                    className={`${styles.input} bg-gray-100`}
                    title="Always 'U' for Update"
                  />
                </div>
                <div className="col-span-1">
                  <label className={styles.label}>
                    Sanctioned Limit (exposure_limit) <span className="text-[#973795]">*</span>
                  </label>
                  <input
                    type="number"
                    name="exposureLimit"
                    value={formData.exposureLimit}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Integer > 0"
                    min="1"
                  />
                </div>
                <div className="col-span-1">
                  <label className={styles.label}>
                    Utilized Limit (exposure_utilized) <span className="text-[#973795]">*</span>
                  </label>
                  <input
                    type="number"
                    name="exposureUtilized"
                    value={formData.exposureUtilized}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Integer >= 0"
                    min="0"
                  />
                </div>
                <div className="col-span-1">
                  <label className={styles.label}>
                    Available Limit (exposure_remaining) <span className="text-[#973795]">*</span>
                  </label>
                  <input
                    type="number"
                    name="exposureRemaining"
                    value={formData.exposureRemaining}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Integer >= 0"
                    min="0"
                  />
                </div>
                <div className="col-span-1">
                  <label className={styles.label}>
                    Action Timestamp <span className="text-[#973795]">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="actionTimestamp"
                    value={formData.actionTimestamp}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>
                <div className="col-span-1">
                  <label className={styles.label}>
                    Expiry Date <span className="text-[#973795]">*</span>
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Funding Details Section (Transaction & Repayment) */
            <div>
              <h3 className={styles.sectionHeader}>Funding Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Batch ID Lookup Section */}
                <div className="col-span-1 md:col-span-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className={styles.label}>Fetch FRQ by Batch ID</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={batchId}
                      onChange={(e) => setBatchId(e.target.value)}
                      className={`${styles.input} flex-1 font-mono`}
                      placeholder="Enter Batch ID (e.g., 80783c4c-c3ea-458e-8877-42a9fca17f89)"
                    />
                    <button
                      onClick={onFetchFrq}
                      disabled={fetchingFrq}
                      className={`${styles.primaryBtn} px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
                        fetchingFrq ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {fetchingFrq ? 'Fetching...' : 'Fetch FRQ'}
                    </button>
                  </div>
                  {frqOptions.length > 1 && (
                    <div className="mt-2">
                      <label className={styles.label}>Select FRQ ({frqOptions.length} found)</label>
                      <select
                        value={formData.id}
                        onChange={(e) => setFormData((prev) => ({ ...prev, id: e.target.value }))}
                        className={styles.input}
                      >
                        {frqOptions.map((frq, idx) => (
                          <option key={idx} value={frq}>
                            {frq}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

              {/* Finance Request ID */}
              <div className="col-span-1 md:col-span-3">
                <label className={styles.label}>
                  Finance Request ID <span className="text-[#973795]">*</span>
                </label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  className={`${styles.input} font-mono text-green-400`}
                  placeholder="Enter FRQ ID or fetch from Batch ID above"
                />
              </div>

              {/* Action Field */}
              {responseType === 'transaction' ? (
                <div className="col-span-1">
                  <label className={styles.label}>
                    Action <span className="text-[#973795]">*</span>
                  </label>
                  <select name="action" value={formData.action} onChange={handleInputChange} className={styles.input}>
                    <option value="fund">fund</option>
                    <option value="decline">decline</option>
                    <option value="liquidate">liquidate</option>
                    <option value="overdue">overdue</option>
                    <option value="annotate">annotate</option>
                    <option value="approve">approve</option>
                  </select>
                </div>
              ) : (
                <div className="col-span-1">
                  <label className={styles.label}>
                    Action <span className="text-[#973795]">*</span>
                  </label>
                  <input type="text" value="liquidate" disabled className={`${styles.input} opacity-70 cursor-not-allowed`} />
                </div>
              )}

              <div className="col-span-1">
                <label className={styles.label}>
                  Action Date <span className="text-[#973795]">*</span>
                </label>
                <input
                  type="date"
                  name="actionDate"
                  value={formData.actionDate}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>

              <div className="col-span-1">
                <label className={styles.label}>
                  Amount <span className="text-[#973795]">*</span>
                  {maxFinanceAmount && (
                    <span className="text-xs text-gray-500 ml-2">
                      (Max: ₹{parseFloat(maxFinanceAmount).toLocaleString('en-IN')})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  onBlur={handleAmountBlur}
                  className={`${styles.input} ${validationErrors.amount ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {validationErrors.amount && (
                  <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>{validationErrors.amount}</span>
                  </div>
                )}
              </div>

              <div className="col-span-1">
                <label className={styles.label}>Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  onBlur={handleDueDateBlur}
                  min={(() => {
                    // Set minimum date to tomorrow
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return tomorrow.toISOString().split('T')[0];
                  })()}
                  className={`${styles.input} ${validationErrors.dueDate ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {validationErrors.dueDate && (
                  <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>{validationErrors.dueDate}</span>
                  </div>
                )}
              </div>

              {/* Conditional Fields based on Response Type */}
              {responseType === 'transaction' ? (
                <div className="col-span-1 md:col-span-2">
                  <label className={styles.label}>Bank Ref (UTR)</label>
                  <input
                    type="text"
                    name="bankRef"
                    value={formData.bankRef}
                    onChange={handleInputChange}
                    className={`${styles.input} font-mono`}
                  />
                </div>
              ) : (
                <>
                  <div className="col-span-1">
                    <label className={styles.label}>
                      Liquidation Seq <span className="text-[#973795]">*</span>
                    </label>
                    <input
                      type="number"
                      name="liquidationSeq"
                      value={formData.liquidationSeq}
                      onChange={handleInputChange}
                      className={styles.input}
                      min="1"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className={styles.label}>
                      Final Liquidation <span className="text-[#973795]">*</span>
                    </label>
                    <select
                      name="finalLiquidation"
                      value={formData.finalLiquidation}
                      onChange={handleInputChange}
                      className={styles.input}
                    >
                      <option value="N">N (No)</option>
                      <option value="Y">Y (Yes)</option>
                    </select>
                  </div>
                </>
              )}

              {/* Comment */}
              <div className="col-span-1 md:col-span-3">
                <label className={styles.label}>
                  Comment (Remark) <span className="text-[#973795]">*</span>
                </label>
                <input
                  type="text"
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Enter comments here..."
                />
              </div>
            </div>
          </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleGenerateXmlWithValidation}
              className={`${styles.primaryBtn} w-full py-3 rounded-lg flex items-center justify-center gap-2 text-sm uppercase tracking-wider`}
            >
              <RefreshCw className="w-4 h-4" />
              Generate XML from Data
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: XML Preview */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col min-h-[600px] h-full sticky top-24">
        <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className={`w-5 h-5 ${styles.iconColor}`} />
            <h2 className="text-lg font-bold text-gray-800">XML Preview</h2>
          </div>
          {generatedXml && (
            <div className="flex items-center gap-2">
              <button onClick={onDownloadXml} className={styles.secondaryBtn}>
                <Download className="w-3 h-3" /> Download
              </button>
              <button onClick={onSaveToStorage} className={`text-xs ${styles.primaryBtn} px-3 py-1.5 rounded-md flex items-center gap-1`}>
                <HardDrive className="w-3 h-3" /> Save to App Storage
              </button>
            </div>
          )}
        </div>
        <div className="flex-1 bg-slate-900 p-0 relative min-h-[500px]">
          <textarea
            readOnly
            value={generatedXml}
            placeholder="// Fill the form on the left and click 'Generate XML' to see the result here..."
            className="w-full h-full p-6 font-mono text-xs text-green-400 bg-transparent resize-none focus:outline-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};

