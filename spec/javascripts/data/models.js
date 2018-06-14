function User(data) {
  this.id = data.id;
  this.email = data.email;
  this.phone = data.phone;
  this.password = data.password;
  this.profile = data['profile_attributes'] && {
    name: data['profile_attributes'].name
  };
}

User.Schema = {
  id: Number,
  email: String,
  phone: String,
  password: String,
  profile: {
    name: String,
  },
};
