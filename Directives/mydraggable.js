// mydraggable.js
/**
// Dialog has this structure
<md-modeless class="dialog">
	<md-toolbar md-scroll-shrink>
		<div class="md-toolbar-tools">
			<span>Dialog Title</span>
		</div>
	</md-toolbar>
</md-modeless>
*/

var myDraggable = {};

(function () {
	'use strict';

	angular.module('myDraggable', [])
	.directive('myDraggable', ['$document', function ($document) {
		return {
			link: function (scope, element, attr) {
				var startX = 0, startY = 0, x = 0, y = 0;

				element.css({
					position: 'absolute',
					cursor: 'pointer'
				});

				element.on('mousedown', function (event) {
					// Prevent default dragging of selected content
                    event.preventDefault();
                    startX = event.offsetX - x;
                    startY = event.offsetY - y;
                    $document.on('mousemove', mousemove);
                    $document.on('mouseup', mouseup);					
				});

				function mousemove(event) {
					y = event.pageY - startY;
					x = event.pageX - startX;
					element.css({
						top: y + 'px',
						left: x + 'px'
					});
				}

				function mouseup() {
					$document.off('mousemove', mousemove);
					$document.off('mouseup', mouseup);
					x = 0;
					y = 0;
				}
			}
		};
	}]);

})();