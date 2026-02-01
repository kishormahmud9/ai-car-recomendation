import User from "../models/User.js";

// ✅ Get User favorites
export const getUserFavorites = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).populate({
      path: "favorites",
      populate: {
        path: "carId",
        model: "Car",
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
