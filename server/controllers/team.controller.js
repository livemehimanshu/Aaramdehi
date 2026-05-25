import Team from "../models/team.model.js";
import { uploadImageCloudinary } from "../utils/uploadImageCloudinary.js";

// Get all team members
export const getAllTeamMembers = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive, designation } = req.query;
    let filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    if (designation) {
      filter.designation = designation;
    }

    const skip = (page - 1) * limit;
    const members = await Team.find(filter)
      .populate("reportingTo", "firstName lastName email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Team.countDocuments(filter);

    return res.json({
      success: true,
      message: "Team members fetched successfully",
      data: members,
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

// Get team member by ID
export const getTeamMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Team.findById(id)
      .populate("reportingTo")
      .populate("createdBy", "name email");

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    return res.json({
      success: true,
      message: "Team member fetched successfully",
      data: member,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create team member
export const createTeamMember = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      designation,
      department,
      bio,
      reportingTo,
      permissions,
      startDate,
      salary,
      workingHours,
      socialMedia,
      emergencyContact,
    } = req.body;

    if (!firstName || !lastName || !email || !designation) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    // Check if email already exists
    const existingMember = await Team.findOne({ email });
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    let profileImageUrl = "";
    let profileImagePublicId = "";

    if (req.file) {
      // ✅ FIX: req.file.buffer pass karein, req.file.path nahi
      const fileToUpload = req.file.buffer; 
      if (!fileToUpload) {
        return res.status(400).json({ success: false, message: "Profile image file content is missing. Ensure Multer uses memoryStorage." });
      }

      const uploadResult = await uploadImageCloudinary(
        fileToUpload,
        "team_profiles"
      );
      // ✅ FIX: secure_url ki jagah url property use karein
      profileImageUrl = uploadResult.url;
      profileImagePublicId = uploadResult.public_id;
    }

    const member = new Team({
      firstName,
      lastName,
      email,
      phone: phone || "",
      designation,
      department: department || "",
      profileImage: profileImageUrl || null,
      profileImagePublicId: profileImagePublicId || null,
      bio: bio || "",
      reportingTo: reportingTo || null,
      permissions: permissions || [],
      startDate: startDate || new Date(),
      salary: salary || null,
      workingHours: workingHours || { startTime: "09:00", endTime: "17:00" },
      socialMedia: socialMedia || {},
      emergencyContact: emergencyContact || {},
      createdBy: req.user.id,
      // ✅ FIX: createdBy ko robust banayein
      createdBy: req.user?._id || req.user?.id || req.userId,
      isActive: true,
    });

    await member.save();

    return res.status(201).json({
      success: true,
      message: "Team member created successfully",
      data: member,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update team member
export const updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      designation,
      department,
      bio,
      reportingTo,
      permissions,
      isActive,
      salary,
      workingHours,
      socialMedia,
      emergencyContact,
    } = req.body;

    const member = await Team.findById(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    if (email && email !== member.email) {
      const existingMember = await Team.findOne({ email });
      if (existingMember) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
      member.email = email;
    }

    if (firstName) member.firstName = firstName;
    if (lastName) member.lastName = lastName;
    if (phone !== undefined) member.phone = phone;
    if (designation) member.designation = designation;
    if (department !== undefined) member.department = department;
    if (bio !== undefined) member.bio = bio;
    if (reportingTo !== undefined) member.reportingTo = reportingTo;
    if (permissions) member.permissions = permissions;
    if (isActive !== undefined) member.isActive = isActive;
    if (salary !== undefined) member.salary = salary;
    if (workingHours) member.workingHours = workingHours;
    if (socialMedia) member.socialMedia = socialMedia;
    if (emergencyContact) member.emergencyContact = emergencyContact;

    if (req.file) {
      // ✅ FIX: req.file.buffer pass karein, req.file.path nahi
      const fileToUpload = req.file.buffer;
      if (!fileToUpload) {
        return res.status(400).json({ success: false, message: "Profile image file content is missing for update. Ensure Multer uses memoryStorage." });
      }

      const uploadResult = await uploadImageCloudinary(
        fileToUpload,
        "team_profiles"
      );
      // ✅ FIX: secure_url ki jagah url property use karein
      member.profileImage = uploadResult.url;
      member.profileImagePublicId = uploadResult.public_id;
    }

    await member.save();

    return res.json({
      success: true,
      message: "Team member updated successfully",
      data: member,
    });
  } catch (error) {
    // ✅ FIX: Detailed error message
    console.error("🔥 updateTeamMember Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete team member
export const deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Team.findByIdAndDelete(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    return res.json({
      success: true,
      message: "Team member deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get team stats
export const getTeamStats = async (req, res) => {
  try {
    const totalMembers = await Team.countDocuments();
    const activeMembers = await Team.countDocuments({ isActive: true });
    const inactiveMembers = await Team.countDocuments({ isActive: false });

    const byDesignation = await Team.aggregate([
      {
        $group: {
          _id: "$designation",
          count: { $sum: 1 },
        },
      },
    ]);

    const byDepartment = await Team.aggregate([
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
        },
      },
    ]);

    return res.json({
      success: true,
      message: "Team stats fetched successfully",
      data: {
        totalMembers,
        activeMembers,
        inactiveMembers,
        byDesignation,
        byDepartment,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
