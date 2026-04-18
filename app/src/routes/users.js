const express = require('express');
const router = express.Router();

// In-memory store (demo purposes — swap with DB in production)
let users = [
  { id: 1, name: 'Alice Dev', role: 'engineer' },
  { id: 2, name: 'Bob Ops', role: 'devops' },
];
let nextId = 3;

// GET /api/users
router.get('/', (req, res) => {
  res.json({ data: users, total: users.length });
});

// GET /api/users/:id
router.get('/:id', (req, res, next) => {
  const user = users.find((u) => u.id === Number(req.params.id));
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    return next(err);
  }
  res.json({ data: user });
});

// POST /api/users
router.post('/', (req, res, next) => {
  const { name, role } = req.body;
  if (!name || !role) {
    const err = new Error('name and role are required');
    err.status = 400;
    return next(err);
  }
  const user = { id: nextId++, name, role };
  users.push(user);
  res.status(201).json({ data: user });
});

// DELETE /api/users/:id
router.delete('/:id', (req, res, next) => {
  const index = users.findIndex((u) => u.id === Number(req.params.id));
  if (index === -1) {
    const err = new Error('User not found');
    err.status = 404;
    return next(err);
  }
  users.splice(index, 1);
  res.status(204).send();
});

// Expose reset for tests
router.resetStore = () => {
  users = [
    { id: 1, name: 'Alice Dev', role: 'engineer' },
    { id: 2, name: 'Bob Ops', role: 'devops' },
  ];
  nextId = 3;
};

module.exports = router;
