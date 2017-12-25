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


function Portfolio() {
  this.invested = 0;
  this.currentValue = 0;
  this.profitOrLoss = 0;
  this.coins = []
}


Portfolio.prototype.calculateStats = function () {
  var invested = 0;
  var currentValue = 0;

  $.each(this.coins, function(index, coin) {
    currentValue += coin.currentValue;
    invested += coin.holdingValue;
  })

  this.currentValue = currentValue;
  this.invested = invested;
  this.profitOrLoss = this.currentValue - this.invested;
}

Portfolio.prototype.updateAndRender =  function() {
  var oldProfitLossValue = this.profitOrLoss;

  this.calculateStats();

  if (oldProfitLossValue != this.profitOrLoss) {
    var percentage = '( '+((this.profitOrLoss / this.invested ) * 100).toLocaleString() + ' % )'
    var profitLossClass = this.profitOrLoss < 0 ? 'loss' :  'profit';
    $('.portfolio-profit-loss-value').html(this.profitOrLoss.toLocaleString());
    $('.portfolio-profit-or-loss').addClass('highlight');
    $('.portfolio-pol-percenage').html(percentage)
    setTimeout(function() {
      $('.portfolio-profit-or-loss').removeClass('highlight');
    }, 1000)
  }

}


function Coin(ticker) {
  this.ticker = ticker;
  this.transactions = [];
  this.avgPurchasePrice = null;
  this.unit = 0;
  this.profitOrLoss = 0;
  this.holdingValue = 0;
  this.currentPrice = 0;
  this.currentValue = 0;
}

Coin.prototype.reset = function() {
  this.transactions = [];
  this.avgPurchasePrice = null;
  this.unit = 0;
  this.profitOrLoss = 0;
  this.holdingValue = 0;
  this.currentPrice = 0;
  this.currentValue = 0;
}

Coin.prototype.addTransaction = function(transaction) {
  this.transactions.push(transaction);
}

Coin.prototype.sortTransactions = function() {
  this.transactions = $(this.transactions).sort(function(a, b) {
    return new Date(a.date) > new Date(b.date)
  })
}

Coin.prototype.calculateAvgPurchasePrice = function() {
  var self = this;

  $.each(self.transactions,function(index, val) {
      if (val.type == "buy") {
        if (self.avgPurchasePrice == null) {
          self.avgPurchasePrice = val.price
        }
        var holdingValue = self.unit * self.avgPurchasePrice

        var purchasedValue = val.unit * val.price

        self.unit = (self.unit + val.unit)
        if (self.unit) {
          self.avgPurchasePrice = ( ( holdingValue + purchasedValue ) / self.unit )
        }
      } else if (val.type == "sell") {
        if (self.avgPurchasePrice == null) {
          self.avgPurchasePrice = val.price / val.unit
        }

        var holdingValue = self.unit * self.avgPurchasePrice
        var soldValue = val.unit * val.price
        self.unit = (self.unit - val.unit)
        if (self.unit) {
          self.avgPurchasePrice = ( ( holdingValue - soldValue ) / self.unit )
        }

      } else if (val.type == "DEPOSIT") {

        self.unit = (self.unit + val.unit)
      } else if (val.type == "WITHDRAWALS") {
        self.unit = (self.unit - val.unit);
      }
    // }
  })

  self.holdingValue = self.unit * self.avgPurchasePrice;
  self.currentValue = self.currentPrice * self.unit;
  self.profitOrLoss = self.currentValue - self.holdingValue;
}

Coin.prototype.updateCurrentPrice = function(val) {
  var newPrice = val.split(',').join('')/1
  var oldPrice = this.currentPrice;
  if (oldPrice != newPrice) {
    this.currentPrice = newPrice;
    this.holdingValue = this.unit * this.avgPurchasePrice;
    this.currentValue = this.currentPrice * this.unit;
    this.profitOrLoss = this.currentValue - this.holdingValue;
    this.rerenderDom();
  }
}

Coin.prototype.rerenderDom = function() {
  var coinRowId = '#koinfolio__coin-'+ this.ticker
  var currentValueSelector = coinRowId + ' .current-value';
  var profitOrLossSelector = coinRowId + ' .profit-or-loss';
  var profitLosWrapSelector = coinRowId + ' .profit-or-loss-wrap'

  $(currentValueSelector).html(this.currentValue.toLocaleString());

  $(profitOrLossSelector).html(this.profitOrLoss.toLocaleString());

  $(profitLosWrapSelector).removeClass('profit loss');

  $(currentValueSelector).addClass('highlight');
  $(profitOrLossSelector).addClass('highlight');
  $(profitLosWrapSelector).addClass('highlight');

  if(this.profitOrLoss < 0) {
    $(profitLosWrapSelector).addClass('loss');
  } else {
    $(profitLosWrapSelector).addClass('profit');
  }

  setTimeout(function() {
    $(currentValueSelector).removeClass('highlight');
    $(profitOrLossSelector).removeClass('highlight');
    $(profitLosWrapSelector).removeClass('highlight');
  }, 1000)

}

