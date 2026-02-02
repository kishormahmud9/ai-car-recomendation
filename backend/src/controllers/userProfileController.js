import { CloudinaryStorage } from "multer-storage-cloudinary";
import DevBuildError from "../lib/DevBuildError.js";
import { deleteAccountMail, passwordResetTemplate } from "../lib/emailTemplates.js";
import { sendEmail } from "../lib/mailer.js";
import User from "../models/User.js";
import Favorite from "../models/Favourite.js";
import Notification from "../models/Notification.js";
import Ticket from "../models/Ticket.js";
import Subscription from "../models/Subscription.js";
import Invoice from "../models/Invoice.js";
import Lead from "../models/Lead.js";
import OtpCode from "../models/OtpCode.js";
import Session from "../models/Session.js";
import UsageLog from "../models/UsageLog.js";
import AuditLog from "../models/AuditLog.js";
import Car from "../models/Car.js";
import bcrypt from "bcrypt";

// ✅ User profile Edit (Update)
export const editProfile = async (req, res, next) => {
  try {
    const user = req.user;
    // console.log("user", user);
    const { name, email, phone, image, dob, address } = req.body;

    const userProfile = await User.findById(user._id);
    if (!userProfile) {
      throw new DevBuildError("User not found", 404);
    }

    userProfile.name = name || user.name;
    userProfile.email = email || user.email;
    userProfile.phone = phone || user.phone;
    userProfile.image = image || user.image;
    userProfile.dob = dob || user.dob;
    userProfile.address = address || user.address;

    if (req.file && req.file.path) {
      userProfile.image = req.file.path; // Cloudinary URL
    }

    await userProfile.save();

    res.status(200).json({ message: "User updated successfully", userProfile });
  } catch (error) {
    next(error);
  }
};

// ✅ Reset Password
export const resetUserPassword = async (req, res, next) => {
  try {
    const { email } = req.user;
    const { newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new DevBuildError("User not found", 404);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Password Reset Successful",
      html: passwordResetTemplate(user.name),
    });

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};


// ✅ Delete User Account (Cascade Delete)
export const deleteUser = async (req, res, next) => {
  try {
    const { _id, email, name } = req.user;

    // 1. Delete all related records first
    const deleteTasks = [
      Favorite.deleteMany({ userId: _id }),
      Notification.deleteMany({ userId: _id }),
      Ticket.deleteMany({ userId: _id }),
      Subscription.deleteMany({ subscriberId: _id }),
      Invoice.deleteMany({ userId: _id }),
      Lead.deleteMany({ $or: [{ buyerId: _id }, { salesRepId: _id }] }),
      OtpCode.deleteMany({ userId: _id }),
      Session.deleteMany({ userId: _id }),
      UsageLog.deleteMany({ userId: _id }),
      Car.deleteMany({ sellerUserId: _id }),
      // Note: AuditLog is usually kept for security, but following "delete everything" request:
      AuditLog.deleteMany({ userId: _id })
    ];

    await Promise.all(deleteTasks);

    // 2. Delete the user itself
    const user = await User.findByIdAndDelete(_id);
    
    if (!user) {
      throw new DevBuildError("User not found", 404);
    }

    // 3. Send confirmation email
    await sendEmail({
      to: email,
      subject: "Your Account Has Been Deleted",
      html: deleteAccountMail(name),
    });

    res.status(200).json({ message: "Account and all related data deleted successfully" });
  } catch (error) {
    next(error);
  }
};