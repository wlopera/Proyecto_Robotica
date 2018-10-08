(function() {
  "use strict";

  angular.module('RoboticaApp', ["ngTable"])
    .controller("RoboticaController", ["$scope", "$timeout", "NgTableParams", function($scope, $timeout, NgTableParams) {

  /*****************************************************************
  * Constantes
  ******************************************************************/
  $scope.daysAYear= 365; // Cantidad de días en un año

  /*****************************************************************
  * Variables Iniciales
  ******************************************************************/
  // Tab actual
  $scope.tab = 1;

  // Avance de la tabla
  $scope.sizetable = 8;

  $scope.messageToCultivate = "";

  // Mostrar/ocultar boton de procesamiento
  $scope.showButton = true;

  $scope.showProduce = false;
  $scope.showCultivate = false;

  // Bandera para mostrar los legos
  $scope.showProduct = false;

  // Bandera para iniciar procesamiento
  $scope.showGeneralParametersButton = true;
  $scope.showFoodDataButton = true;
  $scope.showProcessButton = true;
  $scope.showInitButton = true;
  $scope.nroApartment = 1;
  $scope.selectedMessage_1 = false;
  $scope.selectedMessage_2 = false;

  // Permite manejo -tabs- de la vista principal
  $scope.setTab = function(newTab) {
    $scope.tab = newTab;
  };

  $scope.isSet = function(tabNum) {
    return $scope.tab === tabNum;
  };

  // Maxima Produccion
  $scope.totalMaximum = 0;

  // Total de produccion en almacen 1
  $scope.totalStore = 0;

  // Total temporal de produccion en almacen 1
  $scope.totalStoreTemp = 0;

  // Total de cultivos actuales edificio 1
  $scope.edificio_1 = 0;

  // Registro de iteracion
  $scope.records = [
  ];

  // Cantidad de producto a cultivar
  $scope.crop = 0;
  // Cantidad de producto en cultivo
  $scope.cultivating = 0;

  // Este es el objeto que sirve para declarar los valores por defecto para realizar los calculos poblacionales?????
  $scope.calcPopulation = {
    currentPopulation: 4000000,  // Poblacion actual [Este annio]
    births: 50000,      // Nacimientos este annio
    deaths:10000,       // Defunciones este annio
    immigration: 10000,  // Inmigracion este annio
    emigration: 1000,   // Emigracion este annio
    birthsMinusDeaths: 0,       // Nacimientos menos defunciones
    immigrationMinusEmigration: 0, // Inmigracion menos emigracion
    populationGrowth: 0, // Tasa de crecimiento poblacional este annio
    dailyPopulationGrowth: 0, // Tasa de crecimiento poblacional diario
    dailyPopulationGrowthPercentage: 0 // POrcentaje de la tasa de crecimiento poblacional diario
  }

  // Este es el objeto que sirve para definir las características principales del alimento???
  $scope.itemProduct ={
    name: "Tomate",
    rateGrowth: 0,  // Tasa diaria de crecimiento de la población
    currentPopulation: 0, // Población actual
    currentcrops: 300, // Son los cultivos en tierra que se producen actualmente, expresado en toneladas
    imports: 1000,   // Es la importación actual del alimento, expresado en toneladas
    humanDemand: 300,  // Es la cantidad (en gramos) del alimento que demanda diariamente un habitante
    conversionGramsToTons: 1000000, // Factor de conversión de gramos a Ton
    timeForIndependence: 12,  // Es el tiempo en el que desea lograr la independencia alimentaria
    dailyIncrementFactor: 1200, // Factor de incremento de cultivo diario [En Ton]
    harvestTime: 3, // Tiempo cosecha tomate [En días]
    unit: "Ton.", // Unidad base del producto
    color: "Red" // Color que identifica al producto
};

  // Registro dinamico
  $scope.iteration = {
    id: 0,
    currentPopulation: 0,
    demand: 0,
    currentProduction: 0,
    xImport: 0,
    crop: 0,
    totalNationalOffer: 0,
    xExport: 0,
    xHarvest: 0,
    apartment:0,
    step: 0,
    registers: 1,
    current: true
  };

  $scope.currentIteration = {};

    /*****************************************************************
     * Ventana Procesamiento: Variables - metodos
     ******************************************************************/
     /**
     * @class <strong>Inicializa los valores iniciales  del proceso</strong>
     */
     $scope.updateData = function() {
       // Nacimientos menos defunciones
      $scope.calcPopulation.birthsMinusDeaths = $scope.calcPopulation.births - $scope.calcPopulation.deaths;

      // Inmigracion menos emigracion
      $scope.calcPopulation.immigrationMinusEmigration = $scope.calcPopulation.immigration - $scope.calcPopulation.emigration;

      // Tasa de crecimiento poblacional este annio
      $scope.calcPopulation.populationGrowth = $scope.calcPopulation.birthsMinusDeaths + $scope.calcPopulation.immigrationMinusEmigration;

      // Tasa de crecimiento poblacional diario
      $scope.calcPopulation.dailyPopulationGrowth = parseInt(Math.round($scope.calcPopulation.populationGrowth / $scope.daysAYear));

      // Porcentaje de la tasa de crecimiento poblacional diario
      $scope.calcPopulation.dailyPopulationGrowthPercentage = ($scope.calcPopulation.populationGrowth / $scope.daysAYear / $scope.calcPopulation.currentPopulation * 100).toFixed(3);

      // Tasa crec. [Día]
      $scope.itemProduct.rateGrowth = $scope.calcPopulation.dailyPopulationGrowthPercentage;

      // Población [Hab/día]
      $scope.itemProduct.currentPopulation =  $scope.calcPopulation.currentPopulation

      $scope.iteration.step = parseInt($scope.itemProduct.harvestTime);
     }

    /**
    * @class <strong>Abre la ventana modal para ingresar registros a procesar</strong>
    * <br><br>
    * Recorre los registros actuales para validar si existen registros por procesar
    * <ul>
    * <li>Existe: Crear nuevos registros, manteniendo el actual como el primero a procesar</li>
    * <li>No existe: Crear nuevos registros, selecciona el primero agregado como el actual a procesar</li>
    * </ul>
   */
    $scope.showModal = function() {

      /**
      * @description Variable para almacenar si existe registro actua por procesar
      * @type {boolen}
      */
      var hasValueCurrent = false;

      angular.forEach($scope.records, function(value, key) {
        if (value.current == true) {
          hasValueCurrent = value.current;
        }
      });

      if (hasValueCurrent) {
        nextRegister(false);
      } else {
        nextRegister(true);
      }

      $('#recordModal').modal('show');
    }

    /**
    * @class <strong>Genera registro a procesar</strong>
    * <br><br>
    * @param {boolean} valueClass (true) Registro actual
   */
    var nextRegister = function(valueClass) {

      $scope.iteration.step = parseInt($scope.itemProduct.harvestTime) + $scope.records.length +1;

      // Incrementar la iteracion
      $scope.iteration.id = $scope.records.length + 1;

      $scope.iteration.current = valueClass;

      $scope.labelStore = $scope.itemProduct.unit;

      // Se calcula la población actual multiplicando la población ...
      $scope.iteration.currentPopulation = $scope.itemProduct.currentPopulation +  $scope.iteration.id * $scope.itemProduct.currentPopulation * $scope.itemProduct.rateGrowth / 100;

      var demand =  $scope.iteration.currentPopulation * $scope.itemProduct.humanDemand / $scope.itemProduct.conversionGramsToTons;

      $scope.iteration.demand =  parseInt(Math.round(demand));

      $scope.iteration.currentProduction = $scope.itemProduct.currentcrops;

      $scope.iteration.xImport = $scope.itemProduct.imports;

      if($scope.itemProduct.timeForIndependence > $scope.iteration.id) {
        $scope.iteration.crop = Math.round($scope.iteration.id * ($scope.itemProduct.dailyIncrementFactor/$scope.itemProduct.timeForIndependence));
      } else {
        $scope.iteration.crop = Math.round($scope.itemProduct.timeForIndependence * ($scope.itemProduct.dailyIncrementFactor/$scope.itemProduct.timeForIndependence));
      }

      $scope.iteration.totalNationalOffer = $scope.iteration.currentProduction + $scope.iteration.xImport;

      $scope.iteration.xExport = $scope.iteration.totalNationalOffer - $scope.iteration.demand;

    }

    /**
    * @class <strong>Genera la cantidad de registros requeridas en la vista modal</strong>
    * <br><br>
    * <ul>
    * <li>Crea un regitro</li>
    * <li>Agregar el nuevo registro a la lista de registros</li>
    * <li>Actualiza la paginación de la tabla</li>
    * <li>Cierra la ventana modal</li>
    * </ul>
    * @param {object} iteration Datos iniciales o actual del registro
    */
    $scope.process = function(iteration) {
      var i;
      for (i = 0; i < iteration.registers; i++) {

        // El primer registro se procesa en la llamada al modal
        if(i > 0) {
          nextRegister(false);
        }

        var xHarvest = 0;

        if ($scope.records.length > $scope.itemProduct.harvestTime-1) {
          xHarvest = $scope.records[$scope.records.length-$scope.itemProduct.harvestTime].crop;
        }

        if ($scope.nroApartment > $scope.itemProduct.harvestTime){
          $scope.nroApartment = 1;
        }

        // Crear un nuevo registro
        var record = {
          id: parseInt(iteration.id),
          currentPopulation: parseInt(Math.round(iteration.currentPopulation)),
          demand: parseInt(Math.round(iteration.demand)),
          currentProduction: parseInt(Math.round(iteration.currentProduction)),
          xImport: parseInt(Math.round(iteration.xImport)),
          crop: parseInt(iteration.crop),
          totalNationalOffer: parseInt(Math.round(iteration.totalNationalOffer)),
          xExport: parseInt(Math.round(iteration.xExport)),
          xHarvest:parseInt(Math.round(xHarvest)),
          apartment:parseInt(Math.round($scope.nroApartment++)),
          step: parseInt(iteration.step),
          current: iteration.current
        }

        // Agregar el nuevo registro a la vista
        $scope.records.push(record);
      }

      lego($scope.itemProduct.color);

      // Ocultar la modal
      $('#recordModal').modal('hide');
      var data = $scope.records;
      $scope.tableParams = new NgTableParams({ page: 1, count: $scope.sizetable }, { counts: [], dataset: data });
    };

     /**
     * @class <strong>Inicializa el proceso del registro actual habilita el botón de procesar el cultivo</strong>
     * @param {object} data Registro actual a procesar
     */
    $scope.processData = function(data) {

      $scope.currentIteration = data.record;

      // Productos a cultivar
      $scope.crop = parseInt($scope.currentIteration.crop);

      $scope.showButton = false;

      if($scope.currentIteration.id < $scope.itemProduct.harvestTime + 1) {
        // Procesar registros de cosechar - aun no se inicia la etapa de cosecha
        $scope.harvest();
        $scope.showCultivate = true;
      } else  {
        // Mostrar boton de cosechar
        $scope.showProduce = true;
        $scope.selectedMessage_1 = true;
      }

      $scope.records[$scope.currentIteration.id-1].current = false;

      if (data.record.xHarvest > 0) {
        $scope.messageToHarvest = "Instrucción para el robot: Día " + $scope.currentIteration.id + ": Cosechar " + data.record.xHarvest + " toneladas de " + $scope.itemProduct.name + ", Apartamento: " + data.record.apartment;
        $scope.selectedMessage_1 = true;
        $scope.selectedMessage_2 = false;
      } else {
        $scope.selectedMessage_2 = true;
      }
      $scope.messageToCultivate = "Instrucción para el robot: Día " + $scope.currentIteration.id + ": Cultivar " +  $scope.crop + " toneladas de " + $scope.itemProduct.name + ", Apartamento: " + data.record.apartment;

    }

     /**
     * @class <strong>Inicializa los valores, colores y datos del registro a cultivar</strong>
     * <br><br>
     * <ul>
     * <li>Inicializa valores del cultivo actual</li>
     * <li>Llama al robot que realiza los movimientos del cultivo</li>
     * <li>Agrega callback 'processCultivate' para actualizar datos al finalizar procesamiento</li>
     * </ul>
     */
    $scope.cultivate = function() {
      if ($scope.crop !== 0) {
        var objDiv = document.getElementById('progress');
        objDiv.innerHTML = "Cultivar: " + $scope.crop + " " + $scope.itemProduct.unit;
        objDiv.style.background = $scope.itemProduct.color;
        objDiv.style.color = "black";
        objDiv.style.position = "absolute";
        objDiv.style.width = "15%";
        objDiv.style.height = "5%";
        objDiv.setAttribute("align", "center");

        $scope.showCultivate = false;

        $scope.move(100, 450, $scope.processCultivate);
      }
    }

    /**
    * @class <strong>Función callback 'processCultivate', actualiza datos del procesamiento actual</strong>
    * <br><br>
    * <ul>
    * <li>Cierra el movimiento del robot</li>
    * <li>Actualiza los datos del edificio de cultivo del producto</li>
    * <li>Habilita el botón del proceso de cosechar</li>
    * <li>Habilita el botón de procesamiento del próximo registro a cultivar, en caso de existir</li>
    * </ul>
    */
    $scope.processCultivate = function() {
      var objDiv = document.getElementById('progress');
      objDiv.innerHTML = "";
      objDiv.style.background = "";
      $scope.cultivating += parseInt($scope.crop);
      $scope.crop = 0;
      $scope.labelStore = "";
      $scope.messageToHarvest = "";
      $scope.messageToCultivate = "";
      $scope.records[$scope.currentIteration.id].current = true;
      $scope.selectedMessage_1 = false;
      $scope.selectedMessage_2 = false;
    }

    /**
     * Permite realizar proceso de cosechar
     * TODO :wlopera validar cuando se llegue al final de los registros a procesar
     */

     /**
     * @class <strong>Inicializa los valores, colores y datos del registro a cosechar</strong>
     * <br><br>
     * <ul>
     * <li>Busca si existe registro a cosechar</li>
     * <li>Inicializa valores del resgitro a cosechar</li>
     * <li>Llama al robot que realiza los movimientos de cosecha</li>
     * <li>Agrega callback 'processHarvest' para actualizar datos al finalizar procesamiento</li>
     * </ul>
     */
    $scope.harvest = function() {
      $scope.showProduce = false;
      $scope.showButton = true;

      //$scope.records[$scope.currentIteration.id].current = true;
      $scope.findNextIteration();

      angular.forEach($scope.records, function(value, key) {

        if (value.step != -1) {
          value.step = parseInt(value.step) - 1;
          if (value.step === 0) {
            var objDiv = document.getElementById('progress');
            objDiv.innerHTML = "Cosechar: " + value.crop + " " + $scope.itemProduct.unit;
            objDiv.style.background = $scope.itemProduct.color;
            objDiv.style.color = "black";
            objDiv.style.position = "absolute";
            objDiv.style.width = "15%";
            objDiv.style.height = "5%";
            objDiv.setAttribute("align", "center");
            $scope.totalStoreTemp = parseInt(value.crop);
            $scope.move(460, 925, $scope.processHarvest);
          }
        }
      });

    };

    /**
    * @class <strong>Función callback 'processHarvest', actualiza datos del procesamiento actual</strong>
    * <br><br>
    * <ul>
    * <li>Cierra el movimiento del robot</li>
    * <li>Actualiza los datos del almacen del producto</li>
    * </ul>
    */
    $scope.processHarvest = function() {
      $scope.totalStore = parseInt($scope.totalStore) + $scope.totalStoreTemp;

      $scope.cultivating -= $scope.totalStoreTemp;

      // Mostrat boton de cultivar
      $scope.showCultivate = true;
      $scope.selectedMessage_1 = false;
      $scope.selectedMessage_2 = true;

      var objDiv = document.getElementById('progress');
      objDiv.innerHTML = "";
      objDiv.style.background = "";
      $scope.labelStore = "";
      $scope.$apply();
    }

    /**
    * @class <strong>Realiza el movimiento de los robots</strong>
    * <br><br>
    * <ul>
    * <li>Mueve el robot desde una posición inicial a una final</li>
    * <li>Presenta un retrazo de milisegundo/segundos por movimiento </li>
    * <li>Al finalizar el movimiento llama a la función callback requerida</li>
    * </ul>
    * @param {number} startX Posición inicial del movimiento
    * @param {number} endX Posición final del movimiento
    * @param {number} callback Función a llamar al finalizar el movimiento
    */
    $scope.move = function(startX, endX, callback) {
      var objDiv = document.getElementById('progress');
      if (objDiv != null) {
        objDiv.style.left = (startX += 5).toString() + 'px';
      }
      if (startX < endX) {
        $timeout(function() {
            $scope.move(startX, endX, callback);
        }, 30);
      } else {
        callback();
      }
    }

     /**
     * @class <strong>Asigna color de lego-producto, edificios y almacen</strong>
     * @param {object} color Color actual del robot
     */
    function lego(color) {
      $scope.showProduct = true;
      angular.element('.square').css("background-color", color);
    }

    /**
    * @class <strong>Permite buscar la página que contiene el registro actual a procesar </strong>
    * <br><br>
    * <ul>
    * <li>Recorre los registros buscando la posición del resgitro actual</li>
    * <li>Asigna la página que contiene el resgitro actual</li>
    * <li>Despliega la página que contiene el registro en la tabla</li>
    * </ul>
    */
    $scope.findNextIteration = function() {
      var id = 0;
      var start = 1;
      var end = $scope.sizetable;
      var page;

      angular.forEach($scope.records, function(value, key) {
        if (value.current == true) {
          id = value.id;
        }
      });

      for (page = 1; page < parseInt($scope.records.length/$scope.sizetable)+1 ; page++) {
        if(id >= start && id <= end){
          $scope.tableParams.page(page);
          return;
        }
        start +=$scope.sizetable;
        end +=$scope.sizetable;
      }
    };

    $scope.updateData();

  }]);
})()
