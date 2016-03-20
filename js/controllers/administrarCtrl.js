'use strict';

////////////////////
//CONTROLLER SALAS//
////////////////////
app.controller('salasCtrl', ['$scope','administrarService','utilsService','$filter','$modal', function($scope,administrarService,utilsService,$filter,$modal){
    console.log("salasCtrl");
    var init = function(){
        administrarService.getSalasBD().then(function(data){
            $scope.data = data.data;
            initVariables();
        });    
    }
    init();

    //PAGINAR
    var initVariables = function(){
        $scope.currentPage = 0; 
        $("#prevPage").addClass("disabled");
        $("#nextPage").addClass("disabled");
        if ($scope.numberOfPages() > 1)
            $("#nextPage").removeClass("disabled");
    }

    //cada vez que se filtre, se rechekea el paginator
    $scope.$watch('search',function(){
        initVariables();
    })
    
    $scope.data = [];
    $scope.pageSize = 10;

    $scope.numberOfPages=function(){
        var myFilteredData = $filter('filter')($scope.data,$scope.search);
        return Math.ceil(myFilteredData.length/$scope.pageSize);                
    }

    $scope.changePage = function(num){
        if (num==1){
            if ($scope.currentPage+1<$scope.numberOfPages()){
                $("#prevPage").removeClass("disabled");
                $scope.currentPage++;
                if ($scope.currentPage+1==$scope.numberOfPages())
                    $("#nextPage").addClass("disabled");
            }
        }
        else{
            if ($scope.currentPage > 0){
                $("#nextPage").removeClass("disabled");
                $scope.currentPage--;
                if ($scope.currentPage==0)
                    $("#prevPage").addClass("disabled");
            }
        }
    }

    // PARA ORDENAR //
    $scope.predicate="nombrePaciente";
    $scope.reverse=false;
    $scope.orderby = function(fact){
        console.log("fact");
        if ($scope.predicate == fact){
            $scope.reverse = !$scope.reverse;
        }
        else {
            $scope.predicate = fact;
            $scope.reverse = false;
        }
    }

    $scope.edit = function(sala){
        var modalInstance = $modal.open({
            templateUrl: 'partials/administrar/modalSala.html',
            controller: 'modalSalaCtrl',
            backdrop: false,
            windowClass: 'transpModal',
            size: 'md',
            resolve: {
                salaInfo: function(){
                    return sala;
                }
            }
        });
        modalInstance.result.then(function(selectedItem){
            init();
        });
    }

    $scope.delete = function(sala){
        utilsService.alertModal("W","Borrar Sala","¿Quieres Borrar de forma permanente la sala: (*"+sala.descripcion+"*)?").then(function(response){
                        if (response)
                                administrarService.deleteSalaBD(sala).then(function(msg){
                                    if (msg.data=="true"){
                                        console.log("sala borrada");
                                        init();
                                    }
                                })
        });
    }
}]);


/////////////////////////
//CONTROLLER MODAL SALA//
/////////////////////////
app.controller('modalSalaCtrl', ['$scope','salaInfo','$modalInstance','administrarService','utilsService', function($scope,salaInfo,$modalInstance,administrarService,utilsService){
    var nueva = true;
    $scope.save = function(){
        if (!nueva){//set
            utilsService.alertModal("C","Actualizar Sala","¿Quieres guardar los cambios?").then(function(response){
                    if (response)
                        administrarService.updateSalaBD($scope.sala).then(function(msg){
                            if (msg.data == "true"){
                                utilsService.alertModal("I","Actualizando Sala","Cambidos guardados con exito!!!").then(function(response){
                                    if (response)
                                        $modalInstance.close();
                                });  
                            }
                        });
            });
        }
        else{//update
            utilsService.alertModal("C","Guardar sala Nueva","¿Quieres guardar la sala nueva?").then(function(response){
                    if (response)
                        administrarService.setSalaBD($scope.sala).then(function(msg){
                            if (msg.data == "true"){
                                utilsService.alertModal("I","Guardando Sala","Sala introducida con exito!").then(function(response){
                                    if (response)
                                        $modalInstance.close();
                                });  
                            }
                            else console.log(msg.data);
                        });
            });
        }
    }

    $scope.cancel = function(){
        $modalInstance.dismiss();
    }

    var init = function(){
        if (salaInfo != null){
            $scope.editar = true;
            $scope.sala = salaInfo;
            $scope.descripcionShow = salaInfo.descripcion;
            nueva=false;
        }
        else{
            $scope.editar = false;
            $scope.sala = {};
            $scope.descripcionShow = "Nueva Sala";
        }
    }
    init();
}]);



