const Ticket = require("../models/Ticket");

// Create ticket
const createTicket = async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    const ticket = await Ticket.create({
      title,
      description,
      priority,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Ticket created successfully",
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating ticket",
      error: error.message,
    });
  }
};

// Get user's tickets
const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({
      createdBy: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving tickets",
      error: error.message,
    });
  }
};

// Get ticket by ID
const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found or unauthorized",
      });
    }

    res.status(200).json(ticket);

  } catch (error) {
    res.status(500).json({
      message: "Error retrieving ticket",
      error: error.message,
    });
  }
};

// Update ticket
const updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found or unauthorized",
      });
    }

    const { title, description, priority, status } = req.body;

    if (title !== undefined) ticket.title = title;
    if (description !== undefined) ticket.description = description;
    if (priority !== undefined) ticket.priority = priority;
    if (status !== undefined) ticket.status = status;

    await ticket.save();

    res.status(200).json({
      message: "Ticket updated successfully",
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating ticket",
      error: error.message,
    });
  }
};

// Delete ticket
const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found or unauthorized",
      });
    }

    res.status(200).json({
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting ticket",
      error: error.message,
    });
  }
};

module.exports = {
  createTicket,
  getTickets,
  updateTicket,
  deleteTicket,
  getTicketById
};