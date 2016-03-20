'use strict';

///////////////////////////////////////////////////
////***** CONTROLLER TABLA DE PACIENTES ******/////
///////////////////////////////////////////////////
app.controller('clienteTablaCtrl', function(clientesService, $scope, $modal, $window,$state,$filter,$q) {
    var responsablesBD;
    var firstTime=true;
    $scope.prevClass = "disabled";
    $scope.nextClass = "";
    $scope.selectedResponsable={};
    $scope.selectedResponsable.id_personal='';
    var init = function(){ 
        var responsablesPromise= clientesService.getAdminsBD(),
            clientesPromise = clientesService.getClientesBD();

        $q.all([clientesPromise,responsablesPromise]).then(function(arrayBD){
            $scope.data = arrayBD[0].data;
            if (firstTime){
                responsablesBD = arrayBD[1].data;
                makeArrayResponsables();
                firstTime=false;
            }
            initVariables();
        }) 

    }
    init();

    var makeArrayResponsables = function(){
        $scope.responsables=[{"nombre":"-- TODOS --","id_personal":""}];
        var sinAsignar = {"nombre":" -- SIN ASIGNAR -- ","id_personal":"null"};
        responsablesBD.push(sinAsignar);
        for (var i=0; i<responsablesBD.length; i++){
            $scope.responsables.push(responsablesBD[i]);
        }
        $scope.selectedResponsable  = $scope.responsables[0];  
    }

    function removeAccents(value) {
        return value
             .replace(/á/g, 'a') 
             .replace(/â/g, 'a')            
             .replace(/é/g, 'e')
             .replace(/è/g, 'e') 
             .replace(/ê/g, 'e')
             .replace(/í/g, 'i')
             .replace(/ï/g, 'i')
             .replace(/ì/g, 'i')
             .replace(/ó/g, 'o')
             .replace(/ô/g, 'o')
             .replace(/ú/g, 'u')
             .replace(/ü/g, 'u')
             .replace(/ç/g, 'c')
             .replace(/ß/g, 's');
    }

    $scope.ignoreAccents = function (item) {
        if ($scope.search) {
            var search = removeAccents($scope.search.toLowerCase());
            var find = removeAccents(item.nombrePaciente.toLowerCase() + ' ' + item.apellidosPaciente.toLowerCase())+ ' ' + item.telefonoMadre+ ' ' + item.telefonoPadre;
            return find.indexOf(search) > -1;
        }
        return true;
    };

    //PAGINAR
    var initVariables = function(){
        $scope.currentPage = 0; 
        if ($scope.numberOfPages() > 1)
            $scope.nextClass="";
    }

    //cada vez que se filtre, se rechekea el paginator
    $scope.$watch('search',function(){
        initVariables();
    })

    $scope.$watch('selectedResponsable',function(){
        initVariables();
    })
    
    $scope.data = [];
    $scope.pageSize = 10;

    $scope.numberOfPages=function(){
        var myFilteredData = $filter('filter')($scope.data,$scope.search);
            myFilteredData = $filter('filter')(myFilteredData,{id_responsable:$scope.selectedResponsable.id_personal});
        return Math.ceil(myFilteredData.length/$scope.pageSize);                
    }

    $scope.changePage = function(num){
        if (num==1){
            if ($scope.currentPage+1<$scope.numberOfPages()){
                $scope.prevClass="";
                $scope.currentPage++;
                if ($scope.currentPage+1==$scope.numberOfPages())
                    $scope.nextClass = "disabled";
            }
        }
        else{
            if ($scope.currentPage > 0){
                $scope.nextClass = "";
                $scope.currentPage--;
                if ($scope.currentPage==0)
                    $scope.prevClass="disabled";
            }
        }
    }

    // PARA ORDENAR //
    $scope.predicate="nombrePaciente";
    $scope.reverse=false;
    $scope.orderby = function(fact){
        if ($scope.predicate == fact){
            $scope.reverse = !$scope.reverse;
        }
        else {
            $scope.predicate = fact;
            $scope.reverse = false;
        }
    }

    //*****mostrar formulario cliente nuevo******
    $scope.nuevoCliente=function(){
        $scope.nuevoCliente={};
        var modalInstance = $modal.open({
            templateUrl: 'partials/clientes/clienteNew.html',
            controller: 'nuevoClienteCtrl',
            windowClass: 'transpModal',
            backdrop: false,
            size: 'lg',
            resolve: {
                nuevoCliente: function(){
                    return $scope.nuevoCliente;
                },
                responsablesBDInfo: function(){
                    return responsablesBD;
                }
            }
        });
        modalInstance.result.then(function(selectedItem){
            init();
        });
    };

    $scope.fichaCliente = function(cliente){
        var modalInstance = $modal.open({
            templateUrl: 'partials/clientes/clienteFicha.html',
            controller: 'fichaClienteCtrl',
            windowClass: 'transpModal',
            backdrop: false,
            size: 'lg',
            resolve: {
                clienteInfo: function(){
                    return cliente;
                },
                responsablesBDInfo: function(){
                    return responsablesBD;
                }
            }
        });
        modalInstance.result.then(function(selectedItem){
            init();
        });
    }
});




