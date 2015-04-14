var ERRORS_KEY = "loginErrors";

Template.login.created = function () {
    Session.set(ERRORS_KEY, {});

    // When the link in a verification mail is clicked, _verifyEmailToken has something
    // Workaround because of this issue: https://github.com/iron-meteor/iron-router/issues/3
    //alert ("Token de verify email:" + Accounts._verifyEmailToken);
    if (Accounts._verifyEmailToken) {
        console.log("_verifyEmailToken exists: ", Accounts._verifyEmailToken);
        Accounts.verifyEmail(Accounts._verifyEmailToken, function(err) {
            if (err != null) {
                if (err.message = 'Verify email link expired [403]') {
                    alert('email_expired');
                }
            } else {
                alert('email_confirmed');
                Accounts._verifyEmailToken = ""; // To prevent future errors
            }
        });
    }
};
/*Template.login.rendered = function () {
    // When the email link for reseting password is clicked, _resetPasswordToken has something
    // Workaround because of this issue: https://github.com/iron-meteor/iron-router/issues/3
    if (Accounts._resetPasswordToken) {
        Session.set('resetPassword', Accounts._resetPasswordToken);
    }
}*/

Template.login.helpers({
    errorClass: function (key) {
        return Session.get(ERRORS_KEY)[key] && 'has-error';
    }
});

Template.login.events({
    //Login users
    'submit .loginform': function (event, template) {
        event.preventDefault();
        var username = template.$('#username').val();
        var password = template.$('#password').val();

        var errors = {};

        //alert(JSON.parse(Assets.getText('pruebajson.json')));

        if (!username) {
            errors.username = "Username or email is required";
        }

        if (!password) {
            errors.password = "Password is required";
        }

       /* HTTP.get(Meteor.absoluteUrl("/lib/prueba.js"), function(err,result) {
            alert(JSON.stringify(result));
        });*/

        /*var prueba = JSON.parse(Assets.getText("prueba.js"));
        alert(prueba);*/

        Session.set(ERRORS_KEY, errors);
        if (_.keys(errors).length) {
            alert(_.values(Session.get(ERRORS_KEY)));
            return false;
        }

        Meteor.loginWithPassword(username, password, function (error) {
            if (error) {
                alert(error.reason);
                // EJEMPLO USO PACKAGE PROPIO Errors.throw(error.reason);
                return Session.set(ERRORS_KEY, {'none': error.reason});
            }
            /* if (!Meteor.user().emails[0].verified) {
             alert("Email not verified. Check your inbox folder.");
             return false;
             }*/
            Session.set('currentUserID', Meteor.userId());
            Session.set('currentUsername', Meteor.user().username);
            Router.go('joinRoom');
            //connectSignallingServer();
            registerUser();
        });
        return false;
    }
})