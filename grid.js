/* A gird layout similar to WPF Grid functionality */

// Make sure endsWith is implemented
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(searchString, position) {
        var subjectString = this.toString();
        if (position === undefined || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}

// TODO: There should be at least 1 row and 1 col
var row_defs = [],
    col_defs = [];

function layout(row_defs, col_defs) {
    var total_width = 100,
        total_height = 100;

    var total_star_height = 0,
        total_star_width = 0;

    // calculate heights in 2 phases
    for (var phase = 0; phase < 2; phase++) {
        for (var i = 0; i < row_defs.length; i++) {
            row_defs[i].height = row_defs[i].getAttribute('height');
            if (row_defs[i].height === undefined)
                row_defs[i].height = '1*';
            var h = row_defs[i].height.trim().toLowerCase();
            switch (phase) {
                case 0: // calculate available size for heights
                    if (h.endsWith('*'))
                        total_star_height += parseFloat(h);
                    else if (h.endsWith('%'))
                        total_height -= parseFloat(h);

                    break;
                case 1: // deal with absolute values
                    var hstar_value = total_height / total_star_height;
                    if (h.endsWith('*'))
                        row_defs[i].height = parseFloat(h) * hstar_value ;
            }
        }
    }

    // calculate widths in 2 phases
    for (var phase = 0; phase < 2; phase++) {
        for (var i = 0; i < col_defs.length; i++) {
            col_defs[i].width = col_defs[i].getAttribute('width')
            if (col_defs[i].width === undefined)
                col_defs[i].width = '1*';
            var w = col_defs[i].width.trim().toLowerCase();
            switch (phase) {
                case 0: // calculate available size for widths
                    if (w.endsWith('*'))
                        total_star_width += parseFloat(w);
                    else if (w.endsWith('%'))
                        total_width -= parseFloat(w);
                    break;
                case 1: // deal with absolute values
                    var width_star_value = total_width / total_star_width;
                    if (w.endsWith('*'))
                        col_defs[i].width = parseFloat(w) * width_star_value;
            }
        }
    }
}

/* Tag names*/
var col_def_tag = 'grid-col-def';
var row_def_tag = 'grid-row-def';
var layout_def_tag = 'grid-layout-def';
var grid_layout_tag = 'grid-layout';
var grid_element_tag = 'grid-element';
var containerDiv;


function define_grid_layout() {
    var grid_proto = Object.create(HTMLElement.prototype);
    grid_proto.createdCallback = function() {
        var shadow = this.createShadowRoot();
        containerDiv = document.createElement('div');
        containerDiv.style.width = "100%";
        containerDiv.style.height = "100%";
        containerDiv.style.position = 'absolute';
        containerDiv.style.margin = "0";
        containerDiv.style.boxSizing = "border-box";

        shadow.insertBefore(containerDiv, shadow.childNodes[0]);
    }
    var grid_layout = document.registerElement(grid_layout_tag, {
        prototype: grid_proto
    });
}

function define_grid_layout_def() {

    var grid_layout_def_proto = Object.create(HTMLElement.prototype);

    grid_layout_def_proto.createdCallback = function() {
        row_defs = this.getElementsByTagName(row_def_tag);
        col_defs = this.getElementsByTagName(col_def_tag);
        layout(row_defs, col_defs);
    };

    var grid_layout_def = document.registerElement(layout_def_tag, {
        prototype: grid_layout_def_proto
    });

}

function findGridElementPosition(row, col, rowSpan, colSpan) {

    // TODO: check for index-overflow
    var left = 0,
        top = 0,
        width = 0,
        height = 0;

    for (var i = 0; i < col; i++)
        left += col_defs[i].width;

    for (var i = 0; i < row; i++)
        top += row_defs[i].height;

    for (var i = 0; i < colSpan; i++)
        width += col_defs[col + i].width;

    for (var i = 0; i < rowSpan; i++) {
        height += row_defs[row + i].height;
    }
    return {
        left: left,
        top: top,
        width: width,
        height: height
    };
}

function define_grid_element_def() {

    var grid_element_proto = Object.create(HTMLElement.prototype);
    grid_element_proto.createdCallback = function() {
        Object.defineProperty(this, 'row', {
            get: function() {
                return parseInt(this.getAttribute('row')) || 0;
            }
        });
        Object.defineProperty(this, 'rowSpan', {
            get: function() {
                return parseInt(this.getAttribute('rowSpan')) || 1;
            }
        });
        Object.defineProperty(this, 'col', {
            get: function() {
                return parseInt(this.getAttribute('col')) || 0;
            }
        });
        Object.defineProperty(this, 'colSpan', {
            get: function() {
                return parseInt(this.getAttribute('colSpan')) || 1;
            }
        });

        var elementDiv = document.createElement('div');
        var sizePosition = findGridElementPosition(this.row, this.col, this.rowSpan, this.colSpan);
        elementDiv.style.position = 'absolute';
        elementDiv.style.width = sizePosition.width + '%';
        elementDiv.style.height = sizePosition.height + '%';
        elementDiv.style.top = sizePosition.top + '%';
        elementDiv.style.left = sizePosition.left + '%';
        elementDiv.style.overflow = 'hidden';
        elementDiv.innerHTML = this.innerHTML;
        containerDiv.appendChild(elementDiv);

    };

    var grid_element = document.registerElement(grid_element_tag, {
        prototype: grid_element_proto
    });
}

function define_grid_col_def() {

    var grid_col_def_proto = Object.create(HTMLElement.prototype);

    var width;
    Object.defineProperty(grid_col_def_proto, 'width', {
        writable: true
    });

    var grid_col_def = document.registerElement(col_def_tag, {
        prototype: grid_col_def_proto
    });
}

function define_grid_row_def() {

    var grid_row_def_proto = Object.create(HTMLElement.prototype);
    var height = 10;
    Object.defineProperty(grid_row_def_proto, 'height', {
        get: function() {
            return height
        },
        set: function(value) {
            height = value
        }
    });

    var grid_col_def = document.registerElement(row_def_tag, {
        prototype: grid_row_def_proto
    });
}

define_grid_col_def();
define_grid_row_def();
define_grid_layout_def();
define_grid_layout();
define_grid_element_def();
