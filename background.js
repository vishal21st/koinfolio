
// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
  Displays a notification with the current time. Requires "notifications"
  permission in the manifest file (or calling
  "Notification.requestPermission" beforehand).
*/
function show(text) {
  var time = /(..)(:..)/.exec(new Date());     // The prettyprinted time.
  var hour = time[1] % 12 || 12;               // The prettyprinted hour.
  var period = time[1] < 12 ? 'a.m.' : 'p.m.'; // The period of the day.
  new Notification(hour + time[2] + ' ' + period, {
    icon: 'icon.png',
    body: text
  });
}
// Conditionally initialize the options.
if (!localStorage.isInitialized) {
  localStorage.isActivated = true;   // The display activation.
  localStorage.frequency = 1;        // The display frequency, in minutes.
  localStorage.isInitialized = true; // The option initialization.
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    var request = request.notify
    var ticker = request.ticker
    var setPrice = request.setPrice
    var currentPrice = request.currentPrice
    var text = ''

    if (request.type == 'low') {
      text = ticker + ': ' + 'current price ' + currentPrice;
    }

    if (request.type == 'high') {
      text = ticker + ': '+ 'current price is ' + currentPrice;
    }

    show(text)
    playAudio();
    sendResponse({farewell: "goodbye"});
  });


function playAudio() {
  var myAudio = new Audio();
  myAudio.src = "alert_ring.wav";
  myAudio.play();
}
