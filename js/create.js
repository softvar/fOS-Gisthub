'use strict'

var CreateGist = {
username:'',
password:'',
database:'',
userimage:'',
loginuser:'',

initializeDB:function initializeDB(){
var obj = new Object();
obj = this;
var notes="";
var objectStore = this.database.transaction("notes").objectStore("notes");
objectStore.openCursor().onsuccess = function(event) {
  var cursor = event.target.result;

  if (cursor) {
    var link="<a class=\"notelist\" id=\""+cursor.key+"\" href=\"#\">"+cursor.value.name+"</a>";
    var listItem="<li>"+link+"</li>";
	notes=notes+listItem;
	obj.username = cursor.value.name;
	obj.password = cursor.value.pass;
   obj.userimage = cursor.value.image;
  obj.loginuser = cursor.value.login;
    cursor.continue();
  }
  else
  {
   
   obj.createForm();
  }
};
},

createForm:function createForm() {

$('#user-image').html('<img src="'+this.userimage+'" height="30" width="30"></img>');
$('#user-login').html(this.loginuser);
/*document.getElementById("login/logout").innerHTML = "<input type=\"button\" class=\"btn-success\" value=\"Logout\" onclick=\"logout()\"/>";*/
$('#input_gist_info').html('<input type="button" id="new-gist" class="btn-info" value="Create New" data-type="setup"/>')


},

generateTokenHash:function generateTokenHash() {
  var tok = this.username + ':' + this.password;
  var hash = btoa(tok);
  
  return "Basic " + hash;
},

loadCreateForm:function loadCreateForm() {

$("#input_gist_info").html('<input type="text" id="gist_filename" placeholder="Enter file name(Optional)"/>' + '</br>' +
'<input type="text" id="gist_description" placeholder="Enter description(optional)"/>' + '</br>' + '<textarea id="gist_content" cols="10" rows="10" placeholder="Content goes here..." required></textarea>' + '</br>' +
'<div id="notify_verification"></div>' + '</br>' +
'<input id="create_gist" type="button" class="btn-success" value="Create Gist" data-type="create" />');
},

checkInputGistDetails:function checkInputGistDetails() {

var obj = new Object();
obj = this;

var gist_filename = document.getElementById("gist_filename").value;
var gist_description = document.getElementById("gist_description").value;
var gist_content = document.getElementById("gist_content").value;


if(gist_content=="")
	return false;
else
  $('.modal-body').css({'background': '#222222','padding':'15px'})
       $('#wait').modal();
         setTimeout(function(){
         $('#wait').modal('hide');
        obj.createUserGist(gist_filename,gist_description,gist_content);
       },2000); 
	

},

createUserGist:function createUserGist(gist_filename,gist_description,gist_content){
var obj = new Object();
obj = this;
var data = {
        "description": gist_description,
        "public": true,
          
        "files": {
          
        }
      };

		 
	var filename = gist_filename;
	data["files"][filename] = {
    "content": gist_content
    }

      $.ajax({
        url: 'https://api.github.com/gists',
        type: 'POST',
        dataType: 'json',
        beforeSend: function (xhr){ 
        xhr.setRequestHeader('Authorization', obj.generateTokenHash()); 
    },
        data: JSON.stringify(data)
      })
      .success( function(e) {
       
        $('.modal-body').css({'background': '#fff','padding':'15px'});
        $('#myModal').modal();
		
      })
      .error( function(e) {
      
		document.getElementById("notify_verification").innerHTML = "<p class=\"alert alert-error\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>"
        + "<strong>Warning!</strong> Check credentials</p>";
		
      });
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
  obj.initializeDB();
  
};
request.onupgradeneeded = function(event) {
  var db = event.target.result;
  var objectStore = db.createObjectStore("notes", { keyPath: "id",autoIncrement:true});
}
},

handleEvent: function handleEvent(evt) {
    this.target = evt.target;
    var value = this.target.value;
	
    switch (this.target.dataset.type) {
      case 'create':
	      this.checkInputGistDetails();
		    break;
      case 'new':
        location.href= "create_gist.html";
        break;  
      case 'setup':
        this.loadCreateForm();
        break;
	}
  },
};


window.addEventListener('load', function load(evt) {
  window.removeEventListener('load', load);
  CreateGist.init();
});
