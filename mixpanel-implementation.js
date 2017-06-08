(function (root, factory) {
  if(typeof define === "function" && define.amd) {
    define(["jquery"], function($) {
      return (root.MixpanelImplementation = factory($, root, root.document, root.mixpanel));
    });
  } else {
    root.MixpanelImplementation = factory(root.jQuery, root, root.document, root.mixpanel);
  }
} (this, function($, window, document, mixpanel, undefined) {

    // public functions
    this.MixpanelImplementation = {
        init: function(){
            if (!$.cookie('mixpanel_view_count')) {
                $.cookie('mixpanel_view_count', 1, {expiration: 3650, domain: preparedCookieDomain()});
            } else {
                var mixpanel_view_count = $.cookie('mixpanel_view_count');
                $.cookie('mixpanel_view_count', ++mixpanel_view_count, {expiration: 3650, domain: preparedCookieDomain()});
            }

            mixpanel.register_once({
                'first_view_page': new Date().toISOString(),
                'first_session_start': new Date().toISOString()
            });

            mixpanel.people.set_once({
                'campaign_name': getUrlParameter('utm_campaign'),
                'campaign_source': getUrlParameter('utm_source'),
                'first_view_page': new Date().toISOString(),
                'first_session_start': new Date().toISOString()
            });

            mixpanel.register({
                'last_session_start': $.cookie('mixpanel_session_start'),
                'last_view_page': new Date().toISOString(),
                'view_count': $.cookie('mixpanel_view_count'),
                'session_count': $.cookie('mixpanel_session_count') || 1
            });

            mixpanel.people.set({
                'last_session_start': $.cookie('mixpanel_session_start'),
                'last_view_page': new Date().toISOString()
            });

            mixpanel.people.increment('number_view_page');

            // track every single page view
            mixpanel.track('Viewed page', {
                'page_name': document.title
            });

            // track session start
            oncePerSession(30, function(){
                mixpanel.track('Session start', {
                    'current_campaign_name': getUrlParameter('utm_campaign'),
                    'current_campaign_source': getUrlParameter('utm_source'),
                });
                mixpanel.people.increment('number_session_start');
            });
        },
        afterSignup: function(email){
            mixpanel.alias(email);
        },
        afterLogin: function(first_name, last_name, email){
            mixpanel.identify(email);
            mixpanel.people.set({
                "$first_name": first_name,
                "$last_name": last_name,
                "$email": email
            });
        }
    };

    // private functions
    function expiration(timeoutInMinutes) {
        return {
            expires: new Date(new Date().getTime() + timeoutInMinutes * 60 * 1000),
            domain: preparedCookieDomain()
        };
    };
    function oncePerSession(timeoutInMinutes, callable) {
        if (!$.cookie('mixpanel')) {
            $.cookie('mixpanel_session_start', new Date().toISOString(), expiration(timeoutInMinutes));
            if (!$.cookie('mixpanel_session_count')) {
                $.cookie('mixpanel_session_count', 1, {expiration: 3650, domain: preparedCookieDomain()});
            } else {
                var mixpanel_session_count = $.cookie('mixpanel_session_count');
                $.cookie('mixpanel_session_count', ++mixpanel_session_count, {expiration: 3650, domain: preparedCookieDomain()});
            }
            callable();
        } else {
            $.cookie('mixpanel_session_start', $.cookie('mixpanel_session_start'), expiration(timeoutInMinutes));
        }

        $.cookie('mixpanel', 1, expiration(timeoutInMinutes));
    }
    function getUrlParameter(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    }
    function preparedCookieDomain(){
        return '.'+window.location.hostname.split('.').slice(-2).join('.');
    }

  return this.MixpanelImplementation;

}));