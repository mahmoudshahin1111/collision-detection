



class Vector2d {
     constructor(x, y) {
          this.x = x;
          this.y = y;
     }
     /**
      *
      * @param {String} angle
      * @param {Vector2d} aroundPoint
      */
     rotate(angle, aroundPoint) {
          const angleInRadian = angle * 0.0174533;
          const rX =
               (this.x - aroundPoint.x) * Math.cos(angleInRadian) -
               (this.y - aroundPoint.y) * Math.sin(angleInRadian);
          const rY =
               (this.x - aroundPoint.x) * Math.sin(angleInRadian) +
               (this.y - aroundPoint.y) * Math.cos(angleInRadian);
          this.x = rX + aroundPoint.x;
          this.y = rY + aroundPoint.y;
     }
}

class Line {
     constructor(sP, eP, rotationAngle = 0) {
          this.sP = sP;
          this.eP = eP;
          this.rotateLine(rotationAngle);
     }
     rotateLine(angle) {
          this.eP.rotate(angle, this.sP);
     }
}

/**
 *  @property {Number} canvasWidth
 *  @property {Number} canvasHeight
 * @property {String} canvasId
 * @property {HTMLCanvasElement} canvas
 * @property {Array} lines
 */
class Engine {
     constructor(canvasId) {
          this.canvasWidth = 500;
          this.canvasHeight = 500;
          this.blockCounts = 20;
          this.circleLinePerAngle = 1;
          this.lineLength = 100;
          this.canvasId = canvasId;
          this.canvas = null;
          this.ctx = null;
          this.run = false;
          this.fps = 500;
          this.blocks = [];
          this.lines = [];
          this.intersectionPoints = [];
          this.center = new Vector2d(200, 150);
     }
     start() {
          this.canvas = document.getElementById(this.canvasId);
          this.ctx = this.canvas.getContext('2d');
          this.canvas.setAttribute('width', this.canvasWidth);
          this.canvas.setAttribute('height', this.canvasHeight);
          this.run = true;

          this.canvas.addEventListener('mousemove', (evt) => {
               this.center.x = evt.clientX - this.canvas.getBoundingClientRect().left;
               this.center.y = evt.clientY - this.canvas.getBoundingClientRect().top;
          });
          this.blocks = [
               //
               new Line(new Vector2d(0, 0), new Vector2d(this.canvasWidth, 0)),
               new Line(
                    new Vector2d(this.canvasWidth, 0),
                    new Vector2d(this.canvasWidth, this.canvasHeight)
               ),
               new Line(
                    new Vector2d(this.canvasWidth, this.canvasHeight),
                    new Vector2d(0, this.canvasHeight)
               ),
               new Line(new Vector2d(0, this.canvasHeight), new Vector2d(0, 0)),
          ];
          let i = this.blockCounts;
          while (i--) {
               this.blocks.push(
                    new Line(
                         new Vector2d(this.getRandomX(), this.getRandomY()),
                         new Vector2d(this.getRandomX(), this.getRandomY())
                    )
               );
          }
          this.update();
     }
     render() {
          //circle flash
          this.lines = [];
          this.intersectionPoints = [];
          let angle = 0;
          while (angle < 360) {
               let line_sP = new Vector2d(this.center.x, this.center.y);
               let line_eP = new Vector2d(this.center.x, this.center.y + this.lineLength);
               let line = new Line(line_sP, line_eP, angle);
               const result = this.checkCollisions(line);
               if (result) {
                    line.sP = new Vector2d(this.center.x, this.center.y);
                    line.eP = new Vector2d(this.center.x, this.center.y + result);
                    line.rotateLine(angle);
               }
               this.lines.push(line);
               angle += this.circleLinePerAngle;
          }
          this.drawCircle(this.center,5);
          let i = 0;
          while (i < this.blocks.length) {
               this.drawLine(this.blocks[i]);
               i++;
          }
          i = 0;
          while (i < this.lines.length) {
               this.drawLine(this.lines[i]);
               i++;
          }
          i = 0;
          while (i < this.intersectionPoints.length) {
               this.drawCircle(this.intersectionPoints[i], 2);
               i++;
          }

     }
     /**
      * 
      * @param {Line} line 
      * @returns {Number} line length
      */
     checkCollisions(line) {
          let nearestIntersectPoint = null;
          let nearestDistance = null;
          for (const block of this.blocks) {
               let sP = block.sP;
               let eP = block.eP;
               const result = this.getIntersectPoint(sP, eP, line.sP, line.eP);
               if (result) {
                    const distance = this.getDistance(line.sP, result);
                    if (nearestDistance === null || nearestDistance > distance) {
                         nearestDistance = distance;
                         nearestIntersectPoint = result;
                    }
               }
          }
          if (nearestIntersectPoint) {
               this.intersectionPoints.push(nearestIntersectPoint);
               return nearestDistance;
          }
          return;
     }
     getRandomX() {
          return Math.floor(Math.random() * this.canvasWidth);
     }
     getRandomY() {
          return Math.floor(Math.random() * this.canvasHeight);
     }
     getDistance(sP, eP) {
          return Math.sqrt(Math.pow(eP.x - sP.x, 2) + Math.pow(eP.y - sP.y, 2));
     }
     update() {
          setTimeout(() => {
               this.ctx.beginPath();
               this.ctx.fillStyle = "black";
               this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
               this.ctx.strokeStyle = "rgba(255,255,255,0.5)";
               this.render();
               this.ctx.stroke();
               this.update();
          }, 1000 / this.fps);
     }
     /**
      *
      * @param {Line} line
      */
     drawLine(line) {
          this.ctx.moveTo(line.sP.x, line.sP.y);
          this.ctx.lineTo(line.eP.x, line.eP.y);
     }
     /**
      *
      * @param {Vector2d} center
      * @param {Number} radius
      */
     drawCircle(center, radius) {
          this.ctx.moveTo(center.x, center.y);
          this.ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
     }
     /**
      *
      * @param {Vector2d} p1
      * @param {Vector2d} p2
      * @param {Vector2d} p3
      * @param {Vector2d} p4
      * @param {Vector2d} point  refrance to intercected point
      */
     getIntersectPoint(p1, p2, p3, p4) {
          const x1 = p1.x;
          const y1 = p1.y;
          const x2 = p2.x;
          const y2 = p2.y;
          const x3 = p3.x;
          const y3 = p3.y;
          const x4 = p4.x;
          const y4 = p4.y;
          const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
          if (denominator == 0) {
               return;
          }
          const u =
               -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) /
               ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
          const t =
               ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) /
               ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
          if (t > 1 || t < 0) {
               return;
          }
          if (u > 1 || u < 0) {
               return;
          }
          const iX = x3 + u * (x4 - x3);
          const iY = y3 + u * (y4 - y3);
          return new Vector2d(iX, iY);
     }
}


var engine = new Engine('canavas');
engine.start();
