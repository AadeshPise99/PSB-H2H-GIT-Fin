import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, FileCode, Network, Server, Search } from 'lucide-react';
import { CronResult, Screen, ResponseFormData, StoredFile, ResponseType, Invoice } from './types';
import { styles } from './styles';

// Import extracted components
import { NavButton } from './components/NavButton';
import { InboundCron } from './components/InboundCron';
import { FetchInvoices } from './components/FetchInvoices';
import { CreateResponse } from './components/CreateResponse';
import { FTPClient } from './components/FTPClient';
import { OutboundCron } from './components/OutboundCron';

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>('cron1');
  const [isSimulationMode, setIsSimulationMode] = useState(false); // Default to Real Mode (via Backend Proxy)
  
  // State for Screen 1
  const [cron1Loading, setCron1Loading] = useState(false);
  const [cron1Result, setCron1Result] = useState<CronResult | null>(null);

  // State for Screen 2 (Fetch Invoices)
  const [psbIdentifier, setPsbIdentifier] = useState('');
  const [invoiceLimit, setInvoiceLimit] = useState(5);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesError, setInvoicesError] = useState<string | null>(null);

  // Max finance request amount (passed from Fetch Invoices when selecting an invoice)
  const [maxFinanceAmount, setMaxFinanceAmount] = useState<string | null>(null);

  // State for Screen 3 (Form & XML)
  const getLocalISOString = () => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  const [responseType, setResponseType] = useState<ResponseType>('transaction');
  const [formData, setFormData] = useState<ResponseFormData>({
    headerDatetime: getLocalISOString(),
    action: 'fund',
    actionDate: new Date().toISOString().split('T')[0],
    amount: '', // Leave empty - user must enter
    comment: 'Transaction declined Successfully',
    id: `frq#PSB${Math.floor(Math.random() * 100000000)}`,
    dueDate: '', // Leave empty - user must select a future date
    bankRef: `BARBH${new Date().getFullYear()}000${Math.floor(Math.random() * 9999)}`,
    // Repayment fields
    liquidationSeq: '1',
    finalLiquidation: 'N',
    // Exposure Update fields
    bankCustomerCode: '',
    relatedCustomerCode: '',
    actionCode: 'U',
    exposureLimit: '',
    exposureUtilized: '',
    exposureRemaining: '',
    actionTimestamp: getLocalISOString(),
    expiryDate: '',
  });
  const [generatedXml, setGeneratedXml] = useState<string>('');

  // Batch ID State for fetching FRQ
  const [batchId, setBatchId] = useState<string>('');
  const [fetchingFrq, setFetchingFrq] = useState<boolean>(false);
  const [frqOptions, setFrqOptions] = useState<string[]>([]);

  // CP Identifier State for fetching CP Data (Exposure Update)
  const [cpIdentifier, setCpIdentifier] = useState<string>('');
  const [fetchingCp, setFetchingCp] = useState<boolean>(false);

  // APP STORAGE (Local Site)
  const [localFiles, setLocalFiles] = useState<StoredFile[]>(() => {
      const saved = localStorage.getItem('localFiles');
      return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
      localStorage.setItem('localFiles', JSON.stringify(localFiles));
  }, [localFiles]);

  // Fetch FTP config from backend on mount
  useEffect(() => {
    const fetchFtpConfig = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/v2/bob/sftp/config');
        if (response.ok) {
          const config = await response.json();
          setFtpConfig(config);
        }
      } catch (error) {
        console.error('Failed to fetch FTP config:', error);
      }
    };
    fetchFtpConfig();
  }, []);

  // FTP STATE
  // FTP config fetched from backend (no credentials stored in frontend)
  const [ftpConfig, setFtpConfig] = useState<{protocol: string; host: string; user: string; port: string}>({
    protocol: 'SFTP',
    host: '',
    user: '',
    port: ''
  });
  const [ftpConnected, setFtpConnected] = useState(false);
  const [ftpLoading, setFtpLoading] = useState(false);
  const [ftpLogs, setFtpLogs] = useState<string[]>([]);
  const [ftpLogsExpanded, setFtpLogsExpanded] = useState(false);
  const [currentRemotePath, setCurrentRemotePath] = useState('/bob/transaction/response');
  const [remoteFiles, setRemoteFiles] = useState<StoredFile[]>([]); 
  const [selectedLocalFile, setSelectedLocalFile] = useState<string | null>(null);

  // State for Screen 4
  const [cron2Loading, setCron2Loading] = useState(false);
  const [cron2Result, setCron2Result] = useState<CronResult | null>(null);
  const [selectedCron2, setSelectedCron2] = useState<'status-repayment' | 'h2h-limit'>('status-repayment');

  // Styles imported from ./styles

  const addFtpLog = (msg: string, isError = false) => {
    setFtpLogs(prev => [...prev, `${isError ? 'Error: ' : 'Status: '}${msg}`]);
  };

  const runCron = async (
    setLoading: (l: boolean) => void, 
    setResult: (r: CronResult) => void, 
    message: string,
    config?: { url: string; method: string; headers: Record<string, string>; body?: string }
  ) => {
    setLoading(true);
    setResult({ status: 0, statusText: '', time: 0, response: '', timestamp: '' }); 
    
    const startTime = performance.now();

    // SIMULATION MODE
    if (isSimulationMode) {
        setTimeout(() => {
            const endTime = performance.now();
            setResult({
                status: 200,
                statusText: 'OK (Simulated)',
                time: Math.round(endTime - startTime),
                timestamp: new Date().toLocaleTimeString(),
                response: JSON.stringify({ 
                    status: "success", 
                    mode: "SIMULATION",
                    message: message, 
                    transaction_id: `TXN_${Math.floor(Math.random() * 100000)}`,
                    timestamp: new Date().toISOString() 
                }, null, 2)
            });
            setLoading(false);
        }, 1500);
        return;
    }

    // REAL MODE
    if (config) {
        try {
            const res = await fetch(config.url, {
                method: config.method,
                headers: config.headers,
                body: config.body,
                mode: 'cors', 
            });

            const text = await res.text();
            const endTime = performance.now();
            
            let formattedResponse = text;
            try {
                formattedResponse = JSON.stringify(JSON.parse(text), null, 2);
            } catch (e) { /* keep as text */ }

            setResult({
                status: res.status,
                statusText: res.statusText || (res.ok ? 'OK' : 'Error'),
                time: Math.round(endTime - startTime),
                timestamp: new Date().toLocaleTimeString(),
                response: formattedResponse || "(Empty Response Body)"
            });

        } catch (error: any) {
             const endTime = performance.now();
             setResult({
                status: 0,
                statusText: 'Network Failure',
                time: Math.round(endTime - startTime),
                timestamp: new Date().toLocaleTimeString(),
                response: `Error: ${error.message}\n\nHint: Ensure backend is running on port 5000.`
            });
        }
    }
    setLoading(false);
  };

  // Fetch Invoices from MongoDB
  const fetchInvoices = async () => {
    if (!psbIdentifier.trim()) {
      setInvoicesError('Please enter a PSB Channel Partner Identifier');
      return;
    }

    setInvoicesLoading(true);
    setInvoicesError(null);
    setInvoices([]);

    try {
      const response = await fetch('http://localhost:5000/api/v2/bob/invoices/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ psbIdentifier: psbIdentifier.trim(), limit: invoiceLimit })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Request failed (${response.status})`);
      }

      const data = await response.json();
      setInvoices(data.invoices || []);

      if (data.invoices?.length === 0) {
        setInvoicesError('No invoices found for this identifier');
      }
    } catch (error: any) {
      setInvoicesError(error.message || 'Failed to fetch invoices');
    } finally {
      setInvoicesLoading(false);
    }
  };

  // Navigate to Create Response with FRQ ID pre-filled
  const selectInvoice = (frqId: string, financeRequestAmount: string) => {
    if (frqId && frqId !== 'N/A') {
      setFormData(prev => ({ ...prev, id: frqId }));
      setMaxFinanceAmount(financeRequestAmount || null);
      setActiveScreen('xml-gen');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const deleteLocalFile = (id: string) => {
    setLocalFiles(prev => prev.filter(f => f.id !== id));
    if (selectedLocalFile === id) setSelectedLocalFile(null);
  };

  // Fetch FRQ from MySQL by Batch ID
  const fetchFrqByBatchId = async () => {
    if (!batchId.trim()) {
      alert('Please enter a Batch ID');
      return;
    }

    setFetchingFrq(true);
    setFrqOptions([]);

    try {
      const response = await fetch('http://localhost:5000/api/v2/bob/fetch-frq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId: batchId.trim() })
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setFrqOptions(data.frqIds);
        // Auto-set the first FRQ ID
        if (data.primaryFrq) {
          setFormData(prev => ({ ...prev, id: data.primaryFrq }));
        }
      } else {
        alert(data.message || 'Failed to fetch FRQ');
      }
    } catch (error: any) {
      alert(`Error fetching FRQ: ${error.message}`);
    } finally {
      setFetchingFrq(false);
    }
  };

  // Fetch CP Data from MongoDB by CP Identifier (for Exposure Update)
  const fetchCpData = async () => {
    if (!cpIdentifier.trim()) {
      alert('Please enter a CP Identifier');
      return;
    }

    setFetchingCp(true);

    try {
      const response = await fetch('http://localhost:5000/api/v2/bob/cp/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpIdentifier: cpIdentifier.trim() })
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend server not responding properly. Please restart the backend with: npm run dev');
      }

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // Auto-fill bankCustomerCode and relatedCustomerCode
        setFormData(prev => ({
          ...prev,
          bankCustomerCode: data.data.tmchannelpartnerid || '',
          relatedCustomerCode: data.data.tmprogramid || ''
        }));
        alert('CP data fetched successfully!');
      } else {
        alert(data.message || 'Failed to fetch CP data');
      }
    } catch (error: any) {
      alert(`Error fetching CP data: ${error.message}`);
    } finally {
      setFetchingCp(false);
    }
  };

  const handleGenerateXml = () => {
    const formatDate = (dateStr: string) => dateStr ? dateStr.replace(/-/g, '') : '';
    const formatHeaderDateTime = (dtStr: string) => dtStr ? dtStr.replace(/[-:]/g, '') + '00' : '';
    // Format for exposure: dd.MM.yyyy HHmmss
    const formatExposureTimestamp = (dtStr: string) => {
      if (!dtStr) return '';
      const date = new Date(dtStr);
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      const hh = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      const ss = String(date.getSeconds()).padStart(2, '0');
      return `${dd}.${mm}.${yyyy} ${hh}${min}${ss}`;
    };
    // Format for expiry date: dd.MM.yyyy
    const formatExpiryDate = (dateStr: string) => {
      if (!dateStr) return '';
      const [yyyy, mm, dd] = dateStr.split('-');
      return `${dd}.${mm}.${yyyy}`;
    };

    let xml: string;

    if (responseType === 'repayment') {
      // Repayment Response XML
      xml = `<?xml version="1.0" encoding="UTF-8"?><request>
     <header>
          <source>BOB</source>
          <datetime>${formatHeaderDateTime(formData.headerDatetime)}</datetime>
          <description>FR update message to PSB</description>
     </header>
     <fundingresponses>
          <fundingresponse action="liquidate" action_date="${formatDate(formData.actionDate)}" amount="${formData.amount}" comment="${formData.comment}" liquidation_seq="${formData.liquidationSeq}" currency="INR" final_liquidation="${formData.finalLiquidation}" id="${formData.id}" due_date="${formatDate(formData.dueDate)}"/>
     </fundingresponses>
</request>`;
    } else if (responseType === 'exposure') {
      // Exposure Update XML
      xml = `<?xml version="1.0" encoding="UTF-8"?><request>
     <header>
          <source>BoB</source>
          <datetime>${formatHeaderDateTime(formData.headerDatetime)}</datetime>
          <description>Limits Update</description>
     </header>
     <exposureupdates>
          <exposureupdate bank_customer_code="${formData.bankCustomerCode}" related_customer_code="${formData.relatedCustomerCode}" action_code="${formData.actionCode}" exposure_limit="${formData.exposureLimit}" exposure_utilized="${formData.exposureUtilized}" exposure_remaining="${formData.exposureRemaining}" action_timestamp="${formatExposureTimestamp(formData.actionTimestamp)}" expiry_date="${formatExpiryDate(formData.expiryDate)}"/>
     </exposureupdates>
</request>`;
    } else {
      // Transaction Response XML
      xml = `<?xml version="1.0" encoding="UTF-8"?><request>
     <header>
          <source>BoB</source>
          <datetime>${formatHeaderDateTime(formData.headerDatetime)}</datetime>
          <description>FR update message to sp</description>
     </header>
     <fundingresponses>
          <fundingresponse action="${formData.action}" action_date="${formatDate(formData.actionDate)}" amount="${formData.amount}" comment="${formData.comment}" currency="INR" id="${formData.id}" due_date="${formatDate(formData.dueDate)}" bank_ref="${formData.bankRef}"/>
     </fundingresponses>
</request>`;
    }

    setGeneratedXml(xml);
  };

  const downloadXml = () => {
    if (!generatedXml) return;
    const blob = new Blob([generatedXml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Response_${formData.id}_${Date.now()}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveToLocalStorage = () => {
    if (!generatedXml) return;
    const filename = `Response_${formData.id}.xml`;
    const newFile: StoredFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: filename,
      content: generatedXml,
      size: `${(new Blob([generatedXml]).size).toString()} B`,
      date: new Date().toLocaleTimeString(),
      type: 'file'
    };
    setLocalFiles(prev => [...prev, newFile]);
    alert(`File ${filename} saved to App Storage. Go to FTP Step to upload.`);
  };

  const [refreshingRemote, setRefreshingRemote] = useState(false);

  const connectFtp = async () => {
    setFtpLoading(true);
    addFtpLog(`Connecting to ${ftpConfig.host}...`);

    if (isSimulationMode) {
        setTimeout(() => {
             addFtpLog(`Connected to ${ftpConfig.host} (Simulated)`);
             addFtpLog(`Logged in as ${ftpConfig.user}`);
             setRemoteFiles([
                { id: 'f1', name: '..', type: 'folder', date: '', size: '', content: '' },
                { id: 'f2', name: 'limits', type: 'folder', date: '2024-03-20', size: '', content: '' },
                { id: 'f3', name: 'request', type: 'folder', date: '2024-03-20', size: '', content: '' }
             ]);
             setFtpConnected(true);
             setFtpLoading(false);
        }, 1500);
        return;
    }

    try {
        // Credentials are handled server-side, only send the path
        const response = await fetch('http://localhost:5000/api/v2/bob/sftp/list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: currentRemotePath
            })
        });

        if (!response.ok) throw new Error(`Connection refused (${response.status})`);
        const data = await response.json();

        addFtpLog(`Connected to ${ftpConfig.host}`);
        addFtpLog(`Logged in`);

        if (data.files && Array.isArray(data.files)) {
            setRemoteFiles(data.files);
        } else {
             // Fallback if data structure is different
             setRemoteFiles([]);
        }
        setFtpConnected(true);
    } catch (error: any) {
        addFtpLog(`${error.message}`, true);
        addFtpLog(`Hint: Enable 'Simulation Mode' if running locally.`, true);
        setFtpConnected(false);
    } finally {
        setFtpLoading(false);
    }
  };

  // Refresh remote file list
  const refreshRemoteFiles = async () => {
    if (!ftpConnected) return;

    setRefreshingRemote(true);
    addFtpLog(`Refreshing file list...`);

    if (isSimulationMode) {
        setTimeout(() => {
             addFtpLog(`File list refreshed (Simulated)`);
             setRefreshingRemote(false);
        }, 500);
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/v2/bob/sftp/list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                host: ftpConfig.host,
                port: ftpConfig.port,
                username: ftpConfig.user,
                password: ftpConfig.password,
                path: currentRemotePath
            })
        });

        if (!response.ok) throw new Error(`Refresh failed (${response.status})`);
        const data = await response.json();

        if (data.files && Array.isArray(data.files)) {
            setRemoteFiles(data.files);
        }
        addFtpLog(`File list refreshed`);
    } catch (error: any) {
        addFtpLog(`Refresh failed - ${error.message}`, true);
    } finally {
        setRefreshingRemote(false);
    }
  };

  const uploadFile = async () => {
    if (!selectedLocalFile || !ftpConnected) return;
    const fileToUpload = localFiles.find(f => f.id === selectedLocalFile);
    if (!fileToUpload) return;

    addFtpLog(`Uploading ${fileToUpload.name}...`);
    
    if (isSimulationMode) {
        setTimeout(() => {
            const remoteCopy = { ...fileToUpload, id: `remote_${Math.random()}` };
            setRemoteFiles(prev => [...prev, remoteCopy]);
            addFtpLog(`Transfer successful (Simulated).`);
        }, 1000);
        return;
    }

    try {
        // Credentials are handled server-side, only send path, filename, and content
        await fetch('http://localhost:5000/api/v2/bob/sftp/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: currentRemotePath,
                filename: fileToUpload.name,
                content: fileToUpload.content
            })
        });

        const remoteCopy = { ...fileToUpload, id: `remote_${Math.random()}` };
        setRemoteFiles(prev => [...prev, remoteCopy]);
        addFtpLog(`Transfer successful.`);
    } catch (error: any) {
        addFtpLog(`Upload failed - ${error.message}`, true);
    }
  };

  // Navigation handler
  const handleNavigate = (screen: Screen) => setActiveScreen(screen);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">

      {/* Header with Sim Mode Toggle */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full px-6 lg:px-8 flex flex-col md:flex-row justify-between md:items-center">
            <div className="flex-1 flex justify-between overflow-x-auto">
                <NavButton screen="cron1" label="Step 1: Inbound Cron" icon={ArrowRightLeft} activeScreen={activeScreen} onNavigate={handleNavigate} />
                <NavButton screen="invoices" label="Step 2: Fetch Invoices" icon={Search} activeScreen={activeScreen} onNavigate={handleNavigate} />
                <NavButton screen="xml-gen" label="Step 3: Create Response" icon={FileCode} activeScreen={activeScreen} onNavigate={handleNavigate} />
                <NavButton screen="ftp" label="Step 4: H2H FTP" icon={Network} activeScreen={activeScreen} onNavigate={handleNavigate} />
                <NavButton screen="cron2" label="Step 5: Outbound Cron" icon={Server} activeScreen={activeScreen} onNavigate={handleNavigate} />
            </div>

            <div className="p-4 border-l border-gray-100 flex items-center bg-gray-50 md:bg-transparent">
                <label className="flex items-center cursor-pointer select-none">
                    <div className="mr-3 text-xs font-bold text-gray-500 uppercase flex flex-col items-end">
                        <span>Simulation Mode</span>
                        <span className="text-[9px] font-normal text-gray-400">Bypass Network/CORS</span>
                    </div>
                    <div className="relative">
                        <input
                            type="checkbox"
                            className="sr-only"
                            checked={isSimulationMode}
                            onChange={() => setIsSimulationMode(!isSimulationMode)}
                        />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${isSimulationMode ? 'bg-[#303087]' : 'bg-gray-300'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isSimulationMode ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                </label>
            </div>
        </div>
      </div>

      <main className="flex-1 w-full px-6 lg:px-8 py-6">
        
        {/* SCREEN 1: CRON JOB 1 */}
        {activeScreen === 'cron1' && (
          <InboundCron
            isSimulationMode={isSimulationMode}
            loading={cron1Loading}
            result={cron1Result}
            onExecute={() => runCron(
              setCron1Loading,
              setCron1Result,
              "Initiating Real Transfer",
              {
                url: 'http://localhost:5000/api/v2/bob/transactions/ftp-cron-movement',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              }
            )}
          />
        )}

        {/* SCREEN 2: FETCH INVOICES */}
        {activeScreen === 'invoices' && (
          <FetchInvoices
            isSimulationMode={isSimulationMode}
            psbIdentifier={psbIdentifier}
            setPsbIdentifier={setPsbIdentifier}
            invoiceLimit={invoiceLimit}
            setInvoiceLimit={setInvoiceLimit}
            loading={invoicesLoading}
            invoices={invoices}
            error={invoicesError}
            onFetch={fetchInvoices}
            onSelectInvoice={selectInvoice}
          />
        )}

        {/* SCREEN 3: XML GENERATOR */}
        {activeScreen === 'xml-gen' && (
          <CreateResponse
            responseType={responseType}
            setResponseType={setResponseType}
            formData={formData}
            setFormData={setFormData}
            generatedXml={generatedXml}
            batchId={batchId}
            setBatchId={setBatchId}
            fetchingFrq={fetchingFrq}
            frqOptions={frqOptions}
            maxFinanceAmount={maxFinanceAmount}
            onFetchFrq={fetchFrqByBatchId}
            onGenerateXml={handleGenerateXml}
            onDownloadXml={downloadXml}
            onSaveToStorage={saveToLocalStorage}
            cpIdentifier={cpIdentifier}
            setCpIdentifier={setCpIdentifier}
            fetchingCp={fetchingCp}
            onFetchCp={fetchCpData}
          />
        )}

        {/* SCREEN 4: FTP CLIENT */}
        {activeScreen === 'ftp' && (
          <FTPClient
            isSimulationMode={isSimulationMode}
            ftpConfig={ftpConfig}
            ftpConnected={ftpConnected}
            ftpLoading={ftpLoading}
            ftpLogs={ftpLogs}
            ftpLogsExpanded={ftpLogsExpanded}
            setFtpLogsExpanded={setFtpLogsExpanded}
            currentRemotePath={currentRemotePath}
            setCurrentRemotePath={setCurrentRemotePath}
            localFiles={localFiles}
            remoteFiles={remoteFiles}
            selectedLocalFile={selectedLocalFile}
            setSelectedLocalFile={setSelectedLocalFile}
            refreshingRemote={refreshingRemote}
            onConnect={connectFtp}
            onUpload={uploadFile}
            onRefreshRemote={refreshRemoteFiles}
            onDeleteLocalFile={deleteLocalFile}
          />
        )}

        {/* SCREEN 5: CRON JOB 2 */}
        {activeScreen === 'cron2' && (
          <OutboundCron
            isSimulationMode={isSimulationMode}
            loading={cron2Loading}
            result={cron2Result}
            selectedCron={selectedCron2}
            setSelectedCron={setSelectedCron2}
            onExecute={() => runCron(
              setCron2Loading,
              setCron2Result,
              selectedCron2 === 'status-repayment' ? "Initiating Status Repayment Callback" : "Initiating H2H Limit Callback",
              {
                url: selectedCron2 === 'status-repayment'
                  ? 'http://localhost:5000/api/v2/bob/transactions/status-repayment-callback'
                  : 'http://localhost:5000/api/v2/bob/cron/h2h-limit-callback',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              }
            )}
          />
        )}

      </main>
    </div>
  );
};

export default App;
