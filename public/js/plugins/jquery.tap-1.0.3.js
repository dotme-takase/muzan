(function($) {
/**
 * jquery.tap.js
 * A simple tap event attachment jQuery Plugin.
 * http://www.rainorshine.asia/
 *
 * @author TakaoFan
 * @version 1.0.3
 * @requires jQuery version 1.4.3 or later
 */

$.event.tap = function(o) {
  o.bind('touchstart', onTouchStart_);

  function onTouchStart_(e) {
    e.preventDefault();
    o.data('event.tap.moved', false)
      .one('touchmove', onTouchMove_)
      .one('touchend', onTouchEnd_);
  }

  function onTouchMove_(e) {
    o.data('event.tap.moved', true);
  }

  function onTouchEnd_(e) {
    if (!o.data('event.tap.moved')) {
      o.unbind('touchmove', onTouchMove_);
      o.trigger('tap').click();
    }
  }
};

if ('ontouchend' in document) {
  $.fn.tap = function(data, fn) {
    if (fn == null) {
      fn = data;
      data = null;
    }

    if (arguments.length > 0) {
      this.bind('tap', data, fn);
      $.event.tap(this);
    } else {
      this.trigger('tap');
    }
    return this;
  };

  if ($.attrFn) {
    $.attrFn['tap'] = true;
  }
} else {
  $.fn.tap = $.fn.click;
}

})(jQuery);