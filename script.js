const stopToyen = 3010600;
const stopSinsen = 0;
const stopGjettum = 2190360;
const stopJernbaneTorget = 3010011;
const eastDirection = '1';
const westDirection = '2';
var loadDeparturesFn = null;

function callAjax(url, callback){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
            callback(xmlhttp.responseText);
        }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
};

function toDoubleDigit(n){
    return n > 9 ? "" + n: "0" + n;
}

function getDepartureTimesFromToyen() {
	getDeparturesFromStop('http://reisapi.ruter.no/StopVisit/GetDepartures/' + stopToyen + '?linenames=3', eastDirection);
};

function getDepartureTimesFromGjettum() {
	getDeparturesFromStop('http://reisapi.ruter.no/StopVisit/GetDepartures/' + stopGjettum + '?linenames=3', eastDirection);
};

function getDepartureTimesFromJernbaneTorget() {
	getDeparturesFromStop('http://reisapi.ruter.no/StopVisit/GetDepartures/' + stopJernbaneTorget + '?linenames=3', westDirection);
};

function getDeparturesFromStop(url, direction) {
	var callback = function(returnData) {
		var jsonReturn = JSON.parse(returnData);
		var topData = [];
		for (var i = 0; i < jsonReturn.length; i++) {
			if (jsonReturn[i].MonitoredVehicleJourney.DirectionRef === direction) {
				var timeDiff = (new Date(jsonReturn[i].MonitoredVehicleJourney.MonitoredCall.ExpectedDepartureTime) - new Date()) / 1000;
				var readableTime = Math.floor(timeDiff / 60) + '.' + toDoubleDigit(Math.floor(timeDiff % 60));
				topData.push(readableTime);
			}
		}
		
		var rowsEl = document.getElementById('departure-rows');
		for (var j = 0; j < topData.length; j++) {
			var directionEl = document.createElement('div');
			directionEl.classList.add('departure-entry');
			directionEl.innerHTML = topData[j];
			rowsEl.appendChild(directionEl);
			
		}
		//console.log(topData);
		document.getElementById('departure-loader').style.display = 'none';
		document.getElementById('refresh-button').style.display = 'inline-block';
	}
	callAjax(url, callback);
};

function setSelectedStop(element) {
	loadDepartureTimes();
    var selectedStop = document.getElementsByClassName('fa-check')[0];
    if (selectedStop) {
    	selectedStop.classList.remove("fa-check"); // remove class icon
    }
	element.querySelector('.selection-icon').classList.add('fa-check');
};

function loadDepartureTimes() {
	document.getElementById('refresh-button').style.display = 'none';
	document.getElementById('departure-rows').innerHTML = ""; // clear old data;
	document.getElementById('departure-loader').style.display = 'inline-block';
	loadDeparturesFn();
}

window.onload = function(e){ 
    document.getElementById('gjettum').addEventListener('click', function() {
	    loadDeparturesFn = getDepartureTimesFromGjettum;
    	setSelectedStop(this);
	});
	
	document.getElementById('toyen').addEventListener('click', function() {
		loadDeparturesFn = getDepartureTimesFromToyen;
		setSelectedStop(this);
	});
		
	document.getElementById('jernbaneTorget').addEventListener('click', function() {
		loadDeparturesFn = getDepartureTimesFromJernbaneTorget;
		setSelectedStop(this);
	});
	
	document.getElementById('refresh-button').addEventListener('click', function() {
		if (loadDeparturesFn) {
			loadDepartureTimes();
		}
	});
}

//callAjax('http://reisapi.ruter.no/Line/GetStopsByLineId/3', function() {})