require(['app', 'ngMaterial', 'mdModeless'], function (app, ngMaterial, mdModeless) {
    'use strict';
    var index = 0;
    app.controller('myController', ['$scope', '$mdModeless', function($scope, $mdModeless) {
        
        $scope.showAdvanced = function(ev) {
            index++;
            var elementId = "Test" + '_' + index;
            
            $mdModeless.show({
                controller: DialogController,
                templateUrl: 'dialog.tpl.html',
                targetEvent: ev,
                elementId: elementId,
                locals: {
                    ngBuilderInfo: {
                        elementId: elementId,
                        $mdModeless: $mdModeless
                    } 
                }
            });
        };
        
         
        $scope.showAlert = function(ev) {
            // Appending dialog to document.body to cover sidenav in docs app
            // Modal dialogs should fully cover application
            // to prevent interaction outside of dialog            
            $mdModeless.show(
                $mdModeless.alert()
                //.parent(angular.element(document.body))
                .title('This is an alert title')
                .content('You can specify some description text in here.')
                .ariaLabel('Alert Dialog Demo')
                .ok('Got it!')
                .targetEvent(ev)
            );
        };
        
    }]); 
    
    function DialogController($scope, $mdModeless, ngBuilderInfo) {
        var calculator = {
            result: 0,
            operation: "",
            currentNumber: "0",
            resultDisplay: "",

            reset: function() {
                this.result = 0;
                this.operation = "";
                this.currentNumber = "0";
                this.resultDisplay = "";
            },

            setOperation: function(operate) {        
                this.operation = operate;
                this.resultDisplay += "" + this.operation;
                this.calculate();

                this.currentNumber = "";
            },  

            calculate: function() {        
                switch(this.operation) {
                    case "+":
                        this.result += parseFloat(this.currentNumber);
                        break;

                    case "-":
                        this.result -= parseFloat(this.currentNumber);
                        break;

                    case "*":
                        this.result *= parseFloat(this.currentNumber);
                        break;

                    case "/":
                        this.result /= parseFloat(this.currentNumber);
                        break;

                    case "=":
                        this.reset();
                        break;
                }
            } 
        };
        
        $scope.model = calculator;

        $scope.reset = function() {
            calculator.reset();       
        };

        $scope.numberClicked = function(number) {
            calculator.currentNumber += number;
            calculator.resultDisplay += number;
        };

        $scope.operations = function(operator) {
            calculator.setOperation(operator);				
        };

        $scope.enter = function() {
            calculator.calculate();        
            calculator.resultDisplay = calculator.result; 
        };
        
        $scope.hide = function() {
            $mdModeless.hide();
        };
        
        $scope.cancel = function() {
            $mdModeless.cancel(null, ngBuilderInfo.elementId);
        };  
        
        $scope.closeDialog = function() {
            $mdModeless.cancel(null, ngBuilderInfo.elementId);
        };
    }
});