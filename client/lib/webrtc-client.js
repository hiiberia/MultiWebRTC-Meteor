// Signalling node IP
//const SIGNALLING_NODE = '192.168.1.30';
const SIGNALLING_NODE = '54.93.212.145:1337';
//const SIGNALLING_NODE = '192.168.11.120';

// Default TURN server
const DEFAULT_TURN_SERVER = '54.209.50.224';//'numb.viagenie.ca';

// Default STUN server
const DEFAULT_STUN_SERVER = '54.209.50.224';//'stun.l.google.com:19302';

// Default TURN server user
//const DEFAULT_TURN_SERVER_USER = 'jdelpeso@hi-iberia.es';
const DEFAULT_TURN_SERVER_USER = 'webrtcHi';

// Default TURN server password
//const DEFAULT_TURN_SERVER_PASSWORD = 'webrtchi';
const DEFAULT_TURN_SERVER_PASSWORD = 'Hi1930Webrtc';

// ICE configuration
peerConnectionConfiguration = {
    'iceServers' : [ {
        'url' : 'stun:' + DEFAULT_STUN_SERVER
    }, {
        'url' : 'turn:' + DEFAULT_TURN_SERVER,
        'username' : DEFAULT_TURN_SERVER_USER,
        'credential' : DEFAULT_TURN_SERVER_PASSWORD
    } ]
};

//Data channel options
dataChannelOptions = {
    ordered: false, // do not guarantee order
    maxRetransmitTime: 3000 // in milliseconds
};

shareDesktopFlag = false;

localMediaStream = null;

// Only audio selection.
useOnlyAudio = false;

// ---------- Audio and video constraints --------------------------------
const ONLY_AUDIO_MEDIA_CONSTRAINTS = {
    audio : true,
    video : false
};

// Media constraints for video conference.
const VIDEO_MEDIA_CONSTRAINTS = {
    audio : true,
    video : {
        mandatory : {
            maxWidth: 1280,
            maxHeight: 720
        },
        optional : []
    }
};


// Media constraints for screen sharing.
const SCREEN_SHARING_MEDIA_CONSTRAINTS_CHROME = {
    audio : false,
    video: {
        mandatory: {
            chromeMediaSource: 'screen',
            maxWidth: 1280,
            maxHeight: 720
        },
        optional: []
    }
};

const SCREEN_SHARING_MEDIA_CONSTRAINTS_FIREFOX = {
    audio : false,
    video: {mediaSource: 'window' || 'screen'}
};

var SCREEN_SHARING_MEDIA_CONSTRAINTS = null;

if (navigator.webkitGetUserMedia) {//navigator.webkitGetUserMedia
    console.log('*** Browser is Chrome');  // Debug
    SCREEN_SHARING_MEDIA_CONSTRAINTS = SCREEN_SHARING_MEDIA_CONSTRAINTS_CHROME;
} else if (navigator.mozGetUserMedia) {
    console.log('*** Browser is Firefox');  // Debug
    SCREEN_SHARING_MEDIA_CONSTRAINTS = SCREEN_SHARING_MEDIA_CONSTRAINTS_FIREFOX;
}

const SDP_CONSTRAINTS_ONLY_AUDIO = {
    mandatory : {
        OfferToReceiveAudio : true,
        OfferToReceiveVideo : false
    }
};

const SDP_CONSTRAINTS_VIDEO = {
    mandatory : {
        OfferToReceiveAudio : true,
        OfferToReceiveVideo : true
    }
};


// Media constraints
var userMediaConstraints = null;
var sdpConstraints = null;

// For interop with FireFox. Enable DTLS in peerConnection ctor.
var peerConnectionConstraints = {
    'optional' : [ {'DtlsSrtpKeyAgreement' : true}]
    //'optional' : [ {'DtlsSrtpKeyAgreement' : true},
    //				{RtpDataChannels: true} ]
};


var dataChannel = null;

// ----------- Signalling message names ----------------------------------
const INVITE = 'invite';
const SESSION_PROGRESS = 'sessionProgress'; // ~ 183 (Session Progress)
const OK = 'ok'; // ~ 200 (OK)
const BYE = 'bye';
const ACK = 'ack';
const ICE_CANDIDATE = 'iceCandidate';
const RINGING = 'ringing'; // ~ 180 (Ringing)
const DECLINE = 'decline'; // ~ 603 (Decline)
const BUSY = 'busy'; // ~ 600 (Busy Everywhere)
const UPDATE_FLAG_SHARESCREEN = 'updateShareScreen';
const USER_REGISTERED = 'userRegistered';
// -----------------------------------------------------------------------


// ----------- DOM elements ----------------------------------------------
remoteVideoID = "remote_video";
remoteVideo = null;
// -----------------------------------------------------------------------

// Signalling socket from socket.io
var signallingSocket = null;


// ----------- Call state ------------------------------------------------
const STATE_IDLE = 'idle'; // ~ BCSM O_NULL
const STATE_INITIATING = 'initiating'; // ~ BCSM O Analysis, Routing and Alerting
const STATE_INITIATING_T = 'initiating_t'; // ~ BCSM T Terminanting Call Handling
const STATE_ESTABLISHED = 'established'; // ~ BCSM O_ACTIVE / T_ACTIVE
const STATE_TERMINATING = 'terminating';
const STATE_TERMINATED = 'terminated'; // ~ BCSM T Terminanting Call Handling
const STATE_RINGING = 'ringing';
// -----------------------------------------------------------------------

// ------------ Recording ------------------------------------------------
var recordOnlyAudio = false;

// Recording states
const RECORDING_STATE_STOPPED = 'recordingStateStopped';
const RECORDING_STATE_STARTED = 'recordingStateStarted';

var recordingState = RECORDING_STATE_STOPPED;

const RECORDING_OPTIONS_VIDEO = {
    type : 'video',
    video : {
        width : 320,
        height : 240
    },
    canvas : {
        width : 320,
        height : 240
    }
};

const RECORDING_OPTIONS_ONLY_AUDIO = null;

var localVideoRecordRTC = null;
var localAudioRecordRTC = null;
var remoteVideoRecordRTC = null;
var remoteAudioRecordRTC = null;
// -----------------------------------------------------------------------



// --------------- Audio content -----------------------------------------
// Audio context
var audioContext = createAudioContext();

// Ring player
if(audioContext != null){
    var ringPlayer = new RingPlayer(audioContext);
}
// -----------------------------------------------------------------------



