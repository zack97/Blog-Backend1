import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    // Check if user already exists
    const checkQuery = "SELECT * FROM users WHERE email = $1 OR username = $2";
    const checkValues = [req.body.email, req.body.username];
    const existingUser = await pool.query(checkQuery, checkValues);

    if (existingUser.rows.length > 0) {
      return res.status(409).json("User already exists");
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const insertQuery =
      "INSERT INTO users(username, email, password) VALUES($1, $2, $3)";
    const insertValues = [req.body.username, req.body.email, hashedPassword];
    await pool.query(insertQuery, insertValues);

    return res.status(200).json("User has been created.");
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json("Internal server error");
  }
};

export const login = async (req, res) => {
  try {
    const { username } = req.body;

    const userQuery = "SELECT * FROM users WHERE username = $1";
    const userData = await pool.query(userQuery, [username]);

    if (userData.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userData.rows[0];

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ id: user.id }, "zackKey");
    const { password, ...other } = user;

    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({ message: "Login successful", other, token });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const logout = async (req, res) => {
  res
    .clearCookie("access_token", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .json("User has been logged out.");
};
