const express = require('express');
const Repo = require('../models/Repo');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', async (req, res) => {
  const { name, description } = req.body;
  const owner = req.user._id;
  try {
    const repo = new Repo({ name, description, owner });
    await repo.save();
    res.status(201).json({ message: 'Repository created' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