callsInfo = {};
var callsInfoScreen = {};

peer_type = 2;

// Group information
var currentGroupId = "";

// User currently shown in main remote view panel,
// i.e. currently focused remote user.
var userInMainRemoteView = null;
// User information
var currentUserId = "";
var currentUserName = "";

mediaServerId = 'mediaserver';


// FUNCIONES --------------------------------------------------------------

/**
 *	Get peerType
 **/
function getPeerType(){
    return peer_type;
}

/**
 *	Set peerType
 **/
setPeerType = function(type){
    peer_type = type;
}

/**
 * Get groupId from current request
 *
 */
function getCurrentGroupId() {
    return currentGroupId;
}

/**
 * Set groupId from current request
 *
 */
setCurrentGroupId = function(groupId) {
    currentGroupId = groupId;
}


/**
 * Get userid for current request
 *
 */
getCurrentUserId = function() {
    return currentUserId;
}

/**
 * Set userid for current request
 *
 */
setCurrentUserId = function(userId) {
    currentUserId = userId;
}

/**
 * Get current user name from URL
 */
function getCurrentUserName() {
    return currentUserName;
}

/**
 * Set current user name from URL
 */
setCurrentUserName = function(userName) {
    currentUserName = userName;
}


/**
 *	Open signalling channel
 **/
connectSignallingServer = function(){
    console.log("Connect signalling server");
    if(signallingSocket == null){
        signallingSocket = io.connect(SIGNALLING_NODE);
        listenSignallingServer(signallingSocket);
    }else{
        signallingSocket.socket.reconnect();
    }


}

disconnectSignallingServer = function(){
    console.log("Disconnect Signalling Server");
    //signallingSocket.emit('disconnect');
    signallingSocket.disconnect();
}

/**
 * Register user in registrar.
 */
registerUser = function(){
    console.log("Register user in signalling server.");
    if(signallingSocket==null){
        alert("You need connect with signalling server.");
    }else{
        if(currentGroupId.length == 0 || currentUserId.length == 0 || currentUserName.length == 0){
            alert("Fill group id, user id and user name");
        }else{
            signallingSocket.emit('register', {
                groupid : currentGroupId,
                userid : currentUserId,
                name : currentUserName,
                peer_type : peer_type,
                shareScreen: 0
            });
        }
    }
}

/**
 *	Get local media.
 **/
getLocalMedia = function(callback){
    console.log("Get local media");

    if (useOnlyAudio) {
        userMediaConstraints = ONLY_AUDIO_MEDIA_CONSTRAINTS;
        sdpConstraints = SDP_CONSTRAINTS_ONLY_AUDIO;
    } else {
        userMediaConstraints = VIDEO_MEDIA_CONSTRAINTS;
        sdpConstraints = SDP_CONSTRAINTS_VIDEO;
    }

    getUserMedia(userMediaConstraints, function(mediaStream) {
        localMediaStream = mediaStream;
//		attachMediaStream(localVideo, localMediaStream);
//		localVideo.style.opacity = 1;
        console.log('Requested access to local media with mediaConstraints:\n'
        + '  \'' + JSON.stringify(userMediaConstraints) + '\'');

        // Get all users already registered in current group.
        // Response to this call initiates the all interactions.
        // As a result of the execution of this function, the 'getRegisteredUsersResult'
        // will be received. This message is processed in point 2.1.2.
//		getRegisteredUsers();

        callback();

    }, function(err) {
        console.log("Error getting local media during registration: " + err);
    });
}

/**
 * Get the currently registered users. The response to the request message sent to
 * signalling service is processed in the callback to the
 * signallingSocket.on('getRegisteredUsersResult') register operation.
 *
 * @return List of already registered users. Array of objects with the following format:
 *         {userid: user_id,
*          userName: user_name,
*          registerTime: register_time}
 *         Note: registerTime may be used to order calls according arrival order to the
 *         group.
 *
 */
function getRegisteredUsers() {
    if(signallingSocket == null){
        alert("You need connect with signalling server to get registered users.");
    }else{
        if(currentGroupId.length == 0 || currentUserId.length == 0 || currentUserName.length == 0){
            alert("Fill group id, user id and user name to get registered users.");
        }else{
            var message = {
                groupid : currentGroupId,
                userid: currentUserId
            };
            console.log('Sending getReisteredUsers request: ' + JSON.stringify(message));
            signallingSocket.emit('getRegisteredUsers', message);
        }
    }
}


/**
 *
 * @param usersInformation object with the following structure:
 *        {<userid>: {userid: <userid>,
*                                             groupid: <groupid>,
*                    name: <name>,
*                    registerTime: <registerTime>
*                   }
*        }
 *
 */
function refreshRegisteredUsers(usersInformation) {
    console.log("RefreshRegisteredUsers");
    console.log(usersInformation);
    //Compruebo la lista que me mandan con la que ya tenía
    //para abrir una conexión de escritorio con el nuevo
    if(shareDesktopFlag){
        for (var userid in usersInformation){
            if(userid != currentUserId){
                if(typeof registeredUsers[userid] == "undefined"){
                    console.log("Initiate remote CallScreen with "+userid);
                    initiateCallScreen(userid);
                }
            }
        }
    }
    registeredUsers = usersInformation;
    delete registeredUsers[currentUserId];  // Remove current user id
    if(peer_type == 2){
        // TODO Comprobar si se está manteniendo una llamada con la web, en caso contrario
        // iniciarla
        for(var userid in registeredUsers){
            console.log(userid);
            console.log(callsInfo[userid]);
            console.log("registeredUser -"+userid+"-");
            console.log(registeredUsers[userid]);
            if(typeof callsInfo[userid] == "undefined" && registeredUsers[userid].peer_type == 0){
                initiateCall(userid);
            }
        }
    }
    // TODO More??
}

/**
 *
 * @param usersInformation object with the following structure:
 *        {<userid>: {userid: <userid>,
*                                             groupid: <groupid>,
*                    name: <name>,
*                    registerTime: <registerTime>
*                   }
*        }
 *
 */
function establishConnections(usersInformation) {
    console.log('Establishing connections to ' + JSON.stringify(usersInformation));
    for (var userid in usersInformation) {
        // Initiate a call for each user.
        initiateCall(userid);

        //TODO
        // Check if user is sharing the desktop
        // yes--> initiateCallScreen(userid)
        if(registeredUsers[userid].shareScreen == 1){
            console.log('Establishing shareScreen connections to ' + JSON.stringify(registeredUsers[userid]));
            //initiateCallScreen(userid);
        }

    }
}


