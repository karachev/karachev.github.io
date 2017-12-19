(function ($) {

	/*==========FOR SVG ==============*/
	svg4everybody();

  /*==========FOR SLIDER-TOP index.html ==============*/
  $(document).on('ready', function() {
    $(".slider-top").slick({
      dots: true,
      lazyLoad: 'ondemand',
      infinite: true,
      arrows: false
    });
  });

  $(document).on('ready', function() {
    $(".slider-ui").slick({
      dots: true,
      lazyLoad: 'ondemand',
      infinite: true
    });
  });

  $(document).on('ready', function() {
    $(".slider-features").slick({
      dots: true,
      arrows: false,
      lazyLoad: 'ondemand',
      infinite: true
    });
  });

  $(document).on('ready', function() {
    $(".slider-mobile").slick({
      dots: true,
      arrows: false,
      lazyLoad: 'ondemand',
      infinite: true,
      slidesToShow: 4,
      rows: 2,
      slidesPerRow: 2,
      responsive: [
        {
          breakpoint: 1280,
          settings: {
            rows: 1,
            slidesPerRow: 4
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            dots: true,
            rows: 1,
            slidesPerRow: 1
          }
        },
      ]
    });
  });

  $(document).on('ready', function() {
    $(".slider-question").slick({
      slidesToShow: 5,
      slidesToScroll: 1,
      arrows: false,
      asNavFor: '.slider-faq',
      centerMode: true,
      infinite: true,
      dots: true,
      focusOnSelect: true,
      appendDots: $('.dots-question'),
      responsive: [
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          }
        },
        {
          breakpoint: 1280,
          settings: {
            centerMode: true,
            centerPadding: '0px',
            slidesToShow: 3,
            slidesToScroll: 1,
          }
        }
      ]
    });
    $(".slider-faq").slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      dots: false,
      focusOnSelect: true,
      initialSlide: 3, // начальный слайд
      infinite: true,
      asNavFor: '.slider-question',
      arrows: false
    });
  });

  $(document).on('ready', function() {
    $(".slider-license").slick({
      dots: true,
      lazyLoad: 'ondemand',
      infinite: false,
      slidesToShow: 3,
      responsive: [
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            dots: true
          }
        }
      ]
    });
  });

  $('.grid').isotope({
    itemSelector: '.grid-item',
    percentPosition: true,
    masonry: {
      columnWidth: '.grid-sizer'
    }
  });

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
/*MENU*/
$('.main-nav').on("click", function(){
  $('body').toggleClass('open-menu');
  document.ontouchmove = function(e){ e.preventDefault(); }
})
$('.modal-menu__close').on("click", function(){
  $('body').toggleClass('open-menu');
  document.ontouchmove = function(e){ return true; }
})
$('.main-nav--close').on("click", function(){
  $('body').toggleClass('open-menu');
  document.ontouchmove = function(e){ return true; }
})

// START Scroll order.html
function scrollToNextStep(event) {
  event.preventDefault();
  var id  = $(this).attr('href'),
  top = $(id).offset().top;
  $('body,html').animate({scrollTop: top}, 1500);
};
$("#step1").on("click","a", scrollToNextStep);
$("#step2").on("click","a", scrollToNextStep);
$("#step3").on("click","a", scrollToNextStep);
$("#step4").on("click","a", scrollToNextStep);

// END Scroll order.html

