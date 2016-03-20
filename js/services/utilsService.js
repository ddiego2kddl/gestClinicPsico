'use strict'

app.service('utilsService', function ($modal,$q,$timeout) {
    //actualizar objeto con las propiedas de otro manteniendo la instancia 
    this.updateObject= function(objeto,nuevosDatos) {
        for(var key in objeto) {
            if(typeof objeto[key] !== 'undefined') {
                objeto[key] = nuevosDatos[key];
            }
        }
    } 
    
    //parsear fecha a formatos legibles // OPCIONES-->   (1: dd-mm-yyyy)    (0: yyyy-mm-dd) 
    this.parseFecha = function(fecha,op){
    		fecha= new Date(fecha);
			var yyyy = fecha.getFullYear().toString();                                    
		    var mm = (fecha.getMonth()+1).toString(); // getMonth() is zero-based         
		    var dd  = fecha.getDate().toString();            
		    if (op==0)                        
		    	return( yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]));
		    else if (op==1)
		    	return( (dd[1]?dd:"0"+dd[0]) + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + yyyy );
	}

    // le paso el dia actual
    this.semanaActual = function ( numSemana ){//RESTAURO TODOS LOS VALORES A SEMANA ACTUAL CONSULTANDO LA FECHA DEL MOMENTO
        var dia = addDays(new Date(), (7*numSemana));
        var arrayFechas=new Array();
        arrayFechas[0] = addDays(dia,-dia.getDay()+1); // fechaActual - (numeroDiaFechaActual + 1) = LUNES
        arrayFechas[1] = addDays(dia,-dia.getDay()+2); // fechaActual - (numeroDiaFechaActual + 2) = MARTES
        arrayFechas[2] = addDays(dia,-dia.getDay()+3); // fechaActual - (numeroDiaFechaActual + 3) = MIERCOLES
        arrayFechas[3] = addDays(dia,-dia.getDay()+4); // fechaActual - (numeroDiaFechaActual + 4) = JUEVES
        arrayFechas[4] = addDays(dia,-dia.getDay()+5); // fechaActual - (numeroDiaFechaActual + 5) = VIERNES
        return arrayFechas;
    }

    var addDays = function (date, amount) {
        var tzOff = date.getTimezoneOffset() * 60 * 1000,
        t = date.getTime(),
        d = new Date(),
        tzOff2;

        t += (1000 * 60 * 60 * 24) * amount;
        d.setTime(t);

        tzOff2 = d.getTimezoneOffset() * 60 * 1000;
        if (tzOff != tzOff2) {
            var diff = tzOff2 - tzOff;
            t += diff;
            d.setTime(t);
        }
        return d;
    }

    this.addDays2 = function(date,amount){
        return addDays(date,amount);
    }

    this.restaFechas = function(f1,f2){
        var dif = f1 - f2;
        var dias = Math.floor(dif / (1000 * 60 * 60 * 24)); 
        return dias;
    }

    this.alertModal = function(tipo,titulo,pregunta){   //tipo --> I:Informacion, C-Confirmacion, W-Warning
        var deferred = $q.defer();
        var modalInstance = $modal.open({
                templateUrl: 'partials/alertModal.html',
                controller: 'alertModalCtrl',
                backdrop: false,
                windowClass: 'alertModal tipo', 
                size: 'sm',
                resolve: {
                    tituloInfo: function(){
                        return titulo;
                    },
                    preguntaInfo: function(){
                        return pregunta;
                    },
                    tipo: function(){
                        return tipo;
                    }
                }
            });
            modalInstance.result.then(function(selectedItem){
                deferred.resolve(true);
            },function(){
                deferred.resolve(false);
            });
        return deferred.promise;

        /* COPIAR ESTO PARA LLAMARLO DESDE CUALQUIER LADO DEL CODIGO

        utilsService.alertModal("confirmacion","Salir","¿Realmente quieres Salir?").then(function(response){
            if (response)
                console.log("aceptar");
            else
                console.log("cancelar");
        });

        */
    }

    this.dialogLoading = function (message, promise) {
        console.log(promise);
        var deferred = $q.defer();
        var modalInstance = $modal.open({
                templateUrl: 'partials/loadingModal.html',
                controller: 'loadingModalCtrl',
                backdrop: 'static',
                keyboard: false,
                windowClass: 'alertModal tipo', 
                size: 'sm',
                resolve: {
                    messageInfo: function(){
                        return message;
                    }
                }
            });
            modalInstance.result.then(function(rsp){
                deferred.resolve(rsp);
            },function(){
                deferred.resolve(false);
            });

        var closeDialog = function(){
            promise.then(function(rsp){
                modalInstance.close(rsp);
            })
        }
        $timeout(closeDialog,1000);
        //closeDialog();
        
        return deferred.promise;
    }
});

app.controller('loadingModalCtrl', function($scope, $modalInstance, messageInfo) {
    var init = function (){
        $scope.message = messageInfo;
    } 
    init();
});



app.controller('alertModalCtrl', function($scope, $modalInstance, tituloInfo, preguntaInfo, tipo) {
    var init = function (){
        $scope.titulo = tituloInfo;
        $scope.pregunta = preguntaInfo;
        if (tipo=="C"){
            $scope.twoButtons = true;
            $scope.modalClass = "modalAlertConfirmacion";
        }
        else if(tipo=="I"){
            $scope.twoButtons = false;
            $scope.modalClass = "modalAlertInfo";
        }
        else if(tipo=="W"){
            $scope.twoButtons = true;
            $scope.modalClass = "modalAlertWarning";
        }
    }
       
    init();

    $scope.accept = function(){
        $modalInstance.close();
    }

    $scope.cancel= function(){
        $modalInstance.dismiss();
    }
});

