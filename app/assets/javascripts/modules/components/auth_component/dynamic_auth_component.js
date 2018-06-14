/**
 * Модуль для инициализации авторизационного компонента в попапе.
 *
 * Это обёртка над авторизационным компонентом, предназначенная сделать показ авторизационного
 * компонента в попапе простым и универсальным процессом.
 *
 * Документация: https://github.com/abak-press/apress-clearance/blob/master/docs/components/dynamic_auth_component.md
 *
 */

app.modules.dynamicAuthComponent = (function(self) {
  var
    SELECTORS = {
      item: '.js-show-dynamic-auth-component'
    },
    CLASS_NAMES = {
      component: 'auth-component-${type}'
    },
    _dynamicAuthComponentConfig;

  function _prepareClassName(type) {
    return CLASS_NAMES.component.replace('${type}', type);
  }

  function _prepareOptions(type) {
    var
      options = _dynamicAuthComponentConfig[type],
      containerName = options.containerName;

    return containerName ?
      $.extend(
        true,
        {},
        {popup: {}},
        app.modules.authComponentContainer.getComponentContainer(containerName).getOptions(),
        options
      ) : options;
  }

  function _getComponentType(type) {
    return type || 'sign-in';
  }

  function _renderComponent(type) {
    app.modules.applicationUtils.invariant(
      _dynamicAuthComponentConfig[type],
      'Need to set up config for auth component with %s type',
      type
    );

    $('<div>')
      .addClass(_prepareClassName(type))
      .appendTo('body')
      .trigger('render:authComponent', [_prepareOptions(type)]);
  }

  function _onShowDynamicAuthComponent(event, type) {
    _renderComponent(_getComponentType(type));
  }

  function _getDynamicAuthComponentConfig() {
    app.modules.applicationUtils.invariant(
      app.modules.applicationUtils.getFromObjectByPath(
        'authComponent.wrappers.dynamic', app.config
      ),
      'Need to set up app.config.authComponent.wrappers.dynamic config.'
    );

    app.modules.applicationUtils.invariant(
      app.modules.applicationUtils.isPlainObject(
        app.config.authComponent.wrappers.dynamic
      ),
      'The value of component config should be a plain object.'
    );

    return app.config.authComponent.wrappers.dynamic;
  }

  function _onClickItem(event) {
    event.preventDefault();

    _renderComponent(_getComponentType($(this).data('authComponentType')));
  }

  function _listener() {
    $doc
      .on('click', SELECTORS.item, _onClickItem)
      .on('show:dynamicAuthComponent', _onShowDynamicAuthComponent);
  }

  $.extend(self, {
    load: function() {
      _dynamicAuthComponentConfig = _getDynamicAuthComponentConfig();

      _listener();
    },
    // Для сброса состояния модуля при тестировании
    reset: function() {
      _dynamicAuthComponentConfig = null;
    }
  });

  return self;

})(app.modules.dynamicAuthComponent || {});
