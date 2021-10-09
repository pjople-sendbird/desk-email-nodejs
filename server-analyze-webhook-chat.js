
function process(libraries, body, callback) {
    // tag
    const TAG = 'server-analyze-webhook-chat';
    // validate
    if (!body) {
        console.log(TAG, 'NO BODY!');
        callback(null);
        return;
    }
    // get my Sendbird Desk information
    if (!libraries.myDeskAccount) {
        console.log(TAG, 'UNABLE TO FIND SENDBIRD DESK INFORMATION');
        callback(null);
        return;
    }
    // sendbird functions
    const sb = libraries.sb;
    // check what's this webhook about
    const category = body.category;
    // message received from agent
    if (category == 'group_channel:message_send') {
        const customer = libraries.myDeskAccount;
        // get channel from sendbird
        sb.getTicketByChannelUrl(libraries, body.channel.channel_url, customer, ticket => {
            // ticket exists?
            if (!ticket) {
                console.log(TAG, 'TICKET DOES NOT EXISTS');
                return
            }
            // is a ticket from email? IMPORTANT: Subject must contain the string: [Desk-Email]
            if (ticket.channelName.indexOf('[Desk-Email]') == -1) {
                console.log(TAG, 'NOT AN EMAIL TICKET');
                return;
            }
            // send a response email
            const respondToEmail = ticket.customer.sendbirdId;
            // information about the message to send
            const message = ticket.lastMessage + customer.ticket.instructionForEmailFooter;
            const lastMessageSender = ticket.lastMessageSender; // 'AGENT'
            const agentEmail = ticket.recentAssignment.agent.email;
            const agentName = ticket.recentAssignment.agent.displayName;
            // responder does not exist
            if (!respondToEmail) {
                console.log(TAG, 'USER ID FOR AGENT DOES NOT EXISTS');
                return
            }
            // send email if the sender is AGENT or Desk Admin ADMIN
            if (lastMessageSender == 'AGENT' || lastMessageSender == 'ADMIN') {
                var mailOptions = {
                    from: agentEmail,
                    to: respondToEmail,
                    subject: 'Re: [Desk-Email] |' + ticket.id + '| ' + 'Response from Agent ' + agentName,
                    html: message
                };
                libraries.emailSender.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(TAG, error);
                    } else {
                        console.log(TAG, 'Email sent: ' + info.response);
                    }
                });
            } else {
                console.log(TAG, 'Email not sent! LastMessageSender is not AGENT or ADMIN');
            }
        })
    }
}

module.exports = { process }
