// Component for authorization with social networks

//= require_tree ../../../templates/clearance/social_networks_auth_component

app.modules.socialNetworksAuthComponent = (function(self) {

  var
    SELECTORS = {
      component: '.js-social-networks-auth-component',
      providerItem: '.js-provider-item',
      providerItemLink: '.js-provider-item-link',
      deleteProviderItem: '.js-delete-provider-item',
      flashMessageBody: '.js-social-networks-auth-component-flash-message-body',
    },
    CLASS_NAMES = {
      deletionInProcess: 'social-networks-auth-component-provider-item-deletion',
      loading: 'loading',
    },
    TEMPLATE_NAMES = {
      body: 'body',
      providerItem: 'provider_item',
    },
    TEMPLATES_PATH = 'clearance/social_networks_auth_component',
    PROVIDER_NAME_SCOPE_NAME = 'providerName',
    applicationUtils = app.modules.applicationUtils,
    _default = {
      type: 'extended',
      onSuccess: function() {},
      onError: function() {},
      newSchema: false,
    },
    _processID, _windowCloseEventListener, _componentData, _socialRegWindow;

  function _getTemplatePath(templateName) {
    return TEMPLATES_PATH + '/' + templateName;
  }

  function _getComponentPart(partName, data) {
    return $(HandlebarsTemplates[_getTemplatePath(partName)](data));
  }

  function _getProviderData(providerName) {
    return {providerData: _getProviderDataByName(providerName)};
  }

  function _getProviderName($providerItem) {
    return $providerItem.data(PROVIDER_NAME_SCOPE_NAME);
  }

  function _getProviderDataByName(name) {
    return _componentData.providers.filter(function(providerData) {
      return providerData.name === name;
    })[0];
  }

  function _prepareComponentData(containerData, renderData) {
    return $.extend(
      true,
      {},
      _default,
      containerData,
      renderData,
      {providers: _prepareProvidersData(containerData.providers, renderData)}
    );
  }

  /**
   * Prepare data in such format:
   *
   * {
   *   [providerName: String]: {
   *     name: String,
   *     currentUserSocialNetworkUID: String,
   *     locales: Object
   *   }
   * }
   **/

  function _prepareProvidersData(providersData, renderData) {
    var baseURL = renderData && renderData.newSchema ?
      app.config.newOmniauthAuthorizeURL : app.config.omniauthAuthorizeURL;

    return app.config.socialNetworkProviders.map(function(providerName) {
      return {
        name: providerName,
        omniauthAuthorizeURL: baseURL.replace('_provider_', providerName),
        currentUserSocialNetworkUID: app.modules.userUtils.getCurrentUserSocialNetworkUID(providerName),
        locales: providersData && providersData[providerName] && providersData[providerName].locales,
      };
    });
  }

  function _cacheComponentData(data) {
    _componentData = data;
  }

  function _updateProvidersData(providerName, data) {
    _componentData.providers = _componentData.providers.map(function(providerData) {
      return providerData.name === providerName ? $.extend(true, {}, providerData, data) : providerData;
    });
  }

  function _renderComponent($target) {
    return $target.html(_getComponentPart(TEMPLATE_NAMES.body, _componentData))
      .find(SELECTORS.component).data({props: _componentData});
  }

  function _renderProviderItem($target, data) {
    return $target.replaceWith(_getComponentPart(TEMPLATE_NAMES.providerItem, data));
  }

  function _listenUsersMerge() {
    return applicationUtils.listenProcess({
      url: app.config.jobStatusURL,
      pid: app.config.socialNetworksAuth.mergeUsersJobID,
    });
  }

  function _removeSpinner($container) {
    return $container.removeClass(CLASS_NAMES.loading);
  }

  function _openSocialRegWindow(url) {
    _socialRegWindow = window.open(url);
  }

  function _generateUUID() {
    _processID = app.modules.applicationUtils.generateUUID();

    return _processID;
  }

  function _getWindowURL(baseURL) {
    return baseURL + '?oauth_id=' + _generateUUID();
  }

  function _onDeleteProviderWithSuccess($providerItem) {
    var providerName = _getProviderName($providerItem),

    dataToUpdate = {currentUserSocialNetworkUID: null};

    _updateProvidersData(providerName, dataToUpdate);

    _renderProviderItem($providerItem, _getProviderData(providerName));
  }

  function _onClickDeleteProviderItem() {
    var $providerItem = $(this).closest(SELECTORS.providerItem);

    $providerItem.addClass(CLASS_NAMES.deletionInProcess);

    app.modules.userAPI.deleteSocialProvider(_getProviderName($providerItem))
      .then(_onDeleteProviderWithSuccess.bind(null, $providerItem));
  }

  function _onClickProviderItemLink(event) {
    // This is temporary condition, until we
    // implement the new authorization schema everywhere
    if (!_componentData.newSchema) { return; }

    event.preventDefault();

    if (_socialRegWindow) {
      _removeWindowCloseEventListener();
      _socialRegWindow.close();
    }

    _openSocialRegWindow(_getWindowURL($(this).attr('href')));
    _addWindowCloseEventListener(_onCloseWindow);
  }

  function _toggleErrorFlashMessage(message) {
    var shouldFlashMessageBeVisible = !!message;

    $(SELECTORS.flashMessageBody)
      .toggle(shouldFlashMessageBeVisible)
      .toggleClass('with-error', shouldFlashMessageBeVisible)
      .html($('<span>').text(message));
  }

  function _onListenUsersMerge() {
    return _listenUsersMerge().then(_onMergeUsersWithSuccess);
  }

  function _onCloseWindow() {
    app.modules.userAPI.listenSocialRegistrationProcess(app.config.api.oauthStateURL.replace('_oauth_id_', _processID))
      .then(_onRegistrationWithSuccess, _onRegistrationWithError);
  }

  function _onRegistrationWithSuccess(data) {
    app.modules.userUtils.signIn({'perishable_token': data.user['perishable_token']})
      .then(function() {
        _toggleErrorFlashMessage();
        _componentData.onSuccess(data);
      });
  }

  function _onRegistrationWithError(error) {
    if (error.message !== 'not_found') {
      _toggleErrorFlashMessage(error.message);
    }

    _componentData.onError(error);
  }

  function _onAuthorizeUserWithSuccess() {
    applicationUtils.setLocationHref(app.config.socialNetworksAuth.redirectURL);
  }

  function _onMergeUsersWithSuccess(data) {
    return app.modules.userUtils.signIn(data).then(_onAuthorizeUserWithSuccess);
  }

  function _onRenderComponent(event, renderData) {
    var $container = $(event.target);

    _cacheComponentData(_prepareComponentData($container.data(), renderData));

    _listener(_renderComponent(_removeSpinner($container)));
  }

  function _addWindowCloseEventListener(onCloseWindow) {
    _windowCloseEventListener = setInterval(function() {
      if (_socialRegWindow.closed) {
        onCloseWindow();
        _removeWindowCloseEventListener();
      }
    }, 1000);
  }

  function _removeWindowCloseEventListener() {
    clearInterval(_windowCloseEventListener);
  }

  function _listener($component) {
    $component
      .on('click', SELECTORS.providerItemLink, _onClickProviderItemLink)
      .on('click', SELECTORS.deleteProviderItem, _onClickDeleteProviderItem);
  }

  function _commonListener() {
    $doc.on('render:socialNetworksAuthComponent', _onRenderComponent);
  }

  return $.extend(self, {
    load: _commonListener,
    listenUsersMerge: _onListenUsersMerge,
    reset: function() {
      clearInterval(_windowCloseEventListener);
      _processID = null;
      _componentData = null;
      _socialRegWindow = null;
    },
  });

})(app.modules.socialNetworksAuthComponent || {});