var currentPrices = getCoinPrices();
var Bitcoin = new Coin('BTC');
var Ether = new Coin('ETH');
var Ripple = new Coin('XRP');
var Litecoin = new Coin('LTC');
var BitcoinCash = new Coin('BCH');
var Cash = new Coin('INR')
var KoinPortfolio = new Portfolio();
KoinPortfolio.coins = [Bitcoin, Ether, Ripple, Litecoin, BitcoinCash]

function setCoinCurrentPrice() {
  var currentPrices = getCoinPrices();
  Bitcoin.currentPrice = currentPrices['BTC']
  Ether.currentPrice = currentPrices['ETH']
  Ripple.currentPrice = currentPrices['XRP']
  Litecoin.currentPrice = currentPrices['LTC']
  BitcoinCash.currentPrice = currentPrices['BCH']
}

Cash.calculateAvgPurchasePrice = function() {
  //do something
}

var transactionTableObserver = new MutationObserver(function(a){scrapeTradeTransactions()});
function scrapeTradeTransactions() {
  var transactionTableNode = document.getElementsByClassName('trade-table')[0];
  var transactionRows = $($('.trade-table')[0]).find('tbody tr');
  var nextLink =  $(transactionTableNode).closest('.col-md-6').find('.link');
  scrapeTransactions(transactionRows);
  if (nextLink.length == 1 && $(nextLink).html() == 'Next') {
    $(nextLink)[0].click();
    transactionTableObserver.observe(transactionTableNode, { childList: true, subtree: true});
  } else {
    transactionTableObserver.disconnect();
  }
}

var withdrawalTableObserver = new MutationObserver(function(a){scrapeWithdrawalTransactions()});
function scrapeWithdrawalTransactions() {
  var transactionTableNode = document.getElementsByClassName('trade-table')[1];
  var transactionRows = $($('.trade-table')[1]).find('tbody tr');
  var nextLink =  $(transactionTableNode).closest('.col-md-6').find('.link');
  scrapeWithdrawals(transactionRows);
  if (nextLink.length == 1 && $(nextLink).html() == 'Next') {
    $(nextLink)[0].click();
    withdrawalTableObserver.observe(transactionTableNode, { childList: true, subtree: true});
  } else {
    withdrawalTableObserver.disconnect();
  }
}

var depositTableObserver = new MutationObserver(function(a){scrapeDepositTransactions()});
function scrapeDepositTransactions() {
  var transactionTableNode = document.getElementsByClassName('trade-table')[1];
  var transactionRows = $($('.trade-table')[1]).find('tbody tr');
  var nextLink =  $(transactionTableNode).closest('.col-md-6').find('.link');
  scrapeDeposits(transactionRows);
  if (nextLink.length == 1 && $(nextLink).html() == 'Next') {
    $(nextLink)[0].click();
    depositTableObserver.observe(transactionTableNode, { childList: true, subtree: true});
  } else {
    // scraping WITHDRAWALS
    var headers = $('.wallet-sub-header');
    $.each(headers, function(index, element){
      if ($(element).html().trim() == 'WITHDRAWALS') {
        $(element).click();
        scrapeWithdrawalTransactions();
      }
    })
    depositTableObserver.disconnect();
  }
}


function scrapeTransactions(transactionRows) {
  var transactions = []
  $.each(transactionRows, function(index, row) {
    var transactionCol = $(row).find('td')
    var trans_date = $(transactionCol[0]).html().split('/');
    var day = trans_date[0]
    var month = trans_date[1]
    var year = trans_date[2]

    trans_date = month + '/' + day + '/' + year;
    var ticker = $(transactionCol[1]).html();
    var trans_type = $($(transactionCol[2]).find('a')).html();
    var trans_unit = $(transactionCol[3]).html().split(',').join('').trim();
    var trans_price_at = $(transactionCol[4]).html().split(',').join('').trim();

    addTransactionsToCoin({
      date: trans_date,
      ticker: ticker,
      type: trans_type,
      unit: parseFloat(trans_unit),
      price: parseFloat(trans_price_at)
    })
  })
}

