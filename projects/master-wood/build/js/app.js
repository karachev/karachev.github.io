(function ($) {

	/*----------------------------------------
	 FOR SVG SPRITE
	 ----------------------------------------*/
	svg4everybody({});

	/*----------------------------------------
	 TRANSITION SCROLL
	 ----------------------------------------*/
	$('.scroll').on("click", function (e) {
		e.preventDefault();
		var anchor = $(this);
		$('html, body').stop().animate({
			scrollTop: $(anchor.attr('href')).offset().top
		}, 1000);
	});

  /*----------------------------------------
   SLIDERS
   ----------------------------------------*/
  $(document).on('ready', function() {
    $(".features").slick({
      dots: true,
      lazyLoad: 'ondemand',
      infinite: false,
      slidesToShow: 4,
      responsive: [
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            dots: true
          }
        }
      ]
    });
  });

  $(document).on('ready', function() {
    $('.pagination-list').slick({
      infinite: false,
      slidesToShow: 3,
      slidesToScroll: 3,
      dots: false,
      arrows: true,
      prevArrow: $('#pagintaion-prev'),
      nextArrow: $('#pagintaion-next')
    });
  });

  $(document).on('ready', function() {
    $(".info-slider-img").slick({
      dots: true,
      lazyLoad: 'ondemand',
      infinite: false,
      slidesToShow: 1,
      slidesToScroll: 1
    });
  });

  $(document).on('ready', function() {
    $('.category-color-slider').slick({
      dots: false,
      arrows: true,
      lazyLoad: 'ondemand',
      infinite: false,
      slidesToShow: 9,
      slidesToScroll: 1,
      responsive: [
        {
          breakpoint: 1280,
          settings: {
            slidesToShow: 5,
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 4,
          }
        }
      ]
    });
  });

  // Слайдер с одной стрелкой и точками
  $(document).on('ready', function() {
    $('#slider-dots-nextArrow').slick({
      dots: true,
      // autoplay: true,
      asNavFor: '#slider-nav-nextArrow'
    });
    $('#slider-nav-nextArrow').slick({
      prevArrow: false,
      nextArrow: $('#slider-nextArrow'),
      asNavFor: '#slider-dots-nextArrow',
    });

  });
  // Слайдер с точками и без стрелок
  $(document).on('ready', function() {
    $('.slider-dots').slick({
      dots: true,
      arrows: false
    });
  });

  $(document).on('ready', function() {
    $(".door-slider").slick({
      dots: true,
      lazyLoad: 'ondemand',
      infinite: false,
      arrows: false,
      slidesToShow: 4,
      responsive: [
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            dots: true
          }
        }
      ]
    });
  });

  $(document).on('ready', function() {
    $('.portfolio-for').slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false,
      infinite: false,
      fade: true,
      asNavFor: '.portfolio-nav'
    });
    $('.portfolio-nav').slick({
      slidesToShow: 4,
      slidesToScroll: 1,
      asNavFor: '.portfolio-for',
      dots: false,
      arrows: true,
      infinite: false,
      focusOnSelect: true,
      initialSlide: 1,
      responsive: [
        {
          breakpoint: 1280,
          settings: {
            slidesToShow: 3,
            fade: false
          }
        }
      ]
    });
  });

  $(document).on('ready', function() {
    $('.product-for').slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false,
      dots: false,
      infinite: false,
      fade: true,
      asNavFor: '.product-nav',
      responsive: [
        {
          breakpoint: 768,
          settings: {
            dots: true
          }
        }
      ]
    });

    $('.product-nav').slick({
      slidesToShow: 4,
      slidesToScroll: 1,
      asNavFor: '.product-for',
      dots: false,
      arrows: true,
      infinite: false,
      focusOnSelect: true,
      initialSlide: 1,
      responsive: [
        {
          breakpoint: 1280,
          settings: {
            slidesToShow: 3,
            fade: false
          }
        }
      ]
    });
  });

  $(document).on('ready', function() {
    $(".reviews-list").slick({
      dots: true,
      lazyLoad: 'ondemand',
      infinite: false,
      arrows: false,
      rows: 2,
      slidesToShow: 1,
      responsive: [
        {
          breakpoint: 1280,
          settings: {
            slidesToShow: 1,
            rows: 1,
            dots: true
          }
        },
        {
          breakpoint: 980,
          settings: {
            slidesToShow: 2,
            rows: 1,
            dots: true
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            rows: 1,
            dots: true
          }
        }
      ]
    });
  });

  $(document).ready(function () {
    var swiper = new Swiper('.events-container', {
      scrollbar: {
        el: '.swiper-scrollbar',
        hide: false,
        clickable: true,
        draggable: true
      },
      slidesPerView: 3,
      spaceBetween: 20,
      width: 1263,
      breakpoints: {
        1279:{
          slidesPerView: 2,
          width: 625
        },
      }
    });
  });

  $(document).ready(function () {
    var swiper = new Swiper('.recommend-container', {
      scrollbar: {
        el: '.swiper-scrollbar',
        hide: false,
        clickable: true,
        draggable: true
      },
      slidesPerView: 4,
      initialSlide: 2,
      spaceBetween: 20,
      breakpoints: {
        767:{
          slidesPerView: 3,
          centeredSlides: true,
        },
        979:{
          slidesPerView: 3,
          centeredSlides: true,
          width: 768
        },
        1599:{
          slidesPerView: 4,
          centeredSlides: false,
          spaceBetween: 15,
        },
      }
    });
  });

  $(document).ready(function () {
    var swiper = new Swiper('.doors-slider', {
      wrapperClass: 'doors-wrapper',
      slideClass: 'doors-item',
      scrollbar: {
        el: '.doors-scrollbar',
        hide: false,
        clickable: true,
        draggable: true
      },
      slidesPerView: 9,
      spaceBetween: 13,
      breakpoints: {
        767:{
          slidesPerView: 4,
          spaceBetween: 19,
        },
        979:{
          initialSlide: 1,
          slidesPerView: 4,
          spaceBetween: 25,
        },
        1279:{
          slidesPerView: 4,
          spaceBetween: 73,
        },
      }
    });
  });

  /*----------------------------------------
   ADD NUMBER OF SLIDES
   ----------------------------------------*/
    var $status = $('.doors-slider-count');
    var $slickElement = $('#slider-dots-nextArrow');

    $slickElement.on('init reInit afterChange', function (event, slick, currentSlide, nextSlide) {
        var i = (currentSlide ? currentSlide : 0) + 1;
        $status.empty();
        $status.append('<b>' + i + '</b>' + '/ ' + slick.slideCount);
    });

    var $status1 = $('.facts-count');
    var $slickElement1 = $('.facts-wrapper');

    $slickElement1.on('init reInit afterChange', function (event, slick, currentSlide, nextSlide) {
        var i = (currentSlide ? currentSlide : 0) + 1;
        $status1.empty();
        $status1.append('<b>' + i + '</b>' + '/ ' + slick.slideCount);
    });

  /*----------------------------------------
   BUTTONS
   ----------------------------------------*/
  $('.content-nav__btn').on("click", function(){
    $('.content-nav-list').toggleClass('hidden-block');
    $('.content-nav__btn').toggleClass('content-nav__btn--active');
  });

  $('.buy__show-btn').on("click", function(){
    $('.buy-wrapper').toggleClass('buy-wrapper-hidden');
    $('.buy__show-btn').toggleClass('buy__show-btn--close');
  });

  $('#btnPortfolioMore').on("click", function(){
    if ($('.portfolio-text').hasClass('portfolio-text--show')) {
      $('#btnPortfolioMore').text("Читать полностью")
    } else {
      $('#btnPortfolioMore').text("Скрыть");
    }
    $('#textPortfolioMore').toggleClass('portfolio-text--show');
  });

  /*----------------------------------------
   INDUSRTYS CIRCLE
   ----------------------------------------*/
  var indTab = $('.collections-tab-item'),
      indItem = $('.collections-circle-item');

  indTab.on('click', function (event) {
    event.preventDefault();
    var href = $(this).children().attr('href');

    if ($(this).hasClass('collections-tab-item--active')) {
      indItem.removeClass('collections-circle-item--active');
      indTab.removeClass('collections-tab-item--active');
    } else {
      indItem.removeClass('collections-circle-item--active');
      indTab.removeClass('collections-tab-item--active');
      $(this).toggleClass('collections-tab-item--active');
      $(href + ".collections-circle-item").toggleClass('collections-circle-item--active');
    }
  });

  /*----------------------------------------
   MAPS TAB AND SEARCH TAB
   ----------------------------------------*/
  var mapTab = $('.content-nav-item'),
      mapOffice = $('.content-office'),
      mapItem = $('.content-desc-item');

  mapTab.on('click', function (event) {
    event.preventDefault();
    var href = $(this).children().attr('href');
    mapItem.removeClass('content-desc-item--active');
    mapTab.removeClass('content-nav-item--active');
    mapOffice.addClass('hidden-block');
    $(this).addClass('content-nav-item--active');
    $(href + ".content-desc-item").addClass('content-desc-item--active');
    $(href + ".content-office").removeClass('hidden-block');
    $('.content-nav__btn').text($(this).text());
    $('.content-nav__btn').removeClass('content-nav__btn--active');
    $('.content-nav-list').addClass('hidden-block');
  });

  /*----------------------------------------
   FANCYBOX GALLERY
   ----------------------------------------*/
  $(document).ready(function() {
    initFancyGallery('.portfolio-gallery-item a');
    initFancyGallery('.category-feature-item--fittings a');
    initFancyGallery('.category-feature-item--moldings a');
    function initFancyGallery(block) {
      $(block).fancybox({
        openEffect: 'fade',
        closeEffect: 'fade',
        prevEffect: 'fade',
        scrolling: 'hidden',
        padding: 50,
        closeClick: false,
        tpl: {
          closeBtn: '<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"><span class="icon icon-close">Закрыть</span></a>',
          next: '<a title="Next" class="fancybox-nav fancybox-next" href="javascript:;"></a>',
          prev: '<a title="Previous" class="fancybox-nav fancybox-prev" href="javascript:;"></a>'
        },
        helpers: {
          title: {
            type: 'inside',
            position: 'top'
          },
          overlay: {
            locked: true,
            css: {
              'background': 'rgba(94, 94, 94, .9)'
            }
          },
        }
      });
    }
  });

  /*----------------------------------------
    FANCYBOX GALLERY GRID
  ----------------------------------------*/
  $('#portfolio-gallery').packery({
    // options
    itemSelector: '.portfolio-gallery-item',
    gutter: 20,
    // rowHeight: 450
  });

  /*----------------------------------------
   FANCYBOX VIDEO
   ----------------------------------------*/
  $(document).ready(function() {
    $('.about-video-player').fancybox({
      openEffect  : 'none',
      closeEffect : 'none',
      helpers : {
          media : {}
      }
    });
  });

  /*----------------------------------------
   CATEGORY-DOORS MENUS
   ----------------------------------------*/
  $('.category-feature__title').on("click", function(){
    $(this).parent().toggleClass('category-feature--show');
  });

    /*----------------------------------------
   PAGINATION
   ----------------------------------------*/
  $('.pagination-list').find('a').on("click", function(){
    $('.pagination-list').find('a').removeClass('pagination-item--active');
    $(this).addClass('pagination-item--active');
  });

    /*----------------------------------------
   MASKS
   ----------------------------------------*/

  $(document).ready(function(){
    $('.modal-call-group--phone').find('input[type="phone"]').mask('+7(000)000-00-00', {
      placeholder: '+7 (___) ___-__-__'
    });
  });

  $(document).ready(function(){
    $('.modal-call-group--time').find('input[type="text"]').mask('00 - 00', {
      placeholder: 'с 00 по 00 часов'
    });
  });

  $(document).ready(function(){
    $('.modal-price-group--phone').find('input[type="phone"]').mask('+7(000)000-00-00', {
      placeholder: '+7 (___) ___-__-__'
    });
  });

