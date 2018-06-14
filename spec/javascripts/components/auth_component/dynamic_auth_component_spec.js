//= require clearance/components/auth_component/auth_component_utils
//= require clearance/components/auth_component/auth_component_container
//= require clearance/components/auth_component/dynamic_auth_component

// Came From test_utils:
// - resetAppConfig
// - extendAppConfig


describe('dynamicAuthComponent', function() {
  var
    SELECTORS = {
      item: '.js-show-dynamic-auth-component',
      component: '.auth-component-${type}'
    },
    COMPONENT_DEFAULT_TYPE = 'sign-in',
    getAuthComponentContainer = function(type) {
      return $(SELECTORS.component.replace('${type}', type || COMPONENT_DEFAULT_TYPE));
    };

  beforeAll(function() {
    // Cache all fixtures to load them later without additional requests
    fixture.preload(
      'components/auth_component/dynamic_auth_component/item_to_show_component',
      'components/auth_component/dynamic_auth_component/item_to_show_component_with_type'
    );
  });

  beforeEach(function() {
    resetEnvironment();
    app.modules.dynamicAuthComponent.reset();

    extendAppConfig({
      authComponent: {
        wrappers: {
          dynamic: {
            'sign-in': {
              someKey: 'someValue'
            }
          }
        }
      }
    });
  });

  describe('load', function() {
    it('should not throw if app.config.authComponent.wrappers.dynamic is initialized', function() {
      expect(app.modules.dynamicAuthComponent.load).not
        .toThrowError('Need to set up app.config.authComponent.wrappers.dynamic config.');
    });

    it('should throw if app.config.authComponent.wrappers.dynamic is not initialized', function() {
      resetAppConfig();

      expect(app.modules.dynamicAuthComponent.load)
        .toThrowError('Need to set up app.config.authComponent.wrappers.dynamic config.');
    });

    it('should not throw if config value is plain object', function() {
      expect(app.modules.dynamicAuthComponent.load).not
        .toThrowError('The value of component config should be a plain object.');
    });

    it('should throw if config value is not plain object', function() {
      app.config.authComponent.wrappers.dynamic = function() {};

      expect(app.modules.dynamicAuthComponent.load)
        .toThrowError('The value of component config should be a plain object.');
    });
  });

  describe('component behavior', function() {
    beforeEach(function() {
      app.modules.dynamicAuthComponent.load();
    });

    describe('events', function() {
      describe('click on item', function() {
        var EVENT_TO_TEST = 'click';

        beforeEach(function() {
          fixture.load('components/auth_component/dynamic_auth_component/item_to_show_component');
        });

        it('should be registered', function() {
          var spyOnClickEvent = spyOnEvent(SELECTORS.item, EVENT_TO_TEST);

          expect(spyOnClickEvent).not.toHaveBeenTriggered();

          $(SELECTORS.item, fixture.el)[EVENT_TO_TEST]();

          expect(spyOnClickEvent).toHaveBeenTriggered();
        });

        it('should be prevented', function() {
          var spyOnClickEvent = spyOnEvent(SELECTORS.item, EVENT_TO_TEST);

          $(SELECTORS.item, fixture.el)[EVENT_TO_TEST]();

          expect(spyOnClickEvent).toHaveBeenPrevented();
        });

        it('should create component container', function() {
          expect($('.auth-component-sign-in').length).toBe(0);

          $(SELECTORS.item, fixture.el)[EVENT_TO_TEST]();

          expect($('.auth-component-sign-in').length).toBe(1);
        });

        it('should render component', function() {
          var spyOnShowComponentEvent = jasmine.createSpy('Spy On Show Component Event');

          $doc.on('render:authComponent', '.auth-component-sign-in', spyOnShowComponentEvent);

          expect(spyOnShowComponentEvent.calls.count()).toBe(0);

          $(SELECTORS.item, fixture.el)[EVENT_TO_TEST]();

          expect(spyOnShowComponentEvent.calls.count()).toBe(1);
        });
      });

      describe('trigger show:dynamicAuthComponent on document', function() {
        var EVENT_TO_TEST = 'show:dynamicAuthComponent';

        it('should be registered', function() {
          var spyOnShowDynamicAuthComponentEvent = spyOnEvent($doc, EVENT_TO_TEST);

          expect(spyOnShowDynamicAuthComponentEvent).not.toHaveBeenTriggered();

          $doc.trigger(EVENT_TO_TEST);

          expect(spyOnShowDynamicAuthComponentEvent).toHaveBeenTriggered();
        });

        it('should create component container', function() {
          expect($('.auth-component-sign-in').length).toBe(0);

          $doc.trigger(EVENT_TO_TEST);

          expect($('.auth-component-sign-in').length).toBe(1);
        });

        it('should render component', function() {
          var spyOnShowComponentEvent = jasmine.createSpy('Spy On Show Component Event');

          $doc.on('render:authComponent', '.auth-component-sign-in', spyOnShowComponentEvent);

          expect(spyOnShowComponentEvent.calls.count()).toBe(0);

          $doc.trigger(EVENT_TO_TEST);

          expect(spyOnShowComponentEvent.calls.count()).toBe(1);
        });
      });
    });

    describe('component types', function() {
      describe('default type', function() {
        var TYPE_TO_TEST = 'sign-in';

        it('should be assigned on item click', function() {
          fixture.load('components/auth_component/dynamic_auth_component/item_to_show_component');

          expect(getAuthComponentContainer().length).toBe(0);

          $(SELECTORS.item, fixture.el).click();

          expect(getAuthComponentContainer().length).toBe(1);
        });

        it('should be assigned on show:dynamicAuthComponent trigger', function() {
          expect(getAuthComponentContainer().length).toBe(0);

          $doc.trigger('show:dynamicAuthComponent');

          expect(getAuthComponentContainer().length).toBe(1);
        });
      });

      describe('optional type', function() {
        it('should be grabbed from auth-component-type data attribute and assigned on item click', function() {
          fixture.load('components/auth_component/dynamic_auth_component/item_to_show_component_with_type');

          var typeToTest = $(SELECTORS.item, fixture.el).data('authComponentType');

          app.config.authComponent.wrappers.dynamic[typeToTest] = {someKey: 'someValue'};

          expect(getAuthComponentContainer(typeToTest).length).toBe(0);

          $(SELECTORS.item, fixture.el).click();

          expect(getAuthComponentContainer(typeToTest).length).toBe(1);
        });

        it('should be grabbed from arguments and assigned on show:dynamicAuthComponent trigger', function() {
          var TYPE_TO_TEST = 'subscribe';

          app.config.authComponent.wrappers.dynamic[TYPE_TO_TEST] = {someKey: 'someValue'};

          expect(getAuthComponentContainer(TYPE_TO_TEST).length).toBe(0);

          $doc.trigger('show:dynamicAuthComponent', [TYPE_TO_TEST]);

          expect(getAuthComponentContainer(TYPE_TO_TEST).length).toBe(1);
        });
      });
    });
  });
});
