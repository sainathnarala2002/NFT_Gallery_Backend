const nodemailer = require('nodemailer')
var inlineBase64 = require('nodemailer-plugin-inline-base64')
const sendMailController = {}

sendMailController.sendMail = ( to, subject, data, callback) => {
    const transport = nodemailer.createTransport({ // smtpTransport
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: "naralasainath@gmail.com",
            pass: "vomizrzvvnakkqtd"
        }
    });
    const mailOptions = {
        from: "naralasainath@gmail.com",
        to: to,
        subject: subject,
        html: data
    }
    transport.use('compile', inlineBase64())
    transport.sendMail(mailOptions, (error, info) => {
        console.log("Inside send mail")
        if (error) {
            console.log("In Error ", error);
            callback(error, undefined)
        } else {
            console.log(to, "Message %s sent: %s", info.messageId, info.response);
            callback(undefined, "Success")
        }
    });
}


module.exports = sendMailController 