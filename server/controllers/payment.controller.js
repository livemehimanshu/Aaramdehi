import Payment from "../models/payment.model.js";

// Get all payments
export const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, paymentMethod } = req.query;
    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }

    const skip = (page - 1) * limit;
    const payments = await Payment.find(filter)
      .populate("orderId", "orderNumber")
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments(filter);

    return res.json({
      success: true,
      message: "Payments fetched successfully",
      data: payments,
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

// Get payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id)
      .populate("orderId")
      .populate("userId", "name email phone");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.json({
      success: true,
      message: "Payment fetched successfully",
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create payment
export const createPayment = async (req, res) => {
  try {
    const {
      orderId,
      userId,
      paymentMethod,
      amount,
      currency,
      transactionId,
      paymentGateway,
      cardDetails,
      upiId,
    } = req.body;

    if (!orderId || !userId || !paymentMethod || !amount || !transactionId || !paymentGateway) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const payment = new Payment({
      orderId,
      userId,
      paymentMethod,
      amount,
      currency: currency || "INR",
      transactionId,
      paymentGateway,
      status: "pending",
      cardDetails: cardDetails || null,
      upiId: upiId || null,
    });

    await payment.save();

    return res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transactionId, gatewayResponse, errorMessage } = req.body;

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (status) payment.status = status;
    if (transactionId) payment.transactionId = transactionId;
    if (gatewayResponse) payment.gatewayResponse = gatewayResponse;
    if (errorMessage) payment.errorMessage = errorMessage;

    if (status === "completed") {
      payment.paymentDate = new Date();
    }

    await payment.save();

    return res.json({
      success: true,
      message: "Payment updated successfully",
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Retry payment
export const retryPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot retry a completed payment",
      });
    }

    payment.retryCount += 1;
    payment.status = "pending";
    payment.nextRetryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours later

    await payment.save();

    return res.json({
      success: true,
      message: "Payment retry scheduled successfully",
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get payment statistics
export const getPaymentStats = async (req, res) => {
  try {
    const totalPayments = await Payment.countDocuments();
    const completedPayments = await Payment.countDocuments({
      status: "completed",
    });
    const pendingPayments = await Payment.countDocuments({ status: "pending" });
    const failedPayments = await Payment.countDocuments({ status: "failed" });

    const totalAmount = await Payment.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const paymentsByMethod = await Payment.aggregate([
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
        },
      },
    ]);

    return res.json({
      success: true,
      message: "Payment stats fetched successfully",
      data: {
        totalPayments,
        completedPayments,
        pendingPayments,
        failedPayments,
        totalAmount: totalAmount[0]?.total || 0,
        paymentsByMethod,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete payment
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByIdAndDelete(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