function scrapeDeposits(transactionRows) {
 var transactions = []
  $.each(transactionRows, function(index, row) {
    var transactionCol = $(row).find('td')
    var trans_date = $(transactionCol[0]).html().split(',')[0].split('/');
    var day = trans_date[0]
    var month = trans_date[1]
    var year = trans_date[2]
    trans_date = month + '/' + day + '/' + year;
    var ticker = $($(transactionCol[1]).find('span')).html().trim();
    var trans_type = 'DEPOSIT'
    var trans_unit = $(transactionCol[2]).html().split(',').join('').trim();
    var trans_price_at = null

    addTransactionsToCoin({
      date: trans_date,
      ticker: ticker,
      type: trans_type,
      unit: parseFloat(trans_unit),
      price: parseFloat(trans_price_at)
    })
  })
}

function scrapeWithdrawals(transactionRows) {
  var transactions = []
  $.each(transactionRows, function(index, row) {
    var transactionCol = $(row).find('td')
    var trans_date = $(transactionCol[0]).html().split(',')[0].split('/');
    var day = trans_date[0]
    var month = trans_date[1]
    var year = trans_date[2]
    trans_date = month + '/' + day + '/' + year;
    var ticker = $($(transactionCol[1]).find('span')).html().trim();
    var trans_type = 'WITHDRAWALS'

    var trans_unit = $(transactionCol[2]).html().split(',').join('').trim();
    var trans_price_at = null

    addTransactionsToCoin({
      date: trans_date,
      ticker: ticker,
      type: trans_type,
      unit: parseFloat(trans_unit),
      price: parseFloat(trans_price_at)
    })
  })
}


function addTransactionsToCoin(transaction) {
  switch(transaction.ticker) {
    case 'BTC':
      Bitcoin.addTransaction(transaction);
      break;
    case 'ETH':
      Ether.addTransaction(transaction);
      break;
    case 'XRP':
      Ripple.addTransaction(transaction);
      break;
    case 'LTC':
      Litecoin.addTransaction(transaction);
      break;
    case 'BCH':
      BitcoinCash.addTransaction(transaction);
      break;
    case 'INR':
      Cash.addTransaction(transaction);
      break;
    default:
      break;
  }
}

function calculateCoinsDataFromTransactions() {
  Litecoin.sortTransactions();
  Litecoin.calculateAvgPurchasePrice();
  Bitcoin.sortTransactions();
  Bitcoin.calculateAvgPurchasePrice();
  Ripple.sortTransactions();
  Ripple.calculateAvgPurchasePrice();
  Ether.sortTransactions();
  Ether.calculateAvgPurchasePrice();
  BitcoinCash.sortTransactions();
  BitcoinCash.calculateAvgPurchasePrice();
  Cash.sortTransactions();
}

var CoinImage = {
  BTC: 'bitcoin.png',
  ETH: 'ether.png',
  LTC: 'litecoin.png',
  XRP: 'ripple.png',
  BCH: 'bitcoin_cash.png'
}

function coinRowTemplate(coin) {
  var profitOrLossClass = coin.profitOrLoss > 0 ? 'profit' : 'loss';
  var avgPurchasePrice = coin.avgPurchasePrice ? coin.avgPurchasePrice.toLocaleString() : 'NA'
  var template = '<div class="koinfolio__coin clearfix" id="koinfolio__coin-'+coin.ticker+'">' +
                    '<div class="col-md-2">'+
                      '<div class="coin-col koin-item-bold"><img class="koin-image" src="'+CoinImage[coin.ticker]+'"/>'+ coin.ticker + '</div>'+
                    '</div>' +
                    '<div class="col-md-2">'+
                      '<div class="coin-col">'+ coin.unit + '</div>'+
                    '</div>'+
                    '<div class="col-md-2">'+
                      '<div class="coin-col">'+ avgPurchasePrice + '</div>'+
                    '</div>'+
                    '<div class="col-md-2">'+
                      '<div class="coin-col animate">'+ coin.holdingValue.toLocaleString() + '</div>'+
                    '</div>'+
                    '<div class="col-md-2">'+
                      '<div class="coin-col current-value animate">'+ coin.currentValue.toLocaleString() + '</div>'+
                    '</div>'+
                    '<div class="col-md-2">'+
                      '<div class="coin-col animate profit-or-loss-wrap '+ profitOrLossClass +'"><i class="fa fa-caret-up"></i><i class="fa fa-caret-down"></i><span class="profit-or-loss animate">'+ coin.profitOrLoss.toLocaleString() + '</span></div>'+
                    '</div>'+
                  '</div>';
  return template
}

