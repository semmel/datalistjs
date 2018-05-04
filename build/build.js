/**
 *
 */
({
	baseUrl : "./..",

	name : "build/almond",

	include : [
		'datalist'
	],

	optimize: "uglify2",

	generateSourceMaps: true,

	preserveLicenseComments: true,

	wrap: {
        startFile: 'start_fragment.js',
        endFile: 'end_fragment.js'
    },

	out: "../dist/datalist.min.js",

	loglevel: 1,


	/// from require.config() in develop_config.js
	paths: {
		'vendor/ramda' : 'node_modules/ramda/dist/ramda',
		'vendor/Bacon'     : 'node_modules/baconjs/dist/Bacon'
	},

	config: {
		text: {
			useXhr: function (url, protocol, hostname, port)
			{
				return true;
			}
		}
	}
})