/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////
//CONTROLLER TARIFAS//
//////////////////////
app.controller('tarifasCtrl', ['$q','$scope','administrarService','utilsService','$filter','$modal', function($q,$scope,administrarService,utilsService,$filter,$modal){
    console.log("tarifasCtrl");
        var init = function(){

        var tarifasBD = administrarService.getTarifasBD(),
            bonosBD = administrarService.getTarifasBonosBD();
        $q.all([tarifasBD,bonosBD]).then(function(dataArray){
            $scope.data = dataArray[0].data;
            $scope.bonos = dataArray[1].data;
            for (var i=0; i < $scope.data.length; i++){
                if ($scope.data[i].id_bono!=null)
                    for (var j=0; j < $scope.bonos.length; j++){
                        if ($scope.data[i].id_bono==$scope.bonos[j].id_bono){
                            $scope.data[i].bono = $scope.bonos[j];
                            j= dataArray.length + 1;
                        }
                    }
            }

            initVariables();
        });    
    }
    init();

    //PAGINAR
    var initVariables = function(){
        $scope.currentPage = 0; 
        $("#prevPage").addClass("disabled");
        $("#nextPage").addClass("disabled");
        if ($scope.numberOfPages() > 1)
            $("#nextPage").removeClass("disabled");
    }

    //cada vez que se filtre, se rechekea el paginator
    $scope.$watch('search',function(){
        initVariables();
    })
    
    $scope.data = [];
    $scope.pageSize = 10;

    $scope.numberOfPages=function(){
        var myFilteredData = $filter('filter')($scope.data,$scope.search);
        return Math.ceil(myFilteredData.length/$scope.pageSize);                
    }

    $scope.changePage = function(num){
        if (num==1){
            if ($scope.currentPage+1<$scope.numberOfPages()){
                $("#prevPage").removeClass("disabled");
                $scope.currentPage++;
                if ($scope.currentPage+1==$scope.numberOfPages())
                    $("#nextPage").addClass("disabled");
            }
        }
        else{
            if ($scope.currentPage > 0){
                $("#nextPage").removeClass("disabled");
                $scope.currentPage--;
                if ($scope.currentPage==0)
                    $("#prevPage").addClass("disabled");
            }
        }
    }

    // PARA ORDENAR //
    $scope.predicate="nombrePaciente";
    $scope.reverse=false;
    $scope.orderby = function(fact){
        console.log("fact");
        if ($scope.predicate == fact){
            $scope.reverse = !$scope.reverse;
        }
        else {
            $scope.predicate = fact;
            $scope.reverse = false;
        }
    }

    $scope.edit = function(tarifa){
        var modalInstance = $modal.open({
            templateUrl: 'partials/administrar/modalTarifa.html',
            controller: 'modalTarifaCtrl',
            backdrop: false,
            windowClass: 'transpModal',
            size: 'sm',
            resolve: {
                tarifaInfo: function(){
                    return tarifa;
                },
                bonosInfo: function(){
                    return $scope.bonos;
                }
            }
        });
        modalInstance.result.then(function(selectedItem){
            init();
        });
    }

    $scope.delete = function(tarifa){
        console.log("borrando");
        utilsService.alertModal("W","Borrar Tarifa","¿Quieres Borrar de forma permanente la tarifa: (*"+tarifa.descripcion+"*)?").then(function(response){
                        if (response)
                                administrarService.deleteTarifaBD(tarifa).then(function(msg){
                                        init();   
                                });
        });
    }
}]);


