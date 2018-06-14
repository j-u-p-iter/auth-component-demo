//= require clearance/core/user_utils


describe('userUtils', function() {
  beforeAll(function() {
    resetAppConfig();
    extendAppConfig({
      socialNetworkProviders: ['vkontakte', 'odnoklassniki', 'facebook'],
      currentUser: {},
    });
  });

  describe('validateProviderName', function() {
    var validateProviderName = app.modules.userUtils.validateProviderName;

    it('should throw if providerName doesn`t contain String type data', function() {
      var providerName = 5;

      expect(validateProviderName.bind(null, providerName))
        .toThrowError('providerName should be a string, instead ' + providerName + ' was passed.');
    });

    it('should throw if providerName is not allowed', function() {
      var providerName = 'ok';

      expect(validateProviderName.bind(null, providerName))
        .toThrowError(
          'providerName should be in this range: ' +
          app.config.socialNetworkProviders.join(', ') +
          ' instead ' + providerName + ' was given'
        );
    });
  });

  describe('getCurrentUserSocialNetworkUID', function() {
    var getCurrentUserSocialNetworkUID = app.modules.userUtils.getCurrentUserSocialNetworkUID;

    describe('providerName validation', function() {
      var spyOnValidateProviderNameUtil;

      beforeEach(function() {
        spyOnValidateProviderNameUtil = spyOn(
          app.modules.userUtils,
          'validateProviderName'
        ).and.callFake(function() {});

        getCurrentUserSocialNetworkUID('someProviderName');
      });

      it('should be done with validateProviderName user util', function() {
        var
          result = spyOnValidateProviderNameUtil.calls.count(),
          expected = 1;

          expect(result).toBe(expected);
      });

      it('should be done with correct argument', function() {
        var providerName = 'someProviderName';

        expect(spyOnValidateProviderNameUtil).toHaveBeenCalledWith(providerName);
      });
    });

    describe('result', function() {
      beforeAll(function() {
        extendAppConfig({
          currentUser: {
            vkontakteUID: 12345,
          },
        });
      });

      it('should include correct uid', function() {
        var
          result = getCurrentUserSocialNetworkUID('vkontakte'),
          expected = app.config.currentUser.vkontakteUID;

        expect(result).toBe(expected);
      });
    });
  });

  describe('isSignedBySID', function() {
    var isSignedBySID = app.modules.userUtils.isSignedBySID;

    describe('for unsigned user', function() {
      it('should return false', function() {
        var
          result = isSignedBySID(),
          expected = false;

        expect(result).toBe(expected);
      });
    });

    describe('for signedIn user', function() {
      describe('without sid primaryProvider', function() {
        it('should return false', function() {
          extendAppConfig({
            currentUser: {
              primaryProvider: 'phone',
            },
          });

          var
            result = isSignedBySID(),
            expected = false;

          expect(result).toBe(expected);


          extendAppConfig({
            currentUser: {
              primaryProvider: 'email',
            },
          });

          result = isSignedBySID();
          expected = false;

          expect(result).toBe(expected);
        });
      });

      describe('with sid primaryProvider', function() {
        beforeAll(function() {
          extendAppConfig({
            currentUser: {
              primaryProvider: 'sid',
            },
          });
        });

        it('should return true', function() {
          var
            result = isSignedBySID(),
            expected = true;

          expect(result).toBe(expected);
        });
      });
    });
  });

  describe('setConfigData(userData, type)', function() {
    var setConfigData = app.modules.userUtils.setConfigData;

    beforeEach(function() {
      app.config.isUserSigned = false;
      app.config.currentUser = {};
    });

    describe('app.config.isUserSigned', function() {
      describe('for actual user with id', function() {
        it('should be set to true', function() {
          var userData = {id: 1};

          expect(app.config.isUserSigned).toBe(false);

          setConfigData(userData);

          expect(app.config.isUserSigned).toBe(true);
        });
      });

      describe('for user object without id', function() {
        it('should be set to false', function() {
          var userData = {email: 'some@email.com'};

          expect(app.config.isUserSigned).toBe(false);

          setConfigData(userData);

          expect(app.config.isUserSigned).toBe(false);
        });
      });
    });

    describe('app.config.currentUser', function() {
      var userData;

      beforeEach(function() {
        userData = {
          id: 1,
          sid: '12345',
          email: 'some@email.com',
          phone: '+79221231212',
          primaryProvider: 'sid',
        };
      });

      describe('with appEL object', function() {
        it('should be set to userData', function() {
          var currentUserConfig = app.config.currentUser;

          expect(typeof appEL.set).toBe('function');

          expect(currentUserConfig).toEqual({});

          setConfigData(userData);

          expect(currentUserConfig).toEqual(userData);
        });

        it('should call appEL.set', function() {
          spyOn(appEL, 'set').and.callThrough();

          setConfigData(userData);

          expect(appEL.set).toHaveBeenCalled();
        });
      });

      describe('without appEL object', function() {
        var appELCache;

        beforeAll(function() {
          appELCache = appEL;

          appEL = null;
        });

        afterAll(function() {
          appEL = appELCache;
        });

        it('should be set to userData', function() {
          var currentUserConfig = app.config.currentUser;

          expect(appEL).toBe(null);

          expect(currentUserConfig).toEqual({});

          setConfigData(userData);

          expect(currentUserConfig).toEqual(userData);
        });
      });

      describe('with simple type and appEL object', function() {
        it('should be set to userData', function() {
          var currentUserConfig = app.config.currentUser;

          expect(typeof appEL.set).toBe('function');

          expect(currentUserConfig).toEqual({});

          setConfigData(userData, 'simple');

          expect(currentUserConfig).toEqual(userData);
        });

        it('should not call appEL.set', function() {
          spyOn(appEL, 'set').and.callThrough();

          setConfigData(userData, 'simple');

          expect(appEL.set).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('signIn(data)', function() {
    var signIn = app.modules.userUtils.signIn;

    describe('call of app.modules.userAPI.signIn', function() {
      var dataToSignIn = {someKey: 'someValue'};

      beforeAll(function() {
        spyOn(app.modules.userAPI, 'signIn').and.callFake(function() {
          return $.Deferred().resolve({user: {}});
        });

        signIn(dataToSignIn);
      });

      it('should be done one time', function() {
        expect(app.modules.userAPI.signIn.calls.count()).toBe(1);
      });

      it('should be done with correct data', function() {
        var
          result = app.modules.userAPI.signIn.calls.argsFor(0)[0],
          expected = dataToSignIn;

        expect(result).toEqual(expected);
      });
    });

    describe('as a result of sign in', function() {
      beforeEach(function() {
        app.config.isUserSigned = false;
        app.config.currentUser = {};
      });

      describe('when user signed in with success', function() {
        var
          data = {
            user: {
              id: 1,
              sid: '12345',
              email: 'some@email.com',
              phone: '+79221231212',
              primaryProvider: 'sid',
            },
          };


        beforeAll(function() {
          spyOn(app.modules.userAPI, 'signIn').and.callFake(function() {
            return $.Deferred().resolve(data);
          });
        });

        it('should return promise resolved to userData', function(done) {
          signIn().then(function(response) {
            var
              result = response,
              expected = data;

            expect(response).toEqual(expected);

            done();
          });
        });

        it('should update current user and session data correctly', function(done) {
          expect(app.config.isUserSigned).toBe(false);
          expect(app.config.currentUser).toEqual({});

          signIn().then(function() {
            expect(app.config.isUserSigned).toBe(true);
            expect(app.config.currentUser).toEqual(data.user);

            done();
          });
        });
      });

      describe('when user signed in with error', function() {
        var signInError = new Error('Sign In');

        beforeAll(function() {
          spyOn(app.modules.userAPI, 'signIn').and.callFake(function() {
            return $.Deferred().reject(signInError);
          });
        });

        it('should return promise rejected with error', function(done) {
          signIn().then(function() {}, function(error) {
            var
              result = error,
              expected = signInError;

            expect(result).toEqual(signInError);

            done();
          });
        });

        it('should not update current user and session data', function(done) {
          expect(app.config.isUserSigned).toBe(false);
          expect(app.config.currentUser).toEqual({});

          signIn().then(function() {}, function(error) {
            expect(app.config.isUserSigned).toBe(false);
            expect(app.config.currentUser).toEqual({});

            done();
          });
        });
      });
    });
  });

  describe('signUp(data)', function() {
    var signUp = app.modules.userUtils.signUp;

    describe('call of app.modules.userAPI.signUp', function() {
      var dataToSignUp = {someKey: 'someValue'};

      beforeAll(function() {
        spyOn(app.modules.userAPI, 'signUp').and.callFake(function() {
          return $.Deferred().resolve({user: {}});
        });

        signUp(dataToSignUp);
      });

      it('should be done one time', function() {
        expect(app.modules.userAPI.signUp.calls.count()).toBe(1);
      });

      it('should be done with correct data', function() {
        var
          result = app.modules.userAPI.signUp.calls.argsFor(0)[0],
          expected = dataToSignUp;

        expect(result).toEqual(expected);
      });
    });

    describe('as a result of sign up', function() {
      beforeEach(function() {
        app.config.isUserSigned = false;
        app.config.currentUser = {};
      });

      describe('when user signed up with success', function() {
        var
          data = {
            user: {
              id: 1,
              sid: '12345',
              email: 'some@email.com',
              phone: '+79221231212',
              primaryProvider: 'sid',
            },
          };


        beforeAll(function() {
          spyOn(app.modules.userAPI, 'signUp').and.callFake(function() {
            return $.Deferred().resolve(data);
          });
        });

        it('should return promise resolved to userData', function(done) {
          signUp().then(function(response) {
            var
              result = response,
              expected = data;

            expect(result).toEqual(expected);

            done();
          });
        });

        it('should update current user and session data correctly', function(done) {
          expect(app.config.isUserSigned).toBe(false);
          expect(app.config.currentUser).toEqual({});

          signUp().then(function() {
            expect(app.config.isUserSigned).toBe(true);
            expect(app.config.currentUser).toEqual(data.user);

            done();
          });
        });
      });

      describe('when user signed up with error', function() {
        var signUpError = new Error('Sign Up');

        beforeAll(function() {
          spyOn(app.modules.userAPI, 'signUp').and.callFake(function() {
            return $.Deferred().reject(signUpError);
          });
        });

        it('should return promise rejected with error', function(done) {
          signUp().then(function() {}, function(error) {
            var
              result = error,
              expected = signUpError;

            expect(result).toEqual(signUpError);

            done();
          });
        });

        it('should not update current user and session data', function(done) {
          expect(app.config.isUserSigned).toBe(false);
          expect(app.config.currentUser).toEqual({});

          signUp().then(function() {}, function(error) {
            expect(app.config.isUserSigned).toBe(false);
            expect(app.config.currentUser).toEqual({});

            done();
          });
        });
      });
    });
  });

  describe('getUserAttribute(attributeOrAttributes, user)', function() {
    var getUserAttribute = app.modules.userUtils.getUserAttribute;

    describe('with user argument', function() {
      it('should extract data from user object', function() {
        var
          user = {name: 'Some Name'},
          result = getUserAttribute('name', user),
          expected = user.name;

        expect(result).toBe(expected);
      });
    });

    describe('without user argument', function() {
      beforeAll(function() {
        app.config.currentUser = {name: 'Current User Name'};
      });

      it('should extract data from app.config.currentUser object', function() {
        var
          result = getUserAttribute('name'),
          expected = app.config.currentUser.name;

        expect(result).toBe(expected);
      });
    });

    describe('with attributeOrAttributes as a string', function() {
      it('should extract data from user according to this string path', function() {
        var
          user = {id: 1},
          result = getUserAttribute('id', user),
          expected = user.id;

        expect(result).toBe(expected);
      });
    });

    describe('with attributeOrAttributes as an array', function() {
      it('should extract data from user according to path parts in array', function() {
        var
          user = {path1: {path2: 'Some Data'}},
          result = getUserAttribute(['path1', 'path2'], user),
          expected = user.path1.path2;

        expect(result).toBe(expected);
      });
    });
  });
});
