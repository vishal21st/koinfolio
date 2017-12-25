var COIN_TICKERS = {
  'BTC/INR': 'BTC',
  'ETH/INR': 'ETH',
  'XRP/INR': 'XRP',
  'LTC/INR': 'LTC',
  'BCH/INR': 'BCH',
  'GNT/INR': 'GNT',
  'MIOTA/INR': 'MIOTA',
  'OMG/INR': 'OMG'
}

var tickers = ['BTC', 'ETH', 'XRP', 'LTC', 'BCH', 'GNT']

var domSelector = {
  tickerContainer: '.ticker-container',
  coin: '.coin b'
}

function getCoinPrices() {
  var coins = document.querySelectorAll('.ticker-container .coin b')
  var obj = {}
  coins.forEach(function(coinEl) {
    var text = coinEl.innerText
    var splitText = text.split(':')
    var ticker = splitText[0].trim();
    var price = parseFloat(splitText[1].trim().split(',').join(''));
    obj[COIN_TICKERS[ticker]] = price
  })
  return obj
}


function checkAndTriggerAlert(currentPrices, setPrices) {
  for (var ticker in setPrices) {
    try {

      if (setPrices[ticker] && !setPrices[ticker].isTriggerd) {
        var high = setPrices[ticker].high
        var low = setPrices[ticker].low
        var currentPrice = currentPrices[ticker]

        if (high && currentPrice >= high) {
          notify(ticker, 'high', currentPrice, high)
        }

        if (low && currentPrice <= low) {
          notify(ticker, 'low', currentPrice, high)
        }

        var alertObj = {}
        alertObj[ticker] = setPrices[ticker]
        alertObj[ticker]['isTriggerd'] = true

        chrome.storage.sync.set(alertObj , () => {
        });
      }
    }
    catch(err) {
      console.log(err)
    }
  }
}


function notify(ticker, type , currentPrice, setPrice) {
  var requestObj = {
    ticker: ticker,
    type: type,
    currentPrice: currentPrice,
    setPrice: setPrice
  }
  chrome.runtime.sendMessage({'notify': requestObj}, function(response) {
    console.log(response)
  });
}


chrome.storage.sync.get('iskoinFolioTurnOn', function(value) {
  initializeNotifications(value.iskoinFolioTurnOn);
});

function initializeNotifications(isOn) {
  if (isOn) {
    setInterval (function() {
      chrome.storage.sync.get(tickers, (setPrices) => {
        var currentPrices = getCoinPrices()
        checkAndTriggerAlert(currentPrices, setPrices)
      });

    }, 10000)
  }
}
