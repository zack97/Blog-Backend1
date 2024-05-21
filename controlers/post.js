import pool from "../db.js";
import jwt from "jsonwebtoken";

export const getPosts = (req, res) => {
  let query = "SELECT * FROM posts";
  let values = [];

  if (req.query.cat) {
    query += " WHERE cat = $1";
    values.push(req.query.cat);
  }

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error("Error fetching posts:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    return res.status(200).json(result.rows);
  });
};

export const getPost = (req, res) => {
  const q = `
  SELECT p.id, u.username, p.title, p.description, p.img, p.cat, p.date
  FROM users u
  JOIN posts p ON u.id = p.uid
  WHERE p.id = $1
  `;

  pool.query(q, [req.params.id], (err, result) => {
    if (err) {
      console.error("Error fetching post:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    const post = result.rows[0];
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.status(200).json(post);
  });
};

//
export const addPost = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "zackKey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "INSERT INTO posts(title,description,img,cat,date,uid) VALUES(?)";

    const values = [
      req.body.title,
      req.body.description,
      req.body.img,
      req.body.cat,
      req.body.date,
      userInfo.id,
    ];

    pool.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.json("Post has been created");
    });
  });
};

export const deletePost = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "zackKey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const postId = req.params.id;
    const q = "DELETE FROM posts WHERE id=$1 AND uid=$2";
    pool.query(q, [postId, userInfo.id], (err, data) => {
      if (err) return res.status(500).json("Internal Server Error");

      if (data.rowCount === 0) {
        return res.status(403).json("You can delete only your post!");
      }

      return res.json("Post has been deleted!");
    });
  });
};

export const updatePost = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "zackKey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const postId = req.params.id;
    const q =
      "UPDATE posts SET title=?,description=?,img=?,cat=? WHERE id=? AND uid=?";

    const values = [
      req.body.title,
      req.body.description,
      req.body.img,
      req.body.cat,
      userInfo.id,
    ];

    pool.query(q, [...values, postId, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.json("Post has been updated");
    });
  });
};
