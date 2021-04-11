const PIXI = require('pixi.js');
const $ = require('jquery');
require('./keys.js');

function isFunction(functionToCheck) {
   return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

const main = function() {

  const grid = {};
  const containers = {};
  const state = {
    rotation: 0,
    flip: 0
  };

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
  help.css("font-size", "12px");
  const h = (x) => help.append('<li>' + x + '</li>');
  h('No mouse');
  h('h: Toggle help');
  h('r: Rotate');
  h('f: Flip');
  h('0-9: Select menu item');
  h('Space: Place selected item');

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

  const getUpdater = function(pixi, sx, sy, ex, ey, ondone) {
    const updater = function(elapsed) {
      pixi.x = sx + elapsed * (ex - sx);
      pixi.y = sy + elapsed * (ey - sy);
      if (elapsed >= 1.0 && ondone !== undefined) {
        ondone();
      }
    };
    return updater;
  };
  const getReparent = function(pixi, graphics, x, y) {
    return () => {
      pixi.removeChild(graphics);
      get(x, y).pixi.addChild(graphics);
      graphics.x = 0.0;
      graphics.y = 0.0;
      console.log("reparent", x, y);
    };
  };
  const getRotation = () => state.rotation * Math.PI * 0.5;
  const getRotated = function(output) {
    const theta = getRotation();
    const flipped = (x) => state.flip === 1 ? -x : x;
    const x = flipped(Math.round(output.x * Math.cos(theta) - output.y * Math.sin(theta)));
    const y = Math.round(output.x * Math.sin(theta) + output.y * Math.cos(theta));
    return { x, y };
  };

  const menuObjects = [];
  menuObjects.push({
    name: 'Belt',
    symbol: '&#8593;',
    output: { x: 0, y: -1},
    ticker: (output, pixi, x, y) => {
      if (pixi.children.length > 1) {
        const graphics = pixi.children[1];
        const sx = pixi.x;
        const sy = pixi.y;
        const ex = pixi.x + output.x * scale;
        const ey = pixi.y + output.y * scale;
        const reparent = getReparent(pixi, graphics, x + output.x, y + output.y);
        return getUpdater(graphics, sx, sy, ex, ey, reparent);
      }
      return () => {};
    },
    parentMenu: ol1
  });
  menuObjects.push({
    name: 'Curved Belt',
    symbol: '&#10548;',
    output: { x: 0, y: -1},
    ticker: (output, pixi, x, y) => {
      if (pixi.children.length > 1) {
        const graphics = pixi.children[1];
        const sx = pixi.x;
        const sy = pixi.y;
        const ex = pixi.x + output.x * scale;
        const ey = pixi.y + output.y * scale;
        const reparent = getReparent(pixi, graphics, x + output.x, y + output.y);
        return getUpdater(graphics, sx, sy, ex, ey, reparent);
      }
      return () => {};
    },
    parentMenu: ol1
  });
  menuObjects.push({
    name: 'Robot Arm',
    symbol: '&#129470;',
    output: { x: 0, y: -1},
    ticker: (output, pixi, x, y) => {
      if (pixi.children.length > 1) {
        const graphics = pixi.children[1];
        const sx = pixi.x;
        const sy = pixi.y;
        const ex = pixi.x + output.x * scale;
        const ey = pixi.y + output.y * scale;
        const reparent = getReparent(pixi, graphics, x + output.x, y + output.y);
        return getUpdater(graphics, sx, sy, ex, ey, reparent);
      }
      return () => {};
    },
    parentMenu: ol1
  });
  menuObjects.push({
    name: 'Factory',
    symbol: '&#127981;',
    output: { x: 0, y: -1},
    ticker: (output, pixi, x, y) => {
      const graphics = new PIXI.Graphics();
      graphics.lineStyle(1, 0xFF0000, 1);
      graphics.beginFill(0xFF0000);
      graphics.drawCircle(0, 0, scale * 0.25);
      graphics.pivot.set(-0.5 * scale);
      graphics.endFill();
      pixi.addChild(graphics);
      const sx = pixi.x;
      const sy = pixi.y;
      const ex = pixi.x + output.x * scale;
      const ey = pixi.y + output.y * scale;
      const reparent = getReparent(pixi, graphics, x + output.x, y + output.y);
      return getUpdater(graphics, sx, sy, ex, ey, reparent);
    },
    parentMenu: ol1
  });
  for (let i = 0; i < menuObjects.length; i++) {
    const mo = menuObjects[i];
    const li = $('<li><div class="menuobj">' + mo.symbol + '</div></li>');
    mo.parentMenu.append(li);
    li.data('index', i);
  }

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
          const subcontainer = new PIXI.Container();
          container.addChild(subcontainer);
          set(k + xd, k + yd, {
            x: k + xd,
            y: k + yd,
            pixi: subcontainer,
            tickers: []
          });
        }
        const container = getG(containers, k + xd, k + yd);
        //const content = get(nx, ny);
        //const toPaint = content.stack[0];
      }
    }
  }
  repaint(k, k, true);

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
  const pkeys = {};
  const getSelected = () => selections[selected.join('.')];

  const processInput = function() {
    const delay = 0.1 * 1000;
    processKey(KeyEvent.DOM_VK_LEFT, delay, () => { return cursor.x--; });
    processKey(KeyEvent.DOM_VK_RIGHT, delay, () => { return cursor.x++; });
    processKey(KeyEvent.DOM_VK_UP, delay, () => { return cursor.y--; });
    processKey(KeyEvent.DOM_VK_DOWN, delay, () => { return cursor.y++; });
    processKey(KeyEvent.DOM_VK_R, delay, () => {
      state.rotation = (state.rotation + 1) % 4;
      $(".menuobj").removeClass("rotate1");
      $(".menuobj").removeClass("rotate2");
      $(".menuobj").removeClass("rotate3");
      $(".menuobj").removeClass("rotate4");
      $(".menuobj").addClass("rotate" + (state.rotation + 1).toString());
    });
    processKey(KeyEvent.DOM_VK_F, delay, () => {
      state.flip = (state.flip + 1) % 2;
      $(".menuobj").removeClass("flip");
      if (state.flip === 1) {
        $(".menuobj").addClass("flip");
      }
    });
    processKey(KeyEvent.DOM_VK_SPACE, delay, () => {
      const selection = getSelected();
      if (selection !== undefined) {
        const s = selection.text().trim();
        const flipContainer = new PIXI.Container();
        const text = new PIXI.Text(s, textStyle);
        text.x = 0.5 * text.width + 0.5 * (scale - text.width);
        text.y = 0.5 * text.height;
        text.anchor.x = 0.5;
        text.anchor.y = 0.5;
        flipContainer.scale.x = state.flip === 1 ? -1 : 1;
        flipContainer.x = state.flip === 1 ? scale : 0.0;
        text.rotation = getRotation();
        const val = get(cursor.x, cursor.y);
        if (val !== undefined) {
					for (let i = val.pixi.children.length - 1; i >= 0; i--) {
            val.pixi.removeChild(val.pixi.children[i]);
          }
          val.pixi.addChild(flipContainer);
          flipContainer.addChild(text);
          const index = selection.data('index');
          //console.log("index", index);
          const props = menuObjects[index];
          console.log("props", props);
          const output = getRotated(props.output);
          const ticker = function() {
            return props.ticker(output, val.pixi, val.x, val.y);
          };
          val.tickers = [ticker];
        }
        //set(cursor.x, cursor.y, newobj);
      }
    });
    for (let i = 0; i < 10; i++) {
      const s = i.toString();
      processKey(KeyEvent['DOM_VK_' + s], delay, () => {
        selected.push(i);
        const selection = getSelected();
        if (selection === undefined) {
          selected.length = 0;
          selected.push(i);
        }
      });
    }
  }
  document.addEventListener('keydown', keydown);
  document.addEventListener('keyup', keyup);

  console.log(ui);
  const showSelected = function() {
    $(".selected").removeClass("selected");
    const selection = getSelected();
    if (selection === undefined) {
      selected.length = 0;
    } else {
      selection.addClass("selected");
    }
  };

  const updaters = [];
  let startTime = performance.now();
  const tick = function() {
    for (let i = 0; i < updaters.length; i++) {
      updaters[i](1.0);
    }
    updaters.length = 0;
    for (let key in grid) {
      const tickers = grid[key].tickers;
      for (let i = 0; i < tickers.length; i++) {
        const updater = tickers[i]();
        updaters.push(updater);
      }
    }
    startTime = performance.now();
  };
  setInterval(tick, 1000);

  app.ticker.add((delta) => {
    processInput();
    for (let i = 0; i < updaters.length; i++) {
      const elapsed = (performance.now() - startTime) * 0.001;
      updaters[i](elapsed);
    }
    repaint(cursor.x, cursor.y, false);
    repositionAvatar();
    showSelected();
  });

};

$(main);
