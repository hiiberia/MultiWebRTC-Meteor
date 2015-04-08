/*Router.map(function(){
    this.route('hello');
    this.route('home', {path: '/'} );
});*/

Router.route('login', {path: '/'} );
Router.route('signup', {path: '/signup'} );
Router.route('hello', {path: '/hello'});
Router.route('joinRoom', {path: '/joinroom'});
Router.route ('room', {path: '/room/:roomName'});
Router.route('forgotpass', {path: '/forgotpass'} );
/*Router.route('resetpass', {
    controller: 'AccountController',
    path: '/reset-password/:token',
    action: 'resetPassword'
});

AccountController = RouteController.extends({
    resetPassword: function () {
        // NOTE: prompt below is very crude, but demonstrates the solution
        Accounts.resetPassword(this.params.token, prompt('enter new password'), function () {
            Router.go('/');
        });
    },
    verifyEmail: function () {
        Accounts.verifyEmail(this.params.token, function () {
            Router.go('/');
        });
    }
});*/

Router.route('resetpass', {path: '/reset-password/:token'});
