var ERRORS_KEY = "signUpErrors";
HTTP.get(Meteor.absoluteUrl("/bin/prueba.js"), function(err,result) {
console.log(result.data);
});

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

        if (!username) {
            errors.username = "Username or email is required";
        }

        if (!password) {
            errors.password = "Password is required";
        }

        Session.set(ERRORS_KEY, errors);
        if (_.keys(errors).length) {
            alert(_.values(Session.get(ERRORS_KEY)));
            return false;
        }

        Meteor.loginWithPassword(username, password, function (error) {
            if (error) {
                alert(error.reason);
                return Session.set(ERRORS_KEY, {'none': error.reason});
            }
            /* if (!Meteor.user().emails[0].verified) {
             alert("Email not verified. Check your inbox folder.");
             return false;
             }*/
            Router.go('hello');
        });
        return false;
    },
    'submit .signupform': function (event, template) {
        var username = template.$('#sp-username').val();
        //var email = template.$('#sp-email').val();
        var password = template.$('#sp-password').val();
        var confirm = template.$('#sp-confirm-password').val();

        var errors = {};

        if (!username) {
            errors.username = "Username required";
        }

       /* if (!email) {
            errors.email = "Email required";
        }*/

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

        Accounts.createUser({
            username: username,
            //email: email,
            password: password
        }, function (error) {
            if (error) {
                alert(error.reason);
                return false;
            }

            alert("User created");
            console.log(Meteor.user());

            template.$('#sp-username').val("");
            template.$('#sp-password').val("");
            //template.$('#sp-email').val("");
            template.$('#sp-confirm-password').val("");

            template.$('#login-label').trigger('click');

            //Create default configuration
            /*var params = {};
            params.id = Meteor.userId();
            params.offlineminutes = 1; // min
            params.postboxtextsize = 11; // px
            params.devicestablerefreshspeed = 10; // sec
            params.messageboxrefreshspeed = 3; // sec
            params.autoscrolltextbox = false;
            params.timezonesetting = null;*/
            //Meteor.call('addConfig', params);
        });

        return false;
    }
    /*'click .log-sign': function (event, template) {
        //alert(event.target.id);
        //alert (JSON.stringify(template));
        if (event.target.id == "login-radio") {
            template.$('.signupform').hide();
            template.$('.loginform').show();
            //template.$('#form').css('height', "260px");
        } else if (event.target.id == "signup-radio") {
            template.$('.loginform').hide();
            template.$('.signupform').show();
            //template.$('#form').css('height', "357px");
        }
    }*/
})