// form
  $(function () {
    $.validator.setDefaults({ ignore: ":hidden:not(select)" })
    /* RULES */
    $("#form-login-header").validate({
      focusCleanup: true,
      focusInvalid: true,
      rules: {
        loginNameHeader: "required",
        loginPasswordHeader: "required"
      },
      messages: {
        loginNameHeader: "",
        loginPasswordHeader: ""
      }
    });
    $("#form-login-footer").validate({
      focusCleanup: true,
      focusInvalid: true,
      rules: {
        loginNameFooter: "required",
        loginPasswordFooter: "required"
      },
      messages: {
        loginNameFooter: "",
        loginPasswordFooter: ""
      }
    });
    $("#faq-form-valid").validate({
      focusCleanup: true,
      focusInvalid: true,
      messages: {
        required: "Required input"
      }
    });
    $("#order-form-valid").validate({
      focusCleanup: true,
      focusInvalid: true,
      rules: {
        name: "required",
        surname: "required",
        age: "required",
        country: "required",
        delivery: "required",
        country2: "required",
        city: "required",
        address: "required",
        dayBirth: "required",
        monthBirth: "required",
        yearBirth: "required",
        licenseNumber: "required",
        monthLicense: "required",
        yearLicense: "required",
        country4: "required",
        city2: "required",
        address2: "required",
        name2: "required",
        surname2: "required"
      },
      messages: {
        name: '',
        surname: '',
        age: '',
        country: '',
        delivery: '',
        country2: '',
        city: '',
        address: '',
        dayBirth: '',
        monthBirth: '',
        yearBirth: '',
        licenseNumber: '',
        monthLicense: '',
        yearLicense: '',
        country4: "",
        city2: "",
        address2: "",
        name2: "",
        surname2: ""
      }
    });
    $("#order-form-valid-copy").validate({
      focusCleanup: true,
      focusInvalid: true,
      rules: {
        name: "required",
        surname: "required",
        age: "required",
        country: "required",
        delivery: "required",
        country2: "required",
        city: "required",
        address: "required",
        dayBirth: "required",
        monthBirth: "required",
        yearBirth: "required",
        licenseNumber: "required",
        monthLicense: "required",
        yearLicense: "required",
        country4: "required",
        city2: "required",
        address2: "required",
        name2: "required",
        surname2: "required"
      },
      messages: {
        name: '',
        surname: '',
        age: '',
        country: '',
        delivery: '',
        country2: '',
        city: '',
        address: '',
        dayBirth: '',
        monthBirth: '',
        yearBirth: '',
        licenseNumber: '',
        monthLicense: '',
        yearLicense: '',
        country4: "",
        city2: "",
        address2: "",
        name2: "",
        surname2: ""
      }
    });
    $("#registration-form-valid").validate({
      focusCleanup: true,
      focusInvalid: true,
      rules: {
        name: "required",
        surname: "required",
        country: "required",
        city: "required",
        address: "required",
        email: "required",
        password: "required",
        phone: "required",
        password2: "required"
      },
      messages: {
        name: "",
        surname: "",
        country: "",
        city: "",
        address: "",
        email: "",
        password: "",
        phone: "",
        password2: ""
      }
    });
  });

// end form
  function loadPhotoForm() {
    var countFiles = $(this)[0].files.length;
    var imgPath = $(this)[0].value;
    var extn = imgPath.substring(imgPath.lastIndexOf('.') + 1).toLowerCase();
    var idImage = $(this).attr('data-image'),
        idLabel = $(this).attr('data-label');
    var image_holder = $('#' + idImage),
        label = $('#' + idLabel);
    var file_name = this.value.replace(/\\/g, '/').replace(/.*\//, '');
    image_holder.empty();
    if (extn == "gif" || extn == "png" || extn == "jpg" || extn == "jpeg") {
      $(label).text(file_name);
      if (typeof(FileReader) != "undefined") {
        for (var i = 0; i < countFiles; i++)
        {
          var reader = new FileReader();
          reader.onload = function(e) {
            image_holder.prop('src', e.target.result).css('opacity', '1')
            image_holder.prop('alt', e.target.result)
            // $('.uploads-image > img').css('opacity', '1')
          }
          image_holder.show();
          reader.readAsDataURL($(this)[0].files[i]);
        }
      } else {
        alert("Браузер не поддерживает загрузку изображений.");
      }
    } else {
      alert("Выберите только одно изображение , которое поддерживает форматы .gif, .png, .jpeg");
    }
  };

  $(".inputfile").on('change', loadPhotoForm);
  $(".inputfile-certificate").on('change', loadPhotoForm);
  $(".inputfile-signature").on('change', loadPhotoForm);
  $(".inputfile-photo").on('change', loadPhotoForm);

  // Модальное окно личный кабинет
  $('.button-widget__btn').on("click", function(){
    $('.modal').toggleClass('modal--show');
    $('body').css('overflow', 'hidden');
  });
  $('.modal-settings__btn').on("click", function(){
    $('.modal').toggleClass('modal--show');
    $('body').css('overflow', 'auto');
  });

  // Забыл пароль
  $('.login-container--forget').css('display', 'none');
  $('.login__reset').on("click", function(){
    $('.login-container').css('display', 'none');
    $('.login-container--forget').css('display', 'block');
  });
  $('.login__exit').on("click", function(){
    $('.login-container').css('display', 'block');
    $('.login-container--forget').css('display', 'none');
  });

})(jQuery);

