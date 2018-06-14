# Кросс доменная авторизация.


## Содержание
+ [Описание компонента](https://github.com/abak-press/apress-clearance/blob/master/docs/components/cross_domain_auth.md#Описание-компонента)
+ [Подключение компонента](https://github.com/abak-press/apress-clearance/blob/master/docs/components/cross_domain_auth.md#Подключение-компонента)
+ [API компонента](https://github.com/abak-press/apress-clearance/blob/master/docs/components/cross_domain_auth.md#api-Компонента)
+ [Глобальные конфиги](https://github.com/abak-press/apress-clearance/blob/master/docs/components/cross_domain_auth.md#Глобальные-конфиги)


## Описание компонента

Модуль кросс доменной авторизации носит название **crossDomainAuthBridge** и служит для осуществления кросс доменной авторизации пользователя.
Принцип действия компонента основан на общении основного домена проекта с доменом, на котором необходимо кросс доменно авторизовать пользователя.
Общение осуществляется за счёт ifram-а, который служит своеобразным мостом между основным доменом и целевым\*. Именно поэтому в названии компонента присутствует слово `bridge`.

Основные принципы кросс доменной авторизации, реализованные в рамках данного модуля**:

+ **Дано:** авторизованы на основном домене под пользователем A и не авторизованы на целевом домене.

  **Результат:** авторизуемся на целевом домене под пользователем A.

+ **Дано:** не авторизованы на основном домене и авторизованы на целевом домене под пользователем B.

  **Результат:** авторизуемся на основном домене под пользователем B.

+ **Дано:** авторизованы на основном домене под пользователем A, на целевом домене под пользователем B.

  **Результат:** авторизуемся на основном домене под пользователем B.

+ **Дано:** не авторизованы ни на одном из доменов или авторизованы на обоих доменах под одним пользователем.

  **Результат:** кросс доменная авторизация не происходит.

Основной домен задаётся конфигом app.config.crossDomainIframe. Работа компонента выполняется на целевом домене.

\* - домен, на котором необходимо кросс доменно авторизовать пользователя. Таким доменом может служить домен второго уровня СК или домен портала другой страны, отличной от РФ.

\** - Читать следует так: Если "Дано", то при отработке компонента(метода app.modules.crossDomainAuthBridge.authorizeUser) кросс доменной авторизации "Результат"

## Подключение компонента

Для того, чтобы подключить компонент, необходимо подключить css && js ассеты компонента:

**Подключение js:**
`````javascript
//= require package/clearance/cross_domain_auth_bridge
`````

Обратите внимание, данная сборка входит в состав сборки package/clearance/auth_component, поскольку используется
авторизационным компонентом в качестве зависимости. Поэтому, если вы подключили себе сборку авторизационного компонента, то и
модуль кросс доменной авторизации подключится автоматечиски.

**Подключение css:**
`````css
*= require package/clearance/common
`````

Это сборка общая для всех глобальных компонентов apress-clearance, использующихся в большом количестве мест на портале.
К таким глобальным компонентам, в частности, относится и модуль кросс доменной авторизации.


## API Компонента.

### Публичные методы

#### `app.modules.crossDomainAuthBridge.authorizeUser`

**Описание:** Служит для осуществления кросс доменной авторизации.

**Возвращает:** Deferred - объект, который можно слушать, согласно API Deferred-объектов.

**Пример**

Допустим, пользователь находится на СК с доменом второго уровня (целевом домене), и перед нами стоит задача осуществить кросс доменную авторизацию и при успешном результате
выполнить метод onAuthWithSuccess, а при неудачном результате onAuthWithError.

````javascript
app.modules.crossDomainAuthBridge.authorizeUser()
  .done(onAuthWithSuccess)
  .fail(onAuthWithError);
````

По такому принципу реализована ленивая заргузка модулей в загрузчике модулей. Ознакомиться с кодом можно по [данной ссылке](https://github.com/abak-press/apress-application/blob/extract-sso/app/assets/javascripts/application/modules_loader.js).

Этот же принцип использован для кросс доменной авторизации в рамках работы авторизационного компонента, подробнее с которым ознакомиться можно [здесь](https://github.com/abak-press/apress-clearance/blob/master/docs/components/auth_component.md).


## Глобальные конфиги.
Для корректной работы компонента необходимо подключить следующий набор конфигов:

### URLs
`````javascript
// Получение авторизационного token
app.config.ssoUsersSessionRequestURL

// Авторизация пользователя с использованием token
app.config.ssoUsersSessionHandleSigninURL

// src ifram-а для кросс доменной авторизации. Ведёт на основной домен.
app.config.crossDomainIframe
`````

### currentUser Data
`````javascript
// id текущего пользователя
app.config.currentUser.id

// Авторизован ли пользователь
app.config.isUserSigned
`````