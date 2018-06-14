// Компонент авторизации/регистрации пользователя

//= require_tree ../../../templates/clearance/auth_component

app.modules.authComponent = (function(self) {

  var
    _default = {
      type: 'simple',
      fields: {
        set: ['name', 'email', 'phone'],
        required: ['name', 'email', 'phone'],
        toSynchronize: ['name', 'email', 'phone'],
        toCheckFormat: ['name', 'email', 'phone', 'password'],
        selfCleared: ['email', 'phone'],
        maxlength: {name: 200},
        autocomplete: 'on',
        hiddenByDefault: [],
        visibleForNewUsers: ['name'],
        visibleIfDataCorrect: [],
        hints: null,
        withoutLabels: false,
        withoutPlaceholder: false,
        inline: false,
      },
      orientation: 'horizontal',
      selectors: {flashMessage: null},
      crossDomainAuth: false,
      contentType: null,
      toggleContent: false,
      withMultipleField: false,
      withToggledPassword: true,
      actionOnSuccess: null,
      popup: null,
      error: null,
      title: null,
      buttonText: null,
      simpleRegistration: false,
      withoutSpinner: false,
      withSocialRegistration: false,
      newSocialRegistrationSchema: false,
      onMount: function() {},
      onRender: function() {},
      onSearch: function() {},
      onCompleted: function() {},
      onProcessUserData: function() {},
      onProcessFieldData: function() {},
      onAfterFieldDataProcessed: function() {},
      onBeforeProcessDataOnRender: function() {},
      onSubmit: function() {},
      onError: function() {},
    },
    SELECTORS = {
      component: '.js-auth-component',

      userField: '.js-input-user-auth',
      nameField: '.js-input-name-auth',
      emailField: '.js-input-email-auth',
      phoneField: '.js-input-phone-auth',
      passwordField: '.js-input-password-auth',
      codeField: '.js-input-code-auth',
      multipleField: '.js-input-multiple-auth',

      nameGroup: '.js-group-name-auth',
      phoneGroup: '.js-group-phone-auth',
      emailGroup: '.js-group-email-auth',
      codeGroup: '.js-group-code-auth',
      passwordGroup: '.js-group-password-auth',
      multipleGroup: '.js-group-multiple-auth',

      restorePasswordLink: '.js-restore-password-auth',
      sendCodeLink: '.js-get-code-auth',

      existingUsersContainer: '.js-existing-users-container',
      userExistRadio: '.js-user-exist-radio-auth',
      userExistsButton: '.js-button-yes-users-exists',
      userDoesntExistButton: '.js-button-no-users-exists',

      submitButton: '.js-button-submit',

      flashMessage: '.js-flash-message',

      clearFieldIcon: '.js-icon-clear-field',
      togglePasswordIcon: '.js-icon-toggle-password'
    },
    CLASS_NAMES = {
      loading: 'auth-component-loading',
      initialLoading: 'auth-component-initial-loading',
      selfClearedFormGroup: 'form-group-self-cleared',
      withToggledPasswordFormGroup: 'form-group-with-toggled-password'
    },
    TEMPLATES_PATH = 'clearance/auth_component',
    DATA_SCOPE_NAME = 'auth-component',
    MAP_TO_DIALOG_OPTIONS = {
      onClose: 'close',
      className: 'dialogClass'
    },
    FIELDS_TO_RENDER = ['name', 'email', 'phone', 'password'],
    FIELDS_TO_VALIDATE_WITHOUT_SEARCHING = ['name', 'password'],

    PREPARE_USER_PROCESS_TYPE = {
      merge: 'merge',
      increase: 'increase',
    },

    RESULT_PROCESS_TYPE = {
      signIn: 'signIn',
      signUp: 'signUp',
    },

    ON_EVENT = {
      search: 'onSearch',
      mount: 'onMount',
      render: 'onRender',
      processUserData: 'onProcessUserData',
      processFieldData: 'onProcessFieldData',
      afterFieldDataProcessed: 'onAfterFieldDataProcessed',
      completed: 'onCompleted',
      error: 'onError',
    },

    SEARCH_ACTIONS = {
      foundByEmail: 'FOUND_BY_EMAIL',
      foundByEmailButNotByPhone: 'FOUND_BY_EMAIL_BUT_NOT_BY_PHONE',
      foundByPhoneAndEmail: 'FOUND_BY_PHONE_AND_EMAIL',
      foundByEmailAndAlsoByPhone: 'FOUND_BY_EMAIL_AND_ALSO_BY_PHONE',
      foundInContacts: 'FOUND_IN_CONTACTS',
      notFound: 'NOT_FOUND',
    },

    ON_SEARCH_EVENT_TYPES = {
      email: 'email',
      emailAndPhone: 'email&phone',
      emailButNotPhone: 'email!phone',
      phoneInUsers: 'phoneInUsers',
      phoneInContacts: 'phoneInContacts',
      phone: 'phone',
    },

    ACTIONS = {
      reload: 'reload',
      redirect: 'redirect'
    },

    EVENTS = {
      signIn: 'signIn',
      signUp: 'signUp',
      act: 'act'
    },

    CONTENT_TYPES = {
      signIn: 'sign-in',
      signUp: 'sign-up',
      common: 'common',
    },

    REGISTRATION_TYPES = {
      simple: 'simple',
    },

    MULTIPLE_FIELD_TYPES = ['phone', 'email'],

    TOGGLE_ICONS_EVENTS = ['input', 'blur'],

    OPTIONS_TO_EXCLUDE_FROM_EXTENDING_WITH_CODE_FIELD = ['toCheckFormat'],

    ERROR_MESSAGES = {
      notAuthComponent: 'Argument should contain authorization component',
      notJQueryObject: 'Argument should be present with jQuery object, instead got %s',
    },

    _$store = $('<store>'),
    applicationUtils = app.modules.applicationUtils,
    userUtils = app.modules.userUtils,
    _currentProcessingUser, _$currentComponent, _$lastActiveField, _unmountComponent, _withAutoFilledPassword,
    _processingDataTimeout, _wasUserSignedBeforeProcessingData;

  function _doesUserHaveNecessaryField(fieldName, user) {
    user = user || app.config.currentUser;

    return !!userUtils.getUserAttribute(fieldName, user);
  }

  function _firstToUppercase(string) {
    return string.charAt(0).toUpperCase() + string.substring(1);
  }

  function _typesToNames(types, context, withoutState) {
    context = context || 'field';

    return types.split(',').map(function(type) {
      return $.trim(type) + _firstToUppercase(context) +
        (withoutState ? '' : ':not(:disabled)');
    }).join(',');
  }

  function _optionalTypesToNames(name, context) {
    return _typesToNames(_getOptionsByName('fields.' + name).join(','), context || 'field');
  }

  function _typesToSelector(types) {
    return _namesToSelectorStr(_typesToNames(types));
  }

  function _typesToClassName(types, context) {
    return _namesToSelectorArr(_typesToNames(types, context, true))
      .map(function(selector) { return selector.replace(/\./, ''); }).join(' ');
  }

  function _optionalTypesToSelector(groupType, context) {
    return _namesToSelectorStr(_optionalTypesToNames(groupType, context));
  }

  function _parseElementName(elementName) {
    var
      DIVIDER = ':',
      nameParts = elementName.split(DIVIDER);

    return {
      name: nameParts[0],
      state: nameParts.filter(function(item, index) { return index; })
        .map(function(item) { return DIVIDER + item; }).join('')
    };
  }

  function _nameToSelector(elementName) {
    var elementNameObj = _parseElementName(elementName);

    return SELECTORS[elementNameObj.name] + elementNameObj.state;
  }

  function _namesToSelectorArr(elementsNames) {
    return elementsNames.split(',').map(function(elementName) { return _nameToSelector($.trim(elementName)); });
  }

  function _namesToSelectorStr(elementsNames) {
    return _namesToSelectorArr(elementsNames).join(',');
  }

  // Named similarly to $ in jQuery
  // Search elements locally - inside auth component
  function _$(elementType) {
    return _$currentComponent ? _$currentComponent.find(_namesToSelectorStr(elementType)) : $();
  }

  function _getRequestObject(params) {
    return $.extend({
      beforeSend: function() { $doc.trigger('getProcess:authComponent'); },
      complete: function() { $doc.trigger('getComplete:authComponent'); }
    }, params);
  }

  function _api(params) {
    return $.ajax(_getRequestObject(params));
  }

  function _renderExistingUsers(users) {
    _$('existingUsersContainer').html(
      HandlebarsTemplates[TEMPLATES_PATH + '/' + _getPlatform() + '/existing_users']({users: users})
    );
  }

  function _setValidationState(valid) {
    _$currentComponent.data({valid: !!valid}).toggleClass('invalid-auth', !valid);
  }

  function _clearUsersList() {
    _$('existingUsersContainer').empty();
  }

  function _toggleFieldValidationState($field, isValid) {
    var
      $currentGroup = _getCurrentGroup($field),
      data = $currentGroup.data({valid: !!isValid}).data();

    !isValid ? _showErrors(_createValidationError({errorAttribute: data.type, message: data.invalidDataMessage})) :
      _removeMessages($currentGroup);
  }

  function _resetFormState() {
    _removeMessages();
    _toggleFlashMessage();
    _toggleDisableState('phoneField, emailField', false);
    _clearUsersList();
    _getFieldsToCheckFormat().prop({readonly: false});
    _toggleComponentLoadingIndicator(true);
  }

  function _prepareAuthFields(user) {
    if (_doesUserHaveNecessaryField('email')) {
      _getCurrentGroup(_$('emailField').val(user.email)).data({valid: true});
      _getCurrentGroup(_$('phoneField').prop({readonly: user.exists})).data({valid: true});
    } else {
      _getCurrentGroup(_$('phoneField').val(user.phone)).data({valid: true});
      _getCurrentGroup(_$('emailField').prop({readonly: user.exists})).data({valid: true});
    }
  }

  function _toggleComponentLoadingIndicator(display, className, $container) {
    if (_getOptionsByName('withoutSpinner')) { return; }

    ($container ? _findCurrentComponent($container) : _$currentComponent)
      .toggleClass(className || CLASS_NAMES.loading, !!display);
  }

  function _toggleCodeFields(showPasswordField, hideAllFields) {
    hideAllFields = !!hideAllFields;

    _$('passwordGroup').toggleClass('dn', !showPasswordField || hideAllFields);
    _$('codeGroup').toggleClass('dn', showPasswordField || hideAllFields);
    _toggleDisableState(
      ['codeField', showPasswordField || hideAllFields],
      ['passwordField', !showPasswordField || hideAllFields]
    );
  }

  function _toggleGenerateCodeLinks(user) {
    var doesUserHaveEmail = _doesUserHaveNecessaryField('email', user);

    _$('restorePasswordLink').toggleClass('dn', !user || !doesUserHaveEmail);
    _$('sendCodeLink').toggleClass('dn', !user || doesUserHaveEmail);
  }

  function togglePairState(pair) {
    pair[0].split(',').forEach(function(elementName) { _$($.trim(elementName)).prop({disabled: pair[1]}); });
  };

  function _toggleDisableState() {
    var pairs = arguments;

    Array.isArray(pairs[0]) ? Array.prototype.slice.call(pairs).forEach(togglePairState) : togglePairState(pairs);
  }


  function _getAllContentTypes() {
    return Object.keys(CONTENT_TYPES).map(function(key) {
      return CONTENT_TYPES[key];
    }).join(' ');
  }

  function _getContentType(isContentToSignIn) {
    return isContentToSignIn ? CONTENT_TYPES.signIn : CONTENT_TYPES.signUp;
  }

  function _needToHideCodeFields() {
    return (
      app.config.isUserSigned &&
      !_doesUserHaveNecessaryField('sid') ||
      _getOptionsByName('simpleRegistration')
    ) && !_currentProcessingUser;
  }

  function _isContentToSignIn(isUserFound) {
    return isUserFound || (app.config.isUserSigned && !userUtils.isSignedBySID());
  }

  function _toggleContent(isUserFound) {
    _setContentType(_getContentType(_isContentToSignIn(isUserFound)));
  }

  function _clearContentType() {
    return _$currentComponent.removeClass(_getAllContentTypes());
  }

  function _isEmailAndPhoneValid(errors) {
    return !errors.filter(function(error) {
      return error.errorAttribute === 'email' || error.errorAttribute === 'phone';
    }).length;
  }

  function _setDefaultContentType() {
    _setContentType(_getOptionsByName('contentType'));
  }

  function _setContentType(contentType) {
    _clearContentType().addClass(contentType);
  }

  function _setFormState(user) {
    _$(_optionalTypesToNames('visibleIfDataCorrect', 'group')).removeClass('dn');
    _toggleCodeFields(
      true,
      _needToHideCodeFields()
    );
    _toggleGenerateCodeLinks(user);
    _toggleDisableState('nameField', !!user);
    _$(_optionalTypesToNames('visibleForNewUsers', 'group')).toggleClass('dn', !!user);
    _$('userField').val(user ? user.id : '');
    _toggleDisableState('userField', !user);
    _getOptionsByName('toggleContent') && _toggleContent(user);
  }

  function _setSelfClearedFieldsState(selfClearedFieldsTypes) {
    selfClearedFieldsTypes.forEach(function(type) {
      _toggleClearFieldIcon(_$(type + 'Field'));
    });
  }

  function _setComponentState(user, doAdditionalStateChanges) {
    _currentProcessingUser = user;
    _toggleComponentLoadingIndicator(false);
    _setValidationState(user);
    _validateComponent({
      invalid: 'toCheckFormat',
    }).always(function(errors) {
      if (!errors || _isEmailAndPhoneValid(errors)) { _setFormState(user); }
    });
    doAdditionalStateChanges && doAdditionalStateChanges(user);
  }

  function _prepareDataToSearchUser(data, needToGetActiveUsers) {
    return $.extend(
      Object.keys(data).reduce(function(result, currentKey) {
        result[currentKey] = $.trim(data[currentKey]);

        return result;
      }, {}),
      {all: !needToGetActiveUsers}
    );
  }

  function _getByPhoneAndEmail(phone, email) {
    return _api({
      url: app.config.api.usersURL,
      data: _prepareDataToSearchUser({
        phone: phone,
        email: email
      })
    });
  }

  function _getByEmail(email) {
    return _api({
      url: app.config.api.usersURL,
      data: _prepareDataToSearchUser({email: email})
    });
  }

  function _getByPhone(phone, inContacts) {
    return _api({
      url: app.config.api.usersURL,
      data: inContacts ? _prepareDataToSearchUser({contacts: phone}, true) :
        _prepareDataToSearchUser({phone: phone}),
    });
  }

  function _searchUserByEmail(email) {
    var $$searchUser = $.Deferred();

    _getByEmail(email).then(function(response) {
      var user = response.users && response.users[0];

      $$searchUser.resolve({
        type: user ? SEARCH_ACTIONS.foundByEmail : SEARCH_ACTIONS.notFound,
        user: user,
      });
    });

    return $$searchUser;
  }

  function _searchUserByPhone(phone) {
    var $$searchUser = $.Deferred();

    _getByPhone(phone).then(function(response) {
      if (response.users.length) {
        $$searchUser.resolve({
          type: SEARCH_ACTIONS.foundInUsers,
          user: response.users[0],
        });
      } else {
        _getByPhone(phone, true).then(function(response) {
          $$searchUser.resolve({
            type: response.users.length ? SEARCH_ACTIONS.foundInContacts :
              SEARCH_ACTIONS.notFound,
            users: response.users,
          });
        });
      }
    });

    return $$searchUser;
  }

  function _searchUserByPhoneAndEmail(phone, email) {
    var promise = $.Deferred();

    _getByPhoneAndEmail(phone, email).then(function(response) {
      if (response.users.length) {
        promise.resolve({
          type: SEARCH_ACTIONS.foundByPhoneAndEmail,
          user: response.users[0],
        });
      } else {
        _getByEmail(email).then(function(response) {
          var userDetectedByEmail = response.users;

          if (userDetectedByEmail.length) {
            _getByPhone(phone).then(function(response) {
              if (response.users.length) {
                promise.resolve({
                  type: SEARCH_ACTIONS.foundByEmailAndAlsoByPhone,
                  user: userDetectedByEmail[0],
                });
              } else {
                promise.resolve({
                  type: SEARCH_ACTIONS.foundByEmailButNotByPhone,
                  user: userDetectedByEmail[0],
                });
              }
            });
          } else {
            promise.resolve({
              type: SEARCH_ACTIONS.notFound,
              phone: phone,
            });
          }
        });
      }
    });

    return promise;
  }

  function _onAfterSearchingUserByPhoneAndEmail(action) {
    switch(action.type) {
      case SEARCH_ACTIONS.foundByEmailButNotByPhone:
      case SEARCH_ACTIONS.foundByPhoneAndEmail:
        _setComponentState(action.user, function(user) {
          _doOnResult(ON_EVENT.search, {
            type: action.type === SEARCH_ACTIONS.foundByEmailButNotByPhone ?
              ON_SEARCH_EVENT_TYPES.emailButNotPhone : ON_SEARCH_EVENT_TYPES.emailAndPhone,
            user: user
          });
          _toggleDisableState('phoneField', !_isFieldRequired('phone') && user && user.phone);
        });
        break;
      case SEARCH_ACTIONS.foundByEmailAndAlsoByPhone:
        _setComponentState(action.user, function() {
          _showErrors(_createValidationError({
            errorAttribute: 'phone',
            message: _$('phoneGroup').data('unique-data-message')
          }));
          _$(_optionalTypesToNames('visibleIfDataCorrect', 'group')).addClass('dn');
          _setValidationState();
        });
        break;
      case SEARCH_ACTIONS.notFound:
        return _searchUserByPhone(action.phone).then(_onAfterSearchingUserByPhone);
    }
  }

  function _onAfterSearchingUserByPhone(action) {
    switch(action.type) {
      case SEARCH_ACTIONS.foundInUsers:
        _setComponentState(action.user, function() {
          _doOnResult(ON_EVENT.search, {
            type: ON_SEARCH_EVENT_TYPES.phoneInUsers,
            user: action.user
          });
          _toggleDisableState('emailField', _doesUserHaveNecessaryField('email', action.user));
        });
        break;
      case SEARCH_ACTIONS.foundInContacts:
        _setComponentState(null, function() {
          _doOnResult(ON_EVENT.search, {
            type: ON_SEARCH_EVENT_TYPES.phoneInContacts,
            users: action.users
          });
          _renderExistingUsers(action.users);
        });
        break;
      case SEARCH_ACTIONS.notFound:
        _setComponentState(null, function() {
          _doOnResult(ON_EVENT.search, {
            type: ON_SEARCH_EVENT_TYPES.phone,
            user: null
          });
          _setValidationState(true);
        });
    }
  }

  function _onAfterSearchingUserByEmail(action) {
    switch(action.type) {
      case SEARCH_ACTIONS.foundByEmail:
      case SEARCH_ACTIONS.notFound:
        _setComponentState(action.user, function(user) {
          _doOnResult(ON_EVENT.search, {
            type: ON_SEARCH_EVENT_TYPES.email,
            user: user || null
          });
          _toggleDisableState('phoneField', !_isFieldRequired('phone') && user && user.phone);
          _setValidationState(true);
        });
    }
  }

  function _isFieldRequired(fieldType) {
    return ~_getOptionsByName('fields.required').indexOf(fieldType);
  }

  function _getPlatform() {
    return app.config.isMobile ? 'mobile' : 'desktop';
  }

  function _searchUser() {
    var
      phone = $.trim(_$('phoneField').val()),
      email = $.trim(_$('emailField').val());

    if (phone && email) {
      return _searchUserByPhoneAndEmail(phone, email)
        .then(_onAfterSearchingUserByPhoneAndEmail);
    }

    if (phone) {
      return _searchUserByPhone(phone).then(_onAfterSearchingUserByPhone);
    }

    if (email) {
      return _searchUserByEmail(email).then(_onAfterSearchingUserByEmail);
    }

    _setComponentState(null, _setDefaultState);

    return $.Deferred().resolve();
  }

  function _setDefaultState() {
    var fieldsToHideByDefault = _getOptionsByName('fields.hiddenByDefault');

    fieldsToHideByDefault.length && _hideFieldsForDefaultState(fieldsToHideByDefault);
    _setDefaultContentType();
  }

  function _hideFieldsForDefaultState(fields) {
    fields.forEach(function(instruction) {
      var instructionPair = instruction.split(':');

      _hideFieldAccordingToUserInfo(instructionPair[0], instructionPair[1]);
    });
  }

  function _hideFieldAccordingToUserInfo(formFieldName, userFieldName) {
    if (userFieldName && !_doesUserHaveNecessaryField(userFieldName)) { return; }

    _$(_typesToNames(formFieldName, 'group')).addClass('dn');
  }

  function _getMultipleFieldDataType($field) {
    return /@/.test($field.val()) ? MULTIPLE_FIELD_TYPES[1] : MULTIPLE_FIELD_TYPES[0];
  }

  function _getMultipleFieldProps(type) {
    type = type || MULTIPLE_FIELD_TYPES.join(',');

    return {
      fieldClassName: _typesToClassName(type),
      groupClassName: _typesToClassName(type, 'group')
    };
  }

  function _resetMultipleFieldProps($field) {
    var multipleFieldProps = _getMultipleFieldProps();

    _getCurrentGroup($field.removeClass(multipleFieldProps.fieldClassName))
      .data({type: 'multiple'})
      .removeClass(multipleFieldProps.groupClassName);
  }

  function _setMultipleFieldType($field, type) {
    _getCurrentGroup($field).data({type: type});
  }

  function _setMultipleFieldName($field, name) {
    $field.attr({name: name});
  }

  function _setMultipleFieldClassNames($field, type) {
    var multipleFieldProps = _getMultipleFieldProps(type);

    _getCurrentGroup(
      $field.addClass(multipleFieldProps.fieldClassName)
    ).addClass(multipleFieldProps.groupClassName);
  }

  function _setMultipleFieldProps($field) {
    var type = _getMultipleFieldDataType($field);

    _setMultipleFieldType($field, type);
    _setMultipleFieldName($field, type);
    _setMultipleFieldClassNames($field, type);
  }

  function _mutateMultipleField($field) {
    $field = $field || _$('multipleField');

    _resetMultipleFieldProps($field);
    _setMultipleFieldProps($field);

    return $field;
  }

  function _validateAccordingToDataType(value, type) {
    return type === 'phone' ? _validateDataWithAPI({phone: value, type: 'mobile'}) :
      _validateDataWithValidationService(value, type);
  }

  function _validate($input) {
    var
      value = $.trim($input.val()),
      $$isValid = $.Deferred(),
      dataType;

    if (!value) { return $$isValid.resolve($input); }

    dataType = _getCurrentGroup($input).data('type');

    return app.modules.userValidationService.validate(
      value,
      dataType,
      dataType === 'phone' ? {type: 'mobile'} : undefined
    ).then(
      function(response) { return response.valid ? $$isValid.resolve($input) : $$isValid.reject($input); },
      function() { return $$isValid.reject($input); }
    );
  }

  function _failValid($field) {
    _toggleFieldValidationState($field);
    _setComponentState(null, function() {
      _$(_optionalTypesToNames('visibleIfDataCorrect', 'group')).addClass('dn');
    });
  }

  function _getCurrentComponent(fn) {
    var $this = $(this);

    _$currentComponent = $this.closest(SELECTORS.component);

    return fn($this);
  }

  function _getCurrentGroup($field) {
    return $field.closest('[class*="js-group-"]');
  }

  function _getFieldToValidate($field) {
    return _getCurrentGroup($field).is(SELECTORS.multipleGroup) ? _mutateMultipleField($field) : $field;
  }

  function _processFieldData($field) {
    _doOnResult(ON_EVENT.processFieldData, $field);

    return _needToValidateWithUserSearching($field) ?
      _validateFieldDataFormat($field).then(_searchUser) : _validateFieldDataFormat($field);
  }

  function _onAfterProcessFieldData() {
    _doOnResult(ON_EVENT.afterFieldDataProcessed);
  }

  function _processFieldDataAndResultOfProcessing($field) {
    _processFieldData($field).then(_onAfterProcessFieldData);
  }

  function _onProcessingDataFieldEvent(event) {
    _getCurrentComponent.call(this, function($field) {
      _isProcessingTheSameField($field) && clearTimeout(_processingDataTimeout);

      if (event.type === 'change') {
        _processFieldDataAndResultOfProcessing($field);
      } else {
        _processingDataTimeout = setTimeout(function() {
          _processFieldDataAndResultOfProcessing($field);
        }, 500);
      }
    });
  }

  function _isProcessingTheSameField($field) {
    if (!$field || !_$lastActiveField) { return; }

    return $field[0] === _$lastActiveField[0];
  }

  function _onInput() {
    _getCurrentComponent.call(this, _onInputWithTarget);
  }

  function _change() {
    _getCurrentComponent.call(this, function() {
      _toggleDisableState('userExistsButton', false);
    });
  }

  function _userDoesntExist() {
    _getCurrentComponent.call(this, function() {
      _setValidationState(true);
      _clearUsersList();
      $doc.trigger('denyUser:authComponent');
    });
  }

  function _userExists() {
    _getCurrentComponent.call(this, function() {
      var data = _$('userExistRadio:checked').data();

      data.exists = true;
      _setComponentState(data, function(user) {
        _prepareAuthFields(user);
        _clearUsersList();
      });
      $doc.trigger('confirmUser:authComponent');
    });
  }

  function _generateCode(url) {
    return $.post(url, {'user_id': _$('userField').val()});
  }

  function _setPasswordAutoFilledState() {
    _withAutoFilledPassword = !_$('passwordField').val();
  }

  function _needToSetPasswordAutoFilledStateOnInput($field) {
    return !_withAutoFilledPassword && $field.is(SELECTORS.passwordField);
  }

  function _onSetPasswordAutoFilledState($field) {
    _needToSetPasswordAutoFilledStateOnInput($field) && _setPasswordAutoFilledState();
  }

  function _onInputWithTarget($field) {
    _$lastActiveField = _getFieldToValidate($field);

    _onSetPasswordAutoFilledState($field);
  }

  function _onGenerateCode() {
    _getCurrentComponent.call(this, function($this) {
      var restorePassword = $this.addClass('dn').is(SELECTORS.restorePasswordLink);

      _removeMessages(_$('passwordGroup, codeGroup'));
      _generateCode(
        restorePassword ? app.config.api.passwordURL : app.config.api.authCodeURL
      ).then(function() {
        var $group = _$((restorePassword ? 'password' : 'code') + 'Group');

        _toggleCodeFields(restorePassword);
        _showFieldMessage($group, $group.data('success-message'), 'success');
      }).always(function() { $doc.trigger('generateCodeComplete:authComponent'); });
    });
  }

  function _findCurrentComponent($parent) {
    var $element = $parent.find(SELECTORS.component)

    return _$currentComponent = $element;
  }

  function _fieldCanBeSynchronized(fieldType) {
    var $field = _$(fieldType + 'Field');

    return ~_getOptionsByName('fields.toSynchronize').indexOf(fieldType) && $field.not('[readonly], [disabled]') &&
      !$field.data('no_synchronization');
  }

  function _synchronizeFields(fields) {
    $.each(fields, function(fieldType, fieldValue) {
      fieldValue && _fieldCanBeSynchronized(fieldType) &&
        _processFieldData(_$(fieldType + 'Field').val(fieldValue));
    });
  }

  function _disableFieldSynchronization() {
    _getCurrentComponent.call(this, function($this) {
      $this.data({'no_synchronization': true});
    });
  }

  function _getErrorsAccordingToRule(rule, $elementsToValidate) {
    return $elementsToValidate.map(function(index, element) {
      var
        $element = $(element),
        data = _getCurrentGroup($element).data(),
        error;

      switch(rule) {
        case 'invalid':
          error = $.trim($element.val()) && !data.valid && _createValidationError({
            message: data.invalidDataMessage,
            errorAttribute: data.type
          });
          break;
        case 'required':
          error = !$.trim($element.val()) && _createValidationError({
            message: data.requiredDataMessage,
            errorAttribute: data.type
          });
      }

      return error;
    }).get().filter(function(error) { return error; });
  }

  function _createValidationError(data) {
    return {
      status: 422,
      message: data.message,
      errorAttribute: data.errorAttribute,
      name: 'ValidationError'
    };
  }

  function _getFlashMessageContainer() {
    return _getOptionsByName('selectors.flashMessage') ? $(_getOptionsByName('selectors.flashMessage')) :
      _$('flashMessage');
  }

  function _toggleFlashMessage(message, isSuccess) {
    if (message) {
      _getFlashMessageContainer().show().addClass(isSuccess ? 'with-success' : 'with-error').empty()
        .append($('<span>').text(message));
    } else {
      _getFlashMessageContainer().hide().removeClass('with-success, with-error').empty();
    }
  }

  function _parseToJSON(data) {
    try { return JSON.parse(data); }
    catch (error) { throw error; }
  }

  function _extractBaseErrorMessage(errors) {
    if (!errors) { return; }

    return Array.isArray(errors) ? errors
      .filter(function(error) { return error.base; })
      .map(function(error) { return error.base; })
      .join('<br>') : errors.base;
  }

  function _getBaseErrorMessage(error) {
    if (!error) { return; }

    if (typeof error === 'string') { error = _parseToJSON(error); }

    return _extractBaseErrorMessage(error.errors);
  }

  function _showErrors(errors) {
    Array.isArray(errors) ? errors.forEach(_showError) : _showError(errors);
  }

  function _showError(error) {
    error.name === 'ValidationError' ? _showFieldMessage(_$(error.errorAttribute + 'Group'), error.message) :
      _toggleFlashMessage(
        _getBaseErrorMessage(error.responseText) || app.config.api.errorMessages[error.status] ||
          _getOptionsByName('error') || app.config.api.errorMessages.default
      );
  }

  function _showFieldMessage($group, message, type) {
    type = type || 'error';

    $group.addClass('with-' + type).find('.js-' + type + '-message').empty().append($('<span>').text(message));
  }

  function _removeMessages($group) {
    ($group || _$currentComponent.find('[class*="js-group-"]:hidden')).removeClass('with-succes, with-error')
      .find('.js-error-message, .js-success-message').empty();
  }

  function _getValidationErrors(validationRules) {
    return Object.keys(validationRules).reduce(function(errors, rule) {
      return errors.concat(_getErrorsAccordingToRule(
        rule,
        _$(_optionalTypesToNames(validationRules[rule]))
      ));
    }, []);
  }

  function _validateComponent(validationRules) {
    var
      isValid = $.Deferred(),
      errors = _getValidationErrors(validationRules);

    return _$currentComponent.data('valid') && !errors.length ? isValid.resolve() : isValid.reject(errors);
  }

  function _clearAdditionalFieldsParams(fieldName) {
    return fieldName.split(':')[0];
  }

  function _filterComponentFields(options, fieldsToFilter, fieldsToExclude) {
    return !fieldsToExclude ? options : fieldsToFilter.reduce(function(result, optionsPair) {
      var
        parts = optionsPair.split('.'),
        searchingArea = parts[0],
        groupOfFields = parts[1];

      result[searchingArea][groupOfFields] = result[searchingArea][groupOfFields].filter(function(fieldName) {
        return fieldName && !~fieldsToExclude.indexOf(_clearAdditionalFieldsParams(fieldName));
      });

      return result;
    }, options);
  }

  function _shouldFieldBeExcluded(fieldName) {
    switch(fieldName) {
      case 'name':
        return _doesUserHaveNecessaryField('withName');
      default:
        return _doesUserHaveNecessaryField(fieldName);
    }
  }

  function _getFieldsToExclude() {
    return FIELDS_TO_RENDER.filter(function(fieldName) {
      return _shouldFieldBeExcluded(fieldName);
    });
  }

  function _mapPasswordToPasswordAndCode(options) {
    return options.reduce(function(result, currentValue) {
      return result.concat(currentValue === 'password' ? ['password', 'code'] : currentValue);
    }, []);
  }

  function _extendOptionsWithCodeField(options, optionsToExclude) {
    var fieldsOptions = options.fields;

    options.fields = Object.keys(fieldsOptions).reduce(function(preparedOptions, currentOptionKey) {
      var currentOptionValue = fieldsOptions[currentOptionKey];

      preparedOptions[currentOptionKey] = (
        Array.isArray(currentOptionValue) && !applicationUtils.isInArray(currentOptionKey, optionsToExclude) ?
          _mapPasswordToPasswordAndCode(currentOptionValue) : currentOptionValue
      );

      return preparedOptions;
    }, {});

    return options;
  }

  function _addPasswordField(options) {
    ['set', 'required'].forEach(function(fieldsSet) {
      !~options.fields[fieldsSet].indexOf('password') && options.fields[fieldsSet].push('password');
    });

    return options;
  }

  function _noNeedToExtendArrayWithNull(defaultValue, newValue) {
    return !Array.isArray(defaultValue) || defaultValue.length <= newValue.length;
  }

  function _extendArrayWithNull(defaultValue, newValue) {
    return defaultValue.map(function(item, index) {
      return newValue[index] ? newValue[index] : null;
    });
  }

  // Need first array(defaultValue) has length less or equal second array length(newValue) to merge them properly.
  // As result second array will rewrite first array, instead of extending it, when we'll use $.extend(true, ...).
  function _prepareForDeepExtending(options) {
    var newFieldsData = options.fields || {};

    options.fields = Object.keys(newFieldsData).reduce(function(result, currentKey) {
      var
        defaultValue = _default.fields[currentKey],
        newValue = newFieldsData[currentKey];

      result[currentKey] = _noNeedToExtendArrayWithNull(defaultValue, newValue) ? newValue :
        _extendArrayWithNull(defaultValue, newValue);

      return result;
    }, {});

    return options;
  }

  function _removeNullValues(options) {
    options.fields = Object.keys(options.fields).reduce(function(result, currentKey) {
      result[currentKey] = Array.isArray(options.fields[currentKey]) ?
        options.fields[currentKey].filter(function(value) { return !!value; }) : options.fields[currentKey];

      return result;
    }, {});

    return options;
  }

  function _mapEmailToMultipleType(fieldType) {
    if (fieldType !== 'email') { return fieldType; }

    return 'multiple';
  }

  function _removePhoneType(fieldType) {
    return fieldType !== 'phone';
  }

  function _convertEmailAndPhoneToMultipleField(options) {
    if (!options.withMultipleField) { return options; }

    options.fields = Object.keys(options.fields).reduce(function(result, fieldsSetKey) {
      result[fieldsSetKey] = Array.isArray(options.fields[fieldsSetKey]) ? options.fields[fieldsSetKey]
        .map(_mapEmailToMultipleType)
        .filter(_removePhoneType) : options.fields[fieldsSetKey];

      return result;
    }, {});

    return options;
  }

  function _prepareOptions(options, containerData) {
    var
      resultOptions = _extendOptionsWithCodeField(
        _addPasswordField(
          _removeNullValues($.extend(
            true,
            {},
            _default,
            options && _prepareForDeepExtending(options),
            containerData
          ))
        ),
        OPTIONS_TO_EXCLUDE_FROM_EXTENDING_WITH_CODE_FIELD
      );

    return _convertEmailAndPhoneToMultipleField(
      _filterComponentFields(
        resultOptions,
        ['fields.toSynchronize', 'fields.toCheckFormat', 'fields.required',
        'fields.visibleForNewUsers', 'fields.hiddenByDefault', 'fields.set'],
        _getFieldsToExclude()
      )
    );
  }

  function _initPlugins($container, options) {
    options.fields.hints && _$currentComponent.find('.js-qtip-icon').trigger('init:initQtip');
    _$('phoneField').trigger('init:phoneMask');

    options.popup && $container.dialog($.extend(
      {
        modal: true,
        dialogClass: 'auth-component-popup',
        resizable: false
      },
      applicationUtils.mapAccordingToSchema(options.popup, MAP_TO_DIALOG_OPTIONS)
    ));
  }

  function _renderSocialNetworksAuthComponent($container, options) {
    return $container.find('.js-social-networks-auth-component-container')
      .trigger('render:socialNetworksAuthComponent', [{
        type: 'simple',
        onSuccess: function() {
          options[ON_EVENT.completed]();
          _runActionOnSuccess();
        },
        onError: options[ON_EVENT.error],
        newSchema: options.newSocialRegistrationSchema,
      }]).end();
  }

  function _renderSubComponents($container, options) {
    return options.withSocialRegistration ? _renderSocialNetworksAuthComponent($container, options) : $container;
  }

  function _renderComponent($container, options) {
    options = _prepareOptions(options, $container.data(DATA_SCOPE_NAME));

    _findCurrentComponent(
      _renderSubComponents(
        $container.html(
          $(HandlebarsTemplates[TEMPLATES_PATH + '/' + _getPlatform() + '/' + options.type](
            _prepareDataToRender(options))
          ).data({options: options})
        ),
        options
      )
    );

    _doOnResult(ON_EVENT.mount);
    _toggleComponentLoadingIndicator(true, CLASS_NAMES.initialLoading);

    _initPlugins($container, options);

    // we need timeout to process autofill form scenario
    setTimeout(function() {
      _onBeforeProcessDataOnRender();
      _processDataOnRender().then(_onAfterProcessDataOnRender.bind(null, $container));
    }, 400);
  }

  function _onRenderComponent(event, options, $store) {
    if (_doesUserHaveNecessaryField('email')) { return; }

    _initStore($store);

    _renderComponent($(event.target), options);
  }

  function _initStore($store) {
    $store && (_$store = $store);
  }

  function _prepareTipContent(options) {
    for (var contentType in options.content) {
      if (options.content[contentType].tip) {
        options.content[contentType].tip = options.content[contentType].tip.replace(
          '%buttonText%', options.content[contentType].buttonText
        );
      }
    }

    return options;
  }

  function _prepareDataToRender(options) {
    return _prepareTipContent($.extend(
      {},
      $.extend(
        true,
        {},
        app.config.authComponent || {},
        options
      ),
      {platform: _getPlatform()},
      _$store.data('authComponent')
    ));
  }

  function _getOptionsByName(name) {
    if (!_$currentComponent) { return null; }

    return name.split('.').reduce(function(result, optionName) {
      return result[optionName];
    }, _$currentComponent.data('options'));
  }


  function _isValueTruthy(object, key) {
    return !!object[key];
  }

  function _getDataToIncrease(isMerge) {
    return applicationUtils.filterObject($.extend(isMerge ? {
        id: _currentProcessingUser.id,
      } : {
        id: userUtils.getUserAttribute('id'),
        email: _$('emailField:not(:disabled)').val(),
        phone: _$('phoneField:not(:disabled)').val(),
        name: _$('nameField:not(:disabled)').val()
    }, _getUsersCode()), _isValueTruthy);
  }

  function _getUsersCode() {
    return {
      password: _$('passwordField:not(:disabled)').val(),
      'auth_code': _$('codeField:not(:disabled)').val()
    };
  }

  function _prepareDataToSignUp(data) {
    if (_getOptionsByName('simpleRegistration')) { data.type = REGISTRATION_TYPES.simple; }

    return data;
  }

  function _increaseAuthorizationLevel() {
    return _api({
      url: _currentProcessingUser ? app.config.api.mergesURL :
        app.config.api.updateUserURL.replace('_id_', userUtils.getUserAttribute('id')),
      method: _currentProcessingUser ? 'POST' : 'PUT',
      data: _getDataToIncrease(_currentProcessingUser)
    });
  }

  function _registerUser(data) {
    return app.modules.userAPI.signUp(_prepareDataToSignUp(_getComponentData(data)));
  }

  function _authorizeUser() {
    return app.modules.userAPI.signIn(_getComponentData()).done(_onAfterAuthorizeUser);
  }

  function _doCrossDomainAuthByCondition(crossDomainAuth) {
    return crossDomainAuth ? app.modules.crossDomainAuthBridge.authorizeUser() : $.Deferred().resolve();
  }

  function _registerOrAuthorizeUser(user) {
    return user ? _authorizeUser() : _registerUser();
  }

  function _processUserData() {
    _doOnResult(ON_EVENT.processUserData, _$currentComponent);

    return _validateComponent({
      invalid: 'toCheckFormat',
      required: 'required'
    }).then(_onAfterValidateComponentWithSuccess);
  }

  function _onAfterAuthorizeUser(data) {
    _doCrossDomainAuthByCondition(_getOptionsByName('crossDomainAuth'));
  }

  function _onAfterValidateComponentWithSuccess() {
    if (app.config.isUserSigned) {
      if (_currentProcessingUser) {
        // ids can be equal in case when user:
        // 1. Open several browser tabs with auth component
        // 2. Increase auth level in first tab.
        // 3. Try to authorize with the same data(from the first tab) in the second tab.
        return _currentProcessingUser.id !== userUtils.getUserAttribute('id') ?
          _increaseAuthorizationLevel().then(function(data) {
            return applicationUtils.listenProcess({
              url: data.url,
              pid: data.pid,
              resolveWith: _currentProcessingUser,
            });
          }).then(_registerOrAuthorizeUser) :
            $.Deferred().resolve({user: _currentProcessingUser});
      } else {
        return _increaseAuthorizationLevel();
      }
    }

    return _registerOrAuthorizeUser(_currentProcessingUser);
  }

  function _getPrepareUserProcessType() {
    if (_wasUserSignedBeforeProcessingData && _currentProcessingUser) {
      return PREPARE_USER_PROCESS_TYPE.merge;
    }

    if (_wasUserSignedBeforeProcessingData) {
      return PREPARE_USER_PROCESS_TYPE.increase;
    }

    return null;
  }

  function _getResultProcessType() {
    if (_wasUserSignedBeforeProcessingData && _currentProcessingUser) {
      return RESULT_PROCESS_TYPE.signIn;
    }

    if (_wasUserSignedBeforeProcessingData) { return null; }

    return RESULT_PROCESS_TYPE.signUp;
  }

  function _getProcessDescriptionData(user) {
    return {
      prepareUserProcessType: _getPrepareUserProcessType(),
      resultProcessType: _getResultProcessType(),
      user: user,
    };
  }

  function _getFieldValue(fieldType) {
    return _$(fieldType + 'Field:not(:disabled)').val();
  }

  function _getOriginalComponentData() {
    return {
      id: _getFieldValue('user'),
      email: _getFieldValue('email'),
      phone: _getFieldValue('phone'),
      password: _getFieldValue('password'),
      'auth_code': _getFieldValue('code'),
      'profile_attributes': _getFieldValue('name') && {name: _getFieldValue('name')},
    };
  }

  function _getComponentData(data) {
    data = data || {};

    return applicationUtils.filterObject(
      data.withSID ? data : _getOriginalComponentData(),
      function(obj, key) { return obj[key]; }
    );
  }

  function _writeDataInStore() {
    _$store.data('authComponent', {user: _getComponentData()});
  }

  function _getComponentFieldsSelector() {
    return _namesToSelectorStr('userField, nameField, emailField, phoneField, passwordField, codeField');
  }

  function _isFieldFilled($field) {
    return $field.val().length;
  }

  function _setValidFieldValidationState($field) {
    _toggleFieldValidationState($field, true);
  }

  function _validateDataFormat() {
    return $.when.apply(null, Array.prototype.slice.call(arguments).map(function(fieldName) {
      var $field = _$(fieldName);

      return $field.length && _isFieldFilled($field) && _validateFieldDataFormat($field);
    }));
  }

  function _needToValidateWithUserSearching($field) {
    return !~FIELDS_TO_VALIDATE_WITHOUT_SEARCHING.indexOf(_getCurrentGroup($field).data('type'));
  }

  function _validateFieldDataFormat($field) {
    if (_needToValidateWithUserSearching($field)) {
      _resetFormState();

      return _validate(_getFieldToValidate($field))
        .done(_setValidFieldValidationState)
        .fail(_failValid);
    }

    return _validate($field)
      .done(_setValidFieldValidationState)
      .fail(_toggleFieldValidationState);
  }

  function _processDataOnRender() {
    var $$processDataOnRender = $.Deferred();

    _validateDataFormat('nameField', 'passwordField').always(function() {
      _validateDataFormat('phoneField', 'emailField').then(_searchUser)
        .always($$processDataOnRender.resolve);
    });

    return $$processDataOnRender;
  }

  function _markComponentAsInitialized($component) {
    return $component.data({initialized: true});
  }

  function _onSetSelfClearedFieldsState() {
    var selfClearedFieldsTypes = _getOptionsByName('fields.selfCleared');

    selfClearedFieldsTypes && _setSelfClearedFieldsState(selfClearedFieldsTypes);
  }

  function _onBeforeProcessDataOnRender() {
    _getOptionsByName('withMultipleField') && _mutateMultipleField();
    _setDefaultContentType();
    _doOnResult('onBeforeProcessDataOnRender');
  }

  function _onAfterProcessDataOnRender($container) {
    _toggleComponentLoadingIndicator(false, CLASS_NAMES.initialLoading, $container);
    _onSetSelfClearedFieldsState();
    _unmountComponent = _currentComponentListener($container);
    _setPasswordAutoFilledState();
    _doOnResult(ON_EVENT.render, _markComponentAsInitialized(_findCurrentComponent($container)));
  }

  function _doOnResult(onResult) {
    _getOptionsByName(onResult) &&
      _getOptionsByName(onResult).apply(null, Array.prototype.slice.call(arguments, 1));
  }

  function _onProcessUserDataDone($$processUser, data) {
    userUtils.setConfigData(data.user);
    _toggleFlashMessage();
    _$store.data(data.user);
    _unmountComponent();
    $$processUser && $$processUser.resolve();
    _doOnResult(ON_EVENT.completed, _getProcessDescriptionData(data.user), _$currentComponent);
  }

  function _onProcessUserDataFail($$processUser, errors) {
    _removeMessages(_$('passwordGroup, codeGroup'));
    _showErrors(errors);
    _toggleCodeFields(true, _needToHideCodeFields());
    _toggleGenerateCodeLinks(_currentProcessingUser);
    _toggleDisableState('submitButton', false);
    _doOnResult(ON_EVENT.error, errors, _$currentComponent);
    $$processUser && $$processUser.reject(errors);
  }

  function _onProcessUserData(event, $$processUser) {
    _findCurrentComponent($(this));
    _runAuthorizationCycle($$processUser);
  }

  function _onSynchronizeFields(event, fields) {
    _findCurrentComponent($(this));
    _synchronizeFields(fields);
    _writeDataInStore();
  }

  function _onRegister(event, $$authUser, options) {
    options = options || {};

    // For backwards compatibility
    _registerUser(options.data ? $.extend({withSID: options.withSID}, options.data) : options)
      .done(function(data) { _onAfterRegisterWithSuccess(data, $$authUser, options); })
      .fail($$authUser.reject);
  }

  function _onAfterRegisterWithSuccess(data, $$authUser, options) {
    userUtils.setConfigData(data.user);

    _doCrossDomainAuthByCondition(options.crossDomainAuth)
      .done(function() { $$authUser && $$authUser.resolve(); })
      .fail(function(error) { $$authUser && $$authUser.reject(error); });
  }

  function _onUnmount($container) {
    $container.remove();
    $(this).off('processUserData:authComponent synchronizeFields:authComponent unmount:authComponent');
  }

  function _getFieldsToCheckFormat() {
    return _$(_optionalTypesToNames('toCheckFormat'));
  }

  function _needToValidateField($field) {
    return _getFieldsToCheckFormat().is($field);
  }

  function _processLastActiveFieldChanges() {
    return _$lastActiveField && _needToValidateField(_$lastActiveField) ?
      _processFieldData(_$lastActiveField) : $.Deferred().resolve();
  }

  function _prepareActionOnSuccessData(data) {
    return typeof data === 'string' ? {act: data} : data;
  }

  function _getActionOnSuccessParams(data) {
    return Object.keys(data).reduce(function(result, currentItem) {
      var params = data[currentItem].split('=');

      result[currentItem] = {
        name: $.trim(params[0]),
        url: $.trim(params[1]) || null
      };

      return result;
    }, {});
  }

  function _getActionOnSuccessEventName(data) {
    return typeof data === 'string' ? EVENTS.act : (_currentProcessingUser ? EVENTS.signIn : EVENTS.signUp);
  }

  function _doActionOnSuccess(data) {
    var
      actionParams = _getActionOnSuccessParams(_prepareActionOnSuccessData(data)),
      eventName = _getActionOnSuccessEventName(data);

    switch(actionParams[eventName].name) {
      case ACTIONS.reload:
        return location.reload(true);
      case ACTIONS.redirect:
        return applicationUtils.setLocationHref(actionParams[eventName].url);
    }
  }

  function _processSubmitResults($$processUser, $container) {
    $$processUser
      .done(_onProcessSubmitResultsWithSuccess.bind($container))
      .fail(_onProcessSubmitResultsWithError.bind($container));
  }

  function _runAuthorizationCycle($$processUser) {
    _toggleComponentLoadingIndicator(true);
    _wasUserSignedBeforeProcessingData = app.config.isUserSigned;

    _processLastActiveFieldChanges().always(function() {
      _processUserData()
        .done(_onProcessUserDataDone.bind(null, $$processUser))
        .fail(_onProcessUserDataFail.bind(null, $$processUser))
        .always(function() { _toggleComponentLoadingIndicator(); });
    });
  }

  function _runActionOnSuccess() {
    var actionOnSuccessData = _getOptionsByName('actionOnSuccess');

    actionOnSuccessData && _doActionOnSuccess(actionOnSuccessData);
  }

  function _onProcessSubmitResultsWithSuccess() {
    $(this).trigger('afterAuthorizeWithSuccess:authComponent');

    _runActionOnSuccess();
  }

  function _onProcessSubmitResultsWithError(errors) {
    $(this).trigger('afterAuthorizeWithError:authComponent', [errors]);
  }

  function _processUserDataOnSubmit() {
    var $$processUser = $.Deferred();

    _runAuthorizationCycle($$processUser);

    _processSubmitResults($$processUser, $(this));
  }

  function _onSubmit(event) {
    event.preventDefault();

    _toggleDisableState('submitButton', true);

    _doOnResult('onSubmit');

    _processUserDataOnSubmit.call(this);
  }

  function _onCloseComponent() {
    _getOptionsByName('popup') && $(this).dialog('close');
  }

  function _onToggleClearIcon() {
    _toggleClearFieldIcon($(this));
  }

  function _onToggleIconToTogglePassword() {
    _withAutoFilledPassword && _toggleIconToTogglePassword($(this));
  }

  function _onTogglePassword() {
    _togglePassword($(this));
  }

  function _onClearField() {
    var $fieldToClear = _$(_typesToNames(_getCurrentGroup($(this)).data('type')));

    _clearField($fieldToClear);
    _onSetPasswordAutoFilledState($fieldToClear);
  }

  function _clearField($field) {
    $field.val('').trigger('input').focus();
  }

  function _toggleGroupClassName($field, className) {
    _getCurrentGroup($field).toggleClass(className, !!$field.val());
  }

  function _toggleClearFieldIcon($field) {
    _toggleGroupClassName($field, CLASS_NAMES.selfClearedFormGroup);
  }

  function _toggleIconToTogglePassword($field) {
    _toggleGroupClassName($field, CLASS_NAMES.withToggledPasswordFormGroup);
  }

  function _togglePassword() {
    var $passwordField = _$('passwordField');

    _$('passwordField').attr({type: $passwordField.attr('type') === 'text' ? 'password' : 'text'});
  }

  function _isComponentInitialized($component) {
    if ($component) {
      applicationUtils.invariant(
        $component instanceof jQuery,
        ERROR_MESSAGES.notJQueryObject,
        $component
      );

      applicationUtils.invariant(
        _isAuthComponent($component),
        ERROR_MESSAGES.notAuthComponent
      );
    }

    return !!($component || _findCurrentComponent($(this))).data('initialized');
  }

  function _isAuthComponent($element) {
    return $element.is(SELECTORS.component);
  }

  function _currentComponentListener($container) {
    _$currentComponent
      .on('input change', _optionalTypesToSelector('toCheckFormat'), _onProcessingDataFieldEvent)
      .on('blur', _optionalTypesToSelector('toSynchronize'), _disableFieldSynchronization)
      .on('input', _optionalTypesToSelector('set'), _onInput)
      .on('input', _getComponentFieldsSelector(), _writeDataInStore)
      .on('click', _namesToSelectorStr('sendCodeLink, restorePasswordLink'), _onGenerateCode)

      .on('change', SELECTORS.userExistRadio, _change)
      .on('click', SELECTORS.userDoesntExistButton, _userDoesntExist)
      .on('click', SELECTORS.userExistsButton, _userExists)
      .on('submit', _onSubmit.bind($container));

    if (_getOptionsByName('fields.selfCleared')) {
      _$currentComponent
        .on('click', SELECTORS.clearFieldIcon, _onClearField)
        .on(TOGGLE_ICONS_EVENTS.join(' '), _optionalTypesToSelector('selfCleared'), _onToggleClearIcon);
    }

    if (_getOptionsByName('withToggledPassword')) {
      _$currentComponent
        .on('click', SELECTORS.togglePasswordIcon, _onTogglePassword)
        .on(TOGGLE_ICONS_EVENTS.join(' '), SELECTORS.passwordField, _onToggleIconToTogglePassword);
    }

    $container
      .on('processUserData:authComponent', _onProcessUserData)
      .on('synchronizeFields:authComponent', _onSynchronizeFields)
      .on('subscribeOnFieldValue:authComponent', function(event, fields, callback) {
        _$currentComponent.on('blur', _typesToSelector(fields), callback);
      })
      .on('unsubscribeFromFieldValue:authComponent', function(event, fields, callback) {
        _$currentComponent.off('blur', _typesToSelector(fields), callback);
      })
      .on('close:authComponent', _onCloseComponent);

    _$store
      .on('processUserData:authComponent', _onProcessUserData.bind($container))
      .on('synchronizeFields:authComponent', _onSynchronizeFields.bind($container))
      .on('unmount:authComponent', _onUnmount.bind(_$store, $container));

    return function() {
      _findCurrentComponent($container.addClass('processed-with-success')).off();
    };
  }

  function _commonListener() {
    $doc
      .on('render:authComponent', _onRenderComponent)
      .on('register:authComponent', _onRegister);
  }

  $.extend(self, {
    load: function() {
      _commonListener();
    },
    isInitialized: _isComponentInitialized,
    processUserData:  _onProcessUserData,
    reset: function() {
      _currentProcessingUser = null;
      _$currentComponent = null;
    },
  });

  return self;

})(app.modules.authComponent || {});
