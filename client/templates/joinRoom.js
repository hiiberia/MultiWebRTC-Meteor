
var ERRORS_KEY = "joinRoomErrors";

Template.joinRoom.helpers({
    //rooms: rooms
    rooms: function() {
       // alert (JSON.stringify(Rooms.find({}, {sort: {createdAt: -1}})));
        return Rooms.find({}, {sort: {createdAt: -1}});
    },
    errorClass: function (key) {
        return Session.get(ERRORS_KEY)[key] && 'has-error';
    }
});

Template.joinRoom.events({
    'submit .createroomform': function (event,template) {
        // This function is called when the new room form is submitted
        event.preventDefault();
        //alert ("Current User ID " +  Session.get("currentUserID"));
        //alert ("Current Username " +  Session.get("currentUsername"));

        var roomName = template.$('#newroomname').val();
        //alert(roomName);

        var errors = {};

        if (!roomName) {
            errors.roomname = "Room name is required";
        }

        Session.set(ERRORS_KEY, errors);
        if (_.keys(errors).length) {
            alert(_.values(Session.get(ERRORS_KEY)));
            return false;
        }
        //Se comprueba que no existe ya una sala con ese nombre
        var room = Rooms.findOne({roomName: roomName});
        //alert (room);
        if ((typeof room == "null")||(typeof room == 'undefined'))
        {
            Meteor.call("addRoom", roomName, Session.get("currentUserID"), Session.get ("currentUsername"));
            Router.go('/room/'+roomName);
        }
        else
        {
            alert ("Room already exists!");
        }

        return false;
    },
    "click .roomrow": function () {
        Meteor.call('updateUsernamesRoom',this.roomName,Session.get ("currentUsername"));
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