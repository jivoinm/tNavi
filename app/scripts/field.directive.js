'use strict';

angular.module('starter')
  .directive('field', function ($http, $compile, $timeout) {

        function getFieldTemplate(fieldType){
            var fieldTemplate = '';

            switch(fieldType) {
                case 'date':
                  fieldTemplate = '<label class="item item-input item-stacked-label"><span class="input-label">{{field.title}}</span>'+
                      '<input type="date" name="fieldName" placeholder="{{field.title}}" ng-model="model" value="{{field.value}}" ng-required="{{ field.require }}">' +
                  '</label>';

                    break;
                case 'text':
                    fieldTemplate = '<label class="item item-input item-stacked-label"><span class="input-label">{{field.title}}</span>'+
                        '<input type="text" name="fieldName" placeholder="{{field.title}}" ng-model="model" value="{{field.value}}" ng-required="{{ field.require }}">' +
                    '</label>';
                    break;
                case 'number':
                  fieldTemplate = '<label class="item item-input item-stacked-label"><span class="input-label">{{field.title}}</span>'+
                      '<input type="number" name="fieldName" placeholder="{{field.title}}" ng-model="model" value="{{field.value}}" ng-required="{{ field.require }}">' +
                  '</label>';
                    break;
                case 'hidden':
                    fieldTemplate = '<input type="hidden" class="form-control" name="fieldName" ng-model="model" value="{{field.value}}"/>';
                    fieldTemplate = fieldTemplate;
                    break;
                case 'password':
                  fieldTemplate = '<label class="item item-input item-stacked-label"><span class="input-label">{{field.title}}</span>'+
                      '<input type="password" name="fieldName" placeholder="{{field.title}}" ng-model="model" value="{{field.value}}" ng-required="{{ field.require }}">' +
                  '</label>';
                    break;
                case 'email':
                  fieldTemplate = '<label class="item item-input item-stacked-label"><span class="input-label">{{field.title}}</span>'+
                      '<input type="email" name="fieldName" placeholder="{{field.title}}" ng-model="model" value="{{field.value}}" ng-required="{{ field.require }}">' +
                  '</label>';
                    break;
                case 'select':
                  fieldTemplate = '<label class="item item-input item-stacked-label"><div class="input-label">{{field.title}}</div>'+
                      '<select name="fieldName" ng-model="model" ng-options="label for value in field.show_options">' +
                         '</select>' +
                       '</label>';
                    break;
                case 'checkbox':
                    fieldTemplate = '<li class="item item-checkbox">' +
                            '<label class="checkbox">' +
                                '<input type="checkbox" name="fieldName" ng-model="model" ng-required="{{ field.require }}">' +
                            '</label>' +
                          '</li>';
                    break;
                case 'radio':
                    fieldTemplate = '<label class="item item-radio" ng-repeat="option in splitOptions(field.show_options)">' +
                        '<input type="radio" name="fieldName" ng-model="model" ng-value="option"><div class="item-content">{{ option }}</div>' +
                        '<i class="radio-icon ion-checkmark" ng-show="option"></i>' +
                    '</label>';
                    break;
                case 'textarea':
                  fieldTemplate = '<label class="item item-input item-stacked-label"><span class="input-label">{{field.title}}</span>'+
                  '<textarea class="form-control" rows="3" name="fieldName" placeholder="{{field.title}}"'+
                      'ng-model="model" value="{{field.value}}" ng-required="{{ field.require }}"/>'
                  '</label>';
                    break;

            }
            return fieldTemplate
        }

        return {
            restrict: 'E',
            scope: {
                model: '=ngModel',
                field: '=ngField',
                edit: '&',
                delete: '&',
                index: '=',
                preview: '@'
            },
            link: function(scope, elem, attr) {
                scope.splitOptions = function(optionString) {
                    if( Object.prototype.toString.call( optionString ) === '[object Array]' ) return optionString;
                    return optionString ? optionString.split(',') : [];
                }

                if(scope.field) {
                    var markup = getFieldTemplate(scope.field.type);
                    elem.html(markup);
                    $compile(elem.contents())(scope);

                    if(scope.field.focus === true) {
                        $timeout(function() {
                            elem.find('input, select, textarea').focus();
                        }, 700);

                    }
                }
            }

        };
  });
