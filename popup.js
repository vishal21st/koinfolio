var tickers = ['BTC', 'ETH', 'XRP', 'LTC', 'BCH', 'GNT']

document.addEventListener('DOMContentLoaded', () => {
  var prices = getPriceAlerts(function(items) {
    initializeForm(items);
  });

  var saveBtns = document.getElementsByClassName('btnSave');
  for (i = 0; i < saveBtns.length; i++) {
    var btn = saveBtns[i];
    btn.addEventListener('click', function(e) {
      addAlert(e);
    })
  }

  var toggleSwitch = document.getElementById('toggle-switch');
  toggleSwitch.addEventListener('click', handleToggle)
});


function handleToggle(e) {
  chrome.storage.sync.set({'iskoinFolioTurnOn': e.target.checked}, function() {    // Notify that we saved.
    setUpForm(e.target.checked)
  });
}

function setUpForm(isOn) {

  if (isOn) {
    document.getElementById('alert-form').classList.add('on');
    document.getElementsByClassName('toggle-switch-label')[0].classList.add('on');
    document.getElementsByClassName('toggle-switch')[0].classList.add('on');
  } else {
    document.getElementById('alert-form').classList.remove('on');
    document.getElementsByClassName('toggle-switch-label')[0].classList.remove('on');
    document.getElementsByClassName('toggle-switch')[0].classList.remove('on')
  }
}

function initializeForm(items) {
  chrome.storage.sync.get('iskoinFolioTurnOn', function(value) {    // Notify that we saved.
    setUpForm(value.iskoinFolioTurnOn);
  });

  tickers.forEach(function(ticker, value) {
    setInputValues(ticker, items[ticker])
  })
}


function setInputValues(ticker, priceObj) {
  var highInput = document.getElementById(ticker + '-high');
  var lowInput = document.getElementById(ticker+'-low');

  if (priceObj) {
    var high = priceObj['high']
    var low = priceObj['low']
    if (high) {
      highInput.value = high;
    }

    if (low) {
      lowInput.value = low;
    }
  }
}


function getPriceAlerts(callback) {
  chrome.storage.sync.get(tickers, (items) => {
    callback(items)
  });
}

function addAlert(e) {
  var btn = e.target;
  var ticker = e.target.dataset.ticker;
  var highInput = document.getElementById(ticker + '-high');
  var lowInput = document.getElementById(ticker+'-low');
  var high = parseFloat(highInput.value);
  var low = parseFloat(lowInput.value);
  var errorBlock = document.getElementById(ticker+'-error')
  var obj  = {}

  if (isNaN(high) && isNaN(low) ) {
    high = ""
    low = ""
    obj[ticker] = null
  } else {
    obj[ticker] = {
      high: high,
      low: low,
      isTriggerd: false
    }
  }

  chrome.storage.sync.set(obj , () => {
    console.log('alert set');
  });
}
