describe("Canvas appearance tests", function () {
    var canvas = document.createElement('canvas'),
        clearBtn = document.createElement('button'),
        pallet = document.createElement('div'),
        stainPallet = document.createElement('div');

    canvas.id  = 'canvasTest';
    clearBtn.id  = 'clear';
    pallet.id = 'pallets';
    stainPallet.id = 'stain-pallet';

    pallet.appendChild(stainPallet);

    document.body.appendChild(pallet);
    document.body.appendChild(canvas);
    document.body.appendChild(clearBtn);

    var myCanvas = new Drawchim({
        selector: document.getElementById('canvasTest'),
        clearBtn: document.getElementById('clear')
    });

    var stainObject = myCanvas.options.stains.length,
        stainInDom = document.querySelectorAll('.stains li'),
        stainTotal = stainInDom.length - 1;

    it('has canvas selector', function() {
        expect(myCanvas.options.selector.id).to.equal('canvasTest');
    });

    it('has clear button', function() {
        expect(myCanvas.options.clearBtn.id).to.equal('clear');
    });

    it('has stains object', function() {
        expect(stainObject).to.equal(stainTotal);
    });
});