import express from "express";
import Community from "../models/Community.js";
import { callGroq } from "../services/groqService.js";

const router = express.Router();

// Moderation Prompt
const MODERATION_PROMPT = `You are a strict MODERATOR for an English Learning Community.
Your task is to determine if the user's text is a USEFUL LEARNING TEMPLATE or FRAMEWORK (shablon) for CEFR/IELTS Writing or Speaking.

Criteria for ACCEPTANCE (YES):
- It contains a structure/template for an essay, email, or letter.
- It provides a list of useful phrases/vocabulary for a specific topic.
- It is a framework for answering speaking questions.
- It is high-quality educational content.

Criteria for REJECTION (NO):
- It is a casual chat message like "Hello", "How are you", "Check this out".
- It is just a question without a template.
- It is random gibberish or non-educational content.
- It is an advertisement or spam.

Respond in strict JSON format:
{
  "approved": boolean,
  "reason": "short explanation in English"
}`;

router.post("/post", async (req, res) => {
  try {
    const { author, authorEmail, title, content, category } = req.body;
    if (!content || content.length < 20) return res.status(400).json({ error: "Post too short." });

    const aiRes = await callGroq({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: MODERATION_PROMPT },
        { role: "user", content: `Title: ${title}\nContent: ${content}` }
      ],
      response_format: { type: "json_object" }
    });

    const moderation = JSON.parse(aiRes.choices[0].message.content);

    if (!moderation.approved) {
      return res.status(400).json({ 
        error: "Rejected by AI Moderator.", 
        reason: moderation.reason || "This message is not an educational template." 
      });
    }

    const newPost = new Community({
      author, authorEmail, title, content, category,
      aiApproved: true
    });

    await newPost.save();
    res.json({ success: true, post: newPost });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during moderation." });
  }
});

router.get("/posts", async (req, res) => {
  try {
    const posts = await Community.find({ aiApproved: true }).sort({ date: -1 }).limit(50);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/like", async (req, res) => {
  try {
    const { postId, email } = req.body;
    const post = await Community.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.likes.includes(email)) {
      post.likes = post.likes.filter(e => e !== email);
    } else {
      post.likes.push(email);
    }
    await post.save();
    res.json({ success: true, likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit Post
router.put("/edit/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const { authorEmail, title, content, category } = req.body;

    const post = await Community.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Ownership check
    if (post.authorEmail !== authorEmail) {
      return res.status(403).json({ error: "Unauthorized to edit this post." });
    }

    // Moderation again for edited content
    const aiRes = await callGroq({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: MODERATION_PROMPT },
        { role: "user", content: `Title: ${title}\nContent: ${content}` }
      ],
      response_format: { type: "json_object" }
    });

    const moderation = JSON.parse(aiRes.choices[0].message.content);

    if (!moderation.approved) {
      return res.status(400).json({ 
        error: "Rejected by AI Moderator.", 
        reason: moderation.reason || "This edited message is not an educational template." 
      });
    }

    // Update fields
    post.title = title;
    post.content = content;
    post.category = category;
    post.date = Date.now(); // Update timestamp on edit? Optional, but often useful.

    await post.save();
    res.json({ success: true, post });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during post edit." });
  }
});

// Delete Post
router.delete("/delete/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const { authorEmail } = req.body; // Sent in body or headers, here body is easier for ownership check

    const post = await Community.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Ownership check
    if (post.authorEmail !== authorEmail) {
      return res.status(403).json({ error: "Unauthorized to delete this post." });
    }

    await Community.findByIdAndDelete(postId);
    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during post deletion." });
  }
});

// Increment View
router.post("/view/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    await Community.findByIdAndUpdate(postId, { $inc: { views: 1 } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
