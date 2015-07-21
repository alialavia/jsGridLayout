/* A gird layout imitating WPF Grid functionality 
   It uses custom HTML attributes 
   Every div element with at least a data-gridRowDefinition or data-gridColDefinition
   is interpreted as a grid. It will fill its parent and lays out all its child elements as grid elements 
    data-gridRowDefinition and data-gridColDefinition: A list of qualified numbers, either with * or with %. * has same semantics as in WPF,
    and % is relative to the parent element (not recommended). * elements fill remaining space of table after % elements
    are placed. The lists represent rows' height and cols' width repectively. 
   */

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



function layout(row_defs, col_defs) {
    var total_width = 100,
        total_height = 100;

    var total_star_height = 0,
        total_star_width = 0;

    // calculate heights in 2 phases
    for (var phase = 0; phase < 2; phase++) {
        for (var i = 0; i < row_defs.length; i++) {
            var h = row_defs[i].trim().toLowerCase();
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
                        row_defs[i] = parseFloat(h) * hstar_value;
            }
        }
    }

    // calculate widths in 2 phases
    for (var phase = 0; phase < 2; phase++) {
        for (var i = 0; i < col_defs.length; i++) {
            var w = col_defs[i].trim().toLowerCase();
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
                        col_defs[i] = parseFloat(w) * width_star_value;
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

function define_grid_layout(el) {
    // TODO: There should be at least 1 row and 1 col
    var row_defs = [],
        col_defs = [];
    //var shadow = el.createShadowRoot();
    el.style.width = "100%";
    el.style.height = "100%";
    el.style.position = 'absolute';
    el.style.margin = "0";
    el.style.boxSizing = "border-box";

    var temp = (el.dataset.gridrowdefinition || '').split(',');
    for (var r in temp)
        row_defs.push(temp[r].trim() || '1*');

    temp = (el.dataset.gridcoldefinition || '').split(',');
    for (var c in temp)
        col_defs.push(temp[c].trim() || '1*');

    layout(row_defs, col_defs);
    var define_grid_element_def = function(el) {
        if ((el.gridRowDefinition === undefined) ||
            (el.gridColDefinition === undefined))
            define_grid_layout(el);
        var row = parseInt(el.dataset.gridrow) || 0,
            rowSpan = parseInt(el.dataset.rowspan) || 1,
            col = parseInt(el.dataset.gridcol) || 0,
            colSpan = parseInt(el.dataset.colspan) || 1;

        var elementDiv = document.createElement('div');
        var sizePosition = findGridElementPosition(row, col, rowSpan, colSpan, row_defs, col_defs);
        elementDiv.style.position = 'absolute';
        elementDiv.style.width = sizePosition.width + '%';
        elementDiv.style.height = sizePosition.height + '%';
        elementDiv.style.top = sizePosition.top + '%';
        elementDiv.style.left = sizePosition.left + '%';
        elementDiv.style.overflow = 'hidden';
        elementDiv.innerHTML = el.outerHTML;
        el.outerHTML = elementDiv.outerHTML;
    };
    for (var i = 0; i < el.children.length; i++)
        define_grid_element_def(el.children[i]);

}

function findGridElementPosition(row, col, rowSpan, colSpan, row_defs, col_defs) {

    // TODO: check for index-overflow
    var left = 0,
        top = 0,
        width = 0,
        height = 0;

    for (var i = 0; i < col; i++)
        left += col_defs[i];

    for (var i = 0; i < row; i++)
        top += row_defs[i];

    for (var i = 0; i < colSpan; i++)
        width += col_defs[col + i];

    for (var i = 0; i < rowSpan; i++) {
        height += row_defs[row + i];
    }
    return {
        left: left,
        top: top,
        width: width,
        height: height
    };
}
