'use strict';

////////////////////////////////////
//CONTROLLER FACTURACION PRINCIPAL//
////////////////////////////////////
app.controller('facturacionCtrl', ['filterFilter','agendaService','$q','$scope','contabilidadService','utilsService','$filter','$modal', function(filterFilter,agendaService,$q,$scope,contabilidadService,utilsService,$filter,$modal){
    var meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    var clientesBD;
    var fechaActual = new Date();

    var init = function(){
        $scope.verAnuladas = false;
        $scope.verCobradas = false;
        $scope.verPendientes = true;
        $scope.desdeSiempre = true;
        var clientesPromise = agendaService.getClientesBD(),
            rangosPromise = contabilidadService.getRangosFacturasBD();
        $q.all([clientesPromise,rangosPromise]).then(function(arrayData){
            clientesBD = arrayData[0].data;
            $scope.rangoYears = arrayData[1].data;
            $scope.yearActivo = $scope.rangoYears[0];
            $scope.changeYearActivo();
            $scope.changeDesdeSiempre(); //Comentar para que empieze por el mes y año actual
        });
    }
    init();

    // 1.-pedir citas sin facturar del mes seleccionado, y anterior
    // 2.-mostrar al usuario el resultado y preguntarle si quiere facturarlo todo
    // 3.-crear las facturas de ese mes
    $scope.facturar = function(){
        contabilidadService.generarFacturas().then(function(facturasPendientes){
            console.log("Numero de facturas pendientes: "+facturasPendientes.length);
            if (facturasPendientes.length>0){
                utilsService.alertModal("C","Periodo Actual: ("+meses[fechaActual.getMonth()]+" - "+fechaActual.getFullYear()+")","Nuevas Facturas: "+facturasPendientes.length).then(function(response){
                    if (response){
                        var promise = contabilidadService.setFacturaCitaBD(facturasPendientes);
                        utilsService.dialogLoading("Generando Facturas....",promise).then(function(rsp){
                            utilsService.alertModal("I","Facturacion finalizada..",rsp.data).then(function(response){
                                    if (response)
                                        $modalInstance.close("exito");
                            });
                        })
                    }                     
                });
            }else{
                utilsService.alertModal("I","Periodo Actual: ("+meses[fechaActual.getMonth()]+" - "+fechaActual.getFullYear()+")","¡No hay citas sin facturar en este periodo o anteriores! ").then(function(response){
                    console.log("no hay facturas pendientes");
                });
            }
        })
    }

    //si cambio el año, cargo el array de meses correspondiente y le meto el nombre del mes
    $scope.changeYearActivo = function(){
        $scope.rangoMonths = $scope.yearActivo.months;
        $scope.monthActivo = $scope.rangoMonths[0];
        for (var i=0; i<$scope.rangoMonths.length; i++){ //para añadir el nombre del mes
                for (var j=0; j<meses.length; j++){
                    $scope.rangoMonths[i].mes = meses[$scope.rangoMonths[i].month-1];
                    j=1+meses.length;
                }
        }
        $scope.changeMonthActivo();
    }

    //si elige ver todas las facturas sin periodo de tiempo, desabilito los selects de year y month, y desactiva, los vuelvo a habilitar
    $scope.changeDesdeSiempre = function(){
        if ($scope.desdeSiempre)
            contabilidadService.getFacturasAllBD().then(function(data){
                makeFactura(data.data);
                $scope.changeFilters();
                $scope.yearActivo = "";
                $scope.monthActivo = "";
            });
        else{
            $scope.yearActivo = $scope.rangoYears[0];
            $scope.changeYearActivo();
            $scope.changeMonthActivo();
        }
    }

    $scope.changeMonthActivo = function(){
        var params = {"month":$scope.monthActivo.month,"year":$scope.yearActivo.year};
        contabilidadService.getFacturasPorRangoBD(params).then(function(data){
            makeFactura(data.data);
            $scope.changeFilters();
        });
    }

    var makeFactura = function(data){
        $scope.data=data;
        for (var i=0; i<$scope.data.length; i++){ //para añadir el nombre y apellidos del paciente
                $scope.data[i].fecha2 = utilsService.parseFecha($scope.data[i].fecha_creacion,0); //parseo fecha para mostrar en fecha2 en la vista
                $scope.data[i].id_factura = parseInt($scope.data[i].id_factura); //parseo a int para ordenar en tabla
                $scope.data[i].importe = parseInt($scope.data[i].importe);  //parseo a int para ordenar en tabla
                $scope.data[i].importePendiente = parseInt($scope.data[i].importe)-parseInt($scope.data[i].importeCobrado);
                $scope.data[i].mes = meses[$scope.data[i].month-1]
                for (var j=0; j<clientesBD.length; j++){
                    if (clientesBD[j].id_cliente == $scope.data[i].id_cliente){
                        $scope.data[i].nombrePaciente = clientesBD[j].nombrePaciente;
                        $scope.data[i].apellidosPaciente = clientesBD[j].apellidosPaciente;
                        j=1+clientesBD.length;
                    }
                }
        }
    }

    $scope.changeFilters = function(){
        $scope.dataFilter = filterFilter($scope.data,{estado:"activa"});
        if (!$scope.verPendientes)
            $scope.dataFilter = filterFilter($scope.dataFilter,{cobrada:"si"});
        if (!$scope.verCobradas)
            $scope.dataFilter = filterFilter($scope.dataFilter,{cobrada:"no"});
        if ($scope.verAnuladas)
            $scope.dataFilter = filterFilter($scope.data,{estado:"anulada"});
    }

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
    $scope.dataFilter = [];
    $scope.pageSize = 10;

    $scope.numberOfPages=function(){
        var myFilteredData = $filter('filter')($scope.dataFilter,$scope.search);
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
    $scope.predicate="id_factura";
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

    $scope.showFactura = function(factura){
        contabilidadService.showFactura(factura.id_factura).then(function(rsp){
            if (rsp){
                refrescar();
            }
            else
                console.log("cancelado");
        });
    }


    var refrescar = function(){
        if ($scope.desdeSiempre)
            $scope.changeDesdeSiempre();
        else
            $scope.changeMonthActivo();
    }

}]);



/////////////////////////////////////////
//CONTROLLER GENERAR FACTURA INDIVIDUAL//
/////////////////////////////////////////
app.controller('generarFacturaCitaCtrl', function($q,$scope, $modalInstance, citaInfo, contabilidadService, utilsService, administrarService) {
    var init = function (){
        console.log(citaInfo);
        $scope.factura = citaInfo;
        $scope.factura.id_cliente = citaInfo.id_cliente;
        $scope.factura.fecha2 = utilsService.parseFecha(citaInfo.fecha,0);
        $scope.factura.month = citaInfo.fecha.getMonth()+1;
        $scope.factura.year = citaInfo.fecha.getFullYear();
        //$scope.factura.today = utilsService.parseFecha(new Date(),0);
        $scope.factura.observaciones = "";
        $scope.factura.citas = [];
        $scope.factura.conceptos = [];

        var citasBD = contabilidadService.getCitasClienteTarifaBD($scope.factura),
            bonosBD = administrarService.getTarifasBonosBD(),
            tarifasBD = administrarService.getTarifasBD();
        $q.all([citasBD,bonosBD,tarifasBD]).then(function(dataArray){
            //funcion que calcula los precios y bonos parciales
            var auxFactura = contabilidadService.makeFactura(dataArray[0].data,dataArray[1].data,dataArray[2].data);
            $scope.factura.conceptos=auxFactura.conceptos;
            $scope.factura.citas=auxFactura.citas;
            $scope.factura.importe=auxFactura.importe;
            //carga las citas para mostrarlas, y luego editarlas
            for (var i=0; i < $scope.factura.citas.length; i++){
                $scope.factura.citas[i].count=i+1;
                $scope.factura.citas[i].fecha2 = utilsService.parseFecha($scope.factura.citas[i].fecha,0);
                for (var j=0;j<dataArray[2].data.length;j++){
                    if (dataArray[2].data[j].id_tarifa == $scope.factura.citas[i].id_tarifa){
                        $scope.factura.citas[i].acronimo = dataArray[2].data[j].acronimo;
                    }
                }
            }
        });
    }

    init();

    $scope.accept = function(){
        var facturas = [];
        facturas.push($scope.factura);
        console.log(facturas);
        contabilidadService.setFacturaCitaBD(facturas).then(function(data){
            $modalInstance.close();
        });  
    }

    $scope.cancel= function(){
        $modalInstance.dismiss();
    }

    $scope.goCita = function(cita){
        console.log("ver cita"); //implementar esta llamada en el service para poder usarlo desde cualquier sitio
    }
});



////////////////////////////
//CONTROLLER SHOW FACTURA //
////////////////////////////
app.controller('showFacturaCtrl', function($modal,$q,$scope, $modalInstance, facturaInfo, contabilidadService, clientesService, utilsService, administrarService) {
    var unCambioEnLaFactura = false;
    $scope.factura = {};
    $scope.factura.importe=0;
    $scope.factura.importeCobrado=0;
    var init = function (){
        if (facturaInfo.estado=="anulada")
            $scope.anulada=true;
        var clienteBD = clientesService.getClienteIdBD(facturaInfo.id_cliente),
            citasBD = contabilidadService.getCitasFacturaBD(facturaInfo.id_factura),
            tarifasBD = administrarService.getTarifasBD(),
            conceptosBD = contabilidadService.getConceptoTarifaIdBD(facturaInfo.id_factura),
            cobrosBD = contabilidadService.getFacturaCobrosBD(facturaInfo.id_factura),
            facturaBD = contabilidadService.getFacturaIdBD(facturaInfo.id_factura);
        $q.all([clienteBD,citasBD,tarifasBD,conceptosBD,cobrosBD,facturaBD]).then(function(dataArray){
            console.log(dataArray[5].data[0]);
            $scope.factura = dataArray[5].data[0];
            $scope.factura.importe = parseInt($scope.factura.importe);
            $scope.factura.importeCobrado = parseInt($scope.factura.importeCobrado);
            $scope.factura.cliente = dataArray[0].data[0];
            $scope.factura.citas = dataArray[1].data;
            $scope.factura.conceptos = dataArray[3].data;
            $scope.factura.cobros = dataArray[4].data;
            $scope.factura.importePendiente = parseFloat($scope.factura.importe)-parseFloat($scope.factura.importeCobrado);

            for (var i=0; i < $scope.factura.citas.length; i++){
                $scope.factura.citas[i].count=i+1;
                $scope.factura.citas[i].fecha2 = utilsService.parseFecha($scope.factura.citas[i].fecha,0);
                for (var j=0;j<dataArray[2].data.length;j++){
                    if (dataArray[2].data[j].id_tarifa == $scope.factura.citas[i].id_tarifa){
                        $scope.factura.citas[i].acronimo = dataArray[2].data[j].acronimo;
                    }
                }
            }

            for (var i=0;i <$scope.factura.cobros.length; i++){
                $scope.factura.cobros[i].fecha = new Date($scope.factura.cobros[i].fecha);
            }
        })
    }

    init();

    $scope.update = function(op){
        if (op){
            utilsService.alertModal("C","Actualizando Factura","¿Guardar los cambios realizados en la factura Nº:"+$scope.factura.id_factura+"?").then(function(response){
                if (response){
                    facturaInfo = $scope.factura;
                    contabilidadService.updateFacturaBD($scope.factura).then(function(data){
                        if (data.data == "true"){
                            utilsService.alertModal("I","CAMBIOS GUARDADOS","Cambios guardados con éxito!!").then(function(response){
                                $scope.editar=false;
                                $modalInstance.close();
                            });
                        }
                    })
                }
            });
        }
        else{
            $scope.factura.observaciones = facturaInfo.observaciones;
            $scope.factura.importe = facturaInfo.importe;
            $scope.editar = false;
        } 
    }

    $scope.anular = function(){
        if (!$scope.factura.cobros.length>=0){
            utilsService.alertModal("W","Anular Factura","¿Quieres Anular de forma permanente la factura: Nº:"+$scope.factura.id_factura+" ?").then(function(response){
                if (response)
                    contabilidadService.anularFacturaBD($scope.factura.id_factura).then(function(data){
                        facturaInfo.estado="anulada";
                        utilsService.alertModal("I","FACTURA ANULADA","Factura anulada con exito!! Las citas que pertenecian a esta factura, pasan a estar no facturadas!!").then(function(response){
                            $modalInstance.close();
                        });
                    })              
            });
        }
    }

    $scope.cobrar = function(){
        if ($scope.factura.importePendiente>0){  //comprueba que no sea un festivo
            var modalInstance = $modal.open({
                templateUrl: 'partials/contabilidad/modalCobros.html',
                controller: 'facturaCobrosCtrl',
                backdrop: false,
                windowClass: 'transpModal',
                size: 'md',
                resolve: {
                    facturaInfo: function(){
                        return $scope.factura;
                    }
                }
            });
            modalInstance.result.then(function(selectedItem){
                unCambioEnLaFactura = true;
                init();
            });
        }
        else
            alert("no queda nada por cobrar");

    }

    $scope.removeCobro = function(cobro){
        console.log(cobro);
        utilsService.alertModal("W","Borrar Cobro","¿Eliminar el cobro de "+cobro.cantidad+" €?").then(function(response){
            if (response)
                contabilidadService.deleteCobroBD(cobro).then(function(data){
                    utilsService.alertModal("I","COBRO ELIMINADO","Cobro elminado. Se ha actualizado la Factura: "+cobro.id_factura).then(function(response){
                        $scope.editar=false;
                        init();
                        unCambioEnLaFactura = true;
                    });

                })              
        });
    }

    $scope.cancel= function(){
        if (unCambioEnLaFactura)
            $modalInstance.close();
        else
            $modalInstance.dismiss();
    }
});




////////////////////////////
//CONTROLLER SHOW FACTURA //
////////////////////////////
app.controller('facturaCobrosCtrl', function($q, $scope, $modalInstance, facturaInfo, contabilidadService, utilsService) {
    console.log("facturaController");
    var init = function (){
        $scope.factura = angular.copy(facturaInfo);
        $scope.formasDePago = ['Efectivo','Transferencia','Tarjeta','Beca'];
        $scope.cobro = {cantidad:$scope.factura.importePendiente, formaDePago:$scope.formasDePago[0], id_factura:$scope.factura.id_factura};
    }

    init();

    $scope.confirmarCobro = function(){
        if ($scope.cobro.cantidad == facturaInfo.importePendiente)
            var txt = "Se va a proceder al cobro de la factura en su totalidad: "+$scope.cobro.cantidad+" €";
        else
            var txt = "Se va a realizar un cobro parcial de: "+$scope.cobro.cantidad+" €";
        console.log($scope.cobro);
        utilsService.alertModal("C","CONFIRMAR COBRO",txt).then(function(response){
            if (response){
                contabilidadService.cobrarFacturaBD($scope.cobro).then(function(data){
                    if (data.data)
                        txt = "Cobro registrado con éxito!!";
                    else
                        txt = "Ocurrio algun problema, vuelva a repetir el proceso!!"
                    utilsService.alertModal("I","COBRO FINALIZADO",txt).then(function(response){
                        $modalInstance.close();
                    });
                });
            }
        });
    }


    $scope.cancel= function(){
        $modalInstance.dismiss();
    }
});