/**
 * Make a call to userid
 *
 * @param destinationUserid
 * @return callid
 **/
initiateCall = function(destinationUserid) {
    // ORIGINATING
    console.log('Initiating call: ' + currentUserId + ' -> '+ destinationUserid);

    // Create peer connection for destinationUserid
    console.log('InitiateCall. 1. Creating Peer Connection');

    // Create call info
    call_info = callsInfo[destinationUserid];
    //console.log("call_info!!!initiateCall");
    //console.log(call_info);
    if(typeof call_info == "undefined"){
        var call_info = {};
        callsInfo[destinationUserid] = call_info;
    }
    /*var call_info = {};
     callsInfo[destinationUserid] = call_info;*/
    call_info.callState = STATE_IDLE;

    createPeerConnection(destinationUserid);

    // Add local media stream
    console.log('InitiateCall. 2. Adding local media stream');
    //call_info.peerConnection.addStream(localMediaStream);
    if(localMediaStream != null){
        call_info.peerConnection.addStream(localMediaStream);
    }

}


/**
 *	Establish dataChannel
 *
 *	@param destinationUserid: String
 **/
function createDataChannel(destinationUserid){
    console.log("Create data channel with "+destinationUserid);
    var peerConnection = callsInfo[destinationUserid].peerConnection;
    console.log(peerConnection);
    if(typeof callsInfo[destinationUserid] != "undefined"){
        if(typeof peerConnection != "undefined"){


            dataChannel = peerConnection.createDataChannel("myLabel", dataChannelOptions);

            dataChannel.onerror = function (error) {
                console.log("Data Channel Error:", error);
            };

            dataChannel.onmessage = function (event) {
                console.log("Got Data Channel Message:", event.data);
            };

            dataChannel.onopen = function () {
                dataChannel.send("Hello World!");
            };

            dataChannel.onclose = function () {
                console.log("The Data Channel is Closed");
            };
        }
    }
}


// PeerConnection Functions -----------------------------------------

/**
 * @param destinationUserid destination user to which peer connection is to be created
 *        (within current group).
 *
 */
function createPeerConnection(destinationUserId) {
    try {
        console.log('Creating RTCPeerConnnection with:\n'
        + '  peerConnectionConfiguration: \''
        + JSON.stringify(peerConnectionConfiguration) + '\';\n'
        + '  peerConnectionConstraints: \''
        + JSON.stringify(peerConnectionConstraints) + '\'.');

        // Get call state information.
        var call_info = callsInfo[destinationUserId];

        // Init call state for current destination userid.
        call_info.callState = STATE_IDLE;

        // Create peer connection to current destination userid.
        var peer_connection = new RTCPeerConnection(peerConnectionConfiguration, peerConnectionConstraints);
        console.log('Created peerConnection: ' + peer_connection);  // Debug

        call_info.peerConnection = peer_connection;
        peer_connection.onicecandidate = function(eventHandler) {
            if (call_info.callState == STATE_INITIATING
                || call_info.callState == STATE_INITIATING_T
                || call_info.callState == STATE_RINGING) {
                // Send candidate to destinationUserid
                sendIceCandidate(currentUserId, destinationUserId, currentGroupId,call_info.currentCallId,
                    generateTransactionId(ICE_CANDIDATE), eventHandler, false);
            }
        };

        console.log('Created RTCPeerConnnection with:\n'
        + '  peerConnectionConfiguration: \''
        + JSON.stringify(peerConnectionConfiguration) + '\';\n'
        + '  peerConnectionConstraints: \''
        + JSON.stringify(peerConnectionConstraints) + '\'.');
    } catch (e) {
        console.log('Failed to create PeerConnection, exception: ' + e.message);
        alert('Cannot create RTCPeerConnection object; WebRTC is not supported by this browser.');
    }

    peer_connection.onaddstream = function(event) {
        console.log('!! OnAddStream: Remote stream added');
        // Create small remote video element in interface and attach remote media to it.
        //		createRemoteView(destinationUserId);
        //		var remote_video = getRemoteVideoElement(destinationUserId);
        //		attachMediaStream(remote_video, event.stream);
        callsInfo[destinationUserId].remoteStream = event.stream;

        //		setTimeout(function() {
        //				       remote_video.style.opacity = 1;
        //		}, 0);

        /*		if (userInMainRemoteView === null) {
         // First remote connection.
         // Attach to main remote view.
         attachMediaStream(remoteVideo, event.stream);
         reattachMediaStream(localVideoSmall, localVideo);
         setTimeout(function() {
         localVideoSmall.style.opacity = 1;
         remoteVideo.style.opacity = 1;
         localVideo.style.opacity = 0;
         }, 0);
         userInMainRemoteView = destinationUserId;
         setMainVideoInfoText(userInMainRemoteView);  // TODO Add more information
         }*/

    };

    peer_connection.onremovestream = function(event) {
        console.log('!! OnRemoveStream: Remote stream removed');
        // TODO
    };

    peer_connection.onnegotiationneeded = function() {
        console.log('!! OnNegotiationNeeded: creating local offer');
        peer_connection.createOffer(function(desc) {
            // Set Opus as the preferred codec in SDP if Opus is present.
            // TODO ???
            desc.sdp = preferOpus(desc.sdp);

            peer_connection.setLocalDescription(desc, function() {
                console.log('Create local description: ' + JSON.stringify(desc));
                // Send invite
                sendInvite(currentUserId, destinationUserId, currentGroupId,
                    generateCallId(currentUserId, destinationUserId),
                    generateTransactionId(INVITE),
                    peer_connection.localDescription, false);
                // // Update call state
                // callState = STATE_INITIATING;
            }, logError);
        }, logError);
    }

    return peer_connection;

}


/**
 *
 * @param invite invite message received from a remote caller.
 */
