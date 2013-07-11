'use strict'

var LogoutGistHub = {
database: '',

logoutUser:function logoutUser(){
var obj = new Object();
obj = this;
var objectStore = this.database.transaction("notes").objectStore("notes");
objectStore.openCursor().onsuccess = function(event) {
  var cursor = event.target.result;
  if (cursor){
  
  var request = obj.database.transaction(["notes"], "readwrite").objectStore("notes").delete(cursor.value.id);
    request.onsuccess = function(event) {
      location.href = "login.html";
    };
  cursor.continue();
  
  }
  
  }
  
},

init:function init(){
var obj = new Object();
obj = this;
document.addEventListener('mousedown', this);
var request = window.indexedDB.open("GISTHUB",1);
request.onerror = function(event) {

};
request.onsuccess = function(event) {
  obj.database=request.result;
  //$('#myModal').modal();
  $('#myModal').modal({ backdrop: 'static', keyboard: true }) 
  
}
request.onupgradeneeded = function(event) {
  var db = event.target.result;
  var objectStore = db.createObjectStore("notes", { keyPath: "id",autoIncrement:true});
}
},
handleEvent: function handleEvent(evt) {
    this.target = evt.target;
    var value = this.target.value;
	
    switch (this.target.dataset.type) {
      case 'logout':
	   this.logoutUser();
	   break;
	  case 'prev':
	   location.href = "view_gists.html"; 
		break;
	}
  },

};

window.addEventListener('load', function load(evt) {
  window.removeEventListener('load', load);
  LogoutGistHub.init();
});