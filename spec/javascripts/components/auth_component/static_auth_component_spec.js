//= require clearance/components/auth_component/auth_component_utils
//= require clearance/components/auth_component/static_auth_component

// Came From test_utils:
// - resetAppConfig
// - extendAppConfig
// - renderStaticAuthComponent


describe('staticAuthComponent', function() {
  var
    SELECTORS = {
      component: '.js-static-${type}-auth-component',
    },
    COMPONENT_DEFAULT_TYPE = 'sign-in',
    getStaticAuthComponentContainer = function(type) {
      return $(SELECTORS.component.replace('${type}', type || COMPONENT_DEFAULT_TYPE));
    };

  beforeEach(function() {
    resetEnvironment();
    app.modules.staticAuthComponent.reset();

    resetAppConfig();
    extendAppConfig({
      authComponent: {
        wrappers: {
          static: {
            'sign-in': {
              someKey: 'someValue'
            }
          }
        }
      },
    });
  });

  describe('load', function() {
    it('should not throw if app.config.authComponent.wrappers.static is plain object', function() {
      expect(app.modules.staticAuthComponent.load).not
        .toThrowError('The value of component config should be a plain object.');
    });

    it('should throw if app.config.authComponent.wrappers.static is not plain object', function() {
      app.config.authComponent.wrappers.static = function() {};

      expect(app.modules.staticAuthComponent.load)
        .toThrowError('The value of component config should be a plain object.');
    });
  });

  describe('component', function() {
    it('should not be rendered if there is no config for static components', function() {
      resetAppConfig();

      loadStaticAuthComponent({
        onBeforeLoad: function(spyOnRenderComponentEvent) {
          expect(spyOnRenderComponentEvent.calls.count()).toBe(0);
        },
        onAfterLoad: function(spyOnRenderComponentEvent) {
          expect(spyOnRenderComponentEvent.calls.count()).toBe(0);
        },
      });
    });

    it('should be rendered if there is config for component of concrete type', function() {
      fixture.load(
        'components/auth_component/static_auth_component/static_sign_in_auth_component_container'
      );

      loadStaticAuthComponent({
        onBeforeLoad: function(spyOnRenderComponentEvent) {
          expect(spyOnRenderComponentEvent.calls.count()).toBe(0);
        },
        onAfterLoad: function(spyOnRenderComponentEvent) {
          expect(spyOnRenderComponentEvent.calls.count()).toBe(1);
        },
      }, '.js-static-sign-in-auth-component');
    });

    it('should be rendered with config equals to empty object', function() {
      fixture.load(
        'components/auth_component/static_auth_component/static_sign_in_auth_component_container'
      );

      // Set config for sign-in authComponent to empty object
      app.config.authComponent.wrappers.static['sign-in'] = {};

      loadStaticAuthComponent({
        onBeforeLoad: function(spyOnRenderComponentEvent) {
          expect(spyOnRenderComponentEvent.calls.count()).toBe(0);
        },
        onAfterLoad: function(spyOnRenderComponentEvent) {
          expect(spyOnRenderComponentEvent.calls.count()).toBe(1);
        },
      }, '.js-static-sign-in-auth-component');
    });

    it('should not be rendered if there is no container for component', function() {
      loadStaticAuthComponent({
        onBeforeLoad: function(spyOnRenderComponentEvent) {
          expect(spyOnRenderComponentEvent.calls.count()).toBe(0);
        },
        onAfterLoad: function(spyOnRenderComponentEvent) {
          expect($( '.js-static-sign-in-auth-component').length).toBe(0);
          expect(spyOnRenderComponentEvent.calls.count()).toBe(0);
        },
      }, '.js-static-sign-in-auth-component');
    });

    it('should not be rendered if there is no config for component of concrete type', function() {
      fixture.load(
        'components/auth_component/static_auth_component/static_sign_up_auth_component_container'
      );

      loadStaticAuthComponent({
        onBeforeLoad: function(spyOnRenderComponentEvent) {
          expect(spyOnRenderComponentEvent.calls.count()).toBe(0);
        },
        onAfterLoad: function(spyOnRenderComponentEvent) {
          expect(app.config.authComponent.wrappers.static['sign-up']).toBe(undefined);
          expect(spyOnRenderComponentEvent.calls.count()).toBe(0);
        },
      }, '.js-static-sign-in-auth-component');
    });

    it('should be rendered only once for concrete type', function() {
      fixture.load(
        'components/auth_component/static_auth_component/static_sign_in_auth_component_container'
      );

      loadStaticAuthComponent({
        onBeforeLoad: function(spyOnRenderComponentEvent) {
          expect(spyOnRenderComponentEvent.calls.count()).toBe(0);
        },
        onAfterLoad: function(spyOnRenderComponentEvent) {
          expect(spyOnRenderComponentEvent.calls.count()).toBe(1);

          app.modules.staticAuthComponent.load();
          app.modules.staticAuthComponent.load();

          expect(spyOnRenderComponentEvent.calls.count()).toBe(1);
        },
      }, '.js-static-sign-in-auth-component');
    });

    it('should be rendered multiple times for one type if cache disabled', function() {
      fixture.load(
        'components/auth_component/static_auth_component/static_sign_in_auth_component_container'
      );

      extendAppConfig({
        authComponent: {
          wrappers: {
            static: {
              'sign-in': {
                someKey: 'someValue',
                cache: false,
              }
            }
          }
        },
      });

      loadStaticAuthComponent({
        onBeforeLoad: function(spyOnRenderComponentEvent) {
          expect(spyOnRenderComponentEvent.calls.count()).toBe(0);
        },
        onAfterLoad: function(spyOnRenderComponentEvent) {
          expect(spyOnRenderComponentEvent.calls.count()).toBe(1);

          app.modules.staticAuthComponent.load();
          app.modules.staticAuthComponent.load();

          expect(spyOnRenderComponentEvent.calls.count()).toBe(3);
        },
      }, '.js-static-sign-in-auth-component');
    });

    it('should be rendered with params from config according to component type', function() {
      fixture.load(
        'components/auth_component/static_auth_component/static_sign_in_auth_component_container'
      );

      var testComponentParams = function(event, data) {
        expect(data).toEqual(app.config.authComponent.wrappers.static['sign-in']);
      };

      $doc.on('render:authComponent', '.js-static-sign-in-auth-component', testComponentParams);

      app.modules.staticAuthComponent.load();
    });

    it('should be rendered for all containers on the page', function() {
      fixture.load(
        'components/auth_component/static_auth_component/static_auth_component_containers'
      );

      extendAppConfig({
        authComponent: {
          wrappers: {
            static: {
              subscribe: {
                someKey: 'someValue',
              },
              reviews: {
                someKey: 'someValue',
              },
            }
          }
        },
      });

      var spyOnRenderComponentEvent = jasmine.createSpy('Spy On Render Component Event');

      $doc.on('render:authComponent', '.js-static-subscribe-auth-component', spyOnRenderComponentEvent);
      $doc.on('render:authComponent', '.js-static-reviews-auth-component', spyOnRenderComponentEvent);

      expect(spyOnRenderComponentEvent.calls.count()).toBe(0);

      app.modules.staticAuthComponent.load();

      expect(spyOnRenderComponentEvent.calls.count()).toBe(2);
    });

    describe('requiredUserInfo', function() {
      beforeEach(function() {
        fixture.load(
          'components/auth_component/static_auth_component/static_sign_in_auth_component_container'
        );
      });

      describe('email', function() {
        it('should not prevent render if currentUser has not email', function() {
          var spyOnRenderComponentEvent = jasmine.createSpy('Spy On Render Component Event');

          loadStaticAuthComponent({
            onBeforeLoad: function(spyOnRenderComponentEvent) {
              expect(spyOnRenderComponentEvent.calls.count()).toBe(0);
            },
            onAfterLoad: function(spyOnRenderComponentEvent) {
              expect(spyOnRenderComponentEvent.calls.count()).toBe(1);
            },
          }, '.js-static-sign-in-auth-component');
        });

        it('should prevent render by default if currentUser has email', function() {
          extendAppConfig({
            currentUser: {
              email: 'some@email.com',
            },
          });

          loadStaticAuthComponent({
            onBeforeLoad: function(spyOnRenderComponentEvent) {
              expect(spyOnRenderComponentEvent.calls.count()).toBe(0);
            },
            onAfterLoad: function(spyOnRenderComponentEvent) {
              expect(spyOnRenderComponentEvent.calls.count()).toBe(0);
            },
          }, '.js-static-sign-in-auth-component');
        });
      });

      describe('phone', function() {
        beforeEach(function() {
          extendAppConfig({
            currentUser: {
              phone: '+79122345373',
            },
            authComponent: {
              wrappers: {
                static: {
                  'sign-in': {
                    requiredUserInfo: 'phone'
                  }
                }
              }
            },
          });
        });

        it('should not prevent render if currentUser has no phone', function() {
          extendAppConfig({
            currentUser: null,
          });

          loadStaticAuthComponent({
            onBeforeLoad: function(spyOnRenderComponentEvent) {
              expect(spyOnRenderComponentEvent.calls.count()).toBe(0);
            },
            onAfterLoad: function(spyOnRenderComponentEvent) {
              expect(spyOnRenderComponentEvent.calls.count()).toBe(1);
            },
          }, '.js-static-sign-in-auth-component');
        });

        it('should prevent render if currentUser has phone', function() {
          loadStaticAuthComponent({
            onBeforeLoad: function(spyOnRenderComponentEvent) {
              expect(spyOnRenderComponentEvent.calls.count()).toBe(0);
            },
            onAfterLoad: function(spyOnRenderComponentEvent) {
              expect(spyOnRenderComponentEvent.calls.count()).toBe(0);
            },
          }, '.js-static-sign-in-auth-component');
        });

        it('should not prevent render if currentUser has phone but requiredUserInfo does not include phone', function() {
          extendAppConfig({
            authComponent: {
              wrappers: {
                static: {
                  'sign-in': {
                    requiredUserInfo: null
                  }
                }
              }
            },
          });

          loadStaticAuthComponent({
            onBeforeLoad: function(spyOnRenderComponentEvent) {
              expect(spyOnRenderComponentEvent.calls.count()).toBe(0);
            },
            onAfterLoad: function(spyOnRenderComponentEvent) {
              expect(spyOnRenderComponentEvent.calls.count()).toBe(1);
            },
          }, '.js-static-sign-in-auth-component');
        });
      });

      describe('phone&email', function() {
        beforeEach(function() {
          extendAppConfig({
            authComponent: {
              wrappers: {
                static: {
                  'sign-in': {
                    requiredUserInfo: 'phone&email'
                  }
                }
              }
            },
          });
        });

        it('should not prevent render if currentUser has no phone', function() {
          extendAppConfig({
            currentUser: {
              email: 'some@mail.com',
            },
          });

          loadStaticAuthComponent({
            onBeforeLoad: function(spyOnRenderComponentEvent) {
              expect(spyOnRenderComponentEvent.calls.count()).toBe(0);
            },
            onAfterLoad: function(spyOnRenderComponentEvent) {
              expect(spyOnRenderComponentEvent.calls.count()).toBe(1);
            },
          }, '.js-static-sign-in-auth-component');
        });

        it('should not prevent render if currentUser has no email', function() {
          extendAppConfig({
            currentUser: {
              phone: '+79122382353',
            },
          });

          loadStaticAuthComponent({
            onBeforeLoad: function(spyOnRenderComponentEvent) {
              expect(spyOnRenderComponentEvent.calls.count()).toBe(0);
            },
            onAfterLoad: function(spyOnRenderComponentEvent) {
              expect(spyOnRenderComponentEvent.calls.count()).toBe(1);
            },
          }, '.js-static-sign-in-auth-component');
        });

        it('should prevent render if currentUser has email and phone', function() {
          extendAppConfig({
            currentUser: {
              email: 'some@mail.com',
              phone: '+79122382353',
            },
          });

          loadStaticAuthComponent({
            onBeforeLoad: function(spyOnRenderComponentEvent) {
              expect(spyOnRenderComponentEvent.calls.count()).toBe(0);
            },
            onAfterLoad: function(spyOnRenderComponentEvent) {
              expect(spyOnRenderComponentEvent.calls.count()).toBe(0);
            },
          }, '.js-static-sign-in-auth-component');
        });

        it('should not prevent render if currentUser has email and phone but requiredUserInfo not set', function() {
          extendAppConfig({
            currentUser: {
              email: 'some@mail.com',
              phone: '+79122382353',
            },
            authComponent: {
              wrappers: {
                static: {
                  'sign-in': {
                    requiredUserInfo: null
                  }
                }
              }
            },
          });

          loadStaticAuthComponent({
            onBeforeLoad: function(spyOnRenderComponentEvent) {
              expect(spyOnRenderComponentEvent.calls.count()).toBe(0);
            },
            onAfterLoad: function(spyOnRenderComponentEvent) {
              expect(spyOnRenderComponentEvent.calls.count()).toBe(1);
            },
          }, '.js-static-sign-in-auth-component');
        });
      });

      describe('sid', function() {
        beforeEach(function() {
          extendAppConfig({
            currentUser: {
              sid: 'some-sid',
            },
            authComponent: {
              wrappers: {
                static: {
                  'sign-in': {
                    requiredUserInfo: 'sid'
                  }
                }
              }
            },
          });
        });

        it('should not prevent render if currentUser has no sid', function() {
          extendAppConfig({
            currentUser: null,
          });

          loadStaticAuthComponent({
            onBeforeLoad: function(spyOnRenderComponentEvent) {
              expect(spyOnRenderComponentEvent.calls.count()).toBe(0);
            },
            onAfterLoad: function(spyOnRenderComponentEvent) {
              expect(spyOnRenderComponentEvent.calls.count()).toBe(1);
            },
          }, '.js-static-sign-in-auth-component');
        });

        it('should prevent render if currentUser has sid', function() {
          loadStaticAuthComponent({
            onBeforeLoad: function(spyOnRenderComponentEvent) {
              expect(spyOnRenderComponentEvent.calls.count()).toBe(0);
            },
            onAfterLoad: function(spyOnRenderComponentEvent) {
              expect(spyOnRenderComponentEvent.calls.count()).toBe(0);
            },
          }, '.js-static-sign-in-auth-component');
        });

        it('should not prevent render if currentUser has sid but requiredUserInfo does not include sid', function() {
          extendAppConfig({
            authComponent: {
              wrappers: {
                static: {
                  'sign-in': {
                    requiredUserInfo: null
                  }
                }
              }
            },
          });

          loadStaticAuthComponent({
            onBeforeLoad: function(spyOnRenderComponentEvent) {
              expect(spyOnRenderComponentEvent.calls.count()).toBe(0);
            },
            onAfterLoad: function(spyOnRenderComponentEvent) {
              expect(spyOnRenderComponentEvent.calls.count()).toBe(1);
            },
          }, '.js-static-sign-in-auth-component');
        });
      });
    });
  });
});
