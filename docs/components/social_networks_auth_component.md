# Компонент авторизации через соц. сети.

## Содержание
+ [Описание компонента](https://github.com/abak-press/apress-clearance/blob/master/docs/components/social_networks_auth_component.md#Описание-компонента)
+ [Схема работы компонента](https://github.com/abak-press/apress-clearance/blob/master/docs/components/social_networks_auth_component.md#Схема-работы-компонента)
+ [Подключение компонента](https://github.com/abak-press/apress-clearance/blob/master/docs/components/social_networks_auth_component.md#Подключение-компонента)
+ [Опции](https://github.com/abak-press/apress-clearance/blob/master/docs/components/social_networks_auth_component.md#Опции)
+ [Глобальные конфиги](https://github.com/abak-press/apress-clearance/blob/master/docs/components/social_networks_auth_component.md#Глобальные-конфиги)


## Описание компонента.

Комопнент служит для реализации авторизации через соц.сети на клиенте.
Доступные сети: OK (Одноклассники), FB (Face Book), VK (Вконтакте).


## Схема работы компонента.

Рассмотрим в общих чертах, как работает компонент.

1. Клик по одной из иконок соц сетей в браузере X приводит:

   - К открытию смежной вкладки или отдельного окна в этом же браузере. Что окрыть - окно или вкладку - решает браузер. Нам остаётся только согласиться.
    Если открыта вкладка - то эта вкладка становится активной для текущего пользователя. Окно - оно и есть окно - откроется как попап и будет ждать дальнейших указаний :).

   - К отправке запроса на сервер для регистрации текущего, инициированного по клику, процесса авторизации/регистрации. Для чего мы регистрируем этот процесс - станет ясно чуть позднее.
     Пока примем как факт - что мы отправили запрос на сервер на регистрацию процесса (для идентификации процесса предварительно сгенерировали уникальный идентификатор процесса с помощью нашей любимой
     [утилиты](https://github.com/abak-press/apress-application/blob/master/app/assets/javascripts/application/utils.js#L246)).


2. Далее компонент ждёт реакции от вкладки, в которой открыта одна из соц. сетей. Какой именно реакции? Компонент отслеживает событие закрытия вкладки, чтобы начать слушать в оригинальной вкладке результат операции авторизации!
   Слушаем мы его благодаря:

   - id-шнику, который мы сгенерировали на прошлом этапе и использовали для регистрации процесса авторизации;
   - благодаря новому запросу на сервер.

   Аха! Вот зачем нам нужна была регистрация процесса авторизации! Ну теперь всё встало на свои места) Можно двигаться дальше.

   Итак, компонент ждёт закрытие владки. И тут может последовать резонный вопрос - а что если пользователь решит её не закрывать?
   А ответ таков - мы сами ему в этом поможем. По факту авторизации на портале одной из соц сетей - пользователя отредиректит обратно на наш портал по определённому маршруту, где его будет ждать небольшой JavaScript скрипт, который
   и закроет вкладку за нашего любимого пользователя.

   Внимательный и любопытный читатель может задать ещё один вопрос - "А что если пользователь не будет авторизовываться через соц. сеть. Откроет вкладку, хмыкнет и вернётся на портал, с которого пришёл и решит авторизовываться
   с помощью нашего крутого авторизацинного компонента." Ответ - флаг ему в руки. Мы начинаем слушать результат процесса авторизации только по факту закрытия вкладки. Не закрыл вкладку - не запустил процесс.

   "Ну хорошо" - продолжает наш читатель-исследователь - "а если я не буду авторизовываться, а просто вкладку закрою, вы что же - на моём компе процессы какие-то лишние запускать будете. Я же не сделал ничего." Ответ. Да, запустим.
   Но не переживай, дорогой друг - этот процесс быстро закончится. Мы узнаем по результатам запроса - что ты профукал свой шанс авторизоваться через соц.сети и прекратим прослушку за тобой. И ты сможешь продолжать работать на портале
   в обычном режиме.

   "Но, но..." - да, да, это вновь пристаёт всё тот же читатель. "Но что если мы будем по факту авторизации во вкладке и последующего редиректа на основной портал передавать знание основной вкладке о результатах процесса? Тогда нам
   вообще в основной вкладке слушать ничего не придётся". И ведь ты, наш дорогой, близок к истине. Почему бы и нет?
   Мы постарались сделать наш компонент максимально юзер-френдли. Мы хотим, чтобы по факту авторизации через соц. сети юзер всегда смог бы узнать о результатах своей авторизации и
   хотим иметь возможность отреагировать корректно на данные результаты. И существует кейс (пусть и редкий), когда по факту авторизации через соц. сети пользователь не дождётся редиректа обратно
   на родительский (назовём его так) портал, а закроет вкладку. Поэтому, чтобы иметь возможность всегда - при любых погодных условиях - добиться нужного результата - мы:
   - реагируем на факт закрытия вкладки
   - начинаем слушать результат авторизации в основной вкладке по факту закрытия этой самой вкладки.

3. Результатов авторизации через соц.сеть может быть конечно же несколько:

   - процесс не начат. Пользователь просто балуется - открывает и закрывает вкладки. Обрабатывать такой процесс мы не должны и не будем. Просто прекращаем слушать результат авторизации. Такие пользователи-шалуны нам не интересны.

   - успешная автризация. В этом случае компонент обрабатывает результат внутри и даёт возможность разработчику индивидуально, по месту, отреагировать на данный результат. Для этого компонентом будет вызван
     коллбэк onSuccess, который разработчик может задать при инициализации компонента. В коллбак будут проброшены результаты авторизации - информация об авторизованном пользователе.

   - авторизация по тем или иным причинам упала с ошибкой. Компонент обязательно обработает этот результат внутри. А также даст возможность пользователю, также как и в предыдущем случае, отреагировать индивидуально по месту на
     ошибку при авторизации. Для этого компонентом будет вызван коллбэк onError, который разработчик может задать при инициализации компонента. В коллбак будут проброшены результаты авторизации - объект ошибки класса Error.

   Подробнее о всех возможных опциях компонента читайте далее в разделе [Опции](https://github.com/abak-press/apress-clearance/blob/master/docs/components/social_networks_auth_component.md#Опции).


## Подключение компонента.

Для того, чтобы подключить компонент, необходимо:

1. ### Подключить css && js ассеты компонента.

   JavaScript модуль компонента входит в состав базовой js сборки гема apress-clearance:
   ``````javascript
   //= require package/clearance/base
   ``````

   Если по каким-либо причинам вам эта сборка не подходит - можете тащить модуль компонента авторизации по прямой ссылке:
   ``````javascript
   //= require clearance/components/social_networks_auth_component/social_networks_auth_component
   ``````

   Аналогично с css:

   CSS для компонента входит в состав общей css-сборки текущего гема:
   ``````css
   //= require package/clearance/common
   ``````

   Не хотите общую - тащите точечно:
   ``````css
   //= require clearance/social_networks_auth_component_container
   //= require clearance/social_networks_auth_component
   ``````

2. ### Отрендерить контейнер компонента и проинициализировать компонент.

   Рендерим div-чик c наиболее понравишимся вам селектором.

   `````ruby
   .js-the-best-component-ever
   `````
   На этом элементе триггерим событие 'render:socialNetworksAuthComponent'.

   `````javascript
   $('.js-the-best-component-ever').trigger('render:socialNetworksAuthComponent')
   `````

3. ### Прописать в проекте секцию для размещения JS в head:

   `````ruby
   - if content_for?(:js_in_head)
     = yield(:js_in_head)
   `````

   - **Зачем нам JS в head?**

     В случае данного компонента нам нужна необходимость закрывать вкладку портала по факту авторизации
     на портале соц.сетей. При этом сделать нам это нужно как можно быстрее. Поэтому помещаем код для закрытия вкладки максимально высоко.

   - **Почему такое название? Почему не javascripts_in_head - по аналогии с уже имеюимися секциями?**

     В настоящий момент такая секция существует только в ПЦ. И названа она именно js_in_head. Кто первый встал того и тапки) Поэтому секция названа так - как названа)

   - **Почему я поключил компонент в проект, но вкладка, на которую я перехожу по факту регистрации через соц.сети, не закрывается?**

     Потому что вы не разместили в своём проекте секцию **js_in_head**.


### Опции

##### `type`

+ **Тип данных:** Строка.
+ **Описание:** Служит для указания типа компонента, который нужно отрендерить.

+ **Доступные значения:** simple || extended
+ **Значение по умолчанию:** extended

Таким образом, компонент может быть одного из двух типов. Отличаются эти типы вью-представлением и функциональными возможностями.

- Компонент простого типа (simple) представлен просто набором иконок соцсетей. Да, это так просто, как звучит. Компонент представлен тремя иконками соцсетей.
  Пример (слизано с попапа авторизации на Пульсе): Тут идёт картинка

- Компонент расширенного типа (extended) - немножечко более вкусная плюшка. Он вам даёт возможность не только авторизовывать пользователя, но и при необходимости отвязывать его.
  Пример компонента, взятый из кабинета с вездесущего Пульса: Тут тоже идёт картинка.

##### `onSuccess`

+ **Тип данных:** Функция
+ **Описание:** Выполняется по факту успешной авторизации через одну из соц.сетей.

+ **Значение по умолчанию:** function() {}.
+ **Аргументы**: user - инфрмация о пользователе, авторизованного через соц.сеть.

##### `onError`

+ **Тип данных:** Функция
+ **Описание:** Выполняется в случае если в процессе авторизации пользователя по той или иной причине произошла ошибка.

+ **Значение по умолчанию:** function() {}.
+ **Аргументы**: error - объет ошибки, описывающий ошибку, произошедшую по результату авторизации.

##### Пример инициализации со всеми возможными опциями:

`````javascript
$('.js-the-best-component-ever').trigger('render:socialNetworksAuthComponent', {
  type: 'simple',
  onSuccess: user => console.log('Do something with user data:', user),
  onError: error => console.log('Process error:', error),
});
`````


## Глобальные конфиги

Для корректной работы компонента необходимо подключить следующий набор конфигов.

````javascript
// Список всех соц.сетей, для которых можно отрендерить ссылки социальных сетей:
app.config.socialNetworkProviders = ['vkontakte','facebook','odnoklassniki']
````

Названия провайдеров соц.сетей должны в точности совпадать с названиями приведёнными в данном примере:

- vkontakte
- facebook
- odnoklassniki

Это весь допустимый список соц.сетей.

````javascript
// Темплейт урлов ссылок, ведущих на социальные сети:
app.config.newOmniauthAuthorizeURL
````

Пример такого урла может выглядеть так:
http://www.some-host-name/auth/_provider_

Обязательной составляющей урла должен быть элемент \_provider_.
Для каждой конкретной ссылки эта часть будет заменена компонентом на название на одного из социальных провайдеров:

- vkontakte
- facebook
- odnoklassniki

В коде модуля компонента соц.сетей вы можете найте использование конфигов, не упомянутых выше.
Данные конфиги относятся к старой схеме авторизации через соц.сети, помечены как deprecated
и будут удалены из модуля, как только во всех существующих местах внедрения компонента авторизации через соц.сети
будет реализована новая схема авторизации.

Все вышеперечисленные конфиги уже находятся в составе [кастомного файла-конфигурации](https://github.com/abak-press/apress-clearance/blob/glamour-auth-component/app/views/apress/clearance/require/_common_config.html.haml) гема apress-clearance.


## Десктопная или мобильная версия компонента.
Разделения на мобильную или десктопную версии нет. Для обеих версий сайта инициализируется один и тот же модуль и рендерятся одни и те же темплейты.
Как следствие, ни во внешнем виде, ни в логике различий нет.