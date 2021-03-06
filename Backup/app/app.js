﻿'use strict';

var app = angular.module('MobileAngularUiExamples', [
    'ngRoute',
    'mobile-angular-ui',
    'mobile-angular-ui.gestures',
    'ngMap'
]);

app.run(function ($transform) {
    window.$transform = $transform;
});

app.config(function ($routeProvider) {
    $routeProvider
        .when('/',
        {
            templateUrl: 'home.html'
        }).when('/map',
        {
            templateUrl: 'modal2.html'
        })
});


app.directive('toucharea', ['$touch', function ($touch) {
    // Runs during compile
    return {
        restrict: 'C',
        link: function ($scope, elem) {
            $scope.touch = null;
            $touch.bind(elem, {
                start: function (touch) {
                    $scope.containerRect = elem[0].getBoundingClientRect();
                    $scope.touch = touch;
                    $scope.$apply();
                },

                cancel: function (touch) {
                    $scope.touch = touch;
                    $scope.$apply();
                },

                move: function (touch) {
                    $scope.touch = touch;
                    $scope.$apply();
                },

                end: function (touch) {
                    $scope.touch = touch;
                    $scope.$apply();
                }
            });
        }
    };
}]);

//
// `$drag` example: drag to dismiss
//
app.directive('dragToDismiss', function ($drag, $parse, $timeout) {
    return {
        restrict: 'A',
        compile: function (elem, attrs) {
            var dismissFn = $parse(attrs.dragToDismiss);
            return function (scope, elem) {
                var dismiss = false;

                $drag.bind(elem, {
                    transform: $drag.TRANSLATE_RIGHT,
                    move: function (drag) {
                        if (drag.distanceX >= drag.rect.width / 4) {
                            dismiss = true;
                            elem.addClass('dismiss');
                        } else {
                            dismiss = false;
                            elem.removeClass('dismiss');
                        }
                    },
                    cancel: function () {
                        elem.removeClass('dismiss');
                    },
                    end: function (drag) {
                        if (dismiss) {
                            elem.addClass('dismitted');
                            $timeout(function () {
                                scope.$apply(function () {
                                    dismissFn(scope);
                                });
                            }, 300);
                        } else {
                            drag.reset();
                        }
                    }
                });
            };
        }
    };
});

//
// Another `$drag` usage example: this is how you could create
// a touch enabled "deck of cards" carousel. See `carousel.html` for markup.
//
app.directive('carousel', function () {
    return {
        restrict: 'C',
        scope: {},
        controller: function () {
            this.itemCount = 0;
            this.activeItem = null;

            this.addItem = function () {
                var newId = this.itemCount++;
                this.activeItem = this.itemCount === 1 ? newId : this.activeItem;
                return newId;
            };

            this.next = function () {
                this.activeItem = this.activeItem || 0;
                this.activeItem = this.activeItem === this.itemCount - 1 ? 0 : this.activeItem + 1;
            };

            this.prev = function () {
                this.activeItem = this.activeItem || 0;
                this.activeItem = this.activeItem === 0 ? this.itemCount - 1 : this.activeItem - 1;
            };
        }
    };
});

