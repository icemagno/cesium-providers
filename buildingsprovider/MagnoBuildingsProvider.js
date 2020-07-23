/**
    * An {@link ImageryProvider} that draws a box around every rendered tile in the tiling scheme, and draws
    * a label inside it indicating the X, Y, Level coordinates of the tile.  This is mostly useful for
    * debugging terrain and imagery rendering problems.
    *
    * @alias MagnoEmptyProvider
    * @constructor
    *
    * @param {Object} [options] Object with the following properties:
    * @param {TilingScheme} [options.tilingScheme=new GeographicTilingScheme()] The tiling scheme for which to draw tiles.
    * @param {Ellipsoid} [options.ellipsoid] The ellipsoid.  If the tilingScheme is specified,
    *                    this parameter is ignored and the tiling scheme's ellipsoid is used instead. If neither
    *                    parameter is specified, the WGS84 ellipsoid is used.
    * @param {Color} [options.color=Color.YELLOW] The color to draw the tile box and label.
    * @param {Number} [options.tileWidth=256] The width of the tile for level-of-detail selection purposes.
    * @param {Number} [options.tileHeight=256] The height of the tile for level-of-detail selection purposes.
    */

var MagnoEmptyProvider = function MagnoEmptyProvider(options) {
    
    if ( !Cesium.defined(options) ) {
        throw new DeveloperError("options is required.");
	}    
    
    if ( !Cesium.defined( options.viewer ) ) {
        throw new DeveloperError("options.viewer is required.");
    }    
    
    this._requestImage = Cesium.defaultValue(options.requestImage, null );
    this._requestFeatures = Cesium.defaultValue(options.requestFeatures, null );
    this._minimumLevel = Cesium.defaultValue(options.minimumLevel, 0);
    this._activationLevel = Cesium.defaultValue(options.activationLevel, 17);
    this._maximumLevel = Cesium.defaultValue(options.maximumLevel, 22);
    this._tilingScheme = Cesium.defined(options.tilingScheme) ? options.tilingScheme : new Cesium.GeographicTilingScheme({ ellipsoid: options.ellipsoid });
    this._color = Cesium.defaultValue(options.color, Cesium.Color.YELLOW);
    this._errorEvent = new Cesium.Event();
    this._tileWidth = Cesium.defaultValue(options.tileWidth, 256);
    this._tileHeight = Cesium.defaultValue(options.tileHeight, 256);
    this._readyPromise = Cesium.when.resolve(true);
    this._debugTiles =  Cesium.defaultValue(options.debugTiles, false);
    this._viewer =  options.viewer;
    this._localCache = {};
}

Cesium.defineProperties(MagnoEmptyProvider.prototype, {
	
    localCache : {
        get : function() {
            return this._localCache;
        }
    },
	
	
    /**
     * Gets the proxy used by this provider.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Proxy}
     * @readonly
     */
    proxy : {
        get : function() {
            return undefined;
        }
    },

    /**
     * Gets the width of each tile, in pixels. This function should
     * not be called before {@link TileCoordinatesImageryProvider#ready} returns true.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Number}
     * @readonly
     */
    tileWidth : {
        get : function() {
            return this._tileWidth;
        }
    },

    /**
     * Gets the height of each tile, in pixels.  This function should
     * not be called before {@link TileCoordinatesImageryProvider#ready} returns true.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Number}
     * @readonly
     */
    tileHeight: {
        get : function() {
            return this._tileHeight;
        }
    },

    /**
     * Gets the maximum level-of-detail that can be requested.  This function should
     * not be called before {@link TileCoordinatesImageryProvider#ready} returns true.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Number}
     * @readonly
     */
    maximumLevel : {
        get : function() {
            return this._maximumLevel;
        }
    },

    /**
     * Gets the minimum level-of-detail that can be requested.  This function should
     * not be called before {@link TileCoordinatesImageryProvider#ready} returns true.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Number}
     * @readonly
     */
    minimumLevel : {
        get : function() {
            return this._minimumLevel;
        }
    },

    /**
     * Gets the tiling scheme used by this provider.  This function should
     * not be called before {@link TileCoordinatesImageryProvider#ready} returns true.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {TilingScheme}
     * @readonly
     */
    tilingScheme : {
        get : function() {
            return this._tilingScheme;
        }
    },

    /**
     * Gets the rectangle, in radians, of the imagery provided by this instance.  This function should
     * not be called before {@link TileCoordinatesImageryProvider#ready} returns true.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Rectangle}
     * @readonly
     */
    rectangle : {
        get : function() {
            return this._tilingScheme.rectangle;
        }
    },

    /**
     * Gets the tile discard policy.  If not undefined, the discard policy is responsible
     * for filtering out "missing" tiles via its shouldDiscardImage function.  If this function
     * returns undefined, no tiles are filtered.  This function should
     * not be called before {@link TileCoordinatesImageryProvider#ready} returns true.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {TileDiscardPolicy}
     * @readonly
     */
    tileDiscardPolicy : {
        get : function() {
            return undefined;
        }
    },

    /**
     * Gets an event that is raised when the imagery provider encounters an asynchronous error.  By subscribing
     * to the event, you will be notified of the error and can potentially recover from it.  Event listeners
     * are passed an instance of {@link TileProviderError}.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Event}
     * @readonly
     */
    errorEvent : {
        get : function() {
            return this._errorEvent;
        }
    },

    /**
     * Gets a value indicating whether or not the provider is ready for use.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Boolean}
     * @readonly
     */
    ready : {
        get : function() {
            return true;
        }
    },

    /**
     * Gets a promise that resolves to true when the provider is ready for use.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Promise.<Boolean>}
     * @readonly
     */
    readyPromise : {
        get : function() {
            return this._readyPromise;
        }
    },

    /**
     * Gets the credit to display when this imagery provider is active.  Typically this is used to credit
     * the source of the imagery.  This function should not be called before {@link TileCoordinatesImageryProvider#ready} returns true.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Credit}
     * @readonly
     */
    credit : {
        get : function() {
            return undefined;
        }
    },

    /**
     * Gets a value indicating whether or not the images provided by this imagery provider
     * include an alpha channel.  If this property is false, an alpha channel, if present, will
     * be ignored.  If this property is true, any images without an alpha channel will be treated
     * as if their alpha is 1.0 everywhere.  Setting this property to false reduces memory usage
     * and texture upload time.
     * @memberof TileCoordinatesImageryProvider.prototype
     * @type {Boolean}
     * @readonly
     */
    hasAlphaChannel : {
        get : function() {
            return true;
        }
    }
});