////////////////////////////
//CONTROLLER MODAL TARIFAS//
////////////////////////////
app.controller('modalTarifaCtrl', ['$scope','tarifaInfo','$modalInstance','administrarService','utilsService','bonosInfo', function($scope,tarifaInfo,$modalInstance,administrarService,utilsService,bonosInfo){
    var nueva = true;
    $scope.save = function(){
        if ($scope.tarifa.bono!=null)
            $scope.tarifa.precio = null;

        if (!nueva){//set
            utilsService.alertModal("C","Actualizar Tarifa","¿Quieres guardar los cambios?").then(function(response){
                    if (response)
                        administrarService.updateTarifaBD($scope.tarifa).then(function(msg){
                            if (msg.data == "true"){
                                utilsService.alertModal("I","Actualizando Tarifa","Cambidos guardados con exito!!!").then(function(response){
                                    if (response)
                                        $modalInstance.close();
                                });  
                            }
                            else console.log(msg.data);
                        });
            });
        }
        else{//update
            console.log($scope.tarifa);
            utilsService.alertModal("C","Guardar tarifa Nueva","¿Quieres guardar la tarifa nueva?").then(function(response){
                    if (response)
                        administrarService.setTarifaBD($scope.tarifa).then(function(msg){
                            if (msg.data == "true"){
                                utilsService.alertModal("I","Guardando Tarifa","Tarifa introducida con exito!").then(function(response){
                                    if (response)
                                        $modalInstance.close();
                                });  
                            }
                            else console.log(msg.data);
                        });
            });
        }
    }

    $scope.cancel = function(){
        $modalInstance.dismiss();
    }

    var init = function(){
        $scope.options=[];
        $scope.options=bonosInfo;
        $scope.options.unshift(null);
        if (tarifaInfo != null){
            $scope.editar = true;
            $scope.tarifa = tarifaInfo;
            $scope.descripcionShow = tarifaInfo.descripcion;
            nueva=false;
        }
        else{
            $scope.editar = false;
            $scope.tarifa = {};
            $scope.descripcionShow = "Nueva Tarifa";
        }
    }
    init();
}]);



/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////
//CONTROLLER PERSONAL//
///////////////////////
app.controller('personalCtrl', ['$scope','administrarService','utilsService','$filter','$modal', function($scope,administrarService,utilsService,$filter,$modal){
    console.log("personalCtrl");
        var init = function(){ 
        administrarService.getPersonalBD().then(function(data){
            $scope.data = data.data;
            initVariables();
        });    
    }
    init();

    //PAGINAR
    var initVariables = function(){
        $scope.currentPage = 0; 
        $("#prevPage").addClass("disabled");
        $("#nextPage").addClass("disabled");
        if ($scope.numberOfPages() > 1)
            $("#nextPage").removeClass("disabled");
    }

    //cada vez que se filtre, se rechekea el paginator
    $scope.$watch('search',function(){
        initVariables();
    })
    
    $scope.data = [];
    $scope.pageSize = 10;

    $scope.numberOfPages=function(){
        var myFilteredData = $filter('filter')($scope.data,$scope.search);
        return Math.ceil(myFilteredData.length/$scope.pageSize);                
    }

    $scope.changePage = function(num){
        if (num==1){
            if ($scope.currentPage+1<$scope.numberOfPages()){
                $("#prevPage").removeClass("disabled");
                $scope.currentPage++;
                if ($scope.currentPage+1==$scope.numberOfPages())
                    $("#nextPage").addClass("disabled");
            }
        }
        else{
            if ($scope.currentPage > 0){
                $("#nextPage").removeClass("disabled");
                $scope.currentPage--;
                if ($scope.currentPage==0)
                    $("#prevPage").addClass("disabled");
            }
        }
    }

    // PARA ORDENAR //
    $scope.predicate="estado";
    $scope.reverse=false;
    $scope.orderby = function(fact){
        console.log("fact");
        if ($scope.predicate == fact){
            $scope.reverse = !$scope.reverse;
        }
        else {
            $scope.predicate = fact;
            $scope.reverse = false;
        }
    }

    $scope.edit = function(personal){
        var modalInstance = $modal.open({
            templateUrl: 'partials/administrar/modalPersonal.html',
            controller: 'modalPersonalCtrl',
            backdrop: false,
            windowClass: 'transpModal',
            size: 'lg',
            resolve: {
                personalInfo: function(){
                    return personal;
                }
            }
        });
        modalInstance.result.then(function(selectedItem){
            init();
        });
    }

    $scope.delete = function(personal){
        //pregunto dos veces por si las moscas
        utilsService.alertModal("W","Dar de baja!!","¿Quieres borrar de forma permanente a: (*"+personal.nombre+"*) de la base de datos?").then(function(response){
            if (response)
                utilsService.alertModal("W","ATENCION!!!","Si borras de forma permanente a (*"+personal.nombre+"*) perderas todos sus historiales y datos, estas realmente seguro?").then(function(response){
                                if (response)
                                        administrarService.deletePersonalBD(personal).then(function(msg){
                                                init();   
                                        });
                });
        });
    }
}]);


