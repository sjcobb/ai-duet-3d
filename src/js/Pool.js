import globals from './globals.js';
import Helpers from './Helpers.js';

/*
 *** POOL ***
 */

export default class Pool {
    
    constructor() {

    }

    create(ctx) {
        const helpers = new Helpers();
        var xCanvas = helpers.xCanvasCreate(ctx);

        return {
            fillEllipse: function(aX, aY, aWidth, aHeight) {
                return xCanvas.fillEllipse(ctx, aX, aY, aWidth, aHeight);
            }
        };
    }


    circle(ctx, aX, aY, aDiameter) {
        this.ellipse(ctx, aX, aY, aDiameter, aDiameter);
    }

    fillCircle(ctx, aX, aY, aDiameter) {
        ctx.beginPath();
        this.circle(ctx, aX, aY, aDiameter);
        ctx.fill();
    }

    strokeCircle(ctx, aX, aY, aDiameter) {
        ctx.beginPath();
        this.circle(ctx, aX, aY, aDiameter);
        ctx.stroke();
    }

    // Ellipse methods
    ellipse(ctx, aX, aY, aWidth, aHeight) {
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

    fillEllipse(ctx, aX, aY, aWidth, aHeight) {
        ctx.beginPath();
        this.ellipse(ctx, aX, aY, aWidth, aHeight);
        ctx.fill();
    }

    strokeEllipse(ctx, aX, aY, aWidth, aHeight) {
        ctx.beginPath();
        this.ellipse(ctx, aX, aY, aWidth, aHeight);
        ctx.stroke();
    }

}