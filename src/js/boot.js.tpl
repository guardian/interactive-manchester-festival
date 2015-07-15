'use strict';
define([], function() {
    function addCSS(url) {
        var head = document.querySelector('head');
        var link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');
        link.setAttribute('href', url);
        head.appendChild(link);
    }

    return {
        boot: function(el, context, config, mediator) {

            // Loading message while we fetch JS / CSS
            el.innerHTML = '<div style="font-size: 24px; text-align: center; padding: 72px 0; font-family: \'Guardian Egyptian Web\',Georgia,serif;">Loading…</div>';

            if(window.innerWidth > 640) {
                window.setTimeout(function() {
                    addCSS('<%= assetPath %>/main.css');
                }, 10);

                require(['<%= assetPath %>/main.js'], function(main) {
                    main.init(el, context, config, mediator);
                }, function(err) { console.error('Error loading boot.', err); });
            } else {
                window.setTimeout(function() {
                    addCSS('<%= assetPath %>/mobile.css');
                }, 10);

                require(['<%= assetPath %>/mobile.js'], function(mobile) {
                    mobile.init(el, context, config, mediator);
                }, function(err) { console.error('Error loading boot.', err); });
            }
        }
    };
});