/////////////////////////////
//CONTROLLER PERSONAL NUEVO//
/////////////////////////////
app.controller('modalPersonalCtrl', ['$scope','personalInfo','$modalInstance','administrarService','utilsService', function($scope,personalInfo,$modalInstance,administrarService,utilsService){
    var nueva = true;
    $scope.save = function(){
        if (!nueva){//set
            utilsService.alertModal("C","Actualizar Empleado","¿Quieres guardar los cambios?").then(function(response){
                    if (response)
                        administrarService.updatePersonalBD($scope.personal).then(function(msg){
                            if (msg.data == "true"){
                                utilsService.alertModal("I","Actualizando Empleado","Cambidos guardados con exito!!!").then(function(response){
                                    if (response)
                                        $modalInstance.close();
                                });  
                            }
                            else console.log(msg.data);
                        });
            });
        }
        else{//update
            utilsService.alertModal("C","Guardar Empleado Nuevo","¿Quieres guardar al nuevo Empleado?").then(function(response){
                    if (response)
                        administrarService.setPersonalBD($scope.personal).then(function(msg){
                            if (msg.data == "true"){
                                utilsService.alertModal("I","Guardando Empleado","Empleado introducido con exito!").then(function(response){
                                    if (response)
                                        $modalInstance.close();
                                });  
                            }
                            else console.log(msg.data);
                        });
            });
        }
    }

    $scope.cancel = function(){
        $modalInstance.dismiss();
    }

    var init = function(){
        $scope.cargos=['Admin','Gestion','Personal'];
        $scope.options=['activo','inactivo'];
        if (personalInfo != null){
            $scope.editar = true;
            $scope.personal = personalInfo;
            $scope.descripcionShow = personalInfo.nombre + " " + personalInfo.apellidos;
            nueva=false;
        }
        else{
            $scope.editar = false;
            $scope.personal = {};
            $scope.personal.estado = $scope.options[0];
            $scope.personal.cargo = $scope.cargos[2];
            $scope.personal.color = '#FFFFFF';
            $scope.descripcionShow = "Nuevo Empleado";
        }
    }
    init();
}]);





