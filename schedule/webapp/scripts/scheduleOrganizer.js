/**
 * Copyright 2011 by Value Added Software, Inc. and by Pete Helgren
 * You may use this code freely as long as attribution is given to the 
 * original author (me). I have a few hours invested in the development 
 * of the code and could always use some additional consulting hours so
 * I can always use the attribution! Contact me pete@valadd.com and make
 * sure that 'Common' is in the subject line.
 */

/**
 * 08/01/2011
 * I added the conference as another selection criteria so you could go back to a previous 
 * conference and look at what you had already attended that spawned a couple of additional ideas TBD:
 * 1. An option to have a direct view of all selections at a conference (Now it is a day by day thing)
 * 2. Maybe flag a session in the current view that has the same title as one you already attended
 * 
 * In any case, I had to add the conference as a field in the table and decided to add the conference as 
 * variable to the local database. Therefore there is a little code to start with that check to see if there already is a localstorage
 * item called "master" and "mySchedule" to ${conference}-'master' etc....
 * 
 */

/**
 * 04/05/2012
 * Changed over to using the JSON data from Confex.
 * Plenty of refactoring to their naming conventions ensued.
 * 
 */

/**
 * MISSING DateAndTime	format was like - Saturday, April 30, 2011: 7:00 AM-12:00 PM
 *         Location  like - 205 CD (Minneapolis Convention Center) 
 *         DOW - like Saturday
 *         Stime - HHMM
 * 
 * Session_Listing JSON format (AFAIK)
 * "AgendaKey":"10FL", - was courseref
 * "CourseofStudy":"Events", 
 * "Date":"2012-05-06",
 * "EndTime":"9:30:00 AM",
 * "Key_SessionID":"29685", was courseID
 * "PID":"560237",
 * "Property":"Disneyland Hotel ",
 * "Room":"Sleeping Beauty Pavilion",
 * "SessionTitle":"COMMON Cares 5K Walk", was coursetitle
 * "StartTime":"6:00:00 AM",
 * "_disposition":"INSERT",
 * "_hash":"yO8VKKOXJGfZprUXH+yUDQ"},
 */

// NOTE: The Freemarker data model which we rely on to get the .data_model.requestURI value
// isn't available in the script unless we explicitly include it in the template.  Since the 
// request URI is all we need for the AJAX call, we stick the request URI in a hidden field 
// in the HTML and then reference it here.  I called the hidden field fmuid

	var urlHost = 'localhost';
	var urlPort = ':9080';
	var currentlySelectedID = '';
	var masterSchedule = {}; // a JSON object with the whole schedule
	var abstracts = {}; // a JSON Object with all the abstracts
	var mySchedule = {}; // a JSON object with my schedule loaded
	var presenters = {}; // a JSON Object with all the abstracts
	
function checkAndUpdateStorage(){
	// Since we now have conference ID as part of the storage name, for those 3 people who used the application
	// before, let's help them out by renaming the original storage name if it exists.
	var origMaster = localStorage.getItem("master"); // a long JSON string
	
	if(origMaster!=null) // must have add it already
		{
		localStorage.setItem("master-S2011",origMaster);
		localStorage.removeItem("master");
		}
	var origMySchedule = localStorage.getItem("mySchedule"); // a long JSON string
	
	if(origMySchedule!=null) // must have add it already
		{
		localStorage.setItem("mySchedule-S2011",origMySchedule);
		localStorage.removeItem("mySchedule");
		}
}
	
/******************************************************************************************
 *  MASTER SCHEDULE routines
 *  I have consolidated the routines for each item that will be saved to local storage
 *  
 *******************************************************************************************/	
