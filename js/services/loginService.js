'use strict'

app.factory('loginService', function($http,$location,sessionService,$rootScope,utilsService){
	return{
		login:function(user){
			var $promise = $http.post('data/user.php',user); // send data to user php
			$promise.then(function(msg){
				var aux = msg.data.split('_');
				$rootScope.cargo=aux[0];
				var uid= msg.data;

				if (uid) {
					var rol = uid.split("_");
					sessionService.set('rol',rol[0]);
					sessionService.set('id',rol[1]);
					sessionService.set('uid',uid);
					$location.path('/menu/agenda');
				}
				else {
					utilsService.alertModal("I","Error de Login!!","Email de usuario o password no validas").then(function(response){
						if (response)
							console.log("volver a intentar");
			        });
				}
			});
		},
		logout:function(){
			utilsService.alertModal("C","Deslogear","¿Quieres deslogearte y sair de la aplicacion?").then(function(response){
	            if (response){
					sessionService.destroy('uid');
					$location.path('/login');
	            }
	        });
		},
		islogged:function(){
			var $checkSessionServer=$http.post('data/check_session.php');
			return $checkSessionServer;
		}
		
	};
});