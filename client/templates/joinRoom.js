
var ERRORS_KEY = "joinRoomErrors";

Template.joinRoom.helpers({
    //rooms: rooms
    rooms: function() { return Rooms.find({}, {sort: {createdAt: -1}}); },
    errorClass: function (key) {
        return Session.get(ERRORS_KEY)[key] && 'has-error';
    }
});

Template.joinRoom.events({
    'submit .createroomform': function (event,template) {
        // This function is called when the new room form is submitted
        event.preventDefault();
        //alert("Se pulsa el botón para crear nueva sala");
        //alert(event);
        //alert("prueba");
        //alert(JSON.stringify(event));
        //alert(JSON.stringify(template));
        //event.preventDefault();
        //var roomNamebis = event.target.text.value;
        var roomName = template.$('#newroomname').val();
        alert(roomName);

        var errors = {};

        if (!roomName) {
            errors.roomname = "Room name is required";
        }

        Session.set(ERRORS_KEY, errors);
        if (_.keys(errors).length) {
            alert(_.values(Session.get(ERRORS_KEY)));
            return false;
        }
        var room = Rooms.findOne({roomName: roomName});
        if (typeof room == "undefined")
        {
            Meteor.call("addRoom", roomName);
            Router.go('/room/'+roomName);
        }
        else
        {
            alert ("Room already exists!");
        }



        //Meteor.call("addRoom", roomName);

        //Router.go('/room/'+roomName);
        // Prevent default form submit
        return false;
    },
    "click .roomrow": function () {
        //console.log("You Select Room Row " + this.roomName);
        //alert(this.usernames + ' ' + this.roomName);
        Meteor.call('updateUsernamesRoom',this.roomName);
        Router.go('/room/'+this.roomName);
    },
    "click #signOut": function (){
        Meteor.logout(function() {
           alert ('Hasta pronto!');
        });

        Router.go('login');
        return false;
    }
})