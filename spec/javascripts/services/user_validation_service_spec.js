//= require clearance/services/user_validation_service


describe('app.modules.userValidationService', function() {
  beforeAll(function() {
    app.ValidationService = jasmine.createSpy('ValidationService');

    extendAppConfig({
      api: {
        validationURL: 'http://some-validation-url.com',
      },
      validation: {
        user: {
          emailRegExpTemplate: '@',
          nameRegExpTemplate: 'nameTemplate',
          nameWithAllowedSymbolsRegExpTemplate: 'nameWithAllowedSymbolsTemplate',
          nameWithDisallowedSymbolsTemplate: 'nameWithDisallowedSymbolsTemplate',
          passwordRegExpTemplate: 'passwordRegExpTemplate',
        },
      },
    });

    app.modules.userValidationService.load();
  });

  afterAll(function() {
    app.ValidationService = undefined;
  });

  it('should be instance of Validation Service', function() {
    var
      result = app.modules.userValidationService instanceof app.ValidationService,
      expected = true;

    expect(result).toBe(expected);
  });

  describe('validationSchema', function() {
    var validationSchema;

    beforeAll(function() {
      validationSchema = app.ValidationService.calls.mostRecent().args[0];
    });

    describe('keys', function() {
      var schemaKeys;

      beforeAll(function() {
        schemaKeys = Object.keys(validationSchema);
      })

      it('should be correct', function() {
        var
          result = schemaKeys,
          expected = ['email', 'name', 'nameWithAllowedSymbols', 'nameWithDisallowedSymbols', 'password', 'phone'];

        expect(result).toEqual(expected);
      });
    });

    describe('values', function() {
      it('should be correct', function() {
        var userValidationConfig = app.config.validation.user;

        expect(String(validationSchema.email))
          .toBe(stringifyTemplateRegExp(userValidationConfig.emailRegExpTemplate));
        expect(String(validationSchema.name))
          .toBe(stringifyTemplateRegExp(userValidationConfig.nameRegExpTemplate));
        expect(String(validationSchema.nameWithAllowedSymbols))
          .toBe(stringifyTemplateRegExp(userValidationConfig.nameWithAllowedSymbolsRegExpTemplate));
        expect(String(validationSchema.nameWithDisallowedSymbols))
          .toBe(stringifyTemplateRegExp(userValidationConfig.nameWithDisallowedSymbolsRegExpTemplate));
        expect(String(validationSchema.password))
          .toBe(stringifyTemplateRegExp(userValidationConfig.passwordRegExpTemplate));
        expect(validationSchema.phone)
          .toBe(app.config.api.validationURL);
      });
    });
  });
});