function createRTCPeerConnectionTerminating(invite) {
    console.log(invite);
    var call_info = callsInfo[invite.from];
    try {
        console.log('Creating RTCPeerConnnection (terminating) with:\n'
        + '  peerConnectionConfiguration: \''
        + JSON.stringify(peerConnectionConfiguration) + '\';\n'
        + '  peerConnectionConstraints: \''
        + JSON.stringify(peerConnectionConstraints) + '\'.');
        var peer_connection = new RTCPeerConnection(peerConnectionConfiguration, peerConnectionConstraints);

        call_info.peerConnection = peer_connection;

        peer_connection.onicecandidate = function(eventHandler) {
            console.log('!! OnIceCandidate');
            // Send candidate to caller (invert to and from in received invite)
            sendIceCandidate(invite.to, invite.from, currentGroupId, invite.callId, generateTransactionId(ICE_CANDIDATE), eventHandler, invite.screen);
            //sendIceCandidate(mediaServerId, currentUserId, currentGroupId, invite.callId, generateTransactionId(ICE_CANDIDATE), eventHandler, invite.screen);
        };

        peer_connection.setRemoteDescription(new RTCSessionDescription(invite.sdp), function() {
            console.log('Correctly set remote description to RTCPeerConnection. Creating answer with constraints: '
            + JSON.stringify(sdpConstraints));
            peer_connection.createAnswer( function(sdp) {
                // Set Opus as the preferred
                // codec in SDP if Opus is
                // present.
                // TODO ???
                sdp.sdp = preferOpus(sdp.sdp);

                // Success callback
                console.log('Setting local description: ' + JSON.stringify(sdp));
                peer_connection.setLocalDescription(sdp);
                console.log('Sending sessionProgress response (183) to caller');
                sendSessionProgress(invite.from, invite.to, currentGroupId, invite.callId, invite.transactionId, sdp, invite.screen);
                //sendSessionProgress(currentUserId, mediaServerId, currentGroupId, invite.callId, invite.transactionId, sdp, invite.screen);
            }, function(error) {
                // Error callback
                console.log('Error creating answer to caller session description: ' + error);
            }, sdpConstraints);
        }, function(error) {
            console.log('Error setting remote description to RTCPeerConnection: ' + error);
        });
    } catch (e) {
        console.log('Failed to create PeerConnection, exception: ' + e.message);
        alert('Cannot create RTCPeerConnection object; WebRTC is not supported by this browser.');
    }

    call_info.peerConnection.onaddstream = function(event) {
        console.log('!! OnAddStream: Remote stream added');

        // Attach remote desktop to the corresponding video element.
//			createRemoteView(invite.from);
        call_info.remoteStream = event.stream;

        /********/
        //var remote_video = document.getElementById(remoteVideoID);
        //attachMediaStream(remote_video, event.stream);
        /********/

//			var remote_video = getRemoteVideoElement(invite.from);
//			attachMediaStream(remote_video, event.stream);


//			setTimeout(function() {
//				remote_video.style.opacity = 1;
//			}, 0);

        // If first remote connection, automatically focus.
        //if (getObjectSize(callsInfo) === 1) {
        /*			if (userInMainRemoteView === null) {
         // First remote connection.
         // Attach to main remote view.
         attachMediaStream(remoteVideo, event.stream);
         reattachMediaStream(localVideoSmall, localVideo);
         setTimeout(function() {
         localVideoSmall.style.opacity = 1;
         remoteVideo.style.opacity = 1;
         localVideo.style.opacity = 0;
         }, 0);
         userInMainRemoteView = invite.from;
         setMainVideoInfoText(userInMainRemoteView);  // TODO Add more information
         }*/

        //reattachMediaStream(localVideoSmall, localVideo);
        //attachMediaStream(remoteVideo, event.stream);

        //waitForRemoteVideo(event.stream, getRemoteVideoElement(invite.from));
    };

    call_info.peerConnection.onremovestream = function(event) {
        console.log('!! OnRemoveStream: Remote stream removed');
        // TODO
    };

    call_info.peerConnection.onnegotiationneeded = function() {
        console.log('onnegotiationneeded (terminating)');
        // TODO
    }

    return call_info.peerConnection;
}

/**
 *
 * @param invite invite message received from a remote caller.
 */
function createRTCPeerConnectionTerminatingScreen(invite) {
    var call_infoScreen = callsInfoScreen[invite.from];
    try {
        console.log('Creating RTCPeerConnnection (terminating) with:\n'
        + '  peerConnectionConfiguration: \''
        + JSON.stringify(peerConnectionConfiguration) + '\';\n'
        + '  peerConnectionConstraints: \''
        + JSON.stringify(peerConnectionConstraints) + '\'.');
        var peer_connection = new RTCPeerConnection(peerConnectionConfiguration, peerConnectionConstraints);

        call_infoScreen.peerConnectionScreen = peer_connection;

        peer_connection.onicecandidate = function(eventHandler) {
            console.log('!! OnIceCandidate');
            // Send candidate to caller (invert to and from in received invite)
            sendIceCandidate(invite.to, invite.from, currentGroupId, invite.callId, generateTransactionId(ICE_CANDIDATE), eventHandler, invite.screen);
        };

        peer_connection.setRemoteDescription(new RTCSessionDescription(invite.sdp), function() {
            console.log('Correctly set remote description to RTCPeerConnection. Creating answer with constraints: '
            + JSON.stringify(sdpConstraints));
            peer_connection.createAnswer( function(sdp) {
                // Set Opus as the preferred
                // codec in SDP if Opus is
                // present.
                // TODO ???
                sdp.sdp = preferOpus(sdp.sdp);

                // Success callback
                console.log('Setting local description: ' + JSON.stringify(sdp));
                peer_connection.setLocalDescription(sdp);
                console.log('Sending sessionProgress response (183) to caller');
                sendSessionProgress(invite.from, invite.to, currentGroupId, invite.callId, invite.transactionId, sdp, invite.screen);
            }, function(error) {
                // Error callback
                console.log('Error creating answer to caller session description: ' + error);
            }, sdpConstraints);
        }, function(error) {
            console.log('Error setting remote description to RTCPeerConnection: ' + error);
        });
    } catch (e) {
        console.log('Failed to create PeerConnection, exception: ' + e.message);
        alert('Cannot create RTCPeerConnection object; WebRTC is not supported by this browser.');
    }

    call_infoScreen.peerConnectionScreen.onaddstream = function(event) {
        console.log('!![Screen] OnAddStream: Remote stream added');

        // Attach remote desktop to the corresponding video element.

        createRemoteScreenView(invite.from);
        call_infoScreen.remoteScreen = event.stream;

        var remote_screen_small = document.getElementById('remoteScreen' + invite.from);
        //console.log('remoteScreen' + invite.from);
        //console.log(remote_screen_small);
        /*attachMediaStream(remote_screen_small, event.stream);


         setTimeout(function() {
         remote_screen_small.style.opacity = 1;
         }, 0);*/

        // If first remote connection, automatically focus.
        //if (getObjectSize(callsInfo) === 1) {
        /*if (userInMainRemoteView === null) {
         // First remote connection.
         // Attach to main remote view.
         //attachMediaStream(remoteVideo, event.stream);
         //reattachMediaStream(localVideoSmall, localVideo);
         setTimeout(function() {
         localVideoSmall.style.opacity = 1;
         remoteVideo.style.opacity = 1;
         localVideo.style.opacity = 0;
         }, 0);
         userInMainRemoteView = invite.from;
         setMainVideoInfoText(userInMainRemoteView);  // TODO Add more information
         }*/

        //reattachMediaStream(localVideoSmall, localVideo);
        //attachMediaStream(remoteVideo, event.stream);

        //waitForRemoteVideo(event.stream, getRemoteVideoElement(invite.from));
    };

    call_infoScreen.peerConnectionScreen.onremovestream = function(event) {
        console.log('!! OnRemoveStream: Remote stream removed');
        // TODO
    };

    call_infoScreen.peerConnectionScreen.onnegotiationneeded = function() {
        console.log('onnegotiationneeded (terminating)');
        // TODO
    }

    return call_infoScreen.peerConnectionScreen;
}
// --------------------------------------------------------------------------------