var languageBtn = document.querySelector('.language__current');
var languageSubmenu = document.querySelector('.submenu-lang');
var languageClose = document.querySelector('.language__close');
var btnOrderHeader = document.querySelector('.btn-order--header');
var submenuOrderHeader = document.querySelector('.submenu-order--header');
var btnOrderHeaderClose = document.querySelector('btn-order--header-close')
// Открыть меню с языком
languageBtn.addEventListener("mouseover", function(event){
  event.preventDefault();
  languageSubmenu.classList.add('submenu-lang--show');
});
languageSubmenu.addEventListener("mouseover", function(event){
  event.preventDefault();
  languageSubmenu.classList.add('submenu-lang--show');
});

// Закрыть меню с языком
languageSubmenu.addEventListener("mouseout", function(event){
  event.preventDefault();
  languageSubmenu.classList.remove('submenu-lang--show');
});

  // Открытие/закрытие модального окна для меню в хэдере
var mainNavOpen = document.querySelector('.main-nav');
var mainNavClose = document.querySelector('.modal-menu__close');
var mainModal = document.querySelector('.modal-menu');
var footerNavOpen = document.querySelector('.main-nav--footer');

mainNavOpen.addEventListener("click", function(event){
  if (window.innerWidth < 1366) {
    event.preventDefault();
    mainModal.classList.toggle('modal-menu--show');
    mainNavOpen.classList.toggle('main-nav--close');
  }
});

footerNavOpen.addEventListener("click", function(event){
  if (window.innerWidth < 1280) { // Не должно работать на десктопе
    event.preventDefault();
    mainModal.classList.toggle('modal-menu--show');
    $('html, body').animate({scrollTop:0}, 1);
    mainNavOpen.classList.toggle('main-nav--close');
  }
});

mainNavClose.addEventListener("click", function(event){
  event.preventDefault();
  mainModal.classList.remove('modal-menu--show');
  mainNavOpen.classList.remove('main-nav--close');
});

var headerBlock = document.querySelector('.header');
var searchButton = headerBlock.querySelector('.search__btn');
var searchInputModal = mainModal.querySelector('[name=search-input]');
var searchBlock = headerBlock.querySelector('.search');

var footerBlock = document.querySelector('.footer');
var searchButtonFooter = footerBlock.querySelector('.search__btn');
var searchBlockFooter = footerBlock.querySelector('.search');

searchButton.addEventListener("click", function(event){
    event.preventDefault();
  if (window.innerWidth < 768) { // Не должно работать на десктопе
    mainModal.classList.toggle('modal-menu--show');
    $('body').toggleClass('open-menu');
    mainNavOpen.classList.toggle('main-nav--close');
    searchInputModal.focus();
  } else {
    searchBlock.classList.add('search--show');
  }

  document.addEventListener("click", function(event) {
    var seachBlockShow = headerBlock.querySelector('.search--show');
    if (seachBlockShow) {
      onCloseHeader(event);
    }
  });
});

function onCloseHeader(e) {
  if( !e ) e = window.event; // <---needed this --- and this ->--+
  var target = e.target;
  while (target !== document) {
    if (target.classList.contains('search--show')) {
      return;
    }
    target = target.parentNode;
  }
  searchBlock.classList.remove('search--show');
}

function onCloseFooter(e) {
  if( !e ) e = window.event; // <---needed this --- and this ->--+
  var target = e.target;
  while (target !== document) {
    if (target.classList.contains('search--show')) {
      return;
    }
    target = target.parentNode;
  }
  searchBlockFooter.classList.remove('search--show');
}

