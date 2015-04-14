var ERRORS_KEY = "roomErrors";


//*****************código para que al cerrar ventana, se salga de la sala*****************
$(window).bind('beforeunload', function() {
    closingWindow();

    Meteor.logout();
    // have to return null, unless you want a chrome popup alert
    return null;

    // have to return null, unless you want a chrome popup alert
    //return 'Are you sure you want to leave your Vonvo?';
});
//*****************************************************************************************

/*$(window).bind('unload', function() {
    closingWindow();

    Meteor.logout();
    // have to return null, unless you want a chrome popup alert
    return null;

    // have to return null, unless you want a chrome popup alert
    //return 'Are you sure you want to leave your Vonvo?';
});*/

closingWindow = function(){
    alert('closingWindow');
    var currentUrl = Router.current().url;
    var roomName = currentUrl.substring(currentUrl.lastIndexOf('/') + 1);
    Meteor.call('deleteUsernamefromRoom', roomName, Meteor.user().username);
}

Template.room.helpers({
    errorClass: function (key) {
        return Session.get(ERRORS_KEY)[key] && 'has-error';
    }
});

Template.room.events({
    'click #buttonQuit': function (event, template) {
        alert ("Se pulsa quit!");
        var currentUrl = Router.current().url;
        var roomName = currentUrl.substring(currentUrl.lastIndexOf('/') + 1);
        alert (roomName);
        alert(Session.get('currentUsername'));
        Meteor.call('deleteUsernamefromRoom', roomName, Session.get('currentUsername') );
        /*template.$(event.currentTarget).popup({
            //title: this.name,
            //content: this.description,
            on: 'click'
        });*/
        parent.history.back();
        Router.go('joinRoom');
        return false;
    },
    'click #startvideo': function() {
        alert("click getlocalvideo");
        //var localvideo = document.getElementById('local-video');
        //initWebrtc();
        getLocalMedia(function(){
            var localvideo = document.getElementById('local-video');
            attachMediaStream(localvideo, localMediaStream);
        });
    },
    'click #buttonOpenChat': function (event, template) {
        alert ("Aún no implementado!");
        //Errors.throw("Aún no implementado");
    },
    'click #sendFile': function (event, template) {
        alert ("Aún no implementado!");
    },
    'click #buttonShareDesktop': function (event, template) {
        alert ("Aún no implementado!");
    },
    'click #buttonAutoFocus': function (event, template) {
        alert ("Aún no implementado!");
    },
    'click #buttonMute': function (event, template) {
        alert ("Aún no implementado!");
    },
    'click #buttonVolumeControl': function (event, template) {
        alert ("Aún no implementado!");
    },
    'click #buttonPause': function (event, template) {
        alert ("Aún no implementado!");
    },
    'click #buttonRecord': function (event, template) {
        alert ("Aún no implementado!");
    },
    'click #buttonResize': function (event, template) {
        alert ("Aún no implementado!");
    }
});