// Send messages to signalling server functions -----------------------------------

/**
 *
 * @param from
 * @param to
 * @param group
 * @param callId
 * @param transactionId
 * @param sdp
 * @param screen
 */
function sendInvite(from, to, group, callId, transactionId, sdp, screen) {
    if(!screen){
        setCallStateInitiating(to);
    }else{
        setCallStateInitiatingScreen(to);
    }
    var invite_msg = {
        from: from,
        to: to,
        group: group,
        callId : callId,
        transactionId : generateTransactionId(INVITE),
        sdp : sdp,
        screen: screen
    };
    currentCallId = invite_msg.callId;
    currentTransactionId = invite_msg.transactionId;
    console.log('Initiating call: ' + from + ' -> ' + to);
    console.log('-> Sending invite: ' + JSON.stringify(invite_msg));
    signallingSocket.emit(INVITE, invite_msg);

    lastInviteMessage = invite_msg;
    callParticipant = to;
}


/**
 *
 * @param from
 * @param to
 * @param group
 * @param callId
 * @param transactionId
 * @param screen
 */
function sendRinging(from, to, group, callId, transactionId, screen) {
    if(!screen){
        setCallStateRinging(from);
    }else{
        setCallStateRingingScreen(from);
    }
    var msg = {
        from: from,
        to: to,
        group: group,
        callId: callId,
        transactionId: transactionId,
        screen:screen
    };
    console.log('-> Sending ringing: ' + JSON.stringify(msg));
    signallingSocket.emit(RINGING, msg);
}

/**
 *
 * @param from
 * @param to
 * @param callId
 * @param transactionId
 * @param eventHandler
 *            according interface RTCPeerConnectionIceEvent dictionary
 *            RTCPeerConnectionIceEventInit : EventInit { RTCIceCandidate
	*            candidate; }; dictionary RTCIceCandidateInit { DOMString
	*            candidate; DOMString sdpMid; unsigned short sdpMLineIndex; };
 * @param screen
 */
function sendIceCandidate(from, to, group, callId, transactionId, eventHandler, screen) {
    if (eventHandler.candidate) {
        var msg = {
            from : from,
            to : to,
            group: group,
            callId : callId,
            transactionId : transactionId,
            iceCandidate : {
                label : eventHandler.candidate.sdpMLineIndex,
                id : eventHandler.candidate.sdpMid,
                candidate : eventHandler.candidate.candidate
            },
            screen: screen
        };

        if(!screen){
            var call_info = callsInfo[to];
            //                           call_info.callId = msg.callId;
            call_info.currentTransactionId = msg.transactionId;
        }else{
            var call_infoScreen = callsInfoScreen[to];
            //                           call_info.callId = msg.callId;
            call_infoScreen.currentTransactionId = msg.transactionId;
        }
        console.log('-> Sending iceCandidate: ' + JSON.stringify(msg));
        signallingSocket.emit(ICE_CANDIDATE, msg);
    } else {
        console.log('End of ICE candidates');
    }
}


/**
 *
 * @param from
 * @param to
 * @param group
 * @param callId
 * @param transactionId
 * @param sessionDescription
 *            object of type RTCSessionDescription
 * @param screen
 */

function sendSessionProgress(from, to, group, callId, transactionId, sessionDescription, screen) {
    msg = {
        from: from,
        to: to,
        group: group,
        callId: callId,
        transactionId: transactionId,
        sdp: sessionDescription.sdp,
        screen: screen
    };
    console.log('--> Sending sessionProgress response ' + to + ' -> ' + from+ ': ' + JSON.stringify(msg));
    signallingSocket.emit(SESSION_PROGRESS, msg);
}

/**
 *
 * @param from
 * @param to
 * @group group
 * @param callId
 * @param transactionId
 * @param screen
 */
function sendOk(from, to, group, callId, transactionId, screen) {
    var ok_msg = {
        from : from,
        to : to,
        group: group,
        callId : callId,
        transactionId : transactionId,
        screen: screen
    };

    if(screen){
        var call_infoScreen = callsInfoScreen[from];
        call_infoScreen.currentTransactionId = ok_msg.transactionId;
    }else{
        var call_info = callsInfo[from];
        call_info.currentTransactionId = ok_msg.transactionId;
    }
    console.log('-> Sending ok: ' + JSON.stringify(ok_msg));
    signallingSocket.emit(OK, ok_msg);
}


// -----------------------------------------------------------------------------------




// AUX Functions ---------------------------------------------------------------------

/**
 * Set the selected codec to the first in m line.
 */
function setDefaultCodec(mLine, payload) {
    var elements = mLine.split(' ');
    var newLine = new Array();
    var index = 0;
    for (var i = 0; i < elements.length; i++) {
        if (index === 3) // Format of media starts from the fourth.
            newLine[index++] = payload; // Put target payload to the first.
        if (elements[i] !== payload)
            newLine[index++] = elements[i];
    }
    return newLine.join(' ');
}

/**
 *
 * @param sdpLine
 * @param pattern
 * @returns
 */