app.directive('carouselItem', function ($drag) {
    return {
        restrict: 'C',
        require: '^carousel',
        scope: {},
        transclude: true,
        template: '<div class="item"><div ng-transclude></div></div>',
        link: function (scope, elem, attrs, carousel) {
            scope.carousel = carousel;
            var id = carousel.addItem();

            var zIndex = function () {
                var res = 0;
                if (id === carousel.activeItem) {
                    res = 2000;
                } else if (carousel.activeItem < id) {
                    res = 2000 - (id - carousel.activeItem);
                } else {
                    res = 2000 - (carousel.itemCount - 1 - carousel.activeItem + id);
                }
                return res;
            };

            scope.$watch(function () {
                return carousel.activeItem;
            }, function () {
                elem[0].style.zIndex = zIndex();
            });

            $drag.bind(elem, {
                //
                // This is an example of custom transform function
                //
                transform: function (element, transform, touch) {
                    //
                    // use translate both as basis for the new transform:
                    //
                    var t = $drag.TRANSLATE_BOTH(element, transform, touch);

                    //
                    // Add rotation:
                    //
                    var Dx = touch.distanceX;
                    var t0 = touch.startTransform;
                    var sign = Dx < 0 ? -1 : 1;
                    var angle = sign * Math.min((Math.abs(Dx) / 700) * 30, 30);

                    t.rotateZ = angle + (Math.round(t0.rotateZ));

                    return t;
                },
                move: function (drag) {
                    if (Math.abs(drag.distanceX) >= drag.rect.width / 4) {
                        elem.addClass('dismiss');
                    } else {
                        elem.removeClass('dismiss');
                    }
                },
                cancel: function () {
                    elem.removeClass('dismiss');
                },
                end: function (drag) {
                    elem.removeClass('dismiss');
                    if (Math.abs(drag.distanceX) >= drag.rect.width / 4) {
                        scope.$apply(function () {
                            carousel.next();
                        });
                    }
                    drag.reset();
                }
            });
        }
    };
});

app.directive('dragMe', ['$drag', function ($drag) {
    return {
        controller: function ($scope, $element) {
            $drag.bind($element,
                {
                    //
                    // Here you can see how to limit movement
                    // to an element
                    //
                    transform: $drag.TRANSLATE_INSIDE($element.parent()),
                    end: function (drag) {
                        // go back to initial position
                        drag.reset();
                    }
                },
                { // release touch when movement is outside bounduaries
                    sensitiveArea: $element.parent()
                }
            );
        }
    };
}]);

//
// For this trivial demo we have just a unique MainController
// for everything
//

app.service('dataService', function ($http) {
    this.getData = function (onSuccess) {
        //var appId = getUrlParameter('appId');
		var appId = 0;
		
			var str = location.href.split("=");
			console.log(str.length);
			
			if(str.length > 1) 
			{
				appId = str[1];
				console.log(appId);
			}
	
	
		//alert(location.href);
        //var nod = document.getElementById("nod") ? document.getElementById("nod").value : 7;
        $http({
            method: 'GET',
            //url: '/api/tyresole/' + appId + "-" + nod
            url: 'api/tyresole/' + appId
        }).then(function successCallback(d) {
            onSuccess(d.data);
        }, function errorCallback(response) {
            alert('Fetch Data Error. Please contact administrator.')
        });
    }
})

// Setup the filter
app.filter('lxfilter', function () {

    // Create the return function and set the required parameter name to **input**
    return function (input, summary) {

        var out = [];

        // Using the angular.forEach method, go through the array of data and perform the operation of figuring out if the language is statically or dynamically typed.
        angular.forEach(input, function (a) {

            if (a.Color === summary) {
                out.push(language)
            }

        })

        return out;
    }

});

