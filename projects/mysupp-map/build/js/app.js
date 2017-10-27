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

/*END JQUERY PLUGINS*/
(function ($) {

  /*========== Переопределение тумана в скроллбаре ==============*/
  var div_sh = $('.scrollbar').height(),
    div_h = $('.scrollbar-inner').height();
  $('.scrollbar').scroll(function(){
      if ($(this).scrollTop() >=  div_h - div_sh - 500) {
        $('.results__list').addClass('shadow-none');
      }
      else {
        $('.results__list').removeClass('shadow-none');
      }
  });
	/*==========FOR SVG ==============*/
	svg4everybody();

  // Замена содержания кнопки
  $(function(){
    var $button    = $('.results__btn-skip');

    $button.on('click', function(){
      var toggleText = $(this).data('toggle-text');
      $(this).data('toggle-text', $(this).text())
             .text(toggleText);
    });
  });

  // Селекты
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

  // Кнопки
  var noJS = document.querySelector(".no-js");
  var openFilter = document.querySelector(".results__btn-filter");
  var modalFilter = document.querySelector(".filter");
  var closeFilter = document.querySelector(".filter__toggle");
  var btnCloseFilter = document.querySelector(".filter-form__btn");
  var modalResults = document.querySelector(".results");
  var resultFold = document.querySelector(".results__btn-skip");
  var resultShow = document.querySelector(".results__btn-show");

  noJS.classList.remove('no-js');

  openFilter.addEventListener("click", function(event) {
    event.preventDefault();
    modalFilter.classList.toggle("filter--show");
    // modalResults.classList.add("results--fold");
    openFilter.classList.toggle("results__btn-filter--open");
  });

  closeFilter.addEventListener("click", function(event){
      event.preventDefault();
      modalFilter.classList.remove("filter--show");
  });

  // Закрытие окна с фильтрами с помощью esc
  window.addEventListener("keydown", function(event) {
    if (event.keyCode === 27) {
      if (modalFilter.classList.contains("filter--show")) {
        modalFilter.classList.remove("filter--show");
        openFilter.classList.remove("results__btn-filter--open");
      }
    }
  });

  // Тоже самое что и closeFilter
  btnCloseFilter.addEventListener("click", function(event){
    event.preventDefault();
    modalFilter.classList.remove("filter--show");
  });

  resultFold.addEventListener("click", function(event){
    event.preventDefault();
    modalResults.classList.toggle("results--fold");
  });

  // Яндекс Карта
  ymaps.ready(function () {
    var myMap = new ymaps.Map('map', {
      center: [59.940688, 30.325052],
      zoom: 13,
      scroll: false,
      controls: ['zoomControl']
    }, {
      searchControlProvider: 'yandex#search'
    }),

    // Создаём макет содержимого.
    MyIconContentLayout = ymaps.templateLayoutFactory.createClass(
      '<div style="color: #FFFFFF; font-weight: bold;">$[properties.iconContent]</div>'
      ),

    myPlacemark1 = new ymaps.Placemark([59.958125, 30.319001], {
        balloonContent: '<strong>Форум-Авто</strong><br>г.Санкт-Петербург пр. Народного Ополчения 201<br>7 (911) 951-27-79, 7 (911) 951-34-09'
    }, {
        // Опции.
        // Необходимо указать данный тип макета.
        iconLayout: 'default#image',
        // Своё изображение иконки метки.
        iconImageHref: 'images/pin.png',
        // Размеры метки.
        iconImageSize: [48, 66]
      }, {
        balloonPanelMaxMapArea: 0
      });

    myPlacemark2 = new ymaps.Placemark([59.961015, 30.365436], {
        balloonContent: '<strong>Форум-Авто</strong><br>г.Санкт-Петербург пр. Народного Ополчения 201<br>7 (911) 951-27-79, 7 (911) 951-34-09'
    }, {
      // Опции.
      // Необходимо указать данный тип макета.
      iconLayout: 'default#image',
      // Своё изображение иконки метки.
      iconImageHref: 'images/pin.png',
      // Размеры метки.
      iconImageSize: [48, 66],
    });

    myPlacemark3 = new ymaps.Placemark([59.956000, 30.350781], {
      balloonContent: '<strong>Форум-Авто</strong><br>г.Санкт-Петербург пр. Народного Ополчения 201<br>7 (911) 951-27-79, 7 (911) 951-34-09'    }, {
      // Опции.
      // Необходимо указать данный тип макета.
      iconLayout: 'default#image',
      // Своё изображение иконки метки.
      iconImageHref: 'images/pin.png',
      // Размеры метки.
      iconImageSize: [48, 66],
    });

    myPlacemark4 = new ymaps.Placemark([59.951965, 30.342584], {
      balloonContent: '<strong>Форум-Авто</strong><br>г.Санкт-Петербург пр. Народного Ополчения 201<br>7 (911) 951-27-79, 7 (911) 951-34-09'    }, {
      // Опции.
      // Необходимо указать данный тип макета.
      iconLayout: 'default#image',
      // Своё изображение иконки метки.
      iconImageHref: 'images/pin.png',
      // Размеры метки.
      iconImageSize: [48, 66],
    });

    myPlacemark5 = new ymaps.Placemark([59.936011, 30.318852], {
      balloonContent: '<strong>Форум-Авто</strong><br>г.Санкт-Петербург пр. Народного Ополчения 201<br>7 (911) 951-27-79, 7 (911) 951-34-09'    }, {
      // Опции.
      // Необходимо указать данный тип макета.
      iconLayout: 'default#image',
      // Своё изображение иконки метки.
      iconImageHref: 'images/pin.png',
      // Размеры метки.
      iconImageSize: [48, 66],
    });

    myPlacemark6 = new ymaps.Placemark([59.933534, 30.344730], {
      balloonContent: '<strong>Форум-Авто</strong><br>г.Санкт-Петербург пр. Народного Ополчения 201<br>7 (911) 951-27-79, 7 (911) 951-34-09'    }, {
      // Опции.
      // Необходимо указать данный тип макета.
      iconLayout: 'default#image',
      // Своё изображение иконки метки.
      iconImageHref: 'images/pin.png',
      // Размеры метки.
      iconImageSize: [48, 66],
    });

    myPlacemark7 = new ymaps.Placemark([59.922268, 30.336104], {
      balloonContent: '<strong>Форум-Авто</strong><br>г.Санкт-Петербург пр. Народного Ополчения 201<br>7 (911) 951-27-79, 7 (911) 951-34-09'
    }, {
      // Опции.
      // Необходимо указать данный тип макета.
      iconLayout: 'default#image',
      // Своё изображение иконки метки.
      iconImageHref: 'images/pin.png',
      // Размеры метки.
      iconImageSize: [48, 66],
    });

    // отключил зум
    myMap.behaviors.disable('scrollZoom'),
    // Изменение положения панели управления
    myMap.controls.get('zoomControl').options.set('position', { right: 50, top: 150 }),

    myMap.geoObjects
    .add(myPlacemark1)
    .add(myPlacemark2)
    .add(myPlacemark3)
    .add(myPlacemark4)
    .add(myPlacemark5)
    .add(myPlacemark6)
    .add(myPlacemark7)
  });
  // // observeEvents(myMap);
  myPlacemark1.balloon.open();
  myPlacemark2.balloon.open();
  myPlacemark3.balloon.open();
  myPlacemark4.balloon.open();
  myPlacemark5.balloon.open();
  myPlacemark6.balloon.open();
  myPlacemark7.balloon.open();

  })(jQuery);