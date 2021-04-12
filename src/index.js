const PIXI = require('pixi.js');
const $ = require('jquery');
require('./keys.js');

function isFunction(functionToCheck) {
   return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

var decodeEntities = (function() {
  // this prevents any overhead from creating the object each time
  var element = document.createElement('div');

  function decodeHTMLEntities (str) {
    if(str && typeof str === 'string') {
      // strip script/html tags
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
      element.innerHTML = str;
      str = element.textContent;
      element.textContent = '';
    }

    return str;
  }

  return decodeHTMLEntities;
})();

const main = function() {

  const grid = {};
  const containers = {};
  const state = {
    rotation: 0,
    flip: 0
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
  const rootContainer = new PIXI.Container();
  app.stage.addChild(rootContainer);

  const get = (x, y) => {
    key = x + ',' + y;
    if (key in grid) {
      return grid[key];
    } else {
      grid[key] = {
        pixi: new PIXI.Container(),
        tickers: []
      };
      grid[key].pixi.x = x;
      grid[key].pixi.y = y;
      rootContainer.addChild[grid[key].pixi];
      console.log("New grid key: ", key);
      return grid[key];
      //return null;
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
  h('Del/X: Delete selected cell');

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
      graphics.lastMoved = performance.now();
      //console.log("reparent", x, y);
    };
  };
  const getRotation = () => state.rotation * Math.PI * 0.5;
  const getRotated = function(theta, output, doRound = true) {
    const flipped = (x) => state.flip === 1 ? -x : x;
    const mround = doRound ? Math.round : (x) => x;
    const x = flipped(mround(output.x * Math.cos(theta) - output.y * Math.sin(theta)));
    const y = mround(output.x * Math.sin(theta) + output.y * Math.cos(theta));
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
        //if (graphics.lastMoved === undefined ||
        //    performance.now() - graphics.lastMoved >= 250)
        const me = pixi.children[0];
        pixi.removeChild(graphics);
        me.addChild(graphics);
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
        const me = pixi.children[0];
        pixi.removeChild(graphics);
        me.addChild(graphics);
        const reparent = getReparent(pixi, graphics, x + output.x, y + output.y);
        return getUpdater(graphics, sx, sy, ex, ey, reparent);
      }
      return () => {};
    },
    parentMenu: ol1
  });
  menuObjects.push({
    name: 'Recycling',
    symbol: '&#9850;',
    output: { x: 0, y: 0},
    ticker: (output, pixi, x, y) => {
      while (pixi.children.length > 1) {
        const graphics = pixi.children[1];
        pixi.removeChild(graphics);
      }
      return () => {};
    },
    parentMenu: ol1
  });
  menuObjects.push({
    name: 'Robot Arm',
    symbol: '&#129470;',
    output: { x: 0, y: -1},
		scale: { x: 2, y: 2 },
    ticker: (output, pixi, x, y) => {
      if (pixi.children.length > 0) {
        const arm = pixi.children[0].children[0];
        const startRotation = arm.rotation;
        const endRotation = startRotation + Math.PI * 0.5;
        const rotateArm = (elapsed) => {
          arm.rotation = startRotation + elapsed * (endRotation - startRotation);
        };
        const target = getRotated(startRotation, { x: -1, y: -1 });
        const target2 = getRotated(endRotation, { x: -1, y: -1 });

        const nx = x + target.x;
        const ny = y + target.y;
        const val = get(nx, ny);
        const pixi2 = val !== null ? val.pixi : null;

        const nx2 = x + target2.x;
        const ny2 = y + target2.y;
        //const output2 = { x: nx2, y: ny2 };

        //console.log(nx, ny, nx2, ny2);
        if (pixi2 !== null && pixi2.children.length > 1 &&
           (pixi2.children[1].lastMovedByArm === undefined ||
            performance.now() - pixi2.children[1].lastMovedByArm >= 500)) {
          const graphics = pixi2.children[1];
          const sx = pixi2.x;
          const sy = pixi2.y;
          const ex = pixi2.x + target2.x * scale;
          const ey = pixi2.y + target2.y * scale;
          if (arm.head === undefined) {
            arm.head = new PIXI.Container();
            arm.head.x = -0.75 * scale;
            arm.head.y = -0.75 * scale;
            arm.head.scale.x = 1.0 / arm.scale.x;
            arm.head.scale.y = 1.0 / arm.scale.y;
            arm.addChild(arm.head);
          }
          pixi2.removeChild(graphics);
          arm.head.addChild(graphics);
          const reparent = getReparent(arm, graphics, x + target2.x, y + target2.y);
          //const updater = getUpdater(graphics, sx, sy, ex, ey, reparent);
          return (elapsed) => {
            //updater(elapsed);
            rotateArm(elapsed);
            graphics.lastMoved = performance.now();
            graphics.lastMovedByArm = performance.now();
            if (elapsed >= 1.0) {
              reparent();
            }
          };
        }
        return (elapsed) => {
          rotateArm(elapsed);
        };
      }
      return () => {};
    },
    parentMenu: ol1
  });
  menuObjects.push({
    name: 'Factory',
    symbol: '&#127981;',
    typeSymbol: '&#127815;',
    output: { x: 0, y: -1},
    ticker: (output, pixi, x, y, options) => {
			/*
      const graphics = new PIXI.Graphics();
      graphics.lineStyle(1, 0xFF0000, 1);
      graphics.beginFill(0xFF0000);
      graphics.drawCircle(0, 0, scale * 0.25);
      graphics.pivot.set(-0.5 * scale);
      graphics.endFill();
			*/
			const graphics = new PIXI.Text(decodeEntities(options.typeSymbol));
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
    const typeSymbol = mo.typeSymbol || '';
    const li =
      $('<li style="position: relative;">' +
        '<div style="position: absolute; left: 0px; top: 0px;" class="menuobj">' + mo.symbol + 
        '</div><div style="position: absolute; left: 0px; top: 0px; transform: scale(0.5);">' + typeSymbol + '</div></li>');
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
    //console.log(parentNode, item, item.index() + 1);
  }
  //console.log(selections);

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
    const remove = () => {
      const val = get(cursor.x, cursor.y);
      for (let i = val.pixi.children.length - 1; i >= 0; i--) {
        val.pixi.removeChild(val.pixi.children[i]);
      }
      val.tickers.length = 0;
    };
    processKey(KeyEvent.DOM_VK_DELETE, delay, remove);
    processKey(KeyEvent.DOM_VK_X, delay, remove);
    processKey(KeyEvent.DOM_VK_SPACE, delay, () => {
      const selection = getSelected();
      if (selection !== undefined) {
        const val = get(cursor.x, cursor.y);
        if (val !== undefined) {
          const index = selection.data('index');
          if (index !== undefined) {
            //console.log("index", index);
            const props = menuObjects[index];
            //console.log("props", props);
            const output = getRotated(getRotation(), props.output);
            const ticker = function() {
              return props.ticker(output, val.pixi, val.x, val.y, { typeSymbol: props.typeSymbol });
            };
            val.tickers = [ticker];

            const placeSymbol = (s, symscale) => {
              const text = new PIXI.Text(decodeEntities(s), textStyle);
              let ret = text;
              if (symscale.x <= 1.0 && symscale.y <= 1.0) {
                text.x = 0.5 * text.width + 0.5 * (scale - text.width);
                text.y = 0.5 * text.height;
                text.anchor.x = 0.5;
                text.anchor.y = 0.5;
              } else {
                text.x = scale * 0.5;
                text.y = scale * 0.5;
                text.anchor.x = 0.75;
                text.anchor.y = 0.75;
                //const cont = new PIXI.Container();
                //cont.x = scale * rot.x
                //cont.y = scale * rot.y;
                //cont.addChild(text);
                //ret = cont;
              }
              text.rotation = getRotation();
              text.scale.x = symscale.x;
              text.scale.y = symscale.y;
              return ret;
            };
            for (let i = val.pixi.children.length - 1; i >= 0; i--) {
              val.pixi.removeChild(val.pixi.children[i]);
            }
            const flipContainer = new PIXI.Container();
            const text1 = placeSymbol(props.symbol, props.scale || { x: 1, y: 1});
            flipContainer.addChild(text1);
            if (props.typeSymbol) {
              const text2 = placeSymbol(props.typeSymbol, { x: 0.5, y: 0.5 });
              flipContainer.addChild(text2);
            }
            flipContainer.scale.x = state.flip === 1 ? -1 : 1;
            flipContainer.x = state.flip === 1 ? scale : 0.0;
            val.pixi.addChild(flipContainer);
          }
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

  //console.log(ui);
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
