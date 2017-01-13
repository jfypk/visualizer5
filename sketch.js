// noprotect
//click mouse to change visualizers
//press any key to pause/play music

//Credits:
//drag and drop HTML help from Dominic's sketch
//star help from Allison Parrish
//particles code modified from https://www.openprocessing.org/sketch/111878
//kanyeeezy. only for demo. will take down if need be. 

//issues:
//1) only let one song be loaded at a time. 

//program variables
var vizNum = 5;

//DOM variables
var canvas;
var introP;
var musiczone;
var kanyebutton;
var buttonShown = false;

//video variables
var video;
var vScale = 8;
var r, g, b;
var slitscanX = 0;

//particle variables
var particleArray = [];
var flag = true;
var distance;
var offset;

//star variables
var starArray = [];
var starLimit = 2500;

//sound variables
var sound;
var fft;
var amplitude;
var soundPlaying;
var spectrumLength = 64;

function preLoad() {
    soundPlaying = false;
    sound = loadSound('Waves.mp3');
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function setup() {
    sound = loadSound('Waves.mp3');
    colorMode(RGB, 255);

    canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);
    canvas.style('z-index', '-1');

    introP = createP("Drag and drop an .mp3 to start (or wait 5 sec).");
    introP.style('color', '#fff');
    introP.style('text-align', 'center');
    introP.position(width / 2, height / 2);

    kanyebutton = createButton('KANYE');
    kanyebutton.position(width / 2, height / 2 + 50);
    kanyebutton.mousePressed(fileSuccess);
    kanyebutton.hide();

    musiczone = select('#musiczone');
    musiczone.dragOver(highlight);
    musiczone.dragLeave(unhighlight);
    musiczone.drop(gotFile, unhighlight);

    for (var p = 0; p < 400; p++) {
        particleArray.push(new Particle());
        particleArray[p].colorUpdate();
    }

    pixelDensity(1);
    video = createCapture(VIDEO);
    video.size(640 / vScale, 480 / vScale);
    video.position(width / 2, height / 2);
    video.hide();

    background(0);

    fft = new p5.FFT(0.9, spectrumLength);
    amplitude = new p5.Amplitude();
    amplitude.smooth(0.5);
    amplitude.toggleNormalize(1);

}

function draw() {
    if (buttonShown === false && frameCount > 300) {
        kanyebutton.show();
        buttonShown = true;
    }
    if (soundPlaying) {
        var spectrum = fft.analyze();

        video.loadPixels();

        if (vizNum % 5 === 0) {
            //particles
            offset = 0.01;
            background(0);
            noStroke();

            distance = map(amplitude.getLevel(), 0, 1, 50, 150);

            for (var i = 0; i < particleArray.length; i++) {
                var pn1 = particleArray[i];
                pn1.colorUpdate();
                pn1.display();
                offset = map(spectrum[i], 0, 255, 0, 0.1); //0, 0.1
                pn1.update();
                for (var j = i + 1; j < particleArray.length; j++) {
                    var pn2 = particleArray[j];
                    offset = map(spectrum[j], 0, 255, 0, 0.1); //0, 0.1
                    pn2.update();
                    if (dist(pn1.x, pn1.y, pn2.x, pn2.y) < distance) {
                        for (var k = j + 1; k < particleArray.length; k++) {
                            var pn3 = particleArray[k];
                            offset = map(spectrum[k], 0, 255, 0, 0.1); //0, 0.1
                            if (dist(pn3.x, pn3.y, pn2.x, pn2.y) < distance) {
                                if (flag) {
                                    stroke(0, 10);
                                    fill(pn3.c); //pn3.c
                                } else {
                                    noFill();
                                    strokeWeight(1);
                                    stroke(255, 20);
                                }
                                beginShape(TRIANGLES);
                                vertex(pn1.x, pn1.y);
                                vertex(pn2.x, pn2.y);
                                vertex(pn3.x, pn3.y);
                                endShape();
                            }
                        }
                    }
                }
            }
        } else if (vizNum % 5 === 1) {
            //bars
            background(0);
            for (var y = 0; y < video.height; y++) {
                for (var x = 0; x < video.width; x++) {
                    var index = (video.width - x + 1 + (y * video.width)) * 4;
                    r = video.pixels[index + 0];
                    g = video.pixels[index + 1];
                    b = video.pixels[index + 2];

                    var spectrumIndex = floor(map(index, 0, 19200, 0, spectrumLength));
                    var wi = (width / 2) / spectrumLength;
                    var amp = spectrum[spectrumIndex]; //may need to change name of this
                    var xi = spectrumIndex * wi;
                    var yi = map(amp, 0, 256, height, 0);
                    fill(r, g, b);
                    push();
                    translate(width / 2, 0);
                    rect(xi, yi, wi - 2, height - yi);
                    rect(xi * -1, yi, wi - 2, height - yi);
                    pop();
                }
            }
        } else if (vizNum % 5 === 2) {
            //lines
            background(0);
            for (var y = 0; y < video.height / vScale; y++) {
                for (var x = 0; x < video.width / vScale; x++) {
                    var index = (video.width - x + 1 + (y * video.width)) * 4;
                    r = video.pixels[index + 0];
                    g = video.pixels[index + 1];
                    b = video.pixels[index + 2];

                    var spectrumIndex = floor(map(index, 0, 10000, 0, 64));
                    var wi = width / spectrum.length;
                    var amp = spectrum[spectrumIndex];
                    var xi = spectrumIndex * wi / 2;
                    var yi = map(amp, 0, 256, height * 0.7, height * 0.3);
                    push();
                    translate(width / 2, -height / 2);
                    scale(2);
                    stroke(r, g, b);
                    line(xi, yi, wi - 2, height - yi);
                    line(xi * -1, yi, wi - 2, height - yi);
                    pop();
                }
            }

        } else if (vizNum % 5 === 3) {
            //slitscan
            var w = video.width;
            var h = video.height;
            var amp = floor(map(amplitude.getLevel(), 0, 1, 0, 5));
            var specIndex = floor(random(0, spectrum.length));
            var mapSpec = map(spectrum[specIndex], 0, 255, height * 0.25, height * 0.75);

            copy(video, w / 2, 0, w / 2, h, slitscanX, 0, 5, mapSpec);

            slitscanX = slitscanX + amp;

            if (slitscanX > width) {
                background(51);
                slitscanX = 0;
            }
        } else if (vizNum % 5 === 4) {
            //star
            background(0);
            offset = 5;

            for (var y = 0; y < video.height; y++) {
                for (var x = 0; x < video.width; x++) {
                    var index = (video.width - x + 1 + (y * video.width)) * 4;
                    r = video.pixels[index + 0];
                    g = video.pixels[index + 1];
                    b = video.pixels[index + 2];

                    var bright = (r + g + b) / 3;

                    var w = map(bright * amplitude.getLevel(), 0, 255, 0, windowHeight / 80);
                    var h = floor(map(index, 0, video.height / vScale * video.width / vScale * 4, 0, windowHeight));

                    if (random() < 0.05) {
                        var s = new Star(random(windowWidth), random(windowHeight), w, r, g, b); //y * vScale
                        starArray.push(s);
                    }
                }
            }

            for (var i = 0; i < starArray.length; i++) {
                starArray[i].display();
                starArray[i].update();
                if (starArray[i].x > windowWidth || starArray[i].y > windowHeight) {
                    starArray.splice(i, 1);
                }
            }

            if (starArray.length > starLimit) {
                for (var q = 0; q < 200; q++) {
                    var randomIndex = floor(random(0, starLimit));
                    starArray.splice(randomIndex, 2);
                }
            }
        }
    }

}

