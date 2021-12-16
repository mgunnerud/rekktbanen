const GRORUD = 'NSR:StopPlace:5848'
const KOLSAS = 'NSR:StopPlace:4060'
const BRYNSENG = 'NSR:StopPlace:6086'
const TOYEN = 'NSR:StopPlace:6473'
const GRONLAND = 'NSR:StopPlace:6488'

const config = [
	{ fromName: 'Kolsås', fromId: KOLSAS, toName: 'Tøyen', toId: TOYEN, lines: ['RUT:Line:3'] },
	{ fromName: 'Grønland', fromId: GRONLAND, toName: 'Kolsås', toId: KOLSAS, lines: ['RUT:Line:3'] },
	{ fromName: 'Tøyen', fromId: TOYEN, toName: 'Grorud', toId: GRORUD, lines: ['RUT:Line:5'] },
	{ fromName: 'Tøyen', fromId: TOYEN, toName: 'Brynseng', toId: BRYNSENG, lines: ['RUT:Line:2', 'RUT:Line:3', 'RUT:Line:4'] },
	{ fromName: 'Grorud', fromId: GRORUD, toName: 'Tøyen', toId: TOYEN, lines: ['RUT:Line:5'] }
];

const callAjax = (postContent, callback) => {
	fetch('https://api.entur.io/journey-planner/v2/graphql', {
		method: 'POST',
		mode: 'cors',
		headers: {
			'ET-Client-Name': 'RekkTbanen',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(postContent)
	})
	.then(response => response.json().then(jsonData => callback(jsonData)))
	.catch(error => showErrorMessage("Feil ved kall til entur API"));
}

const showErrorMessage = (message) => {
	document.getElementById('departure-loader').style.display = 'none';
	var rowsEl = document.getElementById('departure-rows');
	var noDeparturesFoundEl = document.createElement('div');
	noDeparturesFoundEl.innerHTML = message;
	rowsEl.appendChild(noDeparturesFoundEl);
}

const toDoubleDigit = (n) => {
    return n > 9 ? '' + n: '0' + n;
}

const getDeparturesFromStop = (fromStop, toStop, lines) => {
	const callback = (returnData) => {
		var jsonReturn = returnData.data.trip.tripPatterns;
		var rowsEl = document.getElementById('departure-rows');
		if (jsonReturn[0].legs.length === 0 || !jsonReturn[0].legs[0].fromEstimatedCall) {
			showErrorMessage('Fant ingen avganger');
		} else {
			for (var i = 0; i < jsonReturn.length; i++) {
				var timeDiff = (new Date(jsonReturn[i].legs[0].fromEstimatedCall.expectedDepartureTime) - new Date()) / 1000;
				var readableTime = Math.floor(timeDiff / 60) + '.' + toDoubleDigit(Math.floor(timeDiff % 60));
				var tripEl = document.createElement('div');
				tripEl.classList.add('departure-entry');
				tripEl.innerHTML = readableTime;
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

const setSelectedStop = (element) => {
	showLoadingSpinner();
    var selectedStop = document.getElementsByClassName('fa-check')[0];
    if (selectedStop) {
    	selectedStop.classList.remove("fa-check"); // remove class icon
    }
	element.querySelector('.selection-icon').classList.add('fa-check');
};

const showLoadingSpinner = () => {
	document.getElementById('refresh-button').style.display = 'none';
	document.getElementById('departure-rows').innerHTML = ''; // clear old data;
	document.getElementById('departure-loader').style.display = 'inline-block';
}

const createConfigElements = () => {
	let root = document.getElementById('stop-selector');
	for (let i = 0; i < config.length; i++) {
		let stopEl = document.createElement('div');
		stopEl.classList.add('stop-selector-item');
		let selectionEl = document.createElement('i');
		selectionEl.className = 'fa selection-icon';
		let fromEl = document.createElement('span');
		fromEl.innerHTML = config[i].fromName;
		let arrowEl = document.createElement('i');
		arrowEl.className = 'fa fa-arrow-right';
		let toEl = document.createElement('span');
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
} 

window.onload = () => {
	createConfigElements();
	document.getElementById('refresh-button').addEventListener('click', () => {
		document.getElementsByClassName('fa-check')[0].click();
	});
}
