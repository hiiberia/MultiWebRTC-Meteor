var ERRORS_KEY = "resetPassErrors";


Template.resetpass.helpers({
    errorClass: function (key) {
        return Session.get(ERRORS_KEY)[key] && 'has-error';
    },
    resetPassword: function(){
            return Session.get('resetPassword');
    }
});

/*if (Accounts._resetPasswordToken) {
    Session.set('resetPassword', Accounts._resetPasswordToken);
}*/

Template.resetpass.events({

    'submit .resetpassform': function (event, template) {
        event.preventDefault();
        var password = template.$('#rp-password').val();
        var confirm = template.$('#rp-confirm-password').val();

        alert(password);

        var errors = {};

        if (!password) {
            errors.password = "Password required";
        }

        if (confirm != password) {
            errors.confirm = "Please confirm your password";
        }

        Session.set(ERRORS_KEY, errors);
        if (_.keys(errors).length) {
            alert(_.values(Session.get(ERRORS_KEY)));
            return false;
        }

        //alert(Router.current().url);
        //Truco: el package accounts-password no reconocía Accounts._resetPasswordToken,
        //por tanto no se realizaba el resetPassword. El token se lee de la url actual en las dos siguientes líneas.
        var currentUrl = Router.current().url;
        var token = currentUrl.substring(currentUrl.lastIndexOf('/') + 1);
        //alert(token);
        //alert (Accounts._resetPasswordToken);
        //alert (this.params);
        Accounts.resetPassword(token, password, function (err) {
            if (err) {
                alert('Something went wrong resetPassword:'+ err.reason);
                return false;
            }
            else
            {
                alert('Your password has been changed. Welcome back!');
                //Session.set('resetPassword', null);
                Accounts._resetPasswordToken = ""; // To prevent future errors
                Router.go('joinRoom');
            }
        });

        return false;
    }

});