function getMasterSchedule(){

	var master = getMasterFromStore();
	
	var scheds = master.data;
	var snapshot = master.snapshotid;
	
	 $("#schedlist").empty(); // clear the existing schedules
	 
	
	var dow = $('#dow').val();
	
	//var headerText = "<div data-inline='true'><a href='#home' data-role='button'>Back</a></div><h1 aria-level='1' role='heading' tabindex='0' class='ui-title'> Master Schedule for " + dow +"</h1>";
	//$("#masterHeader").html(headerText);
	
	var headerText = "Master Schedule for " + dow;
	$("#mh").html(headerText);
	
	var items = '';
	
	for(var i =0;i<scheds.length;i++) 
	{ 
		var sched = scheds[i];
		if(sched.DOW == dow){
		var idx = sched.dateAndTime.indexOf(":");
		
		var schedTime =  sched.dateAndTime; //.substring(idx+1,sched.dateAndTime.length);
		
		//var item = $(document.createElement('li'))
		//.html("<a href='javascript:displayAbstract("+sched.courseID + ")'>"+schedTime + " " +sched.courseID + " "+sched.courseTitle + "</a>");
		//item.addClass('arrow');
	
		 items = items + "<li class='arrow'><a href='javascript:displayAbstract("+sched.Key_SessionID + ")'>"+schedTime + " <br> "+sched.SessionTitle + "</a></li>";
		
		}
		
	}
	$("#schedlist").html(items);
	//$("#schedlist").content();
	//$("#schedlist").content('refresh');
	
	$.mobile.changePage("#scheduleDetail",'slide',false,true);
	$("#schedlist").listview('refresh');
}

