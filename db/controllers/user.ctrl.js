const User = require('../models/User');

export default (success, failure) => ({

  clear: () => User.remove({}).then((err, users) => {
    return ({err, users});
  }),

  getUsers: () => {
    User.find().then((err, users) => {
      console.log('users', users);
      if (err) {
        return failure(err);
      } else if (!users) {
        return failure([]);
      } else {
        return success(users);
      }
    });
  },

  getUserById: id => User.findById(id)
    .then((err, user) => {
      if (err) {
        failure(err);
      } else if (!user) {
        failure(null);
      } else {
        success(user);
      }
  }),

  getUserByIp: ip_address => User
    .find({ ip_address })
    .then((users, err) => {
      if (err) {
        return failure(err);
      } else if (users.length === 0) {
        return failure([]);
      } else {
        return success(users[0]);
      }
  }),

  insertUser: params => new User(params)
    .save((err, newUser) => {
      if (err) {
        return failure(err);
      } else if (!newUser) {
        return failure(null);
      } else {
        return success(newUser);
      }
  }),

  updateUser: (id, params) => User
    .findOneAndUpdate({ _id: id }, {$set: params})
    .then((user, err) => {
      console.log('update', user, err);
      if (err) {
        failure(err);
      } else if (!user) {
        failure(null);
      } else {
        success(user);
      }
  }),

  getExpiredUsers: monthAgo => User.find({
    last_update : {
      $lt: monthAgo
    }}).then((users, err) => {
      if (err) {
        return failure(err);
      } else if (users.length === 0) {
        return failure([]);
      } else {
        return success(users);
      }
  }),

});
