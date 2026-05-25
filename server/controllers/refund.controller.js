import Refund from "../models/refund.model.js";

// Get all refunds
export const getAllRefunds = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, refundType } = req.query;
    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (refundType) {
      filter.refundType = refundType;
    }

    const skip = (page - 1) * limit;
    const refunds = await Refund.find(filter)
      .populate("orderId", "orderNumber totalAmount")
      .populate("userId", "name email")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Refund.countDocuments(filter);

    return res.json({
      success: true,
      message: "Refunds fetched successfully",
      data: refunds,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get refund by ID
export const getRefundById = async (req, res) => {
  try {
    const { id } = req.params;
    const refund = await Refund.findById(id)
      .populate("orderId")
      .populate("paymentId")
      .populate("userId", "name email phone")
      .populate("approvedBy", "name email");

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found",
      });
    }

    return res.json({
      success: true,
      message: "Refund fetched successfully",
      data: refund,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create refund request
export const createRefund = async (req, res) => {
  try {
    const {
      orderId,
      paymentId,
      userId,
      refundAmount,
      originalAmount,
      refundType,
      refundReason,
      description,
      itemsReturned,
    } = req.body;

    if (!orderId || !paymentId || !userId || !refundAmount || !refundReason) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const refund = new Refund({
      orderId,
      paymentId,
      userId,
      refundAmount,
      originalAmount: originalAmount || refundAmount,
      refundType: refundType || "full",
      refundReason,
      description: description || "",
      status: "requested",
      itemsReturned: itemsReturned || [],
    });

    await refund.save();

    return res.status(201).json({
      success: true,
      message: "Refund request created successfully",
      data: refund,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Approve refund
export const approveRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const refund = await Refund.findById(id);

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found",
      });
    }

    refund.status = "approved";
    refund.approvalDate = new Date();
    refund.approvedBy = req.user.id;

    await refund.save();

    return res.json({
      success: true,
      message: "Refund approved successfully",
      data: refund,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reject refund
export const rejectRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const refund = await Refund.findById(id);

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found",
      });
    }

    refund.status = "rejected";
    refund.rejectionReason = rejectionReason || "";
    refund.approvedBy = req.user.id;

    await refund.save();

    return res.json({
      success: true,
      message: "Refund rejected successfully",
      data: refund,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Process refund
export const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { refundTransactionId, refundMethod, bankDetails } = req.body;

    const refund = await Refund.findById(id);

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found",
      });
    }

    if (refund.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved refunds can be processed",
      });
    }

    refund.status = "processed";
    refund.processedDate = new Date();
    refund.refundTransactionId = refundTransactionId || "";
    refund.refundMethod = refundMethod || "original_payment";

    if (bankDetails) {
      refund.bankDetails = bankDetails;
    }

    await refund.save();

    return res.json({
      success: true,
      message: "Refund processed successfully",
      data: refund,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Complete refund
export const completeRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const refund = await Refund.findById(id);

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found",
      });
    }

    refund.status = "completed";
    await refund.save();

    return res.json({
      success: true,
      message: "Refund completed successfully",
      data: refund,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get refund statistics
export const getRefundStats = async (req, res) => {
  try {
    const totalRefunds = await Refund.countDocuments();
    const requestedRefunds = await Refund.countDocuments({
      status: "requested",
    });
    const approvedRefunds = await Refund.countDocuments({ status: "approved" });
    const processedRefunds = await Refund.countDocuments({
      status: "processed",
    });
    const completedRefunds = await Refund.countDocuments({
      status: "completed",
    });

    const totalRefundAmount = await Refund.aggregate([
      { $group: { _id: null, total: { $sum: "$refundAmount" } } },
    ]);

    const refundsByReason = await Refund.aggregate([
      {
        $group: {
          _id: "$refundReason",
          count: { $sum: 1 },
          amount: { $sum: "$refundAmount" },
        },
      },
    ]);

    return res.json({
      success: true,
      message: "Refund stats fetched successfully",
      data: {
        totalRefunds,
        requestedRefunds,
        approvedRefunds,
        processedRefunds,
        completedRefunds,
        totalRefundAmount: totalRefundAmount[0]?.total || 0,
        refundsByReason,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete refund
export const deleteRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const refund = await Refund.findByIdAndDelete(id);

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found",
      });
    }

    return res.json({
      success: true,
      message: "Refund deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
