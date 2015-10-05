/* A gird layout imitating WPF Grid functionality 
   It uses custom HTML attributes 
   Every div element with at least a data-gridrowdef or data-gridcoldef
   is interpreted as a grid. It will fill its parent and lays out all its child elements as grid elements 
    data-gridrowdef and data-gridcoldef: A list of qualified numbers, either with * or with %. * has same semantics as in WPF,
    and % is relative to the parent element (not recommended). * elements fill remaining space of table after % elements
    are placed. The lists represent rows' height and cols' width repectively. 
   */

/* Helpers */
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

// Make sure repeat is implemented
if (!Array.prototype.repeat) {
    Array.prototype.repeat = function(n) {        
        if (n === undefined || n < 0) 
            return null;
        var temp = [];
        for (var i = 0;i < n; i++)
            temp = temp.concat(this);
        
        return temp;
    };
}

// repeat and join
if (!Array.prototype.raj) {
    Array.prototype.raj = function(n) {                        
        return this.repeat(n).join();
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
                case 0: // phase 0: calculate available size for widths
                    if (w.endsWith('*'))
                        total_star_width += parseFloat(w);
                    else if (w.endsWith('%'))
                        total_width -= parseFloat(w);
                    break;
                case 1: // phase 1: deal with absolute values
                    var width_star_value = total_width / total_star_width;
                    if (w.endsWith('*'))
                        col_defs[i] = parseFloat(w) * width_star_value;
            }
        }
    }
}

function gridify(el) {
    // TODO: There should be at least 1 row and 1 col

    // stores row and col definitions
    var row_defs = [],
        col_defs = [];

    // read row and col definitions
    var temp = (el.dataset.gridRowdef || '').split(',');

    for (var i = 0; i<temp.length; i++)
    {
        row_defs.push(temp[i].trim() || '1*');
    }

    temp = (el.dataset.gridColdef || '').split(',');
    for (var i = 0; i<temp.length; i++)
        col_defs.push(temp[i].trim() || '1*');

    layout(row_defs, col_defs);

    var define_grid_element_def = function(child_el) {
        // if the element itself is a grid, first calculate its layout
        if (!((child_el.dataset.gridRowdef === undefined) ||
                (child_el.dataset.gridColdef === undefined)))
            gridify(child_el);

        var row = parseInt(child_el.dataset.gridRow) || 0,
            rowSpan = parseInt(child_el.dataset.gridRowspan) || 1,
            col = parseInt(child_el.dataset.gridCol) || 0,
            colSpan = parseInt(child_el.dataset.gridColspan) || 1;

        // then find its size and position relative to its parent grid
        var sizePosition = findGridElementPosition(row, col, rowSpan, colSpan, row_defs, col_defs);

        /* define a wrapper div around the element       
        so that the target styles don't get overriden
        */  
        var wrapperDiv = document.createElement('div');

        wrapperDiv.style.position = 'absolute';
        wrapperDiv.style.width = sizePosition.width + '%';
        wrapperDiv.style.height = sizePosition.height + '%';
        wrapperDiv.style.top = sizePosition.top + '%';
        wrapperDiv.style.left = sizePosition.left + '%';
        wrapperDiv.style.overflow = 'hidden';

        // wrap the element with the wrapperDiv
        wrapperDiv.innerHTML = child_el.outerHTML;
        child_el.outerHTML = wrapperDiv.outerHTML;
    };

    // layout all elements
    for (var i = 0; i < el.children.length; i++)
        define_grid_element_def(el.children[i]);

    // Finally wrap everything in a relative div
    var mainWrapperDiv = document.createElement('div');
    mainWrapperDiv.style.position = 'relative';
    mainWrapperDiv.style.width = '100%';
    mainWrapperDiv.style.height = '100%';
    mainWrapperDiv.innerHTML = el.innerHTML;
    el.innerHTML = mainWrapperDiv.outerHTML;
}

function findGridElementPosition(row, col, rowSpan, colSpan, row_defs, col_defs) {

    var error_msg = "Error on layouting element in row " + row + " and column " + col +". Layout failed on calculating ";
    if (row < 0 || row >= row_defs.length)
        error_msg += "row position";
    else if (col < 0 || col >= col_defs.length)
        error_msg += "column position";
    else if ((row + rowSpan - 1) < 0 || (row + rowSpan - 1) >= row_defs.length)
        error_msg += "cell height (due to rowSpan/row error)";
    else if ((col + colSpan - 1) < 0 || (col + colSpan - 1) >= col_defs.length)
        error_msg += "cell width (due to colSpan/col error)";
    else
    {        
        var left = 0,
            top = 0,
            width = 0,
            height = 0,
            i = 0;

        for (i = 0; i < col; i++)
            left += col_defs[i];

        for (i = 0; i < row; i++)
            top += row_defs[i];

        for (i = 0; i < colSpan; i++)
            width += col_defs[col + i];

        for (i = 0; i < rowSpan; i++) {
            height += row_defs[row + i];
        }

        return {
            left: left,
            top: top,
            width: width,
            height: height
        };
    }        
    throw new RangeError(error_msg + ".");
}
