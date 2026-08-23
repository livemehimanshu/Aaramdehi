import crypto from "crypto";
import Razorpay from "razorpay";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { findAll, findById, create, updateById, deleteById } from "../config/db.js";
import {
  db,
  encryptSecret,
  getRazorpayCredentials,
  getCashfreeCredentials,
} from "../config/paymentConfig.js";

const parseInteger = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

// ==========================================
// DYNAMIC GATEWAY MANAGEMENT APIs
// ==========================================

// Admin API: Get Gateway Configurations
export const getGatewayConfig = async (req, res) => {
  try {
    const dbRef = db.ref("payment_gateways");
    const snapshot = await dbRef.once("value");
    const data = snapshot.val();

    if (!data) {
      return res.status(200).json({ success: true, data: {} });
    }

    const config = {};
    if (data.razorpay) {
      config.razorpay = {
        key_id: data.razorpay.key_id,
        is_active: data.razorpay.is_active,
        mode: data.razorpay.mode,
      };
    }
    if (data.cashfree) {
      config.cashfree = {
        app_id: data.cashfree.app_id,
        is_active: data.cashfree.is_active,
        mode: data.cashfree.mode,
      };
    }

    return res.status(200).json({ success: true, data: config });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 1. Admin API: Save Dynamic Gateway Credentials to Firebase DB
export const updateGatewayConfig = async (req, res) => {
  try {
    const { provider, key_id_or_app_id, secret, is_active, mode } = req.body;

    if (!provider || !key_id_or_app_id || !secret) {
      return res.status(400).json({
        success: false,
        message: "Required fields (provider, key_id_or_app_id, secret) missing",
      });
    }

    const encryptedSecret = encryptSecret(secret);

    if (provider === "razorpay") {
      await db.ref("payment_gateways/razorpay").set({
        key_id: key_id_or_app_id,
        key_secret: encryptedSecret,
        is_active: Boolean(is_active),
        mode: mode || "sandbox",
        updated_at: Date.now(),
      });
    } else if (provider === "cashfree") {
      await db.ref("payment_gateways/cashfree").set({
        app_id: key_id_or_app_id,
        secret_key: encryptedSecret,
        is_active: Boolean(is_active),
        mode: mode || "sandbox",
        updated_at: Date.now(),
      });
    } else {
      return res.status(400).json({ success: false, message: "Invalid provider specified" });
    }

    return res.status(200).json({
      success: true,
      message: `${provider.toUpperCase()} credentials updated and encrypted successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. Client API: Create Dynamic Razorpay Order
export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderItems, currency } = req.body;
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: "Order items are required" });
    }
    const products = await Promise.all(orderItems.map((item) => findById('products', item.product || item.productId)));
    if (products.some((product) => !product)) return res.status(400).json({ success: false, message: "One or more products are invalid" });
    const amount = orderItems.reduce((total, item, index) => total + Number(products[index].sellingPrice || products[index].price || 0) * Math.max(1, Number(item.quantity) || 1), 0);
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, message: "Invalid order total" });

    const config = getRazorpayCredentials();

    const instance = new Razorpay({
      key_id: config.key_id,
      key_secret: config.key_secret,
    });

    const order = await instance.orders.create({
      amount: Math.round(Number(amount) * 100), // Convert to paise
      currency: currency || "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    return res.status(200).json({
      success: true,
      key_id: config.key_id,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 2.5 Client API: Verify Razorpay Payment Signature
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const config = getRazorpayCredentials();

    const expectedSignature = crypto
      .createHmac("sha256", config.key_secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      return res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Client API: Create Dynamic Cashfree Order
export const createCashfreeOrder = async (req, res) => {
  try {
    const { orderItems, customerId, phone, email } = req.body;
    if (!Array.isArray(orderItems) || orderItems.length === 0 || !phone) {
      return res.status(400).json({ success: false, message: "Order items and phone are required" });
    }
    const products = await Promise.all(orderItems.map((item) => findById('products', item.product || item.productId)));
    if (products.some((product) => !product)) return res.status(400).json({ success: false, message: "One or more products are invalid" });
    const amount = orderItems.reduce((total, item, index) => total + Number(products[index].sellingPrice || products[index].price || 0) * Math.max(1, Number(item.quantity) || 1), 0);
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, message: "Invalid order total" });

    const config = getCashfreeCredentials();

    Cashfree.XClientId = config.app_id;
    Cashfree.XClientSecret = config.secret_key;
    Cashfree.XEnvironment =
      config.mode === "live" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

    const request = {
      order_amount: Number(amount),
      order_currency: "INR",
      order_id: `order_${Date.now()}`,
      customer_details: {
        customer_id: customerId || `cust_${Date.now()}`,
        customer_phone: phone,
        customer_email: email || "customer@aaramdehi.com",
      },
    };

    const response = await Cashfree.PGCreateOrder("2023-08-01", request);

    return res.status(200).json({
      success: true,
      payment_session_id: response.data.payment_session_id,
      order_id: response.data.order_id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// WEBHOOK HANDLING APIs
// ==========================================

export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.rawBody || req.body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    const payload = JSON.parse((req.rawBody || req.body).toString());

    if (payload.event === "payment.captured") {
      const paymentEntity = payload.payload.payment.entity;

      // Update DB Payment Status
      const existingPayment = await findByQuery('payments', 'transactionId', paymentEntity.id);
      if (existingPayment.length > 0) return res.status(200).json({ status: "ok", duplicate: true });
      await create("payments", {
        orderId: paymentEntity.order_id,
        transactionId: paymentEntity.id,
        amount: paymentEntity.amount / 100,
        currency: paymentEntity.currency,
        paymentGateway: "razorpay",
        status: "completed",
        paymentDate: new Date().toISOString(),
      });
    }

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const cashfreeWebhook = async (req, res) => {
  try {
    const rawBody = (req.rawBody || req.body).toString();
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const config = getCashfreeCredentials();
    const expectedSignature = crypto.createHmac('sha256', config.secret_key).update(`${timestamp}${rawBody}`).digest('base64');
    const receivedSignature = Buffer.from(String(signature || ''));
    const expectedSignatureBuffer = Buffer.from(expectedSignature);
    if (!signature || !timestamp || receivedSignature.length !== expectedSignatureBuffer.length || !crypto.timingSafeEqual(expectedSignatureBuffer, receivedSignature)) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }
    const payload = JSON.parse(rawBody);

    if (payload.type === "PAYMENT_SUCCESS_WEBHOOK") {
      const data = payload.data;

      const existingPayment = await findByQuery('payments', 'transactionId', data.payment.cf_payment_id);
      if (existingPayment.length > 0) return res.status(200).json({ status: "ok", duplicate: true });
      await create("payments", {
        orderId: data.order.order_id,
        transactionId: data.payment.cf_payment_id,
        amount: data.order.order_amount,
        currency: data.order.order_currency,
        paymentGateway: "cashfree",
        status: "completed",
        paymentDate: new Date().toISOString(),
      });
    }

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// EXISTING PAYMENT MANAGEMENT APIs
// ==========================================

export const getAllPayments = async (req, res) => {
  try {
    const page = parseInteger(req.query.page, 1);
    const limit = parseInteger(req.query.limit, 10);
    const { status, paymentMethod } = req.query;

    let payments = await findAll("payments");

    if (status) {
      payments = payments.filter((payment) => payment.status === status);
    }
    if (paymentMethod) {
      payments = payments.filter((payment) => payment.paymentMethod === paymentMethod);
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

export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await findById("payments", id);

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

    const payment = await create("payments", {
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
      createdBy: req.userId || null,
    });

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

export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transactionId, gatewayResponse, errorMessage } = req.body;
    const payment = await findById("payments", id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const updatePayload = {};
    if (status) updatePayload.status = status;
    if (transactionId) updatePayload.transactionId = transactionId;
    if (gatewayResponse) updatePayload.gatewayResponse = gatewayResponse;
    if (errorMessage) updatePayload.errorMessage = errorMessage;
    if (status === "completed") updatePayload.paymentDate = new Date().toISOString();

    const updatedPayment = await updateById("payments", id, updatePayload);

    return res.json({
      success: true,
      message: "Payment updated successfully",
      data: updatedPayment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const retryPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await findById("payments", id);

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

    const updatedPayment = await updateById("payments", id, {
      retryCount: (Number(payment.retryCount) || 0) + 1,
      status: "pending",
      nextRetryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    return res.json({
      success: true,
      message: "Payment retry scheduled successfully",
      data: updatedPayment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPaymentStats = async (req, res) => {
  try {
    const payments = await findAll("payments");
    const totalPayments = payments.length;
    const completedPayments = payments.filter((payment) => payment.status === "completed").length;
    const pendingPayments = payments.filter((payment) => payment.status === "pending").length;
    const failedPayments = payments.filter((payment) => payment.status === "failed").length;
    const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    const paymentsByMethod = payments.reduce((acc, payment) => {
      const method = payment.paymentMethod || "Unknown";
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
        paymentsByMethod: Object.values(paymentsByMethod),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await findById("payments", id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    await deleteById("payments", id);

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