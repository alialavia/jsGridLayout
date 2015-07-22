# jsGridLayout
A grid layout element for HTML. It uses same concept as WPF grid
layout container: you first define your layout rows and columns, and
then for each item in the grid you define its position and span.

This library is efficient, uses minimum number of divs necessary (as
much as elements in the grid), and the code really represents the
layout rather than html hacks.

# Usage

First you need to include *gridify.js* into your document and call
gridify on the element you want to gridify as your top level grid.

Then you need to define number and size of rows and columns of your
grid using *data-grid-rowdef* and *data-grid-coldef* attributes.

All child elements of a grid are treated as grid elements. By
default, they all are located at first row and first column and span
one row and one column. You can change these by *data-grid-row*, 
*data-grid-col*, *data-grid-rowspan*, and *data-grid-colspan*.

Take a look at the example:

    <div id="gridExample" 
        data-grid-rowdef="1*, 2*, 2*, 50%" 
        data-grid-coldef="1*, 2*, 3*"> 
        
        <!-- A grid is defined with 4 rows.
        Last row occupies 50% of the grid, while second and third
        rows are twice as high as first row. It has three columns,
        with the second one being twice as wide as the first one and
        third one three times as wide as first one. --> 
        
        <img src="images/2.jpg" /> 

        <!-- row and col are 0 by default, and rowspan and colspan are 1 --> 
        
        <img src="images/3.jpg" data-grid-row="1" data-grid-col="1" data-grid-rowspan="1" data-grid-col="1"/> 

        <img src="images/1.jpg" data-grid-row="1" data-grid-rowspan="2" data-grid-colspan="2" />
        
        <!-- You can have as many nested grids as you want. Any
        element with data-grid-coldef and/or data-grid-rowdef
        attribute is recognized as a grid object. Here I define a 3
        by 3 grid, with uniform rows and uniform columns. --> 
        
        <div data-grid-rowdef='1*, 1*, 1*' 
             data-grid-coldef='1*, 1*, 1*' 
             data-grid-col="2" data-grid-row="0"> 
             
            <div class="greenbox" data-grid-colspan="2"></div> 
            
            <div class="bluebox" data-grid-col="1" data-grid-colspan="2" data-grid-row="1"></div> 
            
            <div class="redbox" data-grid-row="2"></div> 
            
        </div> 
    </div>

Take a look sample.html for a working example.

# Compatibility

**gridify.js** uses [custom
attributes](http://www.w3schools.com/tags/att_global_data.asp) which
are supported by almost all mainstream web browsers.

## **grid5.js** vs **gridify.js**
You can use either of **grid5.js** and **gridify.js**. Their usage is
syntactically different, though semantically they are similar. Their
main difference though is in browser compatibility.

**grid5.js** uses html5's [custom
elements](http://w3c.github.io/webcomponents/spec/custom/), which is
minimally supported. Specifically, it uses
[registerElement](https://developer.mozilla.org/en-
US/docs/Web/API/Document/registerElement) which is only fully
supported by Chrome and Opera. FF supports it but not by default, and
I got it running on IE 11 after including [webcomponents script](http
s://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/0.7.7/webcomponent
s.min.js).


**NOTE:** I don't actively maintain or document *grid5.js*, due to
compatibility issues mentioned above. Thus, it is **strongly
recommended** to use *gridify.js* for all purposes. It's also less
verbose, and it has a smaller footprint.
