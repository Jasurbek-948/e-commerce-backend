const mongoose = require('mongoose');

const operatorSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, unique: true, sparse: true, trim: true },
  username: { type: String, unique: true, required: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('Operator', operatorSchema);