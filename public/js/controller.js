/*global angular */
angular.module('wami', [])
  .controller('WamiController', function($scope, $http) {

    $scope.curImages = [];

    $scope.images = {
      original: [{
        url: "/img/original/36.jpg"
      }, {
        url: "/img/original/37.jpg"
      }, {
        url: "/img/original/38.jpg"
      }, {
        url: "/img/original/39.jpg"
      }, {
        url: "/img/original/40.jpg"
      }, {
        url: "/img/original/41.jpg"
      }, {
        url: "/img/original/42.jpg"
      }, {
        url: "/img/original/43.jpg"
      }],

      registration: [{
        url: "/img/registration/_images0.jpg"
      }, {
        url: "/img/registration/_images1.jpg"
      }, {
        url: "/img/registration/_images2.jpg"
      }, {
        url: "/img/registration/_images3.jpg"
      }, {
        url: "/img/registration/_images4.jpg"
      }, {
        url: "/img/registration/_images5.jpg"
      }, {
        url: "/img/registration/_images6.jpg"
      }, {
        url: "/img/registration/_images7.jpg"
      }],
      
      detection: [{
        url: "/img/detection/36-foreground-GPU.jpg"
      }, {
        url: "/img/detection/37-foreground-GPU.jpg"
      }, {
        url: "/img/detection/38-foreground-GPU.jpg"
      }, {
        url: "/img/detection/39-foreground-GPU.jpg"
      }, {
        url: "/img/detection/40-foreground-GPU.jpg"
      }, {
        url: "/img/detection/41-foreground-GPU.jpg"
      }, {
        url: "/img/detection/42-foreground-GPU.jpg"
      }, {
        url: "/img/detection/43-foreground-GPU.jpg"
      }],
      
      association: [{
        url: "/img/association/36.jpg"
      }, {
        url: "/img/association/37.jpg"
      }, {
        url: "/img/association/38.jpg"
      }, {
        url: "/img/association/39.jpg"
      }, {
        url: "/img/association/40.jpg"
      }, {
        url: "/img/association/41.jpg"
      }, {
        url: "/img/association/42.jpg"
      }],
    }
    
    $scope.curImages = $scope.images.association;


    $scope.setImages = function(num){
      if(num === 0){
        $scope.curImages = [];
      }else if(num === 1){
        $scope.curImages = $scope.images.original;
      }else if(num === 2){
        $scope.curImages = $scope.images.registration;
      }else if(num === 3){
        $scope.curImages = $scope.images.detection;
      }else if(num === 4){
        $scope.curImages = $scope.images.association;
      }
    };


    $scope.load = function(date) {
      // var d = syncDate(date);
      // var t = d.getTime();
      $http({
        method: 'POST',
        url: '/resvs/getallbydateABS',
        data: {
          resv_time_abs: t
        }
      }).
      then(function(response) {
        $scope.reservations = response.data;
      }, function(response) {
        $scope.data = response.data || "Request failed";
        $scope.status = response.status;
      });
    };

  });