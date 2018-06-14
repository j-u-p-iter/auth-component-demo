// Модуль для обработки событий изменения конфига гема apress-clearance

app.modules.clearanceConfigChangesHandler = (function(self) {
  var CURRENT_CONFIG_CHANGES_EVENT_NAME = 'app.config.currentUser';

  function _onLocalStorageChange(data) {
    if (app.config.disableSessionsSynchronization || app.config.currentUser.id === data.id) { return; }

    location.reload(true);
  }

  function _triggerCurrentConfigChangesEvent(currentUserData) {
    !app.config.disableSessionsSynchronization && IStorage.trigger(CURRENT_CONFIG_CHANGES_EVENT_NAME, currentUserData);
  }

  function _listener() {
    appEL && appEL.addEventListener(CURRENT_CONFIG_CHANGES_EVENT_NAME, _triggerCurrentConfigChangesEvent);

    IStorage.on(CURRENT_CONFIG_CHANGES_EVENT_NAME, _onLocalStorageChange);
  }

  self.load = function() {
    _listener();

    _triggerCurrentConfigChangesEvent(app.config.currentUser);
  };

  return self;

})(app.modules.clearanceConfigChangesHandler || {});
