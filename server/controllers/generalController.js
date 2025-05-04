import User from '../models/userSchema.js';

export const getUser = async (req, res) => {
  try {
    console.log("Request received at /user/:id endpoint"); // Log for route hit

    // Log the incoming request parameters
    console.log("Request Params:", req.params);

    const { id } = req.params; // Correct usage of req.params
    if (!id) {
      console.error("User ID is missing in the request"); // Log error
      throw new Error("User ID is required");
    }

    console.log("User ID received:", id); // Log the ID being used

    // Attempt to fetch the user by ID
    const user = await User.findById(id);

    if (!user) {
      console.warn(`No user found with ID: ${id}`); // Warn if user not found
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    console.log("User found:", user); // Log the user data
    res.status(200).json({
      status: true,
      message: "User data sent successfully",
      user: user,
    });
  } catch (error) {
    console.error("Error in getUser function:", error.message); // Log the error message
    res.status(404).json({
      status: false,
      message: error.message,
    });
  }
};


