var app = angular.module('ideatApp',['ui.router','ui.bootstrap','colorpicker.module']);

app.config(function($stateProvider,$urlRouterProvider) {

        $urlRouterProvider.otherwise('/login');

        $stateProvider.state('login', {
              url: '/login',
                templateUrl : 'partials/login.html',
                controller  : 'loginCtrl'
        });
        $stateProvider.state('menu', {
                url: '/menu',
                templateUrl : 'partials/menu.html',
                controller  : 'menuCtrl'
        });
        
        $stateProvider.state('agenda', {
                parent: 'menu',
                url: '/agenda',
                templateUrl : 'partials/agenda/agenda.html',
                controller  : 'agendaCtrl'
        });
        $stateProvider.state('clienteTabla', {
                parent: 'menu',
                url: '/clienteTabla',
                templateUrl : 'partials/clientes/clienteTabla.html',
                controller: 'clienteTablaCtrl'
        });
        $stateProvider.state('personal', {
                parent: 'menu',
                url: '/personal',
                templateUrl : 'partials/administrar/personal.html',
                controller: 'personalCtrl'
        });
        $stateProvider.state('tarifas', {
                parent: 'menu',
                url: '/tarifas',
                templateUrl : 'partials/administrar/tarifas.html',
                controller: 'tarifasCtrl'
        });
        $stateProvider.state('tarifasBonos', {
                parent: 'menu',
                url: '/tarifasBonos',
                templateUrl : 'partials/administrar/tarifasBonos.html',
                controller: 'tarifasBonosCtrl'
        });
        $stateProvider.state('salas', {
                parent: 'menu',
                url: '/salas',
                templateUrl : 'partials/administrar/salas.html',
                controller: 'salasCtrl'
        });
        $stateProvider.state('facturacion', {
                parent: 'menu',
                url: '/facturacion',
                templateUrl : 'partials/contabilidad/facturacion.html',
                controller: 'facturacionCtrl'
        });
        $stateProvider.state('materiales', {
                parent: 'menu',
                url: '/materiales',
                templateUrl : 'partials/recursos/materiales.html',
                controller: 'materialesCtrl'
        });
        $stateProvider.state('opcionesPersonal', {
                parent: 'menu',
                url: '/opcionesPersonal',
                templateUrl : 'partials/personal/opciones.html',
                controller: 'opcionesPersonalCtrl'
        });

});



app.run(function ($rootScope, $state, loginService) {
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
        var connected = loginService.islogged();
        connected.then(function(msg){
            if (!msg.data){
                console.log("redireccionando login");
                $state.transitionTo("login");
                event.preventDefault();
            }
        });
    });
});


app.filter('startFrom', function() {
    return function(input, start) {
        if (!input || !input.length) { return; }
        start = +start; //parse to int
        return input.slice(start);
    }
});

app.filter('unique', function() {
  return function (arr, field) {
    var o = {}, i, l = arr.length, r = [];
    for(i=0; i<l;i+=1) {
      o[arr[i][field]] = arr[i];
    }
    for(i in o) {
      r.push(o[i]);
    }
    return r;
  };
});
