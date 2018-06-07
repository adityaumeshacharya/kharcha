(function() {
    angular.module('myApp', [])
        .controller('addOrRemoveTransaction', addOrRemoveTransaction);
    addOrRemoveTransaction.$inject = ['$scope', '$http'];

    function addOrRemoveTransaction($scope, $http) {

        $scope.items = [];
        var itemsFromGet;
        $scope.typeOfTransactions = [{ type: "cr." }, { type: "dr." }];
        $scope.totalAmount = 100.0;
        $scope.date = "";
        $scope.description = "";
        $scope.typeOfTransaction = "";
        $scope.Amount = 0.0;

        $http.get('http://localhost:3000/api/assets/')
            .then(function(response) {
                $scope.items = response.data;
                $scope.getTotalAmount();
                console.log($scope.totalAmount);
            });

        $scope.addItem = function() {
            var item = {
                Date: $scope.date,
                Description: $scope.description,
                TypeOfTransaction: $scope.typeOfTransaction,
                Amount: $scope.Amount
            };
            $scope.items.push(item);
            $http.post('http://localhost:3000/api/assets', {
                'Date': $scope.date,
                'Description': $scope.description,
                'TypeOfTransaction': $scope.typeOfTransaction,
                'Amount': $scope.Amount
            }).then(function(res) {
                console.log(res);
            });
            $scope.getTotalAmount();
            $http.get('http://localhost:3000/api/assets/').then(function(response) {
                $scope.items = response.data;
                $scope.getTotalAmount();
                console.log($scope.totalAmount);
            });
        };

        $scope.removeItem = function(item) {
            console.log(item);
            var Id = item._id;
            console.log('Sending _id : ' + Id);
            $http.delete('http://localhost:3000/api/assets/' + Id)
                .then(function(response) {
                        console.log(response);
                        for (var i = 0; i < $scope.items.length; i++) {
                            if (item._id == $scope.items[i]._id) {
                                $scope.items.splice(i, 1);
                                i = $scope.items.length;
                            }
                        }
                        $scope.getTotalAmount();
                    },
                    function(response) {
                        console.log(response);
                    });
        }

        $scope.getTotalAmount = function() {
            $scope.totalAmount = 100;
            for (var index in $scope.items) {
                if ($scope.items[index].TypeOfTransaction == "cr.") {
                    $scope.totalAmount += $scope.items[index].Amount;
                } else {
                    $scope.totalAmount -= $scope.items[index].Amount;
                }
            }
        }

        $scope.myFunction = function() {
            location.reload();
        }

    }
})();