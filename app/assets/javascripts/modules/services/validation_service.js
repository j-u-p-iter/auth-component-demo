/*
 * Flexible validation service to
 * validate according to RegExps and REST API.
 *
 */

(function() {
  var invariantUtil = app.modules.applicationUtils.invariant;

  function ValidationService(schema) {
    invariantUtil(
      schema,
      'Need schema to initialize Validation Service'
    );

    invariantUtil(
      typeof schema === 'object' && Object.keys(schema).length,
      'Need schema to be an object with keys'
    );

    this._schema = schema;
  }

  ValidationService.prototype = {
    _prepareDataToSendRequest: function(value, type, additionalData) {
      var data = {};

      data[type] = value;

      return $.extend({}, data, additionalData);
    },

    _validateDataWithAPI: function(url, data) {
      return $.ajax({
        url: url,
        data: data,
      });
    },

    _validateDataWithRegExp: function(value, type) {
      var isValid = !!this._schema[type] && this._schema[type].test(value);

      return $.Deferred().resolve({valid: isValid});
    },

    _isURL: function(value) {
      return /^http/.test(value);
    },

    validate: function(value, type, additionalData) {
      invariantUtil(value != null, 'value argument is required');
      invariantUtil(type != null, 'type argument is required');
      invariantUtil(typeof type === 'string', 'type argument should be a string');
      invariantUtil(
        additionalData === undefined ||
          (typeof additionalData === 'object' && Object.keys(additionalData).length),
        'additionalData argument should be an object with data'
      );

      return this._isURL(this._schema[type]) ?
        this._validateDataWithAPI(this._schema[type], this._prepareDataToSendRequest(value, type, additionalData)) :
        this._validateDataWithRegExp(value, type);
    },
  };

  app.ValidationService = ValidationService;
})();
