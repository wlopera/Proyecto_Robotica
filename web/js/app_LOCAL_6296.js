(function() {
  "use strict";

  angular.module('RoboticaApp', [])
    .controller("RoboticaController", ["$scope", "$timeout", function($scope, $timeout) {

  /*****************************************************************
  * Constantes
  ******************************************************************/
  $scope.daysAYear= 365; // Crecimiento poblacional diario este annnio

  /*****************************************************************
  * Variables Iniciales
  ******************************************************************/
  // Tab actual
  $scope.tab = 1;

  // Avance de la tabla
  $scope.potition = 8;

  // Mostrar/ocultar boton de procesamiento
  $scope.showButton = true;

  $scope.showProduce = false;
  $scope.showCultivate = false;

  // Bandera para mostrar los legos
  $scope.showProduct = false;

  // Bandera para iniciar procesamiento
  $scope.showParamButton = true;
  $scope.showProcessButton = true;
  $scope.showInitButton = true;

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
  $scope.xCultivate = 0;

  // Cantidad de producto en cultivo
  $scope.cultivating = 0;

  // Lista de colores disponibles
  $scope.colors = [{
      id: 0,
      name: 'Seleccione',
      value: 'Red'
    },
    {
      id: 1,
      name: 'Rojo',
      value: 'Red'
    },
    {
      id: 2,
      name: 'Verde',
      value: 'Green'
    },
    {
      id: 3,
      name: 'Blanco',
      value: 'White'
    },
    {
      id: 4,
      name: 'Amarillo',
      value: 'Yellow'
    },
    {
      id: 5,
      name: 'Anaranjado',
      value: 'orange'
    },
    {
      id: 6,
      name: 'Marrón',
      value: 'Brown'
    },
    {
      id: 7,
      name: 'Morado',
      value: 'purple'
    },
    {
      id: 8,
      name: 'Negro',
      value: 'Black'
    }
  ]

  // Lista de unidades disponibles
  $scope.units = [{
      id: 0,
      value: 'Seleccione',
      abrev: ''
    },
    {
      id: 1,
      value: 'Cajas',
      abrev: 'C'
    },
    {
      id: 2,
      value: 'Kilos',
      abrev: 'Kg'
    },
    {
      id: 3,
      value: 'Litros',
      abrev: 'Li'
    },
    {
      id: 4,
      value: 'Toneladas',
      abrev: 'Ton.'
    },
    {
      id: 5,
      value: 'Unidades',
      abrev: 'Un.'
    },
  ]

  // Objeto calculo poblacional
  $scope.calcPopulation = {
    currentPoblation: 4136399,  // Poblacion actual [Este annio]
    births: 52854,      // Nacimientos este annio
    deaths:13240,       // Defunciones este annio
    immigration: 4969,  // Inmigracion este annio
    emigration: 1000,   // Emigracion este annio
    birthsMinusDeaths: 0,       // Nacimientos menos defunciones
    immigrationMinusEmigration: 0, // Inmigracion menos emigracion
    populationGrowth: 0, // Tasa de crecimiento poblacional este annio
    dailyPopulationGrowth: 0, // Tasa de crecimiento poblacional diario
    dailyPopulationGrowthPercentage: 0 // POrcentaje de la tasa de crecimiento poblacional diario
  }

  // Alimento - analisis
  $scope.itemProduct ={
    name: "Tomate",
    rateGrowth: 0,  // Tasa crec. [Día]
    currentPoblation: 0, // Población [Hab/día]
    cultivates: 300, // La que se recoge que ya está sembrada en tierras
    imports: 1000,   // Esta es la importación actual
    demandProduct: 300,  // Tomate [Grs/día/hab.]
    conversionGramsToTons: 1000000, // Conversion de gramos a Ton
    hydroponicOffer: 6,  // OFERTA HIDROPÓNICA
    dailyIncrementFactor: 1200, // Factor de incremento de cultivo diario [En Ton]
    cultivetesTime: 2, // Tiempo cosecha tomate [En días]
    unit: $scope.units[4], // Unidad base del producto
    color: $scope.colors[1], // Color que identifica al producto
    potition: 8 // paginacion
  }

  // Registro actual
  $scope.iteration = {
    id: 0,
    currentPoblation: 0,
    consume: 0,
    currentOffer: 0,
    xImport: 0,
    xCultivate: 0,
    totalNationalOffer: 0,
    xExport: 0,
    step: 0
  };

    /*****************************************************************
     * Ventana Procesamiento: Variables - metodos
     ******************************************************************/
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
      $scope.calcPopulation.dailyPopulationGrowthPercentage = ($scope.calcPopulation.populationGrowth / $scope.daysAYear / $scope.calcPopulation.currentPoblation * 100).toFixed(3);

      // Tasa crec. [Día]
      $scope.itemProduct.rateGrowth = $scope.calcPopulation.dailyPopulationGrowthPercentage;

      // Población [Hab/día]
      $scope.itemProduct.currentPoblation =  $scope.calcPopulation.currentPoblation

      $scope.iteration.step = parseInt($scope.itemProduct.cultivetesTime);
     }

    /**
     * Permite mostrar la ventana modal para ingresar datos a procesar
     */
    $scope.showModal = function() {

      // Incrementar la iteracion
      $scope.iteration.id = $scope.records.length + 1;

      $scope.labelStore = $scope.itemProduct.unit.value;

      $scope.iteration.currentPoblation = $scope.itemProduct.currentPoblation +  $scope.iteration.id * $scope.itemProduct.currentPoblation * $scope.itemProduct.rateGrowth / 100;

      var consume =  $scope.iteration.currentPoblation * $scope.itemProduct.demandProduct / $scope.itemProduct.conversionGramsToTons;

      $scope.iteration.consume =  parseInt(Math.round(consume));

      $scope.iteration.currentOffer = $scope.itemProduct.cultivates + $scope.itemProduct.imports;

      $scope.iteration.xImport = $scope.itemProduct.imports;

      if($scope.itemProduct.hydroponicOffer > $scope.iteration.id) {
        $scope.iteration.xCultivate = Math.round($scope.iteration.id * ($scope.itemProduct.dailyIncrementFactor/$scope.itemProduct.hydroponicOffer));
      } else {
        $scope.iteration.xCultivate = Math.round($scope.itemProduct.hydroponicOffer * ($scope.itemProduct.dailyIncrementFactor/$scope.itemProduct.hydroponicOffer));
      }

      $scope.iteration.totalNationalOffer = $scope.iteration.currentOffer + $scope.totalStore;

      $scope.iteration.xExport = $scope.iteration.totalNationalOffer - consume;

      if (document.getElementById("chkManual").checked) {
        $scope.process($scope.iteration);
      } else {
        $('#recordModal').modal('show');
      }
    }

    /**
     * Permite procesar entrada de datos del modal
     */
    $scope.process = function(iteration) {
      // Crear un nuevo registro
      var record = {
        id: parseInt(iteration.id),
        currentPoblation: parseInt(Math.round(iteration.currentPoblation)),
        consume: parseInt(Math.round(iteration.consume)),
        currentOffer: parseInt(Math.round(iteration.currentOffer)),
        xImport: parseInt(Math.round(iteration.xImport)),
        xCultivate: parseInt(iteration.xCultivate),
        totalNationalOffer: parseInt(Math.round(iteration.totalNationalOffer)),
        xExport: parseInt(Math.round(iteration.xExport)),
        step: parseInt(iteration.step)
      }

      // Productos a cultivar
      $scope.xCultivate = parseInt(record.xCultivate);

      // Agregar el nuevo registro a la vista
      $scope.records.push(record);

      // Ocultar la modal
      $('#recordModal').modal('hide');

      lego($scope.itemProduct.color.value);

      $scope.pageAhead();

      $scope.showButton = false;

      // Cultivo de producto
      $scope.showCultivate = true;
    };

    /**
     * Permite realizar el proceso de mover los robots para cultivar
     */
    $scope.cultivate = function() {
      if ($scope.xCultivate !== 0) {
        var objDiv = document.getElementById('progress');
        objDiv.innerHTML = "Cultivar: " + $scope.xCultivate + " " + $scope.itemProduct.unit.abrev;
        objDiv.style.background = $scope.itemProduct.color.value;
        objDiv.style.color = "black";
        objDiv.style.position = "absolute";
        objDiv.style.width = "15%";
        objDiv.style.height = "5%";
        objDiv.setAttribute("align", "center");

        $scope.showCultivate = false;

        $scope.move(100, 450, $scope.processCultivate);
      }
    }

    $scope.processCultivate = function() {
      var objDiv = document.getElementById('progress');
      objDiv.innerHTML = "";
      objDiv.style.background = "";
      $scope.cultivating += parseInt($scope.xCultivate);
      $scope.xCultivate = 0;
      $scope.labelStore = "";
      $scope.showProduce = true;
    }

    /**
     * Permite realizar proceso de cosechar
     */
    $scope.harvest = function() {
      angular.forEach($scope.records, function(value, key) {
        $scope.showProduce = false;
        $scope.showButton = true;
        if (value.step != -1) {
          value.step = parseInt(value.step) - 1;
          if (value.step === 0) {
            var objDiv = document.getElementById('progress');
            objDiv.innerHTML = "Cosechar: " + value.xCultivate + " " + $scope.itemProduct.unit.abrev;
            objDiv.style.background = $scope.itemProduct.color.value;
            objDiv.style.color = "black";
            objDiv.style.position = "absolute";
            objDiv.style.width = "15%";
            objDiv.style.height = "5%";
            objDiv.setAttribute("align", "center");
            $scope.totalStoreTemp = parseInt(value.xCultivate)

            $scope.move(460, 925, $scope.processHarvest);
          }
        }
      });
    };

    $scope.processHarvest = function() {
      $scope.totalStore = parseInt($scope.totalStore) + $scope.totalStoreTemp;
      $scope.cultivating -= $scope.totalStoreTemp;

      var objDiv = document.getElementById('progress');
      objDiv.innerHTML = "";
      objDiv.style.background = "";
      $scope.cultivating += parseInt($scope.xCultivate);
      $scope.xCultivate = 0;
      $scope.labelStore = "";
      $scope.$apply();
    }

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
     * Permite asignar valores de lego-producto, edificios y almacen
     */
    function lego(color) {
      $scope.showProduct = true;
      angular.element('.square').css("background-color", color);
    }

    $scope.pageAhead = function() {
      if ($scope.records.length > $scope.potition) {
        $scope.potition += $scope.itemProduct.potition;
      }
    };

    $scope.pageBehind = function() {
      if ($scope.potition > $scope.itemProduct.potition) {
        $scope.potition -= $scope.itemProduct.potition;
      }
    };


    $scope.initProcess = function() {
      $scope.showInitButton = false;
      $scope.tab = 3;
      $scope.showModal();
    }

    $scope.updateData();

  }]);
})()
