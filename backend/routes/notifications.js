// backend/routes/notifications.js
import express from "express";
import Notification from "../models/Notification.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Get all notifications for the logged-in user
router.get("/", requireAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20); // Limit to prevent overwhelming the UI

    res.json({ success: true, notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Mark a notification as read
router.patch("/:id/read", requireAuth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Mark all notifications as read
router.patch("/mark-all-read", requireAuth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user.id, read: false },
      { read: true }
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete a notification
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete(
      { _id: req.params.id, recipientId: req.user.id }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, message: "Notification deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Helper function to create notifications with deduplication
export const createNotification = async (recipientId, type, title, message, relatedId = null, relatedModel = null) => {
  try {
    // Check if similar notification already exists (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existingNotification = await Notification.findOne({
      recipientId,
      type,
      relatedId,
      createdAt: { $gte: fiveMinutesAgo }
    });

    if (existingNotification) {
      console.log("Duplicate notification prevented:", { recipientId, type, message });
      return existingNotification;
    }

    const notification = new Notification({
      recipientId,
      type,
      title,
      message,
      relatedId,
      relatedModel
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error - notification already exists
      console.log("Duplicate notification prevented by unique index:", { recipientId, type, message });
      return null;
    }
    console.error("Error creating notification:", error);
    return null;
  }
};

export default router;