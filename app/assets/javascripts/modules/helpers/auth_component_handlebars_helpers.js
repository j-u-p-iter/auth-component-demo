// Компонент авторизации/регистрации пользователя

app.modules.authComponentHandlebarsHelpers = (function(self) {
  function _initHelpers() {
    Handlebars.registerHelper({
      isRequired: function(fieldName, options) {
        return ~options.data.root.fields.required.indexOf(fieldName) && options.fn(this);
      },
      renderComponent: function(componentType, context) {
        return 'clearance/auth_component/' + context.data.root.platform + '/orientation/_' + componentType;
      },
      renderField: function(fieldIndex, context) {
        if (!context.data.root.fields.set[fieldIndex]) { return; }

        return 'clearance/auth_component/' + context.data.root.platform + '/fields/_' +
          context.data.root.fields.set[fieldIndex];
      },
      renderFieldsWrapper: function(context) {
        return 'clearance/auth_component/' + context.data.root.platform + '/fields/_wrapper';
      },
      isHiddenByDefault: function(fieldName, options) {
        return ~options.data.root.fields.hiddenByDefault.indexOf(fieldName) && options.fn(this);
      },
      fromCamelToDash: function(string) {
        if (!string) { return; }

        return string.replace(/([A-Z])/g, function($1) { return '-' + $1.toLowerCase(); });
      }
    });
  }

  self.load = function() {
    _initHelpers();
  };

  return self;
})(app.modules.authComponentHandlebarsHelpers || {});
