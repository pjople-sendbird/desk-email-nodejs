

function sendTicket(libraries, emailObj) {
    const TAG = 'sendTicket';
    const customer = libraries.myDeskAccount;
    if (customer) {
        libraries.sb.createTicket(libraries, customer, emailObj, response => {
            console.log(TAG, 'Ticket created from Desk');
        })
    } else {
        console.log(TAG, 'MY DESK INFORMATION IS NOT DEFINED!');
    }
}

module.exports = { 
    sendTicket 
};
