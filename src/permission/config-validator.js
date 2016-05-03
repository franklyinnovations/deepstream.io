var pathParser = require( './path-parser' );
var ruleParser = require( './rule-parser' );
var validationSteps = {};
var TOP_LEVEL_KEYS = [ 'record', 'event', 'rpc' ];
var SCHEMA = {
	record: {
		write: true,
		read: true,
		validate: true,
	},
	event: {
		publish: true,
		subscribe: true
	},
	rpc: {
		provide: true,
		request: true
	}
};

validationSteps.isValidType = function( config ) {
	if( typeof config === 'object' ) {
		return true;
	} else {
		return 'config should be an object literal, but was of type ' + ( typeof config );
	}
};


validationSteps.hasRequiredTopLevelKeys = function( config ) {
	for( var key in SCHEMA ) {
		if( typeof config[ key ] !== 'object' ) {
			return 'missing configuration section "' + key + '"';
		}
	}

	return true;
};

validationSteps.doesNotHaveAdditionalTopLevelKeys = function( config ) {
	for( var key in config ) {
		if( typeof SCHEMA[ key ] === 'undefined' ) {
			return 'unexpected configuration section "' + key + '"';
		}
	}

	return true;
};

validationSteps.doesOnlyContainValidPaths = function( config ) {
	var key, path, result;

	for( key in SCHEMA ) {

		// Check empty
		if( Object.keys( config[ key ] ).length === 0 ) {
			return 'empty section "' + key + '"';
		}

		// Check valid
		for( path in config[ key ] ) {
			result = pathParser.validate( path );
			if( result !== true ) {
				return result + ' for path ' + path + ' in section ' + key;
			}
		}
	}

	return true;
};

validationSteps.hasValidRules = function( config ) {
	var key, path, ruleType, section;

	for( section in config ) {
		for( path in config[ section ] ) {
			for( ruleType in config[ section ][ path ] ) {
				if( SCHEMA[ section ][ ruleType ] !== true ) {
					return 'unknown rule type ' + ruleType + ' in section ' + section;
				}
				validationResult = ruleParser.validate( config[ section ][ path ][ ruleType ] );
				if( validationResult !== true ) {
					return validationResult;
				}
			}
		}
	}

	return true;
};

exports.validate = function( config ) {
	var validationStepResult;
	var key;

	for( key in validationSteps ) {
		validationStepResult = validationSteps[ key ]( config );

		if( validationStepResult !== true ) {
			return validationStepResult;
		}
	}

	return true;
};