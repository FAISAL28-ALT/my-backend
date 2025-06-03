const mongoose = require('mongoose');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        return emailRegex.test(email);
      },
      message: 'Please provide a valid email address'
    }
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    minlength: [10, 'Message must be at least 10 characters'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  }
}, { 
  timestamps: true,
 
  indexes: [
    { email: 1 },
    { createdAt: -1 }
  ]
});
contactSchema.pre('save', function(next) {
  this.name = this.name.replace(/[<>]/g, ''); 
  this.message = this.message.replace(/[<>]/g, ''); 
  next();
});
contactSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    message: this.message,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};
contactSchema.statics.findRecent = function(limit = 10) {
  return this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-__v');
};
module.exports = mongoose.model('Contact', contactSchema);