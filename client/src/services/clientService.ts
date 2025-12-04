// services/clientService.ts - Updated to match new response format
import { API_CONFIG, apiRequest } from '../config/api';

export interface ClientPackage {
  packageId: number;
  packageName: string;
  packagePrice: string;
  packageDescription: string;
  bookingId: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  paidAmount: string;
  paymentStatus: string | null;
}

export interface ClientBooking {
  bookingId: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  weddingDate: string;
  weddingTime: string;
  weddingLocation: string;
  notes: string;
  packageName: string;
  packagePrice: string;
  paidAmount: string;
  createdAt: string;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  joinedDate: string;
  weddingDate: string;
  venue: string;
  packages: ClientPackage[];
  bookings: ClientBooking[];
  totalSpent: string;
  lastContact: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  bookingCount: number;
  guestCount?: number;
}

export interface ClientStats {
  totalClients: number;
  activeProjects: number;
  pending: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: Pagination;
  message?: string;
}

export interface ClientFilters {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ClientDetails extends Client {
  bio?: string;
  location?: string;
  profilePicture?: string;
  weddingTime?: string;
  notes?: string;
  packageDescription?: string;
  totalPaid: number;
  rating?: number;
  feedback?: string;
  plannerReply?: string;
}

class ClientService {
  // Get all clients for a planner
  async getPlannerClients(
    plannerId: number, 
    filters: ClientFilters = {}
  ): Promise<ApiResponse<Client[]>> {
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    const endpoint = API_CONFIG.ENDPOINTS.CLIENTS.LIST(plannerId);
    const url = queryParams.toString() ? `${endpoint}?${queryParams}` : endpoint;
    
    return apiRequest<ApiResponse<Client[]>>(url);
  }

  // Get client statistics
  async getClientStats(plannerId: number): Promise<ApiResponse<ClientStats>> {
    const endpoint = API_CONFIG.ENDPOINTS.CLIENTS.STATS(plannerId);
    return apiRequest<ApiResponse<ClientStats>>(endpoint);
  }

  // Get specific client details
  async getClientDetails(plannerId: number, clientId: number): Promise<ApiResponse<ClientDetails>> {
    const endpoint = API_CONFIG.ENDPOINTS.CLIENTS.DETAILS(plannerId, clientId);
    return apiRequest<ApiResponse<ClientDetails>>(endpoint);
  }

  // Send message to client
  async sendMessage(
    plannerId: number, 
    clientId: number, 
    messageData: { message: string; subject?: string }
  ): Promise<ApiResponse<any>> {
    const endpoint = API_CONFIG.ENDPOINTS.CLIENTS.MESSAGE(plannerId, clientId);
    return apiRequest<ApiResponse<any>>(endpoint, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  // Update client notes
  async updateClientNotes(
    plannerId: number, 
    clientId: number, 
    notes: string
  ): Promise<ApiResponse<any>> {
    const endpoint = API_CONFIG.ENDPOINTS.CLIENTS.NOTES(plannerId, clientId);
    return apiRequest<ApiResponse<any>>(endpoint, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    });
  }
}

export const clientService = new ClientService();