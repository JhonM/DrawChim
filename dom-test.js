describe("Canvas appearance tests", function () {
    var canvas = document.createElement('canvas'),
        clearBtn = document.createElement('canvas');

    canvas.id  = "canvasTest";
    clearBtn.id  = "clear";

    document.body.appendChild(canvas);
    document.body.appendChild(clearBtn);

    var myCanvas = new Drawchim({
        selector: document.getElementById('canvasTest'),
        clearBtn: document.getElementById('clear')
    });

    it("has canvas selector", function() {
        expect(myCanvas.options.selector.id).to.equal('canvasTest');
    });

    it("has canvas clear button", function() {
        expect(myCanvas.options.clearBtn.id).to.equal('clear');
    });
});