function extractSdp(sdpLine, pattern) {
    var result = sdpLine.match(pattern);
    return (result && result.length == 2) ? result[1] : null;
}

/**
 *
 * @param error
 */
function logError(error) {
    console.log(error.name + ": " + error.message);
}

/**
 * Ring player class
 *
 * @param aContext
 */
function RingPlayer(aContext) {
    //const RING_SOUND_URL = '/sound/telephone-ring-1.mp3';
    const IDLE = 'idle';
    const RINGING = 'ringing';
    const RINGING_PERIOD = 3000;

    var audioContext = aContext;
    var ringSoundBuffer;
    var bufferSource;
    var state = IDLE;

    var that = this;

    var intervalId = null;

    /*
     loadSound(RING_SOUND_URL, audioContext, function(buffer) {
     ringSoundBuffer = buffer;
     });
     */

    this.start = function() {
        if (state == IDLE) {
            state = RINGING;
            that.play();
            intervalId = setInterval(function() {
                that.play()
            }, RINGING_PERIOD);
        }
    }

    this.play = function() {
        // if (bufferSource)
        // bufferSource.start(0);
        // else
        bufferSource = playSound(ringSoundBuffer, audioContext);
    }



    this.stop = function() {
        state = IDLE;
        clearInterval(intervalId);
        if (bufferSource)
            bufferSource.stop(0);
    };
}

/**
 * Load a sound as an array buffer
 *
 * @param url URL of the sound to be loaded
 * @param audioContext
 * @param callback called when sound is loaded; the load array buffer is passed as
 *        parameter.
 */
function loadSound(url, audioContext, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // Decode asynchronously
    request.onload = function() {
        audioContext.decodeAudioData(request.response, function(buffer) {
            callback(buffer);
        }, function(error) {
            console.log('Error loading ring sound: ' + error);
        });
    }
    request.send();
}

function createAudioContext() {
    try {
        // Fix up for prefixing
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        var res = new AudioContext();
        return res;
    } catch (e) {
        console.log('Warning: Web Audio API is not supported in this browser!!');
        return null;
    }
}


function playRingingTone(ringingMessage) {
    // TODO
}

/**
 *
 * @param operation
 * @returns {String}
 */
function generateTransactionId(operation) {
    return operation + '-' + getTimestamp() + '-' + getRandomInteger();
}

/**
 *
 * @param originUserid
 * @param destinationUserid
 * @returns {String}
 */
function generateCallId(originUserid, destinationUserid) {
    return originUserid + '-' + destinationUserid + '-' + getTimestamp() + '-'+ getRandomInteger();
}

/**
 *
 * @returns
 */
function getTimestamp() {
    return new Date().getTime();
}

/**
 *
 * @returns
 */
function getRandomInteger() {
    return Math.floor((Math.random() * 10000000000) + 1);
}


/**
 *	Attach remote media stream
 *	@param remoteVideoID: String
 *	@param destinationUserID: String
 **/
function attachRemoteMediaStream(remoteVideoID, destinationUserID){
    console.log("Attach remote media stream.");
    remoteVideo = document.getElementById(remoteVideoID);

    var remoteStream = callsInfo[destinationUserID].remoteStream;

    attachMediaStream(remoteVideo, remoteStream);

    userInMainRemoteView = destinationUserID;
}


/**
 * Set Opus as the default audio codec if it's present.
 *
 * @param sdp SDP content to be modified
 * @returns the modified SDP content
 */
function preferOpus(sdp) {
    var sdpLines = sdp.split('\r\n');
    var mLineIndex = -1;


    // Search for m line.
    for (var i = 0; i < sdpLines.length; i++) {
        if (sdpLines[i].search('m=audio') !== -1) {
            mLineIndex = i;
            break;
        }
    }

    if (mLineIndex === -1) {
        return sdp;
    }


    // If Opus is available, set it as the default in m line.
    for (i = 0; i < sdpLines.length; i++) {
        if (sdpLines[i].search('opus/48000') !== -1) {
            var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
            if (opusPayload) {
                sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
            }
            break;
        }
    }


    // Remove CN in m line and sdp.
    sdpLines = removeCN(sdpLines, mLineIndex);

    sdp = sdpLines.join('\r\n');
    return sdp;
}

/**
 * Strip CN from sdp before CN constraints is ready.
 */
function removeCN(sdpLines, mLineIndex) {
    var mLineElements = sdpLines[mLineIndex].split(' ');
    // Scan from end for the convenience of removing an item.
    for (var i = sdpLines.length - 1; i >= 0; i--) {
        var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
        if (payload) {
            var cnPos = mLineElements.indexOf(payload);
            if (cnPos !== -1) {
                // Remove CN payload from m line.
                mLineElements.splice(cnPos, 1);
            }
            // Remove CN line in sdp
            sdpLines.splice(i, 1);
        }
    }


    sdpLines[mLineIndex] = mLineElements.join(' ');
    return sdpLines;
}

// -----------------------------------------------------------------------------------


// State Functions -----------------------------------------------------

function setCallStateInitiating(userid) {
    var call_info = callsInfo[userid];
    console.log('callsInfo: ' + JSON.stringify(callsInfo));  // Debug
    console.log('userid: ' + userid);  // Debug
    console.log('STATE TRANSITION for call with ' + userid + ': ' + call_info.callState + ' -> ' + STATE_INITIATING);
    call_info.callState = STATE_INITIATING;
}

function setCallStateInitiatingScreen(userid) {
    var call_infoScreen = callsInfoScreen[userid];
    console.log('callsInfoScreen: ' + JSON.stringify(callsInfoScreen));  // Debug
    console.log('userid: ' + userid);  // Debug
    console.log('STATE TRANSITION for call screen with ' + userid + ': ' + call_infoScreen.callState + ' -> ' + STATE_INITIATING);
    call_infoScreen.callStateScreen = STATE_INITIATING;
}

function setCallStateInitiatingT(userid) {
    var call_info = callsInfo[userid];
    console.log('STATE TRANSITION for call with ' + userid + ': ' + call_info.callState + ' -> ' + STATE_INITIATING_T);
    call_info.callState = STATE_INITIATING_T;
}

function setCallStateInitiatingTScreen(userid) {
    var call_infoScreen = callsInfoScreen[userid];
    console.log('STATE TRANSITION for call with ' + userid + ': ' + call_infoScreen.callState + ' -> ' + STATE_INITIATING_T);
    call_infoScreen.callStateScreen = STATE_INITIATING_T;
}

