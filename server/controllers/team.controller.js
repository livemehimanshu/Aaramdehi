import { findAll, findByQuery, findById, create, updateById, deleteById } from "../config/db.js";
import { uploadImageCloudinary } from "../utils/uploadImageCloudinary.js";

const parseInteger = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

// Get all team members
export const getAllTeamMembers = async (req, res) => {
  try {
    const page = parseInteger(req.query.page, 1);
    const limit = parseInteger(req.query.limit, 10);
    const { isActive, designation } = req.query;

    let members = await findAll('team');

    if (isActive !== undefined) {
      const active = String(isActive).toLowerCase() === 'true';
      members = members.filter(member => Boolean(member.isActive) === active);
    }

    if (designation) {
      members = members.filter(member => member.designation === designation);
    }

    members = members.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = members.length;
    const startIndex = (page - 1) * limit;
    const paginated = members.slice(startIndex, startIndex + limit);

    return res.json({
      success: true,
      message: "Team members fetched successfully",
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

// Get team member by ID
export const getTeamMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await findById('team', id);

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

    const existingMember = await findByQuery('team', 'email', email.toLowerCase().trim());
    if (existingMember?.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    let profileImageUrl = "";
    let profileImagePublicId = "";

    if (req.file) {
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

    const member = await create('team', {
      firstName,
      lastName,
      email: email.toLowerCase().trim(),
      phone: phone || "",
      designation,
      department: department || "",
      profileImage: profileImageUrl || null,
      profileImagePublicId: profileImagePublicId || null,
      bio: bio || "",
      reportingTo: reportingTo || null,
      permissions: permissions || [],
      startDate: startDate || new Date().toISOString(),
      salary: salary || null,
      workingHours: workingHours || { startTime: "09:00", endTime: "17:00" },
      socialMedia: socialMedia || {},
      emergencyContact: emergencyContact || {},
      createdBy: req.userId || null,
      isActive: true,
    });

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

    const member = await findById('team', id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    const updatePayload = {};
    if (email && email.toLowerCase().trim() !== member.email) {
      const existingMember = await findByQuery('team', 'email', email.toLowerCase().trim());
      if (existingMember?.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
      updatePayload.email = email.toLowerCase().trim();
    }
    if (firstName) updatePayload.firstName = firstName;
    if (lastName) updatePayload.lastName = lastName;
    if (phone !== undefined) updatePayload.phone = phone;
    if (designation) updatePayload.designation = designation;
    if (department !== undefined) updatePayload.department = department;
    if (bio !== undefined) updatePayload.bio = bio;
    if (reportingTo !== undefined) updatePayload.reportingTo = reportingTo;
    if (permissions !== undefined) updatePayload.permissions = permissions;
    if (isActive !== undefined) updatePayload.isActive = isActive;
    if (salary !== undefined) updatePayload.salary = salary;
    if (workingHours !== undefined) updatePayload.workingHours = workingHours;
    if (socialMedia !== undefined) updatePayload.socialMedia = socialMedia;
    if (emergencyContact !== undefined) updatePayload.emergencyContact = emergencyContact;

    if (req.file) {
      const fileToUpload = req.file.buffer;
      if (!fileToUpload) {
        return res.status(400).json({ success: false, message: "Profile image file content is missing for update. Ensure Multer uses memoryStorage." });
      }

      const uploadResult = await uploadImageCloudinary(
        fileToUpload,
        "team_profiles"
      );
      updatePayload.profileImage = uploadResult.url;
      updatePayload.profileImagePublicId = uploadResult.public_id;
    }

    const updatedMember = await updateById('team', id, updatePayload);

    return res.json({
      success: true,
      message: "Team member updated successfully",
      data: updatedMember,
    });
  } catch (error) {
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
    const member = await findById('team', id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    await deleteById('team', id);

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
    const members = await findAll('team');
    const totalMembers = members.length;
    const activeMembers = members.filter(member => Boolean(member.isActive)).length;
    const inactiveMembers = members.filter(member => !Boolean(member.isActive)).length;

    const byDesignation = Object.values(members.reduce((acc, member) => {
      const key = member.designation || 'Unknown';
      acc[key] = acc[key] || { _id: key, count: 0 };
      acc[key].count += 1;
      return acc;
    }, {}));

    const byDepartment = Object.values(members.reduce((acc, member) => {
      const key = member.department || 'Unknown';
      acc[key] = acc[key] || { _id: key, count: 0 };
      acc[key].count += 1;
      return acc;
    }, {}));

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
