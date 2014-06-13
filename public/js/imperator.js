(function($, undefined) {

  if ($.imperator !== undefined) {
    $.error('imperator has already been loaded!');
  }

  var rails;
  var $document = $(document);

  $.imperator = imperator = {
    linkClickSelector: 'a[data-confirm], a[data-method]',
    buttonClickSelector: 'button[data-confirm], button[data-remote]',

    fire: function(obj, name, data) {
      var event = $.Event(name);
      obj.trigger(event, data);
      return event.result !== false;
    },

    confirm: function (message) {
      return confirm(message);
    },

    href: function (element) {
      return element.attr('href');
    },

    stopEverything: function(e) {
      e.stopImmediatePropagation();
      return false;
    },

    allowAction: function(element) {
      var message = element.data('confirm');
      var answer = false, callback;

      if (!message) {
        return true;
      }

      if (imperator.fire(element, 'confirm')) {
        answer = imperator.confirm(message);
        callback = imperator.fire(element, 'confirm:complete', [answer]);
      }

      return answer && callback;
    },

    handleMethod: function (link) {
      var href = imperator.href(link);
      var method = link.data('method');
      var target = link.attr('target');
      var form = $('<form method="post" action="' + href + '"></form>');
      var metadataInput = '<input name="_method" value="' + method + '" type="hidden" />';

      if (target) { form.attr('target', target); }

      form.hide().append(metadataInput).appendTo('body');
      form.submit();
    }
  };

  $document.delegate(imperator.linkClickSelector, 'click.imperator', function (e) {
    var link = $(this);
    var method = link.data('method');
    var data = link.data('params');

    if (!imperator.allowAction(link)) return imperator.stopEverything(e);

    if (link.data('method')) {
      imperator.handleMethod(link);
      return false;
    }
  });
})(jQuery);