function setCallStateEstablished(userid) {
    var call_info = callsInfo[userid];
    console.log('STATE TRANSITION for call with ' + userid + ': ' + call_info.callState + ' -> ' + STATE_ESTABLISHED);
    call_info.callState = STATE_ESTABLISHED;
}

function setCallStateEstablishedScreen(userid) {
    var call_infoScreen = callsInfoScreen[userid];
    console.log('STATE TRANSITION for call with ' + userid + ': ' + call_infoScreen.callState + ' -> ' + STATE_ESTABLISHED);
    call_infoScreen.callStateScreen = STATE_ESTABLISHED;
}


function setCallStateRinging(userid) {
    var call_info = callsInfo[userid];
    console.log(call_info);
    console.log('STATE TRANSITION for call with ' + userid + ': ' + call_info.callState + ' -> ' + STATE_RINGING);
    call_info.callState = STATE_RINGING;
}

function setCallStateRingingScreen(userid) {
    var call_infoScreen = callsInfoScreen[userid];
    console.log('STATE TRANSITION for call with ' + userid + ': ' + call_infoScreen.callState + ' -> ' + STATE_RINGING);
    call_infoScreen.callStateScreen = STATE_RINGING;
}

function setCallStateTerminating(userid) {
    var call_info = callsInfo[userid];
    console.log('STATE TRANSITION for call with ' + userid + ': ' + call_info.callState + ' -> ' + STATE_TERMINATING);
    call_info.callState = STATE_TERMINATING;
}

function setCallStateEstablished(userid) {
    var call_info = callsInfo[userid];
    console.log('STATE TRANSITION for call with ' + userid + ': ' + call_info.callState + ' -> ' + STATE_ESTABLISHED);
    call_info.callState = STATE_ESTABLISHED;
}

function setCallStateEstablishedScreen(userid) {
    var call_infoScreen = callsInfoScreen[userid];
    console.log('STATE TRANSITION for call with ' + userid + ': ' + call_infoScreen.callState + ' -> ' + STATE_ESTABLISHED);
    call_infoScreen.callStateScreen = STATE_ESTABLISHED;
}

// ----------------------------------------------------------------------


// -----------------------------------------------------------------------



