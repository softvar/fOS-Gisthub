'use strict';

var GistHub = {
use:null,
pas:null,
username:'',
password:'',
database : null,
database_user:'',
obj: '',

saveCredentials: function saveCredentials(username,password,UserImage,UserLogin) {
	var note = {'name':username,'pass':password,'image':UserImage,'login':UserLogin};
	
	
	
var transaction = this.database.transaction(["notes"], "readwrite");
var objectStore = transaction.objectStore("notes");
var request=objectStore.put(note);
request.onsuccess = function(event) {

  location.href = "view_gists.html";
};
},

initializeDB:function initializeDB(){
var notes="";
var objectStore = this.database.transaction("notes").objectStore("notes");


var objectStore = this.database.transaction("notes").objectStore("notes");
objectStore.openCursor().onsuccess = function(event) {
  var cursor = event.target.result;

  if (cursor) {
    var link="<a class=\"notelist\" id=\""+cursor.key+"\" href=\"#\">"+cursor.value.name+"</a>";
    var listItem="<li>"+link+"</li>";
  notes=notes+listItem;

  location.href = "view_gists.html";
    cursor.continue();
  }
  
};
},

checkUserCred:function checkUserCred(){
var obj = new Object();
obj = this;
this.username = document.getElementById("user").value;
this.password = document.getElementById("pass").value;

if(this.username=='' || this.password=='')
	return false;
else
  { $('.modal-body').css({'background': '#222222','padding':'15px'})
    $('#wait').modal();
    setTimeout(function(){
      $('#wait').modal('hide');
      
    },2000);     
	  obj.loginNauth(obj.username,obj.password);
  }
},

generateTokenHash: function generateTokenHash(user, password) {
  var tok = user + ':' + password;
  var hash = btoa(tok);
  
  return "Basic " + hash;
},

loginNauth: function loginNauth(username,password) {

var obj = new Object();
obj = this;


      $.ajax({
        url: 'https://api.github.com/user',
        type: 'GET',
        dataType: 'json',
        beforeSend: function (xhr){ 
        xhr.setRequestHeader('Authorization', obj.generateTokenHash(username,password)); 
    }
      })
      .success( function(e) {
        
		 
		    
		var rawData = '[' + JSON.stringify(e) + ']';
    var parsed = JSON.parse(rawData);
    var UserImage = parsed[0].avatar_url;
    var UserLogin = parsed[0].login;
    
        obj.saveCredentials(UserLogin,password,UserImage,UserLogin);
      })
      .error( function(e) {
      
		    document.getElementById("wrong_credential").innerHTML = '<p class="alert alert-error"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Incorrect Username or password</strong></p>';
		
      })
},

init: function init() {
var obj = new Object();
obj = this;
document.addEventListener('mousedown', this);
var request = window.indexedDB.open("GISTHUB",1);
request.onerror = function(event) {

},
request.onsuccess = function(event) {
  obj.database=request.result;
  obj.initializeDB();
  
},
request.onupgradeneeded = function(event) {
  var db = event.target.result;
  var objectStore = db.createObjectStore("notes", { keyPath: "id",autoIncrement:true});
}
  },
 handleEvent: function handleEvent(evt) {
    this.target = evt.target;
    var value = this.target.value;
	
    switch (this.target.dataset.type) {
      case 'sign':
	   this.checkUserCred();
	   break;
	}
  },	

};

window.addEventListener('load', function load(evt) {
  window.removeEventListener('load', load);
  GistHub.init();
});