// ==UserScript==
// @name         Popcat Bot
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically generates 799 pops every 30 seconds on popcat.click
// @author       Ice Lam
// @match        https://popcat.click/
// @icon         https://www.google.com/s2/favicons?domain=popcat.click
// @grant        none
// @updateURL    https://raw.githubusercontent.com/icelam/popcat-bot/master/popcat-bot.user.js

// @downloadURL  https://raw.githubusercontent.com/icelam/popcat-bot/master/popcat-bot.user.js
// @supportURL   https://github.com/icelam/popcat-bot/issues
// ==/UserScript==

(function () {
  'use strict';

  // console log helper 
  const displayMessage = (message, style) => {
    console.log(`[${new Date().toLocaleTimeString()}] %c${message}`, style);
  };

  // session status
  let shouldStartInterval = false;
  let total = 0;

  // Set a cookie
  const setCookie = (name, value, expiryDays) => {
    const date = new Date();
    date.setTime(date.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
  };

  // Simulate keyboard event
  const simulateClick = () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    window.document.dispatchEvent(event);
  };

  // Send first event so that it allows update via __vue__
  simulateClick();
  setTimeout(() => {
    shouldStartInterval = true;
  }, 1000);
  displayMessage(' Popcat Bot started. Generating first pop. ', 'background: #073cdb; color: #ffffff');

  // Popcat will only accept maximum 800 clicks per 30 seconds,
  // and will mark >= 800 clicks per 30 seconds as bot.
  // Preserve 1 click for saving click count to cookie
  const CLICK_PER_INTERVAL = 798;
  const INTERVAL_MS = 1000;

  const clickInterval = setInterval(() => {
    const vue = document.getElementById('app').__vue__;
    if (shouldStartInterval && vue.accumulator === 0) {
      vue.sequential_max_pops = 0; // prevent mark as bot
      vue.counter += CLICK_PER_INTERVAL; // update total click display on screen
      vue.accumulator = CLICK_PER_INTERVAL; // accumulated click to send to server
      total += CLICK_PER_INTERVAL + 1;

      // open mouth
      vue.open = true;
      setTimeout(() => {
        vue.open = false;
      }, 25);

      // Trigger auto save
      simulateClick();
      displayMessage(`Pops sent, total: ${Intl.NumberFormat('en-US').format(total)}`, 'color: #4e9a06');
    }

    // remove bot flag in cookie and refresh page if being detected as bot
    if (vue.bot) {
      displayMessage(' You\'ve been detected as bot. Clearing cookies and refreshing the page. ', 'background: #ef2929; color: #fff');
      setCookie('bot', '', -1);
      clearInterval(clickInterval);
      window.location.reload();
    }
  }, INTERVAL_MS);
})();
