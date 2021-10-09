
const myDeskAccount = require('./my-desk-account');

function processEmail(email ) {
    const TAG = 'processEmail';
    console.log(email);
    try {
        return {
            html: email.html,
            text: email.text,
            subject: email.subject,
            messageId: email.messageId,
            priority: email.priority,
            from: email.from,
            to: email.to,
            date: email.date,
            receivedDate: email.receivedDate,
            uid: email.uid
        }
    } catch(ex) {
        console.log(TAG, ex);
        return null;
    }
}

function mustProcessTicket(emailObj) {
    if (myDeskAccount.checkSubject) {
        return (emailObj.subject.toLocaleLowerCase().indexOf( myDeskAccount.subjectMustContain.toLocaleLowerCase() ) > -1 );
    } else {
        return true;
    }
}

/**
 *  Don't create ticket - respond to open ticket
 */
function respondToOpenTicket(libraries, emailObj, subject) {
    const TAG = 'respondToOpenTicket';
    // get subject as array
    const ticketComponents = subject.split('|');
    // if ticket components based in the subject?
    if (ticketComponents && Array.isArray(ticketComponents) && ticketComponents.length > 1) {
            const ticketId = ticketComponents[ 1 ];
            if (ticketId) {
                let customer = libraries.myDeskAccount;
                if (customer) {
                    // get ticket by id
                    libraries.sb.getTicketById(libraries, ticketId, customer, ticket => {
                        if (ticket) {
                            // send message to group channel
                            libraries.sb.sendMessageToGroupChannel(libraries, customer, emailObj, ticket.channelUrl, emailObj.text, response => {
                                console.log(TAG, 'Response after sending message to group channel:');
                                console.log(TAG, response);
                            })
                        } else {
                            console.log(TAG, 'TICKED BY ID NOT FOUND. OPERATION INTERRUPTED.');
                        }
                    })
                } else {
                    console.log(TAG, 'TICKET RECEIVED TO RESPOND BUT CUSTOMER WAS NOT FOUND! OPERATION INTERRUPTED.')
                }

            } else {
                console.log(TAG, 'NO TICKET ID IN THE SUBJECT! OPERATION INTERRUPTED.')
            }
    } else {
        console.log(TAG, 'INVALID TICKET COMPONENTS! OPERATION INTERRUPTED.');
    }
}

module.exports = { 
    processEmail, 
    mustProcessTicket, 
    respondToOpenTicket 
};
