/**
 * Created by neil on 4/11/2017.
 */

// process.env.MAIL_URL = "smtp://postmaster%40sandbox6415f6b60f8747cea4ae864ce333300d.mailgun.org:7eb1393002ee08f42b6b5df0b21d7d2b@smtp.mail.gun.org:587";
process.env.MAIL_URL="smtp://alloyUH%40gmail.com:5tgb^YHNalloy@smtp.gmail.com:465";

Meteor.methods({
  sendEmail(to, from, subject, text) {
    // Make sure that all arguments are strings.
    check([to, from, subject, text], [String]);
    // Let other method calls from the same client start running, without
    // waiting for the email sending to complete.
    this.unblock();
    Email.send({ to, from, subject, text });
  }
});

Meteor.methods({
  sendHtmlEmail(to, from, subject, html) {
    // Make sure that all arguments are strings.
    check([to, from, subject, html], [String]);
    // Let other method calls from the same client start running, without
    // waiting for the email sending to complete.
    this.unblock();
    Email.send({ to, from, subject, html });
  }
});
