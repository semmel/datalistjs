# datalistjs
<img align="right" src="/artwork/datalist_demo_screen_recording.gif"/>

yet another [`<datalist>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist) implementation for Safari (the only browser still [not supporting](https://caniuse.com/#feat=datalist) `<datalist>`)

### Motivation
The only actively maintained polyfill project [mfranzke/datalist-polyfill](https://github.com/mfranzke/datalist-polyfill) chooses to employ the [iOS wheel picker](https://developer.apple.com/ios/human-interface-guidelines/controls/pickers/) presenting the selection options. Which IMO takes up huge space, is obtrusive and thus really breaks the UI!

 [We need smarter dropdowns](https://medium.com/@kollinz/dropdown-alternatives-for-better-mobile-forms-53e40d641b53).

### Features

* Works by attaching a scrollable dropdown-like option list below the targeted input element - no ugly iOS picker wheels are used.
* Detects changes to the `<datalist>` items and updates option list items accordingly.
* Tested on iOS 9-11

### <a name="api"></a> API
See [generated documentation files](https://rawgit.com/semmel/datalistjs/master/doc/DataListJS.html)


### Caveats
* No support for *cursor-key option selection* using the keyboard (Desktop Safari is currently not targeted)
* Since JS inline styles cannot target CSS pseudo classes, the styling of the *touch interaction* with the options in the list (e.g. using `.ul-datalist-polyfill li:active`) should be done by the implementor.
```css
.datalist-polyfill-demo li:active {
    transform: scale(0.9);
    opacity: 0.2;
}
```

#### Side effects of using `position:absolute`
The generated dropdown container is inserted *right after the input element* into the pages DOM tree with CSS property `position: absolute`.
* Any position change of the dedicated input element will destroy the alignment of input element and generated dropdown. Except when *resizing* occurs the dropown selections should be re-positioned by the implementation. See the [API](#api)
* The implementation must take care to make any *scrollable ancestor* element of the input field also their [Offset Parent](https://developer.mozilla.org/en-US/docs/Web/API/HTMLelement/offsetParent) e.g. by setting `position: relative;`

<img alt="Make the scrollable ancestor of the input it's offset parent" src="/artwork/datalistpolyfill-css.png" width="710" height="480"/>

* Being part of the same [stacking context](https://philipwalton.com/articles/what-no-one-told-you-about-z-index/) as the input element, the generated dropdown is subject to the limitations in the stacking order.
   * The implementation should assign a `zIndex` style property in the [`PolyfillOptions`](https://rawgit.com/semmel/datalistjs/master/doc/DataListJS.html#.PolyfillOptions) to lift up the dropdown at least inside it's stacking context.
   * The dropdown cannot protrude it's stacking context root element if the available space is insufficient. (See `demo.html`)

### Worthy of note
* [Bacon.js](https://baconjs.github.io/) and [Ramda](http://ramdajs.com) for the functional utility toolbelt.
* [UMD-style](https://github.com/umdjs/umd) module for integration in project structure.
* Zipped dependency-free [distribution file](dist/datalist.min.js) for free integration in a web page.

### References
* [willmcpo/body-scroll-lock](https://github.com/willmcpo/body-scroll-lock)
* [Fyrd/purejs-datalist-polyfill](https://github.com/Fyrd/purejs-datalist-polyfill)

### Usage
* Download [the latest release](https://github.com/semmel/datalistjs/releases/latest).

Either
* load `dist/datalist.min.js` by `<script>` tag (see [`demo.html`](demo.html)), or
* include `datalist.js` in your AMD/CommonJS module aware project.
```html
<p>
    <label>Select a browser:</label>
    <input type="text" list="browsers">
</p>
<datalist id="browsers">
    <option value="Chrome"></option>
    <option value="Firefox"></option>
    <option value="Internet Explorer"></option>
    <option value="Opera"></option>
    <option value="Safari"></option>
    <option value="Microsoft Edge"></option>
    <option value="Brave"></option>
</datalist>
...
<!-- no JS module loader used -->
<script src="dist/datalist.min.js"></script>
<script>
var updatePositions = function(){};

document.addEventListener('readystatechange', function()
{
    if (document.readyState === "complete")
    {
        if (DataListJS.isNotNativelySupported)
        {
            updatePositions = DataListJS.polyfill(
                document.body,
                {
                    uListStyle: {
                        cssClassName: 'datalist-polyfill-demo',
                        styles: { maxHeight: "120px" }
                    }
                }
            );
        }
    }
});
</script>
```
### Development
#### Generate Docs
Install [JSDoc](http://usejsdoc.org/).
```shell
npm install -g jsdoc
```
Build
```shell
npm run docs
```
#### Build distribution files
Install [RequireJS Optimizer](http://requirejs.org/docs/optimization.html)
```shell
npm install -g requirejs
```
Need the latest release of [requirejs/almond.js](https://github.com/requirejs/almond) in the `build` folder. Included is [a version](build/almond.js).

Build
```shell
npm run zip
```