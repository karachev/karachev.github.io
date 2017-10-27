/*JQUERY PLUGINS*/
/*!
 * jQuery Migrate - v3.0.0 - 2016-06-09
 * Copyright jQuery Foundation and other contributors
 */
(function( jQuery, window ) {
"use strict";


jQuery.migrateVersion = "3.0.0";


( function() {

	// Support: IE9 only
	// IE9 only creates console object when dev tools are first opened
	// Also, avoid Function#bind here to simplify PhantomJS usage
	var log = window.console && window.console.log &&
			function() { window.console.log.apply( window.console, arguments ); },
		rbadVersions = /^[12]\./;

	if ( !log ) {
		return;
	}

	// Need jQuery 3.0.0+ and no older Migrate loaded
	if ( !jQuery || rbadVersions.test( jQuery.fn.jquery ) ) {
		log( "JQMIGRATE: jQuery 3.0.0+ REQUIRED" );
	}
	if ( jQuery.migrateWarnings ) {
		log( "JQMIGRATE: Migrate plugin loaded multiple times" );
	}

	// Show a message on the console so devs know we're active
	log( "JQMIGRATE: Migrate is installed" +
		( jQuery.migrateMute ? "" : " with logging active" ) +
		", version " + jQuery.migrateVersion );

} )();

var warnedAbout = {};

// List of warnings already given; public read only
jQuery.migrateWarnings = [];

// Set to false to disable traces that appear with warnings
if ( jQuery.migrateTrace === undefined ) {
	jQuery.migrateTrace = true;
}

// Forget any warnings we've already given; public
jQuery.migrateReset = function() {
	warnedAbout = {};
	jQuery.migrateWarnings.length = 0;
};

function migrateWarn( msg ) {
	var console = window.console;
	if ( !warnedAbout[ msg ] ) {
		warnedAbout[ msg ] = true;
		jQuery.migrateWarnings.push( msg );
		if ( console && console.warn && !jQuery.migrateMute ) {
			console.warn( "JQMIGRATE: " + msg );
			if ( jQuery.migrateTrace && console.trace ) {
				console.trace();
			}
		}
	}
}

function migrateWarnProp( obj, prop, value, msg ) {
	Object.defineProperty( obj, prop, {
		configurable: true,
		enumerable: true,
		get: function() {
			migrateWarn( msg );
			return value;
		}
	} );
}

if ( document.compatMode === "BackCompat" ) {

	// JQuery has never supported or tested Quirks Mode
	migrateWarn( "jQuery is not compatible with Quirks Mode" );
}


var oldInit = jQuery.fn.init,
	oldIsNumeric = jQuery.isNumeric,
	oldFind = jQuery.find,
	rattrHashTest = /\[(\s*[-\w]+\s*)([~|^$*]?=)\s*([-\w#]*?#[-\w#]*)\s*\]/,
	rattrHashGlob = /\[(\s*[-\w]+\s*)([~|^$*]?=)\s*([-\w#]*?#[-\w#]*)\s*\]/g;

jQuery.fn.init = function( arg1 ) {
	var args = Array.prototype.slice.call( arguments );

	if ( typeof arg1 === "string" && arg1 === "#" ) {

		// JQuery( "#" ) is a bogus ID selector, but it returned an empty set before jQuery 3.0
		migrateWarn( "jQuery( '#' ) is not a valid selector" );
		args[ 0 ] = [];
	}

	return oldInit.apply( this, args );
};
jQuery.fn.init.prototype = jQuery.fn;

jQuery.find = function( selector ) {
	var args = Array.prototype.slice.call( arguments );

	// Support: PhantomJS 1.x
	// String#match fails to match when used with a //g RegExp, only on some strings
	if ( typeof selector === "string" && rattrHashTest.test( selector ) ) {

		// The nonstandard and undocumented unquoted-hash was removed in jQuery 1.12.0
		// First see if qS thinks it's a valid selector, if so avoid a false positive
		try {
			document.querySelector( selector );
		} catch ( err1 ) {

			// Didn't *look* valid to qSA, warn and try quoting what we think is the value
			selector = selector.replace( rattrHashGlob, function( _, attr, op, value ) {
				return "[" + attr + op + "\"" + value + "\"]";
			} );

			// If the regexp *may* have created an invalid selector, don't update it
			// Note that there may be false alarms if selector uses jQuery extensions
			try {
				document.querySelector( selector );
				migrateWarn( "Attribute selector with '#' must be quoted: " + args[ 0 ] );
				args[ 0 ] = selector;
			} catch ( err2 ) {
				migrateWarn( "Attribute selector with '#' was not fixed: " + args[ 0 ] );
			}
		}
	}

	return oldFind.apply( this, args );
};

// Copy properties attached to original jQuery.find method (e.g. .attr, .isXML)
var findProp;
for ( findProp in oldFind ) {
	if ( Object.prototype.hasOwnProperty.call( oldFind, findProp ) ) {
		jQuery.find[ findProp ] = oldFind[ findProp ];
	}
}

// The number of elements contained in the matched element set
jQuery.fn.size = function() {
	migrateWarn( "jQuery.fn.size() is deprecated; use the .length property" );
	return this.length;
};

jQuery.parseJSON = function() {
	migrateWarn( "jQuery.parseJSON is deprecated; use JSON.parse" );
	return JSON.parse.apply( null, arguments );
};

jQuery.isNumeric = function( val ) {

	// The jQuery 2.2.3 implementation of isNumeric
	function isNumeric2( obj ) {
		var realStringObj = obj && obj.toString();
		return !jQuery.isArray( obj ) && ( realStringObj - parseFloat( realStringObj ) + 1 ) >= 0;
	}

	var newValue = oldIsNumeric( val ),
		oldValue = isNumeric2( val );

	if ( newValue !== oldValue ) {
		migrateWarn( "jQuery.isNumeric() should not be called on constructed objects" );
	}

	return oldValue;
};

migrateWarnProp( jQuery, "unique", jQuery.uniqueSort,
	"jQuery.unique is deprecated, use jQuery.uniqueSort" );

// Now jQuery.expr.pseudos is the standard incantation
migrateWarnProp( jQuery.expr, "filters", jQuery.expr.pseudos,
	"jQuery.expr.filters is now jQuery.expr.pseudos" );
migrateWarnProp( jQuery.expr, ":", jQuery.expr.pseudos,
	"jQuery.expr[\":\"] is now jQuery.expr.pseudos" );


var oldAjax = jQuery.ajax;

jQuery.ajax = function( ) {
	var jQXHR = oldAjax.apply( this, arguments );

	// Be sure we got a jQXHR (e.g., not sync)
	if ( jQXHR.promise ) {
		migrateWarnProp( jQXHR, "success", jQXHR.done,
			"jQXHR.success is deprecated and removed" );
		migrateWarnProp( jQXHR, "error", jQXHR.fail,
			"jQXHR.error is deprecated and removed" );
		migrateWarnProp( jQXHR, "complete", jQXHR.always,
			"jQXHR.complete is deprecated and removed" );
	}

	return jQXHR;
};


var oldRemoveAttr = jQuery.fn.removeAttr,
	oldToggleClass = jQuery.fn.toggleClass,
	rmatchNonSpace = /\S+/g;

jQuery.fn.removeAttr = function( name ) {
	var self = this;

	jQuery.each( name.match( rmatchNonSpace ), function( i, attr ) {
		if ( jQuery.expr.match.bool.test( attr ) ) {
			migrateWarn( "jQuery.fn.removeAttr no longer sets boolean properties: " + attr );
			self.prop( attr, false );
		}
	} );

	return oldRemoveAttr.apply( this, arguments );
};

jQuery.fn.toggleClass = function( state ) {

	// Only deprecating no-args or single boolean arg
	if ( state !== undefined && typeof state !== "boolean" ) {
		return oldToggleClass.apply( this, arguments );
	}

	migrateWarn( "jQuery.fn.toggleClass( boolean ) is deprecated" );

	// Toggle entire class name of each element
	return this.each( function() {
		var className = this.getAttribute && this.getAttribute( "class" ) || "";

		if ( className ) {
			jQuery.data( this, "__className__", className );
		}

		// If the element has a class name or if we're passed `false`,
		// then remove the whole classname (if there was one, the above saved it).
		// Otherwise bring back whatever was previously saved (if anything),
		// falling back to the empty string if nothing was stored.
		if ( this.setAttribute ) {
			this.setAttribute( "class",
				className || state === false ?
				"" :
				jQuery.data( this, "__className__" ) || ""
			);
		}
	} );
};


var internalSwapCall = false;

// If this version of jQuery has .swap(), don't false-alarm on internal uses
if ( jQuery.swap ) {
	jQuery.each( [ "height", "width", "reliableMarginRight" ], function( _, name ) {
		var oldHook = jQuery.cssHooks[ name ] && jQuery.cssHooks[ name ].get;

		if ( oldHook ) {
			jQuery.cssHooks[ name ].get = function() {
				var ret;

				internalSwapCall = true;
				ret = oldHook.apply( this, arguments );
				internalSwapCall = false;
				return ret;
			};
		}
	} );
}

jQuery.swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	if ( !internalSwapCall ) {
		migrateWarn( "jQuery.swap() is undocumented and deprecated" );
	}

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};

var oldData = jQuery.data;

jQuery.data = function( elem, name, value ) {
	var curData;

	// If the name is transformed, look for the un-transformed name in the data object
	if ( name && name !== jQuery.camelCase( name ) ) {
		curData = jQuery.hasData( elem ) && oldData.call( this, elem );
		if ( curData && name in curData ) {
			migrateWarn( "jQuery.data() always sets/gets camelCased names: " + name );
			if ( arguments.length > 2 ) {
				curData[ name ] = value;
			}
			return curData[ name ];
		}
	}

	return oldData.apply( this, arguments );
};

var oldTweenRun = jQuery.Tween.prototype.run;

jQuery.Tween.prototype.run = function( percent ) {
	if ( jQuery.easing[ this.easing ].length > 1 ) {
		migrateWarn(
			"easing function " +
			"\"jQuery.easing." + this.easing.toString() +
			"\" should use only first argument"
		);

		jQuery.easing[ this.easing ] = jQuery.easing[ this.easing ].bind(
			jQuery.easing,
			percent, this.options.duration * percent, 0, 1, this.options.duration
		);
	}

	oldTweenRun.apply( this, arguments );
};

var oldLoad = jQuery.fn.load,
	originalFix = jQuery.event.fix;

jQuery.event.props = [];
jQuery.event.fixHooks = {};

jQuery.event.fix = function( originalEvent ) {
	var event,
		type = originalEvent.type,
		fixHook = this.fixHooks[ type ],
		props = jQuery.event.props;

	if ( props.length ) {
		migrateWarn( "jQuery.event.props are deprecated and removed: " + props.join() );
		while ( props.length ) {
			jQuery.event.addProp( props.pop() );
		}
	}

	if ( fixHook && !fixHook._migrated_ ) {
		fixHook._migrated_ = true;
		migrateWarn( "jQuery.event.fixHooks are deprecated and removed: " + type );
		if ( ( props = fixHook.props ) && props.length ) {
			while ( props.length ) {
			   jQuery.event.addProp( props.pop() );
			}
		}
	}

	event = originalFix.call( this, originalEvent );

	return fixHook && fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
};

jQuery.each( [ "load", "unload", "error" ], function( _, name ) {

	jQuery.fn[ name ] = function() {
		var args = Array.prototype.slice.call( arguments, 0 );

		// If this is an ajax load() the first arg should be the string URL;
		// technically this could also be the "Anything" arg of the event .load()
		// which just goes to show why this dumb signature has been deprecated!
		// jQuery custom builds that exclude the Ajax module justifiably die here.
		if ( name === "load" && typeof args[ 0 ] === "string" ) {
			return oldLoad.apply( this, args );
		}

		migrateWarn( "jQuery.fn." + name + "() is deprecated" );

		args.splice( 0, 0, name );
		if ( arguments.length ) {
			return this.on.apply( this, args );
		}

		// Use .triggerHandler here because:
		// - load and unload events don't need to bubble, only applied to window or image
		// - error event should not bubble to window, although it does pre-1.7
		// See http://bugs.jquery.com/ticket/11820
		this.triggerHandler.apply( this, args );
		return this;
	};

} );

// Trigger "ready" event only once, on document ready
jQuery( function() {
	jQuery( document ).triggerHandler( "ready" );
} );

jQuery.event.special.ready = {
	setup: function() {
		if ( this === document ) {
			migrateWarn( "'ready' event is deprecated" );
		}
	}
};

jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		migrateWarn( "jQuery.fn.bind() is deprecated" );
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		migrateWarn( "jQuery.fn.unbind() is deprecated" );
		return this.off( types, null, fn );
	},
	delegate: function( selector, types, data, fn ) {
		migrateWarn( "jQuery.fn.delegate() is deprecated" );
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		migrateWarn( "jQuery.fn.undelegate() is deprecated" );
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	}
} );


var oldOffset = jQuery.fn.offset;

jQuery.fn.offset = function() {
	var docElem,
		elem = this[ 0 ],
		origin = { top: 0, left: 0 };

	if ( !elem || !elem.nodeType ) {
		migrateWarn( "jQuery.fn.offset() requires a valid DOM element" );
		return origin;
	}

	docElem = ( elem.ownerDocument || document ).documentElement;
	if ( !jQuery.contains( docElem, elem ) ) {
		migrateWarn( "jQuery.fn.offset() requires an element connected to a document" );
		return origin;
	}

	return oldOffset.apply( this, arguments );
};


var oldParam = jQuery.param;

jQuery.param = function( data, traditional ) {
	var ajaxTraditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;

	if ( traditional === undefined && ajaxTraditional ) {

		migrateWarn( "jQuery.param() no longer uses jQuery.ajaxSettings.traditional" );
		traditional = ajaxTraditional;
	}

	return oldParam.call( this, data, traditional );
};

var oldSelf = jQuery.fn.andSelf || jQuery.fn.addBack;

jQuery.fn.andSelf = function() {
	migrateWarn( "jQuery.fn.andSelf() replaced by jQuery.fn.addBack()" );
	return oldSelf.apply( this, arguments );
};


var oldDeferred = jQuery.Deferred,
	tuples = [

		// Action, add listener, callbacks, .then handlers, final state
		[ "resolve", "done", jQuery.Callbacks( "once memory" ),
			jQuery.Callbacks( "once memory" ), "resolved" ],
		[ "reject", "fail", jQuery.Callbacks( "once memory" ),
			jQuery.Callbacks( "once memory" ), "rejected" ],
		[ "notify", "progress", jQuery.Callbacks( "memory" ),
			jQuery.Callbacks( "memory" ) ]
	];

jQuery.Deferred = function( func ) {
	var deferred = oldDeferred(),
		promise = deferred.promise();

	deferred.pipe = promise.pipe = function( /* fnDone, fnFail, fnProgress */ ) {
		var fns = arguments;

		migrateWarn( "deferred.pipe() is deprecated" );

		return jQuery.Deferred( function( newDefer ) {
			jQuery.each( tuples, function( i, tuple ) {
				var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];

				// Deferred.done(function() { bind to newDefer or newDefer.resolve })
				// deferred.fail(function() { bind to newDefer or newDefer.reject })
				// deferred.progress(function() { bind to newDefer or newDefer.notify })
				deferred[ tuple[ 1 ] ]( function() {
					var returned = fn && fn.apply( this, arguments );
					if ( returned && jQuery.isFunction( returned.promise ) ) {
						returned.promise()
							.done( newDefer.resolve )
							.fail( newDefer.reject )
							.progress( newDefer.notify );
					} else {
						newDefer[ tuple[ 0 ] + "With" ](
							this === promise ? newDefer.promise() : this,
							fn ? [ returned ] : arguments
						);
					}
				} );
			} );
			fns = null;
		} ).promise();

	};

	if ( func ) {
		func.call( deferred, deferred );
	}

	return deferred;
};



})( jQuery, window );

!function(root, factory) {
    "function" == typeof define && define.amd ? // AMD. Register as an anonymous module unless amdModuleId is set
    define([], function() {
        return root.svg4everybody = factory();
    }) : "object" == typeof module && module.exports ? // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory() : root.svg4everybody = factory();
}(this, function() {
    /*! svg4everybody v2.1.8 | github.com/jonathantneal/svg4everybody */
    function embed(parent, svg, target) {
        // if the target exists
        if (target) {
            // create a document fragment to hold the contents of the target
            var fragment = document.createDocumentFragment(), viewBox = !svg.hasAttribute("viewBox") && target.getAttribute("viewBox");
            // conditionally set the viewBox on the svg
            viewBox && svg.setAttribute("viewBox", viewBox);
            // copy the contents of the clone into the fragment
            for (// clone the target
            var clone = target.cloneNode(!0); clone.childNodes.length; ) {
                fragment.appendChild(clone.firstChild);
            }
            // append the fragment into the svg
            parent.appendChild(fragment);
        }
    }
    function loadreadystatechange(xhr) {
        // listen to changes in the request
        xhr.onreadystatechange = function() {
            // if the request is ready
            if (4 === xhr.readyState) {
                // get the cached html document
                var cachedDocument = xhr._cachedDocument;
                // ensure the cached html document based on the xhr response
                cachedDocument || (cachedDocument = xhr._cachedDocument = document.implementation.createHTMLDocument(""), 
                cachedDocument.body.innerHTML = xhr.responseText, xhr._cachedTarget = {}), // clear the xhr embeds list and embed each item
                xhr._embeds.splice(0).map(function(item) {
                    // get the cached target
                    var target = xhr._cachedTarget[item.id];
                    // ensure the cached target
                    target || (target = xhr._cachedTarget[item.id] = cachedDocument.getElementById(item.id)), 
                    // embed the target into the svg
                    embed(item.parent, item.svg, target);
                });
            }
        }, // test the ready state change immediately
        xhr.onreadystatechange();
    }
    function svg4everybody(rawopts) {
        function oninterval() {
            // while the index exists in the live <use> collection
            for (// get the cached <use> index
            var index = 0; index < uses.length; ) {
                // get the current <use>
                var use = uses[index], parent = use.parentNode, svg = getSVGAncestor(parent);
                if (svg) {
                    var src = use.getAttribute("xlink:href") || use.getAttribute("href");
                    !src && opts.attributeName && (src = use.getAttribute(opts.attributeName));
                    if (polyfill) {
                        if (!opts.validate || opts.validate(src, svg, use)) {
                            // remove the <use> element
                            parent.removeChild(use);
                            // parse the src and get the url and id
                            var srcSplit = src.split("#"), url = srcSplit.shift(), id = srcSplit.join("#");
                            // if the link is external
                            if (url.length) {
                                // get the cached xhr request
                                var xhr = requests[url];
                                // ensure the xhr request exists
                                xhr || (xhr = requests[url] = new XMLHttpRequest(), xhr.open("GET", url), xhr.send(), 
                                xhr._embeds = []), // add the svg and id as an item to the xhr embeds list
                                xhr._embeds.push({
                                    parent: parent,
                                    svg: svg,
                                    id: id
                                }), // prepare the xhr ready state change event
                                loadreadystatechange(xhr);
                            } else {
                                // embed the local id into the svg
                                embed(parent, svg, document.getElementById(id));
                            }
                        } else {
                            // increase the index when the previous value was not "valid"
                            ++index, ++numberOfSvgUseElementsToBypass;
                        }
                    }
                } else {
                    // increase the index when the previous value was not "valid"
                    ++index;
                }
            }
            // continue the interval
            (!uses.length || uses.length - numberOfSvgUseElementsToBypass > 0) && requestAnimationFrame(oninterval, 67);
        }
        var polyfill, opts = Object(rawopts), newerIEUA = /\bTrident\/[567]\b|\bMSIE (?:9|10)\.0\b/, webkitUA = /\bAppleWebKit\/(\d+)\b/, olderEdgeUA = /\bEdge\/12\.(\d+)\b/, edgeUA = /\bEdge\/.(\d+)\b/, inIframe = window.top !== window.self;
        polyfill = "polyfill" in opts ? opts.polyfill : newerIEUA.test(navigator.userAgent) || (navigator.userAgent.match(olderEdgeUA) || [])[1] < 10547 || (navigator.userAgent.match(webkitUA) || [])[1] < 537 || edgeUA.test(navigator.userAgent) && inIframe;
        // create xhr requests object
        var requests = {}, requestAnimationFrame = window.requestAnimationFrame || setTimeout, uses = document.getElementsByTagName("use"), numberOfSvgUseElementsToBypass = 0;
        // conditionally start the interval if the polyfill is active
        polyfill && oninterval();
    }
    function getSVGAncestor(node) {
        for (var svg = node; "svg" !== svg.nodeName.toLowerCase() && (svg = svg.parentNode); ) {}
        return svg;
    }
    return svg4everybody;
});
/*
     _ _      _       _
 ___| (_) ___| | __  (_)___
/ __| | |/ __| |/ /  | / __|
\__ \ | | (__|   < _ | \__ \
|___/_|_|\___|_|\_(_)/ |___/
                   |__/

 Version: 1.6.0
  Author: Ken Wheeler
 Website: http://kenwheeler.github.io
    Docs: http://kenwheeler.github.io/slick
    Repo: http://github.com/kenwheeler/slick
  Issues: http://github.com/kenwheeler/slick/issues

 */
/* global window, document, define, jQuery, setInterval, clearInterval */
(function(factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }

}(function($) {
    'use strict';
    var Slick = window.Slick || {};

    Slick = (function() {

        var instanceUid = 0;

        function Slick(element, settings) {

            var _ = this, dataSettings;

            _.defaults = {
                accessibility: true,
                adaptiveHeight: false,
                appendArrows: $(element),
                appendDots: $(element),
                arrows: true,
                asNavFor: null,
                prevArrow: '<button type="button" data-role="none" class="slick-prev" aria-label="Previous" tabindex="0" role="button">Previous</button>',
                nextArrow: '<button type="button" data-role="none" class="slick-next" aria-label="Next" tabindex="0" role="button">Next</button>',
                autoplay: false,
                autoplaySpeed: 3000,
                centerMode: false,
                centerPadding: '50px',
                cssEase: 'ease',
                customPaging: function(slider, i) {
                    return $('<button type="button" data-role="none" role="button" tabindex="0" />').text(i + 1);
                },
                dots: false,
                dotsClass: 'slick-dots',
                draggable: true,
                easing: 'linear',
                edgeFriction: 0.35,
                fade: false,
                focusOnSelect: false,
                infinite: true,
                initialSlide: 0,
                lazyLoad: 'ondemand',
                mobileFirst: false,
                pauseOnHover: true,
                pauseOnFocus: true,
                pauseOnDotsHover: false,
                respondTo: 'window',
                responsive: null,
                rows: 1,
                rtl: false,
                slide: '',
                slidesPerRow: 1,
                slidesToShow: 1,
                slidesToScroll: 1,
                speed: 500,
                swipe: true,
                swipeToSlide: false,
                touchMove: true,
                touchThreshold: 5,
                useCSS: true,
                useTransform: true,
                variableWidth: false,
                vertical: false,
                verticalSwiping: false,
                waitForAnimate: true,
                zIndex: 1000
            };

            _.initials = {
                animating: false,
                dragging: false,
                autoPlayTimer: null,
                currentDirection: 0,
                currentLeft: null,
                currentSlide: 0,
                direction: 1,
                $dots: null,
                listWidth: null,
                listHeight: null,
                loadIndex: 0,
                $nextArrow: null,
                $prevArrow: null,
                slideCount: null,
                slideWidth: null,
                $slideTrack: null,
                $slides: null,
                sliding: false,
                slideOffset: 0,
                swipeLeft: null,
                $list: null,
                touchObject: {},
                transformsEnabled: false,
                unslicked: false
            };

            $.extend(_, _.initials);

            _.activeBreakpoint = null;
            _.animType = null;
            _.animProp = null;
            _.breakpoints = [];
            _.breakpointSettings = [];
            _.cssTransitions = false;
            _.focussed = false;
            _.interrupted = false;
            _.hidden = 'hidden';
            _.paused = true;
            _.positionProp = null;
            _.respondTo = null;
            _.rowCount = 1;
            _.shouldClick = true;
            _.$slider = $(element);
            _.$slidesCache = null;
            _.transformType = null;
            _.transitionType = null;
            _.visibilityChange = 'visibilitychange';
            _.windowWidth = 0;
            _.windowTimer = null;

            dataSettings = $(element).data('slick') || {};

            _.options = $.extend({}, _.defaults, settings, dataSettings);

            _.currentSlide = _.options.initialSlide;

            _.originalSettings = _.options;

            if (typeof document.mozHidden !== 'undefined') {
                _.hidden = 'mozHidden';
                _.visibilityChange = 'mozvisibilitychange';
            } else if (typeof document.webkitHidden !== 'undefined') {
                _.hidden = 'webkitHidden';
                _.visibilityChange = 'webkitvisibilitychange';
            }

            _.autoPlay = $.proxy(_.autoPlay, _);
            _.autoPlayClear = $.proxy(_.autoPlayClear, _);
            _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);
            _.changeSlide = $.proxy(_.changeSlide, _);
            _.clickHandler = $.proxy(_.clickHandler, _);
            _.selectHandler = $.proxy(_.selectHandler, _);
            _.setPosition = $.proxy(_.setPosition, _);
            _.swipeHandler = $.proxy(_.swipeHandler, _);
            _.dragHandler = $.proxy(_.dragHandler, _);
            _.keyHandler = $.proxy(_.keyHandler, _);

            _.instanceUid = instanceUid++;

            // A simple way to check for HTML strings
            // Strict HTML recognition (must start with <)
            // Extracted from jQuery v1.11 source
            _.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;


            _.registerBreakpoints();
            _.init(true);

        }

        return Slick;

    }());

    Slick.prototype.activateADA = function() {
        var _ = this;

        _.$slideTrack.find('.slick-active').attr({
            'aria-hidden': 'false'
        }).find('a, input, button, select').attr({
            'tabindex': '0'
        });

    };

    Slick.prototype.addSlide = Slick.prototype.slickAdd = function(markup, index, addBefore) {

        var _ = this;

        if (typeof(index) === 'boolean') {
            addBefore = index;
            index = null;
        } else if (index < 0 || (index >= _.slideCount)) {
            return false;
        }

        _.unload();

        if (typeof(index) === 'number') {
            if (index === 0 && _.$slides.length === 0) {
                $(markup).appendTo(_.$slideTrack);
            } else if (addBefore) {
                $(markup).insertBefore(_.$slides.eq(index));
            } else {
                $(markup).insertAfter(_.$slides.eq(index));
            }
        } else {
            if (addBefore === true) {
                $(markup).prependTo(_.$slideTrack);
            } else {
                $(markup).appendTo(_.$slideTrack);
            }
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slides.each(function(index, element) {
            $(element).attr('data-slick-index', index);
        });

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.animateHeight = function() {
        var _ = this;
        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.animate({
                height: targetHeight
            }, _.options.speed);
        }
    };

    Slick.prototype.animateSlide = function(targetLeft, callback) {

        var animProps = {},
            _ = this;

        _.animateHeight();

        if (_.options.rtl === true && _.options.vertical === false) {
            targetLeft = -targetLeft;
        }
        if (_.transformsEnabled === false) {
            if (_.options.vertical === false) {
                _.$slideTrack.animate({
                    left: targetLeft
                }, _.options.speed, _.options.easing, callback);
            } else {
                _.$slideTrack.animate({
                    top: targetLeft
                }, _.options.speed, _.options.easing, callback);
            }

        } else {

            if (_.cssTransitions === false) {
                if (_.options.rtl === true) {
                    _.currentLeft = -(_.currentLeft);
                }
                $({
                    animStart: _.currentLeft
                }).animate({
                    animStart: targetLeft
                }, {
                    duration: _.options.speed,
                    easing: _.options.easing,
                    step: function(now) {
                        now = Math.ceil(now);
                        if (_.options.vertical === false) {
                            animProps[_.animType] = 'translate(' +
                                now + 'px, 0px)';
                            _.$slideTrack.css(animProps);
                        } else {
                            animProps[_.animType] = 'translate(0px,' +
                                now + 'px)';
                            _.$slideTrack.css(animProps);
                        }
                    },
                    complete: function() {
                        if (callback) {
                            callback.call();
                        }
                    }
                });

            } else {

                _.applyTransition();
                targetLeft = Math.ceil(targetLeft);

                if (_.options.vertical === false) {
                    animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
                } else {
                    animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
                }
                _.$slideTrack.css(animProps);

                if (callback) {
                    setTimeout(function() {

                        _.disableTransition();

                        callback.call();
                    }, _.options.speed);
                }

            }

        }

    };

    Slick.prototype.getNavTarget = function() {

        var _ = this,
            asNavFor = _.options.asNavFor;

        if ( asNavFor && asNavFor !== null ) {
            asNavFor = $(asNavFor).not(_.$slider);
        }

        return asNavFor;

    };

    Slick.prototype.asNavFor = function(index) {

        var _ = this,
            asNavFor = _.getNavTarget();

        if ( asNavFor !== null && typeof asNavFor === 'object' ) {
            asNavFor.each(function() {
                var target = $(this).slick('getSlick');
                if(!target.unslicked) {
                    target.slideHandler(index, true);
                }
            });
        }

    };

    Slick.prototype.applyTransition = function(slide) {

        var _ = this,
            transition = {};

        if (_.options.fade === false) {
            transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
        } else {
            transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
        }

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.autoPlay = function() {

        var _ = this;

        _.autoPlayClear();

        if ( _.slideCount > _.options.slidesToShow ) {
            _.autoPlayTimer = setInterval( _.autoPlayIterator, _.options.autoplaySpeed );
        }

    };

    Slick.prototype.autoPlayClear = function() {

        var _ = this;

        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }

    };

    Slick.prototype.autoPlayIterator = function() {

        var _ = this,
            slideTo = _.currentSlide + _.options.slidesToScroll;

        if ( !_.paused && !_.interrupted && !_.focussed ) {

            if ( _.options.infinite === false ) {

                if ( _.direction === 1 && ( _.currentSlide + 1 ) === ( _.slideCount - 1 )) {
                    _.direction = 0;
                }

                else if ( _.direction === 0 ) {

                    slideTo = _.currentSlide - _.options.slidesToScroll;

                    if ( _.currentSlide - 1 === 0 ) {
                        _.direction = 1;
                    }

                }

            }

            _.slideHandler( slideTo );

        }

    };

    Slick.prototype.buildArrows = function() {

        var _ = this;

        if (_.options.arrows === true ) {

            _.$prevArrow = $(_.options.prevArrow).addClass('slick-arrow');
            _.$nextArrow = $(_.options.nextArrow).addClass('slick-arrow');

            if( _.slideCount > _.options.slidesToShow ) {

                _.$prevArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');
                _.$nextArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');

                if (_.htmlExpr.test(_.options.prevArrow)) {
                    _.$prevArrow.prependTo(_.options.appendArrows);
                }

                if (_.htmlExpr.test(_.options.nextArrow)) {
                    _.$nextArrow.appendTo(_.options.appendArrows);
                }

                if (_.options.infinite !== true) {
                    _.$prevArrow
                        .addClass('slick-disabled')
                        .attr('aria-disabled', 'true');
                }

            } else {

                _.$prevArrow.add( _.$nextArrow )

                    .addClass('slick-hidden')
                    .attr({
                        'aria-disabled': 'true',
                        'tabindex': '-1'
                    });

            }

        }

    };

    Slick.prototype.buildDots = function() {

        var _ = this,
            i, dot;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$slider.addClass('slick-dotted');

            dot = $('<ul />').addClass(_.options.dotsClass);

            for (i = 0; i <= _.getDotCount(); i += 1) {
                dot.append($('<li />').append(_.options.customPaging.call(this, _, i)));
            }

            _.$dots = dot.appendTo(_.options.appendDots);

            _.$dots.find('li').first().addClass('slick-active').attr('aria-hidden', 'false');

        }

    };

    Slick.prototype.buildOut = function() {

        var _ = this;

        _.$slides =
            _.$slider
                .children( _.options.slide + ':not(.slick-cloned)')
                .addClass('slick-slide');

        _.slideCount = _.$slides.length;

        _.$slides.each(function(index, element) {
            $(element)
                .attr('data-slick-index', index)
                .data('originalStyling', $(element).attr('style') || '');
        });

        _.$slider.addClass('slick-slider');

        _.$slideTrack = (_.slideCount === 0) ?
            $('<div class="slick-track"/>').appendTo(_.$slider) :
            _.$slides.wrapAll('<div class="slick-track"/>').parent();

        _.$list = _.$slideTrack.wrap(
            '<div aria-live="polite" class="slick-list"/>').parent();
        _.$slideTrack.css('opacity', 0);

        if (_.options.centerMode === true || _.options.swipeToSlide === true) {
            _.options.slidesToScroll = 1;
        }

        $('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');

        _.setupInfinite();

        _.buildArrows();

        _.buildDots();

        _.updateDots();


        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        if (_.options.draggable === true) {
            _.$list.addClass('draggable');
        }

    };

    Slick.prototype.buildRows = function() {

        var _ = this, a, b, c, newSlides, numOfSlides, originalSlides,slidesPerSection;

        newSlides = document.createDocumentFragment();
        originalSlides = _.$slider.children();

        if(_.options.rows >= 1) {

            slidesPerSection = _.options.slidesPerRow * _.options.rows;
            numOfSlides = Math.ceil(
                originalSlides.length / slidesPerSection
            );

            for(a = 0; a < numOfSlides; a++){
                var slide = document.createElement('div');
                for(b = 0; b < _.options.rows; b++) {
                    var row = document.createElement('div');
                    for(c = 0; c < _.options.slidesPerRow; c++) {
                        var target = (a * slidesPerSection + ((b * _.options.slidesPerRow) + c));
                        if (originalSlides.get(target)) {
                            row.appendChild(originalSlides.get(target));
                        }
                    }
                    slide.appendChild(row);
                }
                newSlides.appendChild(slide);
            }

            _.$slider.empty().append(newSlides);
            _.$slider.children().children().children()
                .css({
                    'width':(100 / _.options.slidesPerRow) + '%',
                    'display': 'inline-block'
                });

        }

    };

    Slick.prototype.checkResponsive = function(initial, forceUpdate) {

        var _ = this,
            breakpoint, targetBreakpoint, respondToWidth, triggerBreakpoint = false;
        var sliderWidth = _.$slider.width();
        var windowWidth = window.innerWidth || $(window).width();

        if (_.respondTo === 'window') {
            respondToWidth = windowWidth;
        } else if (_.respondTo === 'slider') {
            respondToWidth = sliderWidth;
        } else if (_.respondTo === 'min') {
            respondToWidth = Math.min(windowWidth, sliderWidth);
        }

        if ( _.options.responsive &&
            _.options.responsive.length &&
            _.options.responsive !== null) {

            targetBreakpoint = null;

            for (breakpoint in _.breakpoints) {
                if (_.breakpoints.hasOwnProperty(breakpoint)) {
                    if (_.originalSettings.mobileFirst === false) {
                        if (respondToWidth < _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    } else {
                        if (respondToWidth > _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    }
                }
            }

            if (targetBreakpoint !== null) {
                if (_.activeBreakpoint !== null) {
                    if (targetBreakpoint !== _.activeBreakpoint || forceUpdate) {
                        _.activeBreakpoint =
                            targetBreakpoint;
                        if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                            _.unslick(targetBreakpoint);
                        } else {
                            _.options = $.extend({}, _.originalSettings,
                                _.breakpointSettings[
                                    targetBreakpoint]);
                            if (initial === true) {
                                _.currentSlide = _.options.initialSlide;
                            }
                            _.refresh(initial);
                        }
                        triggerBreakpoint = targetBreakpoint;
                    }
                } else {
                    _.activeBreakpoint = targetBreakpoint;
                    if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                        _.unslick(targetBreakpoint);
                    } else {
                        _.options = $.extend({}, _.originalSettings,
                            _.breakpointSettings[
                                targetBreakpoint]);
                        if (initial === true) {
                            _.currentSlide = _.options.initialSlide;
                        }
                        _.refresh(initial);
                    }
                    triggerBreakpoint = targetBreakpoint;
                }
            } else {
                if (_.activeBreakpoint !== null) {
                    _.activeBreakpoint = null;
                    _.options = _.originalSettings;
                    if (initial === true) {
                        _.currentSlide = _.options.initialSlide;
                    }
                    _.refresh(initial);
                    triggerBreakpoint = targetBreakpoint;
                }
            }

            // only trigger breakpoints during an actual break. not on initialize.
            if( !initial && triggerBreakpoint !== false ) {
                _.$slider.trigger('breakpoint', [_, triggerBreakpoint]);
            }
        }

    };

    Slick.prototype.changeSlide = function(event, dontAnimate) {

        var _ = this,
            $target = $(event.currentTarget),
            indexOffset, slideOffset, unevenOffset;

        // If target is a link, prevent default action.
        if($target.is('a')) {
            event.preventDefault();
        }

        // If target is not the <li> element (ie: a child), find the <li>.
        if(!$target.is('li')) {
            $target = $target.closest('li');
        }

        unevenOffset = (_.slideCount % _.options.slidesToScroll !== 0);
        indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;

        switch (event.data.message) {

            case 'previous':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);
                }
                break;

            case 'next':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);
                }
                break;

            case 'index':
                var index = event.data.index === 0 ? 0 :
                    event.data.index || $target.index() * _.options.slidesToScroll;

                _.slideHandler(_.checkNavigable(index), false, dontAnimate);
                $target.children().trigger('focus');
                break;

            default:
                return;
        }

    };

    Slick.prototype.checkNavigable = function(index) {

        var _ = this,
            navigables, prevNavigable;

        navigables = _.getNavigableIndexes();
        prevNavigable = 0;
        if (index > navigables[navigables.length - 1]) {
            index = navigables[navigables.length - 1];
        } else {
            for (var n in navigables) {
                if (index < navigables[n]) {
                    index = prevNavigable;
                    break;
                }
                prevNavigable = navigables[n];
            }
        }

        return index;
    };

    Slick.prototype.cleanUpEvents = function() {

        var _ = this;

        if (_.options.dots && _.$dots !== null) {

            $('li', _.$dots)
                .off('click.slick', _.changeSlide)
                .off('mouseenter.slick', $.proxy(_.interrupt, _, true))
                .off('mouseleave.slick', $.proxy(_.interrupt, _, false));

        }

        _.$slider.off('focus.slick blur.slick');

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow && _.$prevArrow.off('click.slick', _.changeSlide);
            _.$nextArrow && _.$nextArrow.off('click.slick', _.changeSlide);
        }

        _.$list.off('touchstart.slick mousedown.slick', _.swipeHandler);
        _.$list.off('touchmove.slick mousemove.slick', _.swipeHandler);
        _.$list.off('touchend.slick mouseup.slick', _.swipeHandler);
        _.$list.off('touchcancel.slick mouseleave.slick', _.swipeHandler);

        _.$list.off('click.slick', _.clickHandler);

        $(document).off(_.visibilityChange, _.visibility);

        _.cleanUpSlideEvents();

        if (_.options.accessibility === true) {
            _.$list.off('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().off('click.slick', _.selectHandler);
        }

        $(window).off('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange);

        $(window).off('resize.slick.slick-' + _.instanceUid, _.resize);

        $('[draggable!=true]', _.$slideTrack).off('dragstart', _.preventDefault);

        $(window).off('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(document).off('ready.slick.slick-' + _.instanceUid, _.setPosition);

    };

    Slick.prototype.cleanUpSlideEvents = function() {

        var _ = this;

        _.$list.off('mouseenter.slick', $.proxy(_.interrupt, _, true));
        _.$list.off('mouseleave.slick', $.proxy(_.interrupt, _, false));

    };

    Slick.prototype.cleanUpRows = function() {

        var _ = this, originalSlides;

        if(_.options.rows >= 1) {
            originalSlides = _.$slides.children().children();
            originalSlides.removeAttr('style');
            _.$slider.empty().append(originalSlides);
        }

    };

    Slick.prototype.clickHandler = function(event) {

        var _ = this;

        if (_.shouldClick === false) {
            event.stopImmediatePropagation();
            event.stopPropagation();
            event.preventDefault();
        }

    };

    Slick.prototype.destroy = function(refresh) {

        var _ = this;

        _.autoPlayClear();

        _.touchObject = {};

        _.cleanUpEvents();

        $('.slick-cloned', _.$slider).detach();

        if (_.$dots) {
            _.$dots.remove();
        }


        if ( _.$prevArrow && _.$prevArrow.length ) {

            _.$prevArrow
                .removeClass('slick-disabled slick-arrow slick-hidden')
                .removeAttr('aria-hidden aria-disabled tabindex')
                .css('display','');

            if ( _.htmlExpr.test( _.options.prevArrow )) {
                _.$prevArrow.remove();
            }
        }

        if ( _.$nextArrow && _.$nextArrow.length ) {

            _.$nextArrow
                .removeClass('slick-disabled slick-arrow slick-hidden')
                .removeAttr('aria-hidden aria-disabled tabindex')
                .css('display','');

            if ( _.htmlExpr.test( _.options.nextArrow )) {
                _.$nextArrow.remove();
            }

        }


        if (_.$slides) {

            _.$slides
                .removeClass('slick-slide slick-active slick-center slick-visible slick-current')
                .removeAttr('aria-hidden')
                .removeAttr('data-slick-index')
                .each(function(){
                    $(this).attr('style', $(this).data('originalStyling'));
                });

            _.$slideTrack.children(this.options.slide).detach();

            _.$slideTrack.detach();

            _.$list.detach();

            _.$slider.append(_.$slides);
        }

        _.cleanUpRows();

        _.$slider.removeClass('slick-slider');
        _.$slider.removeClass('slick-initialized');
        _.$slider.removeClass('slick-dotted');

        _.unslicked = true;

        if(!refresh) {
            _.$slider.trigger('destroy', [_]);
        }

    };

    Slick.prototype.disableTransition = function(slide) {

        var _ = this,
            transition = {};

        transition[_.transitionType] = '';

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.fadeSlide = function(slideIndex, callback) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).css({
                zIndex: _.options.zIndex
            });

            _.$slides.eq(slideIndex).animate({
                opacity: 1
            }, _.options.speed, _.options.easing, callback);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 1,
                zIndex: _.options.zIndex
            });

            if (callback) {
                setTimeout(function() {

                    _.disableTransition(slideIndex);

                    callback.call();
                }, _.options.speed);
            }

        }

    };

    Slick.prototype.fadeSlideOut = function(slideIndex) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).animate({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            }, _.options.speed, _.options.easing);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            });

        }

    };

    Slick.prototype.filterSlides = Slick.prototype.slickFilter = function(filter) {

        var _ = this;

        if (filter !== null) {

            _.$slidesCache = _.$slides;

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.filter(filter).appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.focusHandler = function() {

        var _ = this;

        _.$slider
            .off('focus.slick blur.slick')
            .on('focus.slick blur.slick',
                '*:not(.slick-arrow)', function(event) {

            event.stopImmediatePropagation();
            var $sf = $(this);

            setTimeout(function() {

                if( _.options.pauseOnFocus ) {
                    _.focussed = $sf.is(':focus');
                    _.autoPlay();
                }

            }, 0);

        });
    };

    Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function() {

        var _ = this;
        return _.currentSlide;

    };

    Slick.prototype.getDotCount = function() {

        var _ = this;

        var breakPoint = 0;
        var counter = 0;
        var pagerQty = 0;

        if (_.options.infinite === true) {
            while (breakPoint < _.slideCount) {
                ++pagerQty;
                breakPoint = counter + _.options.slidesToScroll;
                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
            }
        } else if (_.options.centerMode === true) {
            pagerQty = _.slideCount;
        } else if(!_.options.asNavFor) {
            pagerQty = 1 + Math.ceil((_.slideCount - _.options.slidesToShow) / _.options.slidesToScroll);
        }else {
            while (breakPoint < _.slideCount) {
                ++pagerQty;
                breakPoint = counter + _.options.slidesToScroll;
                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
            }
        }

        return pagerQty - 1;

    };

    Slick.prototype.getLeft = function(slideIndex) {

        var _ = this,
            targetLeft,
            verticalHeight,
            verticalOffset = 0,
            targetSlide;

        _.slideOffset = 0;
        verticalHeight = _.$slides.first().outerHeight(true);

        if (_.options.infinite === true) {
            if (_.slideCount > _.options.slidesToShow) {
                _.slideOffset = (_.slideWidth * _.options.slidesToShow) * -1;
                verticalOffset = (verticalHeight * _.options.slidesToShow) * -1;
            }
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    if (slideIndex > _.slideCount) {
                        _.slideOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth) * -1;
                        verticalOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight) * -1;
                    } else {
                        _.slideOffset = ((_.slideCount % _.options.slidesToScroll) * _.slideWidth) * -1;
                        verticalOffset = ((_.slideCount % _.options.slidesToScroll) * verticalHeight) * -1;
                    }
                }
            }
        } else {
            if (slideIndex + _.options.slidesToShow > _.slideCount) {
                _.slideOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * _.slideWidth;
                verticalOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * verticalHeight;
            }
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.slideOffset = 0;
            verticalOffset = 0;
        }

        if (_.options.centerMode === true && _.options.infinite === true) {
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
        } else if (_.options.centerMode === true) {
            _.slideOffset = 0;
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
        }

        if (_.options.vertical === false) {
            targetLeft = ((slideIndex * _.slideWidth) * -1) + _.slideOffset;
        } else {
            targetLeft = ((slideIndex * verticalHeight) * -1) + verticalOffset;
        }

        if (_.options.variableWidth === true) {

            if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
            } else {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow);
            }

            if (_.options.rtl === true) {
                if (targetSlide[0]) {
                    targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                } else {
                    targetLeft =  0;
                }
            } else {
                targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
            }

            if (_.options.centerMode === true) {
                if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
                } else {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow + 1);
                }

                if (_.options.rtl === true) {
                    if (targetSlide[0]) {
                        targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                    } else {
                        targetLeft =  0;
                    }
                } else {
                    targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
                }

                targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;
            }
        }

        return targetLeft;

    };

    Slick.prototype.getOption = Slick.prototype.slickGetOption = function(option) {

        var _ = this;

        return _.options[option];

    };

    Slick.prototype.getNavigableIndexes = function() {

        var _ = this,
            breakPoint = 0,
            counter = 0,
            indexes = [],
            max;

        if (_.options.infinite === false) {
            max = _.slideCount;
        } else {
            breakPoint = _.options.slidesToScroll * -1;
            counter = _.options.slidesToScroll * -1;
            max = _.slideCount * 2;
        }

        while (breakPoint < max) {
            indexes.push(breakPoint);
            breakPoint = counter + _.options.slidesToScroll;
            counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
        }

        return indexes;

    };

    Slick.prototype.getSlick = function() {

        return this;

    };

    Slick.prototype.getSlideCount = function() {

        var _ = this,
            slidesTraversed, swipedSlide, centerOffset;

        centerOffset = _.options.centerMode === true ? _.slideWidth * Math.floor(_.options.slidesToShow / 2) : 0;

        if (_.options.swipeToSlide === true) {
            _.$slideTrack.find('.slick-slide').each(function(index, slide) {
                if (slide.offsetLeft - centerOffset + ($(slide).outerWidth() / 2) > (_.swipeLeft * -1)) {
                    swipedSlide = slide;
                    return false;
                }
            });

            slidesTraversed = Math.abs($(swipedSlide).attr('data-slick-index') - _.currentSlide) || 1;

            return slidesTraversed;

        } else {
            return _.options.slidesToScroll;
        }

    };

    Slick.prototype.goTo = Slick.prototype.slickGoTo = function(slide, dontAnimate) {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'index',
                index: parseInt(slide)
            }
        }, dontAnimate);

    };

    Slick.prototype.init = function(creation) {

        var _ = this;

        if (!$(_.$slider).hasClass('slick-initialized')) {

            $(_.$slider).addClass('slick-initialized');

            _.buildRows();
            _.buildOut();
            _.setProps();
            _.startLoad();
            _.loadSlider();
            _.initializeEvents();
            _.updateArrows();
            _.updateDots();
            _.checkResponsive(true);
            _.focusHandler();

        }

        if (creation) {
            _.$slider.trigger('init', [_]);
        }

        if (_.options.accessibility === true) {
            _.initADA();
        }

        if ( _.options.autoplay ) {

            _.paused = false;
            _.autoPlay();

        }

    };

    Slick.prototype.initADA = function() {
        var _ = this;
        _.$slides.add(_.$slideTrack.find('.slick-cloned')).attr({
            'aria-hidden': 'true',
            'tabindex': '-1'
        }).find('a, input, button, select').attr({
            'tabindex': '-1'
        });

        _.$slideTrack.attr('role', 'listbox');

        _.$slides.not(_.$slideTrack.find('.slick-cloned')).each(function(i) {
            $(this).attr({
                'role': 'option',
                'aria-describedby': 'slick-slide' + _.instanceUid + i + ''
            });
        });

        if (_.$dots !== null) {
            _.$dots.attr('role', 'tablist').find('li').each(function(i) {
                $(this).attr({
                    'role': 'presentation',
                    'aria-selected': 'false',
                    'aria-controls': 'navigation' + _.instanceUid + i + '',
                    'id': 'slick-slide' + _.instanceUid + i + ''
                });
            })
                .first().attr('aria-selected', 'true').end()
                .find('button').attr('role', 'button').end()
                .closest('div').attr('role', 'toolbar');
        }
        _.activateADA();

    };

    Slick.prototype.initArrowEvents = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow
               .off('click.slick')
               .on('click.slick', {
                    message: 'previous'
               }, _.changeSlide);
            _.$nextArrow
               .off('click.slick')
               .on('click.slick', {
                    message: 'next'
               }, _.changeSlide);
        }

    };

    Slick.prototype.initDotEvents = function() {

        var _ = this;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            $('li', _.$dots).on('click.slick', {
                message: 'index'
            }, _.changeSlide);
        }

        if ( _.options.dots === true && _.options.pauseOnDotsHover === true ) {

            $('li', _.$dots)
                .on('mouseenter.slick', $.proxy(_.interrupt, _, true))
                .on('mouseleave.slick', $.proxy(_.interrupt, _, false));

        }

    };

    Slick.prototype.initSlideEvents = function() {

        var _ = this;

        if ( _.options.pauseOnHover ) {

            _.$list.on('mouseenter.slick', $.proxy(_.interrupt, _, true));
            _.$list.on('mouseleave.slick', $.proxy(_.interrupt, _, false));

        }

    };

    Slick.prototype.initializeEvents = function() {

        var _ = this;

        _.initArrowEvents();

        _.initDotEvents();
        _.initSlideEvents();

        _.$list.on('touchstart.slick mousedown.slick', {
            action: 'start'
        }, _.swipeHandler);
        _.$list.on('touchmove.slick mousemove.slick', {
            action: 'move'
        }, _.swipeHandler);
        _.$list.on('touchend.slick mouseup.slick', {
            action: 'end'
        }, _.swipeHandler);
        _.$list.on('touchcancel.slick mouseleave.slick', {
            action: 'end'
        }, _.swipeHandler);

        _.$list.on('click.slick', _.clickHandler);

        $(document).on(_.visibilityChange, $.proxy(_.visibility, _));

        if (_.options.accessibility === true) {
            _.$list.on('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        $(window).on('orientationchange.slick.slick-' + _.instanceUid, $.proxy(_.orientationChange, _));

        $(window).on('resize.slick.slick-' + _.instanceUid, $.proxy(_.resize, _));

        $('[draggable!=true]', _.$slideTrack).on('dragstart', _.preventDefault);

        $(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(document).on('ready.slick.slick-' + _.instanceUid, _.setPosition);

    };

    Slick.prototype.initUI = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.show();
            _.$nextArrow.show();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.show();

        }

    };

    Slick.prototype.keyHandler = function(event) {

        var _ = this;
         //Dont slide if the cursor is inside the form fields and arrow keys are pressed
        if(!event.target.tagName.match('TEXTAREA|INPUT|SELECT')) {
            if (event.keyCode === 37 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? 'next' :  'previous'
                    }
                });
            } else if (event.keyCode === 39 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? 'previous' : 'next'
                    }
                });
            }
        }

    };

    Slick.prototype.lazyLoad = function() {

        var _ = this,
            loadRange, cloneRange, rangeStart, rangeEnd;

        function loadImages(imagesScope) {

            $('img[data-lazy]', imagesScope).each(function() {

                var image = $(this),
                    imageSource = $(this).attr('data-lazy'),
                    imageToLoad = document.createElement('img');

                imageToLoad.onload = function() {

                    image
                        .animate({ opacity: 0 }, 100, function() {
                            image
                                .attr('src', imageSource)
                                .animate({ opacity: 1 }, 200, function() {
                                    image
                                        .removeAttr('data-lazy')
                                        .removeClass('slick-loading');
                                });
                            _.$slider.trigger('lazyLoaded', [_, image, imageSource]);
                        });

                };

                imageToLoad.onerror = function() {

                    image
                        .removeAttr( 'data-lazy' )
                        .removeClass( 'slick-loading' )
                        .addClass( 'slick-lazyload-error' );

                    _.$slider.trigger('lazyLoadError', [ _, image, imageSource ]);

                };

                imageToLoad.src = imageSource;

            });

        }

        if (_.options.centerMode === true) {
            if (_.options.infinite === true) {
                rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);
                rangeEnd = rangeStart + _.options.slidesToShow + 2;
            } else {
                rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1));
                rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;
            }
        } else {
            rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
            rangeEnd = Math.ceil(rangeStart + _.options.slidesToShow);
            if (_.options.fade === true) {
                if (rangeStart > 0) rangeStart--;
                if (rangeEnd <= _.slideCount) rangeEnd++;
            }
        }

        loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);
        loadImages(loadRange);

        if (_.slideCount <= _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-slide');
            loadImages(cloneRange);
        } else
        if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
            loadImages(cloneRange);
        } else if (_.currentSlide === 0) {
            cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
            loadImages(cloneRange);
        }

    };

    Slick.prototype.loadSlider = function() {

        var _ = this;

        _.setPosition();

        _.$slideTrack.css({
            opacity: 1
        });

        _.$slider.removeClass('slick-loading');

        _.initUI();

        if (_.options.lazyLoad === 'progressive') {
            _.progressiveLazyLoad();
        }

    };

    Slick.prototype.next = Slick.prototype.slickNext = function() {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'next'
            }
        });

    };

    Slick.prototype.orientationChange = function() {

        var _ = this;

        _.checkResponsive();
        _.setPosition();

    };

    Slick.prototype.pause = Slick.prototype.slickPause = function() {

        var _ = this;

        _.autoPlayClear();
        _.paused = true;

    };

    Slick.prototype.play = Slick.prototype.slickPlay = function() {

        var _ = this;

        _.autoPlay();
        _.options.autoplay = true;
        _.paused = false;
        _.focussed = false;
        _.interrupted = false;

    };

    Slick.prototype.postSlide = function(index) {

        var _ = this;

        if( !_.unslicked ) {

            _.$slider.trigger('afterChange', [_, index]);

            _.animating = false;

            _.setPosition();

            _.swipeLeft = null;

            if ( _.options.autoplay ) {
                _.autoPlay();
            }

            if (_.options.accessibility === true) {
                _.initADA();
            }

        }

    };

    Slick.prototype.prev = Slick.prototype.slickPrev = function() {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'previous'
            }
        });

    };

    Slick.prototype.preventDefault = function(event) {

        event.preventDefault();

    };

    Slick.prototype.progressiveLazyLoad = function( tryCount ) {

        tryCount = tryCount || 1;

        var _ = this,
            $imgsToLoad = $( 'img[data-lazy]', _.$slider ),
            image,
            imageSource,
            imageToLoad;

        if ( $imgsToLoad.length ) {

            image = $imgsToLoad.first();
            imageSource = image.attr('data-lazy');
            imageToLoad = document.createElement('img');

            imageToLoad.onload = function() {

                image
                    .attr( 'src', imageSource )
                    .removeAttr('data-lazy')
                    .removeClass('slick-loading');

                if ( _.options.adaptiveHeight === true ) {
                    _.setPosition();
                }

                _.$slider.trigger('lazyLoaded', [ _, image, imageSource ]);
                _.progressiveLazyLoad();

            };

            imageToLoad.onerror = function() {

                if ( tryCount < 3 ) {

                    /**
                     * try to load the image 3 times,
                     * leave a slight delay so we don't get
                     * servers blocking the request.
                     */
                    setTimeout( function() {
                        _.progressiveLazyLoad( tryCount + 1 );
                    }, 500 );

                } else {

                    image
                        .removeAttr( 'data-lazy' )
                        .removeClass( 'slick-loading' )
                        .addClass( 'slick-lazyload-error' );

                    _.$slider.trigger('lazyLoadError', [ _, image, imageSource ]);

                    _.progressiveLazyLoad();

                }

            };

            imageToLoad.src = imageSource;

        } else {

            _.$slider.trigger('allImagesLoaded', [ _ ]);

        }

    };

    Slick.prototype.refresh = function( initializing ) {

        var _ = this, currentSlide, lastVisibleIndex;

        lastVisibleIndex = _.slideCount - _.options.slidesToShow;

        // in non-infinite sliders, we don't want to go past the
        // last visible index.
        if( !_.options.infinite && ( _.currentSlide > lastVisibleIndex )) {
            _.currentSlide = lastVisibleIndex;
        }

        // if less slides than to show, go to start.
        if ( _.slideCount <= _.options.slidesToShow ) {
            _.currentSlide = 0;

        }

        currentSlide = _.currentSlide;

        _.destroy(true);

        $.extend(_, _.initials, { currentSlide: currentSlide });

        _.init();

        if( !initializing ) {

            _.changeSlide({
                data: {
                    message: 'index',
                    index: currentSlide
                }
            }, false);

        }

    };

    Slick.prototype.registerBreakpoints = function() {

        var _ = this, breakpoint, currentBreakpoint, l,
            responsiveSettings = _.options.responsive || null;

        if ( $.type(responsiveSettings) === 'array' && responsiveSettings.length ) {

            _.respondTo = _.options.respondTo || 'window';

            for ( breakpoint in responsiveSettings ) {

                l = _.breakpoints.length-1;
                currentBreakpoint = responsiveSettings[breakpoint].breakpoint;

                if (responsiveSettings.hasOwnProperty(breakpoint)) {

                    // loop through the breakpoints and cut out any existing
                    // ones with the same breakpoint number, we don't want dupes.
                    while( l >= 0 ) {
                        if( _.breakpoints[l] && _.breakpoints[l] === currentBreakpoint ) {
                            _.breakpoints.splice(l,1);
                        }
                        l--;
                    }

                    _.breakpoints.push(currentBreakpoint);
                    _.breakpointSettings[currentBreakpoint] = responsiveSettings[breakpoint].settings;

                }

            }

            _.breakpoints.sort(function(a, b) {
                return ( _.options.mobileFirst ) ? a-b : b-a;
            });

        }

    };

    Slick.prototype.reinit = function() {

        var _ = this;

        _.$slides =
            _.$slideTrack
                .children(_.options.slide)
                .addClass('slick-slide');

        _.slideCount = _.$slides.length;

        if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
            _.currentSlide = _.currentSlide - _.options.slidesToScroll;
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.currentSlide = 0;
        }

        _.registerBreakpoints();

        _.setProps();
        _.setupInfinite();
        _.buildArrows();
        _.updateArrows();
        _.initArrowEvents();
        _.buildDots();
        _.updateDots();
        _.initDotEvents();
        _.cleanUpSlideEvents();
        _.initSlideEvents();

        _.checkResponsive(false, true);

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        _.setPosition();
        _.focusHandler();

        _.paused = !_.options.autoplay;
        _.autoPlay();

        _.$slider.trigger('reInit', [_]);

    };

    Slick.prototype.resize = function() {

        var _ = this;

        if ($(window).width() !== _.windowWidth) {
            clearTimeout(_.windowDelay);
            _.windowDelay = window.setTimeout(function() {
                _.windowWidth = $(window).width();
                _.checkResponsive();
                if( !_.unslicked ) { _.setPosition(); }
            }, 50);
        }
    };

    Slick.prototype.removeSlide = Slick.prototype.slickRemove = function(index, removeBefore, removeAll) {

        var _ = this;

        if (typeof(index) === 'boolean') {
            removeBefore = index;
            index = removeBefore === true ? 0 : _.slideCount - 1;
        } else {
            index = removeBefore === true ? --index : index;
        }

        if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
            return false;
        }

        _.unload();

        if (removeAll === true) {
            _.$slideTrack.children().remove();
        } else {
            _.$slideTrack.children(this.options.slide).eq(index).remove();
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.setCSS = function(position) {

        var _ = this,
            positionProps = {},
            x, y;

        if (_.options.rtl === true) {
            position = -position;
        }
        x = _.positionProp == 'left' ? Math.ceil(position) + 'px' : '0px';
        y = _.positionProp == 'top' ? Math.ceil(position) + 'px' : '0px';

        positionProps[_.positionProp] = position;

        if (_.transformsEnabled === false) {
            _.$slideTrack.css(positionProps);
        } else {
            positionProps = {};
            if (_.cssTransitions === false) {
                positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';
                _.$slideTrack.css(positionProps);
            } else {
                positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';
                _.$slideTrack.css(positionProps);
            }
        }

    };

    Slick.prototype.setDimensions = function() {

        var _ = this;

        if (_.options.vertical === false) {
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: ('0px ' + _.options.centerPadding)
                });
            }
        } else {
            _.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: (_.options.centerPadding + ' 0px')
                });
            }
        }

        _.listWidth = _.$list.width();
        _.listHeight = _.$list.height();


        if (_.options.vertical === false && _.options.variableWidth === false) {
            _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
            _.$slideTrack.width(Math.ceil((_.slideWidth * _.$slideTrack.children('.slick-slide').length)));

        } else if (_.options.variableWidth === true) {
            _.$slideTrack.width(5000 * _.slideCount);
        } else {
            _.slideWidth = Math.ceil(_.listWidth);
            _.$slideTrack.height(Math.ceil((_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length)));
        }

        var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();
        if (_.options.variableWidth === false) _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);

    };

    Slick.prototype.setFade = function() {

        var _ = this,
            targetLeft;

        _.$slides.each(function(index, element) {
            targetLeft = (_.slideWidth * index) * -1;
            if (_.options.rtl === true) {
                $(element).css({
                    position: 'relative',
                    right: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            } else {
                $(element).css({
                    position: 'relative',
                    left: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            }
        });

        _.$slides.eq(_.currentSlide).css({
            zIndex: _.options.zIndex - 1,
            opacity: 1
        });

    };

    Slick.prototype.setHeight = function() {

        var _ = this;

        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.css('height', targetHeight);
        }

    };

    Slick.prototype.setOption =
    Slick.prototype.slickSetOption = function() {

        /**
         * accepts arguments in format of:
         *
         *  - for changing a single option's value:
         *     .slick("setOption", option, value, refresh )
         *
         *  - for changing a set of responsive options:
         *     .slick("setOption", 'responsive', [{}, ...], refresh )
         *
         *  - for updating multiple values at once (not responsive)
         *     .slick("setOption", { 'option': value, ... }, refresh )
         */

        var _ = this, l, item, option, value, refresh = false, type;

        if( $.type( arguments[0] ) === 'object' ) {

            option =  arguments[0];
            refresh = arguments[1];
            type = 'multiple';

        } else if ( $.type( arguments[0] ) === 'string' ) {

            option =  arguments[0];
            value = arguments[1];
            refresh = arguments[2];

            if ( arguments[0] === 'responsive' && $.type( arguments[1] ) === 'array' ) {

                type = 'responsive';

            } else if ( typeof arguments[1] !== 'undefined' ) {

                type = 'single';

            }

        }

        if ( type === 'single' ) {

            _.options[option] = value;


        } else if ( type === 'multiple' ) {

            $.each( option , function( opt, val ) {

                _.options[opt] = val;

            });


        } else if ( type === 'responsive' ) {

            for ( item in value ) {

                if( $.type( _.options.responsive ) !== 'array' ) {

                    _.options.responsive = [ value[item] ];

                } else {

                    l = _.options.responsive.length-1;

                    // loop through the responsive object and splice out duplicates.
                    while( l >= 0 ) {

                        if( _.options.responsive[l].breakpoint === value[item].breakpoint ) {

                            _.options.responsive.splice(l,1);

                        }

                        l--;

                    }

                    _.options.responsive.push( value[item] );

                }

            }

        }

        if ( refresh ) {

            _.unload();
            _.reinit();

        }

    };

    Slick.prototype.setPosition = function() {

        var _ = this;

        _.setDimensions();

        _.setHeight();

        if (_.options.fade === false) {
            _.setCSS(_.getLeft(_.currentSlide));
        } else {
            _.setFade();
        }

        _.$slider.trigger('setPosition', [_]);

    };

    Slick.prototype.setProps = function() {

        var _ = this,
            bodyStyle = document.body.style;

        _.positionProp = _.options.vertical === true ? 'top' : 'left';

        if (_.positionProp === 'top') {
            _.$slider.addClass('slick-vertical');
        } else {
            _.$slider.removeClass('slick-vertical');
        }

        if (bodyStyle.WebkitTransition !== undefined ||
            bodyStyle.MozTransition !== undefined ||
            bodyStyle.msTransition !== undefined) {
            if (_.options.useCSS === true) {
                _.cssTransitions = true;
            }
        }

        if ( _.options.fade ) {
            if ( typeof _.options.zIndex === 'number' ) {
                if( _.options.zIndex < 3 ) {
                    _.options.zIndex = 3;
                }
            } else {
                _.options.zIndex = _.defaults.zIndex;
            }
        }

        if (bodyStyle.OTransform !== undefined) {
            _.animType = 'OTransform';
            _.transformType = '-o-transform';
            _.transitionType = 'OTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.MozTransform !== undefined) {
            _.animType = 'MozTransform';
            _.transformType = '-moz-transform';
            _.transitionType = 'MozTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.webkitTransform !== undefined) {
            _.animType = 'webkitTransform';
            _.transformType = '-webkit-transform';
            _.transitionType = 'webkitTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.msTransform !== undefined) {
            _.animType = 'msTransform';
            _.transformType = '-ms-transform';
            _.transitionType = 'msTransition';
            if (bodyStyle.msTransform === undefined) _.animType = false;
        }
        if (bodyStyle.transform !== undefined && _.animType !== false) {
            _.animType = 'transform';
            _.transformType = 'transform';
            _.transitionType = 'transition';
        }
        _.transformsEnabled = _.options.useTransform && (_.animType !== null && _.animType !== false);
    };


    Slick.prototype.setSlideClasses = function(index) {

        var _ = this,
            centerOffset, allSlides, indexOffset, remainder;

        allSlides = _.$slider
            .find('.slick-slide')
            .removeClass('slick-active slick-center slick-current')
            .attr('aria-hidden', 'true');

        _.$slides
            .eq(index)
            .addClass('slick-current');

        if (_.options.centerMode === true) {

            centerOffset = Math.floor(_.options.slidesToShow / 2);

            if (_.options.infinite === true) {

                if (index >= centerOffset && index <= (_.slideCount - 1) - centerOffset) {

                    _.$slides
                        .slice(index - centerOffset, index + centerOffset + 1)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                } else {

                    indexOffset = _.options.slidesToShow + index;
                    allSlides
                        .slice(indexOffset - centerOffset + 1, indexOffset + centerOffset + 2)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                }

                if (index === 0) {

                    allSlides
                        .eq(allSlides.length - 1 - _.options.slidesToShow)
                        .addClass('slick-center');

                } else if (index === _.slideCount - 1) {

                    allSlides
                        .eq(_.options.slidesToShow)
                        .addClass('slick-center');

                }

            }

            _.$slides
                .eq(index)
                .addClass('slick-center');

        } else {

            if (index >= 0 && index <= (_.slideCount - _.options.slidesToShow)) {

                _.$slides
                    .slice(index, index + _.options.slidesToShow)
                    .addClass('slick-active')
                    .attr('aria-hidden', 'false');

            } else if (allSlides.length <= _.options.slidesToShow) {

                allSlides
                    .addClass('slick-active')
                    .attr('aria-hidden', 'false');

            } else {

                remainder = _.slideCount % _.options.slidesToShow;
                indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;

                if (_.options.slidesToShow == _.options.slidesToScroll && (_.slideCount - index) < _.options.slidesToShow) {

                    allSlides
                        .slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                } else {

                    allSlides
                        .slice(indexOffset, indexOffset + _.options.slidesToShow)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                }

            }

        }

        if (_.options.lazyLoad === 'ondemand') {
            _.lazyLoad();
        }

    };

    Slick.prototype.setupInfinite = function() {

        var _ = this,
            i, slideIndex, infiniteCount;

        if (_.options.fade === true) {
            _.options.centerMode = false;
        }

        if (_.options.infinite === true && _.options.fade === false) {

            slideIndex = null;

            if (_.slideCount > _.options.slidesToShow) {

                if (_.options.centerMode === true) {
                    infiniteCount = _.options.slidesToShow + 1;
                } else {
                    infiniteCount = _.options.slidesToShow;
                }

                for (i = _.slideCount; i > (_.slideCount -
                        infiniteCount); i -= 1) {
                    slideIndex = i - 1;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '')
                        .attr('data-slick-index', slideIndex - _.slideCount)
                        .prependTo(_.$slideTrack).addClass('slick-cloned');
                }
                for (i = 0; i < infiniteCount; i += 1) {
                    slideIndex = i;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '')
                        .attr('data-slick-index', slideIndex + _.slideCount)
                        .appendTo(_.$slideTrack).addClass('slick-cloned');
                }
                _.$slideTrack.find('.slick-cloned').find('[id]').each(function() {
                    $(this).attr('id', '');
                });

            }

        }

    };

    Slick.prototype.interrupt = function( toggle ) {

        var _ = this;

        if( !toggle ) {
            _.autoPlay();
        }
        _.interrupted = toggle;

    };

    Slick.prototype.selectHandler = function(event) {

        var _ = this;

        var targetElement =
            $(event.target).is('.slick-slide') ?
                $(event.target) :
                $(event.target).parents('.slick-slide');

        var index = parseInt(targetElement.attr('data-slick-index'));

        if (!index) index = 0;

        if (_.slideCount <= _.options.slidesToShow) {

            _.setSlideClasses(index);
            _.asNavFor(index);
            return;

        }

        _.slideHandler(index);

    };

    Slick.prototype.slideHandler = function(index, sync, dontAnimate) {

        var targetSlide, animSlide, oldSlide, slideLeft, targetLeft = null,
            _ = this, navTarget;

        sync = sync || false;

        if (_.animating === true && _.options.waitForAnimate === true) {
            return;
        }

        if (_.options.fade === true && _.currentSlide === index) {
            return;
        }

        if (_.slideCount <= _.options.slidesToShow) {
            return;
        }

        if (sync === false) {
            _.asNavFor(index);
        }

        targetSlide = index;
        targetLeft = _.getLeft(targetSlide);
        slideLeft = _.getLeft(_.currentSlide);

        _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

        if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true) {
                    _.animateSlide(slideLeft, function() {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        } else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > (_.slideCount - _.options.slidesToScroll))) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true) {
                    _.animateSlide(slideLeft, function() {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        }

        if ( _.options.autoplay ) {
            clearInterval(_.autoPlayTimer);
        }

        if (targetSlide < 0) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = _.slideCount - (_.slideCount % _.options.slidesToScroll);
            } else {
                animSlide = _.slideCount + targetSlide;
            }
        } else if (targetSlide >= _.slideCount) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = 0;
            } else {
                animSlide = targetSlide - _.slideCount;
            }
        } else {
            animSlide = targetSlide;
        }

        _.animating = true;

        _.$slider.trigger('beforeChange', [_, _.currentSlide, animSlide]);

        oldSlide = _.currentSlide;
        _.currentSlide = animSlide;

        _.setSlideClasses(_.currentSlide);

        if ( _.options.asNavFor ) {

            navTarget = _.getNavTarget();
            navTarget = navTarget.slick('getSlick');

            if ( navTarget.slideCount <= navTarget.options.slidesToShow ) {
                navTarget.setSlideClasses(_.currentSlide);
            }

        }

        _.updateDots();
        _.updateArrows();

        if (_.options.fade === true) {
            if (dontAnimate !== true) {

                _.fadeSlideOut(oldSlide);

                _.fadeSlide(animSlide, function() {
                    _.postSlide(animSlide);
                });

            } else {
                _.postSlide(animSlide);
            }
            _.animateHeight();
            return;
        }

        if (dontAnimate !== true) {
            _.animateSlide(targetLeft, function() {
                _.postSlide(animSlide);
            });
        } else {
            _.postSlide(animSlide);
        }

    };

    Slick.prototype.startLoad = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.hide();
            _.$nextArrow.hide();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.hide();

        }

        _.$slider.addClass('slick-loading');

    };

    Slick.prototype.swipeDirection = function() {

        var xDist, yDist, r, swipeAngle, _ = this;

        xDist = _.touchObject.startX - _.touchObject.curX;
        yDist = _.touchObject.startY - _.touchObject.curY;
        r = Math.atan2(yDist, xDist);

        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) {
            swipeAngle = 360 - Math.abs(swipeAngle);
        }

        if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
            return (_.options.rtl === false ? 'left' : 'right');
        }
        if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
            return (_.options.rtl === false ? 'left' : 'right');
        }
        if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
            return (_.options.rtl === false ? 'right' : 'left');
        }
        if (_.options.verticalSwiping === true) {
            if ((swipeAngle >= 35) && (swipeAngle <= 135)) {
                return 'down';
            } else {
                return 'up';
            }
        }

        return 'vertical';

    };

    Slick.prototype.swipeEnd = function(event) {

        var _ = this,
            slideCount,
            direction;

        _.dragging = false;
        _.interrupted = false;
        _.shouldClick = ( _.touchObject.swipeLength > 10 ) ? false : true;

        if ( _.touchObject.curX === undefined ) {
            return false;
        }

        if ( _.touchObject.edgeHit === true ) {
            _.$slider.trigger('edge', [_, _.swipeDirection() ]);
        }

        if ( _.touchObject.swipeLength >= _.touchObject.minSwipe ) {

            direction = _.swipeDirection();

            switch ( direction ) {

                case 'left':
                case 'down':

                    slideCount =
                        _.options.swipeToSlide ?
                            _.checkNavigable( _.currentSlide + _.getSlideCount() ) :
                            _.currentSlide + _.getSlideCount();

                    _.currentDirection = 0;

                    break;

                case 'right':
                case 'up':

                    slideCount =
                        _.options.swipeToSlide ?
                            _.checkNavigable( _.currentSlide - _.getSlideCount() ) :
                            _.currentSlide - _.getSlideCount();

                    _.currentDirection = 1;

                    break;

                default:


            }

            if( direction != 'vertical' ) {

                _.slideHandler( slideCount );
                _.touchObject = {};
                _.$slider.trigger('swipe', [_, direction ]);

            }

        } else {

            if ( _.touchObject.startX !== _.touchObject.curX ) {

                _.slideHandler( _.currentSlide );
                _.touchObject = {};

            }

        }

    };

    Slick.prototype.swipeHandler = function(event) {

        var _ = this;

        if ((_.options.swipe === false) || ('ontouchend' in document && _.options.swipe === false)) {
            return;
        } else if (_.options.draggable === false && event.type.indexOf('mouse') !== -1) {
            return;
        }

        _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ?
            event.originalEvent.touches.length : 1;

        _.touchObject.minSwipe = _.listWidth / _.options
            .touchThreshold;

        if (_.options.verticalSwiping === true) {
            _.touchObject.minSwipe = _.listHeight / _.options
                .touchThreshold;
        }

        switch (event.data.action) {

            case 'start':
                _.swipeStart(event);
                break;

            case 'move':
                _.swipeMove(event);
                break;

            case 'end':
                _.swipeEnd(event);
                break;

        }

    };

    Slick.prototype.swipeMove = function(event) {

        var _ = this,
            edgeWasHit = false,
            curLeft, swipeDirection, swipeLength, positionOffset, touches;

        touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

        if (!_.dragging || touches && touches.length !== 1) {
            return false;
        }

        curLeft = _.getLeft(_.currentSlide);

        _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
        _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;

        _.touchObject.swipeLength = Math.round(Math.sqrt(
            Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));

        if (_.options.verticalSwiping === true) {
            _.touchObject.swipeLength = Math.round(Math.sqrt(
                Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));
        }

        swipeDirection = _.swipeDirection();

        if (swipeDirection === 'vertical') {
            return;
        }

        if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
            event.preventDefault();
        }

        positionOffset = (_.options.rtl === false ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1);
        if (_.options.verticalSwiping === true) {
            positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;
        }


        swipeLength = _.touchObject.swipeLength;

        _.touchObject.edgeHit = false;

        if (_.options.infinite === false) {
            if ((_.currentSlide === 0 && swipeDirection === 'right') || (_.currentSlide >= _.getDotCount() && swipeDirection === 'left')) {
                swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;
                _.touchObject.edgeHit = true;
            }
        }

        if (_.options.vertical === false) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        } else {
            _.swipeLeft = curLeft + (swipeLength * (_.$list.height() / _.listWidth)) * positionOffset;
        }
        if (_.options.verticalSwiping === true) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        }

        if (_.options.fade === true || _.options.touchMove === false) {
            return false;
        }

        if (_.animating === true) {
            _.swipeLeft = null;
            return false;
        }

        _.setCSS(_.swipeLeft);

    };

    Slick.prototype.swipeStart = function(event) {

        var _ = this,
            touches;

        _.interrupted = true;

        if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
            _.touchObject = {};
            return false;
        }

        if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
            touches = event.originalEvent.touches[0];
        }

        _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
        _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;

        _.dragging = true;

    };

    Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function() {

        var _ = this;

        if (_.$slidesCache !== null) {

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.unload = function() {

        var _ = this;

        $('.slick-cloned', _.$slider).remove();

        if (_.$dots) {
            _.$dots.remove();
        }

        if (_.$prevArrow && _.htmlExpr.test(_.options.prevArrow)) {
            _.$prevArrow.remove();
        }

        if (_.$nextArrow && _.htmlExpr.test(_.options.nextArrow)) {
            _.$nextArrow.remove();
        }

        _.$slides
            .removeClass('slick-slide slick-active slick-visible slick-current')
            .attr('aria-hidden', 'true')
            .css('width', '');

    };

    Slick.prototype.unslick = function(fromBreakpoint) {

        var _ = this;
        _.$slider.trigger('unslick', [_, fromBreakpoint]);
        _.destroy();

    };

    Slick.prototype.updateArrows = function() {

        var _ = this,
            centerOffset;

        centerOffset = Math.floor(_.options.slidesToShow / 2);

        if ( _.options.arrows === true &&
            _.slideCount > _.options.slidesToShow &&
            !_.options.infinite ) {

            _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
            _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            if (_.currentSlide === 0) {

                _.$prevArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === false) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            } else if (_.currentSlide >= _.slideCount - 1 && _.options.centerMode === true) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            }

        }

    };

    Slick.prototype.updateDots = function() {

        var _ = this;

        if (_.$dots !== null) {

            _.$dots
                .find('li')
                .removeClass('slick-active')
                .attr('aria-hidden', 'true');

            _.$dots
                .find('li')
                .eq(Math.floor(_.currentSlide / _.options.slidesToScroll))
                .addClass('slick-active')
                .attr('aria-hidden', 'false');

        }

    };

    Slick.prototype.visibility = function() {

        var _ = this;

        if ( _.options.autoplay ) {

            if ( document[_.hidden] ) {

                _.interrupted = true;

            } else {

                _.interrupted = false;

            }

        }

    };

    $.fn.slick = function() {
        var _ = this,
            opt = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            l = _.length,
            i,
            ret;
        for (i = 0; i < l; i++) {
            if (typeof opt == 'object' || typeof opt == 'undefined')
                _[i].slick = new Slick(_[i], opt);
            else
                ret = _[i].slick[opt].apply(_[i].slick, args);
            if (typeof ret != 'undefined') return ret;
        }
        return _;
    };

}));

