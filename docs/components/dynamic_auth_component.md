# Динамический авторизационный компонент.

Это обёртка над авторизационным компонентом, предназначенная сделать показ авторизационного
компонента в попапе простым и универсальным процессом.

Для того, чтобы показать авторизационный компонент в попапе для той или иной сущности,
достаточно отрендерить элемент с атрибутом data-type (о нём читай далее) и задать необходимые опции в определённом неймспейсе.

Для того, чтобы дифференцировать селекторы, опции для каждого попапа, элемент .js-show-auth-component-popup должен содержать data-атрибут
data-type с названием типа того или иного попапа.

Рекомендуется в качестве типа указывать название сущности, для которой создаётся попап.
Например, попап подписок - data-type="subscription", попап авторизации data-type="authorization" и т.д.

Индивидуальные опции следует задавать в app.config.authComponent.wrappers.inPopup[type].
Здесь type - название типа того или иного попапа.

Таким образом, дефолтные опции едины для всех попапов.
Индивидуальные же опции присваиваются отдельно для каждого типа.
