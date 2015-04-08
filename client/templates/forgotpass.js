// Do not forget to add the email package: $ meteor add email
// and to configure the SMTP: https://gist.github.com/LeCoupa/9879221

var ERRORS_KEY = "forgotPassErrors";


Template.forgotpass.helpers({
    errorClass: function (key) {
        return Session.get(ERRORS_KEY)[key] && 'has-error';
    }
});

Template.login.rendered = function () {
    // When the email link for reseting password is clicked, _resetPasswordToken has something
    // Workaround because of this issue: https://github.com/iron-meteor/iron-router/issues/3
    if (Accounts._resetPasswordToken) {
        $('.forgotpassform').hide();
        //$('.log-sign').hide();
        $('.resetpassform').show();
    }
}


if (Accounts._resetPasswordToken) {
    Session.set('resetPassword', Accounts._resetPasswordToken);
}

/*Template.forgotpass.rendered = function () {
    // When the email link for reseting password is clicked, _resetPasswordToken has something
    // Workaround because of this issue: https://github.com/iron-meteor/iron-router/issues/3
    if (Accounts._resetPasswordToken) {
        Session.set('resetPassword', Accounts._resetPasswordToken);
    }
}*/

Template.forgotpass.events({
    'submit .forgotpassform': function (event, template) {
        alert ("botón forgot pass!");
        event.preventDefault();
        var email = template.$('#fp-email').val();
        //alert (email);
        // This triggers a call to sendResetPasswordEmail
       // var btnSend = template.$('#send_forgot_password').button('loading');
        /*Accounts.forgotPassword({email: email}, function (err) {
            if (err) {
                alert(err.reason);
                btnSend.button('reset');
                return false;
            }

            setTimeout(function () {
                btnSend.button('complete');
                btnSend.prop('disabled', true);
            }, 3000); // Just to give feedback to user
        });*/

        Accounts.forgotPassword({email: email}, function (err) {
            if (err) {
                if (err.message === 'User not found [403]') {
                    alert ('This email does not exist.');
                } else {
                    alert ('We are sorry but something went wrong.');
                }
            } else {
                alert ('Email Sent. Check your mailbox.');
            }
        });

        return false;
    }


});