/*!
 * Isotope PACKAGED v3.0.4
 *
 * Licensed GPLv3 for open source use
 * or Isotope Commercial License for commercial use
 *
 * http://isotope.metafizzy.co
 * Copyright 2017 Metafizzy
 */

/**
 * Bridget makes jQuery widgets
 * v2.0.1
 * MIT license
 */

/* jshint browser: true, strict: true, undef: true, unused: true */

( function( window, factory ) {
  // universal module definition
  /*jshint strict: false */ /* globals define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( 'jquery-bridget/jquery-bridget',[ 'jquery' ], function( jQuery ) {
      return factory( window, jQuery );
    });
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      window,
      require('jquery')
    );
  } else {
    // browser global
    window.jQueryBridget = factory(
      window,
      window.jQuery
    );
  }

}( window, function factory( window, jQuery ) {
'use strict';

// ----- utils ----- //

var arraySlice = Array.prototype.slice;

// helper function for logging errors
// $.error breaks jQuery chaining
var console = window.console;
var logError = typeof console == 'undefined' ? function() {} :
  function( message ) {
    console.error( message );
  };

// ----- jQueryBridget ----- //

function jQueryBridget( namespace, PluginClass, $ ) {
  $ = $ || jQuery || window.jQuery;
  if ( !$ ) {
    return;
  }

  // add option method -> $().plugin('option', {...})
  if ( !PluginClass.prototype.option ) {
    // option setter
    PluginClass.prototype.option = function( opts ) {
      // bail out if not an object
      if ( !$.isPlainObject( opts ) ){
        return;
      }
      this.options = $.extend( true, this.options, opts );
    };
  }

  // make jQuery plugin
  $.fn[ namespace ] = function( arg0 /*, arg1 */ ) {
    if ( typeof arg0 == 'string' ) {
      // method call $().plugin( 'methodName', { options } )
      // shift arguments by 1
      var args = arraySlice.call( arguments, 1 );
      return methodCall( this, arg0, args );
    }
    // just $().plugin({ options })
    plainCall( this, arg0 );
    return this;
  };

  // $().plugin('methodName')
  function methodCall( $elems, methodName, args ) {
    var returnValue;
    var pluginMethodStr = '$().' + namespace + '("' + methodName + '")';

    $elems.each( function( i, elem ) {
      // get instance
      var instance = $.data( elem, namespace );
      if ( !instance ) {
        logError( namespace + ' not initialized. Cannot call methods, i.e. ' +
          pluginMethodStr );
        return;
      }

      var method = instance[ methodName ];
      if ( !method || methodName.charAt(0) == '_' ) {
        logError( pluginMethodStr + ' is not a valid method' );
        return;
      }

      // apply method, get return value
      var value = method.apply( instance, args );
      // set return value if value is returned, use only first value
      returnValue = returnValue === undefined ? value : returnValue;
    });

    return returnValue !== undefined ? returnValue : $elems;
  }

  function plainCall( $elems, options ) {
    $elems.each( function( i, elem ) {
      var instance = $.data( elem, namespace );
      if ( instance ) {
        // set options & init
        instance.option( options );
        instance._init();
      } else {
        // initialize new instance
        instance = new PluginClass( elem, options );
        $.data( elem, namespace, instance );
      }
    });
  }

  updateJQuery( $ );

}

