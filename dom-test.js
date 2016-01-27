describe("Canvas appearance tests", function () {
    var canvas = document.createElement('canvas'),
        clearBtn = document.createElement('button'),
        stainPallet = document.createElement('div');

    canvas.id  = 'canvasTest';
    clearBtn.id  = 'clear';
    stainPallet.id = 'stain-pallet';

    document.body.appendChild(canvas);
    document.body.appendChild(stainPallet);
    document.body.appendChild(clearBtn);

    var myCanvas = new Drawchim({
        selector: document.getElementById('canvasTest'),
        clearBtn: document.getElementById('clear')
    });

    it('has canvas selector', function() {
        expect(myCanvas.options.selector.id).to.equal('canvasTest');
    });

    it('has clear button', function() {
        expect(myCanvas.options.clearBtn.id).to.equal('clear');
    });
});