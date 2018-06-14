//= require clearance/services/validation_service


describe('ValidationService', function() {
  var ValidationService = app.ValidationService;

  beforeAll(function() {
    extendAppConfig({
      api: {
        validationURL: 'http://validation-url.com',
      },
    });

    mockAjax();
  });

  it('should be defined', function() {
    expect(ValidationService).toBeDefined();
  });

  describe('initialization', function() {
    describe('arguments', function() {
      describe('schema', function() {
        it('should be required', function() {
          expect(ValidationService)
            .toThrowError('Need schema to initialize Validation Service');
          expect(ValidationService.bind(null, {schemaKey: 'schemaKeyValue'}))
            .not.toThrowError('Need schema to initialize Validation Service');
        });

        it('should be an object with keys', function() {
          var errorMessage = 'Need schema to be an object with keys';

          expect(ValidationService.bind(null, 'Some Schema')).toThrowError(errorMessage);
          expect(ValidationService.bind(null, {})).toThrowError(errorMessage);
          expect(ValidationService.bind(null, {someKey: 'some value'})).not.toThrowError(errorMessage);
        });
      });
    });
  });

  describe('instance', function() {
    var validationServiceInstance;

    beforeAll(function() {
      validationServiceInstance = new ValidationService({
        email: /@/,
      });
    });

    describe('public API', function() {
      describe('validate(value, type, additionalData)', function() {
        it('should be defined', function() {
          expect(validationServiceInstance.validate).toBeDefined();
        });

        describe('arguments', function() {
          describe('value', function() {
            it('should be required', function() {
              expect(
                validationServiceInstance.validate.bind(validationServiceInstance)
              ).toThrowError('value argument is required');

              expect(
                validationServiceInstance.validate.bind(
                  validationServiceInstance,
                  'Some Value'
                )
              ).not.toThrowError('value argument is required');
            });
          });

          describe('type', function() {
            it('should be required', function() {
              expect(
                validationServiceInstance.validate.bind(
                  validationServiceInstance,
                  'Some Value'
                )
              ).toThrowError('type argument is required');

              expect(
                validationServiceInstance.validate.bind(
                  validationServiceInstance,
                  'Some value',
                  'Some yype'
                )
              ).not.toThrowError('type argument is required');
            });

            it('should be a string', function() {
              expect(
                validationServiceInstance.validate.bind(
                  validationServiceInstance,
                  'Some value',
                  {}
                )
              ).toThrowError('type argument should be a string');

              expect(
                validationServiceInstance.validate.bind(
                  validationServiceInstance,
                  'Some value',
                  'Some type'
                )
              ).not.toThrowError('type should be a string');
            });
          });

          describe('additionalData', function() {
            it('should be an object', function() {
              expect(
                validationServiceInstance.validate.bind(
                  validationServiceInstance,
                  'Some Value',
                  'Some Type',
                  'Some additional Data'
                )
              ).toThrowError('additionalData argument should be an object with data');

              expect(
                validationServiceInstance.validate.bind(
                  validationServiceInstance,
                  'Some Value',
                  'Some Type',
                  {}
                )
              ).toThrowError('additionalData argument should be an object with data');

              expect(
                validationServiceInstance.validate.bind(
                  validationServiceInstance,
                  'Some Value',
                  'Some Type',
                  {someKey: 'someValue'}
                )
              ).not.toThrowError('additionalData argument should be an object with data');
            });
          });
        });
      });
    });
  });

  describe('validate with regExp', function() {
    var validationServiceInstance;

    beforeAll(function() {
      validationServiceInstance = new ValidationService({
        email: /@/,
      });
    });

    describe('request', function() {
      it('should not be sent', function() {
        var
          result = $.ajax.calls.count(),
          expected = 0;

        expect(result).toBe(expected);
      });
    });

    describe('result', function() {
      it('should be Deferred object', function() {
        var result = validationServiceInstance.validate('some@email.com', 'email');

        expect(typeof result.then).toBe('function');
        expect(typeof result.catch).toBe('function');
      });

      describe('with valid value', function() {
        it('should be correct', function(done) {
          var
            $$validation = validationServiceInstance.validate('some@email.com', 'email'),
            expected = {valid: true};

          $$validation.then(function(result) {
            expect(result).toEqual(expected);

            done();
          });
        });
      });

      describe('with invalid value', function() {
        it('should be correct', function(done) {
          var
            $$validation = validationServiceInstance.validate('invalidEmail.com', 'email'),
            expected = {valid: false};

          $$validation.then(function(result) {
            expect(result).toEqual(expected);

            done();
          });
        });
      });
    });
  });

  describe('validate with URL', function() {
    describe('request', function() {
      var validationServiceInstance, args, valueToValidate, valueType, validationURL, additionalData;

      beforeAll(function() {
        validationURL = 'http://validation-url.com';
        valueToValidate = '+79233422323';
        valueType = 'phone';
        additionalData = {someKey: 'someValue'};


        validationServiceInstance = new ValidationService({
          phone: validationURL,
        });

        validationServiceInstance.validate(
          valueToValidate,
          valueType,
          additionalData
        );

        args = $.ajax.calls.mostRecent().args[0];
      });

      it('should be sent one time', function() {
        var
          result = $.ajax.calls.count(),
          expected = 1;

        expect(result).toBe(expected);
      });

      it('should be sent on validation url', function() {
        var
          result = args.url,
          expected = validationURL;

        expect(result).toBe(expected);
      });

      it('should be sent with correct additional data', function() {
        var
          dataToValidate = {},
          result = args.data,
          expected;

        dataToValidate[valueType] = valueToValidate;

        expected = $.extend({}, dataToValidate, additionalData);

        expect(result).toEqual(expected);
      });
    });

    describe('result', function() {
      it('should be the result of ajax call on validation url', function(done) {
        var validationService = new ValidationService({
          phone: app.config.api.validationURL,
        });

        validationService.validate('+79123433434', 'phone').then(function(data) {
          expect(data).toBe('Result of validation ajax call');
          done();
        });
      });
    });
  });
});
