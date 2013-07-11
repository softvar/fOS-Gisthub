'use strict';

var ViewGist = {
username: null,
password:null,
database:'',
database_url:'',
userimage:'',
loginuser:'',
parsed:'',
no_of_gists:null,
arr: [],
currentPage: 1,

initializeDB:function initializeDB(){
var obj = new Object();
obj=this;
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
  $('.modal-body').css({'background': '#222222','padding':'15px'})
    $('#wait').modal();
    setTimeout(function(){
      $('#wait').modal('hide');
      
    },1200); 

  obj.view_gists(obj.username,obj.password);
   // cursor.continue();
  }
  
}
},

fetchUserDetails:function fetchUserDetails(){
  $('#user-image').html('<img src="'+this.userimage+'" height="30" width="30"></img>');
  $('#user-login').html(this.loginuser);
},

generateTokenHash:function generateTokenHash(user, password) {
  var tok = user + ':' + password;
  var hash = btoa(tok);
  
  return "Basic " + hash;
},

view_gists:function view_gists(username,password){

var obj = new Object();
obj= this;
$.ajax({
        url: 'https://api.github.com/users/' + username + '/gists',
        type: 'GET',
        dataType: 'json',
       beforeSend: function (xhr){ 
        xhr.setRequestHeader('Authorization', obj.generateTokenHash(username, password)); 
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
		var parseFileContent = (obj.parsed[no].files);
		var processedData = (JSON.stringify(parseFileContent));
		
		var indexKey = processedData.indexOf(':');
		var fileStructure = processedData.substring(2, indexKey-1);
		var fileName = JSON.parse(processedData);
		obj.arr[no] = fileName[fileStructure]["filename"];
		
		}
     obj.openSelectedPage(1);
      })
      .error( function(e) {
        $('.modal-body').css({'background': '#fff','padding':'15px'});
        $('#modal-error').modal();
		
      });
	},

openSelectedPage: function openSelectedPage(id){
  var forend;
  var concat = '';
  var obj = new Object();
  var results_per_page = 10;
  obj = this;
  $('#pagination').empty();
  var pages = Math.ceil(obj.arr.length/results_per_page);
    for(var page=1;page<=pages;page++)
    {
      $('#pagination').append('<button class="btn" data-type="paginate" id="'+page+'">'+page+'</button>');
      var page1 = '[id="'+id+'"]';
      $(page1).button('toggle');
    }

  if(this.arr.length< (id*results_per_page))
    forend=this.arr.length;
  else
    forend = id*results_per_page;
  $('#listGists').empty();
  for (var no=(results_per_page*(id-1));no<forend;no++)
    {

    if(obj.arr[no].length > 12)
      concat ='...';
    else
      concat = '';
    document.getElementById("listGists").innerHTML += '<div id="'+ obj.parsed[no].id+'">'  + '<button class ="dispdesc" title="Filename: '+obj.arr[no]  +'<br>' +'Description: '+obj.parsed[no].description+'">' +obj.arr[no].substring(0,12) + concat +'</button>' + '<div id="prop-manage">'+ '<input type="button" value="View/Edit" class="btn btn-info" id="edit'+obj.parsed[no].id+'" data-id="'+obj.parsed[no].id+'" data-type="edit" />' +'&nbsp'+ '<input type="button" value ="Delete" id="delete-btn" data-id="'+obj.parsed[no].id+'" class="btn btn-danger" data-type="deleting" data-value="'+no+'" data-toggle="modal"/>'  +'</div></div>'  ;
    $('#'+this.parsed[no].id).css({'margin-top':'5px', 'padding':'2px','font-size':'15px'});
   
    $('.dispdesc').tooltip({
                  'placement': 'right',
                  'trigger': 'click',
                 
                });
    }
},

confirmEditGist:function confirmEditGist(editFileName,editDescription,editContent,gistID){
var obj = new Object();
obj = this;
	var data = {
        "description": editDescription,
        "public": true,
          
        "files": {
            
        }
      };

		 
	var editfilename = editFileName;
	data["files"][editfilename] = {
    "content": editContent

    }

	$.ajax({
        url: 'https://api.github.com/gists/' + gistID,
        type: 'PATCH',
        dataType: 'json',
        beforeSend: function (xhr){ 
        xhr.setRequestHeader('Authorization', obj.generateTokenHash(obj.username, obj.password)); 
    },
        data: JSON.stringify(data)
      })
      .success( function(e) {
        $('.modal-body').css({'background': '#fff','padding':'15px'});
        $('#modal-edit').modal();
        setTimeout(function(){
         location.href = "view_gists.html";
      
       },2100);
        
      })
      .error( function(e) {
        $('.modal-body').css({'background': '#fff','padding':'15px'});
        $('#modal-error').modal();
		
      })
},

