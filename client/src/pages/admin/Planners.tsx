// pages/admin/Planners.tsx
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search,  
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Phone, 
  Mail, 
  MapPin,  
  Download,
  Loader2,
  Star,
  Clock,
  User,
  Building2,
  AlertCircle,
  ChevronUp
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

interface DocumentCounts {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

interface Planner {
  id: number;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  registrationDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  businessType: string;
  yearsExperience: number;
  rating: number | null;
  totalBookings: number;
  totalPackages: number;
  verificationNotes: string;
  rejectionReason?: string;
  permitNumber?: string;
  profilePicture?: string;
  bio?: string;
  updatedAt: string;
  documentCounts: DocumentCounts;
}

interface StatusCounts {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  under_review: number;
}

interface PermitDocument {
  id: number;
  permitId: number;
  fileUrl: string;
  fileType: string;
  govIdType?: string;
  govIdNumber?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  uploadedAt: string;
  uploadedBy?: { name: string };
  reviewedBy?: { name: string };
  reviewedAt?: string;
  permitApproved?: boolean;
}

// Note: RejectionModal and related props removed since planner status is auto-managed

interface DocumentsModalProps {
  isOpen: boolean;
  planner: Planner | null;
  documents: PermitDocument[];
  onClose: () => void;
  onRefresh: () => void;
  loading: boolean;
}

interface DocumentActionModalProps {
  isOpen: boolean;
  document: PermitDocument | null;
  action: 'approve' | 'reject' | null;
  onClose: () => void;
  onConfirm: (documentId: number, status: string, notes?: string) => void;
  loading: boolean;
}

const DocumentStatusBadge: React.FC<{ status: string; count?: number }> = ({ status, count }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyle(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
      {count !== undefined && count > 0 && <span className="ml-1">({count})</span>}
    </span>
  );
};

const DocumentProgressBar: React.FC<{ counts: DocumentCounts }> = ({ counts }) => {
  if (counts.total === 0) return null;

  const approvedPercentage = (counts.approved / counts.total) * 100;
  const rejectedPercentage = (counts.rejected / counts.total) * 100;
  const pendingPercentage = (counts.pending / counts.total) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>Documents: {counts.approved}/{counts.total} approved</span>
        {counts.rejected > 0 && (
          <span className="text-red-600">{counts.rejected} rejected</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div className="h-full flex">
          {approvedPercentage > 0 && (
            <div 
              className="bg-green-500" 
              style={{ width: `${approvedPercentage}%` }}
            />
          )}
          {rejectedPercentage > 0 && (
            <div 
              className="bg-red-500" 
              style={{ width: `${rejectedPercentage}%` }}
            />
          )}
          {pendingPercentage > 0 && (
            <div 
              className="bg-yellow-500" 
              style={{ width: `${pendingPercentage}%` }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const DocumentActionModal: React.FC<DocumentActionModalProps> = ({ 
  isOpen, 
  document, 
  action, 
  onClose, 
  onConfirm, 
  loading 
}) => {
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (document && action) {
      console.log('DocumentActionModal submit:', { documentId: document.id, action, document }); // Debug log
      // Convert action to proper status value
      const status = action === 'approve' ? 'approved' : 'rejected';
      onConfirm(document.id, status, notes.trim() || undefined);
    }
  };

  if (!isOpen || !document || !action) return null;

  const isApprove = action === 'approve';

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-30 flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-gray-300 rounded-lg shadow-xl max-w-md w-full">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex items-center mb-4">
              {isApprove ? (
                <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500 mr-3" />
              )}
              <h3 className="text-lg font-semibold text-gray-900">
                {isApprove ? 'Approve' : 'Reject'} Document
              </h3>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">Document Details:</p>
              <p className="text-sm text-gray-600">Type: {document.fileType?.toUpperCase()}</p>
              {document.govIdType && (
                <p className="text-sm text-gray-600">
                  {document.govIdType}: {document.govIdNumber}
                </p>
              )}
              <p className="text-sm text-gray-600">
                Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
              </p>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                {isApprove ? 'Approval Notes (Optional)' : 'Rejection Reason'}
              </label>
              <textarea
                id="notes"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                placeholder={isApprove ? 
                  "Add any approval notes..." : 
                  "Please provide a reason for rejection..."
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white disabled:opacity-50 ${
                isApprove 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isApprove ? 'Approve' : 'Reject'} Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Note: RejectionModal component removed - no longer needed since planner status is auto-managed

const DocumentsModal: React.FC<DocumentsModalProps> = ({ 
  isOpen, 
  planner, 
  documents, 
  onClose, 
  onRefresh,
  loading 
}) => {
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    document: PermitDocument | null;
    action: 'approve' | 'reject' | null;
  }>({
    isOpen: false,
    document: null,
    action: null
  });
  const [actionLoading, setActionLoading] = useState<{[key: number]: boolean}>({});
  const [bulkLoading, setBulkLoading] = useState(false);
  const [expandedDocs, setExpandedDocs] = useState<Set<number>>(new Set());

  const API_BASE = 'http://localhost:5000/api/admin/planners';

  const toggleDocumentView = (documentId: number) => {
    setExpandedDocs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(documentId)) {
        newSet.delete(documentId);
      } else {
        newSet.add(documentId);
      }
      return newSet;
    });
  };

  const renderFilePreview = (doc: PermitDocument) => {
    const isImage = doc.fileType?.toLowerCase().includes('image') || 
                   doc.fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    const isPdf = doc.fileType?.toLowerCase().includes('pdf') || 
                 doc.fileUrl?.endsWith('.pdf');

    if (isImage) {
      return (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <img 
            src={doc.fileUrl} 
            alt="Document preview"
            className="max-w-full max-h-96 object-contain mx-auto rounded border"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'block';
            }}
          />
          <div style={{ display: 'none' }} className="text-center text-gray-500 py-8">
            <FileText className="w-12 h-12 mx-auto mb-2" />
            <p>Preview not available</p>
            <a 
              href={doc.fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-pink-600 hover:text-pink-700 underline"
            >
              Open in new tab
            </a>
          </div>
        </div>
      );
    } else if (isPdf) {
      return (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <iframe
            src={doc.fileUrl}
            className="w-full h-96 border rounded"
            title="PDF Preview"
          />
          <div className="mt-2 text-center">
            <a 
              href={doc.fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-pink-600 hover:text-pink-700 underline text-sm"
            >
              Open PDF in new tab
            </a>
          </div>
        </div>
      );
    } else {
      return (
        <div className="mt-3 p-6 bg-gray-50 rounded-lg text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 mb-2">File preview not available</p>
          <p className="text-sm text-gray-500 mb-3">File type: {doc.fileType}</p>
          <a 
            href={doc.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Download File
          </a>
        </div>
      );
    }
  };

  const handleDocumentAction = async (documentId: number, status: string, notes?: string) => {
    try {
      setActionLoading(prev => ({ ...prev, [documentId]: true }));
      
      console.log('Making API request:', { documentId, status, notes }); // Debug log
      
      const url = `${API_BASE}/documents/${documentId}/status`;
      console.log('Full API URL:', url); // Debug log
      
      const response = await fetch(url, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });

      console.log('API Response status:', response.status); // Debug log

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response data:', data); // Debug log
      
      if (data.success) {
        setActionModal({ isOpen: false, document: null, action: null });
        onRefresh(); // Refresh documents and planner data
      } else {
        throw new Error(data.message || 'Failed to update document status');
      }
    } catch (err) {
      console.error('Error updating document:', err);
      alert('Failed to update document. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [documentId]: false }));
    }
  };

  const handleBulkAction = async (action: 'approve_all' | 'reject_all') => {
    if (!planner) return;
    
    try {
      setBulkLoading(true);
      
      const response = await fetch(`${API_BASE}/${planner.id}/documents/bulk`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action,
          notes: action === 'approve_all' ? 'Bulk approved by admin' : 'Bulk rejected by admin'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        onRefresh();
      } else {
        throw new Error(data.message || 'Failed to bulk update documents');
      }
    } catch (err) {
      console.error('Error bulk updating documents:', err);
      alert('Failed to bulk update documents. Please try again.');
    } finally {
      setBulkLoading(false);
    }
  };

  if (!isOpen || !planner) return null;

  const pendingDocs = documents.filter(doc => doc.status === 'pending');
  const canBulkApprove = pendingDocs.length > 0;

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-30 flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-gray-300 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Documents for {planner.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {planner.businessName} • {documents.length} document(s)
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* {canBulkApprove && (
              <>
                <button
                  onClick={() => handleBulkAction('approve_all')}
                  disabled={bulkLoading}
                  className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {bulkLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve All
                </button>
                <button
                  onClick={() => handleBulkAction('reject_all')}
                  disabled={bulkLoading}
                  className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                >
                  {bulkLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject All
                </button>
              </>
            )} */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-pink-600 animate-spin" />
              <span className="ml-2 text-gray-600">Loading documents...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No documents found</h4>
              <p className="text-gray-600">This planner hasn't uploaded any documents yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-gray-600" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h5 className="font-medium text-gray-900">
                              {doc.govIdType || 'Document'}
                            </h5>
                            <DocumentStatusBadge status={doc.status} />
                            <span className="text-xs text-gray-500 uppercase font-medium">
                              {doc.fileType}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            {doc.govIdNumber && (
                              <div>
                                <span className="font-medium">ID Number:</span> {doc.govIdNumber}
                              </div>
                            )}
                            <div>
                              <span className="font-medium">Uploaded:</span> {new Date(doc.uploadedAt).toLocaleDateString()}
                            </div>
                            {doc.uploadedBy && (
                              <div>
                                <span className="font-medium">By:</span> {doc.uploadedBy.name}
                              </div>
                            )}
                            {doc.reviewedBy && (
                              <div>
                                <span className="font-medium">Reviewed by:</span> {doc.reviewedBy.name}
                              </div>
                            )}
                          </div>

                          {doc.notes && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                              <span className="font-medium">Notes:</span> {doc.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => toggleDocumentView(doc.id)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          {expandedDocs.has(doc.id) ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-1" />
                              Hide
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </>
                          )}
                        </button>

                        {doc.status === 'pending' && (
                          <>
                            <button
                              onClick={() => setActionModal({
                                isOpen: true,
                                document: doc,
                                action: 'reject'
                              })}
                              disabled={actionLoading[doc.id]}
                              className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                            >
                              {actionLoading[doc.id] ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4 mr-1" />
                              )}
                              Reject
                            </button>
                            <button
                              onClick={() => setActionModal({
                                isOpen: true,
                                document: doc,
                                action: 'approve'
                              })}
                              disabled={actionLoading[doc.id]}
                              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                            >
                              {actionLoading[doc.id] ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-1" />
                              )}
                              Approve
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Collapsible File Preview */}
                    {expandedDocs.has(doc.id) && renderFilePreview(doc)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DocumentActionModal
        isOpen={actionModal.isOpen}
        document={actionModal.document}
        action={actionModal.action}
        onClose={() => setActionModal({ isOpen: false, document: null, action: null })}
        onConfirm={handleDocumentAction}
        loading={actionModal.document ? actionLoading[actionModal.document.id] || false : false}
      />
    </div>
  );
};

const AdminPlanners = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'under_review' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [planners, setPlanners] = useState<Planner[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    under_review: 0
  });
 
  // Note: Rejection modal removed - planner status is auto-managed via document approvals
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentsModal, setDocumentsModal] = useState<{isOpen: boolean; planner: Planner | null}>({
    isOpen: false,
    planner: null
  });
  const [documents, setDocuments] = useState<PermitDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  const API_BASE = 'http://localhost:5000/api/admin/planners';

  // Fetch planner documents
  const fetchPlannerDocuments = async (plannerId: number) => {
    try {
      setDocumentsLoading(true);
      const response = await fetch(`${API_BASE}/${plannerId}/documents`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setDocuments(data.documents || []);
      } else {
        throw new Error(data.message || 'Failed to fetch documents');
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  // Handle view documents
  const handleViewDocuments = async (planner: Planner) => {
    setDocumentsModal({ isOpen: true, planner });
    await fetchPlannerDocuments(planner.id);
  };

  // Refresh planner data and documents
  const refreshPlannerData = async () => {
    await fetchPlanners();
    await fetchStatusCounts();
    if (documentsModal.planner) {
      await fetchPlannerDocuments(documentsModal.planner.id);
    }
  };

  // Fetch planners based on active tab and search
  const fetchPlanners = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `${API_BASE}`;
      const params = new URLSearchParams();
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (activeTab !== 'all') {
        params.append('status', activeTab);
      }
      
      if (params.toString()) {
        url += `/search?${params.toString()}`;
      }

      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setPlanners(data.planners || []);
      } else {
        throw new Error(data.message || 'Failed to fetch planners');
      }
    } catch (err) {
      console.error('Error fetching planners:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch planners');
    } finally {
      setLoading(false);
    }
  };

  // Fetch status counts
  const fetchStatusCounts = async () => {
    try {
      const response = await fetch(`${API_BASE}/counts`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setStatusCounts(data.counts);
      }
    } catch (err) {
      console.error('Error fetching status counts:', err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchPlanners();
    fetchStatusCounts();
  }, [activeTab, searchQuery]);

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        fetchPlanners();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && planners.length === 0) {
    return (
      <DashboardLayout 
        title="Planner Management"
        subtitle="Manage wedding planner registrations and permits"
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-pink-600 animate-spin" />
          <span className="ml-2 text-gray-600">Loading planners...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Planner Management"
      subtitle="Manage wedding planner registrations and permits"
    >
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => { setError(null); fetchPlanners(); }}
              className="ml-auto text-red-600 hover:text-red-800 text-sm underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation with Counts */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="border-b border-gray-200 flex-1">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'pending', label: 'Pending Applications', count: statusCounts.pending, icon: Clock },
                { key: 'approved', label: 'Approved Planners', count: statusCounts.approved, icon: CheckCircle },
                { key: 'rejected', label: 'Rejected Applications', count: statusCounts.rejected, icon: XCircle },
                { key: 'under_review', label: 'Under Review', count: statusCounts.under_review, icon: AlertTriangle },
                { key: 'all', label: 'All Planners', count: statusCounts.total, icon: Users }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search planners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
              />
              {loading && searchQuery && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
              )}
            </div>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Planners List */}
      <div className="space-y-6">
        {planners.map((planner) => (
          <div key={planner.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {planner.profilePicture ? (
                      <img 
                        src={planner.profilePicture} 
                        alt={planner.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{planner.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                      <Building2 className="w-4 h-4" />
                      <span>{planner.businessName}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Registered: {formatDate(planner.registrationDate)}
                      {planner.permitNumber && ` • Permit: ${planner.permitNumber}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(planner.status)}`}>
                    {planner.status.charAt(0).toUpperCase() + planner.status.slice(1).replace('_', ' ')}
                  </span>
                  {planner.rating && (
                    <div className="text-right">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        {planner.rating}
                      </div>
                      <div className="text-xs text-gray-500">{planner.totalBookings} bookings</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Progress */}
              {planner.documentCounts.total > 0 && (
                <div className="mb-4">
                  <DocumentProgressBar counts={planner.documentCounts} />
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{planner.email}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{planner.phone}</span>
                  </div>
                  
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-3 text-gray-400 mt-0.5" />
                    <span>{planner.address}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-gray-600">Experience:</span>
                    <span className="ml-2 text-gray-900">{planner.yearsExperience} years</span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <div>
                      <span className="text-gray-600">Packages:</span>
                      <span className="ml-2 font-medium text-gray-900">{planner.totalPackages}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Bookings:</span>
                      <span className="ml-2 font-medium text-gray-900">{planner.totalBookings}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  {/* Document Status */}
                  {planner.documentCounts.total > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Document Status</h4>
                      <div className="flex flex-wrap gap-2">
                        {planner.documentCounts.approved > 0 && (
                          <DocumentStatusBadge status="approved" count={planner.documentCounts.approved} />
                        )}
                        {planner.documentCounts.pending > 0 && (
                          <DocumentStatusBadge status="pending" count={planner.documentCounts.pending} />
                        )}
                        {planner.documentCounts.rejected > 0 && (
                          <DocumentStatusBadge status="rejected" count={planner.documentCounts.rejected} />
                        )}
                      </div>
                    </div>
                  )}
                  
                  {planner.verificationNotes && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Notes: </span>
                        {planner.verificationNotes}
                      </p>
                    </div>
                  )}
                  
                  {planner.rejectionReason && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-800">
                        <span className="font-medium">Rejection Reason: </span>
                        {planner.rejectionReason}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    Last updated: {formatDate(planner.updatedAt)}
                  </div>
                </div>
              </div>

              {/* Action Buttons - Simplified since planner status is auto-managed */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <button 
                    onClick={() => handleViewDocuments(planner)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Documents ({planner.documentCounts.total})
                  </button>
                </div>
                
                <div className="flex space-x-2">
                  {/* Status info - no manual actions needed since auto-managed */}
                  <div className="text-sm text-gray-600">
                    Status managed automatically via document review
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && planners.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No planners found</h3>
          <p className="text-gray-600">
            {searchQuery 
              ? 'Try adjusting your search criteria.' 
              : `No ${activeTab === 'all' ? '' : activeTab + ' '}planners found.`}
          </p>
        </div>
      )}

      {/* Documents Modal */}
      <DocumentsModal
        isOpen={documentsModal.isOpen}
        planner={documentsModal.planner}
        documents={documents}
        onClose={() => setDocumentsModal({ isOpen: false, planner: null })}
        onRefresh={refreshPlannerData}
        loading={documentsLoading}
      />

      {/* Note: RejectionModal removed - planner status is auto-managed via document approvals */}
    </DashboardLayout>
  );
};

export default AdminPlanners;