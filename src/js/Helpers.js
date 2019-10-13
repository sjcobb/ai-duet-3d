import Pool from './Pool.js';

/*
 *** Helpers ***
 * https://github.com/jeromeetienne/threex.poolball *
 */
// console.clear();

export default class Helpers {

    constructor() {
        // super();
        this.pool = new Pool();
    }

    // initHelper() {
    //     const pool = new Pool();
    // }

    /**
     * Creator for tQuery.PoolBall
     * @return {tQuery.Mesh} instance of 
     */
    createPoolBall(opts) {
        console.log('ballTexture debug: ', this.ballTexture);

        opts = opts || {};

        // handle parameter polymorphism
        if (typeof(opts) === 'string') {
            opts = { ballDesc: opts };
        }

        // handle default options
        opts.ballDesc = opts.ballDesc !== undefined ? opts.ballDesc : '8';
        opts.striped = opts.striped !== undefined ? opts.striped : true;
        opts.textureW = opts.textureW !== undefined ? opts.textureW : 256;

        //*** sjcobb params ***
        opts.positionUp = true;
        opts.moveControl = false;
        // opts.keyMapped = opts.ballDesc;
        opts.active = false;

        //https://threejs.org/docs/#api/en/core/Object3D.up
        // opts.location = 'up'; //'!up'
        // opts.position = [x, y, z]; //x=pitch, z=octave
        // opts.note = 'A';
        // opts.octave = 4;
        // opts.color = '#ffff00';
        // opts.waveform = 'sawtooth'; // sine, square, triangle, sawtooth

        // build texture based on ballDesc
        let texture;
        if (opts.ballDesc === 'cue') {
            texture = this.ballTexture('', false, "#ffffff", opts.textureW);
        } else if (opts.ballDesc === 'black') {
            texture = this.ballTexture('', false, "#000000", opts.textureW);
        } else {
            var fillStylePerDesc = {
                '1': "#FDD017", // Yellow
                '2': "#2B65EC", // Blue
                '3': "#F62817", // Red
                '4': "#7A5DC7", // Purple
                '5': "#F87217", // Orange
                '6': "#348017", // Green
                '7': "#A52A2A", // Brown or burgundy (tan in some ball sets)
                '8': "#000000", // Black
                '9': "#FDD017", // Yellow
                'C': "#FF001F", // "red"
                'D': "#E17A24", // "orange"
                'E': "#E5EC3C", // "yellow"
                'F': "#7AD630", // "green"
                'G': "#00FFE9", // "blue"
                'A': "#3018F9", // "indigo"
                'B': "#FF0FF9", // "violet"
                'N': "#FFFFFF",
                'ballN': "#FFD700", // "gold"
            };
            // sanity check
            //console.assert(Object.keys(fillStylePerDesc).indexOf(opts.ballDesc) !== -1);

            // build the texture
            // TODO: do not use ballDesc for fill styles
            var fillStyle = fillStylePerDesc[opts.ballDesc];

            texture = this.ballTexture(opts.ballDesc, opts.striped, fillStyle, opts.textureW);
        }
        // TODO: cache the texture

        // create the sphere and use texture
        var geometry = new THREE.SphereGeometry(0.5, 128, 128);
        var material = new THREE.MeshPhongMaterial();
        material.map = texture;
        var object = new THREE.Mesh(geometry, material);

        object.userData.opts = opts;
        // opts.positionUp = false;
        // opts.moveControl = false;
        // opts.keyMapped = opts.ballDesc;
        // opts.active = false;

        // return the just created object

        // console.log({object}); //no log

        return object;
    }

    drawPoolBall(canvas, textData, striped, fillStyle) {
        // const pool = new Pool();
        // console.log({pool});

        var ctx = canvas.getContext('2d');
        // var xtx = this.xCanvasCreate(ctx);
        
        // var xtx = this.pool.xCanvasCreate(ctx);
        var xtx = this.pool.create(ctx);

        var w = canvas.width;
        var h = canvas.height;

        // base color is white
        ctx.save();
        ctx.fillStyle = "#FFFFFF"; //TODO: make white circle bigger
        ctx.fillRect(0, 0, w, h);
        ctx.restore();

        // do the strip/full
        ctx.save();
        ctx.translate(w / 2, h / 2)
        var rectH = striped ? h / 2 : h;
        ctx.fillStyle = fillStyle;
        ctx.fillRect(-w / 2, -rectH / 2, w, rectH);
        ctx.restore();

        if (textData) {
            // do white circle around textData
            ctx.save();
            ctx.translate(w / 4, h / 2);
            ctx.fillStyle = "#FFFFFF";
            // var radiusW = 1.0 * w / 4; //128
            // var radiusH = 1.5 * h / 4; //192
            var radiusW = 1.1 * w / 4;
            var radiusH = 1.7 * h / 4;
            radiusW += 10;
            radiusH += 30;
            // console.log('ball white circle: ', radiusW, ' x ', radiusH);

            // xtx.fillEllipse(-radiusW / 2, -radiusH / 2, radiusW, radiusH);
            this.fillEllipse(-radiusW / 2, -radiusH / 2, radiusW, radiusH, ctx);
            ctx.restore();

            // draw text data
            ctx.save();
            ctx.translate(w / 4, h / 2);
            var textH = w / 4;

            // https://www.w3schools.com/cssref/css_websafe_fonts.asp
            // https://www.w3.org/TR/css-fonts-3/#generic-font-families
            // ctx.font = "bolder " + textH + "px Arial"; // ORIG
            // ctx.font = "bold " + textH + "px Helvetica"; //128px
            // ctx.font = "bold " + (textH - 2) + "px Tahoma";
            ctx.font = "bold " + (textH - 6) + "px Geneva";
            ctx.fillStyle = "#000000"; //text color
            var textW = ctx.measureText(textData).width;
            
            //TODO: adjust textOffset position here, make spheres bigger?
            let textOffsetX = 0.0;
            // let textOffsetY = 0.8; //ORIG
            let textOffsetY = 0.6;
            if (textW > 100) {
                // console.log(textData); //TODO: make fillEllipse wider or font (textH) smaller when multiple characters
                // ctx.font = "bolder " + 80 + "px Arial"; //96 too big
                ctx.font = "bolder " + 96 + "px Arial";
                textOffsetX = 30; 
                textOffsetY = 0.4;
            }
            ctx.fillText(textData, -textW / 2 + textOffsetX, textOffsetY * textH / 2);
            ctx.restore();
        }
    }

