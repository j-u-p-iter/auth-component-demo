/**
 * Модуль для инициализации статичного авторизационного компонента.
 *
 * Это обёртка над авторизационным компонентом, предназначенная сделать показ
 * статического авторизационного компонента простым и универсальным процессом.
 *
 * Документация: [скоро появится].
 *
 */

app.modules.staticAuthComponent = (function(self) {

  var
    SELECTORS = {
      component: '.js-static-${type}-auth-component'
    },
    REQUIRED_USER_INFO = {
      email: 'email',
      phone: 'phone',
      phoneAndEmail: 'phone&email',
      sid: 'sid',
    },
    USER_DATA_TYPES = {
      email: 'email',
      phone: 'phone',
      sid: 'sid',
    },
    _cache = [],
    _defaultConfig = {
      requiredUserInfo: 'email',
      cache: true,
    },
    applicationUtils = app.modules.applicationUtils,
    _componentConfigs;

  function _getComponentContainer(type) {
    return $(SELECTORS.component.replace('${type}', type));
  }

  function _getComponentConfigs() {
    return applicationUtils.getFromObjectByPath(
      'authComponent.wrappers.static',
      app.config
    );
  }

  function _getComponentTypes() {
    applicationUtils.invariant(
      applicationUtils.isPlainObject(_componentConfigs),
      'The value of component config should be a plain object.'
    );

    return Object.keys(_componentConfigs);
  }

  function _cacheComponentType(type) {
    _cache.push(type);
  }

  function _doesWeHaveAllRequiredUserInfo(requiredUserInfo) {
    var
      currentUser = app.config.currentUser,
      doesCurrentUserHaveData = app.modules.authComponentUtils.doesCurrentUserHaveData;

    if (!currentUser) { return false; }

    switch(requiredUserInfo) {
      case REQUIRED_USER_INFO.email:
        return doesCurrentUserHaveData(USER_DATA_TYPES.email);
      case REQUIRED_USER_INFO.phone:
        return doesCurrentUserHaveData(USER_DATA_TYPES.phone);
      case REQUIRED_USER_INFO.sid:
        return doesCurrentUserHaveData(USER_DATA_TYPES.sid);
      case REQUIRED_USER_INFO.phoneAndEmail:
        return doesCurrentUserHaveData([USER_DATA_TYPES.phone, USER_DATA_TYPES.email]);
      default:
        return false;
    }
  }

  function _getComponentConfig(type) {
    return $.extend({}, _defaultConfig, _componentConfigs[type]);
  }

  function _needToPreventRenderComponent(type, toForce) {
    var componentConfig = _getComponentConfig(type);

    return (
      _doesWeHaveAllRequiredUserInfo(componentConfig.requiredUserInfo) ||
      (componentConfig.forceRender && !toForce) ||
      ~_cache.indexOf(type)
    );
  }

  function _prepareOptions(type) {
    var
      options = _componentConfigs[type],
      containerName = options.containerName;

    return containerName ?
      $.extend(
        true,
        {},
        app.modules.authComponentContainer.getComponentContainer(containerName).getOptions(),
        options
      ) : options;
  }

  function _renderComponent(type, toForce) {
    var $componentContainer;

    if (_needToPreventRenderComponent(type, toForce)) { return; }

    $componentContainer = _getComponentContainer(type);

    if (!$componentContainer.length) { return; }

    _getComponentConfig(type).cache && _cacheComponentType(type);

    $componentContainer.trigger('render:authComponent', [_prepareOptions(type)]);
  }

  function _renderComponents(types) {
    types.forEach(_renderComponent);
  }

  function _onRenderComponents() {
    if (!_componentConfigs) { return; }

    _renderComponents(_getComponentTypes());
  }

  function _onForceRenderStaticAuthComponent(event, type) {
    applicationUtils.invariant(
      type,
      'component type should be provided for static component'
    );

    _renderComponent(type, true);
  }

  function _listener() {
    $doc.on('forceRender:staticAuthComponent', _onForceRenderStaticAuthComponent);
  }

  $.extend(self, {
    load: function() {
      _componentConfigs = _getComponentConfigs();

      _onRenderComponents();

      _listener();
    },

    rerender: _onRenderComponents,

    // Для сброса состояния модуля при тестировании
    reset: function() {
      _componentConfigs = null;
      _cache = [];
    },
  });

  return self;

}(app.modules.staticAuthComponent || {}));
