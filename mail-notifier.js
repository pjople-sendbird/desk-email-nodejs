/**
 * https://github.com/jcreigno/nodejs-mail-notifier
 * 
 * Make "less secure app" to true
 * https://myaccount.google.com/lesssecureapps?rapt=AEjHL4OSoB8uVJZCAZIgbDDQOz0f6407EzQ9GpLhMQlSNpe42HGlH97Wg0Wi4n5wU-rrwfCoLHC388jXkCTNPfFFT_X4IV20SA
 */

var notifier = require('mail-notifier');
var BUSINESS = require('./fn-business');
var SB = require('./fn-sendbird');
var DESK = require('./fn-desk');
const axios = require('axios');
var config = require('./config');
const myDeskAccount = require('./my-desk-account');

var imap = {
      user: config.email,
      password: config.password,
      host: "imap.gmail.com",
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
};

function emailArrives(mail) {
      const TAG = 'emailArrives';
      // libraries
      const libraries = {
            config,
            business: BUSINESS,
            sb: SB,
            axios,
            myDeskAccount
      }
      // email
      const email = BUSINESS.processEmail(mail);
      // process
      if (email) {
            // get subject
            const subject = email.subject;
            if (subject.indexOf('[Desk-Email] |') > -1) {
                  // respond to opened ticket
                  BUSINESS.respondToOpenTicket(libraries, email, subject);
            } else {
                  // new ticket
                  if (BUSINESS.mustProcessTicket(email)) {
                        console.log(TAG, 'Email received and must process to Desk!');
                        DESK.sendTicket(libraries, email);
                  } else {
                        console.log(TAG, 'Email received but not to process for Desk');
                  }
            }
      } else {
            console.log(TAG, 'UNABLE TO PROCESS MESSAGE. SEND AN EMAIL WARNING EVERYONE!');
      }
}

notifier(imap).on('mail', function (mail) {
      emailArrives(mail);
}).start();

