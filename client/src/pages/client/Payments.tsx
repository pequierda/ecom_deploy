// pages/client/Payments.tsx - Updated with real data and PDF invoice export
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Download, Eye, Plus, Calendar, CheckCircle, Clock, AlertCircle, FileText, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import DashboardLayout from '../../components/DashboardLayout';
import { useClientPayments, useInvoiceData, type InvoiceData } from '../../hooks/usePayments';
import { useAuthStore } from '../../stores/authStore';

const ClientPayments = () => {
  const [activeTab, setActiveTab] = useState('transactions');
  const [exportingInvoice, setExportingInvoice] = useState<number | null>(null);
  
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { payments, invoices, summary, loading, error, refetch } = useClientPayments();
  const { generateInvoice } = useInvoiceData();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'partial':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'partial':
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewDetails = (bookingId: number) => {
    navigate(`/client/service/${bookingId}`);
  };

  const handleExportInvoice = async (bookingId: number) => {
    setExportingInvoice(bookingId);
    try {
      const invoiceData = await generateInvoice(bookingId);
      
      // Generate and download the PDF invoice
      generateInvoicePdf(invoiceData);
      
    } catch (error) {
      console.error('Error exporting invoice:', error);
      alert('Failed to export invoice. Please try again.');
    } finally {
      setExportingInvoice(null);
    }
  };

  const generateInvoicePdf = (invoiceData: InvoiceData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPosition = 30;

  // Colors
  const primaryColor = [236, 72, 153]; // Pink-500
  const textColor = [55, 65, 81]; // Gray-700
  const lightGray = [156, 163, 175]; // Gray-400

  // Header
  doc.setFontSize(24);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', margin, yPosition);
  
  doc.setFontSize(12);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('Wedding Planning Services', margin, yPosition + 10);

  // Company info (right aligned) - Fixed alignment
  const companyX = pageWidth - margin;
  doc.setFont('helvetica', 'bold');
  
  // Calculate text width for right alignment
  const businessNameWidth = doc.getTextWidth(invoiceData.business_name);
  doc.text(invoiceData.business_name, companyX - businessNameWidth, yPosition);
  
  doc.setFont('helvetica', 'normal');
  const plannerNameText = `${invoiceData.planner_first_name} ${invoiceData.planner_last_name}`;
  const plannerNameWidth = doc.getTextWidth(plannerNameText);
  doc.text(plannerNameText, companyX - plannerNameWidth, yPosition + 8);
  
  const emailWidth = doc.getTextWidth(invoiceData.business_email);
  doc.text(invoiceData.business_email, companyX - emailWidth, yPosition + 16);
  
  const phoneWidth = doc.getTextWidth(invoiceData.business_phone);
  doc.text(invoiceData.business_phone, companyX - phoneWidth, yPosition + 24);
  
  if (invoiceData.business_address) {
    const addressWidth = doc.getTextWidth(invoiceData.business_address);
    doc.text(invoiceData.business_address, companyX - addressWidth, yPosition + 32);
  }

  yPosition += 50;

  // Invoice details box
  doc.setFillColor(249, 250, 251); // Gray-50
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 25, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice #: ${invoiceData.invoice_number}`, margin + 5, yPosition + 8);
  doc.text(`Invoice Date: ${formatDate(invoiceData.invoice_date)}`, margin + 5, yPosition + 16);
  
  // Status badge
  const statusX = pageWidth - margin - 40;
  doc.setFillColor(220, 252, 231); // Green-100
  doc.setDrawColor(34, 197, 94); // Green-500
  doc.roundedRect(statusX, yPosition + 5, 35, 10, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(22, 101, 52); // Green-800
  
  // Center text in status badge
  const statusText = invoiceData.status.toUpperCase();
  const statusWidth = doc.getTextWidth(statusText);
  doc.text(statusText, statusX + (35 - statusWidth) / 2, yPosition + 11);
  
  yPosition += 35;

  // Billing information
  doc.setFontSize(12);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', margin, yPosition);
  doc.text('Wedding Details:', pageWidth - margin - 60, yPosition);
  
  doc.setFont('helvetica', 'normal');
  yPosition += 8;
  doc.text(`${invoiceData.client_first_name} ${invoiceData.client_last_name}`, margin, yPosition);
  doc.text(`Date: ${formatDate(invoiceData.wedding_date)}`, pageWidth - margin - 60, yPosition);
  
  yPosition += 6;
  doc.text(invoiceData.client_email, margin, yPosition);
  doc.text(`Time: ${invoiceData.wedding_time}`, pageWidth - margin - 60, yPosition);
  
  yPosition += 6;
  doc.text(invoiceData.client_phone, margin, yPosition);
  
  // Handle venue text wrapping
  const venueText = `Venue: ${invoiceData.wedding_location}`;
  const venueLines = doc.splitTextToSize(venueText, 60);
  doc.text(venueLines, pageWidth - margin - 60, yPosition);

  yPosition += 20;

  // Services table
  doc.setFont('helvetica', 'bold');
  doc.text('Services', margin, yPosition);
  yPosition += 8;

  // Table header
  doc.setFillColor(249, 250, 251); // Gray-50
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 12, 'F');
  doc.setFontSize(10);
  doc.text('Description', margin + 5, yPosition + 8);
  
  // Right align "Amount" header
  const amountHeaderWidth = doc.getTextWidth('Amount');
  doc.text('Amount', pageWidth - margin - 5 - amountHeaderWidth, yPosition + 8);
  
  yPosition += 12;

  // Service row
  doc.setFont('helvetica', 'normal');
  doc.setFillColor(255, 255, 255); // White
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 20, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.text(invoiceData.package_title, margin + 5, yPosition + 8);
  
  // Right align package price
  const priceText = formatPrice(invoiceData.package_price);
  const priceWidth = doc.getTextWidth(priceText);
  doc.text(priceText, pageWidth - margin - 5 - priceWidth, yPosition + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  const descLines = doc.splitTextToSize(invoiceData.package_description, pageWidth - 2 * margin - 80);
  doc.text(descLines.slice(0, 2), margin + 5, yPosition + 14); // Show only first 2 lines
  
  yPosition += 25;

  // Payment history (if any verified payments exist)
  if (invoiceData.verified_payments.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment History', margin, yPosition);
    yPosition += 8;

    // Payment table header
    doc.setFillColor(249, 250, 251); // Gray-50
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 12, 'F');
    doc.setFontSize(10);
    doc.text('Date', margin + 5, yPosition + 8);
    doc.text('Amount', margin + 60, yPosition + 8);
    doc.text('Status', pageWidth - margin - 30, yPosition + 8);
    
    yPosition += 12;

    // Payment rows
    invoiceData.verified_payments.forEach((payment, index) => {
      doc.setFillColor(index % 2 === 0 ? 255 : 249, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 251);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(formatDate(payment.uploaded_at), margin + 5, yPosition + 7);
      doc.text(formatPrice(payment.amount), margin + 60, yPosition + 7);
      doc.text(payment.status.toUpperCase(), pageWidth - margin - 30, yPosition + 7);
      
      yPosition += 10;
    });
    yPosition += 10;
  }

  // Totals section
  const totalsX = pageWidth - margin - 80;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('Subtotal:', totalsX, yPosition);
  
  // Right align totals
  const subtotalText = formatPrice(invoiceData.total_amount);
  const subtotalWidth = doc.getTextWidth(subtotalText);
  doc.text(subtotalText, pageWidth - margin - 5 - subtotalWidth, yPosition);
  
  yPosition += 8;
  doc.text('Total Paid:', totalsX, yPosition);
  const totalPaidText = formatPrice(invoiceData.total_paid);
  const totalPaidWidth = doc.getTextWidth(totalPaidText);
  doc.text(totalPaidText, pageWidth - margin - 5 - totalPaidWidth, yPosition);
  
  yPosition += 12;

  // Balance due with line
  doc.setLineWidth(0.5);
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.line(totalsX, yPosition - 2, pageWidth - margin, yPosition - 2);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Balance Due:', totalsX, yPosition + 5);
  
  const balanceText = formatPrice(invoiceData.balance);
  const balanceWidth = doc.getTextWidth(balanceText);
  doc.text(balanceText, pageWidth - margin - 5 - balanceWidth, yPosition + 5);

  // Footer
  yPosition += 30;
  if (yPosition > doc.internal.pageSize.height - 40) {
    doc.addPage();
    yPosition = 30;
  }

  doc.setFontSize(10);
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setFont('helvetica', 'normal');
  const footerText1 = 'Thank you for choosing our wedding planning services!';
  const footerText2 = `This invoice was generated on ${new Date().toLocaleDateString()}`;
  
  // Center align footer text
  const footer1Width = doc.getTextWidth(footerText1);
  const footer2Width = doc.getTextWidth(footerText2);
  
  doc.text(footerText1, (pageWidth - footer1Width) / 2, yPosition);
  doc.text(footerText2, (pageWidth - footer2Width) / 2, yPosition + 8);

  // Save the PDF
  doc.save(`Invoice-${invoiceData.invoice_number}.pdf`);
};

  if (loading) {
    return (
      <DashboardLayout title="Payments" subtitle="Manage your payment history and methods">
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
          <span className="ml-3 text-gray-600">Loading payments...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Payments" subtitle="Manage your payment history and methods">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Payments</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={refetch}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Payments"
      subtitle="Manage your payment history and invoices"
    >
      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(summary.pending_amount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(summary.verified_amount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">{summary.total_payments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{summary.total_invoices}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'transactions', label: `Transactions (${payments.length})` },
              { key: 'invoices', label: `Invoices (${invoices.length})` }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          </div>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-600">Your payment transactions will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.payment_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.package_title}
                          </div>
                          <div className="text-sm text-gray-500">{payment.business_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(payment.uploaded_at)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatPrice(payment.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1 capitalize">{payment.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        {payment.receipt_url && (
                          <a 
                            href={payment.receipt_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-pink-600 hover:text-pink-700"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Invoices</h3>
          </div>
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
              <p className="text-gray-600">Invoices will be generated for confirmed bookings.</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.booking_id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          INV-{invoice.booking_id.toString().padStart(6, '0')}
                        </h4>
                        <p className="text-sm text-gray-600">{invoice.package_title}</p>
                        <p className="text-sm text-gray-600">{invoice.business_name}</p>
                        <p className="text-sm text-gray-500">
                          Wedding Date: {formatDate(invoice.wedding_date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatPrice(invoice.package_price)}</p>
                        <p className="text-sm text-gray-600">Paid: {formatPrice(invoice.total_paid)}</p>
                        <p className="text-sm text-gray-600">Balance: {formatPrice(invoice.balance)}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(invoice.invoice_status)} mt-2`}>
                          {getStatusIcon(invoice.invoice_status)}
                          <span className="ml-1 capitalize">{invoice.invoice_status}</span>
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-3">
                      {(invoice.booking_status === 'confirmed' || invoice.booking_status === 'completed') && (
                        <button 
                          onClick={() => handleExportInvoice(invoice.booking_id)}
                          disabled={exportingInvoice === invoice.booking_id}
                          className="inline-flex items-center text-sm text-pink-600 hover:text-pink-700 disabled:opacity-50"
                        >
                          {exportingInvoice === invoice.booking_id ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4 mr-1" />
                          )}
                          Export Invoice
                        </button>
                      )}
                      <button 
                        onClick={() => handleViewDetails(invoice.booking_id)}
                        className="text-sm text-gray-600 hover:text-gray-700"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default ClientPayments;