function storeMasterScheduleJSON(){
	// We'll store the master schedule JSON for offline use

	var master = getFullScheduleJSON();

	var schedule = JSON.stringify(master);
	if(schedule!=null && schedule.length>5)
		// Only store it if there is something TO store
		localStorage.setItem("master-"+$('#conf').val(),schedule);

	}


	function getMasterFromStore(){
	// We'll get the master schedule JSON for offline use
	// But we MAY need to add some logic here to pick up schedule changes 
		
	var text = localStorage.getItem("master-"+$('#conf').val()); // Drop down selector on main screen

	if(text!=null && text.length >5)
		var schedule = JSON.parse(text);
	else
		{ // If no schedule exists in local storage get it and SAVE it
		var schedule = getFullScheduleJSON();
		var master = JSON.stringify(schedule);
		if(master!=null && master.length>5)
			// Only store it if there is something TO store
			localStorage.setItem("master-"+$('#conf').val(),master);
		
		}

	// Load up the global variable 
	masterSchedule = schedule;

	return schedule;
	 
	}
	
	function getSessionObjectFromMaster(sessID){
		
		// Master Schedule should have been loaded at startup
		// This ain't efficient but it will work
		var scheds = masterSchedule.data;

		for(var i =0;i<scheds.length-1;i++) 
		{ 
			var sched = scheds[i];

			if(sched.Key_SessionID == sessID){
				
				return sched;
			}
		}
		
		
	}
	
	// Full roundtrip JSON is here

	function getScheduleJSON(){  // ONLY a selected day of the week is returned (deprecated) DON'T USE!!
					var schedule;
				
	  			// TODO - Need a better method for specifying the host/url

					var jsonURL =  $('#fmuid').val()+'?action=default&scheduleDate='+$('#dow').val() + '&conference='+$('#conf').val();
					
					$.ajax({
					  url: jsonURL,
					  async: false,
					  cache: false,
					  dataType:"text",
					  success: function(text){
					
						//text = text.replace(/(^\s+|\s+$)/, '');
						//text = "(" + text + ");";
							//attempt to create valid JSON
								try
								{
									schedule = text;
								}
								catch(err)
								{
									alert('Your session has expired, please log in again! (JSON exception)');
									return false;
								}
								
								//schedule = jsonData;
								
							}
			
					});
			
			return schedule;
	}

	function getFullScheduleJSON(){
			var schedule;
				
	  			// TODO - Need a better method for specifying the host/url
			    // Going to wrap this for now
			 
			        var httpURL =  'http://common.confex.com/common/s12/sync.cgi/Session_Listing.json';
				
				   var jsonURL =  $('#fmuid').val()+'?action=GetProxiedJSON&url=' + httpURL;
				   
				   var encodedURI = encodeURI(jsonURL);

					//jsonURL =  'http://common.confex.com/common/s12/sync.cgi/Session_Listing.json';
					$.ajax({
					  url: encodedURI,
					  async: false,
					  cache: false,
					  dataType:"json",
					  success: function(text){
							
							//schedule = $.parseJSON(text);
						   schedule = text;
						  // alert(text);
							
						},
						error: function(jqXHR,textStatus,errorThrown){
							alert('Connection error occured getting schedules! Status: ' + textStatus + ' Error: ' + errorThrown);
							//alert(text);
						}
			
					});
			
			// Store the global
			var masterSchedule = addMissingProperties(schedule);
			
			return masterSchedule;
	}
	
	/**************************************************************************************
	 * MY PERSONAL SCHEDULE ROUTINES
	 *  I consolidated the mySchedule... functions here
	 *  
	 **************************************************************************************/


	function getMySchedule(){

		var scheds = getMyScheduleFromStore();
		
		 $("#mySchedlist").empty();
		 var container = $("#mySchedlist");
		
		var dow = $('#dow').val();
		//var headerText = "<div data-inline='true'><a href='#home' data-role='button'>Back</a></div><h1 aria-level='1' role='heading' tabindex='0' class='ui-title'> My Schedule for " + dow +"</h1>";
		var headerText = "My Schedule for " + dow;
		$("#myh").html(headerText);
		var items = '';
		
		scheds.sort(function(a,b) { return a.begTime - b.begTime} );
		
		for(var i =0;i<scheds.length;i++) 
		{ 
			var sched = scheds[i];
			if(sched.DOW == dow){
			var idx = sched.dateAndTime.indexOf(":");
			
			var schedTime =  sched.dateAndTime //.substring(idx+1,sched.dateAndTime.length);
					
			 items = items + "<li class='arrow'><a href='javascript:displayMyAbstract("+sched.Key_SessionID + ")'>"+schedTime + "  "+sched.SessionTitle + "</a></li>";
			
			}
			
		}
		
			$("#mySchedlist").html(items);
			$.mobile.changePage("#myScheduleDetail",'slide',false,true);
			$("#mySchedlist").listview('refresh');
	}
	
	function saveToMySchedule(){
		// The first thing to check is to see if we already have the sessid stored
		// The saved json object
		var text = localStorage.getItem("mySchedule-"+$('#conf').val());
		// The tricky bit is that the first time when we have no sessions saved
		// we need to build a sessions object in order to save it
			
		var mySessions = [];
			
			if(text!= null && text.length > 5)
				mySessions = JSON.parse(text);
				
		if(mySessionExists(mySessions)==false)

			storeMySession(currentlySelectedID,mySessions);
			
		$.mobile.changePage("#home",'slide',false,true);

			
		}

		function storeMySession(sessID, mySessions){
		//Store the session in JSON

		// create the object 
		var newSession = new Object();
		var sessionArray = [];

		newSession = getSessionObjectFromMaster(sessID);

		//push it onto the object stack
		sessionArray = mySessions;
		if(sessionArray==null || sessionArray.length == 0) {// nothing to start with
			// add the sessions array
			newSessionArray = [];
			newSessionArray.push(newSession);
			mySessions = newSessionArray;
		}
		else	
			mySessions.push(newSession);

		// stringify it for storage
		var jsonString = JSON.stringify(mySessions);

		localStorage.setItem("mySchedule-"+$('#conf').val(),jsonString);

		// reset the global variable
		mySchedule = mySessions;


		}

		function getMyScheduleFromStore(){

				// Myschedule is ALWAYS local
				var sessions = [];
				var sess = {};

				var text = localStorage.getItem("mySchedule-"+$('#conf').val());

				if(text!=null && text.length >5)
					sessions = JSON.parse(text);
				else
					sessions.push(sess);

				// Load up the global variable 
				mySchedule = sessions;
			
				return mySchedule;
			
		}

		function mySessionExists(sessions){

			// Master Schedule should have been loaded at startup
			// This ain't efficient but it will work
			var scheds = mySchedule;

			for(var i =0;i<scheds.length;i++) 
			{ 
				var sched = scheds[i];

				if(sched.Key_SessionID == currentlySelectedID)
					return true;
			}

			
			return false;
		}

		function removeMySession(){

			// My Schedule should have been loaded at startup
			// This ain't efficient but it will work
			var scheds = mySchedule;

			for(var i =0;i<scheds.length;i++) 
			{ 
				var sched = scheds[i];

				if(sched.Key_SessionID == currentlySelectedID){
					
					scheds.splice(i,1);
					
					// update the global
					mySchedule = scheds;
					
					// Store the updated string
					var jsonString = JSON.stringify(mySchedule);

					localStorage.setItem("mySchedule-"+$('#conf').val(),jsonString);
					
					
				}
					
			}

			
			$.mobile.changePage("#home",'slide',false,true);
			
		}

		function displayMyAbstract(sessID){

			currentlySelectedID = sessID;
			// create the object 
			var newSession = new Object();
			newSession = getSessionObjectFromMaster(sessID);
			
			var absObj = getAbstract(sessID);
			$("#myAbsLocation").html("<strong>"+newSession.location+"</strong>");
			$("#myAbsRoom").html("<strong>"+newSession.Room+"</strong>");
			$("#myAbsSessionID").html("<strong>"+newSession.Key_SessionID+"</strong>");
			$("#myAbsPresenters").html("<strong>"+getPresentersBySessionID(newSession.Key_SessionID,"2")+"</strong>");
			$("#myAbsText").html(absObj.Abstract);
			
			$.mobile.changePage("#myAbstractDetail",'slide',false,true);	
		  
		}


		/************************************************************************************
		 * GENERIC ABSTRACT ROUTINES
		 * I have consolidated the abstract routines here
		 * 
		 *************************************************************************************/
		 

