Auto Require JS Files when changed! No App restart required!

How about overcoming small hurdles of server restart whenever a minor change is included in a file?
This module does exactly that! It watches for file changes and auto requires them once any change is made!

	var cRequire = require('change-require');
	// Require and ask for manipulation
	var myModule = cRequire(myModule);

	// Call myModule function as:
	myModule.myFunction(...);

Note: DON'T save a reference to myFunction and call directly as:

        var myModule = cRequire(myModule),
        myFunction = myModule.myFunction;
        myFunction() // ❌ Incorrect. Will not be auto applied when myModule file changes!

Correct way:

        myModule.myFunction() // ✔️ Correct way to call! Any changes will be auto applied.

Also, the global require can be overridden as:

        require('change-require').globalise();

## Limitations:

This is applicable when either an object ({}) or a function is exported. In case anything else such as a number or string is exported from a file, this will not be applied.

Also, won't be applied on inbuilt modules!