/*----------------------------------------
   MODAL MENU
   ----------------------------------------*/

  $('#modal-menu__close').click(function(e){
    e.preventDefault();
    closeModal('.modal-menu', 'modal-menu--show');
  });

  $('#header-category').click(function(e){
    e.preventDefault();
    openModal('.modal-menu', 'modal-menu--show');
    document.ontouchmove = function(e){ return true; }
  });

  $('#footer-menu__open').click(function(e){
    e.preventDefault();
    openModal('.modal-menu', 'modal-menu--show');
    document.ontouchmove = function(e){ return true; }
  });

  $('#btnModalFeedback').click(function(e){
    e.preventDefault();
    openModal('.modal-feedback', 'modal-feedback--show');
  });

  $('#btnModalCall').click(function(e){
    e.preventDefault();
    openModal('.modal-call', 'modal-call--show');
    document.ontouchmove = function(e){ return true; }
  });

  $('#btnModalPrice').click(function(e){
    e.preventDefault();
    openModal('.modal-price', 'modal-price--show');
    document.ontouchmove = function(e){ return true; }
    if ($(window).width() < 400) {
      document.ontouchmove = function(e){ return true; }
    }
  });

  $('.modal-feedback').find('.modal-overlay').click(function(e){
    e.preventDefault();
    closeModal('.modal-feedback', 'modal-feedback--show');
  });

  $('.modal-call').find('.modal-overlay').click(function(e){
    e.preventDefault();
    closeModal('.modal-call', 'modal-call--show');
  });

  $('.modal-price').find('.modal-overlay').click(function(e){
    e.preventDefault();
    closeModal('.modal-price', 'modal-price--show');
  });

  $('#btnCloseModalFeedback').click(function(e){
    e.preventDefault();
    closeModal('.modal-feedback', 'modal-feedback--show');
  });

  $('#btnCloseModalCall').click(function(e){
    e.preventDefault();
    closeModal('.modal-call', 'modal-call--show');
  });

  $('#btnCloseModalPrice').click(function(e){
    e.preventDefault();
    closeModal('.modal-price', 'modal-price--show');
  });

  function openModal(block, activeBlock) {
    $('body').css('overflow', 'hidden');
    $(block).addClass(activeBlock);
    document.ontouchmove = function(e){ e.preventDefault(); }
    $(document).keydown(function(evt) {
      if( evt.keyCode === 27 ) {
        $(block).removeClass(activeBlock);
        $('body').css('overflow', 'auto');
        return false;
      }
    });
  }

  function closeModal(block, activeBlock) {
    $(block).removeClass(activeBlock);
    $('body').css('overflow', 'auto');
  }

  $('.menu-toggle').on("click", function(){
    $(this).next('.submenu').addClass('submenu--show');
  });

  $('.modal-menu__down').on("click", function(){
    $(this).parent('.submenu').removeClass('submenu--show');
  });

  $('.modal-submenu__close').on("click", function(){
    $(this).parent('.submenu').removeClass('submenu--show');
    closeModal('.modal-menu', 'modal-menu--show');
  });

  $('.modal-menu-shadow').on("click", function(){
    $('.submenu').removeClass('submenu--show');
    $('.modal-menu').removeClass('modal-menu--show');
    $('body').css('overflow', 'auto');
  });

  /*----------------------------------------
   MODAL PHONE
   ----------------------------------------*/
   $('.header-phones__btn').click(function(e){
    e.preventDefault();
    openModal('.modal-phone', 'modal-phone--show');
  });

  $('#modal-phone__close').click(function(e){
    e.preventDefault();
    closeModal('.modal-phone', 'modal-phone--show');
  });

    /*----------------------------------------
   TABS MAP HOME
   ----------------------------------------*/

  var tabs = $(".tabs"),
      tabsWrap = $(".tabs-wrap"),
      tabsLink = $(".tab-link"),
      tabsItem = $(".tab-item");
  /* TABS METHODS */
  var methodsTabs = {
    show : function( options ) {
      return this.each(function(){

        var tabsId = $(this).attr('id'),
            tabsLinkActive = $("[data-tab=" + tabsId + "]");

        tabs.find(tabsLinkActive).addClass('tab-link_active').siblings().removeClass('tab-link_active');

        $(this).parent().children('.tab-item').removeClass('tab-item_active');
        $(this).addClass('tab-item_active');
        //btn
        var textTab = tabsLinkActive.text();
        tabsLinkActive.closest('.tabs-wrap').children('.btn-tabs').text(textTab);

      });

    },
    hide : function( ) {

      return this.each(function(){
        tabsLink.removeClass('tab-link_active');
        tabsItem.removeClass('tab-item_active');
        tabsWrap.removeClass('tabs-wrap_active');
      })
    }
  };

  /* TABS FUNCTIONS */
  $.fn.gpTab = function( method ) {

    if ( methodsTabs[method] ) {
      return methodsTabs[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methodsTabs.show.apply( this, arguments );
    } else {
      $.error( 'Метод с именем ' +  method + ' не существует' );
    }
  };

  /* CLICK FOR OPEN */
  tabsLink.on('click', function(eventLink) {
    eventLink.preventDefault();
    var tabsId = $(this).attr('data-tab');
    $("#" + tabsId).gpTab();

    if(tabsWrap.hasClass('tabs-wrap_active')){
      tabsWrap.removeClass('tabs-wrap_active');
    }
  });
  /*----------------------------------------
  SEARCH INPUT
  ----------------------------------------*/
  var btnSearch = $('.header-search__btn');
  var searchInput = $('.header-search__input');
  var searchForm = $('.header-search');


  var clickEvent = ((document.ontouchstart!==null)?'click':'touchstart');


  btnSearch.on('click', function(e) {
    searchInput.addClass('header-search__input--active');
    searchForm.addClass('header-search--open');
    btnSearch.addClass('header-search__btn--active');
    $('.header-phones').addClass('hidden-block');
    $('.header-nav').addClass('hidden-block');
    $('.header-category').addClass('header-category--hidden');
    setTimeout(function(){
      btnSearch.attr('type', 'submit');
    }, 1000);
  })

  searchInput.blur(function(e) {
    searchInput.removeClass('header-search__input--active');
    searchForm.removeClass('header-search--open');
    btnSearch.removeClass('header-search__btn--active');
    $('.header-phones').removeClass('hidden-block');
    $('.header-nav').removeClass('hidden-block');
    $('.header-category').removeClass('header-category--hidden');
  });

  $(document).on(clickEvent, function(e) {
    if (!$(e.target).closest(".header-search").length) {
      searchForm.removeClass('header-search--open');
      searchInput.removeClass('header-search__input--active');
      btnSearch.removeClass('header-search__btn--active');
      $('.header-phones').removeClass('hidden-block');
      $('.header-nav').removeClass('hidden-block');
      $('.header-category').removeClass('header-category--hidden');

      btnSearch.attr('type', 'button');
    }

    e.stopPropagation();
  });


	/*----------------------------------------
	 VALIDATIONS JQUERY FORM
	 ----------------------------------------*/
	$(function () {
		/* RULES */
		$(".subscribes-form").validate({
			focusCleanup: true,
			focusInvalid: false,
      ignore: ":hidden",
			rules: {
        email: "required",
        checkbox: {
          required: true
        }
      },
      messages: {
        email: "Введен некорректный e-mail",
        checkbox: "Для продолжения нужно согласие с условиями",
      },
      submitHandler: function(element) {
        $(".subscribes-form").addClass('validate');
      }
		});
		$(".letter-form").validate({
			focusCleanup: true,
			focusInvalid: false,
			rules: {
				name: "required",
        email: "required",
        message: "required"
      },
      messages: {
        email: "Введен некорректный e-mail",
        name: "Введено некорректное имя",
        message: "Введено некорректное сообщение"
      },
      submitHandler: function(element) {
        $(".letter-form").addClass('validate');
      }
		});

    $(".modal-feedback-form").validate({
      focusCleanup: true,
      focusInvalid: false,
      rules: {
        name: "required",
        email: "required",
        message: "required"
      },
      messages: {
        email: "Введен некорректный e-mail",
        name: "Введено некорректное имя",
        message: "Введено некорректное сообщение"
      },
      submitHandler: function(element) {
        $(".modal-feedback-form").addClass('validate');
      }
    });

    $(".modal-call-form").validate({
      focusCleanup: true,
      focusInvalid: false,
      rules: {
        name: "required",
        email: "required",
        phone: "required",
        address: "required"
      },
      messages: {
        name: "Введено некорректное имя",
        email: "Введен некорректный e-mail",
        phone: "Введен некорректный телефон",
        address: "Введен некорректный адрес"
      },
      submitHandler: function(element) {
        $(".modal-call-form").addClass('validate');
      }
    });

    $(".modal-price-form").validate({
      focusCleanup: true,
      focusInvalid: false,
      rules: {
        name: "required",
        email: "required",
        phone: "required"
      },
      messages: {
        name: "Введено некорректное имя",
        email: "Введен некорректный e-mail",
        phone: "Введен некорректный телефон"
      },
      submitHandler: function(element) {
        $(".modal-price-form").addClass('validate');
      }
    });

	});



})(jQuery);

