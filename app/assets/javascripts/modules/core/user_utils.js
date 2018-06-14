// User Utils module

app.modules.userUtils = (function(self) {

  function _validateProviderName(providerName) {
    app.modules.applicationUtils.invariant(
      typeof providerName === 'string',
      'providerName should be a string, instead %s was passed.',
      providerName
    );

    app.modules.applicationUtils.invariant(
      ~app.config.socialNetworkProviders.indexOf(providerName),
      'providerName should be in this range: ' + app.config.socialNetworkProviders.join(', ') +
        ' instead %s was given',
      providerName
    );
  }

  function _getCurrentUserSocialNetworkUID(providerName) {
    self.validateProviderName(providerName);

    return app.config.currentUser[providerName + 'UID'];
  }

  function _isSignedBySID() {
    return app.config.currentUser.primaryProvider === 'sid';
  }

  function _getUserAttribute(attributeOrAttributes, user) {
    user = user || app.config.currentUser;

    if (Array.isArray(attributeOrAttributes)) {
      return attributeOrAttributes.reduce(function(userData, attribute, index) {
        if (typeof userData === 'string') { return userData; }

        if (index === attributeOrAttributes.length - 1) { return userData[attribute] || null; }

        return userData[attribute] || userData;
      }, user);
    } else {
      return user[attributeOrAttributes] || null;
    }
  }

  // User object on client has attribute "primaryProvider"
  // User object came from server has attribute "primary_provider"
  function _getUserPrimaryProvider(user) {
    return _getUserAttribute(['primaryProvider', 'primary_provider'], user);
  }

  function _setConfigWithObjectEventListener(user) {
    appEL
      .set('app.config.currentUser.id', user.id)
      .set('app.config.currentUser.sid', _getUserAttribute('sid', user))
      .set('app.config.currentUser.email', _getUserAttribute('email', user))
      .set('app.config.currentUser.phone', _getUserAttribute('phone', user))
      .set('app.config.currentUser.primaryProvider', _getUserPrimaryProvider(user));
  }

  function _setConfigExplicitly(user) {
    $.extend(true, app.config, {
      currentUser: {
        id: user.id,
        sid: _getUserAttribute('sid', user),
        email: _getUserAttribute('email', user),
        phone: _getUserAttribute('phone', user),
        primaryProvider: _getUserPrimaryProvider(user),
      },
    });
  }

  function _setConfigData(userData, type) {
    app.config.isUserSigned = !!userData.id;

    !appEL || type === 'simple' ? _setConfigExplicitly(userData) : _setConfigWithObjectEventListener(userData);
  }

  function _sign(signType, data) {
    return app.modules.userAPI['sign' + signType](data).then(function(data) {
      _setConfigData(data.user);

      return data;
    });
  }

  return $.extend(self, {
    getCurrentUserSocialNetworkUID: _getCurrentUserSocialNetworkUID,
    validateProviderName: _validateProviderName,
    isSignedBySID: _isSignedBySID,
    setConfigData: _setConfigData,
    getUserAttribute: _getUserAttribute,
    signUp: _sign.bind(null, 'Up'),
    signIn: _sign.bind(null, 'In'),
  });

})(app.modules.userUtils || {});