function unhighlight() {
    introP.style('color', 'fff');
    background(0);
}

function highlight() {
    introP.style('color', 'F0F');
    background(255, 0, 255);
}

function gotFile(file) {
    // if(sound.isLoaded()) {
    //  sound.stop();
    //   //sound.onended(reset);
    // } else {
    sound = loadSound(file.data, fileSuccess, fileError);
    sound.amp(0.2);
    //}
}

function fileSuccess() {
    introP.hide();
    buttonShown = true;
    kanyebutton.hide();
    sound.play();
    soundPlaying = true;
    console.log("sound file uploaded");
}

function fileError() {
    console.log("The file you uploaded isn't a working sound file. Nuts!");
}

function mousePressed() {
    vizNum++;
    if (vizNum > 4) vizNum = 0;
}

function keyPressed() {
    togglePlay();
}

function togglePlay() {
    if (sound.isPlaying()) {
        sound.pause();
        soundPlaying = false;
    } else {
        sound.loop();
        soundPlaying = true;
    }
}

function Particle() {
    this.x = random(0, windowWidth); //windowWidth
    this.y = random(0, windowHeight); //windowHeight
    this.r = random(5, 10);
    this.i = 1;
    this.j = floor(random(0, 4));

    this.colorUpdate = function() {
        if (this.j === 0) {
            this.c = color(5, 207, 209, 69); //cyan
        } else if (this.j === 2) {
            this.c = color(255, 183, 3, 69); //yellow
        } else if (this.j === 1) {
            this.c = color(255, 3, 91, 69); //magenta
        } else if (this.j === 3) {
            this.c = color(0, 178, 15, 69); //green
        }
    };


    this.display = function() {
        push();
        noStroke();
        fill(this.c);
        //create your shape
        ellipse(this.x, this.y, this.r, this.r);


        pop();
    };

    this.update = function() {

        this.x = this.x + (this.j * offset);
        this.y = this.y + (this.i * offset);
        if (this.y > height - this.r) this.i = -1;
        if (this.y < 0 + this.r) this.i = 1;
        if (this.x > width - this.r) this.j = -1;
        if (this.x < 0 + this.r) this.j = 1;
    };
}

function Star(x, y, w, r, g, b) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.r = r;
    this.g = g;
    this.b = b;
    this.i = 1;
    this.j = floor(random(0, 4));

    this.xspeed = 5;
    this.yspeed = 2;

    this.display = function() {
        push();
        noStroke();
        fill(r, g, b);
        ellipseMode(CENTER);
        ellipse(this.x, this.y, this.w, this.w);
        pop();
    };

    this.update = function() {
        this.x += this.xspeed;
        this.y += this.yspeed;
    };
}
