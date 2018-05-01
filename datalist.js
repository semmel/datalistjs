/**
 * @file The polyfill in a single file.
 * Created on 28/04/18 for the datalistjs project.
 */
  
/**
 * @typedef {Object} Module_datalist
 * @property {Boolean} isNotNativelySupported
 * @property {function(HTMLElement=): function():void} polyfill
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
		/**
		 *
		 * @param {HTMLElement} targetElement
		 * @return {Boolean}
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#Problems_and_solutions
		 */
		isElementTotallyScrolled = function(targetElement)
		{
			return targetElement.scrollHeight - targetElement.scrollTop <= targetElement.clientHeight;
		},
		
		/**
		 * @see https://github.com/willmcpo/body-scroll-lock
		 * @param {HTMLElement} targetElement
		 * @return {function():void}
		 */
		disableBodyScroll = function(targetElement)
		{
			/**
			 *
			 * @param {TouchEvent} initialTouchEvent
			 */
			function preventPageScrollingAtElementScrollEndingsStartingWithEvent(initialTouchEvent)
			{
				if (initialTouchEvent.targetTouches.length !== 1)
				{
					return;
				}
				
				const
					/** @type {Bacon.EventStream<E, TouchEvent>} */
					touchMoveAtScrollEnding =
						Bacon.fromEvent(targetElement, 'touchmove')
						.filter(
							/**
							 *
							 * @param {TouchEvent} touchEvent
							 * @return {Boolean}
							 */
							function(touchEvent)
							{
								if (touchEvent.targetTouches.length !== 1)
								{
									return false;
								}
								
								const
									isScrollingDown = touchEvent.targetTouches[0].clientY - initialTouchEvent.targetTouches[0].clientY > 0;
								
								return (isScrollingDown && (targetElement.scrollTop === 0)) ||
									(!isScrollingDown && isElementTotallyScrolled(targetElement));
							}
						)
						.takeUntil(Bacon.fromEvent(targetElement, 'touchend'));
					
				touchMoveAtScrollEnding
				.onValue(function (touchEvent)
				{
					touchEvent.preventDefault();
				});
			}
			
			targetElement.addEventListener('touchstart', preventPageScrollingAtElementScrollEndingsStartingWithEvent, false);
			
			return function()
			{
				targetElement.removeEventListener('touchstart', preventPageScrollingAtElementScrollEndingsStartingWithEvent);
			};
		};
	
	/**
	 *
	 * @param {MutationObserverInit} initOptions
	 * @param {Node} domNode
	 * @return {Bacon.EventStream<E, Array<MutationRecord>>}
	 */
	function mutationsForElement(initOptions, domNode)
	{
		return Bacon.fromBinder(function (sink)
		{
			const
				observer = new MutationObserver(sink);
			observer.observe(domNode, initOptions);
			
			return function () { observer.disconnect(); };
		});
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
		 * @param {HTMLInputElement} inputField
		 * @return {HTMLUListElement}
		 */
		createSelectionContainerForInput = function(inputField)
		{
			const
				selectBox = document.createElement('ul'),
				/**
				 *
				 * @type {CSSStyleDeclaration}
				 */
				inputFieldStyle = window.getComputedStyle(inputField);
			
			selectBox.classList.add('datalist-polyfill');
			
			selectBox.style.backgroundColor = inputFieldStyle.backgroundColor;
			selectBox.style.color = inputFieldStyle.color;
			
			return selectBox;
		};
	
	const
		 isDatalistSupported = !!(document.createElement('datalist') && window.HTMLDataListElement);
	
	/**
	 *
	 * @param {HTMLElement} [parent=document.body]
	 * @return {function(): void} update the positions of the select boxes according to the changed positions of the input elements
	 */
	function initialize(parent)
	{
		const
			inputs = (parent || document.body).querySelectorAll('input[list]'),
			
			resizingPage = Bacon.fromEvent(window, 'resize'),
		
			/**
			 *
			 * @param {HTMLInputElement} inputElement
			 * @return {function():void}
			 */
			setupInputElement = function (inputElement)
			{
				const
					selectBox = createSelectionContainerForInput(inputElement),
					dataListElement = /** @type {HTMLDataListElement} */ document.getElementById(inputElement.getAttribute('list')),
					optionsLiveCollection = dataListElement.getElementsByTagName('option'),
					
					positionListAccordingToInput = positionTargetBelowSourceElement.bind(undefined, selectBox, inputElement),
					
					/** @type {Bacon.Property<E, Array<String>>} */
					options =
						mutationsForElement({childList: true}, dataListElement)
						.filter(R.filter(R.propEq('type', 'childList')))
						.map(optionsLiveCollection)
						.toProperty(optionsLiveCollection)
						.map(R.pluck('value')),
						
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
						.filter(R.complement(R.isEmpty))
						.skipDuplicates(R.equals)
						.map(R.map(createListElementWithValue)),
					
					/**
					 *
					 * @type {Bacon.EventStream<E, Boolean>}
					 */
					toggledAreAnyOptionsMatched =
						matchedOptions
						.map(R.complement(R.isEmpty))
						.changes(),
					
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
				
				disableBodyScroll(selectBox);
				
				inputElement.parentElement.appendChild(selectBox);
				
				return positionListAccordingToInput;
			};
			
		const
			allPositionUpdateFunctions = R.map(setupInputElement, Array.from(inputs));
		
		return function()
		{
			R.forEach(R.call, allPositionUpdateFunctions);
		};
	}
	
	return {
		polyfill: initialize,
		isNotNativelySupported: !isDatalistSupported
	};
}));