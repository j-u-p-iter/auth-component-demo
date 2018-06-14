app.modules.userValidationService = (function(self) {

  function _regExpsTemplatesToRegExps(templates) {
    return Object.keys(templates).reduce(function(result, dataType) {
      result[dataType] = new RegExp(templates[dataType], 'i');

      return result;
    }, {});
  }

  function _prepareValidationSchema() {
    return $.extend(
      {},
      _convertRegExpsTemplatesToRegExps(),
      {phone: app.config.api.validationURL}
    );
  }

  function _convertRegExpsTemplatesToRegExps() {
    return _regExpsTemplatesToRegExps({
      email: app.config.validation.user.emailRegExpTemplate,
      name: app.config.validation.user.nameRegExpTemplate,
      nameWithAllowedSymbols: app.config.validation.user.nameWithAllowedSymbolsRegExpTemplate,
      nameWithDisallowedSymbols: app.config.validation.user.nameWithDisallowedSymbolsRegExpTemplate,
      password: app.config.validation.user.passwordRegExpTemplate,
    });
  }

  self.load = function() {
    if (!app.config.validation.user) { return; }

    app.modules.userValidationService = new app.ValidationService(_prepareValidationSchema());
  };

  return self;

})(app.modules.userValidationService || {});
