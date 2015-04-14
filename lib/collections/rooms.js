
//Declared as a global variable!
Rooms = new Mongo.Collection('rooms');

Meteor.methods({
    addRoom: function (roomName,owner,username) {
        // Make sure the user is logged in before inserting a room
        /*if (! Meteor.userId()) {
         throw new Meteor.Error("not-authorized");
        }*/
        //alert(roomName);
        //alert(owner);
        //alert (username);
            Rooms.insert({
                roomName: roomName,
                createdAt: new Date(),
                owner: owner,
                usernames: [username]
            });
    },
    updateUsernamesRoom: function(name, username)
    {
        Rooms.update({roomName: name},{$addToSet: {usernames: username} })

    },
    deleteRoomName: function (roomName) {
        var room = Rooms.findOne({roomName: roomName});
        /*if (task.private && task.owner !== Meteor.userId()) {
            // If the task is private, make sure only the owner can delete it
            throw new Meteor.Error("not-authorized");
        }*/

        Rooms.remove(room);
    },
    deleteUsernamefromRoom: function (roomName, username)
    {
        //Rooms.findAndModify({roomName: name},{$pull: {usernames: Meteor.user().username} });
        Rooms.update({roomName: roomName},{$pull: {usernames: username} });
    }
});