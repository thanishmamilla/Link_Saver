import express from 'express';
import jwt from 'jsonwebtoken';
import Bookmark from '../models/Bookmark.js';
import fetch from 'node-fetch';

const router = express.Router();

// Auth middleware
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token' });
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Get all bookmarks for user
router.get('/', auth, async (req, res) => {
  const bookmarks = await Bookmark.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(bookmarks);
});

// Add a bookmark
router.post('/', auth, async (req, res) => {
  const { url } = req.body;
  try {
    // Fetch title and favicon
    const meta = await fetchMeta(url);
    // Fetch summary
    const summary = await fetchSummary(url);
    const bookmark = await Bookmark.create({
      user: req.userId,
      url,
      title: meta.title,
      favicon: meta.favicon,
      summary,
    });
    res.status(201).json(bookmark);
  } catch (err) {
    res.status(500).json({ message: 'Error saving bookmark' });
  }
});

// Delete a bookmark
router.delete('/:id', auth, async (req, res) => {
  await Bookmark.deleteOne({ _id: req.params.id, user: req.userId });
  res.json({ message: 'Deleted' });
});

// --- Helpers ---
async function fetchMeta(url) {
  // Simple fetch for title and favicon (can be improved)
  try {
    const res = await fetch(url);
    const html = await res.text();
    const title = html.match(/<title>(.*?)<\/title>/i)?.[1] || url;
    const favicon = url + '/favicon.ico';
    return { title, favicon };
  } catch {
    return { title: url, favicon: '' };
  }
}

async function fetchSummary(url) {
  try {
    const target = encodeURIComponent(url);
    console.log('Jina fetchSummary:', { url, target, apiUrl: `https://r.jina.ai/${target}` });
    const res = await fetch(`https://r.jina.ai/${target}`);
    return await res.text();
  } catch {
    return 'Summary temporarily unavailable.';
  }
}

export default router; 