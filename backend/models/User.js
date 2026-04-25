'use strict';

/**
 * User model — JSON file backed.
 * Collection: data/users.json
 *
 * Schema:
 *   id, name, dob, age, gender, address, email, passwordHash, role, createdAt
 */

const { readCollection, writeCollection, nextId } = require('../config/db');

const COL = 'users';

const UserModel = {
  /** Return all users (passwordHash stripped). */
  findAll() {
    return readCollection(COL).map(safe);
  },

  /** Find by numeric id (includes passwordHash — for internal use only). */
  findById(id) {
    return readCollection(COL).find((u) => u.id === id) || null;
  },

  /** Find by email (includes passwordHash — for auth). */
  findByEmail(email) {
    return (
      readCollection(COL).find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      ) || null
    );
  },

  /**
   * Create a new user.
   * @param {{ name, dob, age, gender, address, email, passwordHash, role? }} data
   * @returns {object} Safe user (no hash)
   */
  create(data) {
    const users = readCollection(COL);

    const user = {
      id:           nextId(users),
      name:         (data.name || '').trim(),
      dob:          data.dob   || '',
      age:          data.age   || null,
      gender:       data.gender || '',
      address:      data.address || '',
      email:        (data.email || '').trim().toLowerCase(),
      passwordHash: data.passwordHash,
      role:         data.role || 'user',
      createdAt:    new Date().toISOString(),
    };

    users.push(user);
    writeCollection(COL, users);
    return safe(user);
  },

  /**
   * Update user fields by id.
   * @param {number} id
   * @param {object} updates
   * @returns {object|null} Safe user or null
   */
  update(id, updates) {
    const users = readCollection(COL);
    const idx   = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;

    // Never overwrite id or passwordHash via this method
    const { id: _1, passwordHash: _2, ...safe_updates } = updates;
    users[idx] = { ...users[idx], ...safe_updates };
    writeCollection(COL, users);
    return safe(users[idx]);
  },

  /** Delete a user by id. */
  remove(id) {
    const users = readCollection(COL).filter((u) => u.id !== id);
    writeCollection(COL, users);
  },
};

/** Strip passwordHash before returning to callers. */
function safe({ passwordHash: _ignored, ...rest }) {
  return rest;
}

module.exports = UserModel;
