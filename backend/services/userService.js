'use strict';

/**
 * In-memory user store.
 * Replace these functions with real DB calls (e.g. Prisma / Mongoose / pg)
 * without touching any controller or route file.
 */
let users = [
  { id: 1, name: 'Alice Sharma',  email: 'alice@example.com',  role: 'admin'    },
  { id: 2, name: 'Bob Mehra',     email: 'bob@example.com',    role: 'user'     },
  { id: 3, name: 'Carol Iyer',    email: 'carol@example.com',  role: 'user'     },
];

let nextId = 4;

/** Return all users. */
const findAll = () => [...users];

/**
 * Find a user by ID.
 * @param {number} id
 * @returns {object|undefined}
 */
const findById = (id) => users.find((u) => u.id === id);

/**
 * Find a user by email.
 * @param {string} email
 * @returns {object|undefined}
 */
const findByEmail = (email) => users.find((u) => u.email.toLowerCase() === email.toLowerCase());

/**
 * Create a new user.
 * @param {{ name: string, email: string, role?: string }} payload
 * @returns {object} Created user
 * @throws {Error} If email is already taken
 */
const create = (payload) => {
  if (findByEmail(payload.email)) {
    const err = new Error(`Email "${payload.email}" is already in use.`);
    err.statusCode = 409;
    throw err;
  }

  const user = {
    id:    nextId++,
    name:  payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    role:  payload.role || 'user',
  };

  users.push(user);
  return user;
};

/**
 * Update an existing user.
 * @param {number}  id
 * @param {object}  updates - Partial fields to update
 * @returns {object} Updated user
 * @throws {Error}   If user not found
 */
const update = (id, updates) => {
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) {
    const err = new Error(`User with id ${id} not found.`);
    err.statusCode = 404;
    throw err;
  }

  // Disallow overwriting the id
  const { id: _ignored, ...safeUpdates } = updates;
  users[idx] = { ...users[idx], ...safeUpdates };
  return users[idx];
};

/**
 * Delete a user by ID.
 * @param {number} id
 * @throws {Error} If user not found
 */
const remove = (id) => {
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) {
    const err = new Error(`User with id ${id} not found.`);
    err.statusCode = 404;
    throw err;
  }
  users.splice(idx, 1);
};

module.exports = { findAll, findById, create, update, remove };
