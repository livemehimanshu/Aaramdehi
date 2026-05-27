import { findAll, findById, create, updateById, deleteById } from "../config/db.js";

const parseInteger = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const getAllPayments = async (req, res) => {
  try {
    const page = parseInteger(req.query.page, 1);
    const limit = parseInteger(req.query.limit, 10);
    const { status, paymentMethod } = req.query;

    let payments = await findAll('payments');

    if (status) {
      payments = payments.filter(payment => payment.status === status);
    }
    if (paymentMethod) {
      payments = payments.filter(payment => payment.paymentMethod === paymentMethod);
    }

    payments = payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = payments.length;
    const startIndex = (page - 1) * limit;
    const paginated = payments.slice(startIndex, startIndex + limit);

    return res.json({
      success: true,
      message: "Payments fetched successfully",
      data: paginated,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await findById('payments', id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    return res.json({
      success: true,
      message: "Payment fetched successfully",
      data: payment
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

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
        message: "Required fields are missing"
      });
    }

    const payment = await create('payments', {
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
      createdBy: req.userId || null
    });

    return res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: payment
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transactionId, gatewayResponse, errorMessage } = req.body;
    const payment = await findById('payments', id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    const updatePayload = {};
    if (status) updatePayload.status = status;
    if (transactionId) updatePayload.transactionId = transactionId;
    if (gatewayResponse) updatePayload.gatewayResponse = gatewayResponse;
    if (errorMessage) updatePayload.errorMessage = errorMessage;
    if (status === "completed") updatePayload.paymentDate = new Date().toISOString();

    const updatedPayment = await updateById('payments', id, updatePayload);

    return res.json({
      success: true,
      message: "Payment updated successfully",
      data: updatedPayment
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const retryPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await findById('payments', id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    if (payment.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot retry a completed payment"
      });
    }

    const updatedPayment = await updateById('payments', id, {
      retryCount: (Number(payment.retryCount) || 0) + 1,
      status: "pending",
      nextRetryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });

    return res.json({
      success: true,
      message: "Payment retry scheduled successfully",
      data: updatedPayment
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getPaymentStats = async (req, res) => {
  try {
    const payments = await findAll('payments');
    const totalPayments = payments.length;
    const completedPayments = payments.filter(payment => payment.status === 'completed').length;
    const pendingPayments = payments.filter(payment => payment.status === 'pending').length;
    const failedPayments = payments.filter(payment => payment.status === 'failed').length;
    const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    const paymentsByMethod = payments.reduce((acc, payment) => {
      const method = payment.paymentMethod || 'Unknown';
      if (!acc[method]) acc[method] = { _id: method, count: 0, amount: 0 };
      acc[method].count += 1;
      acc[method].amount += Number(payment.amount || 0);
      return acc;
    }, {});

    return res.json({
      success: true,
      message: "Payment stats fetched successfully",
      data: {
        totalPayments,
        completedPayments,
        pendingPayments,
        failedPayments,
        totalAmount,
        paymentsByMethod: Object.values(paymentsByMethod)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await findById('payments', id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    await deleteById('payments', id);

    return res.json({
      success: true,
      message: "Payment deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
