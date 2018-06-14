// User API module

app.modules.userAPI = (function(self) {

  var applicationUtils = app.modules.applicationUtils;

  function _prepareDataToSignUser(signType, data) {
    var
      formData = new FormData(),
      KEY_NAME = signType === 'in' ? 'session' : 'user';

    data.withSID && $.extend(data, {sid: applicationUtils.generateUUID()});
    data.type && formData.append('type', data.type);

    (function _prepare(data, key) {
      Object.keys(data).forEach(function(item) {
        if (item === 'type') { return; }

        key = key + '[' + item + ']';

        if (typeof data[item] === 'object') {
          _prepare(data[item], key);
        } else {
          formData.append(key, data[item]);
          key = KEY_NAME;
        }
      });
    })(data, KEY_NAME);

    // For testing purposes
    formData.__test__ = data;

    return formData;
  }

  function _prepareURL(url, replaceHelper) {
    var placeholderToReplace = Object.keys(replaceHelper)[0];

    return url.replace('_' + placeholderToReplace + '_', replaceHelper[placeholderToReplace]);
  }

  function _getURLToSign(signType) {
    return signType === 'in' ? app.config.usersSessionURL : app.config.usersRegistrationURL;
  }

  function _signUser(signType, data) {
    return $.ajax({
      url: _getURLToSign(signType),
      method: 'POST',
      data: _prepareDataToSignUser(signType, data),
      processData: false,
      contentType: false,
    });
  }

  function _deleteSocialProvider(providerName) {
    app.modules.userUtils.validateProviderName(providerName);

    return $.ajax({
      url: _prepareURL(app.config.api.userSocialProviderURL, {provider: providerName}),
      method: 'DELETE',
    });
  }

  function _listenSocialRegistrationProcess(url) {
    applicationUtils.invariant(
      typeof url === 'string',
      'url should be a string, instead %s was passed',
      url
    );

    return app.modules.applicationUtils.listenProcess({url: url});
  }

  function _signIn(data) {
    applicationUtils.validateOnObjectType(data);

    return _signUser('in', data);
  }

  function _signUp(data) {
    applicationUtils.validateOnObjectType(data);

    return _signUser('up', data);
  }

  return $.extend(self, {
    deleteSocialProvider: _deleteSocialProvider,
    listenSocialRegistrationProcess: _listenSocialRegistrationProcess,
    signIn: _signIn,
    signUp: _signUp,
  });

})(app.modules.userAPI || {});
