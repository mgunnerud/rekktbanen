const config = [
	{ fromName: "Kolsås", fromId: "NSR:StopPlace:4060", toName: "Jernbanetorget", toId: "NSR:StopPlace:3990", lines: ["RUT:Line:3"] },
	{ fromName: "Grønland", fromId: "NSR:StopPlace:6488", toName: "Kolsås", toId: "NSR:StopPlace:4060", lines: ["RUT:Line:3"] },
	{ fromName: "Kalbakken", fromId: "NSR:StopPlace:5810", toName: "Tøyen", toId: "NSR:StopPlace:6473", lines: ["RUT:Line:5"] }
];

var callAjax = function(postContent, callback) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            callback(xmlhttp.responseText);
        }
    }
    
    xmlhttp.open("POST", "https://api.entur.org/journeyplanner/2.0/index/graphql", true);
    xmlhttp.setRequestHeader('Access-Control-Allow-Origin', '*');
    xmlhttp.setRequestHeader('ET-Client-Name', 'RekkTbanen');
    xmlhttp.setRequestHeader('Content-type', 'application/json');
    xmlhttp.send(JSON.stringify(postContent));
}

function toDoubleDigit(n){
    return n > 9 ? "" + n: "0" + n;
}

function getDeparturesFromStop(fromStop, toStop, lines) {
	var callback = function(returnData) {
		var jsonReturn = JSON.parse(returnData).data.trip.tripPatterns;
		var topData = [];
		var rowsEl = document.getElementById('departure-rows');
		if (jsonReturn[0].legs.length === 0 || !jsonReturn[0].legs[0].fromEstimatedCall) {
			var noDeparturesFoundEl = document.createElement('div');
			noDeparturesFoundEl.innerHTML = "Fant ingen avganger";
			rowsEl.appendChild(noDeparturesFoundEl);
		} else {
			for (var i = 0; i < jsonReturn.length; i++) {
				var timeDiff = (new Date(jsonReturn[i].legs[0].fromEstimatedCall.expectedDepartureTime) - new Date()) / 1000;
				var readableTime = Math.floor(timeDiff / 60) + '.' + toDoubleDigit(Math.floor(timeDiff % 60));
				topData.push(readableTime);
			}
		
			for (var j = 0; j < topData.length; j++) {
				var tripEl = document.createElement('div');
				tripEl.classList.add('departure-entry');
				tripEl.innerHTML = topData[j];
				rowsEl.appendChild(tripEl);
			}
		}
		document.getElementById('departure-loader').style.display = 'none';
		document.getElementById('refresh-button').style.display = 'inline-block';
	}
	var query = `{
  		trip(
    		from: {
				place: "${fromStop}"
		    }, 
		    to: {
		    	place: "${toStop}"
		    }, 
    		numTripPatterns: 5,
		    whiteListed: { lines: ["${lines.join("\",\"")}"] }
  		) {
    		tripPatterns {
		    	legs {
			        fromEstimatedCall {
				    	realtime
				        aimedDepartureTime
				        expectedDepartureTime
				        actualDepartureTime
			        }
			    }
		    }
		}
	}`;

	var postContent = {
		query: query,
		variables: null,
		operationName: null
	}
	callAjax(postContent, callback);
};

function setSelectedStop(element) {
	showLoadingSpinner();
    var selectedStop = document.getElementsByClassName('fa-check')[0];
    if (selectedStop) {
    	selectedStop.classList.remove("fa-check"); // remove class icon
    }
	element.querySelector('.selection-icon').classList.add('fa-check');
};

function showLoadingSpinner() {
	document.getElementById('refresh-button').style.display = 'none';
	document.getElementById('departure-rows').innerHTML = ""; // clear old data;
	document.getElementById('departure-loader').style.display = 'inline-block';
}

window.onload = function(e) {
	let root = document.getElementById("stop-selector");
	for (let i = 0; i < config.length; i++) {
		let stopEl = document.createElement("div");
		stopEl.classList.add("stop-selector-item");
		let selectionEl = document.createElement("i");
		selectionEl.className = "fa selection-icon";
		let fromEl = document.createElement("span");
		fromEl.innerHTML = config[i].fromName;
		let arrowEl = document.createElement("i");
		arrowEl.className = "fa fa-arrow-right";
		let toEl = document.createElement("span");
		toEl.innerHTML = config[i].toName;
		stopEl.appendChild(selectionEl);
		stopEl.appendChild(fromEl);
		stopEl.appendChild(arrowEl);
		stopEl.appendChild(toEl);
		stopEl.addEventListener('click', (event) => {
			getDeparturesFromStop(config[i].fromId, config[i].toId, config[i].lines);
			setSelectedStop(event.currentTarget);
		});
		root.appendChild(stopEl)
	}
	document.getElementById('refresh-button').addEventListener('click', function() {
		document.getElementsByClassName("fa-check")[0].click();
	});
}