/**
 * Gets the credits to be displayed when a given tile is displayed.
 *
 * @param {Number} x The tile X coordinate.
 * @param {Number} y The tile Y coordinate.
 * @param {Number} level The tile level;
 * @returns {Credit[]} The credits to be displayed when the tile is displayed.
 *
 * @exception {DeveloperError} <code>getTileCredits</code> must not be called before the imagery provider is ready.
 */
MagnoEmptyProvider.prototype.getTileCredits = function (x, y, level) {
    return undefined;
};


/**
 * Requests the image for a given tile.  This function should
 * not be called before {@link MagnoEmptyProvider#ready} returns true.
 *
 * @param {Number} x The tile X coordinate.
 * @param {Number} y The tile Y coordinate.
 * @param {Number} level The tile level.
 * @param {Request} [request] The request object. Intended for internal use only.
 * @returns {Promise.<Image|Canvas>|undefined} A promise for the image that will resolve when the image is available, or
 *          undefined if there are too many active requests to the server, and the request
 *          should be retried later.  The resolved image may be either an
 *          Image or a Canvas DOM object.
 */
MagnoEmptyProvider.prototype.requestImage = function (x, y, level, request) {
    var interval = 180.0 / Math.pow(2, level);

    var lon = x * interval-180;
    var lat = 90 - y * interval;
    var nwCorner = {};
    nwCorner.lat = lat;
    nwCorner.lon = lon;

    
    var lon1 = (x + 1) * interval-180;
    var lat1 = 90 - (y + 1) * interval;
    var seCorner = {};
    seCorner.lat = lat1;
    seCorner.lon = lon1;
    
    var neCorner = {};
    neCorner.lat = lat;
    neCorner.lon = lon1;

    var swCorner = {};
    swCorner.lat = lat1;
    swCorner.lon = lon;
    
    var bbox = {};
    bbox.nwCorner = nwCorner
    bbox.seCorner = seCorner;
    bbox.neCorner = neCorner
    bbox.swCorner = swCorner;
    
    var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    
	if( this._debugTiles == true  ){
	    var context = canvas.getContext('2d');
	    context.strokeStyle = Cesium.Color.RED.toCssColorString();
	    context.lineWidth = 1;
	    context.strokeRect(1, 1, 255, 255);
	}
	
	// Cache
	// https://github.com/CesiumGS/cesium/blob/43571bab35ff6f5e197a28126f85f7ccb5c4999a/Source/Scene/TimeDynamicImagery.js#L270

	if( level >= this._activationLevel ){
		this.requestFeatures( x, y, level, bbox );
	}
	
	if( Cesium.defined( this._requestImage ) ){
		var newCanvas = this._requestImage( x, y, level, request, bbox, canvas );
		if( newCanvas ) canvas = newCanvas;
	}
	
    return canvas;
};


MagnoEmptyProvider.prototype.requestFeatures = function ( x, y, level, bbox ) {

/*
	for( x=0; x < this._viewer.imageryLayers.length; x++){
    	console.log( this._viewer.imageryLayers.get(x) );
    }
    
    imageryLayer._imageryCache 
	var key = JSON.stringify([x, y, level]);    
*/
	
	if( Cesium.defined( this._requestFeatures ) ){
		this._requestFeatures( x, y, level, bbox, this.whenFeaturesAcquired );
	}
};

MagnoEmptyProvider.prototype.whenFeaturesAcquired = function ( features ) {
	var data = features.properties['imageryData'];
	console.log( data );
	
};



/**
 * Picking features is not currently supported by this imagery provider, so this function simply returns
 * undefined.
 *
 * @param {Number} x The tile X coordinate.
 * @param {Number} y The tile Y coordinate.
 * @param {Number} level The tile level.
 * @param {Number} longitude The longitude at which to pick features.
 * @param {Number} latitude  The latitude at which to pick features.
 * @return {Promise.<ImageryLayerFeatureInfo[]>|undefined} A promise for the picked features that will resolve when the asynchronous
 *                   picking completes.  The resolved value is an array of {@link ImageryLayerFeatureInfo}
 *                   instances.  The array may be empty if no features are found at the given location.
 *                   It may also be undefined if picking is not supported.
 */
MagnoEmptyProvider.prototype.pickFeatures = function (x, y, level, longitude, latitude) {
	console.log( "Pick at " + longitude + "," + latitude );
    return undefined;
};

MagnoEmptyProvider._endpointCache = {};


