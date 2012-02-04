$(function() {

    var isMouseDown = false;
    var isCursor = false;
    $("#canvas").on("mousedown touchstart",
        function(e) {
            var CANVAS_LEFT = $(this).offset().left;
            var CANVAS_TOP = $(this).offset().top;
            isMouseDown = true;
            var startX = e.clientX - CANVAS_LEFT;
            var startY = e.clientY - CANVAS_TOP;
            if (event.touches && event.touches[0]) {
                startX = event.touches[0].clientX - CANVAS_LEFT;
                startY = event.touches[0].clientY - CANVAS_TOP;
                e.preventDefault();
            }
            if (Math.pow(startX - 100, 2) + Math.pow(startY - 100, 2) < Math.pow(40, 2)) {
                isCursor = true;
            }
        }).on("mousemove touchmove",
        function(e) {
            var CANVAS_LEFT = $(this).offset().left;
            var CANVAS_TOP = $(this).offset().top;
            if (isCursor) {
                if (event.touches && event.touches[0]) {
                    x = event.touches[0].clientX - CANVAS_LEFT;
                    y = event.touches[0].clientY - CANVAS_TOP;
                    e.preventDefault();
                } else {
                    x = e.clientX - CANVAS_LEFT;
                    y = e.clientY - CANVAS_TOP;
                }
                if (Math.pow(x - 100, 2) + Math.pow(y - 100, 2) > Math.pow(40, 2)) {
                    //isCursor = false;
                    //x = y = 0;
                }
            }
        }).on("mouseup touchend mouseleave touchleave", function(e) {
            isCursor = isMouseDown = false;
            x = y = 0;
        });
});