/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////
//CONTROLLER BONO TARIFAS//
///////////////////////////
app.controller('tarifasBonosCtrl', ['$scope','administrarService','utilsService','$filter','$modal', function($scope,administrarService,utilsService,$filter,$modal){
    console.log("tarifasCtrl");
        var init = function(){ 
        administrarService.getTarifasBonosBD().then(function(data){
            $scope.data = data.data;
            initVariables();
        });    
    }
    init();

    //PAGINAR
    var initVariables = function(){
        $scope.currentPage = 0; 
        $("#prevPage").addClass("disabled");
        $("#nextPage").addClass("disabled");
        if ($scope.numberOfPages() > 1)
            $("#nextPage").removeClass("disabled");
    }

    //cada vez que se filtre, se rechekea el paginator
    $scope.$watch('search',function(){
        initVariables();
    })
    
    $scope.data = [];
    $scope.pageSize = 10;

    $scope.numberOfPages=function(){
        var myFilteredData = $filter('filter')($scope.data,$scope.search);
        return Math.ceil(myFilteredData.length/$scope.pageSize);                
    }

    $scope.changePage = function(num){
        if (num==1){
            if ($scope.currentPage+1<$scope.numberOfPages()){
                $("#prevPage").removeClass("disabled");
                $scope.currentPage++;
                if ($scope.currentPage+1==$scope.numberOfPages())
                    $("#nextPage").addClass("disabled");
            }
        }
        else{
            if ($scope.currentPage > 0){
                $("#nextPage").removeClass("disabled");
                $scope.currentPage--;
                if ($scope.currentPage==0)
                    $("#prevPage").addClass("disabled");
            }
        }
    }

    // PARA ORDENAR //
    $scope.predicate="nombrePaciente";
    $scope.reverse=false;
    $scope.orderby = function(fact){
        console.log("fact");
        if ($scope.predicate == fact){
            $scope.reverse = !$scope.reverse;
        }
        else {
            $scope.predicate = fact;
            $scope.reverse = false;
        }
    }

    $scope.edit = function(tarifa){
        var modalInstance = $modal.open({
            templateUrl: 'partials/administrar/modalTarifaBono.html',
            controller: 'modalTarifaBonoCtrl',
            backdrop: false,
            windowClass: 'transpModal',
            size: 'sm',
            resolve: {
                tarifaInfo: function(){
                    return tarifa;
                }
            }
        });
        modalInstance.result.then(function(selectedItem){
            init();
        });
    }

    $scope.delete = function(tarifa){
        console.log("borrando");
        utilsService.alertModal("W","Borrar BONO","¿Quieres Borrar de forma permanente el Bono: (*"+tarifa.descripcion+"*)?").then(function(response){
                        if (response)
                                administrarService.deleteTarifaBonoBD(tarifa).then(function(msg){
                                        init();   
                                });
        });
    }
}]);


/////////////////////////////////
//CONTROLLER MODAL BONO TARIFAS//
/////////////////////////////////
app.controller('modalTarifaBonoCtrl', ['$scope','tarifaInfo','$modalInstance','administrarService','utilsService', function($scope,tarifaInfo,$modalInstance,administrarService,utilsService){
    var nueva = true;
    $scope.save = function(){
        if (!nueva){//set
            utilsService.alertModal("C","Actualizar Bono","¿Quieres guardar los cambios?").then(function(response){
                    if (response)
                        administrarService.updateTarifaBonoBD($scope.tarifa).then(function(msg){
                            if (msg.data == "true"){
                                utilsService.alertModal("I","Actualizando Bono","Cambidos guardados con exito!!!").then(function(response){
                                    if (response)
                                        $modalInstance.close();
                                });  
                            }
                            else console.log(msg.data);
                        });
            });
        }
        else{//update
            utilsService.alertModal("C","Guardar Bono Nuevo","¿Quieres guardar el bono nuevo?").then(function(response){
                    if (response)
                        administrarService.setTarifaBonoBD($scope.tarifa).then(function(msg){
                            if (msg.data == "true"){
                                utilsService.alertModal("I","Guardando Bono","Bono introducido con exito!").then(function(response){
                                    if (response)
                                        $modalInstance.close();
                                });  
                            }
                            else console.log(msg.data);
                        });
            });
        }
    }

    $scope.cancel = function(){
        $modalInstance.dismiss();
    }

    var init = function(){
        $scope.options=['si','no'];
        if (tarifaInfo != null){
            $scope.editar = true;
            $scope.tarifa = tarifaInfo;
            $scope.descripcionShow = tarifaInfo.descripcion;
            nueva=false;
        }
        else{
            $scope.editar = false;
            $scope.tarifa = {};
            $scope.descripcionShow = "Nueva Tarifa";
        }
    }
    init();
}]);