////////////////////////////////////////////////////
////***** CONTROLLER MODAL USUARIO NUEVO ******/////
////////////////////////////////////////////////////
app.controller('nuevoClienteCtrl', function($state, $scope, $modalInstance, nuevoCliente, clientesService,responsablesBDInfo) {
    $scope.nuevoCliente = nuevoCliente;
    $scope.guardarCliente=function(){
        clientesService.setClienteBD($scope.nuevoCliente).then(function(data){
            $scope.nuevoCliente.id_cliente = data.data;
            $modalInstance.close($scope.nuevoCliente);
        });
    };
    $scope.cancel= function(){
        $modalInstance.dismiss('cancel');
    }

    $scope.predicate = '-age';
});




///////////////////////////////////////////////
////***** CONTROLLER FICHA PACIENTE ******/////
///////////////////////////////////////////////
app.controller('fichaClienteCtrl', ['$modal','$q','$modalInstance', '$scope', 'utilsService','clientesService','clienteInfo','agendaService','sessionService','$filter','$window','contabilidadService','responsablesBDInfo', function($modal,$q,$modalInstance, $scope, utilsService, clientesService, clienteInfo,agendaService,sessionService,$filter,$window,contabilidadService,responsablesBDInfo) {
    $scope.mesesDescripcion = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    var cambiosRealizados = false;
    var dias = ["Lunes","Martes","Miercoles","Jueves","Viernes"];
    /******    --TAB INFO--    ******/
    var initInfo = function(){
        $scope.editar = true;
        $scope.responsables=angular.copy(responsablesBDInfo).reverse();
        makeArrayResponsables();
    }

    $scope.changeResponsable = function(){
        $scope.cliente.id_responsable = $scope.selectedResponsable.id_personal;
    }

    var makeArrayResponsables = function(){
        var sinAsignar=true;
        for (var i=0; i<$scope.responsables.length; i++){
            if ($scope.cliente.id_responsable == $scope.responsables[i].id_personal){
                $scope.selectedResponsable = $scope.responsables[i];
                sinAsignar=false;
            }
        }
        if (sinAsignar)
                $scope.selectedResponsable = $scope.responsables[0];
    }

    $scope.save = function(){
        utilsService.alertModal("C","Actualizar Paciente","¿Quieres guardar los cambios?").then(function(response){
                if (response)
                    clientesService.updateClienteBD($scope.cliente).then(function(msg){
                        if (msg.data != "false"){
                            utilsService.alertModal("I","Actualizando Paciente","Cambidos guardados con exito!!!").then(function(response){
                                if (response){
                                    $scope.editar=true;//$modalInstance.close();
                                    cambiosRealizados=true;
                                }
                            });  
                        }
                        else
                            console.log(msg.data);
                    });
        });
    }
    ///////////////////////////////////
    /******    --TAB CITAS--    ******/
    ///////////////////////////////////
    var yearAux=-1, monthAux=-1;
    var psicologas,tarifas,salas;
    var initCitas = function(){
        var yearsPromise = clientesService.getCitasClienteYearsMonthsBD({'id_cliente':$scope.cliente.id_cliente}),
            psicologasPromise = agendaService.getPsicologasBD1(),
            tarifasPromise = agendaService.getTarifasBD(),
            salasPromise = agendaService.getSalasBD();

        $q.all([yearsPromise,psicologasPromise,tarifasPromise,salasPromise]).then(function(dataArray){
            $scope.years = dataArray[0].data;
            psicologas = dataArray[1].data;
            tarifas = dataArray[2].data;
            salas = dataArray[3].data;
        }); 
    }

    //funcion que llama a la getCitasAux si es la primera vez que se clicka en esa opcion
    $scope.getCitas = function(year,month){
        if (year!=yearAux || month!=monthAux){
            yearAux=year;
            monthAux=month;
            getCitasAux(year,month);
        }
    }

    //peticion de citas de un cliente por mes y año
    var getCitasAux = function(year,month){
        clientesService.getCitasClienteBD({'id_cliente':$scope.cliente.id_cliente,'year':year,'month':month}).then(function(data){
                $scope.citas = data.data;
                for (var i=0;i<$scope.citas.length;i++){
                    $scope.citas[i].diaDesc = dias[(new Date($scope.citas[i].fecha).getDay())-1];
                    $scope.citas[i].diaNum = new Date($scope.citas[i].fecha).getDate();
                    $scope.citas[i].hora2 = parseInt($scope.citas[i].hora)+1;
                    for (var j=0; j<psicologas.length; j++){
                        if ($scope.citas[i].id_personal == psicologas[j].id_personal){
                            $scope.citas[i].responsable = psicologas[j];
                            j=psicologas.length+1;
                        }
                    }
                }
        });
    }

    $scope.goCita = function(cita) {
        var extraInfo=1; //dummi
        cita.cliente=$scope.cliente;
        var modalInstance = $modal.open({
            templateUrl: 'partials/agenda/agendaCita.html',
            controller: 'citaCtrl',
            backdrop: false,
            windowClass: 'transpModal',
            size: 'lg',
            resolve: {
                citaInfo: function(){
                    return cita;
                },
                salasInfo: function(){
                    return salas;
                },
                psicologasInfo: function(){
                    return psicologas;
                },
                tarifasInfo: function(){
                    return tarifas;
                },
                extraInfo: function(){
                    return extraInfo;
                }
            }
        });
        modalInstance.result.then(function(selectedItem){
            getCitasAux(yearAux,monthAux);
        });
    };

    $scope.verGrupo = function(cita){
        if (cita.grupo=="si")
            agendaService.verGrupo(cita);
    }




    /******    --TAB HISTORIAL--    ******/
    var initHistorial = function(){
        $scope.noDocumentos = false;
        clientesService.getListadoDocumentosBD(clienteInfo.id_cliente).then(function(rsp){
            if (rsp.data.length>0){
                $scope.documentos = rsp.data;
                $scope.documentosCoordinaciones = rsp.data.filter(function (documento) {
                    return (documento.tipo == "Coordinaciones");
                }); 
                $scope.tipoDocumentos=$filter('unique')(rsp.data,"tipo");
                $scope.tipoCoordinaciones=$filter('unique')($scope.documentosCoordinaciones,"subtipo");
            }
            else
                $scope.noDocumentos = true;
        })
    }

    $('input.nospace').keydown(function(e) {
        // alert (e.keyCode); 
        if (e.keyCode == 32) { 
            return false; 
        } 
    });

    var paramsFile;
    $scope.uploadTrigger = function (documento) {
        paramsFile=documento;
        $("#inputFileUpdate").click();
    };

    $scope.uploadFile = function(file) {
        //si el archivo que suben se llama igual que el que existe
        var mismoArchivo = false;
        var nameFileBD = paramsFile.url_file.split('/').reverse()[0];
        if (file[0].name == nameFileBD)
            mismoArchivo = true;
        else if (file[0].name == paramsFile.titulo+"."+paramsFile.extension)
            mismoArchivo = true;
        else if (file[0].name.length >= nameFileBD.length){ //mide mas-- porque se añade el (x)
            var newFileArray = file[0].name.split('.').reverse();
            var nombreNewFileArray = ""; 
            // En el en newFileArray[0] se guarda la extension, y en los siguientes el nombre del fichero (si el titulo tiene puntos, hay mas de uno)
            for (var i=newFileArray.length-1; i>0; i--){
                nombreNewFileArray +=newFileArray[i];
            }
            var oldFileArray = nameFileBD.split('.').reverse();
            if (newFileArray[0] == paramsFile.extension && nombreNewFileArray.substr(0,paramsFile.titulo.length) == paramsFile.titulo){ // misma extension y nombre sin parentesis
                mismoArchivo = true;
            }
        }

        if (mismoArchivo){
            var promise = clientesService.updateFileBD(file[0],paramsFile).then();
            utilsService.dialogLoading("Actualizando archivo...",promise).then(function(rsp){
                console.log(rsp.data);
                initHistorial();
            })
        }
        else{
            alert("Archivo esperado similar a: ("+paramsFile.titulo+"."+paramsFile.extension+") o ("+nameFileBD+")");
        }
        
    };

    $scope.downloadFile = function(file){
        $window.location.href=('data/clientes/apiFileDownload.php?url_file='+file.url_file+'&titulo='+file.titulo+'&extension='+file.extension+'&paciente='+nombreApellidos);
    }

    $scope.downloadBackup = function(file){
        $window.location.href=('data/clientes/apiFileDownload.php?url_file='+file.url_backup+'&titulo='+file.titulo+'&extension='+file.extension+'&paciente='+nombreApellidos);
    }

    $scope.deleteFile = function(file){
        utilsService.alertModal("C","Eliminar: ("+file.titulo+"."+file.extension+")","¿Borrar el archivo del sistema?").then(function(response){
                    if (response){
                        var promise =clientesService.deleteFileBD(file).then();
                        utilsService.dialogLoading("Borrando archivo...",promise).then(function(rsp){
                            initHistorial();
                        })
                    }
            });
    }

    $scope.newFileModal = function(){
        var modalInstance = $modal.open({
            templateUrl: 'partials/clientes/newFileModal.html',
            controller: 'newFileModalCtrl',
            backdrop: false,
            windowClass: 'transpModal',
            size: 'md',
            resolve: {
                clientInfo: function(){
                    return clienteInfo;
                }         
            }
        });
        modalInstance.result.then(function(selectedItem){
            initHistorial();
        });
    }








    /******    --TAB FACTURACION--    ******/
    var initFacturacion = function(){
        $scope.meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
        $scope.noFacturas=true;
        contabilidadService.getFacturasClienteBD(clienteInfo.id_cliente).then(function(facturasBD){
            if (facturasBD.data.length>0){
                for (var i=0;i<facturasBD.data.length;i++){
                    facturasBD.data[i].importe = parseFloat(facturasBD.data[i].importe);
                    facturasBD.data[i].importeCobrado = parseFloat(facturasBD.data[i].importeCobrado);
                    facturasBD.data[i].importePendiente = facturasBD.data[i].importe - facturasBD.data[i].importeCobrado;
                }
                $scope.noFacturas=false;
                $scope.facturas=facturasBD.data;
                initVariablesPaginacion();
            }
        })
    }

    var initVariablesPaginacion = function(){
        $scope.data = [];
        $scope.dataFilter = [];
        $scope.pageSize = 10;
        $scope.predicate="id_factura";
        $scope.reverse=false;
        $scope.currentPage = 0; 
        $scope.prevPageClass="disabled";
        $scope.nextPageClass="";
    }

    $scope.numberOfPages=function(){
        var numberOfPages = parseInt($scope.facturas.length / $scope.pageSize);
        if ($scope.facturas.length % $scope.pageSize > 0)
            numberOfPages++;
        return numberOfPages;              
    }

    $scope.changePage = function(num){
        if (num==1){
            if ($scope.currentPage+1<$scope.numberOfPages()){
                $scope.prevPageClass="";
                $scope.currentPage++;
                if ($scope.currentPage+1==$scope.numberOfPages())
                    $scope.nextPageClass="disabled";
            }
        }
        else{
            if ($scope.currentPage > 0){
                $scope.nextPageClass="";
                $scope.currentPage--;
                if ($scope.currentPage==0)
                    $scope.prevPageClass="disabled";
            }
        }
    }

    // PARA ORDENAR //
    $scope.orderby = function(field){
        if ($scope.predicate == field){
            $scope.reverse = !$scope.reverse;
        }
        else {
            $scope.predicate = field;
            $scope.reverse = false;
        }
    }

    $scope.showFactura = function(factura){
        contabilidadService.showFactura(factura.id_factura).then(function(rsp){
            if (rsp){
                initFacturacion();
            }
            else
                console.log("cancelado");
        });
    }







    /******    --GENERAL--    ******/
    $scope.changeTabVar = function(op){
        if (op!=$scope.tabVar){
            $scope.tabVar = op;
            switch(op){
                case 1: initInfo();
                        break;
                case 2: initCitas();
                        break;
                case 3: initHistorial();
                        break;
                case 4: initFacturacion();
                        break;
            }
        } 
    }

    $scope.cancel = function(){
        if (cambiosRealizados){
            $modalInstance.close();
        }
        else{
            $modalInstance.dismiss();
        }
    }


    var nombreApellidos;
    var init = function(){
        nombreApellidos = clienteInfo.nombrePaciente+" "+clienteInfo.apellidosPaciente;
        $scope.rol = sessionService.get('rol');
        clienteInfo.fechNacPaciente = new Date(clienteInfo.fechNacPaciente);  //parseo la fecha de nacimiento
        clienteInfo.fech_alta = utilsService.parseFecha(clienteInfo.fech_alta,1);  //parseo la fecha del alta
        if (clienteInfo.fech_baja != "0000-00-00 00:00:00"){
            clienteInfo.fech_baja = utilsService.parseFecha(clienteInfo.fech_baja,1);  //parseo la fecha de la baja
        }else
            clienteInfo.fech_baja = "";
        $scope.cliente = clienteInfo;

        initInfo();
    }
    init();

}]);



