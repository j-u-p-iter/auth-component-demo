// Вспомогательные методы компонента авторизации/регистрации пользователя

app.modules.authComponentUtils = (function() {
  var applicationUtils = app.modules.applicationUtils;

  function _doesCurrentUserHaveData(dataType) {
    applicationUtils.invariant(
      typeof dataType === 'string' || Array.isArray(dataType),
      'Argument dataType should be a string or an array, instead got %s',
      dataType
    );

    applicationUtils.invariant(
      app.config.currentUser,
      'currentUser config should be declared'
    );

    return Array.isArray(dataType) ? dataType.reduce(function(result, currentType) {
      return result && !!app.config.currentUser[currentType];
    }, true) : !!app.config.currentUser[dataType];
  }

  return {
    doesCurrentUserHaveData: _doesCurrentUserHaveData,
  };

})(app.modules.authComponentUtils || {});