app.controller('MainController', function ($rootScope, $scope, dataService, NgMap) {

    $scope.openGenfeceMassage = function () {
        alert('You will get notificaton as soon as vehicle is within 10kms of the local branch(of the RE).');
    }
    $scope.lx = {};
    $scope.lx.data = [];

    $scope.lx.markers = [];

    $scope.liveLocate = function (v) {
        NgMap.getMap().then(function (map) {
            $scope.lx.map = map;
            dataService.getLiveLocation(v.AppId, v.VehicleId, function (d) {
                $scope.lx.markers = [];
                //$scope.$apply(function () {
                $scope.lx.markers.push({
                    name: d.name,
                    lat: d.trackPoint.position.latitude,
                    lng: d.trackPoint.position.longitude,
                });
                //});
                var bounds = new google.maps.LatLngBounds();
                $scope.lx.markers.forEach(function (c) {
                    var latLng = new google.maps.LatLng(c.lat, c.lng);
                    bounds.extend(latLng);
                });
                $scope.lx.map.fitBounds(bounds);
                $scope.lx.map.setZoom(5);
            });

        });
    }



    $scope.lx.summary = {
        red: {
            count: 0,
            toggle: false
        },
        green: {
            count: 0,
            toggle: false
        },
        yellow: {
            count: 0, toggle: false
        }
    };
    $scope.fetchData = function () {
        dataService.getData(function (d) {
            $scope.lx.data = d;

            for (var i = 0; i < $scope.lx.data.length; i++) {


                if ($scope.lx.data[i].Color == 'red') {
                    $scope.lx.data[i].Class = 'btn-danger';
                    $scope.lx.summary.red.count++;
                }
                else if ($scope.lx.data[i].Color == 'yellow') {
                    $scope.lx.data[i].Class = 'btn-warning';
                    $scope.lx.summary.yellow.count++;
                }
                else {
                    $scope.lx.data[i].Class = 'btn-success';
                    $scope.lx.summary.green.count++;
                }
                var dd = $scope.lx.data[i];
            }
        });
    }
    $scope.$watch('lx.summary.red.toggle', function (old, newval) {
        if (old != newval) {
            //alert($scope.lx.summary.red);
            var d = [];
            if ($scope.lx.summary.red.toggle) {
                for (var i = 0; i < $scope.lx.data.length; i++) {
                    if ($scope.lx.data[i].Color == 'red')
                        d.push($scope.lx.data[i]);
                }
                $scope.lx.summaryData = d;
            }
            else
                $scope.lx.summaryData = angular.copy($scope.lx.data);
        }
    });
    $scope.$watch('lx.summary.yellow.toggle', function (old, newval) {
        if (old != newval) {
            //alert($scope.lx.summary.red);
            var d = [];
            if ($scope.lx.summary.yellow.toggle) {
                for (var i = 0; i < $scope.lx.data.length; i++) {
                    if ($scope.lx.data[i].Color == 'yellow')
                        d.push($scope.lx.data[i]);
                }
                $scope.lx.summaryData = d;
            }
            else
                $scope.lx.summaryData = angular.copy($scope.lx.data);
        }
    });
    $scope.$watch('lx.summary.green.toggle', function (old, newval) {
        if (old != newval) {
            //alert($scope.lx.summary.red);
            var d = [];
            if ($scope.lx.summary.green.toggle) {
                for (var i = 0; i < $scope.lx.data.length; i++) {
                    if ($scope.lx.data[i].Color == 'green')
                        d.push($scope.lx.data[i]);
                }
                $scope.lx.summaryData = d;
            }
            else
                $scope.lx.summaryData = angular.copy($scope.lx.data);
        }
    });

    $scope.onSummaryClick = function (s, t) {

        var d = [];
        for (var i = 0; i < $scope.lx.data.length; i++) {
            if ($scope.lx.data[i].Color == s) {
                d.push($scope.lx.data[i]);
            }
        }
        $scope.lx.summaryData = d;
    }

    dataService.getData(function (d) {
        $scope.lx.data = d;

        for (var i = 0; i < $scope.lx.data.length; i++) {


            if ($scope.lx.data[i].Color == 'red') {
                $scope.lx.data[i].Class = 'btn-danger';
                $scope.lx.summary.red.count++;
            }
            else if ($scope.lx.data[i].Color == 'yellow') {
                $scope.lx.data[i].Class = 'btn-warning';
                $scope.lx.summary.yellow.count++;
            }
            else {
                $scope.lx.data[i].Class = 'btn-success';
                $scope.lx.summary.green.count++;
            }
            var dd = $scope.lx.data[i];


        }


        $scope.lx.summaryData = angular.copy($scope.lx.data);
        // setTimeout(function () {
        //setDriver();
        //  }, 3000);

    });

    //var setDriver = function () {
    //    console.log($scope.lx.summaryData);
    //    for (var i = 0; i < $scope.lx.summaryData.length; i++) {
    //        var dd = $scope.lx.summaryData[i];
    //        for (var i = 0; i < result.length; i++) {
    //            var s = result[i];
    //            if (s.name == 'Driver-Name')
    //                $scope.lx.summaryData[i].DriverName = s.value;
    //            if (s.name == 'Driver-Mobile')
    //                $scope.lx.summaryData[i].DriverMobile = s.value;
    //        }
    //        $scope.lx.summaryData[i].Driver = result;
    //    }
    //}
    $scope.orderByField = 'Distance';
    $scope.reverseSort = false;




    /*
    //-------------
    $scope.swiped = function (direction) {
        alert('Swiped ' + direction);
    };
 
    // User agent displayed in home page
    $scope.userAgent = navigator.userAgent;
 
    // Needed for the loading screen
    $rootScope.$on('$routeChangeStart', function () {
        $rootScope.loading = true;
    });
 
    $rootScope.$on('$routeChangeSuccess', function () {
        $rootScope.loading = false;
    });
 
    // Fake text i used here and there.
    $scope.lorem = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. ' +
        'Vel explicabo, aliquid eaque soluta nihil eligendi adipisci error, illum ' +
        'corrupti nam fuga omnis quod quaerat mollitia expedita impedit dolores ipsam. Obcaecati.';
 
    //
    // 'Scroll' screen
    //
    var scrollItems = [];
 
    for (var i = 1; i <= 100; i++) {
        scrollItems.push('Item ' + i);
    }
 
    $scope.scrollItems = scrollItems;
 
    $scope.bottomReached = function () {
        alert('Congrats you scrolled to the end of the list!');
    };
 
    //
    // Right Sidebar
    //
    $scope.chatUsers = [
        { name: 'Carlos  Flowers', online: true },
        { name: 'Byron Taylor', online: true },
        { name: 'Jana  Terry', online: true },
        { name: 'Darryl  Stone', online: true },
        { name: 'Fannie  Carlson', online: true },
        { name: 'Holly Nguyen', online: true },
        { name: 'Bill  Chavez', online: true },
        { name: 'Veronica  Maxwell', online: true },
        { name: 'Jessica Webster', online: true },
        { name: 'Jackie  Barton', online: true },
        { name: 'Crystal Drake', online: false },
        { name: 'Milton  Dean', online: false },
        { name: 'Joann Johnston', online: false },
        { name: 'Cora  Vaughn', online: false },
        { name: 'Nina  Briggs', online: false },
        { name: 'Casey Turner', online: false },
        { name: 'Jimmie  Wilson', online: false },
        { name: 'Nathaniel Steele', online: false },
        { name: 'Aubrey  Cole', online: false },
        { name: 'Donnie  Summers', online: false },
        { name: 'Kate  Myers', online: false },
        { name: 'Priscilla Hawkins', online: false },
        { name: 'Joe Barker', online: false },
        { name: 'Lee Norman', online: false },
        { name: 'Ebony Rice', online: false }
    ];
 
    //
    // 'Forms' screen
    //
    $scope.rememberMe = true;
    $scope.email = 'me@example.com';
 
    $scope.login = function () {
        alert('You submitted the login form');
    };
 
    //
    // 'Drag' screen
    //
    $scope.notices = [];
 
    for (var j = 0; j < 10; j++) {
        $scope.notices.push({ icon: 'envelope', message: 'Notice ' + (j + 1) });
    }
 
    $scope.deleteNotice = function (notice) {
        var index = $scope.notices.indexOf(notice);
        if (index > -1) {
            $scope.notices.splice(index, 1);
        }
    };
    */

});
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	console.log('parameter: ' + name);
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
	console.log('RegEx: ' + regex);
	console.log('URL :' + location.href);
    var results = regex.exec(location.href);
	console.log(results);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

