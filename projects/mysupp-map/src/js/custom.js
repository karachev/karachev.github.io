(function ($) {

  /*========== Переопределение тумана в скроллбаре ==============*/
  var div_sh = $('.scrollbar').height(),
    div_h = $('.scrollbar-inner').height();
  $('.scrollbar').scroll(function(){
      if ($(this).scrollTop() >=  div_h - div_sh - 500) {
        $('.results__list').addClass('shadow-none');
      }
      else {
        $('.results__list').removeClass('shadow-none');
      }
  });
	/*==========FOR SVG ==============*/
	svg4everybody();

  // Замена содержания кнопки
  $(function(){
    var $button    = $('.results__btn-skip');

    $button.on('click', function(){
      var toggleText = $(this).data('toggle-text');
      $(this).data('toggle-text', $(this).text())
             .text(toggleText);
    });
  });

  // Селекты
  $('.selectize').SumoSelect({
    search: true,
    searchText:"Поиск",
    csvDispCount: 2,
    captionFormat:'{0} Выбрано',
    captionFormatAllSelected:'Выбраны все {0}',
    nativeOnDevice: ['Opera Mini', 'IEMobile', 'Silk'],
    selectAll: true,
    okCancelInMulti: false,
    isClickAwayOk: false,
    noMatch: 'Не найдено "{0}"',
    locale: ['ОК', 'Отменить', 'Выбрать все'],
    sortField: 'text'
  });

  // Кнопки
  var noJS = document.querySelector(".no-js");
  var openFilter = document.querySelector(".results__btn-filter");
  var modalFilter = document.querySelector(".filter");
  var closeFilter = document.querySelector(".filter__toggle");
  var btnCloseFilter = document.querySelector(".filter-form__btn");
  var modalResults = document.querySelector(".results");
  var resultFold = document.querySelector(".results__btn-skip");
  var resultShow = document.querySelector(".results__btn-show");

  noJS.classList.remove('no-js');

  openFilter.addEventListener("click", function(event) {
    event.preventDefault();
    modalFilter.classList.toggle("filter--show");
    // modalResults.classList.add("results--fold");
    openFilter.classList.toggle("results__btn-filter--open");
  });

  closeFilter.addEventListener("click", function(event){
      event.preventDefault();
      modalFilter.classList.remove("filter--show");
  });

  // Закрытие окна с фильтрами с помощью esc
  window.addEventListener("keydown", function(event) {
    if (event.keyCode === 27) {
      if (modalFilter.classList.contains("filter--show")) {
        modalFilter.classList.remove("filter--show");
        openFilter.classList.remove("results__btn-filter--open");
      }
    }
  });

  // Тоже самое что и closeFilter
  btnCloseFilter.addEventListener("click", function(event){
    event.preventDefault();
    modalFilter.classList.remove("filter--show");
  });

  resultFold.addEventListener("click", function(event){
    event.preventDefault();
    modalResults.classList.toggle("results--fold");
  });

  // Яндекс Карта
  ymaps.ready(function () {
    var myMap = new ymaps.Map('map', {
      center: [59.940688, 30.325052],
      zoom: 13,
      scroll: false,
      controls: ['zoomControl']
    }, {
      searchControlProvider: 'yandex#search'
    }),

    // Создаём макет содержимого.
    MyIconContentLayout = ymaps.templateLayoutFactory.createClass(
      '<div style="color: #FFFFFF; font-weight: bold;">$[properties.iconContent]</div>'
      ),

    myPlacemark1 = new ymaps.Placemark([59.958125, 30.319001], {
        balloonContent: '<strong>Форум-Авто</strong><br>г.Санкт-Петербург пр. Народного Ополчения 201<br>7 (911) 951-27-79, 7 (911) 951-34-09'
    }, {
        // Опции.
        // Необходимо указать данный тип макета.
        iconLayout: 'default#image',
        // Своё изображение иконки метки.
        iconImageHref: 'images/pin.png',
        // Размеры метки.
        iconImageSize: [48, 66]
      }, {
        balloonPanelMaxMapArea: 0
      });

    myPlacemark2 = new ymaps.Placemark([59.961015, 30.365436], {
        balloonContent: '<strong>Форум-Авто</strong><br>г.Санкт-Петербург пр. Народного Ополчения 201<br>7 (911) 951-27-79, 7 (911) 951-34-09'
    }, {
      // Опции.
      // Необходимо указать данный тип макета.
      iconLayout: 'default#image',
      // Своё изображение иконки метки.
      iconImageHref: 'images/pin.png',
      // Размеры метки.
      iconImageSize: [48, 66],
    });

    myPlacemark3 = new ymaps.Placemark([59.956000, 30.350781], {
      balloonContent: '<strong>Форум-Авто</strong><br>г.Санкт-Петербург пр. Народного Ополчения 201<br>7 (911) 951-27-79, 7 (911) 951-34-09'    }, {
      // Опции.
      // Необходимо указать данный тип макета.
      iconLayout: 'default#image',
      // Своё изображение иконки метки.
      iconImageHref: 'images/pin.png',
      // Размеры метки.
      iconImageSize: [48, 66],
    });

    myPlacemark4 = new ymaps.Placemark([59.951965, 30.342584], {
      balloonContent: '<strong>Форум-Авто</strong><br>г.Санкт-Петербург пр. Народного Ополчения 201<br>7 (911) 951-27-79, 7 (911) 951-34-09'    }, {
      // Опции.
      // Необходимо указать данный тип макета.
      iconLayout: 'default#image',
      // Своё изображение иконки метки.
      iconImageHref: 'images/pin.png',
      // Размеры метки.
      iconImageSize: [48, 66],
    });

    myPlacemark5 = new ymaps.Placemark([59.936011, 30.318852], {
      balloonContent: '<strong>Форум-Авто</strong><br>г.Санкт-Петербург пр. Народного Ополчения 201<br>7 (911) 951-27-79, 7 (911) 951-34-09'    }, {
      // Опции.
      // Необходимо указать данный тип макета.
      iconLayout: 'default#image',
      // Своё изображение иконки метки.
      iconImageHref: 'images/pin.png',
      // Размеры метки.
      iconImageSize: [48, 66],
    });

    myPlacemark6 = new ymaps.Placemark([59.933534, 30.344730], {
      balloonContent: '<strong>Форум-Авто</strong><br>г.Санкт-Петербург пр. Народного Ополчения 201<br>7 (911) 951-27-79, 7 (911) 951-34-09'    }, {
      // Опции.
      // Необходимо указать данный тип макета.
      iconLayout: 'default#image',
      // Своё изображение иконки метки.
      iconImageHref: 'images/pin.png',
      // Размеры метки.
      iconImageSize: [48, 66],
    });

    myPlacemark7 = new ymaps.Placemark([59.922268, 30.336104], {
      balloonContent: '<strong>Форум-Авто</strong><br>г.Санкт-Петербург пр. Народного Ополчения 201<br>7 (911) 951-27-79, 7 (911) 951-34-09'
    }, {
      // Опции.
      // Необходимо указать данный тип макета.
      iconLayout: 'default#image',
      // Своё изображение иконки метки.
      iconImageHref: 'images/pin.png',
      // Размеры метки.
      iconImageSize: [48, 66],
    });

    // отключил зум
    myMap.behaviors.disable('scrollZoom'),
    // Изменение положения панели управления
    myMap.controls.get('zoomControl').options.set('position', { right: 50, top: 150 }),

    myMap.geoObjects
    .add(myPlacemark1)
    .add(myPlacemark2)
    .add(myPlacemark3)
    .add(myPlacemark4)
    .add(myPlacemark5)
    .add(myPlacemark6)
    .add(myPlacemark7)
  });
  // // observeEvents(myMap);
  myPlacemark1.balloon.open();
  myPlacemark2.balloon.open();
  myPlacemark3.balloon.open();
  myPlacemark4.balloon.open();
  myPlacemark5.balloon.open();
  myPlacemark6.balloon.open();
  myPlacemark7.balloon.open();

  })(jQuery);