searchButtonFooter.addEventListener("click", function(event){
    event.preventDefault();
  if (window.innerWidth < 768) { // Не должно работать на десктопе
    mainModal.classList.toggle('modal-menu--show');
    mainNavOpen.classList.toggle('main-nav--close');
    searchInputModal.focus();
  } else {
    searchBlockFooter.classList.add('search--show');
  }

  document.addEventListener("click", function(event) {
    var searchBlockShow = footerBlock.querySelector('.search--show');
    if (searchBlockShow) {
      onCloseFooter(event);
    }
  });
});

// Закрытие окон на странице grid
function addClass (button, modal, add) {
  button.addEventListener("click", function(event){
    event.preventDefault();
    modal.classList.add(add);
  });
}

function toggleClass (button, modal, toggle) {
  button.addEventListener("click", function(event){
    event.preventDefault();
    modal.classList.toggle(toggle);
  });
}

var grid = document.querySelector('.grid');
if (grid) {
  var closeApplication = grid.querySelector('.application__close');
  var gridApplication = grid.querySelector('.application');
  if (closeApplication) {
    addClass(closeApplication, gridApplication, 'application--close');
  }

  var closeStatistic = grid.querySelector('.statistic__close');
  var gridStatistic = grid.querySelector('.statistic');
  if (closeStatistic) {
    addClass(closeStatistic, gridStatistic,'statistic--close');
  }

  var closeBalance = grid.querySelector('.balance__close');
  var gridBalance = grid.querySelector('.balance');
  if (closeBalance) {
    addClass(closeBalance, gridBalance,'balance--close');
  }

  var closeAgents = grid.querySelector('.agents__close');
  var gridAgents = grid.querySelector('.agents');
  if (closeAgents) {
    addClass(closeAgents, gridAgents,'agents--close');
  }

  var closePrice = grid.querySelector('.price__close');
  var gridPrice = grid.querySelector('.price');
  if (closePrice) {
    addClass(closePrice, gridPrice,'price--close');
  }

  var closeData = grid.querySelector('.data__close');
  var gridData = grid.querySelector('.data');
  if (closeData) {
    addClass(closeData, gridData,'data--close');
  }

  var closeTarif = grid.querySelector('.tarif__close');
  var gridTarif = grid.querySelector('.tarif');
  if (closeTarif) {
    addClass(closeTarif, gridTarif,'tarif--close');
  }

  var closeMap = grid.querySelector('.map__close');
  var gridMap = grid.querySelector('.map');
  if (closeMap) {
    addClass(closeMap, gridMap,'map--close');
  }
}

