const PIXI = require('pixi.js');
const $ = require('jquery');
require('./keys.js');

function isFunction(functionToCheck) {
   return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

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
  const padleft = ipx * 0.5 * (width - minwh);
  $("canvas").css("padding-left", padleft + "px");
  const padtop =  ipx * 0.5 * (height - minwh);
  $("canvas").css("padding-top", padtop + "px");

  $("body").append("<div id='leftpanel'></div>");
  const leftpanel = $("#leftpanel");
  leftpanel.css("position", "absolute");
  leftpanel.css("left", (0.5 * padleft) + "px");
  leftpanel.css("top", padtop + "px");

  leftpanel.append("<ul id='help'></ul>");
  const help = $("#help");
  help.css("font-size", "24px");
  const h = (x) => help.append('<li>' + x + '</li>');
  h('No mouse');
  h('h: Toggle help');
  h('r: Rotate');
  h('f: Flip');
  h('0-9: Select menu item');

  leftpanel.append("<ol id='ui'></ol>");
  const ui = $("#ui");

  ui.append('<li><ol id="ol1"></ol></li>');
  ui.append('<li><ol id="ol2"></ol></li>');
  ui.append('<li><ol id="ol3"></ol></li>');
  ui.append('<li><ol id="ol4"></ol></li>');

  const ol1 = $("#ol1");
  const ol2 = $("#ol2");
  const ol3 = $("#ol3");
  const ol4 = $("#ol4");

  ol1.append('<li><div class="menuobj">&#8593;</div></li>');
  ol1.append('<li><div class="menuobj">&#10548;</div></li>');
  ol1.append('<li><div class="menuobj">&#129470;</div></li>');

  //const paths = {};
  const selections = {};
  const listItems = ui.find('li');
  for (let li = 0; li < listItems.length; li++) {
    const item = $(listItems[li]);
    const parents = item.parents('li');
    const parentNode = $(parents[parents.length - 1]);
    const s = 
      (parents.length > 0 ? parentNode.data('path') + '.' : '') +
        (item.index() + 1).toString();
    // paths[item] = s;
    item.data('path', s);
    selections[s] = item;
    console.log(parentNode, item, item.index() + 1);
  }
  console.log(selections);

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
  const selected = [];
  let rotation = 0;
  let flip = 0;
  const processInput = function() {
    const delay = 0.1 * 1000;
    processKey(KeyEvent.DOM_VK_LEFT, delay, () => { return cursor.x--; });
    processKey(KeyEvent.DOM_VK_RIGHT, delay, () => { return cursor.x++; });
    processKey(KeyEvent.DOM_VK_UP, delay, () => { return cursor.y--; });
    processKey(KeyEvent.DOM_VK_DOWN, delay, () => { return cursor.y++; });
    processKey(KeyEvent.DOM_VK_R, delay, () => {
      rotation = (rotation + 1) % 4;
      $(".menuobj").removeClass("rotate1");
      $(".menuobj").removeClass("rotate2");
      $(".menuobj").removeClass("rotate3");
      $(".menuobj").removeClass("rotate4");
      $(".menuobj").addClass("rotate" + (rotation + 1).toString());
    });
    processKey(KeyEvent.DOM_VK_F, delay, () => {
      flip = (flip + 1) % 2;
      $(".menuobj").removeClass("flip");
      if (flip == 1) {
        $(".menuobj").addClass("flip");
      }
    });
    for (let i = 0; i < 10; i++) {
      const s = i.toString();
      processKey(KeyEvent['DOM_VK_' + s], delay, () => {
        selected.push(i); 
        let ss = selected.join('.');
        const selection = selections[ss];
        if (selection === undefined) {
          selected.length = 0;
          selected.push(i); 
        }
        console.log(selected.join('.'));
      });
    }
  }
  document.addEventListener('keydown', keydown);
  document.addEventListener('keyup', keyup);

  console.log(ui);
  const showSelected = function() {
    $(".selected").removeClass("selected");
    let ss = selected.join('.');
    const selection = selections[ss];
    if (selection === undefined) {
      selected.length = 0;
    } else {
      selection.addClass("selected");
    }
  };

  app.ticker.add((delta) => {
    processInput();
    repaint(cursor.x, cursor.y, false);
    repositionAvatar();
    showSelected();
  });

};

$(main);
