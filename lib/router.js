/*Router.map(function(){
    this.route('hello');
    this.route('home', {path: '/'} );
});*/

/*Router.configure({
    layoutTemplate: 'layout'
});*/

Router.route('login', {path: '/'} );
Router.route('signup', {path: '/signup'} );
Router.route('hello', {path: '/hello'});
Router.route('joinRoom', {path: '/joinroom'});
Router.route ('room', {path: '/room/:roomName'});
Router.route('forgotpass', {path: '/forgotpass'} );
Router.route('resetpass', {path: '/reset-password/:token'});
//package errors ¿?
//Router.onBeforeAction(function() { Errors.clearSeen(); });