'use strict'

var Help = {
username: null,
password:null,
database:'',
userimage:'',
loginuser:'',

initializeDB:function initializeDB(){
var obj = new Object();
obj = this;
var objectStore = this.database.transaction("notes").objectStore("notes");
objectStore.openCursor().onsuccess = function(event) {
  var cursor = event.target.result;

  if (cursor) {
    
	obj.username = cursor.value.name;
	obj.password = cursor.value.pass;
    obj.userimage = cursor.value.image;
    obj.loginuser = cursor.value.login;
    obj.fetchUserDetails();
  
}

}
$('#myCarousel').carousel({interval: 7000});

},	

fetchUserDetails:function fetchUserDetails(){
    $('#user-image').html('<img src="'+this.userimage+'" height="30" width="30"></img>');
    $('#user-login').html(this.loginuser);
    this.showHelp();
},

showHelp: function showHelp(){
$('#carousel1').html('<p></p>'+
'<h2 style="text-align:center;color:#222222">GIST EVENTS</h2><br>'+
'<span style="color:green">Clicking</span> on the gist-name will arouse a tooltip showing its Description.<br><br>'+

'<span style="color:blue">View</span> Button enables one to view the content as well as modify the gist-details as per the requirements.<br><br>'+

'<span style="color:red">Delete</span> Button will delete the gist(Be Patient if refreshing shows deleted gist and try again in a moment:) ) '+
                      
'');

$('#carousel2').html('<p></p>'+
'<h2 style="text-align:center;color:#222222">CREATE A GIST</h2><br><br>'+

'For creating a Gist, Content is strictly required while gist-name and gist-description are optional, however, it\'s a good habit to fill these for future references.<br><br>'+
                 
'');
$('#carousel3').html('<p></p>'+
'<h2 style="text-align:center;color:#222222">SEARCH GITHUB-USERS GISTS</h2><br><br>'+
'Clicking on the gist-name will show its Description.<br><br>'+
'Only recent 30 gists will be shown as per the Github v3 API' +
                      
'');
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
};
},

};

window.addEventListener('load', function load(evt) {
  window.removeEventListener('load', load);
  Help.init();
});