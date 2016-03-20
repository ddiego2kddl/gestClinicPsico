'use strict';

app.controller('opcionesPersonalCtrl', function($scope,sessionService,$q,opcionesPersonalService,utilsService){
	console.log("opcionesPersonalCtrl");

	$scope.changeTabVar = function(opcion){
		//$scope.tabVar = opcion;
	}

	$scope.updatePassword = function(){
		var auxPersonal = {};
		auxPersonal.id_personal = sessionService.get('id');
		auxPersonal.old_password = $scope.password.actual;
		auxPersonal.new_password = $scope.password.nueva1;
		auxPersonal.email = $scope.personal.email;

        utilsService.alertModal("C","Modificando cuenta...","¿Quieres guardar la nueva Contraseña?").then(function(response){
        if (response)
            opcionesPersonalService.updatePasswordBD(auxPersonal).then(function(response){
                if (response.data == "true"){
                    utilsService.alertModal("I","Modificando contraseña....","Cambios guardados con exito!!!").then(function(response){
                        if (response){
                            init();
                        }
                    });  
                }
                else
                    console.log(response.data);
            });
        });
	}

	function init(){
		console.log("init");
		$scope.password = {};
		opcionesPersonalService.getPersonalByIdBD(sessionService.get('id')).then(function(data){
			$scope.personal = data.data[0];
		})
	}

	init();
});