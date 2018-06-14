var
  SELECTORS = {
    container: '.js-auth-component-container',
    submitButton: '.js-button-submit',
  };


var database = new Database();

function extractFormData(data) {
  return data.__test__;
}

function resetAppConfig() {
  app.config = {
    api: {},
  };
}

function extendAppConfig(options) {
  $.extend(true, app.config, options);
}

function resetEnvironment() {
  $doc.unbind();
  $('body').empty();
}

function mockAjax() {
  var METHOD_BY_DEFAULT = 'GET';

  spyOn($, 'ajax').and.callFake(function(options) {
    var
      url = options.url,
      method = options.method || METHOD_BY_DEFAULT,
      $$doAjax = $.Deferred();

    setTimeout(function() {
      switch(url) {
        case app.config.api.usersURL:
          return $$doAjax.resolve(
            method === METHOD_BY_DEFAULT ? database.findUser(options.data) : database.saveUser(options.data)
          );
        case app.config.usersRegistrationURL:
          return $$doAjax.resolve(database.saveUser(extractFormData(options.data).user));
        case app.config.api.userSocialProviderURL:
          return $$doAjax.resolve({deleted: true});
        case app.config.api.validationURL:
          return $$doAjax.resolve('Result of validation ajax call');
        case app.config.api.registerSocialRegProcess:
          return $$doAjax.resolve({});
        case app.config.api.listenSocialRegProcess:
          return $$doAjax.resolve({});
        case app.config.usersSessionURL:
          return $$doAjax.resolve({});
      }
    }, 10);

    return $$doAjax;
  });
}

function mockUserValidationService(isValid) {
  isValid = isValid === undefined ? true : isValid;

  app.modules.userValidationService = {
    validate: function() { return $.Deferred().resolve({valid: isValid}); },
  };
}

function renderAuthComponent(options, callbacks) {
  fixture.load('components/auth_component/auth_component/auth_component_container');

  callbacks && callbacks.onBeforeRender && callbacks.onBeforeRender();

  return $(fixture.el).find(SELECTORS.container).trigger('render:authComponent', [options]);
}

function signUpUser(data, componentOptions, callbacks) {
  data = (
    data ||
    {
      email: 'some@email.com',
      name: 'Some Name',
      password: 12345,
    }
  );

  renderAuthComponent(
    $.extend(
      {
        type: 'form',
        fields: {
          set: ['email', 'name'],
          values: data,
        },
        onRender: function($component) {
          $component.submit();
        },
      },
      componentOptions
    ),
    callbacks
  );
}

function testOnSearchEvent(onSearchEventSpy, values, onRender) {
  renderAuthComponent({
    fields: {values: values},
    onSearch: onSearchEventSpy,
    onRender: onRender,
  });
}

function loadStaticAuthComponent(callbacks, selector) {
  var spyOnRenderComponentEvent = jasmine.createSpy('Spy On Render Component Event');

  $doc.on('render:authComponent', selector, spyOnRenderComponentEvent);

  callbacks.onBeforeLoad(spyOnRenderComponentEvent);

  app.modules.staticAuthComponent.load();

  callbacks.onAfterLoad(spyOnRenderComponentEvent);
}

function isComponentDisabled($component) {
  return $component.find(SELECTORS.submitButton).prop('disabled');
}

// Have to mock appEL, cause teaspoon can't ES6.
function mockAppEL() {
  appEL = {
    set: function(pathToObjectKey, value) {
      if (~pathToObjectKey.indexOf('app.config.isUserSigned')) {
        app.config.isUserSigned = value;

        return this;
      }

      if (~pathToObjectKey.indexOf('app.config.currentUser')) {
        var currentUserKey = pathToObjectKey.split('.').pop();

        app.config.currentUser[currentUserKey] = value;

        return this;
      }

      return this;
    },
    originalAppEL: appEL,
  };
}

function stringifyTemplateRegExp(regExpTemplate) {
  return String(new RegExp(regExpTemplate, 'i'));
}
