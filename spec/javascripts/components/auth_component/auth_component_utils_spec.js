//= require clearance/components/auth_component/auth_component_utils

describe('authComponentUtils', function() {
  var utils = app.modules.authComponentUtils;

  describe('doesCurrentUserHaveData', function() {
    var doesCurrentUserHaveData = app.modules.authComponentUtils.doesCurrentUserHaveData;

    beforeEach(function() {
      resetAppConfig();
    });

    it('should throw if argument is not a string or an array', function() {
      var argument = {};

      expect(doesCurrentUserHaveData.bind(null, argument))
        .toThrowError('Argument dataType should be a string or an array, instead got ' + argument);
    });

    it('should not throw if argument is a string', function() {
      var argument = 'Some String';

      expect(doesCurrentUserHaveData.bind(null, argument))
        .not.toThrowError('Argument dataType should be a string or an array, instead got ' + argument);
    });

    it('should not throw if argument is an array', function() {
      var argument = [];

      expect(doesCurrentUserHaveData.bind(null, argument))
        .not.toThrowError('Argument dataType should be a string or an array, instead got ' + argument);
    });

    it('should throw if currentUser config is not declared', function() {
      expect(doesCurrentUserHaveData.bind(null, 'Some Argument'))
        .toThrowError('currentUser config should be declared');
    });

    it('should not throw if currentUser config is declared', function() {
      extendAppConfig({
        currentUser: {}
      });

      expect(doesCurrentUserHaveData.bind(null, 'Some Argument'))
        .not.toThrowError('currentUser config should be declared');
    });

    it('should return false if currentUser does not have phone', function() {
      extendAppConfig({
        currentUser: {
          email: 'some@mail.com',
        }
      });

      var
        result = doesCurrentUserHaveData('phone'),
        expected = false;

      expect(result).toBe(expected);
    });

    it('should return true if currentUser has phone', function() {
      extendAppConfig({
        currentUser: {
          phone: '+79252352323',
        }
      });

      var
        result = doesCurrentUserHaveData('phone'),
        expected = true;

      expect(result).toBe(expected);
    });

    it('should return false if currentUser has phone but not email', function() {
      extendAppConfig({
        currentUser: {
          phone: '+79252352323',
        }
      });

      var
        result = doesCurrentUserHaveData(['phone', 'email']),
        expected = false;

      expect(result).toBe(expected);
    });

    it('should return true if currentUser has phone and email', function() {
      extendAppConfig({
        currentUser: {
          email: 'some@mail.com',
          phone: '+79122352323',
        }
      });

      var
        result = doesCurrentUserHaveData(['phone', 'email']),
        expected = true;

      expect(result).toBe(expected);
    });
  });
});
