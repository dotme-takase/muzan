(function (window) {
    var TextLinkContainer = {
        items:new Array(),
        px:0,
        py:0,
        onTouchStart:function (e) {
            TextLinkContainer.px = e.changedTouches[0].pageX;
            TextLinkContainer.py = e.changedTouches[0].pageY;
            for (var k in TextLinkContainer.items)(function (item, i) {
                if (item.enabled && item.wrapper.alpha == 1) {
                    if (TextLinkContainer.isInRect(TextLinkContainer.px, TextLinkContainer.py, item.rect)) {
                        item.rectObj.alpha = 1.0;
                    } else {
                        item.rectObj.alpha = 0.5;
                    }
                }
            })(TextLinkContainer.items[k], k);
        },
        onTouchEnd:function (e) {
            var x = e.changedTouches[0].pageX;
            var y = e.changedTouches[0].pageY;
            for (var k in TextLinkContainer.items) {
                var item = TextLinkContainer.items[k];
                if (item.enabled && item.wrapper.alpha == 1) {
                    item.rectObj.alpha = 0.5;
                    if (TextLinkContainer.isInRectWithPrev(x, y, item.rect)) {
                        item.onclick();
                    }
                }
            }
        },
        onTouchMove:function (e) {
            var x = e.touches[0].pageX;
            var y = e.touches[0].pageY;
            for (var k in TextLinkContainer.items) {
                var item = TextLinkContainer.items[k];
                if (item.enabled && item.wrapper.alpha == 1) {
                    if (TextLinkContainer.isInRectWithPrev(x, y, item.rect)) {
                        item.rectObj.alpha = 1.0;
                    } else {
                        item.rectObj.alpha = 0.5;
                    }
                }
            }
        },
        isInRect:function (x, y, rect) {
            if ((x <= rect.x + rect.width)
                && (x >= rect.x )
                && (y <= rect.y + rect.height)
                && (y >= rect.y )
                ) {
                return true;
            }
            return false;
        },
        isInRectWithPrev:function (x, y, rect) {
            return TextLinkContainer.isInRect(x, y, rect) && TextLinkContainer.isInRect(TextLinkContainer.px, TextLinkContainer.py, rect);
        }
    };
    document.addEventListener('touchstart', TextLinkContainer.onTouchStart);
    document.addEventListener('touchend', TextLinkContainer.onTouchEnd);
    document.addEventListener('touchmove', TextLinkContainer.onTouchMove);

    var TextLink = function (wrapper, text, rect, color, bgColor, onclick) {
        this.initialize(wrapper, text, rect, color, bgColor, onclick);
    };
    var p = TextLink.prototype = new createjs.Container();

    p.TextLink_initialize = p.initialize;
    p.TextLink_clone = p.clone;

    p.textObj = null;
    p.rectObj = null;

    p.wrapper = null;
    p.rect = {
        x:0, y:0, width:0, height:0
    };

    p.enabled = false;
    /**
     * Initialization method.
     * @method initialize
     * @protected
     */
    p.initialize = function (wrapper, rect, text, color, bgColor, onclick) {
        this.wrapper = wrapper;
        this.rect = rect;
        this.onclick = onclick;
        this.rectObj = new createjs.Shape((new createjs.Graphics())
            .beginFill(bgColor)
            .drawRect(rect.x, rect.y, rect.width, rect.height)
        );
        this.rectObj.alpha = 0.5;
        this.textObj = new createjs.Text("", "bold 36px Arial", color);
        this.textObj.text = text;
        this.textObj.textAlign = "center";
        this.textObj.x = rect.x + rect.width / 2;
        this.textObj.y = (rect.y - 8) + rect.height / 2;
        this.textObj.rect = rect;
        wrapper.addChild(this.rectObj);
        wrapper.addChild(this.textObj);
        this.enabled = true;
        TextLinkContainer.items.push(this);
    };

    window.TextLink = TextLink;
}(window));