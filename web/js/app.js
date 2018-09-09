(function() {
  "use strict";

  angular.module('RoboticaApp', [])
    .controller("RoboticaController", ["$scope", function($scope) {

  /*****************************************************************
  * Constantes
  ******************************************************************/
  $scope.daysAYear= 360; // Crecimiento poblacional diario este annnio

  /*****************************************************************
  * Variables Iniciales
  ******************************************************************/
  // Tab actual
  $scope.tab = 2;

  // Avance de la tabla
  $scope.potition = 8;

  // Mostrar/ocultar boton de procesamiento
  $scope.showButton = true;

  // Bandera para mostrar los legos
  $scope.showProduct = false;

  // Bandera para iniciar procesamiento
  $scope.showParamButton = true;
  $scope.showProcessButton = true;

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
    birthsThisYear: 52854,      // Nacimientos este annio
    deathsThisYear:13240,       // Muertes este annio
    immigrationThisYear: 4969,  // Inmigracion este annio
    emigrationThisYear: 1000,           // Emigracion este annio
    birthsMinusDeaths: 39614,   // Nacimientos menos muertes
    immigrationMinusEmigration: 3969, // Inmigracion menos emigracion
    populationGrowthThisYear: 43583,  // Crecimiento poblacional este annio
    dailyPopulationGrowthThisYear: 121 // Crecimiento poblacional diario este annio
  }

  // Alimento - analisis
  $scope.itemProduct ={
    name: "Tomate",
    rateGrowth: ($scope.calcPopulation.dailyPopulationGrowthThisYear/$scope.calcPopulation.currentPoblation*100).toFixed(3),  // Tasa crec. [Día]
    currentPoblation: $scope.calcPopulation.currentPoblation, // Población [Hab/día]
    cultivates: 300, // La que se recoge que ya está sembrada en tierras
    imports: 1000,   // Esta es la importación actual
    demandProduct: 300,  // Tomate [Grs/día/hab.]
    conversionGramsToTons: 1000000, // Conversion de gramos a Ton
    hydroponicOffer: 6,  // OFERTA HIDROPÓNICA
    dailyIncrementFactor: 1280, // Factor de incremento de cultivo diario [En Ton]
    cultivetesTime: 2, // Tiempo cosecha tomate [En días]
    unit: $scope.units[4], // Unidad base del producto
    color: $scope.colors[1], // Color que identifica al producto
    potition: 8 // paginacion
  }

  // Registro actual
  $scope.iteration = {
    id: 0,
    consume: parseInt($scope.itemProduct.demandProduct),
    xCultivate: 0,
    xImport: 0,
    step: parseInt($scope.itemProduct.cultivetesTime)
  };

    /*****************************************************************
     * Ventana Procesamiento: Variables - metodos
     ******************************************************************/


    /**
     * Permite mostrar la ventana modal para ingresar datos a procesar
     */
    $scope.showModal = function() {

      // Incrementar la iteracion
      $scope.iteration.id = $scope.records.length + 1;

      $scope.labelStore = $scope.itemProduct.unit.value;

      if($scope.itemProduct.hydroponicOffer > $scope.iteration.id) {
        $scope.iteration.xCultivate = Math.round($scope.iteration.id * ($scope.itemProduct.dailyIncrementFactor/$scope.itemProduct.hydroponicOffer));
      } else {
        $scope.iteration.xCultivate = Math.round($scope.itemProduct.hydroponicOffer * ($scope.itemProduct.dailyIncrementFactor/$scope.itemProduct.hydroponicOffer));
      }

      $scope.iteration.xImport = parseInt($scope.itemProduct.imports);

      $('#recordModal').modal('show');
    }

    /**
     * Permite procesar entrada de datos del modal
     */
    $scope.process = function(iteration) {
      var totalStoreActual = angular.copy($scope.totalStore);

      // Cosechar el producto
      var totalStoreTemp = produce();

      // Crear un nuevo registro
      var record = {
        id: parseInt(iteration.id),
        consume: parseInt(iteration.consume),
        xCultivate: parseInt(iteration.xCultivate),
        xImport: parseInt(iteration.xImport),
        step: parseInt(iteration.step)
      }

      $scope.labelStore = " => [ " + totalStoreActual +
        " Almacenado + " + record.xImport +
        " Importado + " + totalStoreTemp +
        " Cosechas - " + record.consume +
        " Consumos ]";

      // Productos a cultivar
      $scope.xCultivate = parseInt(record.xCultivate);

      // Agregar el nuevo registro a la vista
      $scope.records.push(record);

      // Ocultar la modal
      $('#recordModal').modal('hide');

      lego($scope.itemProduct.color.value);

      $scope.pageAhead();

      $scope.showButton = false;

      cultivate();

    };

    /**
     * Permite realizar proceso de cosechar
     */
    function produce() {
      var totalStoreTemp = 0;
      angular.forEach($scope.records, function(value, key) {
        if (value.step != -1) {
          value.step = parseInt(value.step) - 1;
          if (value.step === 0) {
            totalStoreTemp = parseInt(value.xCultivate)
            $scope.totalStore = parseInt($scope.totalStore) + totalStoreTemp;
            $scope.cultivating -= totalStoreTemp;
            value.paso = -1;
          }
        }
      });
      return totalStoreTemp;
    };

    /**
     * Permite asignar valores de lego-producto, edificios y almacen
     */
    function lego(color) {
      $scope.showProduct = true;
      angular.element('.square').css("background-color", color);
    }

    /**
     * Permite realizar el proceso de mover los robots para cultivar
     */
    function cultivate() {
      var intX = 100;
      var objDiv = document.getElementById('progress');
      objDiv.innerHTML = $scope.xCultivate + " " + $scope.itemProduct.unit.abrev;
      objDiv.style.background = $scope.itemProduct.color.value;
      objDiv.style.color = "black";
      objDiv.style.position = "absolute";
      objDiv.style.width = "10%";
      objDiv.style.height = "5%";
      objDiv.setAttribute("align", "center");

      if ($scope.xCultivate !== 0) {
        move();
      } else {
        objDiv.innerHTML = "";
        objDiv.style.background = "";
        $scope.cultivating += parseInt($scope.xCultivate);
        $scope.xCultivate = 0;
        $scope.labelStore = "";
        $scope.showButton = true;
        $scope.$apply();
      }

      function move() {
        var objDiv = document.getElementById('progress');
        if (objDiv != null) {
          objDiv.style.left = (intX += 20).toString() + 'px';
        } //if
        if (intX < 650) {
          setTimeout(move, 30);
        } else {
          objDiv.innerHTML = "";
          objDiv.style.background = "";
          $scope.cultivating += parseInt($scope.xCultivate);
          $scope.xCultivate = 0;
          $scope.labelStore = "";
          $scope.showButton = true;
          $scope.$apply();
        }

        return true;
      }
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
      $scope.tab = 3;
      $scope.showModal();
    }

  }]);
})()
