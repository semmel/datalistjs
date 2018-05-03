# datalistjs
<img align="right" src="/artwork/datalist_demo_screen_recording.gif"/>

yet another [`<datalist>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist) implementation for Safari (the only browser still [not supporting](https://caniuse.com/#feat=datalist) `<datalist>`)

### Motivation
The only actively maintained polyfill project [mfranzke/datalist-polyfill](https://github.com/mfranzke/datalist-polyfill) chooses to employ the [iOS wheel picker](https://developer.apple.com/ios/human-interface-guidelines/controls/pickers/) presenting the selection options. Which IMO is huge and obtrusive and really breaks the UI!

 [We need smarter dropdowns](https://medium.com/@kollinz/dropdown-alternatives-for-better-mobile-forms-53e40d641b53).

### Features

* Works by attaching a scrollable dropdown-like option list below the targeted input element - no ugly iOS picker wheels are used.
* Detects changes to the `<datalist>` items and updates option list items accordingly.
* Tested on iOS 9-11

### <a name="api"></a> API
See [generated documentation files](https://rawgit.com/semmel/datalistjs/master/doc/DataListJS.html)


### Caveats
* Since the generated selection boxes are positioned `absolute` below the inputs at initialization time, any position movements of their dedicated input elements will destroy their alignment. Except when *resizing* occurs the selection boxes should be re-positioned by the implementation. See the [API](#api)
* No support for *cursor-key option selection* using the keyboard (Desktop Safari is currently not targeted)
* Since JS inline styles cannot target CSS pseudo classes, the styling of the *touch interaction* with the options in the list (`.ul-datalist-polyfill li:active`) should be done by the implementor.
```css
.datalist-polyfill-demo li:active {
    transform: scale(0.9);
    opacity: 0.2;
}
```
* Another side effect of setting the style property `position: absolute` for the generated dropdown container is that the implementation must take care to make any scroll-able parent element of the input field also their [Offset Parent](https://developer.mozilla.org/en-US/docs/Web/API/HTMLelement/offsetParent) e.g. by setting `position: relative;`

<img alt="Make the scrollable ancestor of the input it's offset parent" src="/artwork/datalistpolyfill-css.png" width="710" height="480"/>

### Worthy of note
* Not dependency-free: Need [Bacon.js](https://baconjs.github.io/) and [Ramda](http://ramdajs.com) for the functional utility toolbelt.
* [UMD-style](https://github.com/umdjs/umd) module

### References
* [willmcpo/body-scroll-lock](https://github.com/willmcpo/body-scroll-lock)
* [Fyrd/purejs-datalist-polyfill](https://github.com/Fyrd/purejs-datalist-polyfill)

### Example
Also see [`demo.html`](demo.html).
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
var updatePositions = R.identity;

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
##### Generate Docs
Install [JSDoc](http://usejsdoc.org/).
```shell
npm install -g jsdoc
```
Build
```shell
npm run docs
```
##### Build distribution files
Install [RequireJS Optimizer](http://requirejs.org/docs/optimization.html)
```shell
npm install -g requirejs
```
Need the latest release of [almond.js](https://github.com/requirejs/almond) in the `build` folder. Included is [a version](build/almond.js).
Generate bundled and minified JS files for distribution.
```shell
npm run zip
```