function coinRows() {
  var template = '<div class="koinfolio__header clearfix">' +
                    '<div class="col-md-2">'+
                      '<div class="coin-col"> Coin </div>'+
                    '</div>' +
                    '<div class="col-md-2">'+
                      '<div class="coin-col"> Units </div>'+
                    '</div>'+
                    '<div class="col-md-2">'+
                      '<div class="coin-col"> Avg purchase price </div>'+
                    '</div>'+
                    '<div class="col-md-2">'+
                      '<div class="coin-col"> Invested </div>'+
                    '</div>'+
                    '<div class="col-md-2">'+
                      '<div class="coin-col"> Current Value </div>'+
                    '</div>'+
                    '<div class="col-md-2">'+
                      '<div class="coin-col"> Profit/Loss </div>'+
                    '</div>'+
                  '</div>';

   template += coinRowTemplate(Bitcoin) + coinRowTemplate(Litecoin) + coinRowTemplate(Ether) + coinRowTemplate(Ripple) + coinRowTemplate(BitcoinCash) + portfolioTemplate();
  return template
}

function portfolioTemplate() {

  var profitLossClass = KoinPortfolio.profitOrLoss < 0 ? 'loss' : 'profit';
  var html  = '<div class="koinfolio__portfolio">'+
                '<div class="portfolio-item portfolio-label">'+
                  'Your Portfolio'+
                '</div>'+
                '<div class="portfolio-item" id="portfolio-invested">'+
                  '<span class="portfolio-item-label">Invested</span>'+
                  '<span class="portfolio-item-value">'+ KoinPortfolio.invested.toLocaleString() +'</span>'+
                '</div>'+
                '<div class="portfolio-item portfolio-profit-or-loss '+ profitLossClass +'" >'+
                  '<span class="portfolio-item-label">Profit/Loss</span>'+
                  '<span class="portfolio-item-value"><i class="fa fa-caret-down"></i> <i class="fa fa-caret-up"></i><span id="portfolio-profit-loss-value">'+ KoinPortfolio.profitOrLoss.toLocaleString() +'</span></span>'+
                  '<span class="portfolio-item-value portfolio-pol-percenage">( '+ ((KoinPortfolio.profitOrLoss / KoinPortfolio.invested) * 100).toLocaleString() +' %)</span>'+
                '</div>'+
              '</div>';

  return html
}


function renderTemplate(html) {
  $('#koinfolio').html(html);
}

function updateCoinsAndReRender(newPrices) {
  $.each(newPrices, function(key, val) {
    switch(key) {
      case 'BTC':
        Bitcoin.updateCurrentPrice(val);
        break;
      case 'ETH':
        Ether.updateCurrentPrice(val);
        break;
      case 'LTC':
        Litecoin.updateCurrentPrice(val);
        break;
      case 'XRP':
        Ripple.updateCurrentPrice(val);
        break;
      case 'BCH':
        BitcoinCash.updateCurrentPrice(val);
        break
    }
  })

  KoinPortfolio.updateAndRender();
}

var intervalId = null
function pollPrice() {
  intervalId  = setInterval(function() {
    $.ajax({
      url: 'https://koinex.in/api/ticker',
      success: function(res) {
        updateCoinsAndReRender(res.prices);
      },

      error: function(err) {
        console.log(err)
      }
    })
  }, 30000);
}

function initDashboard() {
  Bitcoin.reset();
  Litecoin.reset();
  Ripple.reset();
  Ether.reset();
  BitcoinCash.reset();
  Cash.reset();
  setTimeout(function() {
    setCoinCurrentPrice();
    scrapeTradeTransactions();
    scrapeDepositTransactions();
    $('.main-view-container .container-fluid .ticker-container').after('<div id="koinfolio" class="card white-background koinfolio"> loading....</div>')
  }, 4000);

  setTimeout(function() {
    calculateCoinsDataFromTransactions();
    KoinPortfolio.calculateStats();
    renderTemplate(coinRows());
    pollPrice();
    console.log(KoinPortfolio);
  }, 6000)
}



$(document).on('click', '.top-header a', function(e) {
  if (e.target.innerHTML == 'BALANCES') {
    chrome.storage.sync.get('iskoinFolioTurnOn', function(value) {
      if (value.iskoinFolioTurnOn) {
        initDashboard()
      };
    });
  }
})

$(document).ready(function() {
  if (window.location.href.indexOf('balances')  != -1) {
    chrome.storage.sync.get('iskoinFolioTurnOn', function(value) {
      if (value.iskoinFolioTurnOn) {
        initDashboard()
      };
    });
  }
})

var iskoinFolioTurnOn = true;
function removeDashboard() {
  $('#koinfolio').html('');
  clearTimeout(intervalId);
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (key in changes) {
    if (key == 'iskoinFolioTurnOn') {
      var storageChange = changes[key];
      iskoinFolioTurnOn = storageChange.newValue;
      if (storageChange.newValue) {
        location.reload();
      } else {
        removeDashboard();
      }
    }
  }
});

