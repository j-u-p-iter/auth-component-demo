//= require clearance/core/user_api
//= require clearance/core/user_utils


describe('userAPI', function() {
  beforeAll(function() {
    extendAppConfig({
      usersSessionURL: '/user-session',
      usersRegistrationURL: '/users-registration',
      api: {
        userSocialProviderURL: '/user-social-provider'
      },
    });
  });

  beforeEach(function() {
    mockAjax();
  });

  describe('listenSocialRegistrationProcess(url)', function() {
    var listenSocialRegistrationProcess = app.modules.userAPI.listenSocialRegistrationProcess;

    describe('with url as not a string', function() {
      it('should throw', function() {
        var url = {};

        expect(listenSocialRegistrationProcess.bind(null, url))
          .toThrowError('url should be a string, instead ' + url + ' was passed');
      });
    });

    describe('with processID as a string', function() {
      it('should not throw', function() {
        var url = 'some-url';

        expect(listenSocialRegistrationProcess.bind(null, url))
          .not.toThrowError('url should be a string, instead ' + url + ' was passed');
      });


      describe('listenProcess application util', function() {
        var url = 'some-url', spyOnListenProcessUtil;

        beforeEach(function() {
          spyOnListenProcessUtil = spyOn(app.modules.applicationUtils, 'listenProcess');
          listenSocialRegistrationProcess(url);
        });

        it('should be called', function() {
          expect(spyOnListenProcessUtil).toHaveBeenCalled();
        });

        it('should be called with correct arguments', function() {
          var
            result = spyOnListenProcessUtil.calls.argsFor(0)[0],
            expected = {url: url};

          expect(result).toEqual(expected);
        });
      });
    });
  });

  describe('signIn(data)', function() {
    var
      signIn = app.modules.userAPI.signIn,
      spyOnValidateOnObjectTypeUtil;

    beforeEach(function() {
      spyOnValidateOnObjectTypeUtil = spyOn(app.modules.applicationUtils, 'validateOnObjectType')
        .and.callFake(function(data) {
          if (data === 'invalidData') { throw new Error(); }
        });
    });

    describe('data validation', function() {
      it('should be done with validateOnObjectType user util', function() {
        signIn({});

        var
          result = spyOnValidateOnObjectTypeUtil.calls.count(),
          expected = 1;

          expect(result).toBe(expected);
      });

      it('should be done with correct argument', function() {
        var data = {someKey: 'someValue'};

        signIn(data);

        expect(spyOnValidateOnObjectTypeUtil).toHaveBeenCalledWith(data);
      });

      it('should be done before request was sent', function() {
        expect(signIn.bind(null, 'invalidData')).toThrow();
        expect($.ajax.calls.count()).toBe(0);
      });
    });

    describe('request', function() {
      var signInArguments;

      beforeEach(function() {
        signIn({someKey: 'someValue'});
        signInArguments = $.ajax.calls.argsFor(0)[0];
      });

      it('should has POST type', function() {
        var
          result = signInArguments.method,
          expected = 'POST';

        expect(result).toBe(expected);
      });

      it('should be sent on correct url', function() {
        var
          result = signInArguments.url,
          expected = app.config.usersSessionURL;

        expect(result).toBe(expected);
      });

      it('should be sent with correct processData', function() {
        var
          result = signInArguments.processData,
          expected = false;

        expect(result).toBe(expected);
      });

      it('should be sent with correct contentType', function() {
        var
          result = signInArguments.contentType,
          expected = false;

        expect(result).toBe(expected);
      });
    });
  });

  describe('signUp(data)', function() {
    var
      signUp = app.modules.userAPI.signUp,
      spyOnValidateOnObjectTypeUtil;

    beforeEach(function() {
      spyOnValidateOnObjectTypeUtil = spyOn(app.modules.applicationUtils, 'validateOnObjectType')
        .and.callFake(function(data) {
          if (data === 'invalidData') { throw new Error(); }
        });
    });

    describe('data validation', function() {
      it('should be done with validateOnObjectType user util', function() {
        signUp({});

        var
          result = spyOnValidateOnObjectTypeUtil.calls.count(),
          expected = 1;

          expect(result).toBe(expected);
      });

      it('should be done with correct argument', function() {
        var data = {someKey: 'someValue'};

        signUp(data);

        expect(spyOnValidateOnObjectTypeUtil).toHaveBeenCalledWith(data);
      });

      it('should be done before request was sent', function() {
        expect(signUp.bind(null, 'invalidData')).toThrow();
        expect($.ajax.calls.count()).toBe(0);
      });
    });

    describe('request', function() {
      var signUpArguments;

      beforeEach(function() {
        signUp({someKey: 'someValue'});
        signUpArguments = $.ajax.calls.argsFor(0)[0];
      });

      it('should has POST type', function() {
        var
          result = signUpArguments.method,
          expected = 'POST';

        expect(result).toBe(expected);
      });

      it('should be sent on correct url', function() {
        var
          result = signUpArguments.url,
          expected = app.config.usersRegistrationURL;

        expect(result).toBe(expected);
      });

      it('should be sent with correct processData', function() {
        var
          result = signUpArguments.processData,
          expected = false;

        expect(result).toBe(expected);
      });

      it('should be sent with correct contentType', function() {
        var
          result = signUpArguments.contentType,
          expected = false;

        expect(result).toBe(expected);
      });
    });
  });

  describe('signUp({withSID: true})', function() {
    var
      signUp = app.modules.userAPI.signUp,
      signUpArguments;

    beforeEach(function() {
      signUp({withSID: true});
      signUpArguments = $.ajax.calls.argsFor(0)[0];
    });

    describe('request', function() {
      describe('data', function() {
        it('should contain sid string', function() {
          var
            result = typeof signUpArguments.data.__test__.sid,
            expected = 'string';

          expect(result).toBe(expected);
        });
      });
    });
  });

  describe('deleteSocialProvider', function() {
    var
      deleteSocialProvider = app.modules.userAPI.deleteSocialProvider,
      spyOnValidateProviderNameUtil;

    beforeEach(function() {
      spyOnValidateProviderNameUtil = spyOn(app.modules.userUtils, 'validateProviderName')
        .and.callFake(function(providerName) {
          if (providerName === 'invalidProviderName') { throw new Error(); }
        });
    });

    describe('providerName validation', function() {
      it('should be done with validateProviderName user util', function() {
        deleteSocialProvider('someProviderName');

        var
          result = spyOnValidateProviderNameUtil.calls.count(),
          expected = 1;

          expect(result).toBe(expected);
      });

      it('should be done with correct argument', function() {
        var providerName = 'someProviderName';

        deleteSocialProvider(providerName);

        expect(spyOnValidateProviderNameUtil).toHaveBeenCalledWith(providerName);
      });

      it('should be done before request was sent', function() {
        expect(deleteSocialProvider.bind(null, 'invalidProviderName')).toThrow();
        expect($.ajax.calls.count()).toBe(0);
      });
    });

    describe('request', function() {
      var deleteSocialProviderArguments;

      beforeEach(function() {
        deleteSocialProvider('someProviderName');
        deleteSocialProviderArguments = $.ajax.calls.argsFor(0)[0];
      });

      it('should has DELETE type', function() {
        var
          result = deleteSocialProviderArguments.method,
          expected = 'DELETE';

        expect(result).toBe(expected);
      });

      it('should be sent on correct url', function() {
        var
          result = deleteSocialProviderArguments.url,
          expected = app.config.api.userSocialProviderURL;

        expect(result).toBe(expected);
      });
    });

    describe('result', function() {
      it('should contain result of request', function(done) {
        deleteSocialProvider('someProviderName').then(function(response) {
          expect(response.deleted).toBe(true);
          done();
        });
      });
    });
  });
});