//////////////////////////////////////////////////////////
///************ NewFileModal CONTROLLER ***************///
//////////////////////////////////////////////////////////
app.controller('newFileModalCtrl', function($scope, $modalInstance, clientInfo, clientesService, utilsService) {
    
    var init = function (){
        $scope.tipoDocumentos = ['Informes','Coordinaciones','Programas','Materiales','Orientaciones',"Entrevistas","Fotos",'Otros'];
        $scope.tipoCoordinaciones = ['Escolares','Familiares','Equipos','Otros Profesionales'];
        $scope.cliente = clientInfo;
        $scope.file = {};
        $scope.file.id_cliente = clientInfo.id_cliente;
    }
       
    init();

    $scope.uploadedFile = function(element) {
        $scope.$apply(function($scope){
            $scope.files = element[0];
        });
    }

    $scope.cancel= function(){
        $modalInstance.dismiss('cancel');
    }

    $scope.upload = function(){
        var promise = clientesService.uploadFileBD($scope.files,$scope.file).then();
        utilsService.dialogLoading("Subiendo Archivo....",promise).then(function(rsp){
            utilsService.alertModal("I","Subida de archivo Finalizada..",rsp.data).then(function(response){
                    if (response)
                        $modalInstance.close("exito");
            });
        })
    }
});