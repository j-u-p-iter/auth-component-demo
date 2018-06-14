//= require ./models
//= require_tree ./test_data

function Database() {
  this.users = users;
  this.contacts = contacts;
}

Database.prototype = {
  findUserByArgs: function(data) {
    return this.users.filter(function(user) {
      return !!Object.keys(data)
        .filter(function(key) { return !!User.Schema[key]; })
        .reduce(function(user, currentKey) {
          var isSearchingUser = user ? user[currentKey] === data[currentKey] : false;

          return isSearchingUser ? user : null;
        }, user);
    });
  },
  findUserByPhoneInContacts: function(phone) {
    var searchingContact = this.contacts.filter(function(contact) { return phone === contact.phone; })[0];

    return searchingContact ? this.findUserByArgs({id: searchingContact.userID}) : [];
  },
  findUser: function(data) {
    return {
      users: data.contacts ? this.findUserByPhoneInContacts(data.contacts) : this.findUserByArgs(data)
    };
  },
  saveUser: function(data) {
    var user = new User(
      $.extend({}, data, {id: this.users.length + 1})
    );

    this.users.push(user);

    return {user: user};
  },
};