var pageContacts = document.querySelector('.contacts');
if (pageContacts) {
  var btnShowRequisites = pageContacts.querySelector('.show-requisites');
  var requisitesBlock = pageContacts.querySelector('.contacts-requisites');
  var btnCloseRequisites = pageContacts.querySelector('.close-modal');

  btnShowRequisites.addEventListener("click", function(event){
    event.preventDefault();
    $('html, body').animate({scrollTop:0}, 'fast');
    requisitesBlock.classList.toggle('contacts-requisites--show');
    $('body').toggleClass('open-menu');
    document.ontouchmove = function(e){ e.preventDefault(); }
  });
  btnCloseRequisites.addEventListener("click", function(event){
    event.preventDefault();
    $('html, body').animate({scrollTop:0}, 'fast');
    requisitesBlock.classList.toggle('contacts-requisites--show');
    $('body').toggleClass('open-menu');
    document.ontouchmove = function(e){ return true; }
  });


  var btnContactsOfficeClose = pageContacts.querySelector('.btn-close');
  var btnContactsOfficeOpen = pageContacts.querySelector('.show-address');
  var contactsList = pageContacts.querySelector('.contacts-list');
  btnContactsOfficeClose.addEventListener("click", function(event){
    event.preventDefault();
    $('html, body').animate({scrollTop:0}, 'fast');
    contactsList.classList.toggle('contacts-list--show');
    $('body').toggleClass('open-menu');
    document.ontouchmove = function(e){ return true; }
  });
  btnContactsOfficeOpen.addEventListener("click", function(event){
    event.preventDefault();
    $('html, body').animate({scrollTop:0}, 'fast');
    contactsList.classList.toggle('contacts-list--show');
    $('body').toggleClass('open-menu');
    document.ontouchmove = function(e){ e.preventDefault(); }
  });
  if (window.innerWidth < 768) {
    var officeRussia = pageContacts.querySelector('.contacts-item--russia');
    var officeUsa = pageContacts.querySelector('.contacts-item--usa');
    var officeChina = pageContacts.querySelector('.contacts-item--china');
    var officeTitleRussia = pageContacts.querySelector('.office-item--russia');
    var officeTitleUsa = pageContacts.querySelector('.office-item--usa');
    var officeTitleChina = pageContacts.querySelector('.office-item--china');
    var contactsInfoBlock = pageContacts.querySelector('.contacts-info');
    var contactsInfoRussia = contactsInfoBlock.querySelector('.contacts-item--russia');
    var contactsInfoUsa = contactsInfoBlock.querySelector('.contacts-item--usa');
    var contactsInfoChina = contactsInfoBlock.querySelector('.contacts-item--china');
    officeRussia.addEventListener('click', function(event){
      officeUsa.classList.remove('hidden-block');
      officeChina.classList.remove('hidden-block');
      officeRussia.classList.add('hidden-block');
      officeTitleRussia.classList.remove('hidden-block');
      officeTitleUsa.classList.add('hidden-block');
      officeTitleChina.classList.add('hidden-block');
      contactsList.classList.toggle('contacts-list--show');
      contactsInfoRussia.classList.add('contacts-item--show');
      contactsInfoUsa.classList.remove('contacts-item--show');
      contactsInfoChina.classList.remove('contacts-item--show');
      $('body').toggleClass('open-menu');
      document.ontouchmove = function(e){ return true; }
    });
    officeUsa.addEventListener('click', function(event){
      officeUsa.classList.add('hidden-block');
      officeChina.classList.remove('hidden-block');
      officeRussia.classList.remove('hidden-block');
      officeTitleRussia.classList.add('hidden-block');
      officeTitleUsa.classList.remove('hidden-block');
      officeTitleChina.classList.add('hidden-block');
      contactsList.classList.toggle('contacts-list--show');
      contactsInfoRussia.classList.remove('contacts-item--show');
      contactsInfoUsa.classList.add('contacts-item--show');
      contactsInfoChina.classList.remove('contacts-item--show');
      $('body').toggleClass('open-menu');
      document.ontouchmove = function(e){ return true; }
    });
    officeChina.addEventListener('click', function(event){
      officeUsa.classList.remove('hidden-block');
      officeChina.classList.add('hidden-block');
      officeRussia.classList.remove('hidden-block');
      officeTitleRussia.classList.add('hidden-block');
      officeTitleUsa.classList.add('hidden-block');
      officeTitleChina.classList.remove('hidden-block');
      contactsList.classList.toggle('contacts-list--show');
      contactsInfoRussia.classList.remove('contacts-item--show');
      contactsInfoUsa.classList.remove('contacts-item--show');
      contactsInfoChina.classList.add('contacts-item--show');
      $('body').toggleClass('open-menu');
      document.ontouchmove = function(e){ return true; }
    });
  } else {
    officeUsa.classList.remove('hidden-block');
    officeChina.classList.remove('hidden-block');
    officeRussia.classList.remove('hidden-block');
    officeTitleRussia.classList.add('hidden-block');
    officeTitleUsa.classList.add('hidden-block');
    officeTitleChina.classList.add('hidden-block');
  }
}

// Открытие модалки с текстом рыбой на order.html
$('.step-3-load-photo').find('.step-3-faq__btn').on("click", function(){
  $('.step-3-load-photo').find('.step-3-faq__modal').toggleClass('step-3-faq__modal--active');
})
$('.step-3-load-signature').find('.step-3-faq__btn').on("click", function(){
  $('.step-3-load-signature').find('.step-3-faq__modal').toggleClass('step-3-faq__modal--active');
})
$('.step-3-load-certificate').find('.step-3-faq__btn').on("click", function(){
  $('.step-3-load-certificate').find('.step-3-faq__modal').toggleClass('step-3-faq__modal--active');
})