    ballTexture(textData, striped, fillStyle, canvasW, mapping) {
        canvasW = typeof canvasW !== 'undefined' ? canvasW : 512;
        // create the canvas
        var canvas = document.createElement('canvas');
        canvas.width = canvas.height = canvasW;

        // create the texture
        var texture = new THREE.Texture(canvas, mapping);
        texture.needsUpdate = true;

        // draw in the texture
        this.drawPoolBall(canvas, textData, striped, fillStyle);
        // return the texture
        return texture;
    }

    // https://github.com/sjcobb/music-dojo/blob/develop/bounce/js/threex.js#L177
    xCanvasCreate(ctx) {

        var xCanvas = this.xCanvas;

        // var xCanvas = Helpers.createPoolBall.xCanvas;
        // return {
        //     // TODO: fix err - this.xCanvasFillEllipse is not a function
        //     // fillEllipse: function(aX, aY, aWidth, aHeight) {
        //     //     return this.xCanvasFillEllipse(ctx, aX, aY, aWidth, aHeight);
        //     // }
        // };
        // const pool = new Pool();
        // this.pool.fillEllipse(aX, aY, aWidth, aHeight);

        // return this.fillEllipse(aX, aY, aWidth, aHeight);
    }

    fillEllipse(aX, aY, aWidth, aHeight, ctx) {
        return this.xCanvasFillEllipse(ctx, aX, aY, aWidth, aHeight);
    }
    
    xCanvasCircle(ctx, aX, aY, aDiameter) {
        this.pool.ellipse(ctx, aX, aY, aDiameter, aDiameter);
    }

    xCanvasFillCircle(ctx, aX, aY, aDiameter) {
        ctx.beginPath();
        this.circle(ctx, aX, aY, aDiameter);
        ctx.fill();
    }

    xCanvasStrokeCircle(ctx, aX, aY, aDiameter) {
        ctx.beginPath();
        this.circle(ctx, aX, aY, aDiameter);
        ctx.stroke();
    }

    // Ellipse methods
    xCanvasEllipse(ctx, aX, aY, aWidth, aHeight) {
        var hB = (aWidth / 2) * 0.5522848,
            vB = (aHeight / 2) * 0.5522848,
            eX = aX + aWidth,
            eY = aY + aHeight,
            mX = aX + aWidth / 2,
            mY = aY + aHeight / 2;
        ctx.moveTo(aX, mY);
        ctx.bezierCurveTo(aX, mY - vB, mX - hB, aY, mX, aY);
        ctx.bezierCurveTo(mX + hB, aY, eX, mY - vB, eX, mY);
        ctx.bezierCurveTo(eX, mY + vB, mX + hB, eY, mX, eY);
        ctx.bezierCurveTo(mX - hB, eY, aX, mY + vB, aX, mY);
        ctx.closePath();
    }

    xCanvasFillEllipse(ctx, aX, aY, aWidth, aHeight) {
        ctx.beginPath();
        this.pool.ellipse(ctx, aX, aY, aWidth, aHeight);
        ctx.fill();
    }

    xCanvasStrokeEllipse(ctx, aX, aY, aWidth, aHeight) {
        ctx.beginPath();
        this.pool.ellipse(ctx, aX, aY, aWidth, aHeight);
        ctx.stroke();
    }

    createPoolBallShadow(textureW) {
        textureW = textureW !== undefined ? textureW : 512;

        // Create canvas
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.width = textureW;
        canvas.height = textureW;

        var gradient = context.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            0,
            canvas.width / 2,
            canvas.height / 2,
            canvas.width / 2
        );
        gradient.addColorStop(0.0, 'rgba(0,0,0,0.8)');
        gradient.addColorStop(0.5, 'rgba(0,0,0,0.7)');
        gradient.addColorStop(1.0, 'rgba(0,0,0,0.0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Create texture
        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;

        // create mesh
        var geometry = new THREE.PlaneGeometry(1, 1);
        var material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
        });
        var object3d = new THREE.Mesh(geometry, material);
        object3d.rotation.x = -Math.PI / 2;

        // if (globals.cameraPositionBehind === true) {
        //     object3d.rotation.y = 1.0; //no effect
        // }

        // return the just-built mesh
        return object3d;
    }

}