editContent:function editContent(gistID)
{

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
        
        $("#listGists").empty();
        $("#listGists").html('<span id="view-edit-info">FileName:&nbsp&nbsp&nbsp </span><input type="text" id="editFileName"  /> <br>'  + '<span id="view-edit-info">Description:</span><input type="text" id="editDescription" placeholder="short description(optional)" /><br>' + '<span id="view-edit-info">Content: </span><br><textarea id="editContent" ></textarea> ' + '</br>' + '<input type="button" value="Proceed" id="editProceed" class="btn btn-success" />');

        $('#editFileName').tooltip({'trigger':'focus', 'title': 'Edit new Filename','placement':'right'});
        $('#editDescription').tooltip({'trigger':'focus', 'title': 'Enter new Description','placement':'right'});
        $('#editContent').tooltip({'trigger':'focus', 'title': 'Edit new Filename','placement':'right'});       
		
		
	
		var rawData = JSON.stringify(e);
		var parsed = JSON.parse(rawData);
		
		var parseFileContent = (parsed.files);
		var processedData = (JSON.stringify(parseFileContent));

		var indexKey = processedData.indexOf(':');
		var fileStructure = processedData.substring(2, indexKey-1);
		var fileName = JSON.parse(processedData);
		
		$('#editContent').html(fileName[fileStructure]["content"]);
    $('#editFileName').val(fileName[fileStructure]["filename"]);

		$("#editProceed").click(function() {
  			obj.confirmEditGist($('#editFileName').val(),$('#editDescription').val(),$('#editContent').val(),gistID);
		});
	  })
	  	
      .error( function(e) {
        $('.modal-body').css({'background': '#fff','padding':'15px'});
        $('#modal-error').modal();
		
      })
	 

},

deleteGist:function deleteGist(gistID,offset){
  var obj = new Object();
  obj = this;

  $('#myModal').modal('hide');
  $.ajax({
        url: 'https://api.github.com/gists/' + gistID,
        type: 'DELETE',
        dataType: 'json',
        beforeSend: function (xhr){ 
        xhr.setRequestHeader('Authorization', obj.generateTokenHash(obj.username, obj.password)); 
    }
        
      })
      .success( function() {
        $('.modal-body').css({'background': '#fff','padding':'15px'});
        $('#modal-del').modal();
        $('#'+gistID).remove();
        obj.arr.splice(offset,1);
        obj.openSelectedPage(obj.currentPage);
        
        
      })
      .error( function(e) {
        
        
        $('.modal-body').css({'background': '#fff','padding':'15px'});
        $('#modal-error').modal();
    
      })
  

},

confirmDelete:function confirmDelete(gistID,offset){
 
  $('.modal-footer').append('<button class="btn btn-primary" data-value="'+offset+'" id="'+gistID+'" data-type="del" >Confirm Delete</button>');
  $('#myModal').modal();
  
},

init: function init() {

var obj = new Object();
obj=this;
document.addEventListener('mousedown', this);
var request = window.indexedDB.open("GISTHUB",1);
request.onerror = function(event) {

};
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
      case 'edit':
       $('.modal-body').css({'background': '#222222','padding':'15px'})
       $('#wait').modal();
         setTimeout(function(){
         $('#wait').modal('hide');
      
       },1200); 
	     this.editContent(this.target.dataset.id);
	     break;
       
	  case 'del':  
       $('.modal-body').css({'background': '#222222','padding':'15px'});
       $('#wait').modal();
         setTimeout(function(){
         $('#wait').modal('hide');
      
       },2100); 
	    this.deleteGist(this.target.id,this.target.dataset.value);
		break;
	  case 'deleting':
      $('.modal-body').css({'background': '#fff','padding':'15px'});
	    this.confirmDelete(this.target.dataset.id,this.target.dataset.value);
		break;
    case 'paginate':
      this.currentPage = this.target.id;
      $('#'+this.target.id).button('toggle');
      this.openSelectedPage(this.target.id);
    break;
   
	}
  },

};

window.addEventListener('load', function load(evt) {
  window.removeEventListener('load', load);
  ViewGist.init();
});
