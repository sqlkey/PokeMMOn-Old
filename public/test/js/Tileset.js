var Tileset = function() {
  var self = this;

  this.width = 0;
  this.height = 0;
  this.grid = 16;
  this.background = 0;

  this.tileset = $('#tileset');
  this.ctx = $('#tileset')[0].getContext('2d');

  this.image = new Image();

  this.mouse = {
    tile_x: 0,
    tile_y: 0,
    down: false,
    tileID: 0
  };

  this.tilesets = {};

  this.startListeners();

  this.transparents = {};
  this.loadTransparents();

  this.selector = $("#selector")[0];

  this.selector.style.left = "0px";
  this.selector.style.top = "0px";
  this.selectorDim = [1, 1];
  this.multi = false;

};

Tileset.prototype = {
  loadTilesets: function(callback) {
    var self = this;

    $.ajax("editor/sets", {
      global: false,
      success: function(data) {
        self.sets = data;

        $('#tilesets').empty();

        // Update tileset select
        $.each(data, function(key, value) {
          $('#tilesets')
            .append($("<option></option>")
              .attr("value", key)
              .text(key));
        });

        // Load all tileset images
        $.each(data, function(key, value) {
          self.tilesets[key] = {};
          self.tilesets[key].img = new Image();
          self.tilesets[key].img.src = "img/editor/sets/" + key + ".png";

          self.tilesets[key].width = value.width;
          self.tilesets[key].height = value.height;
        });

        $('#tilesets').prop("disabled", false);

        typeof callback === 'function' && callback();
      }
    });
  },

  loadTransparents: function() {
    var self = this;

    $.ajax("js/editor/transparent.json", {
      dataType: "json",
      global: false,
      success: function(data) {
        self.transparents = data;
      }
    });
  },

  isTransparent: function(id) {
    return this.transparents.indexOf(id) != -1 ? true : false;
  },

  drawTileset: function() {
    this.ctx.drawImage(this.image, 0, 0);
  },

  changeTileset: function(set, callback) {
    this.clear();
    this.set = set;

    // Set width and height of tileset canvas
    this.tileset.attr("width", this.tilesets[set].width);
    this.tileset.attr("height", this.tilesets[set].height);

    this.width = this.tilesets[set].width;
    this.height = this.tilesets[set].height;

    // Load in tileset image
    this.image.src = this.tilesets[set].img.src;

    var self = this;
    this.image.onload = function() {
      self.drawTileset();
      typeof callback === 'function' && callback();
    }
  },

  clear: function() {
    this.ctx.clearRect(0, 0, this.width, this.height)
  },

  startListeners: function() {
    var self = this;
    $('#tileset')[0].addEventListener('mousedown', function(e) {
      self.mouse.down = true;
      self.selectTile();
    });

    $('#tileset')[0].addEventListener('mouseup', function(e) {
      self.mouse.down = false;
    });

    $('#tileset')[0].addEventListener('mousemove', function(e) {
      self.mouse.x = e.offsetX;
      self.mouse.y = e.offsetY;
      self.mouse.hover_x = Math.floor(self.mouse.x / (self.grid));
      self.mouse.hover_y = Math.floor(self.mouse.y / (self.grid));
    });

    $('#tileset')[0].addEventListener('mouseleave', function(e) {
      self.mouse.down = false;
    });
  },

  selectTile: function(x, y) {
    if (x === undefined) {
      var x = this.mouse.x;
      var y = this.mouse.y;
    } else {
      var x = x * 16;
      var y = y * 16;
    }

    x = x < 0 ? 0 : x;
    y = y < 0 ? 0 : y;

    x = x > 240 ? 240 : x;
    y = y > 8000 ? 8000 : y;

    this.mouse.tile_x = Math.floor(x / (this.grid));
    this.mouse.tile_y = Math.floor(y / (this.grid));
    this.mouse.tileID = this.mouse.tile_y * 16 + this.mouse.tile_x;

    this.selector.style.left = this.mouse.tile_x * (this.grid) + "px";
    this.selector.style.top = this.mouse.tile_y * (this.grid) + "px";
  },

  resizeTileSelector: function(inc) {
    var new_x = this.selectorDim[0] + inc[0];
    var new_y = this.selectorDim[1] + inc[1];

    // Ignore if invalid new dimension
    if (new_x > 16 || new_y > 16 || new_x < 1 || new_y < 1) return;

    if (new_x != 1 || new_y != 1) {
      this.multi = true;
    } else {
      this.multi = false;
    }

    this.selectorDim = [new_x, new_y];
    selector.style.width  = this.selectorDim[0]*(this.grid)+'px';
    selector.style.height = this.selectorDim[1]*(this.grid)+'px';
  }
};