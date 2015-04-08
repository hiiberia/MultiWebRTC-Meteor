var ERRORS_KEY = "signUpErrors";

Template.room.helpers({
    errorClass: function (key) {
        return Session.get(ERRORS_KEY)[key] && 'has-error';
    }
});

Template.room.rendered = function(){
    this.$('#buttonQuit').popup();
};

Template.room.events({
    'click #buttonQuit': function (event, template) {
        alert ("Se pulsa quit!");
        var currentUrl = Router.current().url;
        var roomName = currentUrl.substring(currentUrl.lastIndexOf('/') + 1);
        Meteor.call('deleteUsernamefromRoom', roomName );
        /*template.$(event.currentTarget).popup({
            //title: this.name,
            //content: this.description,
            on: 'click'
        });*/
        Router.go('joinRoom');
        return false;
    }
});