// ----- updateJQuery ----- //

// set $.bridget for v1 backwards compatibility
function updateJQuery( $ ) {
  if ( !$ || ( $ && $.bridget ) ) {
    return;
  }
  $.bridget = jQueryBridget;
}

updateJQuery( jQuery || window.jQuery );

// -----  ----- //

return jQueryBridget;

}));

/**
 * EvEmitter v1.0.3
 * Lil' event emitter
 * MIT License
 */

/* jshint unused: true, undef: true, strict: true */

( function( global, factory ) {
  // universal module definition
  /* jshint strict: false */ /* globals define, module, window */
  if ( typeof define == 'function' && define.amd ) {
    // AMD - RequireJS
    define( 'ev-emitter/ev-emitter',factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS - Browserify, Webpack
    module.exports = factory();
  } else {
    // Browser globals
    global.EvEmitter = factory();
  }

}( typeof window != 'undefined' ? window : this, function() {



function EvEmitter() {}

var proto = EvEmitter.prototype;

proto.on = function( eventName, listener ) {
  if ( !eventName || !listener ) {
    return;
  }
  // set events hash
  var events = this._events = this._events || {};
  // set listeners array
  var listeners = events[ eventName ] = events[ eventName ] || [];
  // only add once
  if ( listeners.indexOf( listener ) == -1 ) {
    listeners.push( listener );
  }

  return this;
};

proto.once = function( eventName, listener ) {
  if ( !eventName || !listener ) {
    return;
  }
  // add event
  this.on( eventName, listener );
  // set once flag
  // set onceEvents hash
  var onceEvents = this._onceEvents = this._onceEvents || {};
  // set onceListeners object
  var onceListeners = onceEvents[ eventName ] = onceEvents[ eventName ] || {};
  // set flag
  onceListeners[ listener ] = true;

  return this;
};

proto.off = function( eventName, listener ) {
  var listeners = this._events && this._events[ eventName ];
  if ( !listeners || !listeners.length ) {
    return;
  }
  var index = listeners.indexOf( listener );
  if ( index != -1 ) {
    listeners.splice( index, 1 );
  }

  return this;
};

proto.emitEvent = function( eventName, args ) {
  var listeners = this._events && this._events[ eventName ];
  if ( !listeners || !listeners.length ) {
    return;
  }
  var i = 0;
  var listener = listeners[i];
  args = args || [];
  // once stuff
  var onceListeners = this._onceEvents && this._onceEvents[ eventName ];

  while ( listener ) {
    var isOnce = onceListeners && onceListeners[ listener ];
    if ( isOnce ) {
      // remove listener
      // remove before trigger to prevent recursion
      this.off( eventName, listener );
      // unset once flag
      delete onceListeners[ listener ];
    }
    // trigger listener
    listener.apply( this, args );
    // get next listener
    i += isOnce ? 0 : 1;
    listener = listeners[i];
  }

  return this;
};

return EvEmitter;

}));

/*!
 * getSize v2.0.2
 * measure size of elements
 * MIT license
 */

/*jshint browser: true, strict: true, undef: true, unused: true */
/*global define: false, module: false, console: false */

( function( window, factory ) {
  'use strict';

  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( 'get-size/get-size',[],function() {
      return factory();
    });
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory();
  } else {
    // browser global
    window.getSize = factory();
  }

})( window, function factory() {
'use strict';

// -------------------------- helpers -------------------------- //

// get a number from a string, not a percentage
function getStyleSize( value ) {
  var num = parseFloat( value );
  // not a percent like '100%', and a number
  var isValid = value.indexOf('%') == -1 && !isNaN( num );
  return isValid && num;
}

function noop() {}

var logError = typeof console == 'undefined' ? noop :
  function( message ) {
    console.error( message );
  };

// -------------------------- measurements -------------------------- //

var measurements = [
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingBottom',
  'marginLeft',
  'marginRight',
  'marginTop',
  'marginBottom',
  'borderLeftWidth',
  'borderRightWidth',
  'borderTopWidth',
  'borderBottomWidth'
];

var measurementsLength = measurements.length;

function getZeroSize() {
  var size = {
    width: 0,
    height: 0,
    innerWidth: 0,
    innerHeight: 0,
    outerWidth: 0,
    outerHeight: 0
  };
  for ( var i=0; i < measurementsLength; i++ ) {
    var measurement = measurements[i];
    size[ measurement ] = 0;
  }
  return size;
}

// -------------------------- getStyle -------------------------- //

/**
 * getStyle, get style of element, check for Firefox bug
 * https://bugzilla.mozilla.org/show_bug.cgi?id=548397
 */
function getStyle( elem ) {
  var style = getComputedStyle( elem );
  if ( !style ) {
    logError( 'Style returned ' + style +
      '. Are you running this code in a hidden iframe on Firefox? ' +
      'See http://bit.ly/getsizebug1' );
  }
  return style;
}

// -------------------------- setup -------------------------- //

var isSetup = false;

var isBoxSizeOuter;

/**
 * setup
 * check isBoxSizerOuter
 * do on first getSize() rather than on page load for Firefox bug
 */
function setup() {
  // setup once
  if ( isSetup ) {
    return;
  }
  isSetup = true;

  // -------------------------- box sizing -------------------------- //

  /**
   * WebKit measures the outer-width on style.width on border-box elems
   * IE & Firefox<29 measures the inner-width
   */
  var div = document.createElement('div');
  div.style.width = '200px';
  div.style.padding = '1px 2px 3px 4px';
  div.style.borderStyle = 'solid';
  div.style.borderWidth = '1px 2px 3px 4px';
  div.style.boxSizing = 'border-box';

  var body = document.body || document.documentElement;
  body.appendChild( div );
  var style = getStyle( div );

  getSize.isBoxSizeOuter = isBoxSizeOuter = getStyleSize( style.width ) == 200;
  body.removeChild( div );

}

// -------------------------- getSize -------------------------- //

function getSize( elem ) {
  setup();

  // use querySeletor if elem is string
  if ( typeof elem == 'string' ) {
    elem = document.querySelector( elem );
  }

  // do not proceed on non-objects
  if ( !elem || typeof elem != 'object' || !elem.nodeType ) {
    return;
  }

  var style = getStyle( elem );

  // if hidden, everything is 0
  if ( style.display == 'none' ) {
    return getZeroSize();
  }

  var size = {};
  size.width = elem.offsetWidth;
  size.height = elem.offsetHeight;

  var isBorderBox = size.isBorderBox = style.boxSizing == 'border-box';

  // get all measurements
  for ( var i=0; i < measurementsLength; i++ ) {
    var measurement = measurements[i];
    var value = style[ measurement ];
    var num = parseFloat( value );
    // any 'auto', 'medium' value will be 0
    size[ measurement ] = !isNaN( num ) ? num : 0;
  }

  var paddingWidth = size.paddingLeft + size.paddingRight;
  var paddingHeight = size.paddingTop + size.paddingBottom;
  var marginWidth = size.marginLeft + size.marginRight;
  var marginHeight = size.marginTop + size.marginBottom;
  var borderWidth = size.borderLeftWidth + size.borderRightWidth;
  var borderHeight = size.borderTopWidth + size.borderBottomWidth;

  var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;

  // overwrite width and height if we can get it from style
  var styleWidth = getStyleSize( style.width );
  if ( styleWidth !== false ) {
    size.width = styleWidth +
      // add padding and border unless it's already including it
      ( isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth );
  }

  var styleHeight = getStyleSize( style.height );
  if ( styleHeight !== false ) {
    size.height = styleHeight +
      // add padding and border unless it's already including it
      ( isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight );
  }

  size.innerWidth = size.width - ( paddingWidth + borderWidth );
  size.innerHeight = size.height - ( paddingHeight + borderHeight );

  size.outerWidth = size.width + marginWidth;
  size.outerHeight = size.height + marginHeight;

  return size;
}

return getSize;

});

/**
 * matchesSelector v2.0.2
 * matchesSelector( element, '.selector' )
 * MIT license
 */

/*jshint browser: true, strict: true, undef: true, unused: true */

( function( window, factory ) {
  /*global define: false, module: false */
  'use strict';
  // universal module definition
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( 'desandro-matches-selector/matches-selector',factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory();
  } else {
    // browser global
    window.matchesSelector = factory();
  }

}( window, function factory() {
  'use strict';

  var matchesMethod = ( function() {
    var ElemProto = window.Element.prototype;
    // check for the standard method name first
    if ( ElemProto.matches ) {
      return 'matches';
    }
    // check un-prefixed
    if ( ElemProto.matchesSelector ) {
      return 'matchesSelector';
    }
    // check vendor prefixes
    var prefixes = [ 'webkit', 'moz', 'ms', 'o' ];

    for ( var i=0; i < prefixes.length; i++ ) {
      var prefix = prefixes[i];
      var method = prefix + 'MatchesSelector';
      if ( ElemProto[ method ] ) {
        return method;
      }
    }
  })();

  return function matchesSelector( elem, selector ) {
    return elem[ matchesMethod ]( selector );
  };

}));

/**
 * Fizzy UI utils v2.0.5
 * MIT license
 */

/*jshint browser: true, undef: true, unused: true, strict: true */

( function( window, factory ) {
  // universal module definition
  /*jshint strict: false */ /*globals define, module, require */

  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( 'fizzy-ui-utils/utils',[
      'desandro-matches-selector/matches-selector'
    ], function( matchesSelector ) {
      return factory( window, matchesSelector );
    });
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      window,
      require('desandro-matches-selector')
    );
  } else {
    // browser global
    window.fizzyUIUtils = factory(
      window,
      window.matchesSelector
    );
  }

}( window, function factory( window, matchesSelector ) {



var utils = {};

// ----- extend ----- //

// extends objects
utils.extend = function( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
};

// ----- modulo ----- //

utils.modulo = function( num, div ) {
  return ( ( num % div ) + div ) % div;
};

// ----- makeArray ----- //

// turn element or nodeList into an array
utils.makeArray = function( obj ) {
  var ary = [];
  if ( Array.isArray( obj ) ) {
    // use object if already an array
    ary = obj;
  } else if ( obj && typeof obj == 'object' &&
    typeof obj.length == 'number' ) {
    // convert nodeList to array
    for ( var i=0; i < obj.length; i++ ) {
      ary.push( obj[i] );
    }
  } else {
    // array of single index
    ary.push( obj );
  }
  return ary;
};

// ----- removeFrom ----- //

utils.removeFrom = function( ary, obj ) {
  var index = ary.indexOf( obj );
  if ( index != -1 ) {
    ary.splice( index, 1 );
  }
};

// ----- getParent ----- //

utils.getParent = function( elem, selector ) {
  while ( elem.parentNode && elem != document.body ) {
    elem = elem.parentNode;
    if ( matchesSelector( elem, selector ) ) {
      return elem;
    }
  }
};

// ----- getQueryElement ----- //

// use element as selector string
utils.getQueryElement = function( elem ) {
  if ( typeof elem == 'string' ) {
    return document.querySelector( elem );
  }
  return elem;
};

// ----- handleEvent ----- //

// enable .ontype to trigger from .addEventListener( elem, 'type' )
utils.handleEvent = function( event ) {
  var method = 'on' + event.type;
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

// ----- filterFindElements ----- //

utils.filterFindElements = function( elems, selector ) {
  // make array of elems
  elems = utils.makeArray( elems );
  var ffElems = [];

  elems.forEach( function( elem ) {
    // check that elem is an actual element
    if ( !( elem instanceof HTMLElement ) ) {
      return;
    }
    // add elem if no selector
    if ( !selector ) {
      ffElems.push( elem );
      return;
    }
    // filter & find items if we have a selector
    // filter
    if ( matchesSelector( elem, selector ) ) {
      ffElems.push( elem );
    }
    // find children
    var childElems = elem.querySelectorAll( selector );
    // concat childElems to filterFound array
    for ( var i=0; i < childElems.length; i++ ) {
      ffElems.push( childElems[i] );
    }
  });

  return ffElems;
};

// ----- debounceMethod ----- //

utils.debounceMethod = function( _class, methodName, threshold ) {
  // original method
  var method = _class.prototype[ methodName ];
  var timeoutName = methodName + 'Timeout';

  _class.prototype[ methodName ] = function() {
    var timeout = this[ timeoutName ];
    if ( timeout ) {
      clearTimeout( timeout );
    }
    var args = arguments;

    var _this = this;
    this[ timeoutName ] = setTimeout( function() {
      method.apply( _this, args );
      delete _this[ timeoutName ];
    }, threshold || 100 );
  };
};

// ----- docReady ----- //

utils.docReady = function( callback ) {
  var readyState = document.readyState;
  if ( readyState == 'complete' || readyState == 'interactive' ) {
    // do async to allow for other scripts to run. metafizzy/flickity#441
    setTimeout( callback );
  } else {
    document.addEventListener( 'DOMContentLoaded', callback );
  }
};

// ----- htmlInit ----- //

// http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
utils.toDashed = function( str ) {
  return str.replace( /(.)([A-Z])/g, function( match, $1, $2 ) {
    return $1 + '-' + $2;
  }).toLowerCase();
};

var console = window.console;
/**
 * allow user to initialize classes via [data-namespace] or .js-namespace class
 * htmlInit( Widget, 'widgetName' )
 * options are parsed from data-namespace-options
 */
utils.htmlInit = function( WidgetClass, namespace ) {
  utils.docReady( function() {
    var dashedNamespace = utils.toDashed( namespace );
    var dataAttr = 'data-' + dashedNamespace;
    var dataAttrElems = document.querySelectorAll( '[' + dataAttr + ']' );
    var jsDashElems = document.querySelectorAll( '.js-' + dashedNamespace );
    var elems = utils.makeArray( dataAttrElems )
      .concat( utils.makeArray( jsDashElems ) );
    var dataOptionsAttr = dataAttr + '-options';
    var jQuery = window.jQuery;

    elems.forEach( function( elem ) {
      var attr = elem.getAttribute( dataAttr ) ||
        elem.getAttribute( dataOptionsAttr );
      var options;
      try {
        options = attr && JSON.parse( attr );
      } catch ( error ) {
        // log error, do not initialize
        if ( console ) {
          console.error( 'Error parsing ' + dataAttr + ' on ' + elem.className +
          ': ' + error );
        }
        return;
      }
      // initialize
      var instance = new WidgetClass( elem, options );
      // make available via $().data('namespace')
      if ( jQuery ) {
        jQuery.data( elem, namespace, instance );
      }
    });

  });
};

// -----  ----- //

return utils;

}));