// MENSAJES DEL SERVIDOR DE SEÑALIZACIÓN ---------------------------------
function listenSignallingServer(signallingSocket){
    // This message will be received whenever register information is changed for
    // current groupId.
    signallingSocket.on('usersInformationUpdate', function(usersInformation) {
        refreshRegisteredUsers(usersInformation);  // TODO
    });


    // This message will be received as a response to the getRegisteredUsers request
    // sent just after registering current user in current groupid.
    signallingSocket.on('getRegisteredUsersResult', function(usersInformation) {
        // Establish connections
        registeredUsers = usersInformation;
        delete registeredUsers[currentUserId];  // Remove current user id
        //establishConnections(registeredUsers);
    });


    // Invite
    // TERMINATING CALL
    signallingSocket.on(INVITE, function(message) {
        console.log('<-- Received invite: ' + JSON.stringify(message));

        var flagScreen = message.screen;

        if(!flagScreen){
            // Add entry to callsInfo
            // A new connection must be established with the invite message sender
            var call_info = {};
            callsInfo[message.from] = call_info;

            call_info.lastInviteMessage = message;
            //call_info.callParticipant = message.from;
            call_info.currentCallId = message.callId;

            // Update call state
            setCallStateInitiatingT(message.from);
            console.log(callsInfo);
        }else{
            // Add entry to callsInfo
            // A new connection must be established with the invite message sender
            var call_infoScreen = {};
            callsInfoScreen[message.from] = call_infoScreen;

            call_infoScreen.lastInviteMessage = message;
            //call_info.callParticipant = message.from;
            call_infoScreen.currentCallId = message.callId;

            // Update call state
            setCallStateInitiatingTScreen(message.from);
            console.log(callsInfoScreen);
        }

        // Send ringing
        sendRinging(message.from, message.to, currentGroupId, message.callId, message.transactionId, message.screen);
        //sendRinging(currentUserId, mediaServerId, currentGroupId, message.callId, message.transactionId, message.screen);

        //// Start ringing
        //ringPlayer.start();  // TODO ????


        //// Stop ringing
        //ringPlayer.stop();

        //Llega un INVITE para compartir la cámara
        if(!flagScreen){
            createRTCPeerConnectionTerminating(message);
            // Success callback is sent in createRTCPeerConnectionTerminating;
            // setRemoteDescription is set there too.
        }else{
            createRTCPeerConnectionTerminatingScreen(message);
        }

        //                  // Send ok
        //                  sendOk(message.from, message.to, currentGroupId, message.callId, message.transactionId);

        // Add local media stream
        console.log('Adding local media stream');
        //if(!flagScreen){
        if(!flagScreen && localMediaStream != null){
            call_info.peerConnection.addStream(localMediaStream);
        }else{
            //no pongo ningún medio local
            //call_info.peerConnectionScreen.addStream(localScreenStream);
        }
        // Send ok
        sendOk(message.from, message.to, currentGroupId, message.callId, message.transactionId, flagScreen);
        //sendOk(currentUserId, mediaServerId, currentGroupId, message.callId, message.transactionId, flagScreen);

        // Update call state
        if(!flagScreen){
            setCallStateEstablished(message.from);
        }else{
            setCallStateEstablishedScreen(message.from);
        }

    });


    // iceCandidate
    signallingSocket.on(ICE_CANDIDATE, function(message) {
        console.log('<-- Received iceCandidate: ' + JSON.stringify(message));
        var candidate = new RTCIceCandidate({
            sdpMLineIndex : message.iceCandidate.label,
            candidate : message.iceCandidate.candidate
        });
        console.log('Adding candidate: ' + JSON.stringify(candidate));

        if(message.screen){
            // Check whether candidates are referred to current call; if not, ignore
            // them.
            var call_infoScreen = callsInfoScreen[message.from];
            //if (message.callId == call_info.currentCallId) {

            if (call_infoScreen.peerConnectionScreen)
                call_infoScreen.peerConnectionScreen.addIceCandidate(candidate);
        }else{
            // Check whether candidates are referred to current call; if not, ignore
            // them.
            var call_info = callsInfo[message.from];

            if (call_info.peerConnection)
                call_info.peerConnection.addIceCandidate(candidate);
        }

        //}
    });


    // sessionProgress (answer)
    signallingSocket.on(SESSION_PROGRESS, function(message) {
        console.log('<-- Received sessionProgress (answer): ' + JSON.stringify(message));
        var sdp_conf = {sdp : message.sdp, type : 'answer'};
        console.log('Setting remote description: ' + JSON.stringify(sdp_conf));

        if(message.screen){
            var call_infoScreen = callsInfoScreen[message.to];
            //console.log(callsInfo);
            //console.log(call_info);

            call_infoScreen.peerConnectionScreen.setRemoteDescription(new RTCSessionDescription(sdp_conf), function() {
                console.log('Correctly set remote description to RTCPeerConnectionScreen');
            }, function(error) {
                console.log('Error setting remote description to RTCPeerConnectionScreen: ' + error);
            });
        }else{
            var call_info = callsInfo[message.to];
            call_info.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp_conf), function() {
                console.log('Correctly set remote description to RTCPeerConnection');
            }, function(error) {
                console.log('Error setting remote description to RTCPeerConnection: ' + error);
            });
        }

    });

    // Ringing
    signallingSocket.on(RINGING, function(message) {
        console.log('<-- Received ringing: ' + JSON.stringify(message));
        if(!message.screen){
            setCallStateRinging(message.to);
        }else{
            setCallStateRingingScreen(message.to);
        }
        //                           // Play ringing tone
        //                           playRingingTone(message);
    });


    // Bye
    signallingSocket.on(BYE, function(message) {
        console.log('<- Received bye: ' + JSON.stringify(message));

        if(message.screen){
            var call_infoScreen = callsInfoScreen[message.from];
            if(typeof call_infoScreen != "undefined"){
                console.log("Getting callsInfoScreen from: "+message.from);
                console.log(callsInfoScreen);
                console.log(call_infoScreen);
                //var previous_state = call_infoScreen.callState;

                // Close peerConnection
                if (call_infoScreen.peerConnectionScreen)
                    call_infoScreen.peerConnectionScreen.close();

                // Send ok response
                sendOk(message.from, message.to, currentGroupId, message.callId, message.transactionId, message.screen);

                // Remove remote video panel
                removeRemoteViewScreen(message.from);

                console.log(divRemoteViews);
                //Check if screen is in mainVIew
                if (userInMainRemoteView === message.from) {
                    // User in main remote view has retired.
                    // Attach first user in callsInfo object to main remote view.
                    var first_remote_video_element = getFirstRemoteVideoElement();
                    console.log(first_remote_video_element);
                    if (!first_remote_video_element) {
                        // There are note remote connections left.
                        // Reattach local stream to main view.
                        // dettachMediaStream(remoteVideo);  // ??
                        reattachMediaStream(localVideo, localVideoSmall);
                        localVideoSmall.style.opacity = 0;
                        remoteVideo.style.opacity = 0;
                        localVideo.style.opacity = 1;
                        userInMainRemoteView = null;
                        setMainVideoInfoText('');  // Remove information, since local user is shown.
                    }
                    else {
                        console.log('Reattaching user ' + first_remote_video_element.getAttribute('userid') + ' to main remote view ' + first_remote_video_element);
                        reattachMediaStream(remoteVideo, first_remote_video_element);
                        userInMainRemoteView = first_remote_video_element.getAttribute('userid');
                        setMainVideoInfoText(userInMainRemoteView);  // TODO Add more information
                    }
                }

                // Remove call information from callsInfo
                console.log("Remove callsInfoScreen from: "+message.from+" in received BYE.");
                console.log(callsInfo);
                delete callsInfoScreen[message.from];
            }
        }else{
            var call_info = callsInfo[message.from];
            var previous_state = call_info.callState;

            setCallStateTerminating(message.from);

            // Close peerConnection
            if (call_info.peerConnection)
                call_info.peerConnection.close();

            // Send ok response
            console.log("sendok from: "+message.from+" to: "+message.to+" group: "+currentGroupId+" callId: "+message.callId+" screen: "+screen);
            sendOk(message.from, message.to, currentGroupId, message.callId, message.transactionId, message.screen);
            //sendOk(currentUserId, mediaServerId, currentGroupId, message.callId, message.transactionId, message.screen);

            // Remove remote video panel
            //			removeRemoteView(message.from);

            /*			if (userInMainRemoteView === message.from) {
             // User in main remote view has retired.
             // Attach first user in callsInfo object to main remote view.
             var first_remote_video_element = getFirstRemoteVideoElement();
             if (!first_remote_video_element) {
             // There are note remote connections left.
             // Reattach local stream to main view.
             // dettachMediaStream(remoteVideo);  // ??
             reattachMediaStream(localVideo, localVideoSmall);
             localVideoSmall.style.opacity = 0;
             remoteVideo.style.opacity = 0;
             localVideo.style.opacity = 1;
             userInMainRemoteView = null;
             setMainVideoInfoText('');  // Remove information, since local user is shown.
             }
             else {
             console.log('Reattaching user ' + first_remote_video_element.getAttribute('userid') + ' to main remote view ' + first_remote_video_element);
             reattachMediaStream(remoteVideo, first_remote_video_element);
             userInMainRemoteView = first_remote_video_element.getAttribute('userid');
             setMainVideoInfoText(userInMainRemoteView);  // TODO Add more information
             }
             }*/

            // Remove call information from callsInfo
            console.log("Remove callsInfo from: "+message.from+" in received BYE.");
            console.log(callsInfo);
            delete callsInfo[message.from];
        }
    });


    // Ok
    signallingSocket.on(OK, function(message) {
        console.log('<- Received ok: ' + JSON.stringify(message));
        var call_info = callsInfo[message.to];
        if (call_info.callState == STATE_RINGING)
            setCallStateEstablished(message.to);
        else if (call_info.callState == STATE_TERMINATING) {
            setCallStateTerminated(message.to);
            //                         setCallStateIdle();
            // Remove call info
            console.log("Remove callsInfo from: "+message.to+" in received OK.");
            console.log(callsInfo);
            delete callsInfo[message.to];
        }
    });


    //UserRegistered
    signallingSocket.on(USER_REGISTERED,function(message){
        console.log('<- Received User registered');
        alert(message.data);
    });

}


/**
 * Quit
 */
function quit() {
    // TODO
    //signallingSocket.disconnect();
    parent.history.back();
    //window.location.href="webrtc_multi";
}
// -----------------------------------------------------------------------
