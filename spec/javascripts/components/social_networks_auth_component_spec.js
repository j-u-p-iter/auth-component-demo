//= require application/utils

//= require clearance/core/user_api
//= require clearance/core/user_utils
//= require clearance/components/social_networks_auth_component/social_networks_auth_component


describe('socialNetworksAuthComponent', function() {
  var
    SELECTORS = {
      container: '.js-social-networks-auth-component-container',
      component: '.js-social-networks-auth-component',
      providerItem: '.js-provider-item',
      providerItemLink: '.js-provider-item-link',
      deleteProviderItemLink: '.js-delete-provider-item',
      flashMessage: '.js-social-networks-auth-component-flash-message-body',
    },
    CLASS_NAMES = {
      deletionInProcess: 'social-networks-auth-component-provider-item-deletion',
      loading: 'loading',
    },
    EVENTS = {
      render: 'render:socialNetworksAuthComponent',
    };

  function renderComponent(options) {
    return $(SELECTORS.container).trigger(EVENTS.render, [options]).find(SELECTORS.component);
  }

  function renderComponentAndClickProviderItemLink(options) {
    options = options || {};

    var
      clickEvent = options.clickEvent || jQuery.Event('click'),
      renderParams = options.renderParams || {newSchema: true};

    return renderComponent(renderParams).find(SELECTORS.providerItemLink).trigger(clickEvent).end();
  };

  function getProviderURL(providerName) {
    return app.config.omniauthAuthorizeURL.replace('_provider_', providerName);
  }

  beforeAll(function() {
    app.modules.socialNetworksAuthComponent.load();
  });

  beforeEach(function() {
    fixture.load('components/social_networks_auth_component/container');

    spyOn(app.modules.userUtils, 'signIn').and.callFake(function() {
      return $.Deferred().resolve({});
    });

    resetAppConfig();

    extendAppConfig({
      socialNetworksAuth: {
        mergeUsersJobID: 1,
        redirectURL: 'redirectURL',
      },
      jobStatusURL: 'jobStatusURL',
      omniauthAuthorizeURL: '_provider_omniauthAuthorizeURL',
      newOmniauthAuthorizeURL: '_provider_newOmniauthAuthorizeURL',
      url: 'url',
      currentUser: {
        providerName1UID: 12345,
        providerName2UID: 1234567,
        providerName3UID: null,
      },
      socialNetworkProviders: [
        'providerName1',
        'providerName2',
        'providerName3',
      ],
      api: {
        oauthStateURL: 'oauthStateURL_oauth_id_',
      },
    });
  });

  afterEach(function() {
    app.modules.socialNetworksAuthComponent.reset();
  });

  describe('props', function() {
    describe('sources', function() {
      var containerData = {someProp: 'some-prop-value'};

      beforeEach(function() {
        fixture.load('components/social_networks_auth_component/container_with_data');
      });

      describe('container element', function() {

        it('should contain data in data attributes', function() {
          var
            result = renderComponent().data('props').someProp,
            expected = containerData.someProp;

          expect(result).toBe(expected);
        });
      });

      describe('render props', function() {
        it('should be send with render event', function() {
          var
            renderProps = {someNewProp: 'some-new-value'},
            result = renderComponent(renderProps).data('props').someNewProp,
            expected = renderProps.someNewProp;

          expect(result).toBe(expected);
        });

        it('should rewrite container element props', function() {
          expect($(SELECTORS.container).data('someProp')).toBe(containerData.someProp);

          var
            renderProps = {someProp: 'some-value-from-render-props'},
            result = renderComponent(renderProps).data('props').someProp,
            expected = renderProps.someProp;

          expect(result).toBe(expected);
        });
      });
    });

    describe('values', function() {
      var props;

      beforeEach(function() {
        props = renderComponent().data('props');
      });

      describe('providers', function() {
        it('should be prepared correctly', function() {
          var
            result = props.providers,
            expected = [{
              name: app.config.socialNetworkProviders[0],
              omniauthAuthorizeURL: getProviderURL(app.config.socialNetworkProviders[0]),
              currentUserSocialNetworkUID: app.config.currentUser.providerName1UID,
              locales: {text: 'providerName1Text', title: 'providerName1Title'},
            }, {
              name: app.config.socialNetworkProviders[1],
              omniauthAuthorizeURL: getProviderURL(app.config.socialNetworkProviders[1]),
              currentUserSocialNetworkUID: app.config.currentUser.providerName2UID,
              locales: {text: 'providerName2Text', title: 'providerName2Title'},
            }, {
              name: app.config.socialNetworkProviders[2],
              omniauthAuthorizeURL: getProviderURL(app.config.socialNetworkProviders[2]),
              currentUserSocialNetworkUID: app.config.currentUser.providerName3UID,
              locales: {text: 'providerName3Text', title: 'providerName3Title'},
            }];

          expect(result).toEqual(expected);
        });
      });

      describe('type', function() {
        it('should be equal to extended by default', function() {
          var
            result = props.type,
            expected = 'extended';

          expect(result).toBe(expected);
        });
      });
    });
  });

  describe('render', function() {
    it('should happened', function() {
      var
        result = $(SELECTORS.component).length,
        expected = 0;

      expect(result).toBe(expected);

      renderComponent();

      result = $(SELECTORS.component).length;
      expected = 1;

      expect(result).toBe(expected);
    });

    it('should insert component view into container', function() {
      var
        result = $(SELECTORS.component).length,
        expected = 0;

      expect(result).toBe(expected);

      result = renderComponent().length;
      expected = 1;

      expect(result).toBe(expected);
    });

    describe('with simple type', function() {
      describe('provider item', function() {
        describe('count', function() {
          it('should be equal to app.config.socialNetworkProviders length', function() {
            app.config.socialNetworkProviders = ['providerName'];

            var
              result = renderComponent({type: 'simple'}).find(SELECTORS.providerItem).length,
              expected = app.config.socialNetworkProviders.length;

            expect(result).toBe(expected);

            app.config.socialNetworkProviders = [
              'providerName1',
              'providerName2',
            ];

            result = renderComponent({type: 'simple'}).find(SELECTORS.providerItem).length;
            expected = app.config.socialNetworkProviders.length;

            expect(result).toBe(expected);
          });
        });

        describe('content', function() {
          var providerName;

          beforeEach(function() {
            providerName = 'providerName15';

            app.config.socialNetworkProviders = [providerName];
          });

          it('should has correct link', function() {
            var
              result = renderComponent({type: 'simple'}).find('a').attr('href'),
              expected = getProviderURL(providerName);

            expect(result).toBe(expected);
          });

          it('should has icon with correct class', function() {
            var
              result = renderComponent({type: 'simple'}).find('i').hasClass(providerName),
              expected = true;

            expect(result).toBe(expected);
          });
        });
      });
    });

    describe('with extended type', function() {
      describe('provider item', function() {
        describe('count', function() {
          it('should be equal to app.config.socialNetworkProviders length', function() {
            var result, expected;

            app.config.socialNetworkProviders = ['providerName'];

            result = renderComponent().find(SELECTORS.providerItem).length;
            expected = app.config.socialNetworkProviders.length;

            expect(result).toBe(expected);

            app.config.socialNetworkProviders = [
              'providerName1',
              'providerName2',
            ];

            result = renderComponent().find(SELECTORS.providerItem).length;
            expected = app.config.socialNetworkProviders.length;

            expect(result).toBe(expected);
          });
        });

        describe('providerName', function() {
          var attributeToTest = 'providerName';

          it('should be equal to appropriate values from app.config.socialNetworkProviders', function() {
            app.config.socialNetworkProviders = [
              'providerName1',
              'providerName2',
              'providerName3',
            ];

            var $providerItems = renderComponent().find(SELECTORS.providerItem);

            expect($providerItems.eq(0).data(attributeToTest)).toBe(app.config.socialNetworkProviders[0]);
            expect($providerItems.eq(1).data(attributeToTest)).toBe(app.config.socialNetworkProviders[1]);
            expect($providerItems.eq(2).data(attributeToTest)).toBe(app.config.socialNetworkProviders[2]);
          });
        });

        describe('content', function() {
          describe('for currentUser with appropriate provider', function() {
            var $component;

            beforeEach(function() {
              app.config.socialNetworkProviders = ['providerName1'];
              app.config.currentUser.providerName1UID = 'someProviderNameUID';

              $component = renderComponent();
            });

            it('should contain provider uid ', function() {
              var
                result = !!~$component.find(SELECTORS.providerItem).text()
                  .indexOf(app.config.currentUser.providerName1UID),
                expected = true;

              expect(result).toBe(expected);
            });

            it('should contain link to delete social network provider', function() {
              var
                result = $component.find(SELECTORS.deleteProviderItemLink).length,
                expected = 1;

              expect(result).toBe(expected);
            });
          });

          describe('for currentUser without appropriate provider', function() {
            it('should contain link to authorize with social network', function() {
              app.config.socialNetworkProviders = ['providerName1'];
              app.config.currentUser = {};

              var
                result = renderComponent().find('a').attr('href'),
                expected = getProviderURL(app.config.socialNetworkProviders[0]);

              expect(result).toBe(expected);
            });
          });
        });
      });
    });
  });

  describe('spinner', function() {
    it('should be removed after render', function() {
      var
        result = $(SELECTORS.container).hasClass(CLASS_NAMES.loading),
        expected = true;

      expect(result).toBe(expected);

      result = renderComponent().hasClass(CLASS_NAMES.loading);
      expected = false;

      expect(result).toBe(expected);
    });
  });

  describe('events', function() {
    describe('click on item to delete provider', function() {
      var
        providerNameToDelete = 'providerName1',
        $component, deleteSocialProviderSpy;

      beforeEach(function() {
        app.config.currentUser.providerName1UID = 'someProviderNameUID';
        app.config.socialNetworkProviders = [providerNameToDelete];

        deleteSocialProviderSpy = spyOn(app.modules.userAPI, 'deleteSocialProvider').and.callFake(function() {
          return $.Deferred();
        });

        $component = renderComponent();

        $component.find(SELECTORS.deleteProviderItemLink).click();
      });

      it('should add loading class name for provider item', function() {
        var
          result = $component.find(SELECTORS.providerItem).hasClass(CLASS_NAMES.deletionInProcess),
          expected = true;

        expect(result).toBe(expected);
      });

      it('should call deleteSocialProvider api method', function() {
        var
          result = deleteSocialProviderSpy.calls.count(),
          expected = 1;

        expect(result).toBe(expected);
      });

      it('should call deleteSocialProvider api method with correct argument', function() {
        var
          result = deleteSocialProviderSpy.calls.argsFor(0)[0],
          expected = providerNameToDelete;

        expect(result).toBe(expected);
      });
    });

    describe('click on provider item link', function() {
      var uuid, spyOnPreventDefault, clickEvent;

      beforeEach(function() {
        spyOnPreventDefault = jasmine.createSpy('spyOnPreventDefault');

        clickEvent = jQuery.Event('click', { preventDefault: spyOnPreventDefault });

        spyOn(window, 'open').and.callFake(function() { });

        spyOn(app.modules.applicationUtils, 'generateUUID').and.callFake(function() {
          return uuid = 12345;
        });

        app.config.socialNetworkProviders = ['someProviderName'];
      });

      describe('with current authorization schema', function() {
        beforeEach(function() {
          renderComponentAndClickProviderItemLink({
            clickEvent: clickEvent,
            renderParams: {newSchema: false},
          });
        });

        it('should not be prevented', function() {
          expect(spyOnPreventDefault).not.toHaveBeenCalled();
        });
      });

      describe('with new authorization schema', function() {
        beforeEach(function() {
          renderComponentAndClickProviderItemLink({
            clickEvent: clickEvent,
            renderParams: {newSchema: true},
          });
        });

        it('should be prevented', function() {
          expect(spyOnPreventDefault).toHaveBeenCalled();
        });

        it('should open window with correct URL', function() {
          var
            result = window.open.calls.argsFor(0)[0],
            expected = app.config.socialNetworkProviders[0] + 'newOmniauthAuthorizeURL?oauth_id=' + uuid;

          expect(result).toBe(expected);
        });
      });
    });

    describe('close social registration tab', function() {
      var pid = 12345, openedWindow = {};

      beforeEach(function(done) {
        spyOn(app.modules.applicationUtils, 'generateUUID').and.callFake(function() {
          return pid;
        });

        spyOn(window, 'open').and.callFake(function() {
          openedWindow.closed = false;

          done();
          return openedWindow;
        });

        spyOn(app.modules.userAPI, 'listenSocialRegistrationProcess').and.callFake(function() {
          return {then: function() {}};
        });

        renderComponentAndClickProviderItemLink();
      });

      it('should start listen social registration process with correct processID', function(done) {
        setTimeout(function() {
          openedWindow.closed = true;

          setTimeout(function() {
            expect(app.modules.userAPI.listenSocialRegistrationProcess).toHaveBeenCalled();
            expect(app.modules.userAPI.listenSocialRegistrationProcess.calls.argsFor(0)[0])
              .toBe(app.config.api.oauthStateURL.replace('_oauth_id_', pid));

            done();
          }, 1500);
        }, 1500);
      });
    });
  });

  describe('request', function() {
    describe('to listen social registration process', function() {
      beforeEach(function() {
        spyOn(window, 'open').and.callFake(function() {
          return {closed: true};
        });
      });

      describe('with success', function() {
        var
          renderParams = {
            onSuccess: function() {},
            newSchema: true,
          },
          responseData = {user: {'perishable_token': 'some-token'}};

        beforeEach(function(done) {
          spyOn(renderParams, 'onSuccess').and.callFake(function() { done(); });

          spyOn(app.modules.userAPI, 'listenSocialRegistrationProcess').and.callFake(function() {
            return $.Deferred().resolve(responseData);
          });

          renderComponentAndClickProviderItemLink({renderParams: renderParams});
        });

        it('should sign in user', function() {
          expect(app.modules.userUtils.signIn).toHaveBeenCalled();
        });

        it('should sign in user with correct token', function() {
          var
            result = app.modules.userUtils.signIn.calls.argsFor(0)[0],
            expected = {'perishable_token': responseData.user['perishable_token']};

          expect(result).toEqual(expected);
        });
      });

      describe('with error', function() {
        var
          renderParams = {
            onSuccess: function() {},
            onError: function() {},
            newSchema: true,
          };

        describe('with error message different from "not_found"', function() {
          var
            error = {message: 'Error Message'},
            $component;

          beforeEach(function(done) {
            spyOn(renderParams, 'onSuccess').and.callFake(function() { done(); });
            spyOn(renderParams, 'onError').and.callFake(function() { done(); });

            spyOn(app.modules.userAPI, 'listenSocialRegistrationProcess').and.callFake(function() {
              return $.Deferred().reject(error);
            });

            $component = renderComponentAndClickProviderItemLink({renderParams: renderParams});
          });

          it('should show error message', function() {
            var $errorFlashMessage = $component.find(SELECTORS.flashMessage);

            expect($errorFlashMessage.is(':visible')).toBe(true);
            expect($errorFlashMessage.hasClass('with-error')).toBe(true);
            expect($errorFlashMessage.text()).toBe(error.message);
          });

          it('should call onError callback', function() {
            var
              result = renderParams.onError.calls.count(),
              expected = 1;

            expect(result).toBe(expected);
          });

          it('should call onError callback with error object', function() {
            var
              result = renderParams.onError.calls.argsFor(0)[0],
              expected = error;

            expect(result).toEqual(expected);
          });

          it('should not call onSuccess callback', function() {
            var
              result = renderParams.onSuccess.calls.count(),
              expected = 0;

            expect(result).toBe(expected);
          });
        });

        describe('with "not_found" error message', function() {
          var
            error = {message: 'not_found'},
            $component;

          beforeEach(function(done) {
            spyOn(renderParams, 'onSuccess').and.callFake(function() { done(); });
            spyOn(renderParams, 'onError').and.callFake(function() { done(); });

            spyOn(app.modules.userAPI, 'listenSocialRegistrationProcess').and.callFake(function() {
              return $.Deferred().reject(error);
            });

            $component = renderComponentAndClickProviderItemLink({renderParams: renderParams});
          });

          it('should not show error message', function() {
            var $errorFlashMessage = $component.find(SELECTORS.flashMessage);

            expect($errorFlashMessage.is(':empty')).toBe(true);
          });

          it('should not call onError callback', function() {
            var
              result = renderParams.onError.calls.count(),
              expected = 1;

            expect(result).toBe(expected);
          });

          it('should not call onSuccess callback', function() {
            var
              result = renderParams.onSuccess.calls.count(),
              expected = 0;

            expect(result).toBe(expected);
          });
        });
      });
    });

    describe('to sign in user after successfull registration', function() {
      var
        renderParams = {
          onSuccess: function() {},
          onError: function() {},
          newSchema: true,
        },
        response = {user: {}};

      beforeEach(function() {
        spyOn(window, 'open').and.callFake(function() {
          return {closed: true, close: function() {}};
        });

        app.config.socialNetworkProviders = ['someProviderName'];
      });

      describe('with success', function() {
        var $component;

        describe('callbacks', function() {
          beforeEach(function(done) {
            spyOn(renderParams, 'onSuccess').and.callFake(function() { done(); });
            spyOn(renderParams, 'onError').and.callFake(function() { done(); });

            spyOn(app.modules.userAPI, 'listenSocialRegistrationProcess').and.callFake(function() {
              return $.Deferred().resolve(response);
            });

            $component = renderComponentAndClickProviderItemLink({renderParams: renderParams});
          });

          describe('onError', function() {
            it('should not be called', function() {
              var
                result = renderParams.onError.calls.count(),
                expected = 0;

              expect(result).toBe(expected);
            });
          });

          describe('onSuccess', function() {
            it('should be called one time', function() {
              var
                result = renderParams.onSuccess.calls.count(),
                expected = 1;

              expect(result).toBe(expected);
            });

            it('should be called with correct data', function() {
              var
                result = renderParams.onSuccess.calls.argsFor(0)[0],
                expected = response;

              expect(result).toEqual(expected);
            });
          });
        });

        describe('visible error message', function() {
          it('should be hidden', function(done) {
            var $errorFlashMessage, $component;

            spyOn(app.modules.userAPI, 'listenSocialRegistrationProcess').and.callFake(function() {
              return $.Deferred().reject({message: 'Some error message'});
            });

            $component = renderComponentAndClickProviderItemLink({renderParams: {
              onError: function() {

                app.modules.userAPI.listenSocialRegistrationProcess.and.callFake(function() {
                  return $.Deferred().resolve({user: {}});
                });

                $component.find(SELECTORS.providerItemLink).trigger(jQuery.Event('click'));

                $errorFlashMessage = $component.find(SELECTORS.flashMessage);

                expect($errorFlashMessage.is(':visible')).toBe(true);
              },
              onSuccess: function() {
                $errorFlashMessage = $component.find(SELECTORS.flashMessage);

                expect($errorFlashMessage.is(':visible')).toBe(false);

                done();
              },
              newSchema: true,
            }});

          });
        });
      });
    });

    describe('to delete primary provider', function() {
      var $component, $$deleteProviderWithSuccess;

      beforeEach(function() {
        app.config.currentUser.providerName1UID = 'someProviderNameUID';
        app.config.socialNetworkProviders = ['providerName1'];

        spyOn(app.modules.userAPI, 'deleteSocialProvider').and.callFake(function() {
          return $$deleteProviderWithSuccess = $.Deferred().resolve();
        });

        $component = renderComponent();

        $component.find(SELECTORS.deleteProviderItemLink).click();
      });

      describe('with success', function() {
        it('should remove loading class name for provider item', function(done) {
          var
            result = $component.find(SELECTORS.providerItem).hasClass(CLASS_NAMES.deletionInProcess),
            expected = true;

          expect(result).toBe(expected);

          $$deleteProviderWithSuccess.then(function() {
            var
              result = $component.find(SELECTORS.provideritem).hasClass(CLASS_NAMES.deletionInProcess),
              expected = false;

            expect(result).toBe(expected);
            done();
          });
        });

        it('should render link to authorize with social network', function(done) {
          var
            result = $component.find('a').length,
            expected = 0;

          expect(result).toBe(expected);

          $$deleteProviderWithSuccess.then(function() {
            var
              result = $component.find('a').attr('href'),
              expected = getProviderURL(app.config.socialNetworkProviders[0]);

            expect(result).toBe(expected);
            done();
          });
        });
      });
    });
  });

  describe('public methods', function() {
    describe('listenUsersMerge', function() {
      var
        listenUsersMerge = app.modules.socialNetworksAuthComponent.listenUsersMerge,
        listenProcessUtilSpy, setLocationHrefUtilSpy;

      beforeEach(function() {
        listenProcessUtilSpy = spyOn(app.modules.applicationUtils, 'listenProcess').and.callFake(function() {
          return $.Deferred().resolve({payload: {'perishable_token': '12345'}});
        });
        setLocationHrefUtilSpy = spyOn(app.modules.applicationUtils, 'setLocationHref').and.callFake(function() {});
      });

      describe('listenProcess util', function() {
        it('should be called', function(done) {
          listenUsersMerge().then(function() {
            var
              result = listenProcessUtilSpy.calls.count(),
              expected = 1;

            expect(result).toBe(expected);
            done();
          });
        });

        it('should be called with correct params', function(done) {
          listenUsersMerge().then(function() {
            var
              result = listenProcessUtilSpy.calls.argsFor(0)[0],
              expected = {
                url: app.config.jobStatusURL,
                pid: app.config.socialNetworksAuth.mergeUsersJobID,
              };

            expect(result).toEqual(expected);
            done();
          });
        });
      });

      describe('result', function() {
        it('should redirect on correct url on success', function(done) {
          listenUsersMerge().then(function() {
            var
              result = setLocationHrefUtilSpy.calls.argsFor(0)[0],
              expected = app.config.socialNetworksAuth.redirectURL;

            expect(result).toBe(expected);

            done();
          });
        });
      });
    });
  });
});