/**
 * Outlayer Item
 */

( function( window, factory ) {
  // universal module definition
  /* jshint strict: false */ /* globals define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD - RequireJS
    define( 'outlayer/item',[
        'ev-emitter/ev-emitter',
        'get-size/get-size'
      ],
      factory
    );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS - Browserify, Webpack
    module.exports = factory(
      require('ev-emitter'),
      require('get-size')
    );
  } else {
    // browser global
    window.Outlayer = {};
    window.Outlayer.Item = factory(
      window.EvEmitter,
      window.getSize
    );
  }

}( window, function factory( EvEmitter, getSize ) {
'use strict';

// ----- helpers ----- //

function isEmptyObj( obj ) {
  for ( var prop in obj ) {
    return false;
  }
  prop = null;
  return true;
}

// -------------------------- CSS3 support -------------------------- //


var docElemStyle = document.documentElement.style;

var transitionProperty = typeof docElemStyle.transition == 'string' ?
  'transition' : 'WebkitTransition';
var transformProperty = typeof docElemStyle.transform == 'string' ?
  'transform' : 'WebkitTransform';

var transitionEndEvent = {
  WebkitTransition: 'webkitTransitionEnd',
  transition: 'transitionend'
}[ transitionProperty ];

// cache all vendor properties that could have vendor prefix
var vendorProperties = {
  transform: transformProperty,
  transition: transitionProperty,
  transitionDuration: transitionProperty + 'Duration',
  transitionProperty: transitionProperty + 'Property',
  transitionDelay: transitionProperty + 'Delay'
};

// -------------------------- Item -------------------------- //

function Item( element, layout ) {
  if ( !element ) {
    return;
  }

  this.element = element;
  // parent layout class, i.e. Masonry, Isotope, or Packery
  this.layout = layout;
  this.position = {
    x: 0,
    y: 0
  };

  this._create();
}

// inherit EvEmitter
var proto = Item.prototype = Object.create( EvEmitter.prototype );
proto.constructor = Item;

proto._create = function() {
  // transition objects
  this._transn = {
    ingProperties: {},
    clean: {},
    onEnd: {}
  };

  this.css({
    position: 'absolute'
  });
};

// trigger specified handler for event type
proto.handleEvent = function( event ) {
  var method = 'on' + event.type;
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

proto.getSize = function() {
  this.size = getSize( this.element );
};

/**
 * apply CSS styles to element
 * @param {Object} style
 */
proto.css = function( style ) {
  var elemStyle = this.element.style;

  for ( var prop in style ) {
    // use vendor property if available
    var supportedProp = vendorProperties[ prop ] || prop;
    elemStyle[ supportedProp ] = style[ prop ];
  }
};

 // measure position, and sets it
proto.getPosition = function() {
  var style = getComputedStyle( this.element );
  var isOriginLeft = this.layout._getOption('originLeft');
  var isOriginTop = this.layout._getOption('originTop');
  var xValue = style[ isOriginLeft ? 'left' : 'right' ];
  var yValue = style[ isOriginTop ? 'top' : 'bottom' ];
  // convert percent to pixels
  var layoutSize = this.layout.size;
  var x = xValue.indexOf('%') != -1 ?
    ( parseFloat( xValue ) / 100 ) * layoutSize.width : parseInt( xValue, 10 );
  var y = yValue.indexOf('%') != -1 ?
    ( parseFloat( yValue ) / 100 ) * layoutSize.height : parseInt( yValue, 10 );

  // clean up 'auto' or other non-integer values
  x = isNaN( x ) ? 0 : x;
  y = isNaN( y ) ? 0 : y;
  // remove padding from measurement
  x -= isOriginLeft ? layoutSize.paddingLeft : layoutSize.paddingRight;
  y -= isOriginTop ? layoutSize.paddingTop : layoutSize.paddingBottom;

  this.position.x = x;
  this.position.y = y;
};

// set settled position, apply padding
proto.layoutPosition = function() {
  var layoutSize = this.layout.size;
  var style = {};
  var isOriginLeft = this.layout._getOption('originLeft');
  var isOriginTop = this.layout._getOption('originTop');

  // x
  var xPadding = isOriginLeft ? 'paddingLeft' : 'paddingRight';
  var xProperty = isOriginLeft ? 'left' : 'right';
  var xResetProperty = isOriginLeft ? 'right' : 'left';

  var x = this.position.x + layoutSize[ xPadding ];
  // set in percentage or pixels
  style[ xProperty ] = this.getXValue( x );
  // reset other property
  style[ xResetProperty ] = '';

  // y
  var yPadding = isOriginTop ? 'paddingTop' : 'paddingBottom';
  var yProperty = isOriginTop ? 'top' : 'bottom';
  var yResetProperty = isOriginTop ? 'bottom' : 'top';

  var y = this.position.y + layoutSize[ yPadding ];
  // set in percentage or pixels
  style[ yProperty ] = this.getYValue( y );
  // reset other property
  style[ yResetProperty ] = '';

  this.css( style );
  this.emitEvent( 'layout', [ this ] );
};

proto.getXValue = function( x ) {
  var isHorizontal = this.layout._getOption('horizontal');
  return this.layout.options.percentPosition && !isHorizontal ?
    ( ( x / this.layout.size.width ) * 100 ) + '%' : x + 'px';
};

proto.getYValue = function( y ) {
  var isHorizontal = this.layout._getOption('horizontal');
  return this.layout.options.percentPosition && isHorizontal ?
    ( ( y / this.layout.size.height ) * 100 ) + '%' : y + 'px';
};

proto._transitionTo = function( x, y ) {
  this.getPosition();
  // get current x & y from top/left
  var curX = this.position.x;
  var curY = this.position.y;

  var compareX = parseInt( x, 10 );
  var compareY = parseInt( y, 10 );
  var didNotMove = compareX === this.position.x && compareY === this.position.y;

  // save end position
  this.setPosition( x, y );

  // if did not move and not transitioning, just go to layout
  if ( didNotMove && !this.isTransitioning ) {
    this.layoutPosition();
    return;
  }

  var transX = x - curX;
  var transY = y - curY;
  var transitionStyle = {};
  transitionStyle.transform = this.getTranslate( transX, transY );

  this.transition({
    to: transitionStyle,
    onTransitionEnd: {
      transform: this.layoutPosition
    },
    isCleaning: true
  });
};

proto.getTranslate = function( x, y ) {
  // flip cooridinates if origin on right or bottom
  var isOriginLeft = this.layout._getOption('originLeft');
  var isOriginTop = this.layout._getOption('originTop');
  x = isOriginLeft ? x : -x;
  y = isOriginTop ? y : -y;
  return 'translate3d(' + x + 'px, ' + y + 'px, 0)';
};

// non transition + transform support
proto.goTo = function( x, y ) {
  this.setPosition( x, y );
  this.layoutPosition();
};

proto.moveTo = proto._transitionTo;

proto.setPosition = function( x, y ) {
  this.position.x = parseInt( x, 10 );
  this.position.y = parseInt( y, 10 );
};

// ----- transition ----- //

/**
 * @param {Object} style - CSS
 * @param {Function} onTransitionEnd
 */

// non transition, just trigger callback
proto._nonTransition = function( args ) {
  this.css( args.to );
  if ( args.isCleaning ) {
    this._removeStyles( args.to );
  }
  for ( var prop in args.onTransitionEnd ) {
    args.onTransitionEnd[ prop ].call( this );
  }
};

/**
 * proper transition
 * @param {Object} args - arguments
 *   @param {Object} to - style to transition to
 *   @param {Object} from - style to start transition from
 *   @param {Boolean} isCleaning - removes transition styles after transition
 *   @param {Function} onTransitionEnd - callback
 */
proto.transition = function( args ) {
  // redirect to nonTransition if no transition duration
  if ( !parseFloat( this.layout.options.transitionDuration ) ) {
    this._nonTransition( args );
    return;
  }

  var _transition = this._transn;
  // keep track of onTransitionEnd callback by css property
  for ( var prop in args.onTransitionEnd ) {
    _transition.onEnd[ prop ] = args.onTransitionEnd[ prop ];
  }
  // keep track of properties that are transitioning
  for ( prop in args.to ) {
    _transition.ingProperties[ prop ] = true;
    // keep track of properties to clean up when transition is done
    if ( args.isCleaning ) {
      _transition.clean[ prop ] = true;
    }
  }

  // set from styles
  if ( args.from ) {
    this.css( args.from );
    // force redraw. http://blog.alexmaccaw.com/css-transitions
    var h = this.element.offsetHeight;
    // hack for JSHint to hush about unused var
    h = null;
  }
  // enable transition
  this.enableTransition( args.to );
  // set styles that are transitioning
  this.css( args.to );

  this.isTransitioning = true;

};

// dash before all cap letters, including first for
// WebkitTransform => -webkit-transform
function toDashedAll( str ) {
  return str.replace( /([A-Z])/g, function( $1 ) {
    return '-' + $1.toLowerCase();
  });
}

var transitionProps = 'opacity,' + toDashedAll( transformProperty );

proto.enableTransition = function(/* style */) {
  // HACK changing transitionProperty during a transition
  // will cause transition to jump
  if ( this.isTransitioning ) {
    return;
  }

  // make `transition: foo, bar, baz` from style object
  // HACK un-comment this when enableTransition can work
  // while a transition is happening
  // var transitionValues = [];
  // for ( var prop in style ) {
  //   // dash-ify camelCased properties like WebkitTransition
  //   prop = vendorProperties[ prop ] || prop;
  //   transitionValues.push( toDashedAll( prop ) );
  // }
  // munge number to millisecond, to match stagger
  var duration = this.layout.options.transitionDuration;
  duration = typeof duration == 'number' ? duration + 'ms' : duration;
  // enable transition styles
  this.css({
    transitionProperty: transitionProps,
    transitionDuration: duration,
    transitionDelay: this.staggerDelay || 0
  });
  // listen for transition end event
  this.element.addEventListener( transitionEndEvent, this, false );
};

// ----- events ----- //

proto.onwebkitTransitionEnd = function( event ) {
  this.ontransitionend( event );
};

proto.onotransitionend = function( event ) {
  this.ontransitionend( event );
};

// properties that I munge to make my life easier
var dashedVendorProperties = {
  '-webkit-transform': 'transform'
};

proto.ontransitionend = function( event ) {
  // disregard bubbled events from children
  if ( event.target !== this.element ) {
    return;
  }
  var _transition = this._transn;
  // get property name of transitioned property, convert to prefix-free
  var propertyName = dashedVendorProperties[ event.propertyName ] || event.propertyName;

  // remove property that has completed transitioning
  delete _transition.ingProperties[ propertyName ];
  // check if any properties are still transitioning
  if ( isEmptyObj( _transition.ingProperties ) ) {
    // all properties have completed transitioning
    this.disableTransition();
  }
  // clean style
  if ( propertyName in _transition.clean ) {
    // clean up style
    this.element.style[ event.propertyName ] = '';
    delete _transition.clean[ propertyName ];
  }
  // trigger onTransitionEnd callback
  if ( propertyName in _transition.onEnd ) {
    var onTransitionEnd = _transition.onEnd[ propertyName ];
    onTransitionEnd.call( this );
    delete _transition.onEnd[ propertyName ];
  }

  this.emitEvent( 'transitionEnd', [ this ] );
};

proto.disableTransition = function() {
  this.removeTransitionStyles();
  this.element.removeEventListener( transitionEndEvent, this, false );
  this.isTransitioning = false;
};

/**
 * removes style property from element
 * @param {Object} style
**/
proto._removeStyles = function( style ) {
  // clean up transition styles
  var cleanStyle = {};
  for ( var prop in style ) {
    cleanStyle[ prop ] = '';
  }
  this.css( cleanStyle );
};

var cleanTransitionStyle = {
  transitionProperty: '',
  transitionDuration: '',
  transitionDelay: ''
};

proto.removeTransitionStyles = function() {
  // remove transition
  this.css( cleanTransitionStyle );
};

// ----- stagger ----- //

proto.stagger = function( delay ) {
  delay = isNaN( delay ) ? 0 : delay;
  this.staggerDelay = delay + 'ms';
};

// ----- show/hide/remove ----- //

// remove element from DOM
proto.removeElem = function() {
  this.element.parentNode.removeChild( this.element );
  // remove display: none
  this.css({ display: '' });
  this.emitEvent( 'remove', [ this ] );
};

proto.remove = function() {
  // just remove element if no transition support or no transition
  if ( !transitionProperty || !parseFloat( this.layout.options.transitionDuration ) ) {
    this.removeElem();
    return;
  }

  // start transition
  this.once( 'transitionEnd', function() {
    this.removeElem();
  });
  this.hide();
};

proto.reveal = function() {
  delete this.isHidden;
  // remove display: none
  this.css({ display: '' });

  var options = this.layout.options;

  var onTransitionEnd = {};
  var transitionEndProperty = this.getHideRevealTransitionEndProperty('visibleStyle');
  onTransitionEnd[ transitionEndProperty ] = this.onRevealTransitionEnd;

  this.transition({
    from: options.hiddenStyle,
    to: options.visibleStyle,
    isCleaning: true,
    onTransitionEnd: onTransitionEnd
  });
};

proto.onRevealTransitionEnd = function() {
  // check if still visible
  // during transition, item may have been hidden
  if ( !this.isHidden ) {
    this.emitEvent('reveal');
  }
};

/**
 * get style property use for hide/reveal transition end
 * @param {String} styleProperty - hiddenStyle/visibleStyle
 * @returns {String}
 */
proto.getHideRevealTransitionEndProperty = function( styleProperty ) {
  var optionStyle = this.layout.options[ styleProperty ];
  // use opacity
  if ( optionStyle.opacity ) {
    return 'opacity';
  }
  // get first property
  for ( var prop in optionStyle ) {
    return prop;
  }
};

proto.hide = function() {
  // set flag
  this.isHidden = true;
  // remove display: none
  this.css({ display: '' });

  var options = this.layout.options;

  var onTransitionEnd = {};
  var transitionEndProperty = this.getHideRevealTransitionEndProperty('hiddenStyle');
  onTransitionEnd[ transitionEndProperty ] = this.onHideTransitionEnd;

  this.transition({
    from: options.visibleStyle,
    to: options.hiddenStyle,
    // keep hidden stuff hidden
    isCleaning: true,
    onTransitionEnd: onTransitionEnd
  });
};

proto.onHideTransitionEnd = function() {
  // check if still hidden
  // during transition, item may have been un-hidden
  if ( this.isHidden ) {
    this.css({ display: 'none' });
    this.emitEvent('hide');
  }
};

proto.destroy = function() {
  this.css({
    position: '',
    left: '',
    right: '',
    top: '',
    bottom: '',
    transition: '',
    transform: ''
  });
};

return Item;

}));

/*!
 * Outlayer v2.1.0
 * the brains and guts of a layout library
 * MIT license
 */

( function( window, factory ) {
  'use strict';
  // universal module definition
  /* jshint strict: false */ /* globals define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD - RequireJS
    define( 'outlayer/outlayer',[
        'ev-emitter/ev-emitter',
        'get-size/get-size',
        'fizzy-ui-utils/utils',
        './item'
      ],
      function( EvEmitter, getSize, utils, Item ) {
        return factory( window, EvEmitter, getSize, utils, Item);
      }
    );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS - Browserify, Webpack
    module.exports = factory(
      window,
      require('ev-emitter'),
      require('get-size'),
      require('fizzy-ui-utils'),
      require('./item')
    );
  } else {
    // browser global
    window.Outlayer = factory(
      window,
      window.EvEmitter,
      window.getSize,
      window.fizzyUIUtils,
      window.Outlayer.Item
    );
  }

}( window, function factory( window, EvEmitter, getSize, utils, Item ) {
'use strict';

// ----- vars ----- //

var console = window.console;
var jQuery = window.jQuery;
var noop = function() {};

// -------------------------- Outlayer -------------------------- //

// globally unique identifiers
var GUID = 0;
// internal store of all Outlayer intances
var instances = {};


/**
 * @param {Element, String} element
 * @param {Object} options
 * @constructor
 */
function Outlayer( element, options ) {
  var queryElement = utils.getQueryElement( element );
  if ( !queryElement ) {
    if ( console ) {
      console.error( 'Bad element for ' + this.constructor.namespace +
        ': ' + ( queryElement || element ) );
    }
    return;
  }
  this.element = queryElement;
  // add jQuery
  if ( jQuery ) {
    this.$element = jQuery( this.element );
  }

  // options
  this.options = utils.extend( {}, this.constructor.defaults );
  this.option( options );

  // add id for Outlayer.getFromElement
  var id = ++GUID;
  this.element.outlayerGUID = id; // expando
  instances[ id ] = this; // associate via id

  // kick it off
  this._create();

  var isInitLayout = this._getOption('initLayout');
  if ( isInitLayout ) {
    this.layout();
  }
}

// settings are for internal use only
Outlayer.namespace = 'outlayer';
Outlayer.Item = Item;

// default options
Outlayer.defaults = {
  containerStyle: {
    position: 'relative'
  },
  initLayout: true,
  originLeft: true,
  originTop: true,
  resize: true,
  resizeContainer: true,
  // item options
  transitionDuration: '0.4s',
  hiddenStyle: {
    opacity: 0,
    transform: 'scale(0.001)'
  },
  visibleStyle: {
    opacity: 1,
    transform: 'scale(1)'
  }
};

var proto = Outlayer.prototype;
// inherit EvEmitter
utils.extend( proto, EvEmitter.prototype );

/**
 * set options
 * @param {Object} opts
 */
proto.option = function( opts ) {
  utils.extend( this.options, opts );
};

/**
 * get backwards compatible option value, check old name
 */
proto._getOption = function( option ) {
  var oldOption = this.constructor.compatOptions[ option ];
  return oldOption && this.options[ oldOption ] !== undefined ?
    this.options[ oldOption ] : this.options[ option ];
};

Outlayer.compatOptions = {
  // currentName: oldName
  initLayout: 'isInitLayout',
  horizontal: 'isHorizontal',
  layoutInstant: 'isLayoutInstant',
  originLeft: 'isOriginLeft',
  originTop: 'isOriginTop',
  resize: 'isResizeBound',
  resizeContainer: 'isResizingContainer'
};

proto._create = function() {
  // get items from children
  this.reloadItems();
  // elements that affect layout, but are not laid out
  this.stamps = [];
  this.stamp( this.options.stamp );
  // set container style
  utils.extend( this.element.style, this.options.containerStyle );

  // bind resize method
  var canBindResize = this._getOption('resize');
  if ( canBindResize ) {
    this.bindResize();
  }
};

// goes through all children again and gets bricks in proper order
proto.reloadItems = function() {
  // collection of item elements
  this.items = this._itemize( this.element.children );
};


/**
 * turn elements into Outlayer.Items to be used in layout
 * @param {Array or NodeList or HTMLElement} elems
 * @returns {Array} items - collection of new Outlayer Items
 */
proto._itemize = function( elems ) {

  var itemElems = this._filterFindItemElements( elems );
  var Item = this.constructor.Item;

  // create new Outlayer Items for collection
  var items = [];
  for ( var i=0; i < itemElems.length; i++ ) {
    var elem = itemElems[i];
    var item = new Item( elem, this );
    items.push( item );
  }

  return items;
};

/**
 * get item elements to be used in layout
 * @param {Array or NodeList or HTMLElement} elems
 * @returns {Array} items - item elements
 */
proto._filterFindItemElements = function( elems ) {
  return utils.filterFindElements( elems, this.options.itemSelector );
};

/**
 * getter method for getting item elements
 * @returns {Array} elems - collection of item elements
 */
proto.getItemElements = function() {
  return this.items.map( function( item ) {
    return item.element;
  });
};

// ----- init & layout ----- //

/**
 * lays out all items
 */
proto.layout = function() {
  this._resetLayout();
  this._manageStamps();

  // don't animate first layout
  var layoutInstant = this._getOption('layoutInstant');
  var isInstant = layoutInstant !== undefined ?
    layoutInstant : !this._isLayoutInited;
  this.layoutItems( this.items, isInstant );

  // flag for initalized
  this._isLayoutInited = true;
};

// _init is alias for layout
proto._init = proto.layout;

/**
 * logic before any new layout
 */
proto._resetLayout = function() {
  this.getSize();
};


proto.getSize = function() {
  this.size = getSize( this.element );
};

/**
 * get measurement from option, for columnWidth, rowHeight, gutter
 * if option is String -> get element from selector string, & get size of element
 * if option is Element -> get size of element
 * else use option as a number
 *
 * @param {String} measurement
 * @param {String} size - width or height
 * @private
 */
proto._getMeasurement = function( measurement, size ) {
  var option = this.options[ measurement ];
  var elem;
  if ( !option ) {
    // default to 0
    this[ measurement ] = 0;
  } else {
    // use option as an element
    if ( typeof option == 'string' ) {
      elem = this.element.querySelector( option );
    } else if ( option instanceof HTMLElement ) {
      elem = option;
    }
    // use size of element, if element
    this[ measurement ] = elem ? getSize( elem )[ size ] : option;
  }
};

/**
 * layout a collection of item elements
 * @api public
 */
proto.layoutItems = function( items, isInstant ) {
  items = this._getItemsForLayout( items );

  this._layoutItems( items, isInstant );

  this._postLayout();
};

/**
 * get the items to be laid out
 * you may want to skip over some items
 * @param {Array} items
 * @returns {Array} items
 */
proto._getItemsForLayout = function( items ) {
  return items.filter( function( item ) {
    return !item.isIgnored;
  });
};

/**
 * layout items
 * @param {Array} items
 * @param {Boolean} isInstant
 */
proto._layoutItems = function( items, isInstant ) {
  this._emitCompleteOnItems( 'layout', items );

  if ( !items || !items.length ) {
    // no items, emit event with empty array
    return;
  }

  var queue = [];

  items.forEach( function( item ) {
    // get x/y object from method
    var position = this._getItemLayoutPosition( item );
    // enqueue
    position.item = item;
    position.isInstant = isInstant || item.isLayoutInstant;
    queue.push( position );
  }, this );

  this._processLayoutQueue( queue );
};

/**
 * get item layout position
 * @param {Outlayer.Item} item
 * @returns {Object} x and y position
 */
proto._getItemLayoutPosition = function( /* item */ ) {
  return {
    x: 0,
    y: 0
  };
};

/**
 * iterate over array and position each item
 * Reason being - separating this logic prevents 'layout invalidation'
 * thx @paul_irish
 * @param {Array} queue
 */
proto._processLayoutQueue = function( queue ) {
  this.updateStagger();
  queue.forEach( function( obj, i ) {
    this._positionItem( obj.item, obj.x, obj.y, obj.isInstant, i );
  }, this );
};

// set stagger from option in milliseconds number
proto.updateStagger = function() {
  var stagger = this.options.stagger;
  if ( stagger === null || stagger === undefined ) {
    this.stagger = 0;
    return;
  }
  this.stagger = getMilliseconds( stagger );
  return this.stagger;
};

/**
 * Sets position of item in DOM
 * @param {Outlayer.Item} item
 * @param {Number} x - horizontal position
 * @param {Number} y - vertical position
 * @param {Boolean} isInstant - disables transitions
 */
proto._positionItem = function( item, x, y, isInstant, i ) {
  if ( isInstant ) {
    // if not transition, just set CSS
    item.goTo( x, y );
  } else {
    item.stagger( i * this.stagger );
    item.moveTo( x, y );
  }
};

/**
 * Any logic you want to do after each layout,
 * i.e. size the container
 */
proto._postLayout = function() {
  this.resizeContainer();
};

proto.resizeContainer = function() {
  var isResizingContainer = this._getOption('resizeContainer');
  if ( !isResizingContainer ) {
    return;
  }
  var size = this._getContainerSize();
  if ( size ) {
    this._setContainerMeasure( size.width, true );
    this._setContainerMeasure( size.height, false );
  }
};

/**
 * Sets width or height of container if returned
 * @returns {Object} size
 *   @param {Number} width
 *   @param {Number} height
 */
proto._getContainerSize = noop;

/**
 * @param {Number} measure - size of width or height
 * @param {Boolean} isWidth
 */
proto._setContainerMeasure = function( measure, isWidth ) {
  if ( measure === undefined ) {
    return;
  }

  var elemSize = this.size;
  // add padding and border width if border box
  if ( elemSize.isBorderBox ) {
    measure += isWidth ? elemSize.paddingLeft + elemSize.paddingRight +
      elemSize.borderLeftWidth + elemSize.borderRightWidth :
      elemSize.paddingBottom + elemSize.paddingTop +
      elemSize.borderTopWidth + elemSize.borderBottomWidth;
  }

  measure = Math.max( measure, 0 );
  this.element.style[ isWidth ? 'width' : 'height' ] = measure + 'px';
};

/**
 * emit eventComplete on a collection of items events
 * @param {String} eventName
 * @param {Array} items - Outlayer.Items
 */
proto._emitCompleteOnItems = function( eventName, items ) {
  var _this = this;
  function onComplete() {
    _this.dispatchEvent( eventName + 'Complete', null, [ items ] );
  }

  var count = items.length;
  if ( !items || !count ) {
    onComplete();
    return;
  }

  var doneCount = 0;
  function tick() {
    doneCount++;
    if ( doneCount == count ) {
      onComplete();
    }
  }

  // bind callback
  items.forEach( function( item ) {
    item.once( eventName, tick );
  });
};

/**
 * emits events via EvEmitter and jQuery events
 * @param {String} type - name of event
 * @param {Event} event - original event
 * @param {Array} args - extra arguments
 */
proto.dispatchEvent = function( type, event, args ) {
  // add original event to arguments
  var emitArgs = event ? [ event ].concat( args ) : args;
  this.emitEvent( type, emitArgs );

  if ( jQuery ) {
    // set this.$element
    this.$element = this.$element || jQuery( this.element );
    if ( event ) {
      // create jQuery event
      var $event = jQuery.Event( event );
      $event.type = type;
      this.$element.trigger( $event, args );
    } else {
      // just trigger with type if no event available
      this.$element.trigger( type, args );
    }
  }
};

// -------------------------- ignore & stamps -------------------------- //


/**
 * keep item in collection, but do not lay it out
 * ignored items do not get skipped in layout
 * @param {Element} elem
 */
proto.ignore = function( elem ) {
  var item = this.getItem( elem );
  if ( item ) {
    item.isIgnored = true;
  }
};

/**
 * return item to layout collection
 * @param {Element} elem
 */
proto.unignore = function( elem ) {
  var item = this.getItem( elem );
  if ( item ) {
    delete item.isIgnored;
  }
};

/**
 * adds elements to stamps
 * @param {NodeList, Array, Element, or String} elems
 */
proto.stamp = function( elems ) {
  elems = this._find( elems );
  if ( !elems ) {
    return;
  }

  this.stamps = this.stamps.concat( elems );
  // ignore
  elems.forEach( this.ignore, this );
};

/**
 * removes elements to stamps
 * @param {NodeList, Array, or Element} elems
 */
proto.unstamp = function( elems ) {
  elems = this._find( elems );
  if ( !elems ){
    return;
  }

  elems.forEach( function( elem ) {
    // filter out removed stamp elements
    utils.removeFrom( this.stamps, elem );
    this.unignore( elem );
  }, this );
};

/**
 * finds child elements
 * @param {NodeList, Array, Element, or String} elems
 * @returns {Array} elems
 */
proto._find = function( elems ) {
  if ( !elems ) {
    return;
  }
  // if string, use argument as selector string
  if ( typeof elems == 'string' ) {
    elems = this.element.querySelectorAll( elems );
  }
  elems = utils.makeArray( elems );
  return elems;
};

proto._manageStamps = function() {
  if ( !this.stamps || !this.stamps.length ) {
    return;
  }

  this._getBoundingRect();

  this.stamps.forEach( this._manageStamp, this );
};

// update boundingLeft / Top
proto._getBoundingRect = function() {
  // get bounding rect for container element
  var boundingRect = this.element.getBoundingClientRect();
  var size = this.size;
  this._boundingRect = {
    left: boundingRect.left + size.paddingLeft + size.borderLeftWidth,
    top: boundingRect.top + size.paddingTop + size.borderTopWidth,
    right: boundingRect.right - ( size.paddingRight + size.borderRightWidth ),
    bottom: boundingRect.bottom - ( size.paddingBottom + size.borderBottomWidth )
  };
};

/**
 * @param {Element} stamp
**/
proto._manageStamp = noop;

/**
 * get x/y position of element relative to container element
 * @param {Element} elem
 * @returns {Object} offset - has left, top, right, bottom
 */
proto._getElementOffset = function( elem ) {
  var boundingRect = elem.getBoundingClientRect();
  var thisRect = this._boundingRect;
  var size = getSize( elem );
  var offset = {
    left: boundingRect.left - thisRect.left - size.marginLeft,
    top: boundingRect.top - thisRect.top - size.marginTop,
    right: thisRect.right - boundingRect.right - size.marginRight,
    bottom: thisRect.bottom - boundingRect.bottom - size.marginBottom
  };
  return offset;
};

// -------------------------- resize -------------------------- //

// enable event handlers for listeners
// i.e. resize -> onresize
proto.handleEvent = utils.handleEvent;

/**
 * Bind layout to window resizing
 */
proto.bindResize = function() {
  window.addEventListener( 'resize', this );
  this.isResizeBound = true;
};

/**
 * Unbind layout to window resizing
 */
proto.unbindResize = function() {
  window.removeEventListener( 'resize', this );
  this.isResizeBound = false;
};

proto.onresize = function() {
  this.resize();
};

utils.debounceMethod( Outlayer, 'onresize', 100 );

proto.resize = function() {
  // don't trigger if size did not change
  // or if resize was unbound. See #9
  if ( !this.isResizeBound || !this.needsResizeLayout() ) {
    return;
  }

  this.layout();
};

/**
 * check if layout is needed post layout
 * @returns Boolean
 */
proto.needsResizeLayout = function() {
  var size = getSize( this.element );
  // check that this.size and size are there
  // IE8 triggers resize on body size change, so they might not be
  var hasSizes = this.size && size;
  return hasSizes && size.innerWidth !== this.size.innerWidth;
};

// -------------------------- methods -------------------------- //

/**
 * add items to Outlayer instance
 * @param {Array or NodeList or Element} elems
 * @returns {Array} items - Outlayer.Items
**/
proto.addItems = function( elems ) {
  var items = this._itemize( elems );
  // add items to collection
  if ( items.length ) {
    this.items = this.items.concat( items );
  }
  return items;
};

/**
 * Layout newly-appended item elements
 * @param {Array or NodeList or Element} elems
 */
proto.appended = function( elems ) {
  var items = this.addItems( elems );
  if ( !items.length ) {
    return;
  }
  // layout and reveal just the new items
  this.layoutItems( items, true );
  this.reveal( items );
};

/**
 * Layout prepended elements
 * @param {Array or NodeList or Element} elems
 */
proto.prepended = function( elems ) {
  var items = this._itemize( elems );
  if ( !items.length ) {
    return;
  }
  // add items to beginning of collection
  var previousItems = this.items.slice(0);
  this.items = items.concat( previousItems );
  // start new layout
  this._resetLayout();
  this._manageStamps();
  // layout new stuff without transition
  this.layoutItems( items, true );
  this.reveal( items );
  // layout previous items
  this.layoutItems( previousItems );
};

/**
 * reveal a collection of items
 * @param {Array of Outlayer.Items} items
 */
proto.reveal = function( items ) {
  this._emitCompleteOnItems( 'reveal', items );
  if ( !items || !items.length ) {
    return;
  }
  var stagger = this.updateStagger();
  items.forEach( function( item, i ) {
    item.stagger( i * stagger );
    item.reveal();
  });
};

/**
 * hide a collection of items
 * @param {Array of Outlayer.Items} items
 */
proto.hide = function( items ) {
  this._emitCompleteOnItems( 'hide', items );
  if ( !items || !items.length ) {
    return;
  }
  var stagger = this.updateStagger();
  items.forEach( function( item, i ) {
    item.stagger( i * stagger );
    item.hide();
  });
};

/**
 * reveal item elements
 * @param {Array}, {Element}, {NodeList} items
 */
proto.revealItemElements = function( elems ) {
  var items = this.getItems( elems );
  this.reveal( items );
};

/**
 * hide item elements
 * @param {Array}, {Element}, {NodeList} items
 */
proto.hideItemElements = function( elems ) {
  var items = this.getItems( elems );
  this.hide( items );
};

/**
 * get Outlayer.Item, given an Element
 * @param {Element} elem
 * @param {Function} callback
 * @returns {Outlayer.Item} item
 */
proto.getItem = function( elem ) {
  // loop through items to get the one that matches
  for ( var i=0; i < this.items.length; i++ ) {
    var item = this.items[i];
    if ( item.element == elem ) {
      // return item
      return item;
    }
  }
};

/**
 * get collection of Outlayer.Items, given Elements
 * @param {Array} elems
 * @returns {Array} items - Outlayer.Items
 */
proto.getItems = function( elems ) {
  elems = utils.makeArray( elems );
  var items = [];
  elems.forEach( function( elem ) {
    var item = this.getItem( elem );
    if ( item ) {
      items.push( item );
    }
  }, this );

  return items;
};

/**
 * remove element(s) from instance and DOM
 * @param {Array or NodeList or Element} elems
 */
proto.remove = function( elems ) {
  var removeItems = this.getItems( elems );

  this._emitCompleteOnItems( 'remove', removeItems );

  // bail if no items to remove
  if ( !removeItems || !removeItems.length ) {
    return;
  }

  removeItems.forEach( function( item ) {
    item.remove();
    // remove item from collection
    utils.removeFrom( this.items, item );
  }, this );
};

// ----- destroy ----- //

// remove and disable Outlayer instance
proto.destroy = function() {
  // clean up dynamic styles
  var style = this.element.style;
  style.height = '';
  style.position = '';
  style.width = '';
  // destroy items
  this.items.forEach( function( item ) {
    item.destroy();
  });

  this.unbindResize();

  var id = this.element.outlayerGUID;
  delete instances[ id ]; // remove reference to instance by id
  delete this.element.outlayerGUID;
  // remove data for jQuery
  if ( jQuery ) {
    jQuery.removeData( this.element, this.constructor.namespace );
  }

};

// -------------------------- data -------------------------- //

/**
 * get Outlayer instance from element
 * @param {Element} elem
 * @returns {Outlayer}
 */
Outlayer.data = function( elem ) {
  elem = utils.getQueryElement( elem );
  var id = elem && elem.outlayerGUID;
  return id && instances[ id ];
};


// -------------------------- create Outlayer class -------------------------- //

/**
 * create a layout class
 * @param {String} namespace
 */
Outlayer.create = function( namespace, options ) {
  // sub-class Outlayer
  var Layout = subclass( Outlayer );
  // apply new options and compatOptions
  Layout.defaults = utils.extend( {}, Outlayer.defaults );
  utils.extend( Layout.defaults, options );
  Layout.compatOptions = utils.extend( {}, Outlayer.compatOptions  );

  Layout.namespace = namespace;

  Layout.data = Outlayer.data;

  // sub-class Item
  Layout.Item = subclass( Item );

  // -------------------------- declarative -------------------------- //

  utils.htmlInit( Layout, namespace );

  // -------------------------- jQuery bridge -------------------------- //

  // make into jQuery plugin
  if ( jQuery && jQuery.bridget ) {
    jQuery.bridget( namespace, Layout );
  }

  return Layout;
};

function subclass( Parent ) {
  function SubClass() {
    Parent.apply( this, arguments );
  }

  SubClass.prototype = Object.create( Parent.prototype );
  SubClass.prototype.constructor = SubClass;

  return SubClass;
}

// ----- helpers ----- //

// how many milliseconds are in each unit
var msUnits = {
  ms: 1,
  s: 1000
};

// munge time-like parameter into millisecond number
// '0.4s' -> 40
function getMilliseconds( time ) {
  if ( typeof time == 'number' ) {
    return time;
  }
  var matches = time.match( /(^\d*\.?\d*)(\w*)/ );
  var num = matches && matches[1];
  var unit = matches && matches[2];
  if ( !num.length ) {
    return 0;
  }
  num = parseFloat( num );
  var mult = msUnits[ unit ] || 1;
  return num * mult;
}

// ----- fin ----- //

// back in global
Outlayer.Item = Item;

return Outlayer;

}));

