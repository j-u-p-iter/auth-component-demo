//= require application/utils
//= require clearance/helpers/auth_component_handlebars_helpers
//= require clearance/services/user_validation_service
//= require clearance/core/user_utils
//= require clearance/components/auth_component/auth_component_utils
//= require clearance/components/auth_component/auth_component
//= require clearance/components/social_networks_auth_component/social_networks_auth_component

// Came From test_utils:
// - resetAppConfig
// - extendAppConfig
// - resetEnvironment
// - mockAjax
// - renderAuthComponent


describe('authComponent', function() {

  var
    SELECTORS = {
      component: '.js-auth-component',
      container: '.js-auth-component-container',
      restorePasswordLink: '.js-restore-password-auth',
      socialNetworksAuthComponent: '.js-social-networks-auth-component',
      fields: {
        email: '.js-input-email-auth',
        phone: '.js-input-phone-auth',
        name: '.js-input-name-auth',
        password: '.js-input-password-auth',
      },
    },
    CLASS_NAMES = {
      loading: 'auth-component-loading',
      initialLoading: 'auth-component-initial-loading',
    },
    utils = app.modules.authComponentUtils,
    applicationUtils = app.modules.applicationUtils,
    userValidationService = app.modules.userValidationService;

  beforeEach(function() {
    resetEnvironment();
    app.modules.authComponent.reset();

    resetAppConfig();
    extendAppConfig({
      api: {
        usersURL: '/users',
        usersRegistrationURL: '/users-sign-up',
      },
      isUserSigned: false,
      currentUser: {},
      omniauthAuthorizeURL: '_provider_omniauthAuthorizeURL',
      newOmniauthAuthorizeURL: '_provider_newOmniauthAuthorizeURL',
      socialNetworkProviders: [
        'providerName1',
        'providerName2',
        'providerName3',
      ],
    });

    mockUserValidationService();
    mockAjax();

    app.modules.authComponentHandlebarsHelpers.load();
    app.modules.authComponent.load();
  });

  afterAll(function() {
    app.modules.userValidationService = userValidationService;
  });
  describe('initial spinner indicator', function() {
    var hasComponentInitialSpinner = function() {
      return $(SELECTORS.component, fixture.el).hasClass(CLASS_NAMES.initialLoading)
    };

    it('should be set on before process data on render', function(done) {
      renderAuthComponent({
        onBeforeProcessDataOnRender: function() {
          expect(hasComponentInitialSpinner()).toBe(true);
        },
        onRender: done,
      }, {
        onBeforeRender: function() {
          expect(hasComponentInitialSpinner()).toBe(false);
        },
      });
    });

    it('should be replace on render', function(done) {
      renderAuthComponent({
        onRender: function() {
          expect(hasComponentInitialSpinner()).toBe(false);
          done();
        },
      });
    });

    it('should not be set if withoutSpinner is true', function(done) {
      renderAuthComponent({
        withoutSpinner: true,
        onBeforeProcessDataOnRender: function() {
          expect(hasComponentInitialSpinner()).toBe(false);
        },
        onRender: done,
      });
    });
  });

  describe('state', function() {
    it('should be enabled before it was submitted', function(done) {
      signUpUser(
        null,
        {
          onRender: function($component) {
            var
              result = isComponentDisabled($component),
              expected = false;

            expect(result).toBe(expected);

            done();
          },
        }
      );
    });

    it('should be disabled during processing user data', function(done) {
      signUpUser(
        null,
        {
          onProcessUserData: function($component) {
            var
              result = isComponentDisabled($component),
              expected = true;

            expect(result).toBe(expected);
          },
          onCompleted:done,
        }
      );
    });

    it('should be disabled after processing user data with success', function(done) {
      signUpUser(
        null,
        {
          onCompleted: function(data, $component) {
            var
              result = isComponentDisabled($component),
              expected = true;

            expect(result).toBe(expected);

            done();
          },
        }
      );
    });

    it('should be enabled after processing user data with error', function(done) {
      mockUserValidationService(false);

      signUpUser(
        null,
        {
          onError: function(errors, $component) {
            var
              result = isComponentDisabled($component),
              expected = false;

            expect(result).toBe(expected);

            done();
          },
        }
      );
    });
  });

  describe('common spinner', function() {
    var hasComponentCommonSpinner = function() {
      return $(SELECTORS.component, fixture.el).hasClass(CLASS_NAMES.loading)
    };

    it('should be set on process user data', function(done) {
      signUpUser(
        {
          email: 'some@email.com',
          name: 'Some Name',
          password: 12345,
        },
        {
          onProcessUserData: function() {
            expect(hasComponentCommonSpinner()).toBe(true);
          },
          onCompleted: done,
        },
        {
          onBeforeRender: function() {
            expect(hasComponentCommonSpinner()).toBe(false);
          },
        }
      );
    });

    it('should be replace on completed', function(done) {
      signUpUser(
        {
          email: 'some@email.com',
          name: 'Some Name',
          password: 12345,
        },
        {
          onCompleted: function() {
            expect(hasComponentCommonSpinner()).toBe(true);
            done();
          },
        }
      );
    });

    it('should not be set if withoutSpinner is true', function(done) {
      signUpUser(
        {
          email: 'some@email.com',
          name: 'Some Name',
          password: 12345,
        },
        {
          withoutSpinner: true,
          onBeforeProcessDataOnRender: function() {
            expect(hasComponentCommonSpinner()).toBe(false);
          },
          onCompleted: done,
        }
      );
    });
  });

  describe('options', function() {
    var OPTION_TO_TEST = 'withSocialRegistration';

    describe('withSocialRegistration', function() {
      it('should be false by default', function(done) {
        renderAuthComponent({
          onRender: function($component) {
            expect($component.data('options')[OPTION_TO_TEST]).toBe(false);

            done();
          }
        });
      });

      it('should be able to set to true with rendering params', function(done) {
        var optionValue = true;

        renderAuthComponent({
          withSocialRegistration: optionValue,
          onRender: function($component) {
            expect($component.data('options')[OPTION_TO_TEST]).toBe(optionValue);

            done();
          }
        });
      });
    });

    describe('simpleRegistration', function() {
      var OPTION_TO_TEST = 'simpleRegistration';

      it('should be false by default', function(done) {
        renderAuthComponent({
          onRender: function($component) {
            expect($component.data('options')[OPTION_TO_TEST]).toBe(false);
            done();
          }
        });
      });

      it('should be able to set to true with rendering params', function(done) {
        var optionValue = true;

        renderAuthComponent({
          simpleRegistration: optionValue,
          onRender: function($component) {
            expect($component.data('options')[OPTION_TO_TEST]).toBe(optionValue);

            done();
          }
        });
      });
    });

    describe('withoutSpinner', function() {
      var OPTION_TO_TEST = 'withoutSpinner';

      describe('value', function() {
        it('should be false by default', function(done) {
          renderAuthComponent({
            onRender: function($component) {
              expect($component.data('options')[OPTION_TO_TEST]).toBe(false);
              done();
            }
          });
        });

        it('should be true if was set up to true', function(done) {
          var optionValue = true;

          renderAuthComponent({
            withoutSpinner: optionValue,
            onRender: function($component) {
              expect($component.data('options')[OPTION_TO_TEST]).toBe(optionValue);
              done();
            }
          });
        });
      });
    });
  });

  describe('fields', function() {
    describe('processing data', function() {
      var onProcessFieldDataEventSpy;

      beforeEach(function() {
        onProcessFieldDataEventSpy = jasmine.createSpy('onProcessFieldDataEvent');
      });

      afterEach(function() {
        onProcessFieldDataEventSpy.calls.reset();
      });

      it('runs on input event', function(done) {
        renderAuthComponent({
          onRender: function($component) {
            $component.find(SELECTORS.fields.email).val('safasdf@dsfss.ru').trigger('input');
          },
          onProcessFieldData: onProcessFieldDataEventSpy,
          onAfterFieldDataProcessed: function() {
            expect(onProcessFieldDataEventSpy.calls.count()).toBe(1);

            done();
          },
        });
      });

      it('runs on change event', function(done) {
        renderAuthComponent({
          onRender: function($component) {
            $component.find(SELECTORS.fields.email).val('safasdf@dsfss.ru').trigger('change');
          },
          onProcessFieldData: onProcessFieldDataEventSpy,
          onAfterFieldDataProcessed: function() {
            expect(onProcessFieldDataEventSpy.calls.count()).toBe(1);

            done();
          },
        });
      });
    });
  });

  describe('render', function() {
    describe('with autocomplete', function() {
      describe('with email', function() {
        var EMAIL_TO_SEARCH = 'newUser@email.com';

        it('should send correct request to search user by email', function(done) {
          renderAuthComponent({
            onRender: function($component) {
              var searchUserAjaxArguments = $.ajax.calls.argsFor(0)[0];

              expect($.ajax.calls.count()).toBe(1);
              expect(searchUserAjaxArguments.method).toBe(undefined);
              expect(searchUserAjaxArguments.url).toBe(app.config.api.usersURL);
              expect(searchUserAjaxArguments.data.email).toBe(EMAIL_TO_SEARCH);
              done();
            }
          }).find(SELECTORS.fields.email).val(EMAIL_TO_SEARCH);
        });
      });
    });

    describe('link to restore password', function() {
      it('should has dn className for new user', function(done) {
        var EMAIL_TO_SEARCH = 'newUser@email.com';

        renderAuthComponent({
          onRender: function($component) {
            var
              result = $component.find(SELECTORS.restorePasswordLink).hasClass('dn'),
              expected = true;

            expect(result).toBe(expected);
            done();
          }
        }).find(SELECTORS.fields.email).val(EMAIL_TO_SEARCH);
      });

      it('should not has dn className for user with phone and with email', function(done) {
        var EMAIL_TO_SEARCH = 'some@email.com';

        renderAuthComponent({
          onRender: function($component) {
            var
              result = $component.find(SELECTORS.restorePasswordLink).hasClass('dn'),
              expected = false;

            expect(result).toBe(expected);
            done();
          }
        }).find(SELECTORS.fields.email).val(EMAIL_TO_SEARCH);
      });

      it('should has dn className for user with phone and without email', function(done) {
        var PHONE_TO_SEARCH = '+79121231212';

        renderAuthComponent({
          onRender: function($component) {
            var
              result = $component.find(SELECTORS.restorePasswordLink).hasClass('dn'),
              expected = true;

            expect(result).toBe(expected);
            done();
          }
        }).find(SELECTORS.fields.phone).val(PHONE_TO_SEARCH);
      });
    });

    describe('subcomponent', function() {
      describe('socialNetworksAuthComponent', function() {
        beforeEach(function() {
          app.modules.socialNetworksAuthComponent.load();
        });

        describe('render', function() {
          describe('when withSocialRegistration equals to false', function() {
            it('should not been done', function(done) {
              renderAuthComponent({
                onRender: function($component) {
                  var
                    result = $component.find(SELECTORS.socialNetworksAuthComponent).length,
                    expected = 0;

                  expect(result).toBe(expected);

                  done();
                },
              });
            });
          });

          describe('when withSocialRegistration equals to true', function() {
            it('should be done', function(done) {
              renderAuthComponent({
                withSocialRegistration: true,
                onRender: function($component) {
                  var
                    result = $component.find(SELECTORS.socialNetworksAuthComponent).length,
                    expected = 1;

                  expect(result).toBe(expected);

                  done();
                },
              });
            });
          });

          describe('options', function() {
            describe('type', function() {
              it('should be equal to simple', function(done) {
                renderAuthComponent({
                  withSocialRegistration: true,
                  onRender: function($component) {
                    var
                      result = $component.find(SELECTORS.socialNetworksAuthComponent).data('props').type,
                      expected = 'simple';

                    expect(result).toBe(expected);

                    done();
                  },
                });
              });
            });

            describe('callbacks', function() {
              describe('onSuccess', function() {
                it('should redirect according to redirect action url', function(done) {
                  var urlToRedirect = 'http://some-redirect-url:8000';

                  spyOn(applicationUtils, 'setLocationHref');

                  renderAuthComponent({
                    withSocialRegistration: true,
                    actionOnSuccess: 'redirect=' + urlToRedirect,
                    onRender: function($component) {
                      var socialNetworksAuthComponentProps = (
                        $component.find(SELECTORS.socialNetworksAuthComponent).data('props')
                      );

                      socialNetworksAuthComponentProps.onSuccess();

                      expect(applicationUtils.setLocationHref).toHaveBeenCalled();
                      expect(applicationUtils.setLocationHref.calls.argsFor(0)[0]).toBe(urlToRedirect);

                      done();
                    },
                  });
                });

                it('should call ak onCompleted callback', function(done) {
                  var callbacks = {onCompleted: function() { }};

                  spyOn(callbacks, 'onCompleted');

                  renderAuthComponent({
                    withSocialRegistration: true,
                    onCompleted: callbacks.onCompleted,
                    onRender: function($component) {
                      var socialNetworksAuthComponentProps = (
                        $component.find(SELECTORS.socialNetworksAuthComponent).data('props')
                      );

                      socialNetworksAuthComponentProps.onSuccess();

                      expect(callbacks.onCompleted).toHaveBeenCalled();

                      done();
                    },
                  });
                });
              });

              describe('onError', function() {
                it('should call ak onError callback', function(done) {
                  var callbacks = {onError: function() {}};

                  renderAuthComponent({
                    withSocialRegistration: true,
                    onError: callbacks.onError,
                    onRender: function($component) {
                      var socialNetworksAuthComponentProps = (
                        $component.find(SELECTORS.socialNetworksAuthComponent).data('props')
                      );

                      expect(socialNetworksAuthComponentProps.onError).toBe(callbacks.onError);

                      done();
                    },
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  describe('options', function() {
    it('should be set on component in data("options")', function(done) {
      renderAuthComponent({
        onRender: function($component) {
          var result = $component.data('options');

          expect(result).toBeTruthy();

          done();
        },
      });
    });

    it('should be the plain object', function(done) {
      renderAuthComponent({
        onRender: function($component) {
          var
            result = applicationUtils.isPlainObject($component.data('options')),
            expected = true;

          expect(result).toBe(true);

          done();
        },
      });
    });

    it('should has correct keys', function(done) {
      renderAuthComponent({
        onRender: function($component) {
          var
            result = Object.keys($component.data('options')),
            expected = [
              'type',
              'fields',
              'orientation',
              'selectors',
              'crossDomainAuth',
              'contentType',
              'toggleContent',
              'withMultipleField',
              'withToggledPassword',
              'actionOnSuccess',
              'popup',
              'error',
              'title',
              'buttonText',
              'simpleRegistration',
              'withoutSpinner',
              'withSocialRegistration',
              'newSocialRegistrationSchema',
              'onMount',
              'onRender',
              'onSearch',
              'onCompleted',
              'onProcessUserData',
              'onProcessFieldData',
              'onAfterFieldDataProcessed',
              'onBeforeProcessDataOnRender',
              'onSubmit',
              'onError',
            ];

          expect(result).toEqual(expected);

          done();
        },
      });
    });

    describe('fields', function() {
      describe('toCheckFormat', function() {
        it('should be correct by default', function(done) {
          renderAuthComponent({
            onRender: function($component) {
              var
                result = $component.data('options').fields.toCheckFormat,
                expected = ['name', 'email', 'phone', 'password'];

              expect(result).toEqual(expected);

              done();
            }
          });
        });

        it('should be updated correctly', function(done) {
          renderAuthComponent({
            fields: {
              toCheckFormat: ['name', 'password'],
            },
            onRender: function($component) {
              var
                result = $component.data('options').fields.toCheckFormat,
                expected = ['name', 'password'];

              expect(result).toEqual(expected);

              done();
            },
          });
        });

        it('should not be extended with password field', function(done) {
          renderAuthComponent({
            fields: {toCheckFormat: ['name', 'email']},
            onRender: function($component) {
              var
                result = applicationUtils.isInArray('password', $component.data('options').fields.toCheckFormat),
                expected = false;

              expect(result).toBe(expected);

              done();
            },
          });
        });

        it('should not be extended with code field', function(done) {
          renderAuthComponent({
            fields: {toCheckFormat: ['name', 'password']},
            onRender: function($component) {
              var
                result = applicationUtils.isInArray('code', $component.data('options').fields.toCheckFormat),
                expected = false;

              expect(result).toBe(expected);

              done();
            },
          });
        });

        it('should not contain null value', function(done) {
          renderAuthComponent({
            fields: {toCheckFormat: [null, 'email']},
            onRender: function($component) {
              var
                result = $component.data('options').fields.toCheckFormat,
                expected = ['email'];

              expect(result).toEqual(expected);

              done();
            },
          });
        });

        it('should not contain name field if current user already has name', function(done) {
          app.config.currentUser.withName = true;

          renderAuthComponent({
            fields: {toCheckFormat: ['name', 'email']},
            onRender: function($component) {
              var
                result = $component.data('options').fields.toCheckFormat,
                expected = ['email'];

              expect(result).toEqual(expected);

              done();
            },
          });
        });

        it('should not contain phone field if current user primary provider equals to phone', function(done) {
          app.config.currentUser.phone = '+79122342334';

          renderAuthComponent({
            fields: {toCheckFormat: ['name', 'email', 'phone', 'password']},
            onRender: function($component) {
              var
                result = $component.data('options').fields.toCheckFormat,
                expected = ['name', 'email', 'password'];

              expect(result).toEqual(expected);

              done();
            },
          });
        });

        it('should contain multiple field instead of phone and email if withMultipleField is on', function(done) {
          renderAuthComponent({
            fields: {toCheckFormat: ['name', 'email', 'phone', 'password']},
            withMultipleField: true,
            onRender: function($component) {
              var
                result = $component.data('options').fields.toCheckFormat,
                expected = ['name', 'multiple', 'password'];

              expect(result).toEqual(expected);

              done();
            },
          });
        });
      });
    });
  });

  describe('onEvents', function() {
    describe('onSearch', function() {
      var
        onSearchEventSpy = jasmine.createSpy('onSearchEventSpy'),
        testOnSearchEventWithSpy = testOnSearchEvent.bind(null, onSearchEventSpy);

      beforeEach(function() {
        onSearchEventSpy.calls.reset();
      });

      describe('by email', function() {
        it('should not be called if email is not valid', function(done) {
          mockUserValidationService(false);

          testOnSearchEventWithSpy(
            {email: 'invalidEmail'},
            function() {
              expect(onSearchEventSpy).not.toHaveBeenCalled();
              done();
            }
          );
        });

        it('should be called if email is valid', function(done) {
          testOnSearchEventWithSpy(
            {email: 'valid@email.com'},
            function() {
              expect(onSearchEventSpy).toHaveBeenCalled();
              done();
            }
          );
        });

        it('should be called with correct arguments if user was found', function(done) {
          testOnSearchEventWithSpy(
            {email: 'some@email.com'},
            function() {
              expect(onSearchEventSpy).toHaveBeenCalledWith({
                type: 'email',
                user: users[0],
              });
              done();
            }
          );
        });

        it('should be called with correct argument if user was not found', function(done) {
          testOnSearchEventWithSpy(
            {email: 'invalid@email.com'},
            function() {
              expect(onSearchEventSpy).toHaveBeenCalledWith({
                type: 'email',
                user: null,
              });
              done();
            }
          );
        });
      });

      describe('by email and phone', function(done) {
        it('should not be called if phone is not valid', function(done) {
          mockUserValidationService(false);

          testOnSearchEventWithSpy(
            {
              email: 'valid@email.com',
              phone: '+7912',
            },
            function() {
              expect(onSearchEventSpy).not.toHaveBeenCalled();
              done();
            }
          );
        });

        it('should not be called if email is not valid', function(done) {
          mockUserValidationService(false);

          testOnSearchEventWithSpy(
            {
              email: 'invalid@email.com',
              phone: 'validPhone',
            },
            function() {
              expect(onSearchEventSpy).not.toHaveBeenCalled();
              done();
            }
          );
        });

        it('should be called if phone and email are valid', function(done) {
          testOnSearchEventWithSpy(
            {
              email: 'valid@email.com',
              phone: 'validPhone',
            },
            function() {
              expect(onSearchEventSpy).toHaveBeenCalled();
              done();
            }
          );
        });

        it('should be called with correct arguments if user was found by email but not by phone', function(done) {
          testOnSearchEventWithSpy(
            {
              email: 'some@email.com',
              phone: '+79122814331'
            },
            function() {
              expect(onSearchEventSpy).toHaveBeenCalledWith({
                type: 'email!phone',
                user: users[0],
              });
              done();
            }
          );
        });

        it('should be called with correct argument if user was found by phone and by email', function(done) {
          testOnSearchEventWithSpy(
            {
              email: 'some@email.com',
              phone: '+79122814334',
            },
            function() {
              expect(onSearchEventSpy).toHaveBeenCalledWith({
                type: 'email&phone',
                user: users[0],
              });
              done();
            }
          );
        });

        it('should be called with correct argument if user was found only by phone in users table', function(done) {
          testOnSearchEventWithSpy(
            {
              email: 'someUnique@email.com',
              phone: '+79122814332',
            },
            function() {
              expect(onSearchEventSpy.calls.argsFor(0)[0]).toEqual({
                type: 'phoneInUsers',
                user: users[1],
              });
              done();
            }
          );
        });

        it('should be called with correct argument if user was found only by phone in contacts table', function(done) {
          testOnSearchEventWithSpy(
            {
              email: 'someUnique@email.com',
              phone: '+79125343432',
            },
            function() {
              expect(onSearchEventSpy.calls.argsFor(0)[0]).toEqual({
                type: 'phoneInContacts',
                users: [users[0]],
              });

              done();
            }
          );
        });

        it('should be called with correct argument if user was not find', function(done) {
          testOnSearchEventWithSpy(
            {
              email: 'super@email.com',
              phone: '+79123533434',
            },
            function() {
              expect(onSearchEventSpy.calls.argsFor(0)[0]).toEqual({
                type: 'phone',
                user: null,
              });

              done();
            }
          );
        });
      });

      describe('by phone', function() {
        it('should not be called if phone is not valid', function(done) {
          mockUserValidationService(false);

          testOnSearchEventWithSpy(
            {phone: '+71232314'},
            function() {
              expect(onSearchEventSpy).not.toHaveBeenCalled();

              done();
            }
          );
        });

        it('should be called with correct argument if phone was found in users table', function(done) {
          testOnSearchEventWithSpy(
            {
              phone: '+79122814332',
            },
            function() {
              expect(onSearchEventSpy.calls.argsFor(0)[0]).toEqual({
                type: 'phoneInUsers',
                user: users[1],
              });

              done();
            }
          );
        });

        it('should be called with correct argument if phone was found in contacts table', function(done) {
          testOnSearchEventWithSpy(
            {
              phone: '+79125343433',
            },
            function() {
              expect(onSearchEventSpy.calls.argsFor(0)[0]).toEqual({
                type: 'phoneInContacts',
                users: [users[1]],
              });

              done();
            }
          );
        });

        it('should be called with correct argument if user was not found', function(done) {
          testOnSearchEventWithSpy(
            {
              phone: '+79125343234',
            },
            function() {
              expect(onSearchEventSpy.calls.argsFor(0)[0]).toEqual({
                type: 'phone',
                user: null,
              });

              done();
            }
          );
        });
      });
    });
  });
  describe('auth configs', function() {
    describe('isUserSigned', function() {
      it('should be updated after user data was processed', function(done) {
        expect(app.config.isUserSigned).toBe(false);

        signUpUser({
          email: 'some@email.com',
          name: 'Some Name',
          password: 12345,
        }, {
          onCompleted: function() {
            expect(app.config.isUserSigned).toBe(true);
            done();
          },
        });
      });
    });
  });

  describe('isInitialized method', function() {
    var methodToTest = app.modules.authComponent.isInitialized;

    it('should throw if argument is not jQuery object', function() {
      var argument = 'Some String';

      expect(methodToTest.bind(null, argument))
        .toThrowError('Argument should be present with jQuery object, instead got ' + argument);
    });

    it('should throw if argument is not authComponent', function() {
      expect(methodToTest.bind(null, $(''))).toThrowError('Argument should contain authorization component');
    });

    it('should be available', function() {
      var
        result = $.isFunction(methodToTest),
        expected = true;

      expect(result).toBe(expected);
    });

    it('should return false before component was rendered', function(done) {
      renderAuthComponent({
        onBeforeProcessDataOnRender: function() {
          var
            result = methodToTest.apply(fixture.el),
            expected = false;

          expect(result).toBe(expected);
        },
        onRender: done,
      });
    });

    it('should return true after component was rendered', function(done) {
      renderAuthComponent({
        onRender: function($component) {
          var
            result = methodToTest($component),
            expected = true;

          expect(result).toBe(expected);

          done();
        },
      });
    });

    it('should work properly with argument and context', function(done) {
      renderAuthComponent({
        onRender: function($component) {
          var
            result1 = methodToTest($component),
            result2 = methodToTest.apply(fixture.el),
            expected = true;

          expect(result1).toBe(expected);
          expect(result2).toBe(expected);

          done();
        },
      });
    });
  });
});
