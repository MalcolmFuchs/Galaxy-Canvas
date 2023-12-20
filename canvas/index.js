
const animation = async () => {

  let back = document.querySelector('canvas');

  const scale = window.devicePixelRatio;

  back.width  = back.offsetWidth  * scale;
  back.height = back.offsetHeight * scale;
  
  let pencil = back.getContext("2d");
  
  const mouseCircle = new Circle(pencil);
  const circles     = new Array(100).fill(null, 0, 100).map(e => new Circle(pencil));

  back.addEventListener('mousemove', (e) => {
    mouseCircle.position.x = e.offsetX * scale;
    mouseCircle.position.y = e.offsetY * scale;
  });

  function frame() {
    pencil.clearRect(0, 0, back.width * scale, back.height * scale);

    mouseCircle.reset();

    for (let c of circles) {
      c.move();
      c.draw();
      c.reset();
    }

    for (let c of circles) {
      mouseCircle.observe(c);

      for (let c2 of circles) {
        if (c == c2)      continue;

        c.observe(c2);

      }
    }
    requestAnimationFrame(frame);
  }

  frame();
}

class Circle {
  
  position = {
    x: 0,
    y: 0
  }

  #direction  = {
    x: 0,
    y: 0
  }

  #speed     = 1 + Math.random() * 4;
  #drawer    = null;
  #radius    = 3 + Math.random() * 3;
  #connected = new Set();

  constructor(drawer) {
    this.#drawer = drawer;

    this.random();
  }

  reset() {
    this.#connected.clear();
  }

  connect(circle) {
    this.#connected.add(circle);
  }

  random() {
    this.#direction.x = Math.random() - 0.5;
    this.#direction.y = Math.random() - 0.5;

    this.position.x = Math.random() * this.#drawer.canvas.width;
    this.position.y = Math.random() * this.#drawer.canvas.height; 

  }

  distanceTo(circle) {
    return Math.sqrt(
      (this.position.x - circle.position.x) ** 2 +
      (this.position.y - circle.position.y) ** 2
    );
  }

  move() {
    this.position.x += this.#direction.x * this.#speed;
    this.position.y += this.#direction.y * this.#speed;

    if (this.position.x < 0) this.position.x = this.#drawer.canvas.width;      
    if (this.position.y < 0) this.position.y = this.#drawer.canvas.height;      

    if (this.position.x > this.#drawer.canvas.width)  this.position.x = 0;
    if (this.position.y > this.#drawer.canvas.height) this.position.y = 0;

  }

  draw() {
    this.#drawer.beginPath();
    this.#drawer.fillStyle = 'white';
    this.#drawer.shadowBlur = 20;
    this.#drawer.shadowColor = "white";
    this.#drawer.arc(this.position.x, this.position.y, this.#radius, 0, 2 * Math.PI);
    this.#drawer.fill();

  }

  observe(circle) {
    const l = 200, d = this.distanceTo(circle);

    if (d < l && !this.#connected.has(circle)) {
      const opacity = Math.round((1 - (d / l)) * 100) / 100;
      
      this.#drawer.beginPath();
      this.#drawer.strokeStyle = 'rgba(255,255,255,' + opacity + ')';
      this.#drawer.strokeWidth = '1px';
      this.#drawer.moveTo(this.position.x, this.position.y);
      this.#drawer.lineTo(circle.position.x, circle.position.y);
      this.#drawer.stroke();

      this.connect(circle);
      circle.connect(this);
    }
  }
}


animation();