/**
 * Isotope Item
**/

( function( window, factory ) {
  // universal module definition
  /* jshint strict: false */ /*globals define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( 'isotope/js/item',[
        'outlayer/outlayer'
      ],
      factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      require('outlayer')
    );
  } else {
    // browser global
    window.Isotope = window.Isotope || {};
    window.Isotope.Item = factory(
      window.Outlayer
    );
  }

}( window, function factory( Outlayer ) {
'use strict';

// -------------------------- Item -------------------------- //

// sub-class Outlayer Item
function Item() {
  Outlayer.Item.apply( this, arguments );
}

var proto = Item.prototype = Object.create( Outlayer.Item.prototype );

var _create = proto._create;
proto._create = function() {
  // assign id, used for original-order sorting
  this.id = this.layout.itemGUID++;
  _create.call( this );
  this.sortData = {};
};

proto.updateSortData = function() {
  if ( this.isIgnored ) {
    return;
  }
  // default sorters
  this.sortData.id = this.id;
  // for backward compatibility
  this.sortData['original-order'] = this.id;
  this.sortData.random = Math.random();
  // go thru getSortData obj and apply the sorters
  var getSortData = this.layout.options.getSortData;
  var sorters = this.layout._sorters;
  for ( var key in getSortData ) {
    var sorter = sorters[ key ];
    this.sortData[ key ] = sorter( this.element, this );
  }
};

var _destroy = proto.destroy;
proto.destroy = function() {
  // call super
  _destroy.apply( this, arguments );
  // reset display, #741
  this.css({
    display: ''
  });
};

return Item;

}));

/**
 * Isotope LayoutMode
 */

( function( window, factory ) {
  // universal module definition
  /* jshint strict: false */ /*globals define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( 'isotope/js/layout-mode',[
        'get-size/get-size',
        'outlayer/outlayer'
      ],
      factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      require('get-size'),
      require('outlayer')
    );
  } else {
    // browser global
    window.Isotope = window.Isotope || {};
    window.Isotope.LayoutMode = factory(
      window.getSize,
      window.Outlayer
    );
  }

}( window, function factory( getSize, Outlayer ) {
  'use strict';

  // layout mode class
  function LayoutMode( isotope ) {
    this.isotope = isotope;
    // link properties
    if ( isotope ) {
      this.options = isotope.options[ this.namespace ];
      this.element = isotope.element;
      this.items = isotope.filteredItems;
      this.size = isotope.size;
    }
  }

  var proto = LayoutMode.prototype;

  /**
   * some methods should just defer to default Outlayer method
   * and reference the Isotope instance as `this`
  **/
  var facadeMethods = [
    '_resetLayout',
    '_getItemLayoutPosition',
    '_manageStamp',
    '_getContainerSize',
    '_getElementOffset',
    'needsResizeLayout',
    '_getOption'
  ];

  facadeMethods.forEach( function( methodName ) {
    proto[ methodName ] = function() {
      return Outlayer.prototype[ methodName ].apply( this.isotope, arguments );
    };
  });

  // -----  ----- //

  // for horizontal layout modes, check vertical size
  proto.needsVerticalResizeLayout = function() {
    // don't trigger if size did not change
    var size = getSize( this.isotope.element );
    // check that this.size and size are there
    // IE8 triggers resize on body size change, so they might not be
    var hasSizes = this.isotope.size && size;
    return hasSizes && size.innerHeight != this.isotope.size.innerHeight;
  };

  // ----- measurements ----- //

  proto._getMeasurement = function() {
    this.isotope._getMeasurement.apply( this, arguments );
  };

  proto.getColumnWidth = function() {
    this.getSegmentSize( 'column', 'Width' );
  };

  proto.getRowHeight = function() {
    this.getSegmentSize( 'row', 'Height' );
  };

  /**
   * get columnWidth or rowHeight
   * segment: 'column' or 'row'
   * size 'Width' or 'Height'
  **/
  proto.getSegmentSize = function( segment, size ) {
    var segmentName = segment + size;
    var outerSize = 'outer' + size;
    // columnWidth / outerWidth // rowHeight / outerHeight
    this._getMeasurement( segmentName, outerSize );
    // got rowHeight or columnWidth, we can chill
    if ( this[ segmentName ] ) {
      return;
    }
    // fall back to item of first element
    var firstItemSize = this.getFirstItemSize();
    this[ segmentName ] = firstItemSize && firstItemSize[ outerSize ] ||
      // or size of container
      this.isotope.size[ 'inner' + size ];
  };

  proto.getFirstItemSize = function() {
    var firstItem = this.isotope.filteredItems[0];
    return firstItem && firstItem.element && getSize( firstItem.element );
  };

  // ----- methods that should reference isotope ----- //

  proto.layout = function() {
    this.isotope.layout.apply( this.isotope, arguments );
  };

  proto.getSize = function() {
    this.isotope.getSize();
    this.size = this.isotope.size;
  };

  // -------------------------- create -------------------------- //

  LayoutMode.modes = {};

  LayoutMode.create = function( namespace, options ) {

    function Mode() {
      LayoutMode.apply( this, arguments );
    }

    Mode.prototype = Object.create( proto );
    Mode.prototype.constructor = Mode;

    // default options
    if ( options ) {
      Mode.options = options;
    }

    Mode.prototype.namespace = namespace;
    // register in Isotope
    LayoutMode.modes[ namespace ] = Mode;

    return Mode;
  };

  return LayoutMode;

}));

/*!
 * Masonry v4.2.0
 * Cascading grid layout library
 * http://masonry.desandro.com
 * MIT License
 * by David DeSandro
 */

( function( window, factory ) {
  // universal module definition
  /* jshint strict: false */ /*globals define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( 'masonry/masonry',[
        'outlayer/outlayer',
        'get-size/get-size'
      ],
      factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      require('outlayer'),
      require('get-size')
    );
  } else {
    // browser global
    window.Masonry = factory(
      window.Outlayer,
      window.getSize
    );
  }

}( window, function factory( Outlayer, getSize ) {



// -------------------------- masonryDefinition -------------------------- //

  // create an Outlayer layout class
  var Masonry = Outlayer.create('masonry');
  // isFitWidth -> fitWidth
  Masonry.compatOptions.fitWidth = 'isFitWidth';

  var proto = Masonry.prototype;

  proto._resetLayout = function() {
    this.getSize();
    this._getMeasurement( 'columnWidth', 'outerWidth' );
    this._getMeasurement( 'gutter', 'outerWidth' );
    this.measureColumns();

    // reset column Y
    this.colYs = [];
    for ( var i=0; i < this.cols; i++ ) {
      this.colYs.push( 0 );
    }

    this.maxY = 0;
    this.horizontalColIndex = 0;
  };

  proto.measureColumns = function() {
    this.getContainerWidth();
    // if columnWidth is 0, default to outerWidth of first item
    if ( !this.columnWidth ) {
      var firstItem = this.items[0];
      var firstItemElem = firstItem && firstItem.element;
      // columnWidth fall back to item of first element
      this.columnWidth = firstItemElem && getSize( firstItemElem ).outerWidth ||
        // if first elem has no width, default to size of container
        this.containerWidth;
    }

    var columnWidth = this.columnWidth += this.gutter;

    // calculate columns
    var containerWidth = this.containerWidth + this.gutter;
    var cols = containerWidth / columnWidth;
    // fix rounding errors, typically with gutters
    var excess = columnWidth - containerWidth % columnWidth;
    // if overshoot is less than a pixel, round up, otherwise floor it
    var mathMethod = excess && excess < 1 ? 'round' : 'floor';
    cols = Math[ mathMethod ]( cols );
    this.cols = Math.max( cols, 1 );
  };

  proto.getContainerWidth = function() {
    // container is parent if fit width
    var isFitWidth = this._getOption('fitWidth');
    var container = isFitWidth ? this.element.parentNode : this.element;
    // check that this.size and size are there
    // IE8 triggers resize on body size change, so they might not be
    var size = getSize( container );
    this.containerWidth = size && size.innerWidth;
  };

  proto._getItemLayoutPosition = function( item ) {
    item.getSize();
    // how many columns does this brick span
    var remainder = item.size.outerWidth % this.columnWidth;
    var mathMethod = remainder && remainder < 1 ? 'round' : 'ceil';
    // round if off by 1 pixel, otherwise use ceil
    var colSpan = Math[ mathMethod ]( item.size.outerWidth / this.columnWidth );
    colSpan = Math.min( colSpan, this.cols );
    // use horizontal or top column position
    var colPosMethod = this.options.horizontalOrder ?
      '_getHorizontalColPosition' : '_getTopColPosition';
    var colPosition = this[ colPosMethod ]( colSpan, item );
    // position the brick
    var position = {
      x: this.columnWidth * colPosition.col,
      y: colPosition.y
    };
    // apply setHeight to necessary columns
    var setHeight = colPosition.y + item.size.outerHeight;
    var setMax = colSpan + colPosition.col;
    for ( var i = colPosition.col; i < setMax; i++ ) {
      this.colYs[i] = setHeight;
    }

    return position;
  };

  proto._getTopColPosition = function( colSpan ) {
    var colGroup = this._getTopColGroup( colSpan );
    // get the minimum Y value from the columns
    var minimumY = Math.min.apply( Math, colGroup );

    return {
      col: colGroup.indexOf( minimumY ),
      y: minimumY,
    };
  };

  /**
   * @param {Number} colSpan - number of columns the element spans
   * @returns {Array} colGroup
   */
  proto._getTopColGroup = function( colSpan ) {
    if ( colSpan < 2 ) {
      // if brick spans only one column, use all the column Ys
      return this.colYs;
    }

    var colGroup = [];
    // how many different places could this brick fit horizontally
    var groupCount = this.cols + 1 - colSpan;
    // for each group potential horizontal position
    for ( var i = 0; i < groupCount; i++ ) {
      colGroup[i] = this._getColGroupY( i, colSpan );
    }
    return colGroup;
  };

  proto._getColGroupY = function( col, colSpan ) {
    if ( colSpan < 2 ) {
      return this.colYs[ col ];
    }
    // make an array of colY values for that one group
    var groupColYs = this.colYs.slice( col, col + colSpan );
    // and get the max value of the array
    return Math.max.apply( Math, groupColYs );
  };

  // get column position based on horizontal index. #873
  proto._getHorizontalColPosition = function( colSpan, item ) {
    var col = this.horizontalColIndex % this.cols;
    var isOver = colSpan > 1 && col + colSpan > this.cols;
    // shift to next row if item can't fit on current row
    col = isOver ? 0 : col;
    // don't let zero-size items take up space
    var hasSize = item.size.outerWidth && item.size.outerHeight;
    this.horizontalColIndex = hasSize ? col + colSpan : this.horizontalColIndex;

    return {
      col: col,
      y: this._getColGroupY( col, colSpan ),
    };
  };

  proto._manageStamp = function( stamp ) {
    var stampSize = getSize( stamp );
    var offset = this._getElementOffset( stamp );
    // get the columns that this stamp affects
    var isOriginLeft = this._getOption('originLeft');
    var firstX = isOriginLeft ? offset.left : offset.right;
    var lastX = firstX + stampSize.outerWidth;
    var firstCol = Math.floor( firstX / this.columnWidth );
    firstCol = Math.max( 0, firstCol );
    var lastCol = Math.floor( lastX / this.columnWidth );
    // lastCol should not go over if multiple of columnWidth #425
    lastCol -= lastX % this.columnWidth ? 0 : 1;
    lastCol = Math.min( this.cols - 1, lastCol );
    // set colYs to bottom of the stamp

    var isOriginTop = this._getOption('originTop');
    var stampMaxY = ( isOriginTop ? offset.top : offset.bottom ) +
      stampSize.outerHeight;
    for ( var i = firstCol; i <= lastCol; i++ ) {
      this.colYs[i] = Math.max( stampMaxY, this.colYs[i] );
    }
  };

  proto._getContainerSize = function() {
    this.maxY = Math.max.apply( Math, this.colYs );
    var size = {
      height: this.maxY
    };

    if ( this._getOption('fitWidth') ) {
      size.width = this._getContainerFitWidth();
    }

    return size;
  };

  proto._getContainerFitWidth = function() {
    var unusedCols = 0;
    // count unused columns
    var i = this.cols;
    while ( --i ) {
      if ( this.colYs[i] !== 0 ) {
        break;
      }
      unusedCols++;
    }
    // fit container to columns that have been used
    return ( this.cols - unusedCols ) * this.columnWidth - this.gutter;
  };

  proto.needsResizeLayout = function() {
    var previousWidth = this.containerWidth;
    this.getContainerWidth();
    return previousWidth != this.containerWidth;
  };

  return Masonry;

}));

/*!
 * Masonry layout mode
 * sub-classes Masonry
 * http://masonry.desandro.com
 */

