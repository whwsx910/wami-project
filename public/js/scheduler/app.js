/*global angular */
angular.module('scheduler', [])
  .controller('ScheduleController', function($scope, $http) {
    var SCALE = 50;
    var d = new Date();
    var yyyy = d.getFullYear();
    var mm = d.getMonth();
    var dd = d.getDate();
    $scope.selectedDate = new Date(yyyy, mm, dd);
    $scope.target_res = {};
    $scope.reservations = [];

    $scope.rooms = [{
      label: 'V1(S)',
      size: 'small',
      color: 'info'
    }, {
      label: 'V2(S)',
      size: 'small',
      color: 'info'
    }, {
      label: 'V3(S)',
      size: 'small',
      color: 'info'
    }, {
      label: 'V6(S)',
      size: 'small',
      color: 'info'
    }, {
      label: 'V7(S)',
      size: 'small',
      color: 'info'
    }, {
      label: 'V5(M)',
      size: 'medium',
      color: 'warning'
    }, {
      label: '08(M)',
      size: 'medium',
      color: 'warning'
    }, {
      label: 'V9(L)',
      size: 'large',
      color: 'danger'
    }, {
      label: 'VIP(L)',
      size: 'large',
      color: 'danger'
    }];

    $scope.new_res = {
      name: 'New guest',
      tel: '0000000000',
      party_size: 1,
      start_time: 14,
      duration: 1,
      status: 1,
      room: 0,
      note: "This is a new reservation",
      resv_time: Date.now(),
      showed_up: 0
    };

    function syncDate(date){
      var t = date.getTime() - (date.getTimezoneOffset() * 60000);
      var d = new Date(t);
      return d;
    };

    $scope.load = function(date) {
      var d = syncDate(date);
      var t = d.getTime();
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

    $scope.load($scope.selectedDate);

    setInterval(function() {
      if ($scope.selectedDate) {
        $scope.load($scope.selectedDate);
      }
    }, 45000); //update every 45 seconds to detect new reservation

    $scope.changeDate = function() {
      var date = new Date($scope.selectedDate);
      $scope.load(date);
    };

    $scope.getHeight = function(obj) {
      return obj.duration * SCALE;
    };

    $scope.getOffsetTop = function(obj) {
      return (obj.start_time - 14) * SCALE;
    };

    $scope.getResvColor = function(res) {
      if (res.showed_up) {
        return 'primary';
      }
      else if (res.party_size <= 10) {
        return 'info';
      }
      else if (res.party_size <= 14) {
        return 'warning';
      }
      else {
        return 'danger';
      }
    };

    $scope.setTargetRes = function(obj) {
      $scope.target_res_real = obj;
      $scope.target_res = angular.copy(obj);
    };

    $scope.createResv = function() {
      $scope.new_res.resv_time = syncDate($scope.selectedDate);
      $http.post('/resvs/add', angular.copy($scope.new_res)).
      then(function(response) {
        $scope.load($scope.selectedDate);
        //$scope.reservations = response.data;
      }, function(response) {

      });
    };

    $scope.updateResv = function(data) {
      $http.post('/resvs/showedup', angular.copy(data)).
      then(function(response) {
        $scope.load($scope.selectedDate);
        //$scope.reservations = response.data;
      }, function(response) {

      });
    };

    $scope.changeRoom = function(index) {
      $scope.target_res.room = index + 1;
    };

    $scope.guestShowedUp = function() {
      $scope.target_res.showed_up = !$scope.target_res.showed_up;
    };

    $scope.saveChanges = function() {
      if ($scope.roomIsAvailable($scope.target_res._id, $scope.target_res.room, $scope.target_res.start_time, $scope.target_res.duration)) {
        $scope.target_res_real.room = $scope.target_res.room;
        $scope.target_res_real.party_size = $scope.target_res.party_size;
        $scope.target_res_real.start_time = $scope.target_res.start_time;
        $scope.target_res_real.duration = $scope.target_res.duration;
        $scope.target_res_real.status = 2;
        $scope.target_res_real.note = $scope.target_res.note;
        $scope.target_res_real.showed_up = $scope.target_res.showed_up;
        $scope.target_res_real.UID = $scope.target_res.UID;
        $scope.updateResv($scope.target_res_real);
      }
      else {
        alert('Error: Selected room is not available at this time!');
      }
    };

    $scope.deleteResv = function() {
      $http.post('/resvs/delete', {
        _id: $scope.target_res._id
      }).
      then(function(response) {
        $scope.load($scope.selectedDate);
        //$scope.reservations = response.data;
      }, function(response) {

      });
    };

    $scope.roomIsAvailable = function(_id, room, st, dur) {
      var bool = true;
      if (room > 0) {
        angular.forEach($scope.reservations, function(value, key) {
          if (bool) {
            if (value._id !== _id && value.room === room) {
              if (!(st >= (value.start_time + value.duration) || (st + dur) <= value.start_time)) {
                bool = false;
              }
            }
          }
        });
      }
      return bool;
    };

  });