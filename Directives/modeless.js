// modeless.js

// Modification of angular material dialog class to support modeless dialogs 
// (see dialog.js)
var mdModeless = {};

(function () {
	'use strict';

	angular.module('mdModeless', [
  'material.core',
  'material.components.backdrop',
  'myDraggable'
])
  .directive('mdModeless', ['$$rAF', '$mdTheming', MdModelessDirective])
  .provider('$mdModeless', ['$$interimElementProvider', MdModelessProvider]);

function MdModelessDirective($$rAF, $mdTheming) {
  return {
    restrict: 'E',
    link: function(scope, element, attr) {
      $mdTheming(element);
      $$rAF(function() {
        var content = element[0].querySelector('md-content');
        if (content && content.scrollHeight > content.clientHeight) {
          element.addClass('md-content-overflow');
        }
      });
    }
  };
}

function MdModelessProvider($$interimElementProvider) {

  var alertModelessMethods = ['title', 'content', 'ariaLabel', 'ok'];

  return $$interimElementProvider('$mdModeless')
    .setDefaults({
      methods: ['disableParentScroll', 'hasBackdrop', 'clickOutsideToClose', 'escapeToClose', 'targetEvent', 'parent'],
      options: modelessDefaultOptions
    })
    .addPreset('alert', {
      methods: ['title', 'content', 'ariaLabel', 'ok', 'theme'],
      options: advancedModelessOptions
    })
    .addPreset('confirm', {
      methods: ['title', 'content', 'ariaLabel', 'ok', 'cancel', 'theme'],
      options: advancedModelessOptions
    });

  /* @ngInject */
  function advancedModelessOptions($mdModeless, $mdTheming) {
    return {
      template: [
        '<md-modeless md-theme="{{ modeless.theme }}" aria-label="{{ modeless.ariaLabel }}">',
          '<md-content role="document" tabIndex="0">',
            '<h2 class="md-title">{{ modeless.title }}</h2>',
            '<p>{{ modeless.content }}</p>',
          '</md-content>',
          '<div class="md-actions">',
            '<md-button ng-if="modeless.$type == \'confirm\'" ng-click="modeless.abort()">',
              '{{ modeless.cancel }}',
            '</md-button>',
            '<md-button ng-click="modeless.hide()" class="md-primary">',
              '{{ modeless.ok }}',
            '</md-button>',
          '</div>',
        '</md-modeless>'
      ].join(''),
      controller: function mdModelessCtrl() {
        this.hide = function() {
          $mdModeless.hide(true);
        };
        this.abort = function() {
          $mdModeless.cancel();
        };
      },
      controllerAs: 'modeless',
      bindToController: true,
      theme: $mdTheming.defaultTheme()
    };
  }

  /* @ngInject */
  function modelessDefaultOptions($mdAria, $document, $mdUtil, $mdConstant, $mdTheming, $mdModeless, $timeout, $rootElement, $animate, $$rAF, $q) {
    return {
      hasBackdrop: false,
      isolateScope: true,
      onShow: onShow,
      onRemove: onRemove,
      clickOutsideToClose: false,
      escapeToClose: true,
      targetEvent: null,
      focusOnOpen: true,
      disableParentScroll: true,
      transformTemplate: function(template) {
      	return '<div my-draggable class="md-modeless-container">' + template + '</div>';
      }
    };

    // On show method for modelesss
    function onShow(scope, element, options) {
      element = $mdUtil.extractElementByName(element, 'md-modeless');

      // Incase the user provides a raw dom element, always wrap it in jqLite
      options.parent = angular.element(options.parent);

      options.popInTarget = angular.element((options.targetEvent || {}).target);
      var closeButton = findCloseButton();

      if (options.hasBackdrop) {
        // Fix for IE 10
        var computeFrom = (options.parent[0] == $document[0].body && $document[0].documentElement
                           && $document[0].documentElement.scrollTop) ? angular.element($document[0].documentElement) : options.parent;
        var parentOffset = computeFrom.prop('scrollTop');
        options.backdrop = angular.element('<md-backdrop class="md-modeless-backdrop md-opaque">');
        options.backdrop.css('top', parentOffset +'px');
        $mdTheming.inherit(options.backdrop, options.parent);
        $animate.enter(options.backdrop, options.parent);
        element.css('top', parentOffset +'px');
      }

      var role = 'modeless',
          elementToFocus = closeButton;

      if (options.$type === 'alert') {
        role = 'alertmodeless';
        elementToFocus = element.find('md-content');
      }

      configureAria(element.find('md-modeless'), role, options);

      if (options.disableParentScroll) {
        options.lastOverflow = options.parent.css('overflow');
        options.parent.css('overflow', 'hidden');
      }

      return modelessPopIn(
        element,
        options.parent,
        options.popInTarget && options.popInTarget.length && options.popInTarget
      )
      .then(function() {

        applyAriaToSiblings(element, true);

        if (options.escapeToClose) {
          options.rootElementKeyupCallback = function(e) {
            if (e.keyCode === $mdConstant.KEY_CODE.ESCAPE) {
              $timeout($mdModeless.cancel);
            }
          };
          $rootElement.on('keyup', options.rootElementKeyupCallback);
        }

        if (options.clickOutsideToClose) {
          options.modelessClickOutsideCallback = function(ev) {
            // Only close if we click the flex container outside the backdrop
            if (ev.target === element[0]) {
              $timeout($mdModeless.cancel);
            }
          };
          element.on('click', options.modelessClickOutsideCallback);
        }

        if (options.focusOnOpen) {
          elementToFocus.focus();
        }
      });


      function findCloseButton() {
        //If no element with class modeless-close, try to find the last
        //button child in md-actions and assume it is a close button
        var closeButton = element[0].querySelector('.modeless-close');
        if (!closeButton) {
          var actionButtons = element[0].querySelectorAll('.md-actions button');
          closeButton = actionButtons[ actionButtons.length - 1 ];
        }
        return angular.element(closeButton);
      }

    }

    // On remove function for all modelesss
    function onRemove(scope, element, options) {

      if (options.backdrop) {
        $animate.leave(options.backdrop);
      }
      if (options.disableParentScroll) {
        options.parent.css('overflow', options.lastOverflow);
        delete options.lastOverflow;
      }
      if (options.escapeToClose) {
        $rootElement.off('keyup', options.rootElementKeyupCallback);
      }
      if (options.clickOutsideToClose) {
        element.off('click', options.modelessClickOutsideCallback);
      }

      applyAriaToSiblings(element, false);

      return modelessPopOut(
        element,
        options.parent,
        options.popInTarget && options.popInTarget.length && options.popInTarget
      ).then(function() {
        options.scope.$destroy();
        element.remove();
        options.popInTarget && options.popInTarget.focus();
      });

    }

    /**
     * Inject ARIA-specific attributes appropriate for Modelesss
     */
    function configureAria(element, role, options) {

      element.attr({
        'role': role,
        'tabIndex': '-1'
      });

      var modelessContent = element.find('md-content');
      if (modelessContent.length === 0){
        modelessContent = element;
      }

      var modelessId = element.attr('id') || ('modeless_' + $mdUtil.nextUid());
      modelessContent.attr('id', modelessId);
      element.attr('aria-describedby', modelessId);

      if (options.ariaLabel) {
        $mdAria.expect(element, 'aria-label', options.ariaLabel);
      }
      else {
        $mdAria.expectAsync(element, 'aria-label', function() {
          var words = modelessContent.text().split(/\s+/);
          if (words.length > 3) words = words.slice(0,3).concat('...');
          return words.join(' ');
        });
      }
    }
    /**
     * Utility function to filter out raw DOM nodes
     */
    function isNodeOneOf(elem, nodeTypeArray) {
      if (nodeTypeArray.indexOf(elem.nodeName) !== -1) {
        return true;
      }
    }
    /**
     * Walk DOM to apply or remove aria-hidden on sibling nodes
     * and parent sibling nodes
     *
     * Prevents screen reader interaction behind modal window
     * on swipe interfaces
     */
    function applyAriaToSiblings(element, value) {
      var attribute = 'aria-hidden';

      // get raw DOM node
      element = element[0];

      function walkDOM(element) {
        while (element.parentNode) {
          if (element === document.body) {
            return;
          }
          var children = element.parentNode.children;
          for (var i = 0; i < children.length; i++) {
            // skip over child if it is an ascendant of the modeless
            // or a script or style tag
            if (element !== children[i] && !isNodeOneOf(children[i], ['SCRIPT', 'STYLE'])) {
              children[i].setAttribute(attribute, value);
            }
          }

          walkDOM(element = element.parentNode);
        }
      }
      walkDOM(element);
    }

    function modelessPopIn(container, parentElement, clickElement) {
      var modelessEl = container.find('md-modeless');

      parentElement.append(container);
      transformToClickElement(modelessEl, clickElement);

      $$rAF(function() {
        modelessEl.addClass('transition-in')
          .css($mdConstant.CSS.TRANSFORM, '');
      });

      return $mdUtil.transitionEndPromise(modelessEl);
    }

    function modelessPopOut(container, parentElement, clickElement) {
      var modelessEl = container.find('md-modeless');

      modelessEl.addClass('transition-out').removeClass('transition-in');
      transformToClickElement(modelessEl, clickElement);

      return $mdUtil.transitionEndPromise(modelessEl);
    }

    function transformToClickElement(modelessEl, clickElement) {
      if (clickElement) {
        var clickRect = clickElement[0].getBoundingClientRect();
        var modelessRect = modelessEl[0].getBoundingClientRect();

        var scaleX = Math.min(0.5, clickRect.width / modelessRect.width);
        var scaleY = Math.min(0.5, clickRect.height / modelessRect.height);

        modelessEl.css($mdConstant.CSS.TRANSFORM, 'translate3d(' +
          (-modelessRect.left + clickRect.left + clickRect.width/2 - modelessRect.width/2) + 'px,' +
          (-modelessRect.top + clickRect.top + clickRect.height/2 - modelessRect.height/2) + 'px,' +
          '0) scale(' + scaleX + ',' + scaleY + ')'
        );
      }
    }

    function modelessTransitionEnd(modelessEl) {
      var deferred = $q.defer();
      modelessEl.on($mdConstant.CSS.TRANSITIONEND, finished);
      function finished(ev) {
        //Make sure this transitionend didn't bubble up from a child
        if (ev.target === modelessEl[0]) {
          modelessEl.off($mdConstant.CSS.TRANSITIONEND, finished);
          deferred.resolve();
        }
      }
      return deferred.promise;
    }

  }
}

})();
