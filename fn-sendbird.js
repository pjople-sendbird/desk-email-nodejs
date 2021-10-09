/**
 * THESE ARE FUNCTIONS SENDING REQUESTS TO SENDBIRD DESK API
 * AND ALSO TO SENDBIRD PLATFORM API.
 * 
 * - getTicketById(...)
 * 
 * - getTicketByChannelUrl(...)
 * 
 * - getCustomerById(...)
 * 
 * - createSendbirdUser(...)
 * 
 * - createCustomer(...)
 * 
 * - sendMessageToGroupChannel(...)
 * 
 * - createTicket(...)
 * 
 */


function getTicketById(libraries, ticketId, customer, callback) {
    const TAG = 'getTicketById';
    // libraries
    const axios = libraries.axios;
    // customer sb info
    const appId = customer.sb.appId;
    const deskToken = customer.sb.deskToken;
    // endpoint
    const ENDPOINT = `https://desk-api-${appId}.sendbird.com/platform/v1`;
    // send request
    axios.get(ENDPOINT + '/tickets/' + ticketId, {
        headers: {
            "SENDBIRDDESKAPITOKEN": deskToken,
            'Content-Type': 'application/json'
        }
    }).then(response => {
        callback(response.data);
    }).catch(error => {
        console.log(TAG, error.message);
        callback(null);
    });
}

function getTicketByChannelUrl(libraries, channelUrl, customer, callback) {
    const TAG = 'getTicketByChannelUrl';
    // libraries
    const axios = libraries.axios;
    // customer sb info
    const appId = customer.sb.appId;
    const deskToken = customer.sb.deskToken;
    // endpoint
    const ENDPOINT = `https://desk-api-${appId}.sendbird.com/platform/v1`;
    // send request
    axios.get(ENDPOINT + '/tickets/?channel_url=' + channelUrl, {
        headers: {
            "SENDBIRDDESKAPITOKEN": deskToken,
            'Content-Type': 'application/json'
        }
    }).then(response => {
        const data = response.data
        if (data.count == 0) {
            callback(null);
        } else {
            callback(data.results[0]);
        }
    }).catch(error => {
        console.log(TAG, error.message);
        callback(null);
    });
}

function getCustomerById(libraries, customer, emailObj, callback) {
    const TAG = 'getCustomerById';
    // libraries
    const axios = libraries.axios;
    // email sender info
    const customerId = emailObj.from[0].address;
    // customer sb info
    const appId = customer.sb.appId;
    const deskToken = customer.sb.deskToken;
    // endpoint
    const ENDPOINT = `https://desk-api-${appId}.sendbird.com/platform/v1`;
    // send request
    axios.get(ENDPOINT + '/customers/?sendbird_id=' + encodeURIComponent(customerId), {
        headers: {
            "SENDBIRDDESKAPITOKEN": deskToken,
            'Content-Type': 'application/json'
        }
    }).then(response => {
        const data = response.data
        if (data.count == 0) {
            callback(null);
        } else {
            callback(data.results[0]);
        }
    }).catch(error => {
        console.log(TAG, error.message);
        callback(null);
    });
}

/**
 * Creates a Sendbird USER_ID
 */
function createSendbirdUser(libraries, customer, emailObj, callback) {
    const TAG = 'createSendbirdUser';
    // libraries
    const axios = libraries.axios;
    // email sender info
    const customerId = emailObj.from[0].address;
    const customerName = emailObj.from[0].name;
    // customer sb info
    const appId = customer.sb.appId;
    const apiToken = customer.sb.apiToken;
    // endpoint
    const ENDPOINT = `https://api-${appId}.sendbird.com/v3`;
    // send request
    axios.post(ENDPOINT + '/users', {
        user_id: customerId,
        nickname: customerName,
        profile_url: ""
    }, {
        headers: {
            "Api-Token": apiToken,
            'Content-Type': 'application/json'
        }
    }).then(response => {
        const data = response.data
        callback(data);
    }).catch(error => {
        console.log(TAG, error.message);
        callback(null);
    });
}

/**
 * Create Desk Customer
 */
