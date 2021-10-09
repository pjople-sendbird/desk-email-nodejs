
const myDeskAccount = {
    email: 'YOUR EMAIL@gmail.com',
    checkSubject: true,
    subjectMustContain: 'Desk',
    sb: {
        appId: 'YOUR SENDBIRD APPLICATION ID WITH DESK SUPPORT',
        deskToken: 'YOUR DESK TOKEN',
        apiToken: 'YOUR API-TOKEN',
        deskEnabled: true
    },
    ticket: {
        welcomeMessage: 'Ticket created from Email',
        instructionForEmailFooter: `<br><br><i>Please respond to this message without changing the subject.</i>`
    }
};
module.exports = myDeskAccount;