function displayAbstract(sessID){

		currentlySelectedID = sessID;
		
		// create the object 
		var newSession = new Object();

		newSession = getSessionObjectFromMaster(sessID);
		
		var absObj = getAbstract(sessID);
		$("#absLocation").html("<strong>"+newSession.Property+"</strong>");
		$("#absRoom").html("<strong>"+newSession.Room+"</strong>");
		$("#absSessionID").html("<strong>"+newSession.Key_SessionID+"</strong>");
		$("#absPresenters").html("<strong>"+getPresentersBySessionID(newSession.Key_SessionID,"1")+"</strong>");
		$("#absText").html(absObj.Abstract);
		
		$.mobile.changePage("#abstractDetail",'slide',false,true);	
		

}

function getAbstracts(){
	
	abstracts = getAbstractsFromStore();
	
	return abstracts;
}



function storeAbstractsJSON(){
	// We'll store the abstracts JSON for offline use

	var abstracts = getAbstracts();

	var abs = JSON.stringify(abstracts);
	
	if(abs!=null && abs.length>5)
		// Only store it if there is something TO store
		localStorage.setItem("abstracts-"+$('#conf').val(),abs);

}

function getAbstractsFromStore(){
	// We'll get the master schedule JSON for offline use

	var text = localStorage.getItem("abstracts-"+$('#conf').val());

	if(text!=null && text.length >5)
		abstracts = JSON.parse(text);  // Already exist
	else 
		{
		var abs = getJSONAbstracts(); // get them from the server
		// Load up the global variable 
		abstracts = abs;
		// then save it to localstorage
		var sabs = JSON.stringify(abs);
		if(sabs!=null && sabs.length>5)
			// Only store it if there is something TO store
			localStorage.setItem("abstracts-"+$('#conf').val(),sabs);
	}
	return abstracts;
	 
	}

