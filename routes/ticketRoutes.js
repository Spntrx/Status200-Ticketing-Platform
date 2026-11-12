const express = require("express");

const {
  createTicket,
  getTickets,
  updateTicket,
  deleteTicket,
  getTicketById
} = require("../controllers/ticketController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Protect all ticket routes
router.use(protect);

router.post("/", createTicket);
router.get("/", getTickets);
router.get("/:id", getTicketById);
router.put("/:id", updateTicket);
router.delete("/:id", deleteTicket);

module.exports = router;