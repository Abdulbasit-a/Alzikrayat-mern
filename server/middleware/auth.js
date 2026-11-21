// Basic authentication middleware (Project 3 scope)
//
// The client sends the logged-in user's id in the "x-user-id" header. The server
// NEVER trusts profile data from the client: it loads the user from MongoDB and
// attaches that document to req.user, so ownership checks use database values.
//
// NOTE: this is "basic" authentication as required by the specification. The id
// is not a secret, so this does not stop a determined attacker. Stateless JWT
// tokens are the proper upgrade (optional Bonus Project 4).

const mongoose = require('mongoose');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: 'يجب تسجيل الدخول أولاً.',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = auth;