function storeAbstract(sessID){
	//Store the Abstract in JSON 

	var absText = JSON.stringify(getAbstractJSON(sessID));
	// May need to add the conference ID as a parm
	var absTextName = "abs-" + sessID;

	localStorage.setItem(absTextName,absText);

	}

	function getAbstractFromStore(sessID){
	// Returns the stored JSON
	//May need to add conference ID as a parm
	var absTextName = "abs-" + sessID;

	var text = localStorage.getItem(absTextName);

	var absText = JSON.parse(text);

	return absText

	}


	function getAbstract(sessID){

		// Abstracts should have been loaded at startup
		// This ain't efficient but it will work
		var abs = abstracts.data;

		for(var i =0;i<abs.length-1;i++) 
		{ 
			var ab = abs[i];

			if(ab.Key_SessionID == sessID){
				
				return ab; //return the whole object
			}
		}
	}



	function getAbstractJSON(sessID){ // deprecated shouldn't be used 
		var absText;

		// TODO - Need a better method for specifying the host/url

		var jsonURL =  $('#fmuid').val()+'?action=getAbstract&sessID='+sessID + '&conference='+$('#conf').val();
		$.ajax({
		  url: jsonURL,
		  async: false,
		  cache: false,
		  dataType:"json",
		  success: function(text){
					
					absText = $.parseJSON(text);
					
			},
			error: function(text){
					alert('Connection error occured ! (JSON exception)');
			}

		});

	return absText;
	}

	function getJSONAbstracts(){
		var absText;

		// Now pulling JSON from Confex API

		var httpURL =  'http://common.confex.com/common/s12/sync.cgi/Abstracts.json'; // This will return all for now
		
	    var jsonURL =  $('#fmuid').val()+'?action=GetProxiedJSON&url=' + httpURL;
	    
		$.ajax({
		  url: jsonURL,
		  async: false,
		  cache: false,
		  dataType:"json",
		  success: function(text){
					
					absText = text;
					
				},
				error: function(jqXHR,textStatus,errorThrown){
					alert('Connection error occured getting Abstracts ! Status: ' + textStatus + ' Error: ' + errorThrown);
					//alert(text);
				}
		});

	return absText;
	}

	/******************************************************************************************
	 * PERSON/PRESENTER ROUTINES 
	 * 
	 * I consolidated the person/presenter routines for easier location
	 * 
	 ******************************************************************************************/
	function getPresenters(){
		
		presenters = getPresentersFromStore();
		
		return presenters;
	}



	function storePresentersJSON(){
		// We'll store the abstracts JSON for offline use

		var presenters = getPresenters();

		var pres = JSON.stringify(presenters);
		
		if(pres!=null && pres.length>5)
			// Only store it if there is something TO store
			localStorage.setItem("presenters-"+$('#conf').val(),pres);

	}

	function getPresentersFromStore(){
		// We'll get the presenters JSON for offline use

		var text = localStorage.getItem("presenters-"+$('#conf').val());

		if(text!=null && text.length >5)
			presenters = JSON.parse(text);  // Already exist
		else 
			{
			var pres = getJSONPersons(); // get them from the server
			// Load up the global variable 
			presenters = pres;
			// then save it to localstorage
			var spres = JSON.stringify(pres);
			if(spres!=null && spres.length>5)
				// Only store it if there is something TO store
				localStorage.setItem("presenters-"+$('#conf').val(),spres);
		}
		return presenters;
		 
		}
	
		function getJSONPersons(){
			var persons;
		
			// Now pulling JSON from Confex API
		
			var httpURL =  'https://common.confex.com/common/s12/sync.cgi/Person.json'; // This will return all for now
			
		    var jsonURL =  $('#fmuid').val()+'?action=GetProxiedJSON&url=' + httpURL;
		    
			$.ajax({
			  url: jsonURL,
			  async: false,
			  cache: false,
			  dataType:"json",
			  success: function(text){
						
						persons = text;
						
					},
					error: function(text){
						alert('Connection error occured ! (JSON exception)');
					}
			});
		
		return persons;
		}
		
		function getPresenterName(personID){
			
			var persons = getPresenters().data;
			var fullname = "";
			
			for(var i =0;i<persons.length;i++) 
			{ 
				var person = persons[i];
				if(person.KeyPersonID == personID){
						fullname = person.FirstName + " " + person.LastName;
				}
				
			}
			
			return fullname;
			
		}

		function getPresentersBySessionID(sessionID,type){
			
			// first we need the list of presenter ID's from the ROLE data
			var items = "";
			var roles = getRoles().data;
			for(var i =0;i<roles.length;i++) 
			{ 
				var role = roles[i];
				if(role.Entryid == sessionID){
					items = items + "<li class='arrow'><a href='javascript:displayBiography("+role.PersonID +","+ type + ")'>"+ getPresenterName(role.PersonID) + "</a></li>";
						
				}
				
			}
			
			return items;
			
		}
		
		
		function displayBiography(personID,type){
			
			var persons = getPresenters().data;
			var biography = "";
			
			for(var i =0;i<persons.length;i++) 
			{ 
				var person = persons[i];
				if(person.KeyPersonID == personID){
						biography = person.Biography;
				}
				
			}
			
			$("#personInfo").html("<strong>"+biography+"</strong>");
			$("#my_personInfo").html("<strong>"+biography+"</strong>");

			if(type=="1")
				$.mobile.changePage("#biography",'slide',false,true);
			else
				$.mobile.changePage("#my_biography",'slide',false,true);
			
		}
		
