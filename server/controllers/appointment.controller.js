import Appointment from "../models/appointment.model.js";

// Get all appointments with filters
export const getAllAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, dateFrom, dateTo } =
      req.query;
    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (dateFrom || dateTo) {
      filter.appointmentDate = {};
      if (dateFrom) {
        filter.appointmentDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.appointmentDate.$lte = new Date(dateTo);
      }
    }

    const skip = (page - 1) * limit;
    const appointments = await Appointment.find(filter)
      .populate("assignedTo", "name email phone")
      .populate("createdBy", "name email")
      .sort({ appointmentDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Appointment.countDocuments(filter);

    return res.json({
      success: true,
      message: "Appointments fetched successfully",
      data: appointments,
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

// Get appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id)
      .populate("assignedTo", "name email phone")
      .populate("createdBy", "name email");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.json({
      success: true,
      message: "Appointment fetched successfully",
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create appointment
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

    if (!customerName || !email || !phone || !subject || !message || !appointmentDate) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const appointment = new Appointment({
      customerName,
      email,
      phone,
      subject,
      message,
      appointmentDate,
      appointmentTime: appointmentTime || "",
      serviceType: serviceType || "consultation",
      preferredContactMethod: preferredContactMethod || "email",
      status: "pending",
    });

    await appointment.save();

    return res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update appointment
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

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (customerName) appointment.customerName = customerName;
    if (email) appointment.email = email;
    if (phone) appointment.phone = phone;
    if (subject) appointment.subject = subject;
    if (message) appointment.message = message;
    if (appointmentDate) appointment.appointmentDate = appointmentDate;
    if (appointmentTime !== undefined) appointment.appointmentTime = appointmentTime;
    if (status) appointment.status = status;
    if (serviceType) appointment.serviceType = serviceType;
    if (preferredContactMethod)
      appointment.preferredContactMethod = preferredContactMethod;
    if (assignedTo !== undefined) appointment.assignedTo = assignedTo;
    if (notes !== undefined) appointment.notes = notes;

    await appointment.save();

    return res.json({
      success: true,
      message: "Appointment updated successfully",
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.json({
      success: true,
      message: "Appointment deleted successfully",
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.status = "cancelled";
    appointment.cancelReason = cancelReason || "";
    await appointment.save();

    return res.json({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Confirm appointment
export const confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.status = "confirmed";
    appointment.reminderSent = false;
    await appointment.save();

    return res.json({
      success: true,
      message: "Appointment confirmed successfully",
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get dashboard stats
export const getAppointmentStats = async (req, res) => {
  try {
    const total = await Appointment.countDocuments();
    const pending = await Appointment.countDocuments({ status: "pending" });
    const confirmed = await Appointment.countDocuments({
      status: "confirmed",
    });
    const completed = await Appointment.countDocuments({ status: "completed" });
    const cancelled = await Appointment.countDocuments({ status: "cancelled" });

    return res.json({
      success: true,
      message: "Appointment stats fetched successfully",
      data: {
        total,
        pending,
        confirmed,
        completed,
        cancelled,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
