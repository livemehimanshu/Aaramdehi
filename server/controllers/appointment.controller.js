import { findAll, findById, create, updateById, deleteById } from "../config/db.js";

const COLLECTION = 'appointments';

const parseInteger = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const getAllAppointments = async (req, res) => {
  try {
    const page = parseInteger(req.query.page, 1);
    const limit = parseInteger(req.query.limit, 10);
    const { status, search, dateFrom, dateTo } = req.query;

    let appointments = await findAll(COLLECTION);

    if (status) {
      appointments = appointments.filter(item => item.status === status);
    }

    if (search) {
      const query = search.toLowerCase();
      appointments = appointments.filter(item =>
        String(item.customerName || '').toLowerCase().includes(query) ||
        String(item.email || '').toLowerCase().includes(query) ||
        String(item.phone || '').toLowerCase().includes(query) ||
        String(item.subject || '').toLowerCase().includes(query)
      );
    }

    if (dateFrom || dateTo) {
      appointments = appointments.filter(item => {
        const appointmentDate = item.appointmentDate ? new Date(item.appointmentDate) : null;
        if (!appointmentDate || Number.isNaN(appointmentDate.getTime())) return false;
        if (dateFrom && appointmentDate < new Date(dateFrom)) return false;
        if (dateTo && appointmentDate > new Date(dateTo)) return false;
        return true;
      });
    }

    // Sorting: Newest appointment dates first
    appointments.sort((a, b) => new Date(b.appointmentDate || b.createdAt) - new Date(a.appointmentDate || a.createdAt));
    
    const total = appointments.length;
    const startIndex = (page - 1) * limit;
    const paginated = appointments.slice(startIndex, startIndex + limit);

    return res.json({
      success: true,
      message: "Appointments fetched successfully",
      data: paginated,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("❌ [Appointment Controller]: getAllAppointments Error", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await findById(COLLECTION, id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    return res.json({
      success: true,
      message: "Appointment fetched successfully",
      data: appointment
    });
  } catch (error) {
    console.error("❌ [Appointment Controller]: getAppointmentById Error", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const {
      customerName,
      email,
      phone,
      subject,
      message,
      appointmentDate,
      appointmentTime,
      serviceType,
      preferredContactMethod,
    } = req.body;

    // Validate required fields
    if (!customerName || !email || !phone || !subject || !appointmentDate) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing: customerName, email, phone, subject, appointmentDate"
      });
    }

    const payload = {
      customerName,
      email,
      phone,
      subject,
      message,
      appointmentDate,
      appointmentTime: appointmentTime || "",
      serviceType: serviceType || "consultation",
      preferredContactMethod: preferredContactMethod || "email",
      status: "pending"
    };

    if (req.userId || req.user?._id) payload.createdBy = req.userId || req.user?._id;

    const appointment = await create(COLLECTION, payload);

    return res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: appointment
    });
  } catch (error) {
    console.error("❌ [Appointment Controller]: createAppointment Error", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customerName,
      email,
      phone,
      subject,
      message,
      appointmentDate,
      appointmentTime,
      status,
      serviceType,
      preferredContactMethod,
      assignedTo,
      notes,
    } = req.body;

    const appointment = await findById(COLLECTION, id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    // Build update payload dynamically
    const updatePayload = {};
    if (customerName) updatePayload.customerName = customerName;
    if (email) updatePayload.email = email;
    if (phone !== undefined) updatePayload.phone = phone;
    if (subject) updatePayload.subject = subject;
    if (message) updatePayload.message = message;
    if (appointmentDate) updatePayload.appointmentDate = appointmentDate;
    if (appointmentTime !== undefined) updatePayload.appointmentTime = appointmentTime;
    if (status) updatePayload.status = status;
    if (serviceType) updatePayload.serviceType = serviceType;
    if (preferredContactMethod) updatePayload.preferredContactMethod = preferredContactMethod;
    if (assignedTo !== undefined) updatePayload.assignedTo = assignedTo;
    if (notes !== undefined) updatePayload.notes = notes;

    const updatedAppointment = await updateById(COLLECTION, id, updatePayload);

    return res.json({
      success: true,
      message: "Appointment updated successfully",
      data: updatedAppointment
    });
  } catch (error) {
    console.error("❌ [Appointment Controller]: updateAppointment Error", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await findById(COLLECTION, id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    await deleteById(COLLECTION, id);

    return res.json({
      success: true,
      message: "Appointment deleted successfully"
    });
  } catch (error) {
    console.error("❌ [Appointment Controller]: deleteAppointment Error", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;
    const appointment = await findById(COLLECTION, id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    const updatedAppointment = await updateById(COLLECTION, id, {
      status: "cancelled",
      cancelReason: cancelReason || ""
    });

    return res.json({
      success: true,
      message: "Appointment cancelled successfully",
      data: updatedAppointment
    });
  } catch (error) {
    console.error("❌ [Appointment Controller]: cancelAppointment Error", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await findById(COLLECTION, id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    const updatedAppointment = await updateById(COLLECTION, id, {
      status: "confirmed",
      reminderSent: false
    });

    return res.json({
      success: true,
      message: "Appointment confirmed successfully",
      data: updatedAppointment
    });
  } catch (error) {
    console.error("❌ [Appointment Controller]: confirmAppointment Error", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAppointmentStats = async (req, res) => {
  try {
    const appointments = await findAll(COLLECTION);
    const total = appointments.length;
    const pending = appointments.filter(item => String(item.status).toLowerCase() === 'pending').length;
    const confirmed = appointments.filter(item => String(item.status).toLowerCase() === 'confirmed').length;
    const completed = appointments.filter(item => String(item.status).toLowerCase() === 'completed').length;
    const cancelled = appointments.filter(item => String(item.status).toLowerCase() === 'cancelled').length;

    return res.json({
      success: true,
      message: "Appointment stats fetched successfully",
      data: {
        total,
        pending,
        confirmed,
        completed,
        cancelled
      }
    });
  } catch (error) {
    console.error("❌ [Appointment Controller]: getAppointmentStats Error", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
