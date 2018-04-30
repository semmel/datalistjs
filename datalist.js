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
        root.DataListJS = factory(root.R, root.Bacon);
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
		truthy = R.identical(true),
		falsy = R.identical(false),
		/**
		 *
		 * @type {function(HTMLElement): function(DocumentFragment): void}
		 */
		replaceContainerContentsWithDomFragment = R.curry(
			/**
			 * @param {HTMLElement} containerElement
			 * @param {DocumentFragment} fragment
			 */
			function(containerElement, fragment)
			{
				const
					range = document.createRange();
				
				range.selectNodeContents(containerElement);
				range.deleteContents();
				range.insertNode(fragment);
			}),
		
		populateInputWithValue = R.curry(
			/**
			 * @param {HTMLInputElement} input
			 * @param {String} value
			 */
			function(input, value)
			{
				input.value = value;
				
				input.dispatchEvent(new Event('change'));
			}),
		
		/**
		 *
		 * @param {HTMLElement} target
		 * @param {HTMLElement} source
		 */
		positionTargetBelowSourceElement = function(target, source)
		{
			target.style.top = source.offsetTop + source.offsetHeight + 'px';
			target.style.left = source.offsetLeft + 'px';
			target.style.width = source.offsetWidth + 'px';
		},
		
		/**
		 * @return {HTMLUListElement}
		 */
		createSelectionContainer = function()
		{
			const
				selectBox = document.createElement('ul');
			
			selectBox.classList.add('datalist-polyfill');
			
			document.body.appendChild(selectBox);
			
			return selectBox;
		},
		
		/**
		 *
		 * @param {HTMLElement} domElement
		 * @return {Bacon.EventStream<E, Event>}
		 */
		firstClickOnDomElement = function(domElement)
		{
			return Bacon.fromEvent(domElement, 'click');
		};
	
	
	
	const
		 isDatalistSupported = !!(document.createElement('datalist') && window.HTMLDataListElement);
	
	/**
	 *
	 * @param {HTMLElement} [parent=document.body]
	 */
	function initialize(parent)
	{
		const
			inputs = (parent || document.body).querySelectorAll('input[tha-list]'),
			
			resizingPage = Bacon.fromEvent(window, 'resize');
		
		inputs.forEach(
			/**
			 *
			 * @param {HTMLInputElement} inputElement
			 */
			function (inputElement)
			{
				const
					selectBox = createSelectionContainer(),
					dataListElement = /** @type {HTMLDataListElement} */ document.getElementById(inputElement.getAttribute('tha-list')),
					optionsLiveCollection = dataListElement.getElementsByTagName('option'),
					
					positionListAccordingToInput = positionTargetBelowSourceElement.bind(undefined, selectBox, inputElement),
					
					 // TODO MutationObserver.any.records.type == childList
					/** @type {Bacon.Property<E, Array<String>>} */
					options =
						Bacon.never()
						.map(optionsLiveCollection)
						.toProperty(R.pluck('value')(optionsLiveCollection)),
						
					hasFocus = Bacon.mergeAll(
						Bacon.fromEvent(inputElement, 'focus').map(true),
						Bacon.fromEvent(inputElement, 'blur').delay(20).map(false) // If this fires immediately, it prevents click-to-select from working
					).toProperty(document.activeElement === inputElement),
					
					focus = hasFocus.filter(truthy).toEventStream(),
					blur = hasFocus.filter(falsy).toEventStream(),
					
					/**
					 *
					 * @type {Bacon.Property<any, String>}
					 */
					input =
						Bacon.mergeAll(
							Bacon.fromEvent(inputElement, 'input'),
							Bacon.fromEvent(inputElement, 'change')
						)
						.map(R.path(['target', 'value']))
						.toProperty(inputElement.value)
						.skipDuplicates(),
					
					hideSelectBox = function()
					{
						selectBox.style.display = "none";
					},
					
					showSelectBox = function()
					{
						selectBox.style.display = "block";
					},
					
					updateSelectBoxContentsWithDomFragment = replaceContainerContentsWithDomFragment(selectBox),
					
					/** @type {Bacon.Property<E, Array<String>>} */
					matchedOptions = Bacon.combineWith(
						function(userText, optionTexts)
						{
							return R.filter(R.useWith(R.contains, [R.toLower, R.toLower])(userText), optionTexts);
						},
						input,
						options
					),
					
					/** @type {Bacon.Property<E, Array<HTMLElement>>} */
					optionButtons =
						matchedOptions
						.filter(R.propSatisfies(R.lt(0), 'length'))
						.skipDuplicates(R.equals)
						.map(R.map(createListElementWithValue)),
					
					/**
					 *
					 * @type {Bacon.EventStream<E, Boolean>}
					 */
					toggledAreAnyOptionsMatched = matchedOptions.map(R.complement(R.isEmpty)).changes(),
					
					selecting =
						optionButtons
						.map(R.map(
							/**
							 *
							 * @param {HTMLElement} button
							 * @return {Bacon.EventStream<E, String>}
							 */
							function(button)
							{
								return Bacon.fromEvent(
									button,
									'click',
									R.compose(R.trim, R.path(['target', 'textContent']))
								)
								.first();
							})
						)
						.flatMap(Bacon.mergeAll)
						.filter(hasFocus);
						
				
				Bacon.mergeAll(
					focus.filter(matchedOptions.map(R.complement(R.isEmpty))),
					toggledAreAnyOptionsMatched.filter(truthy).filter(hasFocus)
				)
				.onValue(showSelectBox);
				
				Bacon.mergeAll(
					blur,
					toggledAreAnyOptionsMatched.filter(falsy)
				).onValue(hideSelectBox);
				
				optionButtons.onValue(
					R.compose(updateSelectBoxContentsWithDomFragment, createDocumentFragmentOfElements)
				);
				
				Bacon.mergeAll(
					resizingPage,
					Bacon.once(undefined)
				)
				.onValue(positionListAccordingToInput);
				
				selecting
				.onValue(populateInputWithValue(inputElement));
			}
		);
		
	}
	
	return {
		polyfill: initialize,
		isNativelySupported: isDatalistSupported
	};
}));