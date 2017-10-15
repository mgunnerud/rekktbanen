const stopToyen = 3010600;
const stopAvlos = 2190280;
const stopKolsas = 2190450;
const stopMajorstua = 3010200;
const stopGronland = 3010610;
const stopJernbaneTorget = 3010011;
const eastDirection = '1';
const westDirection = '2';

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
}

window.onload = function(e){ 
    document.getElementById('avlos-jernbaneTorget').addEventListener('click', function() {
	    getDeparturesFromStop('http://reisapi.ruter.no/StopVisit/GetDepartures/' + stopAvlos + '?linenames=3', eastDirection);
    	setSelectedStop(this);
	});
	
	document.getElementById('toyen-bogerud').addEventListener('click', function() {
		getDeparturesFromStop('http://reisapi.ruter.no/StopVisit/GetDepartures/' + stopToyen + '?linenames=3', eastDirection);
		setSelectedStop(this);
	});
		
	document.getElementById('jernbaneTorget-avlos').addEventListener('click', function() {
		getDeparturesFromStop('http://reisapi.ruter.no/StopVisit/GetDepartures/' + stopJernbaneTorget + '?linenames=3', westDirection);
		setSelectedStop(this);
	});
	
	document.getElementById('kolsas-majorstua').addEventListener('click', function() {
		getDeparturesFromStop('http://reisapi.ruter.no/StopVisit/GetDepartures/' + stopKolsas + '?linenames=3', eastDirection);
		setSelectedStop(this);
	});
	
	document.getElementById('majorstua-kolsas').addEventListener('click', function() {
		getDeparturesFromStop('http://reisapi.ruter.no/StopVisit/GetDepartures/' + stopMajorstua + '?linenames=3', westDirection);
		setSelectedStop(this);
	});
	
	document.getElementById('gronland-kolsas').addEventListener('click', function() {
		getDeparturesFromStop('http://reisapi.ruter.no/StopVisit/GetDepartures/' + stopGronland + '?linenames=3', westDirection);
		setSelectedStop(this);
	});
	
	document.getElementById('refresh-button').addEventListener('click', function() {
		document.getElementsByClassName("fa-check")[0].click()
	});
	
	if (window.location.hash.indexOf("select=hm") > -1) {
		document.getElementById("s-select").style.display = "none";
	} else {
		document.getElementById("hm-select").style.display = "none";
	}
}

//callAjax('http://reisapi.ruter.no/Line/GetStopsByLineId/3', function() {})