/********************************************************************************************************
 * GENERAL ROLE ROUTINES
 * 
 * Consolidated here for easy access (I hope)
 * 
 *******************************************************************************************************/

		function getRoles(){
			
			roles = getRolesFromStore();
			
			return roles;
		}



		function storeRolesJSON(){
			// We'll store the roles JSON for offline use

			var roles = getRoles();

			var rs = JSON.stringify(roles);
			
			if(rs!=null && rs.length>5)
				// Only store it if there is something TO store
				localStorage.setItem("roles-"+$('#conf').val(),rs);

		}

		function getRolesFromStore(){
			// We'll get the roles JSON for offline use

			var text = localStorage.getItem("roles-"+$('#conf').val());

			if(text!=null && text.length >5)
				roles = JSON.parse(text);  // Already exist
			else 
				{
				var rs = getJSONRoles(); // get them from the server
				// Load up the global variable 
				roles = rs;
				// then save it to localstorage
				var srs = JSON.stringify(rs);
				if(srs!=null && srs.length>5)
					// Only store it if there is something TO store
					localStorage.setItem("roles-"+$('#conf').val(),srs);
			}
			return roles;
			 
			}
		
		function getJSONRoles(){
			
			var roles;
		
			// Now pulling JSON from Confex API
		
			var httpURL =  'https://common.confex.com/common/s12/sync.cgi/Role.json'; // This will return all for now
			
		    var jsonURL =  $('#fmuid').val()+'?action=GetProxiedJSON&url=' + httpURL;
			$.ajax({
			  url: jsonURL,
			  async: false,
			  cache: false,
			  dataType:"json",
			  success: function(text){
						
						roles = text;
						
					},
					error: function(text){
						alert('Connection error occured ! (JSON exception)');
					}
			});
		
		return roles;
		}

/*********************************************************************************************************
 * PERSONAL SCHEDULE ROUTINES
 * 
 * Consildated if needed
 * 
 **********************************************************************************************************/
function getJSONPersonalSchedule(myID){
	var personalschedule;

	// Now pulling JSON from Confex API

	var httpURL =  'https://common.confex.com/common/s12/sync.cgi/Personal_Schedule.json'; // This will return all for now
	
    var jsonURL =  $('#fmuid').val()+'?action=GetProxiedJSON&url=' + httpURL;
    
	$.ajax({
	  url: jsonURL,
	  async: false,
	  cache: false,
	  dataType:"json",
	  success: function(text){
				
				personalschedule = text;
				
			},
			error: function(text){
				alert('Connection error occured ! (JSON exception)');
			}
	});

return personalschedule;
}



