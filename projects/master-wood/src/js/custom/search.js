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
