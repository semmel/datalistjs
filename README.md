# datalistjs
yet another [`<datalist>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist) implementation for Safari (the only browser still not supporting `<datalist>`)

### Features
* Works by attaching a scrollable option list below the targeted input element - no ugly native form selects are used.
* Detects changes to the `<datalist>` items and updates option list items accordingly.
* Tested on iOS 9-11

### <a name="api"></a> API
Exported items:

`isNotNativelySupported: Boolean` - is the polyfill needed (i.e. are we running on Safari?)

`polyfill(containerDomElement=document.body): function` - initializes the inputs and returns a function to re-position the option lists found in the container.


### Caveats (Roadmap)
* Since the generated selection boxes are positioned `absolute` below the inputs at initialization time, any position movements of their dedicated input elements will separate both. Except when *resizing* occurs the selection boxes should be re-positioned by the implementation. See the [API](#api)
* No support for cursor-key selection using the keyboard (Desktop Safari is currently not targeted)
* Some CSS needed to paint the option lists. This should be easy to get rid of.
* Not dependecy-free: Need [Bacon.js](https://baconjs.github.io/) and [Ramda](http://ramdajs.com) for functional style.
* [UMD-style](https://github.com/umdjs/umd) module

### References
* [willmcpo/body-scroll-lock](https://github.com/willmcpo/body-scroll-lock)
* [Fyrd/purejs-datalist-polyfill](https://github.com/Fyrd/purejs-datalist-polyfill)

### Example

```html
<head>
<link type=text/css rel=stylesheet href="datalist.css"/>
</head>
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
				updatePositions = DataListJS.polyfill();
			}
		}
	});
</script>
```
