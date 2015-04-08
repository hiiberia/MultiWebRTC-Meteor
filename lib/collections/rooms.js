
//Declare as a global variable!
Rooms = new Mongo.Collection('rooms');

Meteor.methods({
    addRoom: function (name) {
        // Make sure the user is logged in before inserting a room
        if (! Meteor.userId()) {
         throw new Meteor.Error("not-authorized");
        }
        //alert("se añade una sala!");
            Rooms.insert({
                roomName: name,
                createdAt: new Date(),
                owner: Meteor.userId(),
                usernames: [Meteor.user().username]
            });
    },
    updateUsernamesRoom: function(name)
    {
        Rooms.update({roomName: name},{$addToSet: {usernames: Meteor.user().username} })

    },
    deleteRoomName: function (roomName) {
        var room = Rooms.findOne({roomName: roomName});
        /*if (task.private && task.owner !== Meteor.userId()) {
            // If the task is private, make sure only the owner can delete it
            throw new Meteor.Error("not-authorized");
        }*/

        Rooms.remove(room);
    },
    deleteUsernamefromRoom: function (roomName)
    {
        //Rooms.findAndModify({roomName: name},{$pull: {usernames: Meteor.user().username} });
        Rooms.update({roomName: roomName},{$pull: {usernames: Meteor.user().username} });
    }
});