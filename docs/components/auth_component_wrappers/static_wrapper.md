# Статический авторизационный компонент (CАК).

## Содержание
+ [Описание компонента](https://github.com/abak-press/apress-clearance/blob/reg-by-email/docs/components/auth_component_wrappers/static_wrapper.md#Описание-компонента)
+ [Цели и задачи](https://github.com/abak-press/apress-clearance/blob/reg-by-email/docs/components/auth_component_wrappers/static_wrapper.md#Цели-и-задачи)
+ [Состав компонента](https://github.com/abak-press/apress-clearance/blob/reg-by-email/docs/components/auth_component_wrappers/static_wrapper.md#Состав-компонента)
+ [Стилизация компонента](https://github.com/abak-press/apress-clearance/blob/reg-by-email/docs/components/auth_component_wrappers/static_wrapper.md#Стилизация-компонента)
+ [Где лучше размещать компонент](https://github.com/abak-press/apress-clearance/blob/reg-by-email/docs/components/auth_component_wrappers/static_wrapper.md#Где-лучше-размещать-компонент)
+ [Пример инициализации](https://github.com/abak-press/apress-clearance/blob/reg-by-email/docs/components/auth_component_wrappers/static_wrapper.md#Пример-инициализации)


## Описание компонента

  САК - это либо отдельностоящий авторизационный компонент (ак), распологающийся на странице изначально (не обязательно видимый по умолчанию), либо любой ак, входящий в состав
  другой формы (читай - другого компонента).

  Таким образом, если при загрузке странице вы хотите показать ак - то вам нужен САК. Если вы хотите инициализиравать ак в составе другого компонента - не важно,
  выводится ли этот внешний компонент в попапе или также, как и в первом случае, выводится сразу при загрузке страницы - то это САК.

  Иначе говоря - если ак не является ДАК, то он является САК )).


## Цели и задачи

  В чём необходимость выделять САК в отдельную сущность?

  Достаточно часто нам необходимо выводить в рамках сторонней формы (будь то форма создания заказа, отправки отзыва и пр.) поля авторизации.
  И везде, где появляется такая необходимость, нам необходимо инициализировать компонент по одной и той же схеме.

  Плюс ко всему авторизационные поля должны обрабатываться наряду с отстальными полями формы. Перед отправкой данных формы на сервер необходимо учитывать валидность
  данных всех полeй формы, в том числе и полей ак. А значит нам нужно каким-то образом обеспечить взаимодействие между компонентами для синхронизации их работы
  (например, организовать общение между ак и компонентом внешней формы).

  А это зачастую приводит к тому, что мы жёстко связываем две сущности - напрямую инициализируем один компонент в другом, даём много лишней информации одному компоненту о другом.
  Такой код сложнее поддерживать; практически на нет сводится взаимозаменяемость модулей; и тестировать такой код очень и очень сложно.

  САК призван решить две эти проблемы:

  1. Избежать необходимости писать везде одно и тоже;
  2. Декомпозировать модули.


## Состав компонента

  САК состоит из трёх основных частей:

  1. ### Конфиг.
  Это первая и основная часть ак. Здесь задаются опции для ак, подробно описанные в [этой документации](https://github.com/abak-press/apress-clearance/blob/reg-by-email/docs/components/auth_component.md).

  **Пример**

  ``````javascript
  'app.config.authComponent.wrappers.static': {
    'sign-up': {
      type: 'form',
      orientation: 'vertical',
      toggleContent: true,
      withMultipleField: true,
      contentType: 'sign-in',
      fields: { hiddenByDefault: ['name'] },
      actionOnSuccess: 'reload',
      redirectTo: #{params[:return_to].to_json},
    }
  }
  ``````

  Итак, при создании конфига нужно:

  - Определиться с названием типа ак. Он послужит неймспейсом для опций ак. В данной ситуации `sign-up` - тип ак.
  - Разместить опиции в соответствующем неймспейсе. Все опции должны быть размещены по данному пути: `app.config.authComponent.wrappers.static`.


  2. ### Модуль-контейнер ак.

  Зачастую нам необходимо обрабатывать результаты авторизации/регистрации, валидации ак и выполнять по результатам данных процессов определённые действия.
  Делать это необходимо в модулях-контейнерах.
  Эти модули имеют привычную для нас структуру, практически не отличающуюся от структуры основных модулей:

  ````````javascript
  app.modules.signInAuthComponentContainer = ((self) => {

    self.getOptions = () => ({
      onMount() {
        $doc.trigger('closeAllPopup:popups');
      },
      onCompleted() {
        location.reload(true);
      },
    });

    return self;

  })(app.modules.signInAuthComponentContainer || {});
  ````````

  Единственным отличием является то, что основным методом такого модуля является метод getOptions, который должен
  возвращать объект с коллбэками для обработки данных на разных этапах работы ак.

  Коллбэки должны иметь строго определённые названия. Весь доступный перечень таких коллбэков и их назначение подробно описаны
  в [документации ак](https://github.com/abak-press/apress-clearance/blob/reg-by-email/docs/components/auth_component.md#Коллбэки)
  (но если вы считаете, что не совсем подробно, то обязательно дайте об этом знать группе Пользователей).

  В данном примере используется два коллбэка:
  - onMount триггерит событие на закрытие попапов как только компонент вставлен в попап.
  - onCompleted перезагружает страницу по факту успешной авторизации/регистрации пользователя.

  Стоит отметить, что модуль-контейнер может вовсе отсутствовать, если ваша задача исключает необходимость каким-либо образом
  обрабатывать результаты работы ак.

  3. ### Элемент-контейнер.

  В том месте, где вы хотите вывести ак, вам необходимо вывести контейнер.
  На данном контейнере компонент будет проинициализирован, и содержимое компонента будет помещено в
  этот конейнер.

  Данный контейнер должен иметь строго определённый класс, который зависит от типа компонента.
  Если тип компонента `sign-up`, то класс должен быть `js-static-${type}-auth-component`.

  **Пример**

  ````````html
    <div class='js-static-sign-up-auth-component'></div>
  ````````

  Рекомендуется рендерить контейнер из гема apress-clearance с передачей типа САК в качестве опции:

  ```````haml
  = render 'apress/clearance/components/auth_component/container', type: 'sign-up'
  ```````
  Профит - класс контейнера будет формироваться автоматически.

  Таким образом, если элемент-контейнер компонента изначально присутствует при загрузке страницы, подключены конфиг
  и сама обёртка компонента, то при загрузке страницы компонент будет проинициализирован и вставлен в контейнер.


  Но не всегда нам нужно инициализировать компонент при загрузке страницы.
  Например, мы хотим, чтобы компонент был проинициализирован лениво, по факту совершения какого-либо действия.
  И тут возможны две ситуации:

  1. Элемент-контейнер присутствует на странице в момент её загрузки, но мы не хотим, чтобы компонент был на нём проинициализирован по умолчанию.

     Чтобы предотвратить инициализацию компонента при загрузке страницы, конфиг компонента должен содержать
     опцию `forceRender` со значением `true` (требуется форсированный рендер).

     Ну а как только вам понадобилось всё же проинициализировать компонент на данном контейнере - вам нужно
     триггерить событие `forceRender:staticAuthComponent` на `$doc` с указанием типа инициализируемого компонента в виде опции.

     **Пример**

     ````````javascript
     $doc.trigger('forceRender:staticAuthComponent', ['sign-up']);
     `````````

  2. Элемент-контейнер изначально отсутствует и, например, возвращается в ответе аякс-запроса в составе формы.

     В этом случае вам нужно запустить ререндеринг статических компонентов на странице с использованием метода
     `app.modules.staticAuthComponent.rerender`. В этом случае запустится инициализация тех компонентов, обёртки для которых в настоящее
     время присутствуют на странице и на которых ещё не был проинициализирован ак. Ранее проинициализированные компоненты не будут проинициализированы
     заново.


## Стилизация компонента.

  Со стилизацией САК свободы намного больше (по сравнению с ДАК). Вы вольны присвоить любой класс контейнеру.
  Однако, рекомендуется присваивать класс, аналогичный классу `js-static-sign-up-auth-component`. Только без js-префикса.
  Например, `static-sign-up-auth-component`.


## Где лучше размещать компонент.

  1. ### Модуль контейнера.

  Прежде всего рекомендуется для всех компонентов (не только авторизационного) создавать папку javascripts/components.
  Соответственно под компонент в данной папке мы создаём папку auth_component. В ней создаём папку containers, в которой в свою очередь
  размещаем модyли всех САК.
  Модули должны носить названия, совпадающие с названиями типов ак.

  **Пример**

  Тип ак: `sign-in-type`.

  Название файла: `sign_in_type.js`.

  Сам же модуль должнен носить такое имя: `signInTypeAuthComponentContainer`.

  То есть к названию типа(в camelCase) добавляете `AuthComponentContainer`.

  Вообще, конечено, вы вольны выбрать любое название. Но лучше придерживаться рекомендаций.
  Ну и в конфигах компонента, в ключике `containerName`, вам необходимо указать вабранное вами имя контейнера.

  **Пример**

  `````text
  // Здесь сидит модуль контейнера ак типа some-type-name
  /javascripts
  /components
    /auth_component
      /containers
        /some_type_name.js // Название модуля - someTypeNameAuthComponentContainer
  ``````


  2. ### CSS для компонента.

  По аналогичному принципу предлагается размещать и стили ак.

  **Пример**

  `````text
  // Здесь сидят стили для ак типа some-type-name
  /stylesheets
  /components
    /auth_component
      /containers
        /some_type_name.scss
  `````


  3. ### Конфиг и контроллер.

  Сам конфиг компонента следует размещать ближе к вьюхе с контейнером, в котором предполагается рендерить компонент.
  Например, в вашем приложении имеется форма, в рамках которой должен быть проинициализирован САК. Сидит эта форма в партиале _some_form.html.haml
  Рядом с этим партиалом создаём отдельный файл для конфиrа(!) и определяем его там.

  Сам конфиг рендерится в основной форме _some_form.html.haml или в основной вьюхе (там же, где рендерится и сама форма).
  Таким образом, куда бы вы не перенесли форму, вы всегда перенесёте её вместе с конфигом.

  **Пример**

  ````text
  /subscriptions
    _some_form // Здесь сидит форма
    _app_config // Здесь инициализируется конфиг ак
  `````

  _app_config рендерится в _some_form.


## Пример инициализации.

  В качестве примера инициализации я приложу ссылки на части САК в Близко.
  На данном проекте с помощью CАК реализована подписка на акции.
  Реализована в двух вариантах.

  В первом варианте форма подписки выводится сразу при загрузе страницы.

  Во втором варианте - выводится в попапе и инициализируется лениво. Так что вам повезло - мы рассмотрим оба этих кейса.


  ### Форма подписки на акции, присутствующая на странице при её загрузке.

  1. [Конфиг](://github.com/abak-press/blizko/blob/reg-by-email/app/views/blizko/apress/deals/front/presenters/fast_subscription/_app_config.html.haml#L7)

     Видим, что компонент имеет тип `deals-subscription-in-panel`.
     Конфиг размещён в той же папке, что и вьюха основной формы подписки.

     [Рендерится там же, где и форма с элементом-контейнером.](https://github.com/abak-press/blizko/blob/reg-by-email/app/views/blizko/apress/deals/front/presenters/fast_subscription/show.html.haml#L15)

     [Имя модуля-контейнера задаётся здесь.](https://github.com/abak-press/blizko/blob/reg-by-email/app/views/blizko/apress/deals/front/presenters/fast_subscription/_app_config.html.haml#L19)

  2. [Модуль-контейнер ак типа `deals-subscription-in-panel`](https://github.com/abak-press/blizko/blob/reg-by-email/app/assets/javascripts/components/auth_component/containers/deals_subscription_in_panel.js#L6).

     Модуль-контейнер определяет два коллбэка, с помощью которых компонент общается с модулем подписки.

     В случае возникновения ошибки при авторизации/регистрации - вызывается метод onError, который передаёт данные об ошибках модулю подписок.

     В случае успеха при авторизации/регистрации - вызывается метод onCompleted, который, используя публичное API модуля подписок, осуществляет подписку на акции.

  3. [Элемент-контейнер](https://github.com/abak-press/pulscen/blob/reg-by-email/app/views/shared/_auth_link.html.haml#L4).

  4. [Стили](https://github.com/abak-press/blizko/blob/reg-by-email/app/assets/stylesheets/components/auth_component/containers/deals_subscription_in_panel.scss).


  ### Форма подписки на акции в попапе.

  1. [Конфиг](https://github.com/abak-press/blizko/blob/reg-by-email/app/views/blizko/shared/showcases/_showcases_banner_app_config.html.haml)

     Видим, что компонент имеет тип `deals-subscription-in-popup`.

     Конфиг размещён в той же папке, что и панель с кнопкой, при клике по которой показывается форма подписки с САК.

     [Рендерится там же, где и кнопка вызова попапа.](https://github.com/abak-press/blizko/blob/reg-by-email/app/views/blizko/shared/showcases/_showcases_banner.html.haml#L18)

     [Имя модуля-контейнера задаётся здесь.](https://github.com/abak-press/blizko/blob/reg-by-email/app/views/blizko/shared/showcases/_showcases_banner_app_config.html.haml#L7)

  2. [Модуль-контейнер ак типа `deals-subscription-in-popup`](https://github.com/abak-press/blizko/blob/reg-by-email/app/assets/javascripts/components/auth_component/containers/deals_subscription_in_popup.js).

     Контейнер определяет два коллбэка, с помощью которых компонент общается с модулем подписки.

     В случае возникновения ошибки при авторизации/регистрации - вызывается метод onError, который передаёт данные об ошибках модулю подписок.

     В случае успеха при авторизации/регистрации - вызывается метод onCompleted, который, используя публичное API модуля подписок, осуществляет подписку на акции.

  3. [Элемент-контейнер](https://github.com/abak-press/blizko/blob/reg-by-email/config/initializers/deals.rb#L105).

  4. [Стили](https://github.com/abak-press/blizko/blob/reg-by-email/app/assets/stylesheets/components/auth_component/containers/deals_subscription_in_popup.scss)