import { findAll, findById, create, updateById, deleteById } from "../config/db.js";

const parseInteger = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const getAllRefunds = async (req, res) => {
  try {
    const page = parseInteger(req.query.page, 1);
    const limit = parseInteger(req.query.limit, 10);
    const { status, refundType } = req.query;

    let refunds = await findAll('refunds');

    if (status) {
      refunds = refunds.filter(refund => refund.status === status);
    }
    if (refundType) {
      refunds = refunds.filter(refund => refund.refundType === refundType);
    }

    refunds = refunds.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = refunds.length;
    const startIndex = (page - 1) * limit;
    const paginated = refunds.slice(startIndex, startIndex + limit);

    return res.json({
      success: true,
      message: "Refunds fetched successfully",
      data: paginated,
      pagination: {
        total,
        page,
        limit,
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
    const refund = await findById('refunds', id);

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

    const refund = await create('refunds', {
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
      createdBy: req.userId || null,
    });

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
    const refund = await findById('refunds', id);

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found",
      });
    }

    const updatedRefund = await updateById('refunds', id, {
      status: "approved",
      approvalDate: new Date().toISOString(),
      approvedBy: req.userId || null,
    });

    return res.json({
      success: true,
      message: "Refund approved successfully",
      data: updatedRefund,
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

    const refund = await findById('refunds', id);

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found",
      });
    }

    const updatedRefund = await updateById('refunds', id, {
      status: "rejected",
      rejectionReason: rejectionReason || "",
      approvedBy: req.userId || null,
    });

    return res.json({
      success: true,
      message: "Refund rejected successfully",
      data: updatedRefund,
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
    const refund = await findById('refunds', id);

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

    const updatedRefund = await updateById('refunds', id, {
      status: "processed",
      processedDate: new Date().toISOString(),
      refundTransactionId: refundTransactionId || "",
      refundMethod: refundMethod || "original_payment",
      bankDetails: bankDetails || refund.bankDetails,
    });

    return res.json({
      success: true,
      message: "Refund processed successfully",
      data: updatedRefund,
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
    const refund = await findById('refunds', id);

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found",
      });
    }

    const updatedRefund = await updateById('refunds', id, {
      status: "completed",
    });

    return res.json({
      success: true,
      message: "Refund completed successfully",
      data: updatedRefund,
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
    const refunds = await findAll('refunds');
    const totalRefunds = refunds.length;
    const requestedRefunds = refunds.filter(refund => refund.status === 'requested').length;
    const approvedRefunds = refunds.filter(refund => refund.status === 'approved').length;
    const processedRefunds = refunds.filter(refund => refund.status === 'processed').length;
    const completedRefunds = refunds.filter(refund => refund.status === 'completed').length;

    const totalRefundAmount = refunds.reduce((sum, refund) => sum + Number(refund.refundAmount || 0), 0);

    const refundsByReason = refunds.reduce((acc, refund) => {
      const reason = refund.refundReason || 'Unknown';
      if (!acc[reason]) acc[reason] = { _id: reason, count: 0, amount: 0 };
      acc[reason].count += 1;
      acc[reason].amount += Number(refund.refundAmount || 0);
      return acc;
    }, {});

    return res.json({
      success: true,
      message: "Refund stats fetched successfully",
      data: {
        totalRefunds,
        requestedRefunds,
        approvedRefunds,
        processedRefunds,
        completedRefunds,
        totalRefundAmount,
        refundsByReason: Object.values(refundsByReason),
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
    const refund = await findById('refunds', id);

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: "Refund not found",
      });
    }

    await deleteById('refunds', id);

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
