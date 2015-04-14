Meteor.startup(function () {
    // code to run on server at startup
    // Configuration of smtp to send emails - DO IT WITH AWS!

    // Configuración de safekids
   smtp = {
        /*username: 'AKIAI53P3V462XOXIE2Q',
         password: 'AtBljcpM+s5SxpHJDvCLggVxORoI16W+mvblxssfEFdQ',
         server: 'email-smtp.eu-west-1.amazonaws.com',
         port: 587*/
        username: 'soporte@safekids.es',
        password: 'cambiarpass',
        server: 'correo.hi-iberia.es',
        port: 465
    }

    process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;

    Accounts.emailTemplates.resetPassword.text = function (user, url) {
        var url = url.replace('#/', '');
        //var id = url.substring(url.lastIndexOf('/') + 1);
        return "Hola, \n\nHaga click en el link de abajo para reestablecer su contraseña: "+ url;
    }

    Accounts.emailTemplates.from = "Multi-Hiiberia <soporte@hi-iberia.es>";
    Accounts.emailTemplates.siteName = "MultiHIIberia";
    Accounts.emailTemplates.verifyEmail.subject = function (user) {
        return "Confirme su dirección de correo electrónico, " + user.username;
    }
    Accounts.emailTemplates.verifyEmail.text = function (user, url) {
        return "Hola, \n\nHaga click en el siguiente link para verificar su correo electrónico: " + url;
    }

    // Global Account configuration - send verification email when new sign ups
    Accounts.config({
        sendVerificationEmail: true
    });

    // Add a custom field to user's account to know if its device has been connected
    Accounts.onCreateUser(function (options, user) {
        user.deviceConnected = false;
        return user;
    });

    /*$(window).bind('beforeunload', function() {
        closingWindow();

        // have to return null, unless you want a chrome popup alert
        return null;

        // have to return null, unless you want a chrome popup alert
        //return 'Are you sure you want to leave your Vonvo?';
    });

    closingWindow = function(){
         alert('closingWindow');
         Meteor.call('deleteUsernamefromRoom', 'room');
    }*/


});