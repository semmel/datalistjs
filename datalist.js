/**
 * @file The polyfill in a single file.
 * Created on 28/04/18 for the datalistjs project.
 */
  
/**
 * @typedef {function} Module_datalist
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['vendor/ramda'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('ramda'));
    } else {
        root.returnExports = factory(root.R);
    }
}(typeof self !== 'undefined' ? self : this, 
/**
 * @param {R.Static} R
 * @return {Module_datalist}
 */
function (R) 
{
	function initialize()
	{
	
	}
	
	return initialize;
}));