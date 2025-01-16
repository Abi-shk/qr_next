import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  console.log("Handler called with method:", req.method); // Debugging: log the method type
  const client = await clientPromise;
  console.log("Connected to MongoDB client."); // Debugging: confirm connection

  const db = client.db("qr_scanner");
  const collection = db.collection("user");
  console.log("Database and collection initialized."); // Debugging: confirm DB and collection setup

  if (req.method === "POST") {
    console.log("Processing POST request."); // Debugging: confirm POST method
    const { email, validate } = req.body; // Extract email and validate
    console.log("Received body:", req.body); // Debugging: log request body

    if (!email) {
      console.log("Email is missing in the request."); // Debugging: missing email
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });
    }

    try {
      console.log("Searching for user with email:", email); // Debugging: log email search
      const user = await collection.findOne({ email });

      if (!user) {
        console.log("No user found with email:", email); // Debugging: log if user not found
        return res
          .status(404)
          .json({ success: false, message: "No user found with this email." });
      }

      console.log("User found:", user); // Debugging: log the found user

      if (validate) {
        console.log("Validation requested for user with email:", email); // Debugging: log validation request
        await collection.updateOne(
          { email },
          { $set: { validated: true } }
        );
        console.log("User validated successfully."); // Debugging: log validation success
        return res.status(200).json({
          success: true,
          message: `User with email ${email} validated successfully.`,
        });
      }

      console.log("Returning user data without validation."); // Debugging: no validation, returning data
      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      console.error("Error handling request:", error); // Debugging: log error
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  } else {
    console.log("Invalid method received:", req.method); // Debugging: log invalid method
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}