( function( window, factory ) {
  // universal module definition
  /* jshint strict: false */ /*globals define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( 'isotope/js/layout-modes/masonry',[
        '../layout-mode',
        'masonry/masonry'
      ],
      factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      require('../layout-mode'),
      require('masonry-layout')
    );
  } else {
    // browser global
    factory(
      window.Isotope.LayoutMode,
      window.Masonry
    );
  }

}( window, function factory( LayoutMode, Masonry ) {
'use strict';

// -------------------------- masonryDefinition -------------------------- //

  // create an Outlayer layout class
  var MasonryMode = LayoutMode.create('masonry');

  var proto = MasonryMode.prototype;

  var keepModeMethods = {
    _getElementOffset: true,
    layout: true,
    _getMeasurement: true
  };

  // inherit Masonry prototype
  for ( var method in Masonry.prototype ) {
    // do not inherit mode methods
    if ( !keepModeMethods[ method ] ) {
      proto[ method ] = Masonry.prototype[ method ];
    }
  }

  var measureColumns = proto.measureColumns;
  proto.measureColumns = function() {
    // set items, used if measuring first item
    this.items = this.isotope.filteredItems;
    measureColumns.call( this );
  };

  // point to mode options for fitWidth
  var _getOption = proto._getOption;
  proto._getOption = function( option ) {
    if ( option == 'fitWidth' ) {
      return this.options.isFitWidth !== undefined ?
        this.options.isFitWidth : this.options.fitWidth;
    }
    return _getOption.apply( this.isotope, arguments );
  };

  return MasonryMode;

}));

/**
 * fitRows layout mode
 */

( function( window, factory ) {
  // universal module definition
  /* jshint strict: false */ /*globals define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( 'isotope/js/layout-modes/fit-rows',[
        '../layout-mode'
      ],
      factory );
  } else if ( typeof exports == 'object' ) {
    // CommonJS
    module.exports = factory(
      require('../layout-mode')
    );
  } else {
    // browser global
    factory(
      window.Isotope.LayoutMode
    );
  }

}( window, function factory( LayoutMode ) {
'use strict';

var FitRows = LayoutMode.create('fitRows');

var proto = FitRows.prototype;

proto._resetLayout = function() {
  this.x = 0;
  this.y = 0;
  this.maxY = 0;
  this._getMeasurement( 'gutter', 'outerWidth' );
};

proto._getItemLayoutPosition = function( item ) {
  item.getSize();

  var itemWidth = item.size.outerWidth + this.gutter;
  // if this element cannot fit in the current row
  var containerWidth = this.isotope.size.innerWidth + this.gutter;
  if ( this.x !== 0 && itemWidth + this.x > containerWidth ) {
    this.x = 0;
    this.y = this.maxY;
  }

  var position = {
    x: this.x,
    y: this.y
  };

  this.maxY = Math.max( this.maxY, this.y + item.size.outerHeight );
  this.x += itemWidth;

  return position;
};

proto._getContainerSize = function() {
  return { height: this.maxY };
};

return FitRows;

}));

/**
 * vertical layout mode
 */

( function( window, factory ) {
  // universal module definition
  /* jshint strict: false */ /*globals define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( 'isotope/js/layout-modes/vertical',[
        '../layout-mode'
      ],
      factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      require('../layout-mode')
    );
  } else {
    // browser global
    factory(
      window.Isotope.LayoutMode
    );
  }

}( window, function factory( LayoutMode ) {
'use strict';

var Vertical = LayoutMode.create( 'vertical', {
  horizontalAlignment: 0
});

var proto = Vertical.prototype;

proto._resetLayout = function() {
  this.y = 0;
};

proto._getItemLayoutPosition = function( item ) {
  item.getSize();
  var x = ( this.isotope.size.innerWidth - item.size.outerWidth ) *
    this.options.horizontalAlignment;
  var y = this.y;
  this.y += item.size.outerHeight;
  return { x: x, y: y };
};

proto._getContainerSize = function() {
  return { height: this.y };
};

return Vertical;

}));

/*!
 * Isotope v3.0.4
 *
 * Licensed GPLv3 for open source use
 * or Isotope Commercial License for commercial use
 *
 * http://isotope.metafizzy.co
 * Copyright 2017 Metafizzy
 */

( function( window, factory ) {
  // universal module definition
  /* jshint strict: false */ /*globals define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
        'outlayer/outlayer',
        'get-size/get-size',
        'desandro-matches-selector/matches-selector',
        'fizzy-ui-utils/utils',
        'isotope/js/item',
        'isotope/js/layout-mode',
        // include default layout modes
        'isotope/js/layout-modes/masonry',
        'isotope/js/layout-modes/fit-rows',
        'isotope/js/layout-modes/vertical'
      ],
      function( Outlayer, getSize, matchesSelector, utils, Item, LayoutMode ) {
        return factory( window, Outlayer, getSize, matchesSelector, utils, Item, LayoutMode );
      });
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      window,
      require('outlayer'),
      require('get-size'),
      require('desandro-matches-selector'),
      require('fizzy-ui-utils'),
      require('isotope/js/item'),
      require('isotope/js/layout-mode'),
      // include default layout modes
      require('isotope/js/layout-modes/masonry'),
      require('isotope/js/layout-modes/fit-rows'),
      require('isotope/js/layout-modes/vertical')
    );
  } else {
    // browser global
    window.Isotope = factory(
      window,
      window.Outlayer,
      window.getSize,
      window.matchesSelector,
      window.fizzyUIUtils,
      window.Isotope.Item,
      window.Isotope.LayoutMode
    );
  }

}( window, function factory( window, Outlayer, getSize, matchesSelector, utils,
  Item, LayoutMode ) {



// -------------------------- vars -------------------------- //

var jQuery = window.jQuery;

// -------------------------- helpers -------------------------- //

var trim = String.prototype.trim ?
  function( str ) {
    return str.trim();
  } :
  function( str ) {
    return str.replace( /^\s+|\s+$/g, '' );
  };

// -------------------------- isotopeDefinition -------------------------- //

  // create an Outlayer layout class
  var Isotope = Outlayer.create( 'isotope', {
    layoutMode: 'masonry',
    isJQueryFiltering: true,
    sortAscending: true
  });

  Isotope.Item = Item;
  Isotope.LayoutMode = LayoutMode;

  var proto = Isotope.prototype;

  proto._create = function() {
    this.itemGUID = 0;
    // functions that sort items
    this._sorters = {};
    this._getSorters();
    // call super
    Outlayer.prototype._create.call( this );

    // create layout modes
    this.modes = {};
    // start filteredItems with all items
    this.filteredItems = this.items;
    // keep of track of sortBys
    this.sortHistory = [ 'original-order' ];
    // create from registered layout modes
    for ( var name in LayoutMode.modes ) {
      this._initLayoutMode( name );
    }
  };

  proto.reloadItems = function() {
    // reset item ID counter
    this.itemGUID = 0;
    // call super
    Outlayer.prototype.reloadItems.call( this );
  };

  proto._itemize = function() {
    var items = Outlayer.prototype._itemize.apply( this, arguments );
    // assign ID for original-order
    for ( var i=0; i < items.length; i++ ) {
      var item = items[i];
      item.id = this.itemGUID++;
    }
    this._updateItemsSortData( items );
    return items;
  };


  // -------------------------- layout -------------------------- //

  proto._initLayoutMode = function( name ) {
    var Mode = LayoutMode.modes[ name ];
    // set mode options
    // HACK extend initial options, back-fill in default options
    var initialOpts = this.options[ name ] || {};
    this.options[ name ] = Mode.options ?
      utils.extend( Mode.options, initialOpts ) : initialOpts;
    // init layout mode instance
    this.modes[ name ] = new Mode( this );
  };


  proto.layout = function() {
    // if first time doing layout, do all magic
    if ( !this._isLayoutInited && this._getOption('initLayout') ) {
      this.arrange();
      return;
    }
    this._layout();
  };

  // private method to be used in layout() & magic()
  proto._layout = function() {
    // don't animate first layout
    var isInstant = this._getIsInstant();
    // layout flow
    this._resetLayout();
    this._manageStamps();
    this.layoutItems( this.filteredItems, isInstant );

    // flag for initalized
    this._isLayoutInited = true;
  };

  // filter + sort + layout
  proto.arrange = function( opts ) {
    // set any options pass
    this.option( opts );
    this._getIsInstant();
    // filter, sort, and layout

    // filter
    var filtered = this._filter( this.items );
    this.filteredItems = filtered.matches;

    this._bindArrangeComplete();

    if ( this._isInstant ) {
      this._noTransition( this._hideReveal, [ filtered ] );
    } else {
      this._hideReveal( filtered );
    }

    this._sort();
    this._layout();
  };
  // alias to _init for main plugin method
  proto._init = proto.arrange;

  proto._hideReveal = function( filtered ) {
    this.reveal( filtered.needReveal );
    this.hide( filtered.needHide );
  };

  // HACK
  // Don't animate/transition first layout
  // Or don't animate/transition other layouts
  proto._getIsInstant = function() {
    var isLayoutInstant = this._getOption('layoutInstant');
    var isInstant = isLayoutInstant !== undefined ? isLayoutInstant :
      !this._isLayoutInited;
    this._isInstant = isInstant;
    return isInstant;
  };

  // listen for layoutComplete, hideComplete and revealComplete
  // to trigger arrangeComplete
  proto._bindArrangeComplete = function() {
    // listen for 3 events to trigger arrangeComplete
    var isLayoutComplete, isHideComplete, isRevealComplete;
    var _this = this;
    function arrangeParallelCallback() {
      if ( isLayoutComplete && isHideComplete && isRevealComplete ) {
        _this.dispatchEvent( 'arrangeComplete', null, [ _this.filteredItems ] );
      }
    }
    this.once( 'layoutComplete', function() {
      isLayoutComplete = true;
      arrangeParallelCallback();
    });
    this.once( 'hideComplete', function() {
      isHideComplete = true;
      arrangeParallelCallback();
    });
    this.once( 'revealComplete', function() {
      isRevealComplete = true;
      arrangeParallelCallback();
    });
  };

  // -------------------------- filter -------------------------- //

  proto._filter = function( items ) {
    var filter = this.options.filter;
    filter = filter || '*';
    var matches = [];
    var hiddenMatched = [];
    var visibleUnmatched = [];

    var test = this._getFilterTest( filter );

    // test each item
    for ( var i=0; i < items.length; i++ ) {
      var item = items[i];
      if ( item.isIgnored ) {
        continue;
      }
      // add item to either matched or unmatched group
      var isMatched = test( item );
      // item.isFilterMatched = isMatched;
      // add to matches if its a match
      if ( isMatched ) {
        matches.push( item );
      }
      // add to additional group if item needs to be hidden or revealed
      if ( isMatched && item.isHidden ) {
        hiddenMatched.push( item );
      } else if ( !isMatched && !item.isHidden ) {
        visibleUnmatched.push( item );
      }
    }

    // return collections of items to be manipulated
    return {
      matches: matches,
      needReveal: hiddenMatched,
      needHide: visibleUnmatched
    };
  };

  // get a jQuery, function, or a matchesSelector test given the filter
  proto._getFilterTest = function( filter ) {
    if ( jQuery && this.options.isJQueryFiltering ) {
      // use jQuery
      return function( item ) {
        return jQuery( item.element ).is( filter );
      };
    }
    if ( typeof filter == 'function' ) {
      // use filter as function
      return function( item ) {
        return filter( item.element );
      };
    }
    // default, use filter as selector string
    return function( item ) {
      return matchesSelector( item.element, filter );
    };
  };

  // -------------------------- sorting -------------------------- //

  /**
   * @params {Array} elems
   * @public
   */
  proto.updateSortData = function( elems ) {
    // get items
    var items;
    if ( elems ) {
      elems = utils.makeArray( elems );
      items = this.getItems( elems );
    } else {
      // update all items if no elems provided
      items = this.items;
    }

    this._getSorters();
    this._updateItemsSortData( items );
  };

  proto._getSorters = function() {
    var getSortData = this.options.getSortData;
    for ( var key in getSortData ) {
      var sorter = getSortData[ key ];
      this._sorters[ key ] = mungeSorter( sorter );
    }
  };

  /**
   * @params {Array} items - of Isotope.Items
   * @private
   */
  proto._updateItemsSortData = function( items ) {
    // do not update if no items
    var len = items && items.length;

    for ( var i=0; len && i < len; i++ ) {
      var item = items[i];
      item.updateSortData();
    }
  };

  // ----- munge sorter ----- //

  // encapsulate this, as we just need mungeSorter
  // other functions in here are just for munging
  var mungeSorter = ( function() {
    // add a magic layer to sorters for convienent shorthands
    // `.foo-bar` will use the text of .foo-bar querySelector
    // `[foo-bar]` will use attribute
    // you can also add parser
    // `.foo-bar parseInt` will parse that as a number
    function mungeSorter( sorter ) {
      // if not a string, return function or whatever it is
      if ( typeof sorter != 'string' ) {
        return sorter;
      }
      // parse the sorter string
      var args = trim( sorter ).split(' ');
      var query = args[0];
      // check if query looks like [an-attribute]
      var attrMatch = query.match( /^\[(.+)\]$/ );
      var attr = attrMatch && attrMatch[1];
      var getValue = getValueGetter( attr, query );
      // use second argument as a parser
      var parser = Isotope.sortDataParsers[ args[1] ];
      // parse the value, if there was a parser
      sorter = parser ? function( elem ) {
        return elem && parser( getValue( elem ) );
      } :
      // otherwise just return value
      function( elem ) {
        return elem && getValue( elem );
      };

      return sorter;
    }

    // get an attribute getter, or get text of the querySelector
    function getValueGetter( attr, query ) {
      // if query looks like [foo-bar], get attribute
      if ( attr ) {
        return function getAttribute( elem ) {
          return elem.getAttribute( attr );
        };
      }

      // otherwise, assume its a querySelector, and get its text
      return function getChildText( elem ) {
        var child = elem.querySelector( query );
        return child && child.textContent;
      };
    }

    return mungeSorter;
  })();

  // parsers used in getSortData shortcut strings
  Isotope.sortDataParsers = {
    'parseInt': function( val ) {
      return parseInt( val, 10 );
    },
    'parseFloat': function( val ) {
      return parseFloat( val );
    }
  };

  // ----- sort method ----- //

  // sort filteredItem order
  proto._sort = function() {
    if ( !this.options.sortBy ) {
      return;
    }
    // keep track of sortBy History
    var sortBys = utils.makeArray( this.options.sortBy );
    if ( !this._getIsSameSortBy( sortBys ) ) {
      // concat all sortBy and sortHistory, add to front, oldest goes in last
      this.sortHistory = sortBys.concat( this.sortHistory );
    }
    // sort magic
    var itemSorter = getItemSorter( this.sortHistory, this.options.sortAscending );
    this.filteredItems.sort( itemSorter );
  };

  // check if sortBys is same as start of sortHistory
  proto._getIsSameSortBy = function( sortBys ) {
    for ( var i=0; i < sortBys.length; i++ ) {
      if ( sortBys[i] != this.sortHistory[i] ) {
        return false;
      }
    }
    return true;
  };

  // returns a function used for sorting
  function getItemSorter( sortBys, sortAsc ) {
    return function sorter( itemA, itemB ) {
      // cycle through all sortKeys
      for ( var i = 0; i < sortBys.length; i++ ) {
        var sortBy = sortBys[i];
        var a = itemA.sortData[ sortBy ];
        var b = itemB.sortData[ sortBy ];
        if ( a > b || a < b ) {
          // if sortAsc is an object, use the value given the sortBy key
          var isAscending = sortAsc[ sortBy ] !== undefined ? sortAsc[ sortBy ] : sortAsc;
          var direction = isAscending ? 1 : -1;
          return ( a > b ? 1 : -1 ) * direction;
        }
      }
      return 0;
    };
  }

  // -------------------------- methods -------------------------- //

  // get layout mode
  proto._mode = function() {
    var layoutMode = this.options.layoutMode;
    var mode = this.modes[ layoutMode ];
    if ( !mode ) {
      // TODO console.error
      throw new Error( 'No layout mode: ' + layoutMode );
    }
    // HACK sync mode's options
    // any options set after init for layout mode need to be synced
    mode.options = this.options[ layoutMode ];
    return mode;
  };

  proto._resetLayout = function() {
    // trigger original reset layout
    Outlayer.prototype._resetLayout.call( this );
    this._mode()._resetLayout();
  };

  proto._getItemLayoutPosition = function( item  ) {
    return this._mode()._getItemLayoutPosition( item );
  };

  proto._manageStamp = function( stamp ) {
    this._mode()._manageStamp( stamp );
  };

  proto._getContainerSize = function() {
    return this._mode()._getContainerSize();
  };

  proto.needsResizeLayout = function() {
    return this._mode().needsResizeLayout();
  };

  // -------------------------- adding & removing -------------------------- //

  // HEADS UP overwrites default Outlayer appended
  proto.appended = function( elems ) {
    var items = this.addItems( elems );
    if ( !items.length ) {
      return;
    }
    // filter, layout, reveal new items
    var filteredItems = this._filterRevealAdded( items );
    // add to filteredItems
    this.filteredItems = this.filteredItems.concat( filteredItems );
  };

  // HEADS UP overwrites default Outlayer prepended
  proto.prepended = function( elems ) {
    var items = this._itemize( elems );
    if ( !items.length ) {
      return;
    }
    // start new layout
    this._resetLayout();
    this._manageStamps();
    // filter, layout, reveal new items
    var filteredItems = this._filterRevealAdded( items );
    // layout previous items
    this.layoutItems( this.filteredItems );
    // add to items and filteredItems
    this.filteredItems = filteredItems.concat( this.filteredItems );
    this.items = items.concat( this.items );
  };

  proto._filterRevealAdded = function( items ) {
    var filtered = this._filter( items );
    this.hide( filtered.needHide );
    // reveal all new items
    this.reveal( filtered.matches );
    // layout new items, no transition
    this.layoutItems( filtered.matches, true );
    return filtered.matches;
  };

  /**
   * Filter, sort, and layout newly-appended item elements
   * @param {Array or NodeList or Element} elems
   */
  proto.insert = function( elems ) {
    var items = this.addItems( elems );
    if ( !items.length ) {
      return;
    }
    // append item elements
    var i, item;
    var len = items.length;
    for ( i=0; i < len; i++ ) {
      item = items[i];
      this.element.appendChild( item.element );
    }
    // filter new stuff
    var filteredInsertItems = this._filter( items ).matches;
    // set flag
    for ( i=0; i < len; i++ ) {
      items[i].isLayoutInstant = true;
    }
    this.arrange();
    // reset flag
    for ( i=0; i < len; i++ ) {
      delete items[i].isLayoutInstant;
    }
    this.reveal( filteredInsertItems );
  };

  var _remove = proto.remove;
  proto.remove = function( elems ) {
    elems = utils.makeArray( elems );
    var removeItems = this.getItems( elems );
    // do regular thing
    _remove.call( this, elems );
    // bail if no items to remove
    var len = removeItems && removeItems.length;
    // remove elems from filteredItems
    for ( var i=0; len && i < len; i++ ) {
      var item = removeItems[i];
      // remove item from collection
      utils.removeFrom( this.filteredItems, item );
    }
  };

  proto.shuffle = function() {
    // update random sortData
    for ( var i=0; i < this.items.length; i++ ) {
      var item = this.items[i];
      item.sortData.random = Math.random();
    }
    this.options.sortBy = 'random';
    this._sort();
    this._layout();
  };

  /**
   * trigger fn without transition
   * kind of hacky to have this in the first place
   * @param {Function} fn
   * @param {Array} args
   * @returns ret
   * @private
   */
  proto._noTransition = function( fn, args ) {
    // save transitionDuration before disabling
    var transitionDuration = this.options.transitionDuration;
    // disable transition
    this.options.transitionDuration = 0;
    // do it
    var returnValue = fn.apply( this, args );
    // re-enable transition for reveal
    this.options.transitionDuration = transitionDuration;
    return returnValue;
  };

  // ----- helper methods ----- //

  /**
   * getter method for getting filtered item elements
   * @returns {Array} elems - collection of item elements
   */
  proto.getFilteredItemElements = function() {
    return this.filteredItems.map( function( item ) {
      return item.element;
    });
  };

  // -----  ----- //

  return Isotope;

}));

/*!
 * jquery.sumoselect - v3.0.3
 * http://hemantnegi.github.io/jquery.sumoselect
 * 2016-12-12
 *
 * Copyright 2015 Hemant Negi
 * Email : hemant.frnz@gmail.com
 * Compressor http://refresh-sf.com/
 */

(function(factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }

})(function ($) {

    'namespace sumo';
    $.fn.SumoSelect = function (options) {

        // This is the easiest way to have default options.
        var settings = $.extend({
            placeholder: 'Select Here',   // Dont change it here.
            csvDispCount: 3,              // display no. of items in multiselect. 0 to display all.
            captionFormat:'{0} Selected', // format of caption text. you can set your locale.
            captionFormatAllSelected:'{0} all selected!', // format of caption text when all elements are selected. set null to use captionFormat. It will not work if there are disabled elements in select.
            floatWidth: 400,              // Screen width of device at which the list is rendered in floating popup fashion.
            forceCustomRendering: false,  // force the custom modal on all devices below floatWidth resolution.
            nativeOnDevice: ['Android', 'BlackBerry', 'iPhone', 'iPad', 'iPod', 'Opera Mini', 'IEMobile', 'Silk'], //
            outputAsCSV: false,           // true to POST data as csv ( false for Html control array ie. default select )
            csvSepChar: ',',              // separation char in csv mode
            okCancelInMulti: false,       // display ok cancel buttons in desktop mode multiselect also.
            isClickAwayOk: false,         // for okCancelInMulti=true. sets whether click outside will trigger Ok or Cancel (default is cancel).
            triggerChangeCombined: true,  // im multi select mode whether to trigger change event on individual selection or combined selection.
            selectAll: false,             // to display select all button in multiselect mode.|| also select all will not be available on mobile devices.

            search: false,                // to display input for filtering content. selectAlltext will be input text placeholder
            searchText: 'Search...',      // placeholder for search input
            noMatch: 'No matches for "{0}"',
            prefix: '',                   // some prefix usually the field name. eg. '<b>Hello</b>'
            locale: ['OK', 'Cancel', 'Select All'],  // all text that is used. don't change the index.
            up: false,                    // set true to open upside.
            showTitle: true               // set to false to prevent title (tooltip) from appearing
        }, options);

        var ret = this.each(function () {
            var selObj = this; // the original select object.
            if (this.sumo || !$(this).is('select')) return; //already initialized

            this.sumo = {
                E: $(selObj),   //the jquery object of original select element.
                is_multi: $(selObj).attr('multiple'),  //if its a multiple select
                select: '',
                caption: '',
                placeholder: '',
                optDiv: '',
                CaptionCont: '',
                ul:'',
                is_floating: false,
                is_opened: false,
                //backdrop: '',
                mob:false, // if to open device default select
                Pstate: [],

                createElems: function () {
                    var O = this;
                    O.E.wrap('<div class="SumoSelect" tabindex="0" role="button" aria-expanded="false">');
                    O.select = O.E.parent();
                    O.caption = $('<span>');
                    O.CaptionCont = $('<p class="CaptionCont SelectBox" ><label><i></i></label></p>')
                        .attr('style', O.E.attr('style'))
                        .prepend(O.caption);
                    O.select.append(O.CaptionCont);

                    // default turn off if no multiselect
                    if(!O.is_multi)settings.okCancelInMulti = false

                    if(O.E.attr('disabled'))
                        O.select.addClass('disabled').removeAttr('tabindex');

                    //if output as csv and is a multiselect.
                    if (settings.outputAsCSV && O.is_multi && O.E.attr('name')) {
                        //create a hidden field to store csv value.
                        O.select.append($('<input class="HEMANT123" type="hidden" />').attr('name', O.E.attr('name')).val(O.getSelStr()));

                        // so it can not post the original select.
                        O.E.removeAttr('name');
                    }

                    //break for mobile rendring.. if forceCustomRendering is false
                    if (O.isMobile() && !settings.forceCustomRendering) {
                        O.setNativeMobile();
                        return;
                    }

                    // if there is a name attr in select add a class to container div
                    if(O.E.attr('name')) O.select.addClass('sumo_'+O.E.attr('name').replace(/\[\]/, ''))

                    //hide original select
                    O.E.addClass('SumoUnder').attr('tabindex','-1');

                    //## Creating the list...
                    O.optDiv = $('<div class="optWrapper '+ (settings.up?'up':'') +'">');

                    //branch for floating list in low res devices.
                    O.floatingList();

                    //Creating the markup for the available options
                    O.ul = $('<ul class="options">');
                    O.optDiv.append(O.ul);

                    // Select all functionality
                    if(settings.selectAll && O.is_multi) O.SelAll();

                    // search functionality
                    if(settings.search) O.Search();

                    O.ul.append(O.prepItems(O.E.children()));

                    //if multiple then add the class multiple and add OK / CANCEL button
                    if (O.is_multi) O.multiSelelect();

                    O.select.append(O.optDiv);
                    O.basicEvents();
                    O.selAllState();
                },

                prepItems: function(opts, d){
                    var lis = [], O=this;
                    $(opts).each(function (i, opt) {       // parsing options to li
                        opt = $(opt);
                        lis.push(opt.is('optgroup')?
                            $('<li class="group '+ (opt[0].disabled?'disabled':'') +'"><label>' + opt.attr('label') +'</label><ul></ul></li>')
                            .find('ul')
                            .append(O.prepItems(opt.children(), opt[0].disabled))
                            .end()
                            :
                            O.createLi(opt, d)
                        );
                    });
                    return lis;
                },

                //## Creates a LI element from a given option and binds events to it
                //## returns the jquery instance of li (not inserted in dom)
                createLi: function (opt, d) {
                    var O = this;

                    if(!opt.attr('value'))opt.attr('value',opt.val());
                    var li = $('<li class="opt"><label>' + opt.text() + '</label></li>');

                    li.data('opt', opt);    // store a direct reference to option.
                    opt.data('li', li);    // store a direct reference to list item.
                    if (O.is_multi) li.prepend('<span><i></i></span>');

                    if (opt[0].disabled || d)
                        li = li.addClass('disabled');

                    O.onOptClick(li);

                    if (opt[0].selected)
                        li.addClass('selected');

                    if (opt.attr('class'))
                        li.addClass(opt.attr('class'));

                    if (opt.attr('title'))
                        li.attr('title', opt.attr('title'));

                    return li;
                },

                //## Returns the selected items as string in a Multiselect.
                getSelStr: function () {
                    // get the pre selected items.
                    sopt = [];
                    this.E.find('option:selected').each(function () { sopt.push($(this).val()); });
                    return sopt.join(settings.csvSepChar);
                },

                //## THOSE OK/CANCEL BUTTONS ON MULTIPLE SELECT.
                multiSelelect: function () {
                    var O = this;
                    O.optDiv.addClass('multiple');
                    O.okbtn = $('<p tabindex="0" class="btnOk">'+settings.locale[0]+'</p>').click(function () {
                        //if combined change event is set.
                        O._okbtn();
                        O.hideOpts();
                    });
                    O.cancelBtn = $('<p tabindex="0" class="btnCancel">'+settings.locale[1]+'</p>').click(function () {
                        O._cnbtn();
                        O.hideOpts();
                    });
                    var btns = O.okbtn.add(O.cancelBtn);
                    O.optDiv.append($('<div class="MultiControls">').append(btns));

                    // handling keyboard navigation on ok cancel buttons.
                    btns.on('keydown.sumo', function (e) {
                            var el = $(this);
                            switch (e.which) {
                                case 32: // space
                                case 13: // enter
                                    el.trigger('click');
                                    break;

                                case 9:  //tab
                                    if(el.hasClass('btnOk'))return;
                                case 27: // esc
                                    O._cnbtn();
                                    O.hideOpts();
                                    return;
                            }
                            e.stopPropagation();
                            e.preventDefault();
                        });
                },

                _okbtn:function(){
                    var O = this, cg = 0;
                    //if combined change event is set.
                    if (settings.triggerChangeCombined) {
                        //check for a change in the selection.
                        if (O.E.find('option:selected').length != O.Pstate.length) {
                            cg = 1;
                        }
                        else {
                            O.E.find('option').each(function (i,e) {
                                if(e.selected && O.Pstate.indexOf(i) < 0) cg = 1;
                            });
                        }

                        if (cg) {
                            O.callChange();
                            O.setText();
                        }
                    }
                },
                _cnbtn:function(){
                    var O = this;
                    //remove all selections
                    O.E.find('option:selected').each(function () { this.selected = false; });
                    O.optDiv.find('li.selected').removeClass('selected')

                    //restore selections from saved state.
                    for(var i = 0; i < O.Pstate.length; i++) {
                        O.E.find('option')[O.Pstate[i]].selected = true;
                        O.ul.find('li.opt').eq(O.Pstate[i]).addClass('selected');
                    }
                    O.selAllState();
                },

                SelAll:function(){
                    var O = this;
                    if(!O.is_multi)return;
                    O.selAll = $('<p class="select-all"><span><i></i></span><label>' + settings.locale[2] + '</label></p>');
                    O.optDiv.addClass('selall');
                    O.selAll.on('click',function(){
                        O.selAll.toggleClass('selected');
                        O.toggSelAll(O.selAll.hasClass('selected'), 1);
                        //O.selAllState();
                    });

                    O.optDiv.prepend(O.selAll);
                },

                // search module (can be removed if not required.)
                Search: function(){
                    var O = this,
                        cc = O.CaptionCont.addClass('search'),
                        P = $('<p class="no-match">');

                    O.ftxt = $('<input type="text" class="search-txt" value="" placeholder="' + settings.searchText + '">')
                        .on('click', function(e){
                            e.stopPropagation();
                        });
                    cc.append(O.ftxt);
                    O.optDiv.children('ul').after(P);

                    O.ftxt.on('keyup.sumo',function(){
                        var hid = O.optDiv.find('ul.options li.opt').each(function(ix,e){
                            var e = $(e),
                                opt = e.data('opt')[0];
                            opt.hidden = e.text().toLowerCase().indexOf(O.ftxt.val().toLowerCase()) < 0;
                            e.toggleClass('hidden', opt.hidden);
                        }).not('.hidden');

                        P.html(settings.noMatch.replace(/\{0\}/g, '<em></em>')).toggle(!hid.length);
                        P.find('em').text(O.ftxt.val());
                        O.selAllState();
                    });
                },

                selAllState: function () {
                    var O = this;
                    if (settings.selectAll && O.is_multi) {
                        var sc = 0, vc = 0;
                        O.optDiv.find('li.opt').not('.hidden').each(function (ix, e) {
                            if ($(e).hasClass('selected')) sc++;
                            if (!$(e).hasClass('disabled')) vc++;
                        });
                        //select all checkbox state change.
                        if (sc == vc) O.selAll.removeClass('partial').addClass('selected');
                        else if (sc == 0) O.selAll.removeClass('selected partial');
                        else O.selAll.addClass('partial')//.removeClass('selected');
                    }
                },

                showOpts: function () {
                    var O = this;
                    if (O.E.attr('disabled')) return; // if select is disabled then retrun
                    O.E.trigger('sumo:opening', O);
                    O.is_opened = true;
                    O.select.addClass('open').attr('aria-expanded', 'true');
                    O.E.trigger('sumo:opened', O);

                    if(O.ftxt)O.ftxt.focus();
                    else O.select.focus();

                    // hide options on click outside.
                    $(document).on('click.sumo', function (e) {
                        if (!O.select.is(e.target)                  // if the target of the click isn't the container...
                            && O.select.has(e.target).length === 0){ // ... nor a descendant of the container
                            if(!O.is_opened)return;
                            O.hideOpts();
                            if (settings.okCancelInMulti){
                              if(settings.isClickAwayOk)
                                O._okbtn();
                              else
                                O._cnbtn();
                            }
                        }
                    });

                    if (O.is_floating) {
                        H = O.optDiv.children('ul').outerHeight() + 2;  // +2 is clear fix
                        if (O.is_multi) H = H + parseInt(O.optDiv.css('padding-bottom'));
                        O.optDiv.css('height', H);
                        $('body').addClass('sumoStopScroll');
                    }

                    O.setPstate();
                },

                //maintain state when ok/cancel buttons are available storing the indexes.
                setPstate: function(){
                    var O = this;
                    if (O.is_multi && (O.is_floating || settings.okCancelInMulti)){
                        O.Pstate = [];
                        // assuming that find returns elements in tree order
                        O.E.find('option').each(function (i, e){if(e.selected) O.Pstate.push(i);});
                    }
                },

                callChange:function(){
                    this.E.trigger('change').trigger('click');
                },

                hideOpts: function () {
                    var O = this;
                    if(O.is_opened){
                        O.E.trigger('sumo:closing', O);
                        O.is_opened = false;
                        O.select.removeClass('open').attr('aria-expanded', 'true').find('ul li.sel').removeClass('sel');
                        O.E.trigger('sumo:closed', O);
                        $(document).off('click.sumo');
                        O.select.focus();
                        $('body').removeClass('sumoStopScroll');

                        // clear the search
                        if(settings.search){
                            O.ftxt.val('');
                            O.ftxt.trigger('keyup.sumo');
                        }
                    }
                },
                setOnOpen: function () {
                    var O = this,
                        li = O.optDiv.find('li.opt:not(.hidden)').eq(settings.search?0:O.E[0].selectedIndex);
                    if(li.hasClass('disabled')){
                        li = li.next(':not(disabled)')
                        if(!li.length) return;
                     }
                    O.optDiv.find('li.sel').removeClass('sel');
                    li.addClass('sel');
                    O.showOpts();
                },
                nav: function (up) {
                    var O = this, c,
                    s=O.ul.find('li.opt:not(.disabled, .hidden)'),
                    sel = O.ul.find('li.opt.sel:not(.hidden)'),
                    idx = s.index(sel);
                    if (O.is_opened && sel.length) {

                        if (up && idx > 0)
                            c = s.eq(idx-1);
                        else if(!up && idx < s.length-1 && idx > -1)
                            c = s.eq(idx+1);
                        else return; // if no items before or after

                        sel.removeClass('sel');
                        sel = c.addClass('sel');

                        // setting sel item to visible view.
                        var ul = O.ul,
                            st = ul.scrollTop(),
                            t = sel.position().top + st;
                        if(t >= st + ul.height()-sel.outerHeight())
                            ul.scrollTop(t - ul.height() + sel.outerHeight());
                        if(t<st)
                            ul.scrollTop(t);

                    }
                    else
                        O.setOnOpen();
                },

                basicEvents: function () {
                    var O = this;
                    O.CaptionCont.click(function (evt) {
                        O.E.trigger('click');
                        if (O.is_opened) O.hideOpts(); else O.showOpts();
                        evt.stopPropagation();
                    });

                    O.select.on('keydown.sumo', function (e) {
                        switch (e.which) {
                            case 38: // up
                                O.nav(true);
                                break;

                            case 40: // down
                                O.nav(false);
                                break;

                            case 65: // shortcut ctrl + a to select all and ctrl + shift + a to unselect all.
                                if (O.is_multi && e.ctrlKey){
                                    O.toggSelAll(!e.shiftKey, 1);
                                    break;
                                }
                                else
                                    return;

                            case 32: // space
                                if(settings.search && O.ftxt.is(e.target))return;
                            case 13: // enter
                                if (O.is_opened)
                                    O.optDiv.find('ul li.sel').trigger('click');
                                else
                                    O.setOnOpen();
                                break;
                            case 9:	 //tab
                                if(!settings.okCancelInMulti)
                                    O.hideOpts();
                                return;
                            case 27: // esc
                                if(settings.okCancelInMulti)O._cnbtn();
                                O.hideOpts();
                                return;

                            default:
                                return; // exit this handler for other keys
                        }
                        e.preventDefault(); // prevent the default action (scroll / move caret)
                    });

                    $(window).on('resize.sumo', function () {
                        O.floatingList();
                    });
                },

                onOptClick: function (li) {
                    var O = this;
                    li.click(function () {
                        var li = $(this);
                        if(li.hasClass('disabled'))return;
                        var txt = "";
                        if (O.is_multi) {
                            li.toggleClass('selected');
                            li.data('opt')[0].selected = li.hasClass('selected');
                            O.selAllState();
                        }
                        else {
                            li.parent().find('li.selected').removeClass('selected'); //if not multiselect then remove all selections from this list
                            li.toggleClass('selected');
                            li.data('opt')[0].selected = true;
                        }

                        //branch for combined change event.
                        if (!(O.is_multi && settings.triggerChangeCombined && (O.is_floating || settings.okCancelInMulti))) {
                            O.setText();
                            O.callChange();
                        }

                        if (!O.is_multi) O.hideOpts(); //if its not a multiselect then hide on single select.
                    });
                },

                setText: function () {
                    var O = this;
                    O.placeholder = "";
                    if (O.is_multi) {
                        sels = O.E.find(':selected').not(':disabled'); //selected options.

                        for (i = 0; i < sels.length; i++) {
                            if (i + 1 >= settings.csvDispCount && settings.csvDispCount) {
                                if (sels.length == O.E.find('option').length && settings.captionFormatAllSelected) {
                                    O.placeholder = settings.captionFormatAllSelected.replace(/\{0\}/g, sels.length)+',';
                                } else {
                                    O.placeholder = settings.captionFormat.replace(/\{0\}/g, sels.length)+',';
                                }

                                break;
                            }
                            else O.placeholder += $(sels[i]).text() + ", ";
                        }
                        O.placeholder = O.placeholder.replace(/,([^,]*)$/, '$1'); //remove unexpected "," from last.
                    }
                    else {
                        O.placeholder = O.E.find(':selected').not(':disabled').text();
                    }

                    var is_placeholder = false;

                    if (!O.placeholder) {

                        is_placeholder = true;

                        O.placeholder = O.E.attr('placeholder');
                        if (!O.placeholder)                  //if placeholder is there then set it
                            O.placeholder = O.E.find('option:disabled:selected').text();
                    }

                    O.placeholder = O.placeholder ? (settings.prefix + ' ' + O.placeholder) : settings.placeholder

                    //set display text
                    O.caption.html(O.placeholder);
                    if (settings.showTitle) O.CaptionCont.attr('title', O.placeholder);

                    //set the hidden field if post as csv is true.
                    var csvField = O.select.find('input.HEMANT123');
                    if (csvField.length) csvField.val(O.getSelStr());

                    //add class placeholder if its a placeholder text.
                    if (is_placeholder) O.caption.addClass('placeholder'); else O.caption.removeClass('placeholder');
                    return O.placeholder;
                },

                isMobile: function () {

                    // Adapted from http://www.detectmobilebrowsers.com
                    var ua = navigator.userAgent || navigator.vendor || window.opera;

                    // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
                    for (var i = 0; i < settings.nativeOnDevice.length; i++) if (ua.toString().toLowerCase().indexOf(settings.nativeOnDevice[i].toLowerCase()) > 0) return settings.nativeOnDevice[i];
                    return false;
                },

                setNativeMobile: function () {
                    var O = this;
                    O.E.addClass('SelectClass')//.css('height', O.select.outerHeight());
                    O.mob = true;
                    O.E.change(function () {
                        O.setText();
                    });
                },

                floatingList: function () {
                    var O = this;
                    //called on init and also on resize.
                    //O.is_floating = true if window width is < specified float width
                    O.is_floating = $(window).width() <= settings.floatWidth;

                    //set class isFloating
                    O.optDiv.toggleClass('isFloating', O.is_floating);

                    //remove height if not floating
                    if (!O.is_floating) O.optDiv.css('height', '');

                    //toggle class according to okCancelInMulti flag only when it is not floating
                    O.optDiv.toggleClass('okCancelInMulti', settings.okCancelInMulti && !O.is_floating);
                },

                //HELPERS FOR OUTSIDERS
                // validates range of given item operations
                vRange: function (i) {
                    var O = this;
                    var opts = O.E.find('option');
                    if (opts.length <= i || i < 0) throw "index out of bounds"
                    return O;
                },

                //toggles selection on c as boolean.
                toggSel: function (c, i) {
                    var O = this;
                    var opt;
                    if (typeof(i) === "number"){
                        O.vRange(i);
                        opt = O.E.find('option')[i];
                    }
                    else{
                        opt = O.E.find('option[value="'+i+'"]')[0]||0;
                    }
                    if (!opt || opt.disabled)
                        return;

                    if(opt.selected != c){
                        opt.selected = c;
                        if(!O.mob) $(opt).data('li').toggleClass('selected',c);

                        O.callChange();
                        O.setPstate();
                        O.setText();
                        O.selAllState();
                    }
                },

                //toggles disabled on c as boolean.
                toggDis: function (c, i) {
                    var O = this.vRange(i);
                    O.E.find('option')[i].disabled = c;
                    if(c)O.E.find('option')[i].selected = false;
                    if(!O.mob)O.optDiv.find('ul.options li').eq(i).toggleClass('disabled', c).removeClass('selected');
                    O.setText();
                },

                // toggle disable/enable on complete select control
                toggSumo: function(val) {
                    var O = this;
                    O.enabled = val;
                    O.select.toggleClass('disabled', val);

                    if (val) {
                        O.E.attr('disabled', 'disabled');
                        O.select.removeAttr('tabindex');
                    }
                    else{
                        O.E.removeAttr('disabled');
                        O.select.attr('tabindex','0');
                    }

                    return O;
                },

                // toggles all option on c as boolean.
                // set direct=false/0 bypasses okCancelInMulti behaviour.
                toggSelAll: function (c, direct) {
                    var O = this;
                    O.E.find('option:not(:disabled,:hidden)')
                    .each(function(ix,e){
                        var is_selected=e.selected,
                            e = $(e).data('li');
                        if(e.hasClass('hidden'))return;
                        if(!!c){
                            if(!is_selected)e.trigger('click');
                        }
                        else{
                            if(is_selected)e.trigger('click');
                        }
                    });

                    if(!direct){
                        if(!O.mob && O.selAll)O.selAll.removeClass('partial').toggleClass('selected',!!c);
                        O.callChange();
                        O.setText();
                        O.setPstate();
                    }
                },

                /* outside accessibility options
                 which can be accessed from the element instance.
                 */
                reload:function(){
                    var elm = this.unload();
                    return $(elm).SumoSelect(settings);
                },

                unload: function () {
                    var O = this;
                    O.select.before(O.E);
                    O.E.show();

                    if (settings.outputAsCSV && O.is_multi && O.select.find('input.HEMANT123').length) {
                        O.E.attr('name', O.select.find('input.HEMANT123').attr('name')); // restore the name;
                    }
                    O.select.remove();
                    delete selObj.sumo;
                    return selObj;
                },

                //## add a new option to select at a given index.
                add: function (val, txt, i) {
                    if (typeof val == "undefined") throw "No value to add"

                    var O = this;
                    opts=O.E.find('option')
                    if (typeof txt == "number") { i = txt; txt = val; }
                    if (typeof txt == "undefined") { txt = val; }

                    opt = $("<option></option>").val(val).html(txt);

                    if (opts.length < i) throw "index out of bounds"

                    if (typeof i == "undefined" || opts.length == i) { // add it to the last if given index is last no or no index provides.
                        O.E.append(opt);
                        if(!O.mob)O.ul.append(O.createLi(opt));
                    }
                    else {
                        opts.eq(i).before(opt);
                        if(!O.mob)O.ul.find('li.opt').eq(i).before(O.createLi(opt));
                    }

                    return selObj;
                },

                //## removes an item at a given index.
                remove: function (i) {
                    var O = this.vRange(i);
                    O.E.find('option').eq(i).remove();
                    if(!O.mob)O.optDiv.find('ul.options li').eq(i).remove();
                    O.setText();
                },

                //## Select an item at a given index.
                selectItem: function (i) { this.toggSel(true, i); },

                //## UnSelect an iten at a given index.
                unSelectItem: function (i) { this.toggSel(false, i); },

                //## Select all items  of the select.
                selectAll: function () { this.toggSelAll(true); },

                //## UnSelect all items of the select.
                unSelectAll: function () { this.toggSelAll(false); },

                //## Disable an iten at a given index.
                disableItem: function (i) { this.toggDis(true, i) },

                //## Removes disabled an iten at a given index.
                enableItem: function (i) { this.toggDis(false, i) },

                //## New simple methods as getter and setter are not working fine in ie8-
                //## variable to check state of control if enabled or disabled.
                enabled : true,
                //## Enables the control
                enable: function(){return this.toggSumo(false)},

                //## Disables the control
                disable: function(){return this.toggSumo(true)},


                init: function () {
                    var O = this;
                    O.createElems();
                    O.setText();
                    return O
                }

            };

            selObj.sumo.init();
        });

        return ret.length == 1 ? ret[0] : ret;
    };


});

/*!
 * jQuery Validation Plugin v1.15.0
 *
 * http://jqueryvalidation.org/
 *
 * Copyright (c) 2016 Jörn Zaefferer
 * Released under the MIT license
 */
(function( factory ) {
  if ( typeof define === "function" && define.amd ) {
    define( ["jquery"], factory );
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory( require( "jquery" ) );
  } else {
    factory( jQuery );
  }
}(function( $ ) {

$.extend( $.fn, {

  // http://jqueryvalidation.org/validate/
  validate: function( options ) {

    // If nothing is selected, return nothing; can't chain anyway
    if ( !this.length ) {
      if ( options && options.debug && window.console ) {
        console.warn( "Nothing selected, can't validate, returning nothing." );
      }
      return;
    }

    // Check if a validator for this form was already created
    var validator = $.data( this[ 0 ], "validator" );
    if ( validator ) {
      return validator;
    }

    // Add novalidate tag if HTML5.
    this.attr( "novalidate", "novalidate" );

    validator = new $.validator( options, this[ 0 ] );
    $.data( this[ 0 ], "validator", validator );

    if ( validator.settings.onsubmit ) {

      this.on( "click.validate", ":submit", function( event ) {
        if ( validator.settings.submitHandler ) {
          validator.submitButton = event.target;
        }

        // Allow suppressing validation by adding a cancel class to the submit button
        if ( $( this ).hasClass( "cancel" ) ) {
          validator.cancelSubmit = true;
        }

        // Allow suppressing validation by adding the html5 formnovalidate attribute to the submit button
        if ( $( this ).attr( "formnovalidate" ) !== undefined ) {
          validator.cancelSubmit = true;
        }
      } );

      // Validate the form on submit
      this.on( "submit.validate", function( event ) {
        if ( validator.settings.debug ) {

          // Prevent form submit to be able to see console output
          event.preventDefault();
        }
        function handle() {
          var hidden, result;
          if ( validator.settings.submitHandler ) {
            if ( validator.submitButton ) {

              // Insert a hidden input as a replacement for the missing submit button
              hidden = $( "<input type='hidden'/>" )
                .attr( "name", validator.submitButton.name )
                .val( $( validator.submitButton ).val() )
                .appendTo( validator.currentForm );
            }
            result = validator.settings.submitHandler.call( validator, validator.currentForm, event );
            if ( validator.submitButton ) {

              // And clean up afterwards; thanks to no-block-scope, hidden can be referenced
              hidden.remove();
            }
            if ( result !== undefined ) {
              return result;
            }
            return false;
          }
          return true;
        }

        // Prevent submit for invalid forms or custom submit handlers
        if ( validator.cancelSubmit ) {
          validator.cancelSubmit = false;
          return handle();
        }
        if ( validator.form() ) {
          if ( validator.pendingRequest ) {
            validator.formSubmitted = true;
            return false;
          }
          return handle();
        } else {
          validator.focusInvalid();
          return false;
        }
      } );
    }

    return validator;
  },

  // http://jqueryvalidation.org/valid/
  valid: function() {
    var valid, validator, errorList;

    if ( $( this[ 0 ] ).is( "form" ) ) {
      valid = this.validate().form();
    } else {
      errorList = [];
      valid = true;
      validator = $( this[ 0 ].form ).validate();
      this.each( function() {
        valid = validator.element( this ) && valid;
        if ( !valid ) {
          errorList = errorList.concat( validator.errorList );
        }
      } );
      validator.errorList = errorList;
    }
    return valid;
  },

  // http://jqueryvalidation.org/rules/
  rules: function( command, argument ) {

    // If nothing is selected, return nothing; can't chain anyway
    if ( !this.length ) {
      return;
    }

    var element = this[ 0 ],
      settings, staticRules, existingRules, data, param, filtered;

    if ( command ) {
      settings = $.data( element.form, "validator" ).settings;
      staticRules = settings.rules;
      existingRules = $.validator.staticRules( element );
      switch ( command ) {
      case "add":
        $.extend( existingRules, $.validator.normalizeRule( argument ) );

        // Remove messages from rules, but allow them to be set separately
        delete existingRules.messages;
        staticRules[ element.name ] = existingRules;
        if ( argument.messages ) {
          settings.messages[ element.name ] = $.extend( settings.messages[ element.name ], argument.messages );
        }
        break;
      case "remove":
        if ( !argument ) {
          delete staticRules[ element.name ];
          return existingRules;
        }
        filtered = {};
        $.each( argument.split( /\s/ ), function( index, method ) {
          filtered[ method ] = existingRules[ method ];
          delete existingRules[ method ];
          if ( method === "required" ) {
            $( element ).removeAttr( "aria-required" );
          }
        } );
        return filtered;
      }
    }

    data = $.validator.normalizeRules(
    $.extend(
      {},
      $.validator.classRules( element ),
      $.validator.attributeRules( element ),
      $.validator.dataRules( element ),
      $.validator.staticRules( element )
    ), element );

    // Make sure required is at front
    if ( data.required ) {
      param = data.required;
      delete data.required;
      data = $.extend( { required: param }, data );
      $( element ).attr( "aria-required", "true" );
    }

    // Make sure remote is at back
    if ( data.remote ) {
      param = data.remote;
      delete data.remote;
      data = $.extend( data, { remote: param } );
    }

    return data;
  }
} );

// Custom selectors
$.extend( $.expr[ ":" ], {

  // http://jqueryvalidation.org/blank-selector/
  blank: function( a ) {
    return !$.trim( "" + $( a ).val() );
  },

  // http://jqueryvalidation.org/filled-selector/
  filled: function( a ) {
    var val = $( a ).val();
    return val !== null && !!$.trim( "" + val );
  },

  // http://jqueryvalidation.org/unchecked-selector/
  unchecked: function( a ) {
    return !$( a ).prop( "checked" );
  }
} );

// Constructor for validator
$.validator = function( options, form ) {
  this.settings = $.extend( true, {}, $.validator.defaults, options );
  this.currentForm = form;
  this.init();
};

// http://jqueryvalidation.org/jQuery.validator.format/
$.validator.format = function( source, params ) {
  if ( arguments.length === 1 ) {
    return function() {
      var args = $.makeArray( arguments );
      args.unshift( source );
      return $.validator.format.apply( this, args );
    };
  }
  if ( params === undefined ) {
    return source;
  }
  if ( arguments.length > 2 && params.constructor !== Array  ) {
    params = $.makeArray( arguments ).slice( 1 );
  }
  if ( params.constructor !== Array ) {
    params = [ params ];
  }
  $.each( params, function( i, n ) {
    source = source.replace( new RegExp( "\\{" + i + "\\}", "g" ), function() {
      return n;
    } );
  } );
  return source;
};

$.extend( $.validator, {

  defaults: {
    messages: {},
    groups: {},
    rules: {},
    errorClass: "error",
    pendingClass: "pending",
    validClass: "valid",
    errorElement: "label",
    focusCleanup: false,
    focusInvalid: true,
    errorContainer: $( [] ),
    errorLabelContainer: $( [] ),
    onsubmit: true,
    ignore: ":hidden",
    ignoreTitle: false,
    onfocusin: function( element ) {
      this.lastActive = element;

      // Hide error label and remove error class on focus if enabled
      if ( this.settings.focusCleanup ) {
        if ( this.settings.unhighlight ) {
          this.settings.unhighlight.call( this, element, this.settings.errorClass, this.settings.validClass );
        }
        this.hideThese( this.errorsFor( element ) );
      }
    },
    onfocusout: function( element ) {
      if ( !this.checkable( element ) && ( element.name in this.submitted || !this.optional( element ) ) ) {
        this.element( element );
      }
    },
    onkeyup: function( element, event ) {

      // Avoid revalidate the field when pressing one of the following keys
      // Shift       => 16
      // Ctrl        => 17
      // Alt         => 18
      // Caps lock   => 20
      // End         => 35
      // Home        => 36
      // Left arrow  => 37
      // Up arrow    => 38
      // Right arrow => 39
      // Down arrow  => 40
      // Insert      => 45
      // Num lock    => 144
      // AltGr key   => 225
      var excludedKeys = [
        16, 17, 18, 20, 35, 36, 37,
        38, 39, 40, 45, 144, 225
      ];

      if ( event.which === 9 && this.elementValue( element ) === "" || $.inArray( event.keyCode, excludedKeys ) !== -1 ) {
        return;
      } else if ( element.name in this.submitted || element.name in this.invalid ) {
        this.element( element );
      }
    },
    onclick: function( element ) {

      // Click on selects, radiobuttons and checkboxes
      if ( element.name in this.submitted ) {
        this.element( element );

      // Or option elements, check parent select in that case
      } else if ( element.parentNode.name in this.submitted ) {
        this.element( element.parentNode );
      }
    },
    highlight: function( element, errorClass, validClass ) {
      if ( element.type === "radio" ) {
        this.findByName( element.name ).addClass( errorClass ).removeClass( validClass );
      } else {
        $( element ).addClass( errorClass ).removeClass( validClass );
      }
    },
    unhighlight: function( element, errorClass, validClass ) {
      if ( element.type === "radio" ) {
        this.findByName( element.name ).removeClass( errorClass ).addClass( validClass );
      } else {
        $( element ).removeClass( errorClass ).addClass( validClass );
      }
    }
  },

  // http://jqueryvalidation.org/jQuery.validator.setDefaults/
  setDefaults: function( settings ) {
    $.extend( $.validator.defaults, settings );
  },

  messages: {
    required: "This field is required.",
    remote: "Please fix this field.",
    email: "Please enter a valid email address.",
    url: "Please enter a valid URL.",
    date: "Please enter a valid date.",
    dateISO: "Please enter a valid date ( ISO ).",
    number: "Please enter a valid number.",
    digits: "Please enter only digits.",
    equalTo: "Please enter the same value again.",
    maxlength: $.validator.format( "Please enter no more than {0} characters." ),
    minlength: $.validator.format( "Please enter at least {0} characters." ),
    rangelength: $.validator.format( "Please enter a value between {0} and {1} characters long." ),
    range: $.validator.format( "Please enter a value between {0} and {1}." ),
    max: $.validator.format( "Please enter a value less than or equal to {0}." ),
    min: $.validator.format( "Please enter a value greater than or equal to {0}." ),
    step: $.validator.format( "Please enter a multiple of {0}." )
  },

  autoCreateRanges: false,

  prototype: {

    init: function() {
      this.labelContainer = $( this.settings.errorLabelContainer );
      this.errorContext = this.labelContainer.length && this.labelContainer || $( this.currentForm );
      this.containers = $( this.settings.errorContainer ).add( this.settings.errorLabelContainer );
      this.submitted = {};
      this.valueCache = {};
      this.pendingRequest = 0;
      this.pending = {};
      this.invalid = {};
      this.reset();

      var groups = ( this.groups = {} ),
        rules;
      $.each( this.settings.groups, function( key, value ) {
        if ( typeof value === "string" ) {
          value = value.split( /\s/ );
        }
        $.each( value, function( index, name ) {
          groups[ name ] = key;
        } );
      } );
      rules = this.settings.rules;
      $.each( rules, function( key, value ) {
        rules[ key ] = $.validator.normalizeRule( value );
      } );

      function delegate( event ) {
        var validator = $.data( this.form, "validator" ),
          eventType = "on" + event.type.replace( /^validate/, "" ),
          settings = validator.settings;
        if ( settings[ eventType ] && !$( this ).is( settings.ignore ) ) {
          settings[ eventType ].call( validator, this, event );
        }
      }

      $( this.currentForm )
        .on( "focusin.validate focusout.validate keyup.validate",
          ":text, [type='password'], [type='file'], select, textarea, [type='number'], [type='search'], " +
          "[type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], " +
          "[type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'], " +
          "[type='radio'], [type='checkbox'], [contenteditable]", delegate )

        // Support: Chrome, oldIE
        // "select" is provided as event.target when clicking a option
        .on( "click.validate", "select, option, [type='radio'], [type='checkbox']", delegate );

      if ( this.settings.invalidHandler ) {
        $( this.currentForm ).on( "invalid-form.validate", this.settings.invalidHandler );
      }

      // Add aria-required to any Static/Data/Class required fields before first validation
      // Screen readers require this attribute to be present before the initial submission http://www.w3.org/TR/WCAG-TECHS/ARIA2.html
      $( this.currentForm ).find( "[required], [data-rule-required], .required" ).attr( "aria-required", "true" );
    },

    // http://jqueryvalidation.org/Validator.form/
    form: function() {
      this.checkForm();
      $.extend( this.submitted, this.errorMap );
      this.invalid = $.extend( {}, this.errorMap );
      if ( !this.valid() ) {
        $( this.currentForm ).triggerHandler( "invalid-form", [ this ] );
      }
      this.showErrors();
      return this.valid();
    },

    checkForm: function() {
      this.prepareForm();
      for ( var i = 0, elements = ( this.currentElements = this.elements() ); elements[ i ]; i++ ) {
        this.check( elements[ i ] );
      }
      return this.valid();
    },

    // http://jqueryvalidation.org/Validator.element/
    element: function( element ) {
      var cleanElement = this.clean( element ),
        checkElement = this.validationTargetFor( cleanElement ),
        v = this,
        result = true,
        rs, group;

      if ( checkElement === undefined ) {
        delete this.invalid[ cleanElement.name ];
      } else {
        this.prepareElement( checkElement );
        this.currentElements = $( checkElement );

        // If this element is grouped, then validate all group elements already
        // containing a value
        group = this.groups[ checkElement.name ];
        if ( group ) {
          $.each( this.groups, function( name, testgroup ) {
            if ( testgroup === group && name !== checkElement.name ) {
              cleanElement = v.validationTargetFor( v.clean( v.findByName( name ) ) );
              if ( cleanElement && cleanElement.name in v.invalid ) {
                v.currentElements.push( cleanElement );
                result = result && v.check( cleanElement );
              }
            }
          } );
        }

        rs = this.check( checkElement ) !== false;
        result = result && rs;
        if ( rs ) {
          this.invalid[ checkElement.name ] = false;
        } else {
          this.invalid[ checkElement.name ] = true;
        }

        if ( !this.numberOfInvalids() ) {

          // Hide error containers on last error
          this.toHide = this.toHide.add( this.containers );
        }
        this.showErrors();

        // Add aria-invalid status for screen readers
        $( element ).attr( "aria-invalid", !rs );
      }

      return result;
    },

    // http://jqueryvalidation.org/Validator.showErrors/
    showErrors: function( errors ) {
      if ( errors ) {
        var validator = this;

        // Add items to error list and map
        $.extend( this.errorMap, errors );
        this.errorList = $.map( this.errorMap, function( message, name ) {
          return {
            message: message,
            element: validator.findByName( name )[ 0 ]
          };
        } );

        // Remove items from success list
        this.successList = $.grep( this.successList, function( element ) {
          return !( element.name in errors );
        } );
      }
      if ( this.settings.showErrors ) {
        this.settings.showErrors.call( this, this.errorMap, this.errorList );
      } else {
        this.defaultShowErrors();
      }
    },

    // http://jqueryvalidation.org/Validator.resetForm/
    resetForm: function() {
      if ( $.fn.resetForm ) {
        $( this.currentForm ).resetForm();
      }
      this.invalid = {};
      this.submitted = {};
      this.prepareForm();
      this.hideErrors();
      var elements = this.elements()
        .removeData( "previousValue" )
        .removeAttr( "aria-invalid" );

      this.resetElements( elements );
    },

    resetElements: function( elements ) {
      var i;

      if ( this.settings.unhighlight ) {
        for ( i = 0; elements[ i ]; i++ ) {
          this.settings.unhighlight.call( this, elements[ i ],
            this.settings.errorClass, "" );
          this.findByName( elements[ i ].name ).removeClass( this.settings.validClass );
        }
      } else {
        elements
          .removeClass( this.settings.errorClass )
          .removeClass( this.settings.validClass );
      }
    },

    numberOfInvalids: function() {
      return this.objectLength( this.invalid );
    },

    objectLength: function( obj ) {
      /* jshint unused: false */
      var count = 0,
        i;
      for ( i in obj ) {
        if ( obj[ i ] ) {
          count++;
        }
      }
      return count;
    },

    hideErrors: function() {
      this.hideThese( this.toHide );
    },

    hideThese: function( errors ) {
      errors.not( this.containers ).text( "" );
      this.addWrapper( errors ).hide();
    },

    valid: function() {
      return this.size() === 0;
    },

    size: function() {
      return this.errorList.length;
    },

    focusInvalid: function() {
      if ( this.settings.focusInvalid ) {
        try {
          $( this.findLastActive() || this.errorList.length && this.errorList[ 0 ].element || [] )
          .filter( ":visible" )
          .focus()

          // Manually trigger focusin event; without it, focusin handler isn't called, findLastActive won't have anything to find
          .trigger( "focusin" );
        } catch ( e ) {

          // Ignore IE throwing errors when focusing hidden elements
        }
      }
    },

    findLastActive: function() {
      var lastActive = this.lastActive;
      return lastActive && $.grep( this.errorList, function( n ) {
        return n.element.name === lastActive.name;
      } ).length === 1 && lastActive;
    },

    elements: function() {
      var validator = this,
        rulesCache = {};

      // Select all valid inputs inside the form (no submit or reset buttons)
      return $( this.currentForm )
      .find( "input, select, textarea, [contenteditable]" )
      .not( ":submit, :reset, :image, :disabled" )
      .not( this.settings.ignore )
      .filter( function() {
        var name = this.name || $( this ).attr( "name" ); // For contenteditable
        if ( !name && validator.settings.debug && window.console ) {
          console.error( "%o has no name assigned", this );
        }

        // Set form expando on contenteditable
        if ( this.hasAttribute( "contenteditable" ) ) {
          this.form = $( this ).closest( "form" )[ 0 ];
        }

        // Select only the first element for each name, and only those with rules specified
        if ( name in rulesCache || !validator.objectLength( $( this ).rules() ) ) {
          return false;
        }

        rulesCache[ name ] = true;
        return true;
      } );
    },

    clean: function( selector ) {
      return $( selector )[ 0 ];
    },

    errors: function() {
      var errorClass = this.settings.errorClass.split( " " ).join( "." );
      return $( this.settings.errorElement + "." + errorClass, this.errorContext );
    },

    resetInternals: function() {
      this.successList = [];
      this.errorList = [];
      this.errorMap = {};
      this.toShow = $( [] );
      this.toHide = $( [] );
    },

    reset: function() {
      this.resetInternals();
      this.currentElements = $( [] );
    },

    prepareForm: function() {
      this.reset();
      this.toHide = this.errors().add( this.containers );
    },

    prepareElement: function( element ) {
      this.reset();
      this.toHide = this.errorsFor( element );
    },

    elementValue: function( element ) {
      var $element = $( element ),
        type = element.type,
        val, idx;

      if ( type === "radio" || type === "checkbox" ) {
        return this.findByName( element.name ).filter( ":checked" ).val();
      } else if ( type === "number" && typeof element.validity !== "undefined" ) {
        return element.validity.badInput ? "NaN" : $element.val();
      }

      if ( element.hasAttribute( "contenteditable" ) ) {
        val = $element.text();
      } else {
        val = $element.val();
      }

      if ( type === "file" ) {

        // Modern browser (chrome & safari)
        if ( val.substr( 0, 12 ) === "C:\\fakepath\\" ) {
          return val.substr( 12 );
        }

        // Legacy browsers
        // Unix-based path
        idx = val.lastIndexOf( "/" );
        if ( idx >= 0 ) {
          return val.substr( idx + 1 );
        }

        // Windows-based path
        idx = val.lastIndexOf( "\\" );
        if ( idx >= 0 ) {
          return val.substr( idx + 1 );
        }

        // Just the file name
        return val;
      }

      if ( typeof val === "string" ) {
        return val.replace( /\r/g, "" );
      }
      return val;
    },

    check: function( element ) {
      element = this.validationTargetFor( this.clean( element ) );

      var rules = $( element ).rules(),
        rulesCount = $.map( rules, function( n, i ) {
          return i;
        } ).length,
        dependencyMismatch = false,
        val = this.elementValue( element ),
        result, method, rule;

      // If a normalizer is defined for this element, then
      // call it to retreive the changed value instead
      // of using the real one.
      // Note that `this` in the normalizer is `element`.
      if ( typeof rules.normalizer === "function" ) {
        val = rules.normalizer.call( element, val );

        if ( typeof val !== "string" ) {
          throw new TypeError( "The normalizer should return a string value." );
        }

        // Delete the normalizer from rules to avoid treating
        // it as a pre-defined method.
        delete rules.normalizer;
      }

      for ( method in rules ) {
        rule = { method: method, parameters: rules[ method ] };
        try {
          result = $.validator.methods[ method ].call( this, val, element, rule.parameters );

          // If a method indicates that the field is optional and therefore valid,
          // don't mark it as valid when there are no other rules
          if ( result === "dependency-mismatch" && rulesCount === 1 ) {
            dependencyMismatch = true;
            continue;
          }
          dependencyMismatch = false;

          if ( result === "pending" ) {
            this.toHide = this.toHide.not( this.errorsFor( element ) );
            return;
          }

          if ( !result ) {
            this.formatAndAdd( element, rule );
            return false;
          }
        } catch ( e ) {
          if ( this.settings.debug && window.console ) {
            console.log( "Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.", e );
          }
          if ( e instanceof TypeError ) {
            e.message += ".  Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.";
          }

          throw e;
        }
      }
      if ( dependencyMismatch ) {
        return;
      }
      if ( this.objectLength( rules ) ) {
        this.successList.push( element );
      }
      return true;
    },

    // Return the custom message for the given element and validation method
    // specified in the element's HTML5 data attribute
    // return the generic message if present and no method specific message is present
    customDataMessage: function( element, method ) {
      return $( element ).data( "msg" + method.charAt( 0 ).toUpperCase() +
        method.substring( 1 ).toLowerCase() ) || $( element ).data( "msg" );
    },

    // Return the custom message for the given element name and validation method
    customMessage: function( name, method ) {
      var m = this.settings.messages[ name ];
      return m && ( m.constructor === String ? m : m[ method ] );
    },

    // Return the first defined argument, allowing empty strings
    findDefined: function() {
      for ( var i = 0; i < arguments.length; i++ ) {
        if ( arguments[ i ] !== undefined ) {
          return arguments[ i ];
        }
      }
      return undefined;
    },

    defaultMessage: function( element, rule ) {
      var message = this.findDefined(
          this.customMessage( element.name, rule.method ),
          this.customDataMessage( element, rule.method ),

          // 'title' is never undefined, so handle empty string as undefined
          !this.settings.ignoreTitle && element.title || undefined,
          $.validator.messages[ rule.method ],
          "<strong>Warning: No message defined for " + element.name + "</strong>"
        ),
        theregex = /\$?\{(\d+)\}/g;
      if ( typeof message === "function" ) {
        message = message.call( this, rule.parameters, element );
      } else if ( theregex.test( message ) ) {
        message = $.validator.format( message.replace( theregex, "{$1}" ), rule.parameters );
      }

      return message;
    },

    formatAndAdd: function( element, rule ) {
      var message = this.defaultMessage( element, rule );

      this.errorList.push( {
        message: message,
        element: element,
        method: rule.method
      } );

      this.errorMap[ element.name ] = message;
      this.submitted[ element.name ] = message;
    },

    addWrapper: function( toToggle ) {
      if ( this.settings.wrapper ) {
        toToggle = toToggle.add( toToggle.parent( this.settings.wrapper ) );
      }
      return toToggle;
    },

    defaultShowErrors: function() {
      var i, elements, error;
      for ( i = 0; this.errorList[ i ]; i++ ) {
        error = this.errorList[ i ];
        if ( this.settings.highlight ) {
          this.settings.highlight.call( this, error.element, this.settings.errorClass, this.settings.validClass );
        }
        this.showLabel( error.element, error.message );
      }
      if ( this.errorList.length ) {
        this.toShow = this.toShow.add( this.containers );
      }
      if ( this.settings.success ) {
        for ( i = 0; this.successList[ i ]; i++ ) {
          this.showLabel( this.successList[ i ] );
        }
      }
      if ( this.settings.unhighlight ) {
        for ( i = 0, elements = this.validElements(); elements[ i ]; i++ ) {
          this.settings.unhighlight.call( this, elements[ i ], this.settings.errorClass, this.settings.validClass );
        }
      }
      this.toHide = this.toHide.not( this.toShow );
      this.hideErrors();
      this.addWrapper( this.toShow ).show();
    },

    validElements: function() {
      return this.currentElements.not( this.invalidElements() );
    },

    invalidElements: function() {
      return $( this.errorList ).map( function() {
        return this.element;
      } );
    },

    showLabel: function( element, message ) {
      var place, group, errorID, v,
        error = this.errorsFor( element ),
        elementID = this.idOrName( element ),
        describedBy = $( element ).attr( "aria-describedby" );

      if ( error.length ) {

        // Refresh error/success class
        error.removeClass( this.settings.validClass ).addClass( this.settings.errorClass );

        // Replace message on existing label
        error.html( message );
      } else {

        // Create error element
        error = $( "<" + this.settings.errorElement + ">" )
          .attr( "id", elementID + "-error" )
          .addClass( this.settings.errorClass )
          .html( message || "" );

        // Maintain reference to the element to be placed into the DOM
        place = error;
        if ( this.settings.wrapper ) {

          // Make sure the element is visible, even in IE
          // actually showing the wrapped element is handled elsewhere
          place = error.hide().show().wrap( "<" + this.settings.wrapper + "/>" ).parent();
        }
        if ( this.labelContainer.length ) {
          this.labelContainer.append( place );
        } else if ( this.settings.errorPlacement ) {
          this.settings.errorPlacement( place, $( element ) );
        } else {
          place.insertAfter( element );
        }

        // Link error back to the element
        if ( error.is( "label" ) ) {

          // If the error is a label, then associate using 'for'
          error.attr( "for", elementID );

          // If the element is not a child of an associated label, then it's necessary
          // to explicitly apply aria-describedby
        } else if ( error.parents( "label[for='" + this.escapeCssMeta( elementID ) + "']" ).length === 0 ) {
          errorID = error.attr( "id" );

          // Respect existing non-error aria-describedby
          if ( !describedBy ) {
            describedBy = errorID;
          } else if ( !describedBy.match( new RegExp( "\\b" + this.escapeCssMeta( errorID ) + "\\b" ) ) ) {

            // Add to end of list if not already present
            describedBy += " " + errorID;
          }
          $( element ).attr( "aria-describedby", describedBy );

          // If this element is grouped, then assign to all elements in the same group
          group = this.groups[ element.name ];
          if ( group ) {
            v = this;
            $.each( v.groups, function( name, testgroup ) {
              if ( testgroup === group ) {
                $( "[name='" + v.escapeCssMeta( name ) + "']", v.currentForm )
                  .attr( "aria-describedby", error.attr( "id" ) );
              }
            } );
          }
        }
      }
      if ( !message && this.settings.success ) {
        error.text( "" );
        if ( typeof this.settings.success === "string" ) {
          error.addClass( this.settings.success );
        } else {
          this.settings.success( error, element );
        }
      }
      this.toShow = this.toShow.add( error );
    },

    errorsFor: function( element ) {
      var name = this.escapeCssMeta( this.idOrName( element ) ),
        describer = $( element ).attr( "aria-describedby" ),
        selector = "label[for='" + name + "'], label[for='" + name + "'] *";

      // 'aria-describedby' should directly reference the error element
      if ( describer ) {
        selector = selector + ", #" + this.escapeCssMeta( describer )
          .replace( /\s+/g, ", #" );
      }

      return this
        .errors()
        .filter( selector );
    },

    // See https://api.jquery.com/category/selectors/, for CSS
    // meta-characters that should be escaped in order to be used with JQuery
    // as a literal part of a name/id or any selector.
    escapeCssMeta: function( string ) {
      return string.replace( /([\\!"#$%&'()*+,./:;<=>?@\[\]^`{|}~])/g, "\\$1" );
    },

    idOrName: function( element ) {
      return this.groups[ element.name ] || ( this.checkable( element ) ? element.name : element.id || element.name );
    },

    validationTargetFor: function( element ) {

      // If radio/checkbox, validate first element in group instead
      if ( this.checkable( element ) ) {
        element = this.findByName( element.name );
      }

      // Always apply ignore filter
      return $( element ).not( this.settings.ignore )[ 0 ];
    },

    checkable: function( element ) {
      return ( /radio|checkbox/i ).test( element.type );
    },

    findByName: function( name ) {
      return $( this.currentForm ).find( "[name='" + this.escapeCssMeta( name ) + "']" );
    },

    getLength: function( value, element ) {
      switch ( element.nodeName.toLowerCase() ) {
      case "select":
        return $( "option:selected", element ).length;
      case "input":
        if ( this.checkable( element ) ) {
          return this.findByName( element.name ).filter( ":checked" ).length;
        }
      }
      return value.length;
    },

    depend: function( param, element ) {
      return this.dependTypes[ typeof param ] ? this.dependTypes[ typeof param ]( param, element ) : true;
    },

    dependTypes: {
      "boolean": function( param ) {
        return param;
      },
      "string": function( param, element ) {
        return !!$( param, element.form ).length;
      },
      "function": function( param, element ) {
        return param( element );
      }
    },

    optional: function( element ) {
      var val = this.elementValue( element );
      return !$.validator.methods.required.call( this, val, element ) && "dependency-mismatch";
    },

    startRequest: function( element ) {
      if ( !this.pending[ element.name ] ) {
        this.pendingRequest++;
        $( element ).addClass( this.settings.pendingClass );
        this.pending[ element.name ] = true;
      }
    },

    stopRequest: function( element, valid ) {
      this.pendingRequest--;

      // Sometimes synchronization fails, make sure pendingRequest is never < 0
      if ( this.pendingRequest < 0 ) {
        this.pendingRequest = 0;
      }
      delete this.pending[ element.name ];
      $( element ).removeClass( this.settings.pendingClass );
      if ( valid && this.pendingRequest === 0 && this.formSubmitted && this.form() ) {
        $( this.currentForm ).submit();
        this.formSubmitted = false;
      } else if ( !valid && this.pendingRequest === 0 && this.formSubmitted ) {
        $( this.currentForm ).triggerHandler( "invalid-form", [ this ] );
        this.formSubmitted = false;
      }
    },

    previousValue: function( element, method ) {
      return $.data( element, "previousValue" ) || $.data( element, "previousValue", {
        old: null,
        valid: true,
        message: this.defaultMessage( element, { method: method } )
      } );
    },

    // Cleans up all forms and elements, removes validator-specific events
    destroy: function() {
      this.resetForm();

      $( this.currentForm )
        .off( ".validate" )
        .removeData( "validator" )
        .find( ".validate-equalTo-blur" )
          .off( ".validate-equalTo" )
          .removeClass( "validate-equalTo-blur" );
    }

  },

  classRuleSettings: {
    required: { required: true },
    email: { email: true },
    url: { url: true },
    date: { date: true },
    dateISO: { dateISO: true },
    number: { number: true },
    digits: { digits: true },
    creditcard: { creditcard: true }
  },

  addClassRules: function( className, rules ) {
    if ( className.constructor === String ) {
      this.classRuleSettings[ className ] = rules;
    } else {
      $.extend( this.classRuleSettings, className );
    }
  },

  classRules: function( element ) {
    var rules = {},
      classes = $( element ).attr( "class" );

    if ( classes ) {
      $.each( classes.split( " " ), function() {
        if ( this in $.validator.classRuleSettings ) {
          $.extend( rules, $.validator.classRuleSettings[ this ] );
        }
      } );
    }
    return rules;
  },

  normalizeAttributeRule: function( rules, type, method, value ) {

    // Convert the value to a number for number inputs, and for text for backwards compability
    // allows type="date" and others to be compared as strings
    if ( /min|max|step/.test( method ) && ( type === null || /number|range|text/.test( type ) ) ) {
      value = Number( value );

      // Support Opera Mini, which returns NaN for undefined minlength
      if ( isNaN( value ) ) {
        value = undefined;
      }
    }

    if ( value || value === 0 ) {
      rules[ method ] = value;
    } else if ( type === method && type !== "range" ) {

      // Exception: the jquery validate 'range' method
      // does not test for the html5 'range' type
      rules[ method ] = true;
    }
  },

  attributeRules: function( element ) {
    var rules = {},
      $element = $( element ),
      type = element.getAttribute( "type" ),
      method, value;

    for ( method in $.validator.methods ) {

      // Support for <input required> in both html5 and older browsers
      if ( method === "required" ) {
        value = element.getAttribute( method );

        // Some browsers return an empty string for the required attribute
        // and non-HTML5 browsers might have required="" markup
        if ( value === "" ) {
          value = true;
        }

        // Force non-HTML5 browsers to return bool
        value = !!value;
      } else {
        value = $element.attr( method );
      }

      this.normalizeAttributeRule( rules, type, method, value );
    }

    // 'maxlength' may be returned as -1, 2147483647 ( IE ) and 524288 ( safari ) for text inputs
    if ( rules.maxlength && /-1|2147483647|524288/.test( rules.maxlength ) ) {
      delete rules.maxlength;
    }

    return rules;
  },

  dataRules: function( element ) {
    var rules = {},
      $element = $( element ),
      type = element.getAttribute( "type" ),
      method, value;

    for ( method in $.validator.methods ) {
      value = $element.data( "rule" + method.charAt( 0 ).toUpperCase() + method.substring( 1 ).toLowerCase() );
      this.normalizeAttributeRule( rules, type, method, value );
    }
    return rules;
  },

  staticRules: function( element ) {
    var rules = {},
      validator = $.data( element.form, "validator" );

    if ( validator.settings.rules ) {
      rules = $.validator.normalizeRule( validator.settings.rules[ element.name ] ) || {};
    }
    return rules;
  },

  normalizeRules: function( rules, element ) {

    // Handle dependency check
    $.each( rules, function( prop, val ) {

      // Ignore rule when param is explicitly false, eg. required:false
      if ( val === false ) {
        delete rules[ prop ];
        return;
      }
      if ( val.param || val.depends ) {
        var keepRule = true;
        switch ( typeof val.depends ) {
        case "string":
          keepRule = !!$( val.depends, element.form ).length;
          break;
        case "function":
          keepRule = val.depends.call( element, element );
          break;
        }
        if ( keepRule ) {
          rules[ prop ] = val.param !== undefined ? val.param : true;
        } else {
          $.data( element.form, "validator" ).resetElements( $( element ) );
          delete rules[ prop ];
        }
      }
    } );

    // Evaluate parameters
    $.each( rules, function( rule, parameter ) {
      rules[ rule ] = $.isFunction( parameter ) && rule !== "normalizer" ? parameter( element ) : parameter;
    } );

    // Clean number parameters
    $.each( [ "minlength", "maxlength" ], function() {
      if ( rules[ this ] ) {
        rules[ this ] = Number( rules[ this ] );
      }
    } );
    $.each( [ "rangelength", "range" ], function() {
      var parts;
      if ( rules[ this ] ) {
        if ( $.isArray( rules[ this ] ) ) {
          rules[ this ] = [ Number( rules[ this ][ 0 ] ), Number( rules[ this ][ 1 ] ) ];
        } else if ( typeof rules[ this ] === "string" ) {
          parts = rules[ this ].replace( /[\[\]]/g, "" ).split( /[\s,]+/ );
          rules[ this ] = [ Number( parts[ 0 ] ), Number( parts[ 1 ] ) ];
        }
      }
    } );

    if ( $.validator.autoCreateRanges ) {

      // Auto-create ranges
      if ( rules.min != null && rules.max != null ) {
        rules.range = [ rules.min, rules.max ];
        delete rules.min;
        delete rules.max;
      }
      if ( rules.minlength != null && rules.maxlength != null ) {
        rules.rangelength = [ rules.minlength, rules.maxlength ];
        delete rules.minlength;
        delete rules.maxlength;
      }
    }

    return rules;
  },

  // Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}
  normalizeRule: function( data ) {
    if ( typeof data === "string" ) {
      var transformed = {};
      $.each( data.split( /\s/ ), function() {
        transformed[ this ] = true;
      } );
      data = transformed;
    }
    return data;
  },

  // http://jqueryvalidation.org/jQuery.validator.addMethod/
  addMethod: function( name, method, message ) {
    $.validator.methods[ name ] = method;
    $.validator.messages[ name ] = message !== undefined ? message : $.validator.messages[ name ];
    if ( method.length < 3 ) {
      $.validator.addClassRules( name, $.validator.normalizeRule( name ) );
    }
  },

  // http://jqueryvalidation.org/jQuery.validator.methods/
  methods: {

    // http://jqueryvalidation.org/required-method/
    required: function( value, element, param ) {

      // Check if dependency is met
      if ( !this.depend( param, element ) ) {
        return "dependency-mismatch";
      }
      if ( element.nodeName.toLowerCase() === "select" ) {

        // Could be an array for select-multiple or a string, both are fine this way
        var val = $( element ).val();
        return val && val.length > 0;
      }
      if ( this.checkable( element ) ) {
        return this.getLength( value, element ) > 0;
      }
      return value.length > 0;
    },

    // http://jqueryvalidation.org/email-method/
    email: function( value, element ) {

      // From https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
      // Retrieved 2014-01-14
      // If you have a problem with this implementation, report a bug against the above spec
      // Or use custom methods to implement your own email validation
      return this.optional( element ) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test( value );
    },

    // http://jqueryvalidation.org/url-method/
    url: function( value, element ) {

      // Copyright (c) 2010-2013 Diego Perini, MIT licensed
      // https://gist.github.com/dperini/729294
      // see also https://mathiasbynens.be/demo/url-regex
      // modified to allow protocol-relative URLs
      return this.optional( element ) || /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test( value );
    },

    // http://jqueryvalidation.org/date-method/
    date: function( value, element ) {
      return this.optional( element ) || !/Invalid|NaN/.test( new Date( value ).toString() );
    },

    // http://jqueryvalidation.org/dateISO-method/
    dateISO: function( value, element ) {
      return this.optional( element ) || /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test( value );
    },

    // http://jqueryvalidation.org/number-method/
    number: function( value, element ) {
      return this.optional( element ) || /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test( value );
    },

    // http://jqueryvalidation.org/digits-method/
    digits: function( value, element ) {
      return this.optional( element ) || /^\d+$/.test( value );
    },

    // http://jqueryvalidation.org/minlength-method/
    minlength: function( value, element, param ) {
      var length = $.isArray( value ) ? value.length : this.getLength( value, element );
      return this.optional( element ) || length >= param;
    },

    // http://jqueryvalidation.org/maxlength-method/
    maxlength: function( value, element, param ) {
      var length = $.isArray( value ) ? value.length : this.getLength( value, element );
      return this.optional( element ) || length <= param;
    },

    // http://jqueryvalidation.org/rangelength-method/
    rangelength: function( value, element, param ) {
      var length = $.isArray( value ) ? value.length : this.getLength( value, element );
      return this.optional( element ) || ( length >= param[ 0 ] && length <= param[ 1 ] );
    },

    // http://jqueryvalidation.org/min-method/
    min: function( value, element, param ) {
      return this.optional( element ) || value >= param;
    },

    // http://jqueryvalidation.org/max-method/
    max: function( value, element, param ) {
      return this.optional( element ) || value <= param;
    },

    // http://jqueryvalidation.org/range-method/
    range: function( value, element, param ) {
      return this.optional( element ) || ( value >= param[ 0 ] && value <= param[ 1 ] );
    },

    // http://jqueryvalidation.org/step-method/
    step: function( value, element, param ) {
      var type = $( element ).attr( "type" ),
        errorMessage = "Step attribute on input type " + type + " is not supported.",
        supportedTypes = [ "text", "number", "range" ],
        re = new RegExp( "\\b" + type + "\\b" ),
        notSupported = type && !re.test( supportedTypes.join() );

      // Works only for text, number and range input types
      // TODO find a way to support input types date, datetime, datetime-local, month, time and week
      if ( notSupported ) {
        throw new Error( errorMessage );
      }
      return this.optional( element ) || ( value % param === 0 );
    },

    // http://jqueryvalidation.org/equalTo-method/
    equalTo: function( value, element, param ) {

      // Bind to the blur event of the target in order to revalidate whenever the target field is updated
      var target = $( param );
      if ( this.settings.onfocusout && target.not( ".validate-equalTo-blur" ).length ) {
        target.addClass( "validate-equalTo-blur" ).on( "blur.validate-equalTo", function() {
          $( element ).valid();
        } );
      }
      return value === target.val();
    },

    // http://jqueryvalidation.org/remote-method/
    remote: function( value, element, param, method ) {
      if ( this.optional( element ) ) {
        return "dependency-mismatch";
      }

      method = typeof method === "string" && method || "remote";

      var previous = this.previousValue( element, method ),
        validator, data, optionDataString;

      if ( !this.settings.messages[ element.name ] ) {
        this.settings.messages[ element.name ] = {};
      }
      previous.originalMessage = previous.originalMessage || this.settings.messages[ element.name ][ method ];
      this.settings.messages[ element.name ][ method ] = previous.message;

      param = typeof param === "string" && { url: param } || param;
      optionDataString = $.param( $.extend( { data: value }, param.data ) );
      if ( previous.old === optionDataString ) {
        return previous.valid;
      }

      previous.old = optionDataString;
      validator = this;
      this.startRequest( element );
      data = {};
      data[ element.name ] = value;
      $.ajax( $.extend( true, {
        mode: "abort",
        port: "validate" + element.name,
        dataType: "json",
        data: data,
        context: validator.currentForm,
        success: function( response ) {
          var valid = response === true || response === "true",
            errors, message, submitted;

          validator.settings.messages[ element.name ][ method ] = previous.originalMessage;
          if ( valid ) {
            submitted = validator.formSubmitted;
            validator.resetInternals();
            validator.toHide = validator.errorsFor( element );
            validator.formSubmitted = submitted;
            validator.successList.push( element );
            validator.invalid[ element.name ] = false;
            validator.showErrors();
          } else {
            errors = {};
            message = response || validator.defaultMessage( element, { method: method, parameters: value } );
            errors[ element.name ] = previous.message = message;
            validator.invalid[ element.name ] = true;
            validator.showErrors( errors );
          }
          previous.valid = valid;
          validator.stopRequest( element, valid );
        }
      }, param ) );
      return "pending";
    }
  }

} );

// Ajax mode: abort
// usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
// if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort()

var pendingRequests = {},
  ajax;

// Use a prefilter if available (1.5+)
if ( $.ajaxPrefilter ) {
  $.ajaxPrefilter( function( settings, _, xhr ) {
    var port = settings.port;
    if ( settings.mode === "abort" ) {
      if ( pendingRequests[ port ] ) {
        pendingRequests[ port ].abort();
      }
      pendingRequests[ port ] = xhr;
    }
  } );
} else {

  // Proxy ajax
  ajax = $.ajax;
  $.ajax = function( settings ) {
    var mode = ( "mode" in settings ? settings : $.ajaxSettings ).mode,
      port = ( "port" in settings ? settings : $.ajaxSettings ).port;
    if ( mode === "abort" ) {
      if ( pendingRequests[ port ] ) {
        pendingRequests[ port ].abort();
      }
      pendingRequests[ port ] = ajax.apply( this, arguments );
      return pendingRequests[ port ];
    }
    return ajax.apply( this, arguments );
  };
}

}));
/*END JQUERY PLUGINS*/
(function ($) {

	/*==========FOR SVG ==============*/
	svg4everybody();

  /*==========FOR SLIDER-TOP index.html ==============*/
  $(document).on('ready', function() {
    $(".slider-top").slick({
      dots: true,
      lazyLoad: 'ondemand',
      infinite: true,
      arrows: false
    });
  });

  $(document).on('ready', function() {
    $(".slider-ui").slick({
      dots: true,
      lazyLoad: 'ondemand',
      infinite: true
    });
  });

  $(document).on('ready', function() {
    $(".slider-features").slick({
      dots: true,
      arrows: false,
      lazyLoad: 'ondemand',
      infinite: true
    });
  });

  $(document).on('ready', function() {
    $(".slider-mobile").slick({
      dots: true,
      arrows: false,
      lazyLoad: 'ondemand',
      infinite: true,
      slidesToShow: 4,
      rows: 2,
      slidesPerRow: 2,
      responsive: [
        {
          breakpoint: 1280,
          settings: {
            rows: 1,
            slidesPerRow: 4
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            dots: true,
            rows: 1,
            slidesPerRow: 1
          }
        },
      ]
    });
  });

  $(document).on('ready', function() {
    $(".slider-question").slick({
      slidesToShow: 5,
      slidesToScroll: 1,
      arrows: false,
      asNavFor: '.slider-faq',
      centerMode: true,
      infinite: true,
      dots: true,
      focusOnSelect: true,
      appendDots: $('.dots-question'),
      responsive: [
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          }
        },
        {
          breakpoint: 1280,
          settings: {
            centerMode: true,
            centerPadding: '0px',
            slidesToShow: 3,
            slidesToScroll: 1,
          }
        }
      ]
    });
    $(".slider-faq").slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      dots: false,
      focusOnSelect: true,
      initialSlide: 3, // начальный слайд
      infinite: true,
      asNavFor: '.slider-question',
      arrows: false
    });
  });

  $(document).on('ready', function() {
    $(".slider-license").slick({
      dots: true,
      lazyLoad: 'ondemand',
      infinite: false,
      slidesToShow: 3,
      responsive: [
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            dots: true
          }
        }
      ]
    });
  });

  $('.grid').isotope({
    itemSelector: '.grid-item',
    percentPosition: true,
    masonry: {
      columnWidth: '.grid-sizer'
    }
  });

  $('.selectize').SumoSelect({
    search: true,
    searchText:"Поиск",
    csvDispCount: 2,
    captionFormat:'{0} Выбрано',
    captionFormatAllSelected:'Выбраны все {0}',
    nativeOnDevice: ['Opera Mini', 'IEMobile', 'Silk'],
    selectAll: true,
    okCancelInMulti: false,
    isClickAwayOk: false,
    noMatch: 'Не найдено "{0}"',
    locale: ['ОК', 'Отменить', 'Выбрать все'],
    sortField: 'text'
  });
/*MENU*/
$('.main-nav').on("click", function(){
  $('body').toggleClass('open-menu');
  document.ontouchmove = function(e){ e.preventDefault(); }
})
$('.modal-menu__close').on("click", function(){
  $('body').toggleClass('open-menu');
  document.ontouchmove = function(e){ return true; }
})
$('.main-nav--close').on("click", function(){
  $('body').toggleClass('open-menu');
  document.ontouchmove = function(e){ return true; }
})

// START Scroll order.html
function scrollToNextStep(event) {
  event.preventDefault();
  var id  = $(this).attr('href'),
  top = $(id).offset().top;
  $('body,html').animate({scrollTop: top}, 1500);
};
$("#step1").on("click","a", scrollToNextStep);
$("#step2").on("click","a", scrollToNextStep);
$("#step3").on("click","a", scrollToNextStep);
$("#step4").on("click","a", scrollToNextStep);

// END Scroll order.html

// form
  $(function () {
    $.validator.setDefaults({ ignore: ":hidden:not(select)" })
    /* RULES */
    $("#form-login-header").validate({
      focusCleanup: true,
      focusInvalid: true,
      rules: {
        loginNameHeader: "required",
        loginPasswordHeader: "required"
      },
      messages: {
        loginNameHeader: "",
        loginPasswordHeader: ""
      }
    });
    $("#form-login-footer").validate({
      focusCleanup: true,
      focusInvalid: true,
      rules: {
        loginNameFooter: "required",
        loginPasswordFooter: "required"
      },
      messages: {
        loginNameFooter: "",
        loginPasswordFooter: ""
      }
    });
    $("#faq-form-valid").validate({
      focusCleanup: true,
      focusInvalid: true,
      messages: {
        required: "Required input"
      }
    });
    $("#order-form-valid").validate({
      focusCleanup: true,
      focusInvalid: true,
      rules: {
        name: "required",
        surname: "required",
        age: "required",
        country: "required",
        delivery: "required",
        country2: "required",
        city: "required",
        address: "required",
        dayBirth: "required",
        monthBirth: "required",
        yearBirth: "required",
        licenseNumber: "required",
        monthLicense: "required",
        yearLicense: "required",
        country4: "required",
        city2: "required",
        address2: "required",
        name2: "required",
        surname2: "required"
      },
      messages: {
        name: '',
        surname: '',
        age: '',
        country: '',
        delivery: '',
        country2: '',
        city: '',
        address: '',
        dayBirth: '',
        monthBirth: '',
        yearBirth: '',
        licenseNumber: '',
        monthLicense: '',
        yearLicense: '',
        country4: "",
        city2: "",
        address2: "",
        name2: "",
        surname2: ""
      }
    });
    $("#order-form-valid-copy").validate({
      focusCleanup: true,
      focusInvalid: true,
      rules: {
        name: "required",
        surname: "required",
        age: "required",
        country: "required",
        delivery: "required",
        country2: "required",
        city: "required",
        address: "required",
        dayBirth: "required",
        monthBirth: "required",
        yearBirth: "required",
        licenseNumber: "required",
        monthLicense: "required",
        yearLicense: "required",
        country4: "required",
        city2: "required",
        address2: "required",
        name2: "required",
        surname2: "required"
      },
      messages: {
        name: '',
        surname: '',
        age: '',
        country: '',
        delivery: '',
        country2: '',
        city: '',
        address: '',
        dayBirth: '',
        monthBirth: '',
        yearBirth: '',
        licenseNumber: '',
        monthLicense: '',
        yearLicense: '',
        country4: "",
        city2: "",
        address2: "",
        name2: "",
        surname2: ""
      }
    });
    $("#registration-form-valid").validate({
      focusCleanup: true,
      focusInvalid: true,
      rules: {
        name: "required",
        surname: "required",
        country: "required",
        city: "required",
        address: "required",
        email: "required",
        password: "required",
        phone: "required",
        password2: "required"
      },
      messages: {
        name: "",
        surname: "",
        country: "",
        city: "",
        address: "",
        email: "",
        password: "",
        phone: "",
        password2: ""
      }
    });
  });

// end form
  function loadPhotoForm() {
    var countFiles = $(this)[0].files.length;
    var imgPath = $(this)[0].value;
    var extn = imgPath.substring(imgPath.lastIndexOf('.') + 1).toLowerCase();
    var idImage = $(this).attr('data-image'),
        idLabel = $(this).attr('data-label');
    var image_holder = $('#' + idImage),
        label = $('#' + idLabel);
    var file_name = this.value.replace(/\\/g, '/').replace(/.*\//, '');
    image_holder.empty();
    if (extn == "gif" || extn == "png" || extn == "jpg" || extn == "jpeg") {
      $(label).text(file_name);
      if (typeof(FileReader) != "undefined") {
        for (var i = 0; i < countFiles; i++)
        {
          var reader = new FileReader();
          reader.onload = function(e) {
            image_holder.prop('src', e.target.result).css('opacity', '1')
            image_holder.prop('alt', e.target.result)
            // $('.uploads-image > img').css('opacity', '1')
          }
          image_holder.show();
          reader.readAsDataURL($(this)[0].files[i]);
        }
      } else {
        alert("Браузер не поддерживает загрузку изображений.");
      }
    } else {
      alert("Выберите только одно изображение , которое поддерживает форматы .gif, .png, .jpeg");
    }
  };

  $(".inputfile").on('change', loadPhotoForm);
  $(".inputfile-certificate").on('change', loadPhotoForm);
  $(".inputfile-signature").on('change', loadPhotoForm);
  $(".inputfile-photo").on('change', loadPhotoForm);

  // Модальное окно личный кабинет
  $('.button-widget__btn').on("click", function(){
    // $('.modal-settings').toggleClass('modal-settings--show');
    $('.modal').toggleClass('modal--show');
    // $('.wrapper').css('filter', 'blur(5px)');
    $('body').css('overflow', 'hidden');
    // document.ontouchmove = function(e){ return true; }
  });
  $('.modal-settings__btn').on("click", function(){
    // $('.modal-settings').toggleClass('modal-settings--show');
    $('.modal').toggleClass('modal--show');
    // $('.wrapper').css('filter', 'none');
    $('body').css('overflow', 'auto');
    // document.ontouchmove = function(e){ return true; }
  });

})(jQuery);

var languageBtn = document.querySelector('.language__current');
var languageSubmenu = document.querySelector('.submenu-lang');
var languageClose = document.querySelector('.language__close');
var btnOrderHeader = document.querySelector('.btn-order--header');
var submenuOrderHeader = document.querySelector('.submenu-order--header');
var btnOrderHeaderClose = document.querySelector('btn-order--header-close')
// Открыть меню с языком
languageBtn.addEventListener("mouseover", function(event){
  event.preventDefault();
  languageSubmenu.classList.add('submenu-lang--show');
});
languageSubmenu.addEventListener("mouseover", function(event){
  event.preventDefault();
  languageSubmenu.classList.add('submenu-lang--show');
});

// Закрыть меню с языком
languageSubmenu.addEventListener("mouseout", function(event){
  event.preventDefault();
  languageSubmenu.classList.remove('submenu-lang--show');
});

  // Открытие/закрытие модального окна для меню в хэдере
var mainNavOpen = document.querySelector('.main-nav');
var mainNavClose = document.querySelector('.modal-menu__close');
var mainModal = document.querySelector('.modal-menu');
var footerNavOpen = document.querySelector('.main-nav--footer');

mainNavOpen.addEventListener("click", function(event){
  if (window.innerWidth < 1366) {
    event.preventDefault();
    mainModal.classList.toggle('modal-menu--show');
    mainNavOpen.classList.toggle('main-nav--close');
  }
});

footerNavOpen.addEventListener("click", function(event){
  if (window.innerWidth < 1280) { // Не должно работать на десктопе
    event.preventDefault();
    mainModal.classList.toggle('modal-menu--show');
    $('html, body').animate({scrollTop:0}, 1);
    mainNavOpen.classList.toggle('main-nav--close');
  }
});

mainNavClose.addEventListener("click", function(event){
  event.preventDefault();
  mainModal.classList.remove('modal-menu--show');
  mainNavOpen.classList.remove('main-nav--close');
});

var headerBlock = document.querySelector('.header');
var searchButton = headerBlock.querySelector('.search__btn');
var searchInputModal = mainModal.querySelector('[name=search-input]');
var searchBlock = headerBlock.querySelector('.search');

var footerBlock = document.querySelector('.footer');
var searchButtonFooter = footerBlock.querySelector('.search__btn');
var searchBlockFooter = footerBlock.querySelector('.search');

searchButton.addEventListener("click", function(event){
    event.preventDefault();
  if (window.innerWidth < 768) { // Не должно работать на десктопе
    mainModal.classList.toggle('modal-menu--show');
    $('body').toggleClass('open-menu');
    mainNavOpen.classList.toggle('main-nav--close');
    searchInputModal.focus();
  } else {
    searchBlock.classList.add('search--show');
  }

  document.addEventListener("click", function(event) {
    var seachBlockShow = headerBlock.querySelector('.search--show');
    if (seachBlockShow) {
      onCloseHeader(event);
    }
  });
});

function onCloseHeader(e) {
  if( !e ) e = window.event; // <---needed this --- and this ->--+
  var target = e.target;
  while (target !== document) {
    if (target.classList.contains('search--show')) {
      return;
    }
    target = target.parentNode;
  }
  searchBlock.classList.remove('search--show');
}

function onCloseFooter(e) {
  if( !e ) e = window.event; // <---needed this --- and this ->--+
  var target = e.target;
  while (target !== document) {
    if (target.classList.contains('search--show')) {
      return;
    }
    target = target.parentNode;
  }
  searchBlockFooter.classList.remove('search--show');
}

searchButtonFooter.addEventListener("click", function(event){
    event.preventDefault();
  if (window.innerWidth < 768) { // Не должно работать на десктопе
    mainModal.classList.toggle('modal-menu--show');
    mainNavOpen.classList.toggle('main-nav--close');
    searchInputModal.focus();
  } else {
    searchBlockFooter.classList.add('search--show');
  }

  document.addEventListener("click", function(event) {
    var searchBlockShow = footerBlock.querySelector('.search--show');
    if (searchBlockShow) {
      onCloseFooter(event);
    }
  });
});

// Закрытие окон на странице grid
function addClass (button, modal, add) {
  button.addEventListener("click", function(event){
    event.preventDefault();
    modal.classList.add(add);
  });
}

function toggleClass (button, modal, toggle) {
  button.addEventListener("click", function(event){
    event.preventDefault();
    modal.classList.toggle(toggle);
  });
}

var grid = document.querySelector('.grid');
if (grid) {
  var closeApplication = grid.querySelector('.application__close');
  var gridApplication = grid.querySelector('.application');
  if (closeApplication) {
    addClass(closeApplication, gridApplication, 'application--close');
  }

  var closeStatistic = grid.querySelector('.statistic__close');
  var gridStatistic = grid.querySelector('.statistic');
  if (closeStatistic) {
    addClass(closeStatistic, gridStatistic,'statistic--close');
  }

  var closeBalance = grid.querySelector('.balance__close');
  var gridBalance = grid.querySelector('.balance');
  if (closeBalance) {
    addClass(closeBalance, gridBalance,'balance--close');
  }

  var closeAgents = grid.querySelector('.agents__close');
  var gridAgents = grid.querySelector('.agents');
  if (closeAgents) {
    addClass(closeAgents, gridAgents,'agents--close');
  }

  var closePrice = grid.querySelector('.price__close');
  var gridPrice = grid.querySelector('.price');
  if (closePrice) {
    addClass(closePrice, gridPrice,'price--close');
  }

  var closeData = grid.querySelector('.data__close');
  var gridData = grid.querySelector('.data');
  if (closeData) {
    addClass(closeData, gridData,'data--close');
  }

  var closeTarif = grid.querySelector('.tarif__close');
  var gridTarif = grid.querySelector('.tarif');
  if (closeTarif) {
    addClass(closeTarif, gridTarif,'tarif--close');
  }

  var closeMap = grid.querySelector('.map__close');
  var gridMap = grid.querySelector('.map');
  if (closeMap) {
    addClass(closeMap, gridMap,'map--close');
  }
}

var pageContacts = document.querySelector('.contacts');
if (pageContacts) {
  var btnShowRequisites = pageContacts.querySelector('.show-requisites');
  var requisitesBlock = pageContacts.querySelector('.contacts-requisites');
  var btnCloseRequisites = pageContacts.querySelector('.close-modal');

  btnShowRequisites.addEventListener("click", function(event){
    event.preventDefault();
    $('html, body').animate({scrollTop:0}, 'fast');
    requisitesBlock.classList.toggle('contacts-requisites--show');
    $('body').toggleClass('open-menu');
    document.ontouchmove = function(e){ e.preventDefault(); }
  });
  btnCloseRequisites.addEventListener("click", function(event){
    event.preventDefault();
    $('html, body').animate({scrollTop:0}, 'fast');
    requisitesBlock.classList.toggle('contacts-requisites--show');
    $('body').toggleClass('open-menu');
    document.ontouchmove = function(e){ return true; }
  });


  var btnContactsOfficeClose = pageContacts.querySelector('.btn-close');
  var btnContactsOfficeOpen = pageContacts.querySelector('.show-address');
  var contactsList = pageContacts.querySelector('.contacts-list');
  btnContactsOfficeClose.addEventListener("click", function(event){
    event.preventDefault();
    $('html, body').animate({scrollTop:0}, 'fast');
    contactsList.classList.toggle('contacts-list--show');
    $('body').toggleClass('open-menu');
    document.ontouchmove = function(e){ return true; }
  });
  btnContactsOfficeOpen.addEventListener("click", function(event){
    event.preventDefault();
    $('html, body').animate({scrollTop:0}, 'fast');
    contactsList.classList.toggle('contacts-list--show');
    $('body').toggleClass('open-menu');
    document.ontouchmove = function(e){ e.preventDefault(); }
  });
  if (window.innerWidth < 768) {
    var officeRussia = pageContacts.querySelector('.contacts-item--russia');
    var officeUsa = pageContacts.querySelector('.contacts-item--usa');
    var officeChina = pageContacts.querySelector('.contacts-item--china');
    var officeTitleRussia = pageContacts.querySelector('.office-item--russia');
    var officeTitleUsa = pageContacts.querySelector('.office-item--usa');
    var officeTitleChina = pageContacts.querySelector('.office-item--china');
    var contactsInfoBlock = pageContacts.querySelector('.contacts-info');
    var contactsInfoRussia = contactsInfoBlock.querySelector('.contacts-item--russia');
    var contactsInfoUsa = contactsInfoBlock.querySelector('.contacts-item--usa');
    var contactsInfoChina = contactsInfoBlock.querySelector('.contacts-item--china');
    officeRussia.addEventListener('click', function(event){
      officeUsa.classList.remove('hidden-block');
      officeChina.classList.remove('hidden-block');
      officeRussia.classList.add('hidden-block');
      officeTitleRussia.classList.remove('hidden-block');
      officeTitleUsa.classList.add('hidden-block');
      officeTitleChina.classList.add('hidden-block');
      contactsList.classList.toggle('contacts-list--show');
      contactsInfoRussia.classList.add('contacts-item--show');
      contactsInfoUsa.classList.remove('contacts-item--show');
      contactsInfoChina.classList.remove('contacts-item--show');
      $('body').toggleClass('open-menu');
      document.ontouchmove = function(e){ return true; }
    });
    officeUsa.addEventListener('click', function(event){
      officeUsa.classList.add('hidden-block');
      officeChina.classList.remove('hidden-block');
      officeRussia.classList.remove('hidden-block');
      officeTitleRussia.classList.add('hidden-block');
      officeTitleUsa.classList.remove('hidden-block');
      officeTitleChina.classList.add('hidden-block');
      contactsList.classList.toggle('contacts-list--show');
      contactsInfoRussia.classList.remove('contacts-item--show');
      contactsInfoUsa.classList.add('contacts-item--show');
      contactsInfoChina.classList.remove('contacts-item--show');
      $('body').toggleClass('open-menu');
      document.ontouchmove = function(e){ return true; }
    });
    officeChina.addEventListener('click', function(event){
      officeUsa.classList.remove('hidden-block');
      officeChina.classList.add('hidden-block');
      officeRussia.classList.remove('hidden-block');
      officeTitleRussia.classList.add('hidden-block');
      officeTitleUsa.classList.add('hidden-block');
      officeTitleChina.classList.remove('hidden-block');
      contactsList.classList.toggle('contacts-list--show');
      contactsInfoRussia.classList.remove('contacts-item--show');
      contactsInfoUsa.classList.remove('contacts-item--show');
      contactsInfoChina.classList.add('contacts-item--show');
      $('body').toggleClass('open-menu');
      document.ontouchmove = function(e){ return true; }
    });
  } else {
    officeUsa.classList.remove('hidden-block');
    officeChina.classList.remove('hidden-block');
    officeRussia.classList.remove('hidden-block');
    officeTitleRussia.classList.add('hidden-block');
    officeTitleUsa.classList.add('hidden-block');
    officeTitleChina.classList.add('hidden-block');
  }
}

// Открытие модалки с текстом рыбой на order.html
$('.step-3-load-photo').find('.step-3-faq__btn').on("click", function(){
  $('.step-3-load-photo').find('.step-3-faq__modal').toggleClass('step-3-faq__modal--active');
})
$('.step-3-load-signature').find('.step-3-faq__btn').on("click", function(){
  $('.step-3-load-signature').find('.step-3-faq__modal').toggleClass('step-3-faq__modal--active');
})
$('.step-3-load-certificate').find('.step-3-faq__btn').on("click", function(){
  $('.step-3-load-certificate').find('.step-3-faq__modal').toggleClass('step-3-faq__modal--active');
})
