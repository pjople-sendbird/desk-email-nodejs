
const express = require('express');
const app = express();
const port = 3000;

// body parser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json

// your desk accounts
const myDeskAccount = require('./my-desk-account');

// config
const config = require('./config');

// sendbird
const sb = require('./fn-sendbird');

// axios
const axios = require('axios');

// nodemailer
var nodemailer = require('nodemailer');
var emailSender = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email,
      pass: config.password
    }
});

// libraries
const libraries = {
    myDeskAccount,
    config,
    sb,
    axios,
    emailSender
}

app.get('/', (req, res) => {
    res.send('Sendbird Desk tickets by Email');
})

/**
 * RECEIVE WEBHOOKS FROM CHAT
 */
app.post('/webhooks/chat', async (req, res) => {
    const analyzeWebhookchat = require('./server-analyze-webhook-chat');
    analyzeWebhookchat.process(libraries, req.body, () => {
        console.log('WEBHOOK FROM CHAT PROCESSED');
    });
    res.send('OK');
})

app.listen(port, () => {
    console.log(`Example app listening at port ${port}`)
})
