// Компонент кросс доменной авторизации.

// Принцип работы компонента похож на игру в ping pong.
// Он подключается на разных доменах - в основном и второстепенном(iframe) окнах и общается сам с собой.
// "Подаёт" всегда основное окно. Оно отправляет в iframe стартовое сообщение.
// Далее происходит обмен "ударами"(сообщениями), названия и данные которых зависят от данных о пользователях
// в разных окнах.
// "Побеждает" всегда второстепенное окно.
// Оно всегда отправляет последнее сообщение на загрузку модулей основного окна.

app.modules.crossDomainAuthBridge = (function(self) {
  var
    CLASS_NAMES = {
      iframe: 'cross-domain-auth-bridge js-cross-domain-auth-bridge'
    },
    MAIN_SCOPE_NAME = ':crossDomainAuthBridge',
    _$$authorizeUser = $.Deferred(),
    _$iframe;

  function _getActionTypeName(actionName) {
    return actionName + MAIN_SCOPE_NAME;
  }

  function _createAction(actionName, data) {
    return {
      type: _getActionTypeName(actionName),
      payload: data
    };
  }

  function _authorizeWithToken(token) {
    return $.post(app.config.ssoUsersSessionHandleSigninURL, {token: token});
  }

  function _getAuthToken() {
    return $.get(app.config.ssoUsersSessionRequestURL);
  }

  function _getTargetToPostMessage() {
    return _$iframe ? _$iframe[0].contentWindow : window.parent;
  }

  function _sendProviderMessage(actionName, data) {
    _getTargetToPostMessage().postMessage(_createAction(actionName, data), '*');

    return $.Deferred().resolve();
  }

  function _sendInitMessage() {
    app.config.isUserSigned ?
      _sendProviderMessage('checkUser:anotherDomain', {currentUser: app.config.currentUser}) :
      _sendProviderMessage('getAuthToken:anotherDomain');
  }

  function _isUserTheSame(incomingUserId) {
    return app.config.isUserSigned && app.config.currentUser.id === incomingUserId;
  }

  function _createIframe() {
    return $('<iframe>').addClass(CLASS_NAMES.iframe).attr({src: app.config.crossDomainIframe});
  }

  function _renderIframe($iframe) {
    return $iframe.appendTo('body');
  }

  function _createAndRenderIframe() {
    return _renderIframe(_createIframe());
  }

  function _resolveWithCompletionData(data) {
    return $.Deferred().resolve({crossdomainProcessCompleted: true, currentUser: data && data.currentUser});
  }

  function _goThroughRouter(data) {
    switch(data.type) {
      case _getActionTypeName('continueLoadModules:mainDomain'):
        return _resolveWithCompletionData(data.payload);

      case _getActionTypeName('getAuthToken:mainDomain'):
        return _getAuthToken().then(_onGetAuthToken.bind(null, 'anotherDomain'));

      case _getActionTypeName('sendAuthToken:mainDomain'):
        return _authorizeWithToken(data.payload);

      case _getActionTypeName('checkUser:anotherDomain'):
        return _isUserTheSame(data.payload.currentUser.id) ?
          _sendProviderMessage('continueLoadModules:mainDomain', {currentUser: data.payload.currentUser}) :
          _sendProviderMessage('getAuthToken:mainDomain');

      case _getActionTypeName('authorizeUser:anotherDomain'):
      case _getActionTypeName('authorizeUser:mainDomain'):
        return _authorizeWithToken(data.payload).then(
          _onAuthorizeUser.bind(null, _getActionTypeName('authorizeUser:mainDomain') === data.type)
        );

      case _getActionTypeName('getAuthToken:anotherDomain'):
        return app.config.isUserSigned ? _getAuthToken().then(_onGetAuthToken.bind(null, 'mainDomain')) :
          _sendProviderMessage('continueLoadModules:mainDomain');
    }
  }

  function _onAuthorizeUser(onMainDomain, data) {
    var currentUser = data.user;

    return onMainDomain ? _resolveWithCompletionData({currentUser: currentUser}) :
      _sendProviderMessage('continueLoadModules:mainDomain', {currentUser: currentUser});
  }

  function _onGetAuthToken(targetDomain, data) {
    return _sendProviderMessage('authorizeUser:' + targetDomain, data.token);
  }

  function _onGetMessage(event) {
    event.originalEvent.data.type && ~event.originalEvent.data.type.indexOf(MAIN_SCOPE_NAME) &&
      _goThroughRouter(event.originalEvent.data)
        .done(function(data) {
          if (!data || !data.crossdomainProcessCompleted) { return; }

          app.modules.userUtils.setConfigData(data.currentUser || {}, 'simple');
          _$$authorizeUser.resolve();
        });
  }

  function _onLoadIframe() {
    _listener();
    _sendInitMessage();
  }

  function _onAjaxSend(event, request, settings) {
    if (!settings.crossDomain) { return; }

    settings.xhrFields = {withCredentials: true};
    request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  }

  function _listener() {
    $(window).on('message', _onGetMessage);
    $(document).ajaxSend(_onAjaxSend);
  }

  function _authorizeUser() {
    if (_$iframe) {
      _sendInitMessage();
    } else {
      _$iframe = _createAndRenderIframe().one('load', _onLoadIframe);
    }

    return _$$authorizeUser;
  }

  self.authorizeUser = _authorizeUser;

  self.listenParentWindow = _listener;

  return self;
})(app.modules.crossDomainAuthBridge || {});
