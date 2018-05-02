# datalistjs
<img align="right" src="https://rawgit.com/semmel/datalistjs/master/artwork/datalist_demo_screen_recording.gif"/>

yet another [`<datalist>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist) implementation for Safari (the only browser still [not supporting](https://caniuse.com/#feat=datalist) `<datalist>`)

### Motivation
The only actively maintained polyfill project [mfranzke/datalist-polyfill](https://github.com/mfranzke/datalist-polyfill) chooses to employ the [iOS wheel picker](https://developer.apple.com/ios/human-interface-guidelines/controls/pickers/) presenting the selection options. Which IMO is huge and obtrusive and really breaks the UI!

 [We need smarter dropdowns](https://medium.com/@kollinz/dropdown-alternatives-for-better-mobile-forms-53e40d641b53).

### Features

* Works by attaching a scrollable dropdown-like option list below the targeted input element - no ugly iOS picker wheels are used.
* Detects changes to the `<datalist>` items and updates option list items accordingly.
* Tested on iOS 9-11

### <a name="api"></a> API
[The Generated Documentation](https://rawgit.com/semmel/datalistjs/master/doc/DataListJS.html)


### Caveats
* Since the generated selection boxes are positioned `absolute` below the inputs at initialization time, any position movements of their dedicated input elements will separate both. Except when *resizing* occurs the selection boxes should be re-positioned by the implementation. See the [API](#api)
* No support for cursor-key selection using the keyboard (Desktop Safari is currently not targeted)
* Since JS inline styles cannot target CSS pseudo classes, the styling of the touch interaction with the options in the list (`.ul-datalist-polyfill li:active`) should be done by the implementor.
```css
.datalist-polyfill-demo li:active {
    transform: scale(0.9);
    opacity: 0.2;
}
```

### Worthy of note
* Not dependecy-free: Need [Bacon.js](https://baconjs.github.io/) and [Ramda](http://ramdajs.com) for the functional utility toolbelt.
* [UMD-style](https://github.com/umdjs/umd) module

### References
* [willmcpo/body-scroll-lock](https://github.com/willmcpo/body-scroll-lock)
* [Fyrd/purejs-datalist-polyfill](https://github.com/Fyrd/purejs-datalist-polyfill)

### Example
see `demo.html`:
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
<script src="node_modules/ramda/dist/ramda.js"></script>
<script src="node_modules/baconjs/dist/Bacon.js"></script>
<script src="datalist.js"></script>
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
npm run docs
```