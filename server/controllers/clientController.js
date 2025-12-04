import { 
  getPlannerClients, 
  getPlannerClientStats, 
  getClientDetails 
} from "../models/clientModel.js";

/* =======================
   GET PLANNER CLIENTS
======================= */
export const getPlannerClientsController = async (req, res) => {
  try {
    const { planner_id } = req.params;
    const { search, status, page, limit } = req.query;
    
    // Check if user is accessing their own clients or is admin
    if (req.user.userId !== parseInt(planner_id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Ensure the user is actually a planner
    if (req.user.role !== 'planner' && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Only planners can access client data" });
    }
    
    const filters = {
      search,
      status,
      page: page || 1,
      limit: limit || 20
    };
    
    const result = await getPlannerClients(planner_id, filters);
    
    res.json({
      success: true,
      data: result.clients,
      pagination: result.pagination
    });
    
  } catch (error) {
    console.error('Get planner clients error:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

/* =======================
   GET CLIENT STATISTICS
======================= */
export const getPlannerClientStatsController = async (req, res) => {
  try {
    const { planner_id } = req.params;
    
    // Check if user is accessing their own stats or is admin
    if (req.user.userId !== parseInt(planner_id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Ensure the user is actually a planner
    if (req.user.role !== 'planner' && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Only planners can access client statistics" });
    }
    
    const stats = await getPlannerClientStats(planner_id);
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Get planner client stats error:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

/* =======================
   GET CLIENT DETAILS
======================= */
export const getClientDetailsController = async (req, res) => {
  try {
    const { planner_id, client_id } = req.params;
    
    // Check if user is accessing their own client data or is admin
    if (req.user.userId !== parseInt(planner_id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Ensure the user is actually a planner
    if (req.user.role !== 'planner' && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Only planners can access client details" });
    }
    
    const clientDetails = await getClientDetails(client_id, planner_id);
    
    if (!clientDetails) {
      return res.status(404).json({ 
        message: "Client not found or you don't have access to this client" 
      });
    }
    
    res.json({
      success: true,
      data: clientDetails
    });
    
  } catch (error) {
    console.error('Get client details error:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

/* =======================
   SEND MESSAGE TO CLIENT (Placeholder)
======================= */
export const sendMessageToClient = async (req, res) => {
  try {
    const { planner_id, client_id } = req.params;
    const { message, subject } = req.body;
    
    // Check if user is accessing their own client data or is admin
    if (req.user.userId !== parseInt(planner_id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Validate required fields
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }
    
    // TODO: Implement actual messaging system
    // For now, just return success
    res.json({
      success: true,
      message: "Message sent successfully"
    });
    
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

/* =======================
   UPDATE CLIENT NOTES (Optional)
======================= */
export const updateClientNotes = async (req, res) => {
  try {
    const { planner_id, client_id } = req.params;
    const { notes } = req.body;
    
    // Check if user is accessing their own client data or is admin
    if (req.user.userId !== parseInt(planner_id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // TODO: Implement note updating in database
    // This would require adding a notes field to the bookings table or creating a separate notes table
    
    res.json({
      success: true,
      message: "Client notes updated successfully"
    });
    
  } catch (error) {
    console.error('Update client notes error:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};