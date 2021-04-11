const PIXI = require('pixi.js');
const $ = require('jquery');
require('./keys.js');

const main = function() {

  const grid = {};
  const containers = {};

  const get = (x, y) => {
    key = x + ',' + y;
    if (key in grid) {
      return grid[key];
    } else {
      return null;
    }
  };

  const set = (x, y, v) => {
    grid[x + ',' + y] = v;
  };

  const getG = (grid, x, y) => {
    key = x + ',' + y;
    if (key in grid) {
      return grid[key];
    } else {
      return null;
    }
  };

  const setG = (grid, x, y, v) => {
    grid[x + ',' + y] = v;
  };

  const width = window.innerWidth;
  const height = window.innerHeight;
  const px = window.devicePixelRatio;
  const ipx = 1.0 / px;
  const minwh = Math.min(window.innerWidth, window.innerHeight) * 0.8 * ipx;

  const app = new PIXI.Application({
    width: minwh, height: minwh, backgroundColor: 0, transparent: true, resolution: px || 1,
      //width: minwh, height: minwh, backgroundColor: 0x1099bb, resolution: 1
  });
  document.body.appendChild(app.view);
  $("body").css("margin", 0);
  $("body").css("padding", 0);
  //$("body").css("background", "radial-gradient(#c0c0c0, #ffffff)");
  $("body").css("background", "radial-gradient(#ffffff, #c0c0c0)");
  $("canvas").css("padding-left", ipx * 0.5 * (width - minwh) + "px");
  $("canvas").css("padding-top", ipx * 0.5 * (height - minwh) + "px");

  const rootContainer = new PIXI.Container();

  app.stage.addChild(rootContainer);

  const k = 10;
  const scale = Math.floor(minwh / (2 * k + 1));
  const cursor = {
    x: k,
    y: k
  };
  const textStyle = new PIXI.TextStyle({
    fontSize: scale * 0.8
  });
  const avatar = new PIXI.Text('@', textStyle);
  const repositionAvatar = function() {
    avatar.x = scale * cursor.x + 0.5 * (scale - avatar.width);
    avatar.y = scale * cursor.y;
  };
  rootContainer.addChild(avatar);

  const repaint = function(x, y, initial = false) {
    for (let xd = -k; xd <= k; xd++) {
      for (let yd = -k; yd <= k; yd++) {
        const nx = x + xd;
        const ny = y + yd;
        if (initial) {
          const container = new PIXI.Container();
          container.x = scale * nx;
          container.y = scale * ny;
          const graphics = new PIXI.Graphics();
          graphics.lineStyle(1, 0x808080, 1);
          graphics.beginFill(0xFFFFFF, 0.0);
          graphics.drawRect(0, 0, scale, scale);
          graphics.endFill();
          container.addChild(graphics);
          rootContainer.addChild(container);
          setG(containers, k + xd, k + yd, container);
        }
        const container = getG(containers, k + xd, k + yd);
        const content = get(nx, ny);
        //const toPaint = content.stack[0];
      }
    }
  }
  repaint(k, k, true);

  const pkeys = {};
  const last = {};
  const keydown = function(evt) {
    pkeys[evt.keyCode] = true;
  };
  const keyup = function(evt) {
    pkeys[evt.keyCode] = false;
    delete last[evt.keyCode];
  };
  const processKey = function(key, delay, fun) {
    if (pkeys[key] === true) {
      const lastPressed = last[key];
      if (lastPressed === undefined || performance.now() - lastPressed >= delay) {
        fun();
        if (lastPressed === undefined) {
          last[key] = performance.now() + 5 * delay;
        } else {
          last[key] = performance.now();
        }
      }
    }
  };
  const processInput = function() {
    const delay = 0.1 * 1000;
    processKey(KeyEvent.DOM_VK_LEFT, delay, () => { return cursor.x--; });
    processKey(KeyEvent.DOM_VK_RIGHT, delay, () => { return cursor.x++; });
    processKey(KeyEvent.DOM_VK_UP, delay, () => { return cursor.y--; });
    processKey(KeyEvent.DOM_VK_DOWN, delay, () => { return cursor.y++; });
  }

  document.addEventListener('keydown', keydown);
  document.addEventListener('keyup', keyup);

  app.ticker.add((delta) => {
    processInput();
    repaint(cursor.x, cursor.y, false);
    repositionAvatar();
  });

};

$(main);
