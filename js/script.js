var link = document.querySelector(".search-sedona-btn");
var popup = document.querySelector(".modal-form");
var login = popup.querySelector("[name=check-in]");
        
link.addEventListener("click", function (event) {
  if (!popup.classList.contains("modal-content-show")) {
    event.preventDefault();
    popup.classList.add("modal-content-show");
    login.focus();
  } else {
    event.preventDefault();
    popup.classList.remove("modal-content-show");
  }
});