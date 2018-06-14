/**
 * Вспомогательный модуль для получения доступа к контейнерам
 * статического и динамического авторизационных компонентов.
 */

app.modules.authComponentContainer = (function(self) {
  var applicationUtils = app.modules.applicationUtils;

  function _getPathToContainer(containerName) {
    return 'app.modules.' + containerName + 'AuthComponentContainer';
  }

  function _getComponentContainer(containerName) {
    var
      pathToContainer = _getPathToContainer(containerName),
      container = applicationUtils.getFromObjectByPath(
        pathToContainer,
        window
      );

    containerName && app.modules.applicationUtils.invariant(
      applicationUtils.isPlainObject(container),
      '%s should be initialized',
      pathToContainer
    );

    return container;
  }

  self.getComponentContainer = _getComponentContainer;

  return self;

})(app.modules.authComponentContainer || {});
