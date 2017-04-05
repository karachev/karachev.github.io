var link = document.querySelector(".button-write-us");
var popup = document.querySelector(".write-us");
var close = document.querySelector(".write-us-close");

var map = document.querySelector(".map-button");
var popupMap = document.querySelector(".show-map");
var closeMap = document.querySelector(".map-close");

link.addEventListener("click", function(event){
  event.preventDefault();
  popup.classList.add("write-us-show");
});

close.addEventListener("click", function(event){
  event.preventDefault();
  popup.classList.remove("write-us-show");
});

map.addEventListener("click", function(event){
  event.preventDefault();
  popupMap.classList.add("show-map-open");
});

closeMap.addEventListener("click", function(event){
  event.preventDefault();
  popupMap.classList.remove("show-map-open");
});