/******************************************************************************************
 * GENERAL ROUTINES
 * 
 * 
 ******************************************************************************************/

function doBackgroundUpdate(){ // future
	// I need to sort through the realities here.  I am not being a good citzen because I am loading the whole shabang every time
	// I need to add a timestamp to the server-side record and only update the new records.  The current issue is knowing *what* 
	// changed since I am just scraping the DB.  I'll complete this for Sping 2012
	
	updateMasterScheduleChangesJSON(); // We may lazy load this because uodates should be rare
	updateAbstractChangesJSON; // Pulls from local storage

}

function reloadAppData(){
//	var masterSched = localStorage.getItem("master-"+$('#conf').val());
//	var schedAbstracts = localStorage.getItem("abstracts-"+$('#conf').val());
//	if(masterSched!=null && masterSched.length>5)
//		storeMasterScheduleJSON(); // We may lazy load this because uodates should be rare
//	if(schedAbstracts!=null && masterSched.length>5)
//		storeAbstractsJSON();
	getMasterFromStore(); // Pulls from local storage
	getAbstractsFromStore();
	getPresentersFromStore();
	getRolesFromStore();

}

function padDigits(n, totalDigits) 
{ 
    n = n.toString(); 
    var pd = ''; 
    if (totalDigits > n.length) 
    { 
        for (i=0; i < (totalDigits-n.length); i++) 
        { 
            pd = pd + '0'; 
        } 
    } 
    return pd + n.toString(); 
}

function getDOW(datein){
	
	var date = new Date(parseDate(datein,'yyyy/mm/dd'));
	
	var dow=

		["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
	
	return dow[new Date(date).getUTCDay()];
}

function fixdate(datein){
	
	// There is an issue with date formatting in Safari - it can't handle 
	// a yyyy-MM-dd format so we are going to flip it here
	var dateout = datein.substring(5) + "-" + datein.substring(0,4);
	
	return dateout;
	
}

function parseDate(input, format) {
	  format = format || 'yyyy-mm-dd'; // default format
	  var parts = input.match(/(\d+)/g), 
	      i = 0, fmt = {};
	  // extract date-part indexes from the format
	  format.replace(/(yyyy|dd|mm)/g, function(part) { fmt[part] = i++; });

	  return new Date(parts[fmt['yyyy']], parts[fmt['mm']]-1, parts[fmt['dd']]);
	}

/**
 *  * MISSING DateAndTime	format was like - Saturday, April 30, 2011: 7:00 AM-12:00 PM
 *         Location  like - 205 CD (Minneapolis Convention Center) 
 *         DOW - like Saturday
 *         Stime - HHMM
 *         /
 */

function addMissingProperties(sessions){
	// we end up with some missing properties that we need to calculate and add for now.
	// could be that we decided to reformat the screens at some point.
	if(sessions!=undefined){
	for(var i =0;i<sessions.data.length-1;i++) 
	{ 
		var sess = sessions.data[i];
		
		var checkDOW = new Date(sess.Date);
		
		var localDOW = getDOW(sess.Date);
		
		// we need a new date format
		var d = new Date("01/01/2012 " + sess.StartTime);
		sess.dateAndTime = dateFormat(new Date(parseDate(sess.Date,'yyyy/mm/dd')),"dddd, mmmm dS, yyyy") + " " + sess.StartTime + " - " + sess.EndTime; 
		sess.location = sess.Property + " " + sess.Room;
		// DOW 
		sess.DOW = getDOW(sess.Date);
		// sTime HHMM tough
		sess.sTime =  padDigits(d.getHours(),2)+padDigits(d.getMinutes(),2);
		
		
	}
	
	}
	
	return sessions;
}

