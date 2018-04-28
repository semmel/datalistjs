/**
 * @file The polyfill in a single file.
 * Created on 28/04/18 for the datalistjs project.
 */
  
/**
 * @typedef {Object} Module_datalist
 * @property {Boolean} isNativelySupported
 * @property {function} polyfill
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['vendor/ramda', 'vendor/Bacon'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('ramda'), require('baconjs'));
    } else {
        root.returnExports = factory(root.R, root.Bacon);
    }
}(typeof self !== 'undefined' ? self : this, 
/**
 * @param {R.Static} R
 * @param {Bacon.Static} Bacon
 * @return {Module_datalist}
 */
function (R, Bacon)
{
	// Utility functions which usually are imported form somewhere else
	
	/**
	 *
	 * @param {String} valueText
	 * @return {HTMLLIElement}
	 */
	function createListElementWithValue(valueText)
	{
		const
			listElement = document.createElement('li');
		
		listElement.textContent = valueText;
		
		return listElement;
	}
	
	/**
	 *
	 * @param {Array<HTMLElement>} elements
	 * @return {DocumentFragment}
	 */
	function createDocumentFragmentOfElements(elements)
	{
		const
			frag = document.createDocumentFragment();
		
		elements.forEach(function(element)
		{
			frag.appendChild(element);
		});
		
		return frag;
	}
	
	
	
	const
		 isDatalistSupported = !!(document.createElement('datalist') && window.HTMLDataListElement);
	
	/**
	 *
	 * @param {HTMLElement} [parent=document.body]
	 */
	function initialize(parent)
	{
		const
			inputs = (parent || document.body).querySelectorAll('input[list]');
		
		inputs.forEach(
			/**
			 *
			 * @param {HTMLInputElement} inputElement
			 */
			function (inputElement)
			{
				const
					selectBox = document.createElement('ul'),
					dataListElement = /** @type {HTMLDataListElement} */ document.getElementById(inputElement.getAttribute('list')),
					optionsLiveCollection = dataListElement.options,
					
					options =
						Bacon.once(R.pluck('value')(optionsLiveCollection))
						.merge(Bacon.never().map(optionsLiveCollection)),  // TODO MutationObserver.any.records.type == childList
						
					focus = Bacon.fromEvent(inputElement, 'focus'),
					blur = Bacon.fromEvent(inputElement, 'blur'),
					input = Bacon.fromEvent(inputElement, 'input', R.path(['target', 'value'])),
					
					/**
					 *
					 * @param {DocumentFragment} fragment
					 */
					updateSelectBoxContentsWithDomFragment = function(fragment)
					{
						const
							range = document.createRange();
						
						range.selectNodeContents(selectBox);
						range.deleteContents();
						range.insertNode(fragment);
					},
					
					hideSelectBox = function()
					{
						selectBox.style.display = "none";
					},
					
					showSelectBox = function()
					{
						selectBox.style.display = "block";
					},
					
					/** @type {Bacon.EventStream<E, Array<HTMLElement>>} */
					optionButtons = Bacon.combineWith(
						function(userText, optionTexts)
						{
							return R.filter(R.contains(userText), optionTexts);
						},
						input,
						options
					)
					.filter(R.propSatisfies(R.lt(0), 'length'))
					.skipDuplicates(R.equals)
					.map(R.map(createListElementWithValue));
				
				
				focus.onValue(showSelectBox);
				
				optionButtons.onValue(R.compose(updateSelectBoxContentsWithDomFragment, createDocumentFragmentOfElements));
			}
		);
		
	}
	
	return {
		polyfill: initialize,
		isNativelySupported: isDatalistSupported
	};
}));