function createCustomer(libraries, customer, emailObj, callback) {
    const TAG = 'createCustomer';
    // libraries
    const axios = libraries.axios;
    // email sender info
    const customerId = emailObj.from[0].address;
    // customer sb info
    const appId = customer.sb.appId;
    const deskToken = customer.sb.deskToken;
    // endpoint
    const ENDPOINT = `https://desk-api-${appId}.sendbird.com/platform/v1`;
    // send request
    axios.post(ENDPOINT + '/customers', {
        sendbirdId: customerId
    }, {
        headers: {
            "SENDBIRDDESKAPITOKEN": deskToken,
            'Content-Type': 'application/json'
        }
    }).then(response => {
        const data = response.data
        callback(data);
    }).catch(error => {
        console.log(TAG, error.message);
        callback(null);
    });
}

/**
 * Create ticket using Desl Platform API
 * But before, I need to check if a user_id and a desk customer 
 * exists. If not, I create them.
 */
function createTicket(libraries, customer, emailObj, callback) {
    getCustomerById(libraries, customer, emailObj, customerInfo => {
        if (!customerInfo) {
            // create sendbird user_id
            createSendbirdUser(libraries, customer, emailObj, () => {
                createCustomer(libraries, customer, emailObj, newCustomer => {
                    createTicketStep2(libraries, customer, emailObj, newCustomer, callback);
                })
            })
        } else {
            // customer already exists
            createTicketStep2(libraries, customer, emailObj, customerInfo, callback);
        }
    })
}

/**
 * At this stage I know for sure that:
 * - Customer exists in sendbird and the ID is the email of the sender.
 * - All the other data is valid.
 */
function createTicketStep2(libraries, customer, emailObj, sbCustomer, callback) {
    const TAG = 'createTicketStep2';
    // libraries
    const axios = libraries.axios;
    // customer sb data    
    const appId = customer.sb.appId;
    const deskToken = customer.sb.deskToken;
    // endpoint
    const ENDPOINT = `https://desk-api-${appId}.sendbird.com/platform/v1`;
    // ticket fields
    const channelName = '[Desk-Email] ' + emailObj.subject;
    // Create a Group with key "EMAIL" to receive tickets from Email
    const groupKey = 'EMAIL';   
    // ticket custom fields (very simple)
    const customFields = JSON.stringify({
        fromEmail: emailObj.from[0].address,
        fromName: emailObj.from[0].name,
    })
    // ticket priority (very simple)
    const priority = emailObj.priority == 'normal' ? 'MEDIUM' : 'HIGH';
    // send request
    axios.post(ENDPOINT + '/tickets', {
        channelName,
        customerId: sbCustomer.id,
        groupKey,
        customFields,
        priority
    }, {
        headers: {
            "SENDBIRDDESKAPITOKEN": deskToken,
            'Content-Type': 'application/json'
        }
    }).then(response => {
        const data = response.data
        sendMessageToGroupChannel(libraries, customer, emailObj, data.channelUrl, emailObj.subject + ' - ' + emailObj.text, () => {
            callback(data);
        })
    }).catch(error => {
        console.log(TAG, error.message);
        callback(null);
    });
}

/**
 * Once the ticket is created using Desk Platform API,
 * I send a message to the ticket's group channel
 */
 function sendMessageToGroupChannel(libraries, customer, emailObj, groupChannel, text, callback) {
    const TAG = 'sendMessageToGroupChannel';
    // libraries
    const axios = libraries.axios;
    // email sender info
    const customerId = emailObj.from[0].address;
    // customer sb info
    const appId = customer.sb.appId;
    const apiToken = customer.sb.apiToken;
    // endpoint
    const ENDPOINT = `https://api-${appId}.sendbird.com/v3`;
    // send request
    axios.post(ENDPOINT + '/group_channels/' + groupChannel + '/messages', {
        message_type: 'MESG',
        user_id: customerId,
        message: text
    }, {
        headers: {
            "Api-Token": apiToken,
            'Content-Type': 'application/json'
        }
    }).then(response => {
        const data = response.data
        callback(data);
    }).catch(error => {
        console.log(TAG, error.message);
        callback(null);
    });
}


module.exports = { 
    getCustomerById, 
    createTicket, 
    getTicketByChannelUrl, 
    getTicketById, 
    sendMessageToGroupChannel 
};

