'use strict'

var Search = {

username: null,
password:null,
database:'',
userimage:'',
loginuser:'',
no_of_gists:'',
parsed:null,
arr: [],
currentPage: 1,

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
    obj.fetchUserDetails();
  }
};

},

fetchUserDetails:function fetchUserDetails(){
    $('#user-image').html('<img src="'+this.userimage+'" height="30" width="30"></img>');
    $('#user-login').html(this.loginuser);
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


forkGist: function forkGist(gistID){
   var obj = new Object();
   obj = this;
   
   $.ajax({
        url: 'https://api.github.com/gists/' + gistID + '/forks',
        type: 'POST',
        dataType: 'json',
       beforeSend: function (xhr){ 
        xhr.setRequestHeader('Authorization', obj.generateTokenHash(obj.username, obj.password)); 
    }
        
      })
      .success( function() {
      	$('.modal-body').css({'background': '#fff','padding':'15px'});
        $('#modal-fork').modal();

      })
      .error( function(e) {
        $('.modal-body').css({'background': '#fff','padding':'15px'});
        $('#modal-error').modal();
		
      });

},

isStarred: function isStarred(gistID,caller){
var obj = new Object();
   obj = this;

$.ajax({
        url: 'https://api.github.com/gists/' + gistID + '/star',
        type: 'GET',
        dataType: 'json',
       beforeSend: function (xhr){ 
        xhr.setRequestHeader('Authorization', obj.generateTokenHash(obj.username, obj.password)); 
    }
        
      })
      .success( function() {

        if(caller == "unstar")
          obj.unstarGist(gistID);
        else{
          $('.modal-body').css({'background': '#fff','padding':'15px'});
          $('#modal-already-star').modal();
          }
        return true;
      })
      .error( function() {

        if(caller == "star")
          obj.starGist(gistID);
        else{
          $('.modal-body').css({'background': '#fff','padding':'15px'});
          $('#modal-notstar-unstar').modal();
          }
        return false;
    
      });
},

starGist: function starGist(gistID){
   var obj = new Object();
   obj = this;
   $.ajax({
        url: 'https://api.github.com/gists/' + gistID + '/star',
        type: 'PUT',
        dataType: 'json',
       beforeSend: function (xhr){ 
        xhr.setRequestHeader('Authorization', obj.generateTokenHash(obj.username, obj.password)); 
    }
        
      })
      .success( function() {
        $('.modal-body').css({'background': '#fff','padding':'15px'});
        $('#modal-star').modal();
        

      })
      .error( function(e) {
        $('.modal-body').css({'background': '#fff','padding':'15px'});
        $('#modal-error').modal();
		
      });

},

unstarGist: function starGist(gistID){
   var obj = new Object();
   obj = this;
   $.ajax({
        url: 'https://api.github.com/gists/' + gistID + '/star',
        type: 'DELETE',
        dataType: 'json',
       beforeSend: function (xhr){ 
        xhr.setRequestHeader('Authorization', obj.generateTokenHash(obj.username, obj.password)); 
    }
        
      })
      .success( function() {
        $('.modal-body').css({'background': '#fff','padding':'15px'});
        $('#modal-unstar').modal();
        
      })
      .error( function(e) {
        $('.modal-body').css({'background': '#fff','padding':'15px'});
        $('#modal-error').modal();
    
      });

},

viewGist: function viewGist(gistID){
   var obj = new Object();
   obj = this;

   $.ajax({
        url: 'https://api.github.com/gists/' + gistID,
        type: 'GET',
        dataType: 'json',
       beforeSend: function (xhr){ 
        xhr.setRequestHeader('Authorization', obj.generateTokenHash(obj.username, obj.password)); 
    }
        
      })
      .success( function(e) {
    
        var rawData = JSON.stringify(e);
		var parsed = JSON.parse(rawData);
		
		var parseFileContent = (parsed.files);
		var processedData = (JSON.stringify(parseFileContent));
		
		var indexKey = processedData.indexOf(':');
		var fileStructure = processedData.substring(2, indexKey-1);
		var fileName = JSON.parse(processedData);
		$('#listGists').empty();
		$('#listGists').append('<textarea name="view" id="getview" readonly>'+fileName[fileStructure]["content"]+ ' </textarea>');
		
	 })
	  	
      .error( function(e) {
        $('.modal-body').css({'background': '#fff','padding':'15px'});
        $('#modal-error').modal();
		
      })
},

generateTokenHash:function generateTokenHash(user, password) {
  var tok = user + ':' + password;
  var hash = btoa(tok);
  
  return "Basic " + hash;
},

openSelectedPage: function openSelectedPage(id){
  var forend;
  var obj = new Object();
  obj = this;
  var results_per_page = 5;
  $('#pagination').empty();
  var pages = Math.ceil(obj.arr.length/results_per_page);
  
    for(var page=1;page<=pages;page++)
    {
      $('#pagination').append('<button class="btn" data-type="paginate" id="'+page+'">'+page+'</button>');
      var page1 = '[id="'+id+'"]';
      $('#pagination').css('margin-left','26px');
      $(page1).button('toggle');
    }

  if(this.arr.length< (id*results_per_page))
    forend=this.arr.length;
  else
    forend = id*results_per_page;
  $('#listGists').empty();
  for (var no=(results_per_page*(id-1));no<forend;no++)
    {
    
    document.getElementById("listGists").innerHTML += '<div id="'+ obj.parsed[no].id+'">'  + '<button class ="dispdesc" title="Filename: '+obj.arr[no]+'<br>' +'Description: '+obj.parsed[no].description+'">' +obj.arr[no].substring(0,50) +'</button>' + '<br>' +'<input type="button" value="View" class="btn btn-info" id="'+obj.parsed[no].id+'" data-type="view" />' + '<input type="button" value ="Fork" id="'+obj.parsed[no].id+'" class="btn btn-info" data-type="fork" data-toggle="modal"/>'+'<input type="button" data-value="star" value ="Star Gist" id="'+obj.parsed[no].id+'" class="btn btn-info" data-type="star" data-toggle="modal"/>'+ '<input type="button" data-value="unstar" value ="Unstar Gist" id="'+obj.parsed[no].id+'" class="btn btn-info" data-type="unstar" data-toggle="modal"/>' +"<br>" + "</div>";
    $('#'+this.parsed[no].id).css({'padding':'4px','text-align':'center'});
    
    $('.dispdesc').tooltip({
                  'placement': 'top',
                  'trigger':'click'
                });
    }
},

searchUser: function searchUser () {
	var item = $('#search').val();
	if(item=='')
		return null;
    var obj = new Object();
	obj= this;
	$.ajax({
        url: 'https://api.github.com/users/' + item + '/gists',
        type: 'GET',
        dataType: 'json',
       beforeSend: function (xhr){ 
        xhr.setRequestHeader('Authorization', obj.generateTokenHash(obj.username, obj.password)); 
    },
        
      })
      .success( function(e) {
        
		obj.no_of_gists = Object.keys(e).length;
    if(obj.no_of_gists == 0)
      {
        $('#listGists').html('<p id="no-gist-msg">No Available Gists </p>');
        return false;
      }
		obj.arr=[];
    
		var rawData = JSON.stringify(e);

		obj.parsed = JSON.parse(rawData);
		
    for (var no=0;no<obj.no_of_gists;no++)
		{
		var parseFileContent = obj.parsed[no].files;
		var processedData = (JSON.stringify(parseFileContent));
		
		var indexKey = processedData.indexOf(':');
		var fileStructure = processedData.substring(2, indexKey-1);
		var fileName = JSON.parse(processedData);
		
		obj.arr[no] = fileName[fileStructure]["filename"];

		}
    obj.openSelectedPage(1);
      })
       .error( function(e) {
        $('#listGists').empty();
        $('#pagination').empty();
        $('#listGists').html('<p id="no-gist-msg">Invalid Github username</p>');
     }); 
},

handleEvent: function handleEvent(evt) {
    this.target = evt.target;
    var value = this.target.value;
	
    switch (this.target.dataset.type) {
      case 'search':
      $('.modal-body').css({'background': '#222222','padding':'15px'});
       $('#wait').modal();
         setTimeout(function(){
         $('#wait').modal('hide');
      
       },1500); 
         
	   this.searchUser();
	   break;
	  case 'paginate':
        this.currentPage = this.target.id;
        $('#'+this.target.id).button('toggle');
        this.openSelectedPage(this.target.id); 
        break;
      case 'view':
        $('.modal-body').css({'background': '#222222','padding':'15px'});
       $('#wait').modal();
         setTimeout(function(){
         $('#wait').modal('hide');
      
       },800); 
         
        this.viewGist(this.target.id);
        break;
      case 'fork':
        $('.modal-body').css({'background': '#222222','padding':'15px'})
       $('#wait').modal();
         setTimeout(function(){
         $('#wait').modal('hide');
      
       },800); 
        
        this.forkGist(this.target.id);
        break; 
      case 'star':
      case 'unstar':
        $('.modal-body').css({'background': '#222222','padding':'15px'})
       $('#wait').modal();
         setTimeout(function(){
         $('#wait').modal('hide');
      
       },800); 
         
        this.isStarred(this.target.id,this.target.dataset.value);
        break;  
	  
	}
  },

};


window.addEventListener('load', function load(evt) {
  window.removeEventListener('load', load);
  Search.init();
});