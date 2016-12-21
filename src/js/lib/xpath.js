/** @license
========================================================================
  XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 
  Copyright (c) 2012 Sergey Ilinsky
  Dual licensed under the MIT and GPL licenses.
*/
(function(){

//	Javascript objects
var cString		= window.String,
	cBoolean	= window.Boolean,
	cNumber		= window.Number,
	cObject		= window.Object,
	cArray		= window.Array,
	cRegExp		= window.RegExp,
	cDate		= window.Date,
	cFunction	= window.Function,
	cMath		= window.Math,
// Error Objects
	cError		= window.Error,
	cSyntaxError= window.SyntaxError,
	cTypeError	= window.TypeError,
//	misc
	fIsNaN		= window.isNaN,
	fIsFinite	= window.isFinite,
	nNaN		= window.NaN,
	nInfinity	= window.Infinity,
	// Functions
	fWindow_btoa	= window.btoa,
	fWindow_atob	= window.atob,
	fWindow_parseInt= window.parseInt,
	fString_trim	=(function() {
		return cString.prototype.trim ? function(sValue) {return cString(sValue).trim();} : function(sValue) {
			return cString(sValue).replace(/^\s+|\s+$/g, '');
		};
	})(),
	fArray_indexOf	=(function() {
		return cArray.prototype.indexOf ? function(aValue, vItem) {return aValue.indexOf(vItem);} : function(aValue, vItem) {
			for (var nIndex = 0, nLength = aValue.length; nIndex < nLength; nIndex++)
				if (aValue[nIndex] === vItem)
					return nIndex;
			return -1;
		};
	})();

var sNS_XSD	= "http://www.w3.org/2001/XMLSchema",
	sNS_XPF	= "http://www.w3.org/2005/xpath-functions",
	sNS_XNS	= "http://www.w3.org/2000/xmlns/",
	sNS_XML	= "http://www.w3.org/XML/1998/namespace";

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cException(sCode

	) {

	this.code		= sCode;
	this.message	=

					  oException_messages[sCode];
};

cException.prototype	= new cError;

// "http://www.w3.org/2005/xqt-errors"

var oException_messages	= {};
oException_messages["XPDY0002"]	= "Evaluation of an expression relies on some part of the dynamic context that has not been assigned a value.";
oException_messages["XPST0003"]	= "Expression is not a valid instance of the grammar";
oException_messages["XPTY0004"]	= "Type is not appropriate for the context in which the expression occurs";
oException_messages["XPST0008"]	= "Expression refers to an element name, attribute name, schema type name, namespace prefix, or variable name that is not defined in the static context";
oException_messages["XPST0010"]	= "Axis not supported";
oException_messages["XPST0017"]	= "Expanded QName and number of arguments in a function call do not match the name and arity of a function signature";
oException_messages["XPTY0018"]	= "The result of the last step in a path expression contains both nodes and atomic values";
oException_messages["XPTY0019"]	= "The result of a step (other than the last step) in a path expression contains an atomic value.";
oException_messages["XPTY0020"]	= "In an axis step, the context item is not a node.";
oException_messages["XPST0051"]	= "It is a static error if a QName that is used as an AtomicType in a SequenceType is not defined in the in-scope schema types as an atomic type.";
oException_messages["XPST0081"]	= "A QName used in an expression contains a namespace prefix that cannot be expanded into a namespace URI by using the statically known namespaces.";
//
oException_messages["FORG0001"]	= "Invalid value for cast/constructor.";
oException_messages["FORG0003"]	= "fn:zero-or-one called with a sequence containing more than one item.";
oException_messages["FORG0004"]	= "fn:one-or-more called with a sequence containing no items.";
oException_messages["FORG0005"]	= "fn:exactly-one called with a sequence containing zero or more than one item.";
oException_messages["FORG0006"]	= "Invalid argument type.";
//
oException_messages["FODC0001"]	= "No context document.";
//
oException_messages["FORX0001"]	= "Invalid regular expression flags.";
//
oException_messages["FOCA0002"]	= "Invalid lexical value.";
//
oException_messages["FOCH0002"]	= "Unsupported collation.";

oException_messages["FONS0004"]	= "No namespace found for prefix.";

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cLexer(sValue) {
	var aMatch	= sValue.match(/\$?(?:(?![0-9-])(?:\w[\w.-]*|\*):)?(?![0-9-])(?:\w[\w.-]*|\*)|\(:|:\)|\/\/|\.\.|::|\d+(?:\.\d*)?(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?|"[^"]*(?:""[^"]*)*"|'[^']*(?:''[^']*)*'|<<|>>|[!<>]=|(?![0-9-])[\w-]+:\*|\s+|./g);
	if (aMatch) {
		var nStack	= 0;
		for (var nIndex = 0, nLength = aMatch.length; nIndex < nLength; nIndex++)
			if (aMatch[nIndex] == '(:')
				nStack++;
			else
			if (aMatch[nIndex] == ':)' && nStack)
				nStack--;
			else
			if (!nStack && !/^\s/.test(aMatch[nIndex]))
				this[this.length++]	= aMatch[nIndex];
		if (nStack)
			throw new cException("XPST0003"

			);
	}
};

cLexer.prototype.index		= 0;
cLexer.prototype.length	= 0;

cLexer.prototype.reset	= function() {
	this.index	= 0;
};

cLexer.prototype.peek	= function(nOffset) {
	return this[this.index +(nOffset || 0)] || '';
};

cLexer.prototype.next	= function(nOffset) {
	return(this.index+= nOffset || 1) < this.length;
};

cLexer.prototype.back	= function(nOffset) {
	return(this.index-= nOffset || 1) > 0;
};

cLexer.prototype.eof	= function() {
	return this.index >= this.length;
};

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cDOMAdapter() {

};

// Custom members
cDOMAdapter.prototype.isNode		= function(oNode) {
	return oNode &&!!oNode.nodeType;
};

cDOMAdapter.prototype.getProperty	= function(oNode, sName) {
	return oNode[sName];
};

// Standard members
cDOMAdapter.prototype.isSameNode	= function(oNode, oNode2) {
	return oNode == oNode2;
};

cDOMAdapter.prototype.compareDocumentPosition	= function(oNode, oNode2) {
	return oNode.compareDocumentPosition(oNode2);
};

cDOMAdapter.prototype.lookupNamespaceURI	= function(oNode, sPrefix) {
	return oNode.lookupNamespaceURI(sPrefix);
};

// Document object members
cDOMAdapter.prototype.getElementById	= function(oNode, sId) {
	return oNode.getElementById(sId);
};

// Element/Document object members
cDOMAdapter.prototype.getElementsByTagNameNS	= function(oNode, sNameSpaceURI, sLocalName) {
	return oNode.getElementsByTagNameNS(sNameSpaceURI, sLocalName);
};

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cDynamicContext(oStaticContext, vItem, oScope, oDOMAdapter) {
	//
	this.staticContext	= oStaticContext;
	//
	this.item		= vItem;
	//
	this.scope		= oScope || {};
	this.stack		= {};
	//
	this.DOMAdapter	= oDOMAdapter || new cDOMAdapter;
	//
	var oDate	= new cDate,
		nOffset	= oDate.getTimezoneOffset();
	this.dateTime	= new cXSDateTime(oDate.getFullYear(), oDate.getMonth() + 1, oDate.getDate(), oDate.getHours(), oDate.getMinutes(), oDate.getSeconds() + oDate.getMilliseconds() / 1000, -nOffset);
	this.timezone	= new cXSDayTimeDuration(0, cMath.abs(~~(nOffset / 60)), cMath.abs(nOffset % 60), 0, nOffset > 0);
};

cDynamicContext.prototype.item		= null;
cDynamicContext.prototype.position	= 0;
cDynamicContext.prototype.size		= 0;
//
cDynamicContext.prototype.scope		= null;
cDynamicContext.prototype.stack		= null;	// Variables stack
//
cDynamicContext.prototype.dateTime	= null;
cDynamicContext.prototype.timezone	= null;
//
cDynamicContext.prototype.staticContext	= null;

// Stack management
cDynamicContext.prototype.pushVariable	= function(sName, vValue) {
	if (!this.stack.hasOwnProperty(sName))
		this.stack[sName]	= [];
	this.stack[sName].push(this.scope[sName]);
	this.scope[sName] = vValue;
};

cDynamicContext.prototype.popVariable	= function(sName) {
	if (this.stack.hasOwnProperty(sName)) {
		this.scope[sName] = this.stack[sName].pop();
		if (!this.stack[sName].length) {
			delete this.stack[sName];
			if (typeof this.scope[sName] == "undefined")
				delete this.scope[sName];
		}
	}
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cStaticContext() {
	this.dataTypes	= {};
	this.documents	= {};
	this.functions	= {};
	this.collations	= {};
	this.collections= {};
};

cStaticContext.prototype.baseURI	= null;
//
cStaticContext.prototype.dataTypes	= null;
cStaticContext.prototype.documents	= null;
//
cStaticContext.prototype.functions	= null;
cStaticContext.prototype.defaultFunctionNamespace	= null;
//
cStaticContext.prototype.collations	= null;
cStaticContext.prototype.defaultCollationName		= sNS_XPF + "/collation/codepoint";
//
cStaticContext.prototype.collections	= null;
//
cStaticContext.prototype.namespaceResolver	= null;
cStaticContext.prototype.defaultElementNamespace	= null;

//
var rStaticContext_uri	= /^(?:\{([^\}]+)\})?(.+)$/;
//
cStaticContext.prototype.setDataType		= function(sUri, fFunction) {
	var aMatch	= sUri.match(rStaticContext_uri);
	if (aMatch)
		if (aMatch[1] != sNS_XSD)
			this.dataTypes[sUri]	= fFunction;
};

cStaticContext.prototype.getDataType		= function(sUri) {
	var aMatch	= sUri.match(rStaticContext_uri);
	if (aMatch)
		return aMatch[1] == sNS_XSD ? hStaticContext_dataTypes[aMatch[2]] : this.dataTypes[sUri];
};

cStaticContext.prototype.setDocument		= function(sUri, fFunction) {
	this.documents[sUri]	= fFunction;
};

cStaticContext.prototype.getDocument		= function(sUri) {
	return this.documents[sUri];
};

cStaticContext.prototype.setFunction		= function(sUri, fFunction) {
	var aMatch	= sUri.match(rStaticContext_uri);
	if (aMatch)
		if (aMatch[1] != sNS_XPF)
			this.functions[sUri]	= fFunction;
};

cStaticContext.prototype.getFunction		= function(sUri) {
	var aMatch	= sUri.match(rStaticContext_uri);
	if (aMatch)
		return aMatch[1] == sNS_XPF ? hStaticContext_functions[aMatch[2]] : this.functions[sUri];
};

cStaticContext.prototype.setCollation		= function(sUri, fFunction) {
	this.collations[sUri]	= fFunction;
};

cStaticContext.prototype.getCollation		= function(sUri) {
	return this.collations[sUri];
};

cStaticContext.prototype.setCollection	= function(sUri, fFunction) {
	this.collections[sUri]	= fFunction;
};

cStaticContext.prototype.getCollection	= function(sUri) {
	return this.collections[sUri];
};

cStaticContext.prototype.getURIForPrefix	= function(sPrefix) {
	var oResolver	= this.namespaceResolver,
		fResolver	= oResolver && oResolver.lookupNamespaceURI ? oResolver.lookupNamespaceURI : oResolver,
		sNameSpaceURI;
	if (fResolver instanceof cFunction && (sNameSpaceURI = fResolver.call(oResolver, sPrefix)))
		return sNameSpaceURI;
	if (sPrefix == 'fn')
		return sNS_XPF;
	if (sPrefix == 'xs')
		return sNS_XSD;
	if (sPrefix == "xml")
		return sNS_XML;
	if (sPrefix == "xmlns")
		return sNS_XNS;
	//
	throw new cException("XPST0081"

	);
};

// Static members
//Converts non-null JavaScript object to XML Schema object
cStaticContext.js2xs	= function(vItem) {
	// Convert types from JavaScript to XPath 2.0
	if (typeof vItem == "boolean")
		vItem	= new cXSBoolean(vItem);
	else
	if (typeof vItem == "number")
		vItem	=(fIsNaN(vItem) ||!fIsFinite(vItem)) ? new cXSDouble(vItem) : fNumericLiteral_parseValue(cString(vItem));
	else
		vItem	= new cXSString(cString(vItem));
	//
	return vItem;
};

// Converts non-null XML Schema object to JavaScript object
cStaticContext.xs2js	= function(vItem) {
	if (vItem instanceof cXSBoolean)
		vItem	= vItem.valueOf();
	else
	if (fXSAnyAtomicType_isNumeric(vItem))
		vItem	= vItem.valueOf();
	else
		vItem	= vItem.toString();
	//
	return vItem;
};

// System functions with signatures, operators and types
var hStaticContext_functions	= {},
	hStaticContext_signatures	= {},
	hStaticContext_dataTypes	= {},
	hStaticContext_operators	= {};

function fStaticContext_defineSystemFunction(sName, aParameters, fFunction) {
	// Register function
	hStaticContext_functions[sName]	= fFunction;
	// Register signature
	hStaticContext_signatures[sName]	= aParameters;
};

function fStaticContext_defineSystemDataType(sName, fFunction) {
	// Register dataType
	hStaticContext_dataTypes[sName]	= fFunction;
};

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cExpression(sExpression, oStaticContext) {
	var oLexer	= new cLexer(sExpression),
		oExpr	= fExpr_parse(oLexer, oStaticContext);
	//
	if (!oLexer.eof())
		throw new cException("XPST0003"

		);
	//
	if (!oExpr)
		throw new cException("XPST0003"

		);
	this.internalExpression	= oExpr;
};

cExpression.prototype.internalExpression	= null;

// Public methods
cExpression.prototype.evaluate	= function(oContext) {
	return this.internalExpression.evaluate(oContext);
};

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cStringCollator() {

};

cStringCollator.prototype.equals	= function(sValue1, sValue2) {
	throw "Not implemented";
};

cStringCollator.prototype.compare	= function(sValue1, sValue2) {
	throw "Not implemented";
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSConstants(){};

// XML Schema 1.0 Datatypes
cXSConstants.ANYSIMPLETYPE_DT		= 1;
cXSConstants.STRING_DT				= 2;
cXSConstants.BOOLEAN_DT				= 3;
cXSConstants.DECIMAL_DT				= 4;
cXSConstants.FLOAT_DT				= 5;
cXSConstants.DOUBLE_DT				= 6;
cXSConstants.DURATION_DT			= 7;
cXSConstants.DATETIME_DT			= 8;
cXSConstants.TIME_DT				= 9;
cXSConstants.DATE_DT				= 10;
cXSConstants.GYEARMONTH_DT			= 11;
cXSConstants.GYEAR_DT				= 12;
cXSConstants.GMONTHDAY_DT			= 13;
cXSConstants.GDAY_DT				= 14;
cXSConstants.GMONTH_DT				= 15;
cXSConstants.HEXBINARY_DT			= 16;
cXSConstants.BASE64BINARY_DT		= 17;
cXSConstants.ANYURI_DT				= 18;
cXSConstants.QNAME_DT				= 19;
cXSConstants.NOTATION_DT			= 20;
cXSConstants.NORMALIZEDSTRING_DT	= 21;
cXSConstants.TOKEN_DT				= 22;
cXSConstants.LANGUAGE_DT			= 23;
cXSConstants.NMTOKEN_DT				= 24;
cXSConstants.NAME_DT				= 25;
cXSConstants.NCNAME_DT				= 26;
cXSConstants.ID_DT					= 27;
cXSConstants.IDREF_DT				= 28;
cXSConstants.ENTITY_DT				= 29;
cXSConstants.INTEGER_DT				= 30;
cXSConstants.NONPOSITIVEINTEGER_DT	= 31;
cXSConstants.NEGATIVEINTEGER_DT		= 32;
cXSConstants.LONG_DT				= 33;
cXSConstants.INT_DT					= 34;
cXSConstants.SHORT_DT				= 35;
cXSConstants.BYTE_DT				= 36;
cXSConstants.NONNEGATIVEINTEGER_DT	= 37;
cXSConstants.UNSIGNEDLONG_DT		= 38;
cXSConstants.UNSIGNEDINT_DT			= 39;
cXSConstants.UNSIGNEDSHORT_DT		= 40;
cXSConstants.UNSIGNEDBYTE_DT		= 41;
cXSConstants.POSITIVEINTEGER_DT		= 42;
cXSConstants.LISTOFUNION_DT			= 43;
cXSConstants.LIST_DT				= 44;
cXSConstants.UNAVAILABLE_DT			= 45;

// XML Schema 1.1 Datatypes
cXSConstants.DATETIMESTAMP_DT		= 46;
cXSConstants.DAYMONTHDURATION_DT	= 47;
cXSConstants.DAYTIMEDURATION_DT		= 48;
cXSConstants.PRECISIONDECIMAL_DT	= 49;
cXSConstants.ANYATOMICTYPE_DT		= 50;
cXSConstants.ANYTYPE_DT				= 51;

//
cXSConstants.XT_YEARMONTHDURATION_DT=-1;
cXSConstants.XT_UNTYPEDATOMIC_DT	=-2;

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cExpr() {
	this.items	= [];
};

cExpr.prototype.items	= null;

// Static members
function fExpr_parse (oLexer, oStaticContext) {
	var oItem;
	if (oLexer.eof() ||!(oItem = fExprSingle_parse(oLexer, oStaticContext)))
		return;

	// Create expression
	var oExpr	= new cExpr;
	oExpr.items.push(oItem);
	while (oLexer.peek() == ',') {
		oLexer.next();
		if (oLexer.eof() ||!(oItem = fExprSingle_parse(oLexer, oStaticContext)))
			throw new cException("XPST0003"

			);
		oExpr.items.push(oItem);
	}
	return oExpr;
};

// Public members
cExpr.prototype.evaluate	= function(oContext) {
	var oSequence	= [];
	for (var nIndex = 0, nLength = this.items.length; nIndex < nLength; nIndex++)
		oSequence	= hStaticContext_operators["concatenate"].call(oContext, oSequence, this.items[nIndex].evaluate(oContext));
	return oSequence;
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cExprSingle() {

};

// Static members
function fExprSingle_parse (oLexer, oStaticContext) {
	if (!oLexer.eof())
		return fIfExpr_parse(oLexer, oStaticContext)
			|| fForExpr_parse(oLexer, oStaticContext)
			|| fQuantifiedExpr_parse(oLexer, oStaticContext)
			|| fOrExpr_parse(oLexer, oStaticContext);
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cForExpr() {
	this.bindings	= [];
	this.returnExpr	= null;
};

cForExpr.prototype.bindings		= null;
cForExpr.prototype.returnExpr	= null;

// Static members
function fForExpr_parse (oLexer, oStaticContext) {
	if (oLexer.peek() == "for" && oLexer.peek(1).substr(0, 1) == '$') {
		oLexer.next();

		var oForExpr	= new cForExpr,
			oExpr;
		do {
			oForExpr.bindings.push(fSimpleForBinding_parse(oLexer, oStaticContext));
		}
		while (oLexer.peek() == ',' && oLexer.next());

		if (oLexer.peek() != "return")
			throw new cException("XPST0003"

			);

		oLexer.next();
		if (oLexer.eof() ||!(oExpr = fExprSingle_parse(oLexer, oStaticContext)))
			throw new cException("XPST0003"

			);

		oForExpr.returnExpr	= oExpr;
		return oForExpr;
	}
};

// Public members
// for $x in X, $y in Y, $z in Z return $x + $y + $z
// for $x in X return for $y in Y return for $z in Z return $x + $y + $z
cForExpr.prototype.evaluate	= function (oContext) {
	var oSequence	= [];
	(function(oSelf, nBinding) {
		var oBinding	= oSelf.bindings[nBinding++],
			oSequence1	= oBinding.inExpr.evaluate(oContext),
			sUri	= (oBinding.namespaceURI ? '{' + oBinding.namespaceURI + '}' : '') + oBinding.localName;
		for (var nIndex = 0, nLength = oSequence1.length; nIndex < nLength; nIndex++) {
			oContext.pushVariable(sUri, oSequence1[nIndex]);
			if (nBinding < oSelf.bindings.length)
				arguments.callee(oSelf, nBinding);
			else
				oSequence	= oSequence.concat(oSelf.returnExpr.evaluate(oContext));
			oContext.popVariable(sUri);
		}
	})(this, 0);

	return oSequence;
};

//
function cSimpleForBinding(sPrefix, sLocalName, sNameSpaceURI, oInExpr) {
	this.prefix			= sPrefix;
	this.localName		= sLocalName;
	this.namespaceURI	= sNameSpaceURI;
	this.inExpr		= oInExpr;
};

cSimpleForBinding.prototype.prefix			= null;
cSimpleForBinding.prototype.localName		= null;
cSimpleForBinding.prototype.namespaceURI	= null;
cSimpleForBinding.prototype.inExpr		= null;

function fSimpleForBinding_parse (oLexer, oStaticContext) {
	var aMatch	= oLexer.peek().substr(1).match(rNameTest);
	if (!aMatch)
		throw new cException("XPST0003"

		);

	if (aMatch[1] == '*' || aMatch[2] == '*')
		throw new cException("XPST0003"

		);

	oLexer.next();
	if (oLexer.peek() != "in")
		throw new cException("XPST0003"

		);

	oLexer.next();
	var oExpr;
	if (oLexer.eof() ||!(oExpr = fExprSingle_parse(oLexer, oStaticContext)))
		throw new cException("XPST0003"

		);

	return new cSimpleForBinding(aMatch[1] || null, aMatch[2], aMatch[1] ? oStaticContext.getURIForPrefix(aMatch[1]) : null, oExpr);
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cIfExpr(oCondExpr, oThenExpr, oElseExpr) {
	this.condExpr	= oCondExpr;
	this.thenExpr		= oThenExpr;
	this.elseExpr		= oElseExpr;
};

cIfExpr.prototype.condExpr	= null;
cIfExpr.prototype.thenExpr	= null;
cIfExpr.prototype.elseExpr	= null;

// Static members
function fIfExpr_parse (oLexer, oStaticContext) {
	var oCondExpr,
		oThenExpr,
		oElseExpr;
	if (oLexer.peek() == "if" && oLexer.peek(1) == '(') {
		oLexer.next(2);
		//
		if (oLexer.eof() ||!(oCondExpr = fExpr_parse(oLexer, oStaticContext)))
			throw new cException("XPST0003"

			);
		//
		if (oLexer.peek() != ')')
			throw new cException("XPST0003"

			);

		oLexer.next();
		if (oLexer.peek() != "then")
			throw new cException("XPST0003"

			);

		oLexer.next();
		if (oLexer.eof() ||!(oThenExpr = fExprSingle_parse(oLexer, oStaticContext)))
			throw new cException("XPST0003"

			);

		if (oLexer.peek() != "else")
			throw new cException("XPST0003"

			);

		oLexer.next();
		if (oLexer.eof() ||!(oElseExpr = fExprSingle_parse(oLexer, oStaticContext)))
			throw new cException("XPST0003"

			);
		//
		return new cIfExpr(oCondExpr, oThenExpr, oElseExpr);
	}
};

// Public members
cIfExpr.prototype.evaluate	= function (oContext) {
	return this[fFunction_sequence_toEBV(this.condExpr.evaluate(oContext), oContext) ? "thenExpr" : "elseExpr"].evaluate(oContext);
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cQuantifiedExpr(sQuantifier) {
	this.quantifier		= sQuantifier;
	this.bindings		= [];
	this.satisfiesExpr	= null;
};

cQuantifiedExpr.prototype.bindings		= null;
cQuantifiedExpr.prototype.quantifier	= null;
cQuantifiedExpr.prototype.satisfiesExpr	= null;

// Static members
function fQuantifiedExpr_parse (oLexer, oStaticContext) {
	var sQuantifier	= oLexer.peek();
	if ((sQuantifier == "some" || sQuantifier == "every") && oLexer.peek(1).substr(0, 1) == '$') {
		oLexer.next();

		var oQuantifiedExpr	= new cQuantifiedExpr(sQuantifier),
			oExpr;
		do {
			oQuantifiedExpr.bindings.push(fSimpleQuantifiedBinding_parse(oLexer, oStaticContext));
		}
		while (oLexer.peek() == ',' && oLexer.next());

		if (oLexer.peek() != "satisfies")
			throw new cException("XPST0003"

			);

		oLexer.next();
		if (oLexer.eof() ||!(oExpr = fExprSingle_parse(oLexer, oStaticContext)))
			throw new cException("XPST0003"

			);

		oQuantifiedExpr.satisfiesExpr	= oExpr;
		return oQuantifiedExpr;
	}
};

// Public members
cQuantifiedExpr.prototype.evaluate	= function (oContext) {
	// TODO: re-factor
	var bEvery	= this.quantifier == "every",
		bResult	= bEvery ? true : false;
	(function(oSelf, nBinding) {
		var oBinding	= oSelf.bindings[nBinding++],
			oSequence1	= oBinding.inExpr.evaluate(oContext),
			sUri	= (oBinding.namespaceURI ? '{' + oBinding.namespaceURI + '}' : '') + oBinding.localName;
		for (var nIndex = 0, nLength = oSequence1.length; (nIndex < nLength) && (bEvery ? bResult :!bResult); nIndex++) {
			oContext.pushVariable(sUri, oSequence1[nIndex]);
			if (nBinding < oSelf.bindings.length)
				arguments.callee(oSelf, nBinding);
			else
				bResult	= fFunction_sequence_toEBV(oSelf.satisfiesExpr.evaluate(oContext), oContext);
			oContext.popVariable(sUri);
		}
	})(this, 0);

	return [new cXSBoolean(bResult)];
};



//
function cSimpleQuantifiedBinding(sPrefix, sLocalName, sNameSpaceURI, oInExpr) {
	this.prefix			= sPrefix;
	this.localName		= sLocalName;
	this.namespaceURI	= sNameSpaceURI;
	this.inExpr		= oInExpr;
};

cSimpleQuantifiedBinding.prototype.prefix		= null;
cSimpleQuantifiedBinding.prototype.localName	= null;
cSimpleQuantifiedBinding.prototype.namespaceURI	= null;
cSimpleQuantifiedBinding.prototype.inExpr	= null;

function fSimpleQuantifiedBinding_parse (oLexer, oStaticContext) {
	var aMatch	= oLexer.peek().substr(1).match(rNameTest);
	if (!aMatch)
		throw new cException("XPST0003"

		);

	if (aMatch[1] == '*' || aMatch[2] == '*')
		throw new cException("XPST0003"

		);

	oLexer.next();
	if (oLexer.peek() != "in")
		throw new cException("XPST0003"

		);

	oLexer.next();
	var oExpr;
	if (oLexer.eof() ||!(oExpr = fExprSingle_parse(oLexer, oStaticContext)))
		throw new cException("XPST0003"

		);

	return new cSimpleQuantifiedBinding(aMatch[1] || null, aMatch[2], aMatch[1] ? oStaticContext.getURIForPrefix(aMatch[1]) : null, oExpr);
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cComparisonExpr(oLeft, oRight, sOperator) {
	this.left	= oLeft;
	this.right	= oRight;
	this.operator	= sOperator;
};

cComparisonExpr.prototype.left	= null;
cComparisonExpr.prototype.right	= null;
cComparisonExpr.prototype.operator	= null;

// Static members
function fComparisonExpr_parse (oLexer, oStaticContext) {
	var oExpr,
		oRight;
	if (oLexer.eof() ||!(oExpr = fRangeExpr_parse(oLexer, oStaticContext)))
		return;
	if (!(oLexer.peek() in hComparisonExpr_operators))
		return oExpr;

	// Comparison expression
	var sOperator	= oLexer.peek();
	oLexer.next();
	if (oLexer.eof() ||!(oRight = fRangeExpr_parse(oLexer, oStaticContext)))
		throw new cException("XPST0003"

		);
	return new cComparisonExpr(oExpr, oRight, sOperator);
};

// Public members
cComparisonExpr.prototype.evaluate	= function (oContext) {
	var oResult	= hComparisonExpr_operators[this.operator](this, oContext);
	return oResult == null ? [] : [oResult];
};

// General comparison
function fComparisonExpr_GeneralComp(oExpr, oContext) {
	var oLeft	= fFunction_sequence_atomize(oExpr.left.evaluate(oContext), oContext);
	if (!oLeft.length)
		return new cXSBoolean(false);

	var oRight	= fFunction_sequence_atomize(oExpr.right.evaluate(oContext), oContext);
	if (!oRight.length)
		return new cXSBoolean(false);

	var bResult	= false;
	for (var nLeftIndex = 0, nLeftLength = oLeft.length, bLeft, vLeft; (nLeftIndex < nLeftLength) &&!bResult; nLeftIndex++) {
		for (var nRightIndex = 0, nRightLength = oRight.length, bRight, vRight; (nRightIndex < nRightLength) &&!bResult; nRightIndex++) {

			vLeft	= oLeft[nLeftIndex];
			vRight	= oRight[nRightIndex];

			bLeft	= vLeft instanceof cXSUntypedAtomic;
			bRight	= vRight instanceof cXSUntypedAtomic;

			if (bLeft && bRight) {
				// cast xs:untypedAtomic to xs:string
				vLeft	= cXSString.cast(vLeft);
				vRight	= cXSString.cast(vRight);
			}
			else {
				//
				if (bLeft) {
					// Special: durations
					if (vRight instanceof cXSDayTimeDuration)
						vLeft	= cXSDayTimeDuration.cast(vLeft);
					else
					if (vRight instanceof cXSYearMonthDuration)
						vLeft	= cXSYearMonthDuration.cast(vLeft);
					else
					//
					if (vRight.primitiveKind)
						vLeft	= hStaticContext_dataTypes[vRight.primitiveKind].cast(vLeft);
				}
				else
				if (bRight) {
					// Special: durations
					if (vLeft instanceof cXSDayTimeDuration)
						vRight	= cXSDayTimeDuration.cast(vRight);
					else
					if (vLeft instanceof cXSYearMonthDuration)
						vRight	= cXSYearMonthDuration.cast(vRight);
					else
					//
					if (vLeft.primitiveKind)
						vRight	= hStaticContext_dataTypes[vLeft.primitiveKind].cast(vRight);
				}

				// cast xs:anyURI to xs:string
				if (vLeft instanceof cXSAnyURI)
					vLeft	= cXSString.cast(vLeft);
				if (vRight instanceof cXSAnyURI)
					vRight	= cXSString.cast(vRight);
			}

			bResult	= hComparisonExpr_ValueComp_operators[hComparisonExpr_GeneralComp_map[oExpr.operator]](vLeft, vRight, oContext).valueOf();
		}
	}
	return new cXSBoolean(bResult);
};

var hComparisonExpr_GeneralComp_map	= {
	'=':	'eq',
	'!=':	'ne',
	'>':	'gt',
	'<':	'lt',
	'>=':	'ge',
	'<=':	'le'
};

// Value comparison
function fComparisonExpr_ValueComp(oExpr, oContext) {
	var oLeft	= fFunction_sequence_atomize(oExpr.left.evaluate(oContext), oContext);
	if (!oLeft.length)
		return null;
	// Assert cardinality
	fFunctionCall_assertSequenceCardinality(oContext, oLeft, '?'

	);

	var oRight	= fFunction_sequence_atomize(oExpr.right.evaluate(oContext), oContext);
	if (!oRight.length)
		return null;
	// Assert cardinality
	fFunctionCall_assertSequenceCardinality(oContext, oRight, '?'

	);

	var vLeft	= oLeft[0],
		vRight	= oRight[0];

	// cast xs:untypedAtomic to xs:string
	if (vLeft instanceof cXSUntypedAtomic)
		vLeft	= cXSString.cast(vLeft);
	if (vRight instanceof cXSUntypedAtomic)
		vRight	= cXSString.cast(vRight);

	// cast xs:anyURI to xs:string
	if (vLeft instanceof cXSAnyURI)
		vLeft	= cXSString.cast(vLeft);
	if (vRight instanceof cXSAnyURI)
		vRight	= cXSString.cast(vRight);

	//
	return hComparisonExpr_ValueComp_operators[oExpr.operator](vLeft, vRight, oContext);
};

//
var hComparisonExpr_ValueComp_operators	= {};
hComparisonExpr_ValueComp_operators['eq']	= function(oLeft, oRight, oContext) {
	var sOperator	= '';

	if (fXSAnyAtomicType_isNumeric(oLeft)) {
		if (fXSAnyAtomicType_isNumeric(oRight))
			sOperator	= "numeric-equal";
	}
	else
	if (oLeft instanceof cXSBoolean) {
		if (oRight instanceof cXSBoolean)
			sOperator	= "boolean-equal";
	}
	else
	if (oLeft instanceof cXSString) {
		if (oRight instanceof cXSString)
			return hStaticContext_operators["numeric-equal"].call(oContext, hStaticContext_functions["compare"].call(oContext, oLeft, oRight), new cXSInteger(0));
	}
	else
	if (oLeft instanceof cXSDate) {
		if (oRight instanceof cXSDate)
			sOperator	= "date-equal";
	}
	else
	if (oLeft instanceof cXSTime) {
		if (oRight instanceof cXSTime)
			sOperator	= "time-equal";
	}
	else
	if (oLeft instanceof cXSDateTime) {
		if (oRight instanceof cXSDateTime)
			sOperator	= "dateTime-equal";
	}
	else
	if (oLeft instanceof cXSDuration) {
		if (oRight instanceof cXSDuration)
			sOperator	= "duration-equal";
	}
	else
	if (oLeft instanceof cXSGYearMonth) {
		if (oRight instanceof cXSGYearMonth)
			sOperator	= "gYearMonth-equal";
	}
	else
	if (oLeft instanceof cXSGYear) {
		if (oRight instanceof cXSGYear)
			sOperator	= "gYear-equal";
	}
	else
	if (oLeft instanceof cXSGMonthDay) {
		if (oRight instanceof cXSGMonthDay)
			sOperator	= "gMonthDay-equal";
	}
	else
	if (oLeft instanceof cXSGMonth) {
		if (oRight instanceof cXSGMonth)
			sOperator	= "gMonth-equal";
	}
	else
	if (oLeft instanceof cXSGDay) {
		if (oRight instanceof cXSGDay)
			sOperator	= "gDay-equal";
	}
	// skipped: xs:anyURI (covered by xs:string)
	else
	if (oLeft instanceof cXSQName) {
		if (oRight instanceof cXSQName)
			sOperator	= "QName-equal";
	}
	else
	if (oLeft instanceof cXSHexBinary) {
		if (oRight instanceof cXSHexBinary)
			sOperator	= "hexBinary-equal";
	}
	else
	if (oLeft instanceof cXSBase64Binary) {
		if (oRight instanceof cXSBase64Binary)
			sOperator	= "base64Binary-equal";
	}

	// Call operator function
	if (sOperator)
		return hStaticContext_operators[sOperator].call(oContext, oLeft, oRight);

	// skipped: xs:NOTATION
	throw new cException("XPTY0004"

	);	// Cannot compare {type1} to {type2}
};
hComparisonExpr_ValueComp_operators['ne']	= function(oLeft, oRight, oContext) {
	return new cXSBoolean(!hComparisonExpr_ValueComp_operators['eq'](oLeft, oRight, oContext).valueOf());
};
hComparisonExpr_ValueComp_operators['gt']	= function(oLeft, oRight, oContext) {
	var sOperator	= '';

	if (fXSAnyAtomicType_isNumeric(oLeft)) {
		if (fXSAnyAtomicType_isNumeric(oRight))
			sOperator	= "numeric-greater-than";
	}
	else
	if (oLeft instanceof cXSBoolean) {
		if (oRight instanceof cXSBoolean)
			sOperator	= "boolean-greater-than";
	}
	else
	if (oLeft instanceof cXSString) {
		if (oRight instanceof cXSString)
			return hStaticContext_operators["numeric-greater-than"].call(oContext, hStaticContext_functions["compare"].call(oContext, oLeft, oRight), new cXSInteger(0));
	}
	else
	if (oLeft instanceof cXSDate) {
		if (oRight instanceof cXSDate)
			sOperator	= "date-greater-than";
	}
	else
	if (oLeft instanceof cXSTime) {
		if (oRight instanceof cXSTime)
			sOperator	= "time-greater-than";
	}
	else
	if (oLeft instanceof cXSDateTime) {
		if (oRight instanceof cXSDateTime)
			sOperator	= "dateTime-greater-than";
	}
	else
	if (oLeft instanceof cXSYearMonthDuration) {
		if (oRight instanceof cXSYearMonthDuration)
			sOperator	= "yearMonthDuration-greater-than";
	}
	else
	if (oLeft instanceof cXSDayTimeDuration) {
		if (oRight instanceof cXSDayTimeDuration)
			sOperator	= "dayTimeDuration-greater-than";
	}

	// Call operator function
	if (sOperator)
		return hStaticContext_operators[sOperator].call(oContext, oLeft, oRight);

	// skipped: xs:anyURI (covered by xs:string)
	throw new cException("XPTY0004"

	);	// Cannot compare {type1} to {type2}
};
hComparisonExpr_ValueComp_operators['lt']	= function(oLeft, oRight, oContext) {
	var sOperator	= '';

	if (fXSAnyAtomicType_isNumeric(oLeft)) {
		if (fXSAnyAtomicType_isNumeric(oRight))
			sOperator	= "numeric-less-than";
	}
	else
	if (oLeft instanceof cXSBoolean) {
		if (oRight instanceof cXSBoolean)
			sOperator	= "boolean-less-than";
	}
	else
	if (oLeft instanceof cXSString) {
		if (oRight instanceof cXSString)
			return hStaticContext_operators["numeric-less-than"].call(oContext, hStaticContext_functions["compare"].call(oContext, oLeft, oRight), new cXSInteger(0));
	}
	else
	if (oLeft instanceof cXSDate) {
		if (oRight instanceof cXSDate)
			sOperator	= "date-less-than";
	}
	else
	if (oLeft instanceof cXSTime) {
		if (oRight instanceof cXSTime)
			sOperator	= "time-less-than";
	}
	else
	if (oLeft instanceof cXSDateTime) {
		if (oRight instanceof cXSDateTime)
			sOperator	= "dateTime-less-than";
	}
	else
	if (oLeft instanceof cXSYearMonthDuration) {
		if (oRight instanceof cXSYearMonthDuration)
			sOperator	= "yearMonthDuration-less-than";
	}
	else
	if (oLeft instanceof cXSDayTimeDuration) {
		if (oRight instanceof cXSDayTimeDuration)
			sOperator	= "dayTimeDuration-less-than";
	}

	// Call operator function
	if (sOperator)
		return hStaticContext_operators[sOperator].call(oContext, oLeft, oRight);

	// skipped: xs:anyURI (covered by xs:string)
	throw new cException("XPTY0004"

	);	// Cannot compare {type1} to {type2}
};
hComparisonExpr_ValueComp_operators['ge']	= function(oLeft, oRight, oContext) {
	var sOperator	= '';

	if (fXSAnyAtomicType_isNumeric(oLeft)) {
		if (fXSAnyAtomicType_isNumeric(oRight))
			sOperator	= "numeric-less-than";
	}
	else
	if (oLeft instanceof cXSBoolean) {
		if (oRight instanceof cXSBoolean)
			sOperator	= "boolean-less-than";
	}
	else
	if (oLeft instanceof cXSString) {
		if (oRight instanceof cXSString)
			return hStaticContext_operators["numeric-greater-than"].call(oContext, hStaticContext_functions["compare"].call(oContext, oLeft, oRight), new cXSInteger(-1));
	}
	else
	if (oLeft instanceof cXSDate) {
		if (oRight instanceof cXSDate)
			sOperator	= "date-less-than";
	}
	else
	if (oLeft instanceof cXSTime) {
		if (oRight instanceof cXSTime)
			sOperator	= "time-less-than";
	}
	else
	if (oLeft instanceof cXSDateTime) {
		if (oRight instanceof cXSDateTime)
			sOperator	= "dateTime-less-than";
	}
	else
	if (oLeft instanceof cXSYearMonthDuration) {
		if (oRight instanceof cXSYearMonthDuration)
			sOperator	= "yearMonthDuration-less-than";
	}
	else
	if (oLeft instanceof cXSDayTimeDuration) {
		if (oRight instanceof cXSDayTimeDuration)
			sOperator	= "dayTimeDuration-less-than";
	}

	// Call operator function
	if (sOperator)
		return new cXSBoolean(!hStaticContext_operators[sOperator].call(oContext, oLeft, oRight).valueOf());

	// skipped: xs:anyURI (covered by xs:string)
	throw new cException("XPTY0004"

	);	// Cannot compare {type1} to {type2}
};
hComparisonExpr_ValueComp_operators['le']	= function(oLeft, oRight, oContext) {
	var sOperator	= '';

	if (fXSAnyAtomicType_isNumeric(oLeft)) {
		if (fXSAnyAtomicType_isNumeric(oRight))
			sOperator	= "numeric-greater-than";
	}
	else
	if (oLeft instanceof cXSBoolean) {
		if (oRight instanceof cXSBoolean)
			sOperator	= "boolean-greater-than";
	}
	else
	if (oLeft instanceof cXSString) {
		if (oRight instanceof cXSString)
			return hStaticContext_operators["numeric-less-than"].call(oContext, hStaticContext_functions["compare"].call(oContext, oLeft, oRight), new cXSInteger(1));
	}
	else
	if (oLeft instanceof cXSDate) {
		if (oRight instanceof cXSDate)
			sOperator	= "date-greater-than";
	}
	else
	if (oLeft instanceof cXSTime) {
		if (oRight instanceof cXSTime)
			sOperator	= "time-greater-than";
	}
	else
	if (oLeft instanceof cXSDateTime) {
		if (oRight instanceof cXSDateTime)
			sOperator	= "dateTime-greater-than";
	}
	else
	if (oLeft instanceof cXSYearMonthDuration) {
		if (oRight instanceof cXSYearMonthDuration)
			sOperator	= "yearMonthDuration-greater-than";
	}
	else
	if (oLeft instanceof cXSDayTimeDuration) {
		if (oRight instanceof cXSDayTimeDuration)
			sOperator	= "dayTimeDuration-greater-than";
	}

	// Call operator function
	if (sOperator)
		return new cXSBoolean(!hStaticContext_operators[sOperator].call(oContext, oLeft, oRight).valueOf());

	// skipped: xs:anyURI (covered by xs:string)
	throw new cException("XPTY0004"

	);	// Cannot compare {type1} to {type2}
};

// Node comparison
function fComparisonExpr_NodeComp(oExpr, oContext) {
	var oLeft	= oExpr.left.evaluate(oContext);
	if (!oLeft.length)
		return null;
	// Assert cardinality
	fFunctionCall_assertSequenceCardinality(oContext, oLeft, '?'

	);
	// Assert item type
	fFunctionCall_assertSequenceItemType(oContext, oLeft, cXTNode

	);

	var oRight	= oExpr.right.evaluate(oContext);
	if (!oRight.length)
		return null;
	// Assert cardinality
	fFunctionCall_assertSequenceCardinality(oContext, oRight, '?'

	);
	// Assert item type
	fFunctionCall_assertSequenceItemType(oContext, oRight, cXTNode

	);

	return hComparisonExpr_NodeComp_operators[oExpr.operator](oLeft[0], oRight[0], oContext);
};

var hComparisonExpr_NodeComp_operators	= {};
hComparisonExpr_NodeComp_operators['is']	= function(oLeft, oRight, oContext) {
	return hStaticContext_operators["is-same-node"].call(oContext, oLeft, oRight);
};
hComparisonExpr_NodeComp_operators['>>']	= function(oLeft, oRight, oContext) {
	return hStaticContext_operators["node-after"].call(oContext, oLeft, oRight);
};
hComparisonExpr_NodeComp_operators['<<']	= function(oLeft, oRight, oContext) {
	return hStaticContext_operators["node-before"].call(oContext, oLeft, oRight);
};

// Operators
var hComparisonExpr_operators	= {
	// GeneralComp
	'=':	fComparisonExpr_GeneralComp,
	'!=':	fComparisonExpr_GeneralComp,
	'<':	fComparisonExpr_GeneralComp,
	'<=':	fComparisonExpr_GeneralComp,
	'>':	fComparisonExpr_GeneralComp,
	'>=':	fComparisonExpr_GeneralComp,
	// ValueComp
	'eq':	fComparisonExpr_ValueComp,
	'ne':	fComparisonExpr_ValueComp,
	'lt':	fComparisonExpr_ValueComp,
	'le':	fComparisonExpr_ValueComp,
	'gt':	fComparisonExpr_ValueComp,
	'ge':	fComparisonExpr_ValueComp,
	// NodeComp
	'is':	fComparisonExpr_NodeComp,
	'>>':	fComparisonExpr_NodeComp,
	'<<':	fComparisonExpr_NodeComp
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cAdditiveExpr(oExpr) {
	this.left	= oExpr;
	this.items	= [];
};

cAdditiveExpr.prototype.left	= null;
cAdditiveExpr.prototype.items	= null;

//
var hAdditiveExpr_operators	= {};
hAdditiveExpr_operators['+']	= function(oLeft, oRight, oContext) {
	var sOperator	= '',
		bReverse	= false;

	if (fXSAnyAtomicType_isNumeric(oLeft)) {
		if (fXSAnyAtomicType_isNumeric(oRight))
			sOperator	= "numeric-add";
	}
	else
	if (oLeft instanceof cXSDate) {
		if (oRight instanceof cXSYearMonthDuration)
			sOperator	= "add-yearMonthDuration-to-date";
		else
		if (oRight instanceof cXSDayTimeDuration)
			sOperator	= "add-dayTimeDuration-to-date";
	}
	else
	if (oLeft instanceof cXSYearMonthDuration) {
		if (oRight instanceof cXSDate) {
			sOperator	= "add-yearMonthDuration-to-date";
			bReverse	= true;
		}
		else
		if (oRight instanceof cXSDateTime) {
			sOperator	= "add-yearMonthDuration-to-dateTime";
			bReverse	= true;
		}
		else
		if (oRight instanceof cXSYearMonthDuration)
			sOperator	= "add-yearMonthDurations";
	}
	else
	if (oLeft instanceof cXSDayTimeDuration) {
		if (oRight instanceof cXSDate) {
			sOperator	= "add-dayTimeDuration-to-date";
			bReverse	= true;
		}
		else
		if (oRight instanceof cXSTime) {
			sOperator	= "add-dayTimeDuration-to-time";
			bReverse	= true;
		}
		else
		if (oRight instanceof cXSDateTime) {
			sOperator	= "add-dayTimeDuration-to-dateTime";
			bReverse	= true;
		}
		else
		if (oRight instanceof cXSDayTimeDuration)
			sOperator	= "add-dayTimeDurations";
	}
	else
	if (oLeft instanceof cXSTime) {
		if (oRight instanceof cXSDayTimeDuration)
			sOperator	= "add-dayTimeDuration-to-time";
	}
	else
	if (oLeft instanceof cXSDateTime) {
		if (oRight instanceof cXSYearMonthDuration)
			sOperator	= "add-yearMonthDuration-to-dateTime";
		else
		if (oRight instanceof cXSDayTimeDuration)
			sOperator	= "add-dayTimeDuration-to-dateTime";
	}

	// Call operator function
	if (sOperator)
		return hStaticContext_operators[sOperator].call(oContext, bReverse ? oRight : oLeft, bReverse ? oLeft : oRight);

	//
	throw new cException("XPTY0004"

	);	// Arithmetic operator is not defined for arguments of types ({type1}, {type2})
};
hAdditiveExpr_operators['-']	= function (oLeft, oRight, oContext) {
	var sOperator	= '';

	if (fXSAnyAtomicType_isNumeric(oLeft)) {
		if (fXSAnyAtomicType_isNumeric(oRight))
			sOperator	= "numeric-subtract";
	}
	else
	if (oLeft instanceof cXSDate) {
		if (oRight instanceof cXSDate)
			sOperator	= "subtract-dates";
		else
		if (oRight instanceof cXSYearMonthDuration)
			sOperator	= "subtract-yearMonthDuration-from-date";
		else
		if (oRight instanceof cXSDayTimeDuration)
			sOperator	= "subtract-dayTimeDuration-from-date";
	}
	else
	if (oLeft instanceof cXSTime) {
		if (oRight instanceof cXSTime)
			sOperator	= "subtract-times";
		else
		if (oRight instanceof cXSDayTimeDuration)
			sOperator	= "subtract-dayTimeDuration-from-time";
	}
	else
	if (oLeft instanceof cXSDateTime) {
		if (oRight instanceof cXSDateTime)
			sOperator	= "subtract-dateTimes";
		else
		if (oRight instanceof cXSYearMonthDuration)
			sOperator	= "subtract-yearMonthDuration-from-dateTime";
		else
		if (oRight instanceof cXSDayTimeDuration)
			sOperator	= "subtract-dayTimeDuration-from-dateTime";
	}
	else
	if (oLeft instanceof cXSYearMonthDuration) {
		if (oRight instanceof cXSYearMonthDuration)
			sOperator	= "subtract-yearMonthDurations";
	}
	else
	if (oLeft instanceof cXSDayTimeDuration) {
		if (oRight instanceof cXSDayTimeDuration)
			sOperator	= "subtract-dayTimeDurations";
	}

	// Call operator function
	if (sOperator)
		return hStaticContext_operators[sOperator].call(oContext, oLeft, oRight);

	//
	throw new cException("XPTY0004"

	);	// Arithmetic operator is not defined for arguments of types ({type1}, {type2})
};

// Static members
function fAdditiveExpr_parse (oLexer, oStaticContext) {
	var oExpr;
	if (oLexer.eof() ||!(oExpr = fMultiplicativeExpr_parse(oLexer, oStaticContext)))
		return;
	if (!(oLexer.peek() in hAdditiveExpr_operators))
		return oExpr;

	// Additive expression
	var oAdditiveExpr	= new cAdditiveExpr(oExpr),
		sOperator;
	while ((sOperator = oLexer.peek()) in hAdditiveExpr_operators) {
		oLexer.next();
		if (oLexer.eof() ||!(oExpr = fMultiplicativeExpr_parse(oLexer, oStaticContext)))
			throw new cException("XPST0003"

			);
		oAdditiveExpr.items.push([sOperator, oExpr]);
	}
	return oAdditiveExpr;
};

// Public members
cAdditiveExpr.prototype.evaluate	= function (oContext) {
	var oLeft	= fFunction_sequence_atomize(this.left.evaluate(oContext), oContext);

	if (!oLeft.length)
		return [];
	// Assert cardinality
	fFunctionCall_assertSequenceCardinality(oContext, oLeft, '?'

	);

	var vLeft	= oLeft[0];
	if (vLeft instanceof cXSUntypedAtomic)
		vLeft	= cXSDouble.cast(vLeft);	// cast to xs:double

	for (var nIndex = 0, nLength = this.items.length, oRight, vRight; nIndex < nLength; nIndex++) {
		oRight	= fFunction_sequence_atomize(this.items[nIndex][1].evaluate(oContext), oContext);

		if (!oRight.length)
			return [];
		// Assert cardinality
		fFunctionCall_assertSequenceCardinality(oContext, oRight, '?'

		);

		vRight	= oRight[0];
		if (vRight instanceof cXSUntypedAtomic)
			vRight	= cXSDouble.cast(vRight);	// cast to xs:double

		vLeft	= hAdditiveExpr_operators[this.items[nIndex][0]](vLeft, vRight, oContext);
	}
	return [vLeft];
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cMultiplicativeExpr(oExpr) {
	this.left	= oExpr;
	this.items	= [];
};

cMultiplicativeExpr.prototype.left	= null;
cMultiplicativeExpr.prototype.items	= null;

//
var hMultiplicativeExpr_operators	= {};
hMultiplicativeExpr_operators['*']		= function (oLeft, oRight, oContext) {
	var sOperator	= '',
		bReverse	= false;

	if (fXSAnyAtomicType_isNumeric(oLeft)) {
		if (fXSAnyAtomicType_isNumeric(oRight))
			sOperator	= "numeric-multiply";
		else
		if (oRight instanceof cXSYearMonthDuration) {
			sOperator	= "multiply-yearMonthDuration";
			bReverse	= true;
		}
		else
		if (oRight instanceof cXSDayTimeDuration) {
			sOperator	= "multiply-dayTimeDuration";
			bReverse	= true;
		}
	}
	else {
		if (oLeft instanceof cXSYearMonthDuration) {
			if (fXSAnyAtomicType_isNumeric(oRight))
				sOperator	= "multiply-yearMonthDuration";
		}
		else
		if (oLeft instanceof cXSDayTimeDuration) {
			if (fXSAnyAtomicType_isNumeric(oRight))
				sOperator	= "multiply-dayTimeDuration";
		}
	}

	// Call operator function
	if (sOperator)
		return hStaticContext_operators[sOperator].call(oContext, bReverse ? oRight : oLeft, bReverse ? oLeft : oRight);

	//
	throw new cException("XPTY0004"

	);	// Arithmetic operator is not defined for arguments of types ({type1}, {type2})
};
hMultiplicativeExpr_operators['div']	= function (oLeft, oRight, oContext) {
	var sOperator	= '';

	if (fXSAnyAtomicType_isNumeric(oLeft)) {
		if (fXSAnyAtomicType_isNumeric(oRight))
			sOperator	= "numeric-divide";
	}
	else
	if (oLeft instanceof cXSYearMonthDuration) {
		if (fXSAnyAtomicType_isNumeric(oRight))
			sOperator	= "divide-yearMonthDuration";
		else
		if (oRight instanceof cXSYearMonthDuration)
			sOperator	= "divide-yearMonthDuration-by-yearMonthDuration";
	}
	else
	if (oLeft instanceof cXSDayTimeDuration) {
		if (fXSAnyAtomicType_isNumeric(oRight))
			sOperator	= "divide-dayTimeDuration";
		else
		if (oRight instanceof cXSDayTimeDuration)
			sOperator	= "divide-dayTimeDuration-by-dayTimeDuration";
	}
	// Call operator function
	if (sOperator)
		return hStaticContext_operators[sOperator].call(oContext, oLeft, oRight);

	//
	throw new cException("XPTY0004"

	);	// Arithmetic operator is not defined for arguments of types ({type1}, {type2})
};
hMultiplicativeExpr_operators['idiv']	= function (oLeft, oRight, oContext) {
	if (fXSAnyAtomicType_isNumeric(oLeft) && fXSAnyAtomicType_isNumeric(oRight))
		return hStaticContext_operators["numeric-integer-divide"].call(oContext, oLeft, oRight);
	//
	throw new cException("XPTY0004"

	);	// Arithmetic operator is not defined for arguments of types ({type1}, {type2})
};
hMultiplicativeExpr_operators['mod']	= function (oLeft, oRight, oContext) {
	if (fXSAnyAtomicType_isNumeric(oLeft) && fXSAnyAtomicType_isNumeric(oRight))
		return hStaticContext_operators["numeric-mod"].call(oContext, oLeft, oRight);
	//
	throw new cException("XPTY0004"

	);	// Arithmetic operator is not defined for arguments of types ({type1}, {type2})
};

// Static members
function fMultiplicativeExpr_parse (oLexer, oStaticContext) {
	var oExpr;
	if (oLexer.eof() ||!(oExpr = fUnionExpr_parse(oLexer, oStaticContext)))
		return;
	if (!(oLexer.peek() in hMultiplicativeExpr_operators))
		return oExpr;

	// Additive expression
	var oMultiplicativeExpr	= new cMultiplicativeExpr(oExpr),
		sOperator;
	while ((sOperator = oLexer.peek()) in hMultiplicativeExpr_operators) {
		oLexer.next();
		if (oLexer.eof() ||!(oExpr = fUnionExpr_parse(oLexer, oStaticContext)))
			throw new cException("XPST0003"

			);
		oMultiplicativeExpr.items.push([sOperator, oExpr]);
	}
	return oMultiplicativeExpr;
};

// Public members
cMultiplicativeExpr.prototype.evaluate	= function (oContext) {
	var oLeft	= fFunction_sequence_atomize(this.left.evaluate(oContext), oContext);

	//
	if (!oLeft.length)
		return [];
	// Assert cardinality
	fFunctionCall_assertSequenceCardinality(oContext, oLeft, '?'

	);

	var vLeft	= oLeft[0];
	if (vLeft instanceof cXSUntypedAtomic)
		vLeft	= cXSDouble.cast(vLeft);	// cast to xs:double

	for (var nIndex = 0, nLength = this.items.length, oRight, vRight; nIndex < nLength; nIndex++) {
		oRight	= fFunction_sequence_atomize(this.items[nIndex][1].evaluate(oContext), oContext);

		if (!oRight.length)
			return [];
		// Assert cardinality
		fFunctionCall_assertSequenceCardinality(oContext, oRight, '?'

		);

		vRight	= oRight[0];
		if (vRight instanceof cXSUntypedAtomic)
			vRight	= cXSDouble.cast(vRight);	// cast to xs:double

		vLeft	= hMultiplicativeExpr_operators[this.items[nIndex][0]](vLeft, vRight, oContext);
	}
	return [vLeft];
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cUnaryExpr(sOperator, oExpr) {
	this.operator	= sOperator;
	this.expression	= oExpr;
};

cUnaryExpr.prototype.operator	= null;
cUnaryExpr.prototype.expression	= null;

//
var hUnaryExpr_operators	= {};
hUnaryExpr_operators['-']	= function(oRight, oContext) {
	if (fXSAnyAtomicType_isNumeric(oRight))
		return hStaticContext_operators["numeric-unary-minus"].call(oContext, oRight);
	//
	throw new cException("XPTY0004"

	);	// Arithmetic operator is not defined for arguments of types ({type1}, {type2})
};
hUnaryExpr_operators['+']	= function(oRight, oContext) {
	if (fXSAnyAtomicType_isNumeric(oRight))
		return hStaticContext_operators["numeric-unary-plus"].call(oContext, oRight);
	//
	throw new cException("XPTY0004"

	);	// Arithmetic operator is not defined for arguments of types ({type1}, {type2})
};

// Static members
// UnaryExpr	:= ("-" | "+")* ValueExpr
function fUnaryExpr_parse (oLexer, oStaticContext) {
	if (oLexer.eof())
		return;
	if (!(oLexer.peek() in hUnaryExpr_operators))
		return fValueExpr_parse(oLexer, oStaticContext);

	// Unary expression
	var sOperator	= '+',
		oExpr;
	while (oLexer.peek() in hUnaryExpr_operators) {
		if (oLexer.peek() == '-')
			sOperator	= sOperator == '-' ? '+' : '-';
		oLexer.next();
	}
	if (oLexer.eof() ||!(oExpr = fValueExpr_parse(oLexer, oStaticContext)))
		throw new cException("XPST0003"

		);
	return new cUnaryExpr(sOperator, oExpr);
};

cUnaryExpr.prototype.evaluate	= function (oContext) {
	var oRight	= fFunction_sequence_atomize(this.expression.evaluate(oContext), oContext);

	//
	if (!oRight.length)
		return [];
	// Assert cardinality
	fFunctionCall_assertSequenceCardinality(oContext, oRight, '?'

	);

	var vRight	= oRight[0];
	if (vRight instanceof cXSUntypedAtomic)
		vRight	= cXSDouble.cast(vRight);	// cast to xs:double

	return [hUnaryExpr_operators[this.operator](vRight, oContext)];
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cValueExpr() {

};

// Static members
function fValueExpr_parse (oLexer, oStaticContext) {
	return fPathExpr_parse(oLexer, oStaticContext);
};

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cOrExpr(oExpr) {
	this.left	= oExpr;
	this.items	= [];
};

cOrExpr.prototype.left	= null;
cOrExpr.prototype.items	= null;

// Static members
function fOrExpr_parse (oLexer, oStaticContext) {
	var oExpr;
	if (oLexer.eof() ||!(oExpr = fAndExpr_parse(oLexer, oStaticContext)))
		return;
	if (oLexer.peek() != "or")
		return oExpr;

	// Or expression
	var oOrExpr	= new cOrExpr(oExpr);
	while (oLexer.peek() == "or") {
		oLexer.next();
		if (oLexer.eof() ||!(oExpr = fAndExpr_parse(oLexer, oStaticContext)))
			throw new cException("XPST0003"

			);
		oOrExpr.items.push(oExpr);
	}
	return oOrExpr;
};

// Public members
cOrExpr.prototype.evaluate	= function (oContext) {
	var bValue	= fFunction_sequence_toEBV(this.left.evaluate(oContext), oContext);
	for (var nIndex = 0, nLength = this.items.length; (nIndex < nLength) && !bValue; nIndex++)
		bValue	= fFunction_sequence_toEBV(this.items[nIndex].evaluate(oContext), oContext);
	return [new cXSBoolean(bValue)];
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cAndExpr(oExpr) {
	this.left	= oExpr;
	this.items	= [];
};

cAndExpr.prototype.left		= null;
cAndExpr.prototype.items	= null;

// Static members
function fAndExpr_parse (oLexer, oStaticContext) {
	var oExpr;
	if (oLexer.eof() ||!(oExpr = fComparisonExpr_parse(oLexer, oStaticContext)))
		return;
	if (oLexer.peek() != "and")
		return oExpr;

	// And expression
	var oAndExpr	= new cAndExpr(oExpr);
	while (oLexer.peek() == "and") {
		oLexer.next();
		if (oLexer.eof() ||!(oExpr = fComparisonExpr_parse(oLexer, oStaticContext)))
			throw new cException("XPST0003"

			);
		oAndExpr.items.push(oExpr);
	}
	return oAndExpr;
};

// Public members
cAndExpr.prototype.evaluate	= function (oContext) {
	var bValue	= fFunction_sequence_toEBV(this.left.evaluate(oContext), oContext);
	for (var nIndex = 0, nLength = this.items.length; (nIndex < nLength) && bValue; nIndex++)
		bValue	= fFunction_sequence_toEBV(this.items[nIndex].evaluate(oContext), oContext);
	return [new cXSBoolean(bValue)];
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cStepExpr() {

};

cStepExpr.prototype.predicates	= null;

// Static members
function fStepExpr_parse (oLexer, oStaticContext) {
	if (!oLexer.eof())
		return fFilterExpr_parse(oLexer, oStaticContext)
			|| fAxisStep_parse(oLexer, oStaticContext);
};

function fStepExpr_parsePredicates (oLexer, oStaticContext, oStep) {
	var oExpr;
	// Parse predicates
	while (oLexer.peek() == '[') {
		oLexer.next();

		if (oLexer.eof() ||!(oExpr = fExpr_parse(oLexer, oStaticContext)))
			throw new cException("XPST0003"

			);

		oStep.predicates.push(oExpr);

		if (oLexer.peek() != ']')
			throw new cException("XPST0003"

			);

		oLexer.next();
	}
};

// Public members
cStepExpr.prototype.applyPredicates	= function(oSequence, oContext) {
	var vContextItem	= oContext.item,
		nContextPosition= oContext.position,
		nContextSize	= oContext.size;
	//
	for (var nPredicateIndex = 0, oSequence1, nPredicateLength = this.predicates.length; nPredicateIndex < nPredicateLength; nPredicateIndex++) {
		oSequence1	= oSequence;
		oSequence	= [];
		for (var nIndex = 0, oSequence2, nLength = oSequence1.length; nIndex < nLength; nIndex++) {
			// Set new context
			oContext.item		= oSequence1[nIndex];
			oContext.position	= nIndex + 1;
			oContext.size		= nLength;
			//
			oSequence2	= this.predicates[nPredicateIndex].evaluate(oContext);
			//
			if (oSequence2.length == 1 && fXSAnyAtomicType_isNumeric(oSequence2[0])) {
				if (oSequence2[0].valueOf() == nIndex + 1)
					oSequence.push(oSequence1[nIndex]);
			}
			else
			if (fFunction_sequence_toEBV(oSequence2, oContext))
				oSequence.push(oSequence1[nIndex]);
		}
	}
	// Restore context
	oContext.item		= vContextItem;
	oContext.position	= nContextPosition;
	oContext.size		= nContextSize;
	//
	return oSequence;
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cAxisStep(sAxis, oTest) {
	this.axis	= sAxis;
	this.test	= oTest;
	this.predicates	= [];
};

cAxisStep.prototype	= new cStepExpr;

cAxisStep.prototype.axis		= null;
cAxisStep.prototype.test		= null;

//
var hAxisStep_axises	= {};
// Forward axis
hAxisStep_axises["attribute"]			= {};
hAxisStep_axises["child"]				= {};
hAxisStep_axises["descendant"]			= {};
hAxisStep_axises["descendant-or-self"]	= {};
hAxisStep_axises["following"]			= {};
hAxisStep_axises["following-sibling"]	= {};
hAxisStep_axises["self"]				= {};
// hAxisStep_axises["namespace"]			= {};	// deprecated in 2.0
// Reverse axis
hAxisStep_axises["ancestor"]			= {};
hAxisStep_axises["ancestor-or-self"]	= {};
hAxisStep_axises["parent"]				= {};
hAxisStep_axises["preceding"]			= {};
hAxisStep_axises["preceding-sibling"]	= {};

// Static members
function fAxisStep_parse (oLexer, oStaticContext) {
	var sAxis	= oLexer.peek(),
		oExpr,
		oStep;
	if (oLexer.peek(1) == '::') {
		if (!(sAxis in hAxisStep_axises))
			throw new cException("XPST0003"

			);

		oLexer.next(2);
		if (oLexer.eof() ||!(oExpr = fNodeTest_parse(oLexer, oStaticContext)))
			throw new cException("XPST0003"

			);
		//
		oStep	= new cAxisStep(sAxis, oExpr);
	}
	else
	if (sAxis == '..') {
		oLexer.next();
		oStep	= new cAxisStep("parent", new cKindTest("node"));
	}
	else
	if (sAxis == '@') {
		oLexer.next();
		if (oLexer.eof() ||!(oExpr = fNodeTest_parse(oLexer, oStaticContext)))
			throw new cException("XPST0003"

			);
		//
		oStep	= new cAxisStep("attribute", oExpr);
	}
	else {
		if (oLexer.eof() ||!(oExpr = fNodeTest_parse(oLexer, oStaticContext)))
			return;
		oStep	= new cAxisStep(oExpr instanceof cKindTest && oExpr.name == "attribute" ? "attribute" : "child", oExpr);
	}
	//
	fStepExpr_parsePredicates(oLexer, oStaticContext, oStep);

	return oStep;
};

// Public members
cAxisStep.prototype.evaluate	= function (oContext) {
	var oItem	= oContext.item;

	if (!oContext.DOMAdapter.isNode(oItem))
		throw new cException("XPTY0020");

	var oSequence	= [],
		fGetProperty= oContext.DOMAdapter.getProperty,
		nType		= fGetProperty(oItem, "nodeType");

	switch (this.axis) {
		// Forward axis
		case "attribute":
			if (nType == 1)
				for (var aAttributes = fGetProperty(oItem, "attributes"), nIndex = 0, nLength = aAttributes.length; nIndex < nLength; nIndex++)
					oSequence.push(aAttributes[nIndex]);
			break;

		case "child":
			for (var oNode = fGetProperty(oItem, "firstChild"); oNode; oNode = fGetProperty(oNode, "nextSibling"))
				oSequence.push(oNode);
			break;

		case "descendant-or-self":
			oSequence.push(oItem);
			// No break left intentionally
		case "descendant":
			fAxisStep_getChildrenForward(fGetProperty(oItem, "firstChild"), oSequence, fGetProperty);
			break;

		case "following":
			// TODO: Attribute node context
			for (var oParent = oItem, oSibling; oParent; oParent = fGetProperty(oParent, "parentNode"))
				if (oSibling = fGetProperty(oParent, "nextSibling"))
					fAxisStep_getChildrenForward(oSibling, oSequence, fGetProperty);
			break;

		case "following-sibling":
			for (var oNode = oItem; oNode = fGetProperty(oNode, "nextSibling");)
				oSequence.push(oNode);
			break;

		case "self":
			oSequence.push(oItem);
			break;

		// Reverse axis
		case "ancestor-or-self":
			oSequence.push(oItem);
			// No break left intentionally
		case "ancestor":
			for (var oNode = nType == 2 ? fGetProperty(oItem, "ownerElement") : oItem; oNode = fGetProperty(oNode, "parentNode");)
				oSequence.push(oNode);
			break;

		case "parent":
			var oParent	= nType == 2 ? fGetProperty(oItem, "ownerElement") : fGetProperty(oItem, "parentNode");
			if (oParent)
				oSequence.push(oParent);
			break;

		case "preceding":
			// TODO: Attribute node context
			for (var oParent = oItem, oSibling; oParent; oParent = fGetProperty(oParent, "parentNode"))
				if (oSibling = fGetProperty(oParent, "previousSibling"))
					fAxisStep_getChildrenBackward(oSibling, oSequence, fGetProperty);
			break;

		case "preceding-sibling":
			for (var oNode = oItem; oNode = fGetProperty(oNode, "previousSibling");)
				oSequence.push(oNode);
			break;
	}

	// Apply test
	if (oSequence.length && !(this.test instanceof cKindTest && this.test.name == "node")) {
		var oSequence1	= oSequence;
		oSequence	= [];
		for (var nIndex = 0, nLength = oSequence1.length; nIndex < nLength; nIndex++) {
			if (this.test.test(oSequence1[nIndex], oContext))
				oSequence.push(oSequence1[nIndex]);
		}
	}

	// Apply predicates
	if (oSequence.length && this.predicates.length)
		oSequence	= this.applyPredicates(oSequence, oContext);

	// Reverse results if reverse axis
	switch (this.axis) {
		case "ancestor":
		case "ancestor-or-self":
		case "parent":
		case "preceding":
		case "preceding-sibling":
			oSequence.reverse();
	}

	return oSequence;
};

//
function fAxisStep_getChildrenForward(oNode, oSequence, fGetProperty) {
	for (var oChild; oNode; oNode = fGetProperty(oNode, "nextSibling")) {
		oSequence.push(oNode);
		if (oChild = fGetProperty(oNode, "firstChild"))
			fAxisStep_getChildrenForward(oChild, oSequence, fGetProperty);
	}
};

function fAxisStep_getChildrenBackward(oNode, oSequence, fGetProperty) {
	for (var oChild; oNode; oNode = fGetProperty(oNode, "previousSibling")) {
		if (oChild = fGetProperty(oNode, "lastChild"))
			fAxisStep_getChildrenBackward(oChild, oSequence, fGetProperty);
		oSequence.push(oNode);
	}
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cPathExpr() {
	this.items	= [];
};

cPathExpr.prototype.items	= null;

// Static members
function fPathExpr_parse (oLexer, oStaticContext) {
	if (oLexer.eof())
		return;
	var sSingleSlash	= '/',
		sDoubleSlash	= '/' + '/';

	var oPathExpr	= new cPathExpr(),
		sSlash	= oLexer.peek(),
		oExpr;
	// Parse first step
	if (sSlash == sDoubleSlash || sSlash == sSingleSlash) {
		oLexer.next();
		oPathExpr.items.push(new cFunctionCall(null, "root", sNS_XPF));
		//
		if (sSlash == sDoubleSlash)
			oPathExpr.items.push(new cAxisStep("descendant-or-self", new cKindTest("node")));
	}

	//
	if (oLexer.eof() ||!(oExpr = fStepExpr_parse(oLexer, oStaticContext))) {
		if (sSlash == sSingleSlash)
			return oPathExpr.items[0];	// '/' expression
		if (sSlash == sDoubleSlash)
			throw new cException("XPST0003"

			);
		return;
	}
	oPathExpr.items.push(oExpr);

	// Parse other steps
	while ((sSlash = oLexer.peek()) == sSingleSlash || sSlash == sDoubleSlash) {
		if (sSlash == sDoubleSlash)
			oPathExpr.items.push(new cAxisStep("descendant-or-self", new cKindTest("node")));
		//
		oLexer.next();
		if (oLexer.eof() ||!(oExpr = fStepExpr_parse(oLexer, oStaticContext)))
			throw new cException("XPST0003"

			);
		//
		oPathExpr.items.push(oExpr);
	}

	if (oPathExpr.items.length == 1)
		return oPathExpr.items[0];

	//
	return oPathExpr;
};

// Public members
cPathExpr.prototype.evaluate	= function (oContext) {
	var vContextItem	= oContext.item;
	//
	var oSequence	= [vContextItem];
	for (var nItemIndex = 0, nItemLength = this.items.length, oSequence1; nItemIndex < nItemLength; nItemIndex++) {
		oSequence1	= [];
		for (var nIndex = 0, nLength = oSequence.length; nIndex < nLength; nIndex++) {
			// Set new context item
			oContext.item	= oSequence[nIndex];
			//
			for (var nRightIndex = 0, oSequence2 = this.items[nItemIndex].evaluate(oContext), nRightLength = oSequence2.length; nRightIndex < nRightLength; nRightIndex++)
				if ((nItemIndex < nItemLength - 1) && !oContext.DOMAdapter.isNode(oSequence2[nRightIndex]))
					throw new cException("XPTY0019");
				else
				if (fArray_indexOf(oSequence1, oSequence2[nRightIndex]) ==-1)
					oSequence1.push(oSequence2[nRightIndex]);
		}
		oSequence	= oSequence1;
	};
	// Restore context item
	oContext.item	= vContextItem;
	//
	return fFunction_sequence_order(oSequence, oContext);
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cNodeTest() {

};

// Static members
function fNodeTest_parse (oLexer, oStaticContext) {
	if (!oLexer.eof())
		return fKindTest_parse(oLexer, oStaticContext)
			|| fNameTest_parse(oLexer, oStaticContext);
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cKindTest(sName) {
	this.name	= sName;
	this.args	= [];
};

cKindTest.prototype	= new cNodeTest;

cKindTest.prototype.name	= null;
cKindTest.prototype.args	= null;

var hKindTest_names	= {};
//
hKindTest_names["document-node"]	= {};
hKindTest_names["element"]			= {};
hKindTest_names["attribute"]		= {};
hKindTest_names["processing-instruction"]	= {};
hKindTest_names["comment"]			= {};
hKindTest_names["text"]				= {};
hKindTest_names["node"]				= {};
//
hKindTest_names["schema-element"]	= {};
hKindTest_names["schema-attribute"]	= {};

// Static members
function fKindTest_parse (oLexer, oStaticContext) {
	var sName	= oLexer.peek(),
		oValue;
	if (oLexer.peek(1) == '(') {
		//
		if (!(sName in hKindTest_names))
			throw new cException("XPST0003"

			);

		//
		oLexer.next(2);
		//
		var oTest	= new cKindTest(sName);
		if (oLexer.peek() != ')') {
			if (sName == "document-node") {
				// TODO: parse test further
			}
			else
			if (sName == "element") {
				// TODO: parse test further
			}
			else
			if (sName == "attribute") {
				// TODO: parse test further
			}
			else
			if (sName == "processing-instruction") {
				oValue = fStringLiteral_parse(oLexer, oStaticContext);
				if (!oValue) {
					oValue = new cStringLiteral(new cXSString(oLexer.peek()));
					oLexer.next();
				}
				oTest.args.push(oValue);
			}
			else
			if (sName == "schema-attribute") {
				// TODO: parse test further
			}
			else
			if (sName == "schema-element") {
				// TODO: parse test further
			}
		}
		else {
			if (sName == "schema-attribute")
				throw new cException("XPST0003"

				);
			else
			if (sName == "schema-element")
				throw new cException("XPST0003"

				);
		}

		if (oLexer.peek() != ')')
			throw new cException("XPST0003"

			);
		oLexer.next();

		return oTest;
	}
};

// Public members
cKindTest.prototype.test	= function (oNode, oContext) {
	var fGetProperty	= oContext.DOMAdapter.getProperty,
		nType	= oContext.DOMAdapter.isNode(oNode) ? fGetProperty(oNode, "nodeType") : 0,
		sTarget;
	switch (this.name) {
		// Node type test
		case "node":			return !!nType;
		case "attribute":				if (nType != 2)	return false;	break;
		case "document-node":	return nType == 9;
		case "element":			return nType == 1;
		case "processing-instruction":	if (nType != 7)	return false;	break;
		case "comment":			return nType == 8;
		case "text":			return nType == 3 || nType == 4;

		// Schema tests
		case "schema-attribute":
			throw "KindTest '" + "schema-attribute" + "' not implemented";

		case "schema-element":
			throw "KindTest '" + "schema-element" + "' not implemented";
	}

	// Additional tests
	if (nType == 2)
		return fGetProperty(oNode, "prefix") != "xmlns" && fGetProperty(oNode, "localName") != "xmlns";
	if (nType == 7) {
		sTarget = fGetProperty(oNode, "target");
		return this.args.length ? sTarget == this.args[0].value : sTarget != "xml";
	}

	return true;
};

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cNameTest(sPrefix, sLocalName, sNameSpaceURI) {
	this.prefix			= sPrefix;
	this.localName		= sLocalName;
	this.namespaceURI	= sNameSpaceURI;
};

cNameTest.prototype	= new cNodeTest;

cNameTest.prototype.prefix			= null;
cNameTest.prototype.localName		= null;
cNameTest.prototype.namespaceURI	= null;

// Static members
var rNameTest	= /^(?:(?![0-9-])(\w[\w.-]*|\*)\:)?(?![0-9-])(\w[\w.-]*|\*)$/;
function fNameTest_parse (oLexer, oStaticContext) {
	var aMatch	= oLexer.peek().match(rNameTest);
	if (aMatch) {
		if (aMatch[1] == '*' && aMatch[2] == '*')
			throw new cException("XPST0003"

			);
		oLexer.next();
		return new cNameTest(aMatch[1] || null, aMatch[2], aMatch[1] ? aMatch[1] == '*' ? '*' : oStaticContext.getURIForPrefix(aMatch[1]) || null : oStaticContext.defaultElementNamespace);
	}
};

// Public members
cNameTest.prototype.test	= function (oNode, oContext) {
	var fGetProperty	= oContext.DOMAdapter.getProperty,
		nType	= fGetProperty(oNode, "nodeType");
	if (nType == 1 || nType == 2) {
		if (this.localName == '*')
			return (nType == 1 || (fGetProperty(oNode, "prefix") != "xmlns" && fGetProperty(oNode, "localName") != "xmlns")) && (!this.prefix || fGetProperty(oNode, "namespaceURI") == this.namespaceURI);
		if (this.localName == fGetProperty(oNode, "localName"))
			return this.namespaceURI == '*' || (nType == 2 && !this.prefix && !fGetProperty(oNode, "prefix")) || fGetProperty(oNode, "namespaceURI") == this.namespaceURI;
	}
	//
	return false;
};

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cPrimaryExpr() {

};

// Static members
function fPrimaryExpr_parse (oLexer, oStaticContext) {
	if (!oLexer.eof())
		return fContextItemExpr_parse(oLexer, oStaticContext)
			|| fParenthesizedExpr_parse(oLexer, oStaticContext)
			|| fFunctionCall_parse(oLexer, oStaticContext)
			|| fVarRef_parse(oLexer, oStaticContext)
			|| fLiteral_parse(oLexer, oStaticContext);
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cParenthesizedExpr(oExpr) {
	this.expression	= oExpr;
};

// Static members
function fParenthesizedExpr_parse (oLexer, oStaticContext) {
	if (oLexer.peek() == '(') {
		oLexer.next();
		// Check if not empty (allowed)
		var oExpr	= null;
		if (oLexer.peek() != ')')
			oExpr	= fExpr_parse(oLexer, oStaticContext);

		//
		if (oLexer.peek() != ')')
			throw new cException("XPST0003"

			);

		oLexer.next();

		//
		return new cParenthesizedExpr(oExpr);
	}
};

// Public members
cParenthesizedExpr.prototype.evaluate	= function (oContext) {
	return this.expression ? this.expression.evaluate(oContext) : [];
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cContextItemExpr() {

};

// Static members
function fContextItemExpr_parse (oLexer, oStaticContext) {
	if (oLexer.peek() == '.') {
		oLexer.next();
		return new cContextItemExpr;
	}
};

// Public members
cContextItemExpr.prototype.evaluate	= function (oContext) {
	if (oContext.item == null)
		throw new cException("XPDY0002"

		);
	//
	return [oContext.item];
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cLiteral() {

};

cLiteral.prototype.value	= null;

// Static members
function fLiteral_parse (oLexer, oStaticContext) {
	if (!oLexer.eof())
		return fNumericLiteral_parse(oLexer, oStaticContext)
			|| fStringLiteral_parse(oLexer, oStaticContext);
};

// Public members
cLiteral.prototype.evaluate	= function (oContext) {
	return [this.value];
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cNumericLiteral(oValue) {
	this.value	= oValue;
};

cNumericLiteral.prototype	= new cLiteral;

// Integer | Decimal | Double
var rNumericLiteral	= /^[+\-]?(?:(?:(\d+)(?:\.(\d*))?)|(?:\.(\d+)))(?:[eE]([+-])?(\d+))?$/;
function fNumericLiteral_parse (oLexer, oStaticContext) {
	var sValue	= oLexer.peek(),
		vValue	= fNumericLiteral_parseValue(sValue);
	if (vValue) {
		oLexer.next();
		return new cNumericLiteral(vValue);
	}
};

function fNumericLiteral_parseValue(sValue) {
	var aMatch	= sValue.match(rNumericLiteral);
	if (aMatch) {
		var cType	= cXSInteger;
		if (aMatch[5])
			cType	= cXSDouble;
		else
		if (aMatch[2] || aMatch[3])
			cType	= cXSDecimal;
		return new cType(+sValue);
	}
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cStringLiteral(oValue) {
	this.value	= oValue;
};

cStringLiteral.prototype	= new cLiteral;

var rStringLiteral	= /^'([^']*(?:''[^']*)*)'|"([^"]*(?:""[^"]*)*)"$/;
function fStringLiteral_parse (oLexer, oStaticContext) {
	var aMatch	= oLexer.peek().match(rStringLiteral);
	if (aMatch) {
		oLexer.next();
		return new cStringLiteral(new cXSString(aMatch[1] ? aMatch[1].replace("''", "'") : aMatch[2] ? aMatch[2].replace('""', '"') : ''));
	}
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cFilterExpr(oPrimary) {
	this.expression	= oPrimary;
	this.predicates	= [];
};

cFilterExpr.prototype	= new cStepExpr;

cFilterExpr.prototype.expression	= null;

// Static members
function fFilterExpr_parse (oLexer, oStaticContext) {
	var oExpr;
	if (oLexer.eof() ||!(oExpr = fPrimaryExpr_parse(oLexer, oStaticContext)))
		return;

	var oFilterExpr	= new cFilterExpr(oExpr);
	// Parse predicates
	fStepExpr_parsePredicates(oLexer, oStaticContext, oFilterExpr);

	// If no predicates found
	if (oFilterExpr.predicates.length == 0)
		return oFilterExpr.expression;

	return oFilterExpr;
};

// Public members
cFilterExpr.prototype.evaluate	= function (oContext) {
	var oSequence	= this.expression.evaluate(oContext);
	if (this.predicates.length && oSequence.length)
		oSequence	= this.applyPredicates(oSequence, oContext);
	return oSequence;
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cVarRef(sPrefix, sLocalName, sNameSpaceURI) {
	this.prefix			= sPrefix;
	this.localName		= sLocalName;
	this.namespaceURI	= sNameSpaceURI;
};

cVarRef.prototype.prefix		= null;
cVarRef.prototype.localName		= null;
cVarRef.prototype.namespaceURI	= null;

// Static members
function fVarRef_parse (oLexer, oStaticContext) {
	if (oLexer.peek().substr(0, 1) == '$') {
		var aMatch	= oLexer.peek().substr(1).match(rNameTest);
		if (aMatch) {
			if (aMatch[1] == '*' || aMatch[2] == '*')
				throw new cException("XPST0003"
	
				);

			var oVarRef	= new cVarRef(aMatch[1] || null, aMatch[2], aMatch[1] ? oStaticContext.getURIForPrefix(aMatch[1]) : null);
			oLexer.next();
			return oVarRef;
		}
	}
};

// Public members
cVarRef.prototype.evaluate	= function (oContext) {
	var sUri	= (this.namespaceURI ? '{' + this.namespaceURI + '}' : '') + this.localName;
	if (oContext.scope.hasOwnProperty(sUri))
		return [oContext.scope[sUri]];
	//
	throw new cException("XPST0008"

	);
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cFunctionCall(sPrefix, sLocalName, sNameSpaceURI) {
	this.prefix			= sPrefix;
	this.localName		= sLocalName;
	this.namespaceURI	= sNameSpaceURI;
	this.args	= [];
};

cFunctionCall.prototype.prefix			= null;
cFunctionCall.prototype.localName		= null;
cFunctionCall.prototype.namespaceURI	= null;
cFunctionCall.prototype.args	= null;

// Static members
function fFunctionCall_parse (oLexer, oStaticContext) {
	var aMatch	= oLexer.peek().match(rNameTest);
	if (aMatch && oLexer.peek(1) == '(') {
		// Reserved "functions"
		if (!aMatch[1] && (aMatch[2] in hKindTest_names))
			return fAxisStep_parse(oLexer, oStaticContext);
		// Other functions
		if (aMatch[1] == '*' || aMatch[2] == '*')
			throw new cException("XPST0003"

			);
		var oFunctionCallExpr	= new cFunctionCall(aMatch[1] || null, aMatch[2], aMatch[1] ? oStaticContext.getURIForPrefix(aMatch[1]) || null : oStaticContext.defaultFunctionNamespace),
			oExpr;
		oLexer.next(2);
		//
		if (oLexer.peek() != ')') {
			do {
				if (oLexer.eof() ||!(oExpr = fExprSingle_parse(oLexer, oStaticContext)))
					throw new cException("XPST0003"

					);
				//
				oFunctionCallExpr.args.push(oExpr);
			}
			while (oLexer.peek() == ',' && oLexer.next());
			//
			if (oLexer.peek() != ')')
				throw new cException("XPST0003"

				);
		}
		oLexer.next();
		return oFunctionCallExpr;
	}
};

// Public members
cFunctionCall.prototype.evaluate	= function (oContext) {
	var aArguments	= [],
		aParameters,
		fFunction;

	// Evaluate arguments
	for (var nIndex = 0, nLength = this.args.length; nIndex < nLength; nIndex++)
		aArguments.push(this.args[nIndex].evaluate(oContext));

	var sUri	= (this.namespaceURI ? '{' + this.namespaceURI + '}' : '') + this.localName;
	// Call function
	if (this.namespaceURI == sNS_XPF) {
		if (fFunction = hStaticContext_functions[this.localName]) {
			// Validate/Cast arguments
			if (aParameters = hStaticContext_signatures[this.localName])
				fFunctionCall_prepare(this.localName, aParameters, fFunction, aArguments, oContext);
			//
			var vResult	= fFunction.apply(oContext, aArguments);
			//
			return vResult == null ? [] : vResult instanceof cArray ? vResult : [vResult];
		}
		throw new cException("XPST0017"

		);
	}
	else
	if (this.namespaceURI == sNS_XSD) {
		if ((fFunction = hStaticContext_dataTypes[this.localName]) && this.localName != "NOTATION" && this.localName != "anyAtomicType") {
			//
			fFunctionCall_prepare(this.localName, [[cXSAnyAtomicType, '?']], fFunction, aArguments, oContext);
			//
			return aArguments[0] === null ? [] : [fFunction.cast(aArguments[0])];
		}
		throw new cException("XPST0017"

		);
	}
	else
	if (fFunction = oContext.staticContext.getFunction(sUri)) {
		//
		var vResult	= fFunction.apply(oContext, aArguments);
		//
		return vResult == null ? [] : vResult instanceof cArray ? vResult : [vResult];
	}
	//
	throw new cException("XPST0017"

	);
};

var aFunctionCall_numbers	= ["first", "second", "third", "fourth", "fifth"];
function fFunctionCall_prepare(sName, aParameters, fFunction, aArguments, oContext) {
	var oArgument,
		nArgumentsLength	= aArguments.length,
		oParameter,
		nParametersLength	= aParameters.length,
		nParametersRequired	= 0;

	// Determine amount of parameters required
	while ((nParametersRequired < aParameters.length) && !aParameters[nParametersRequired][2])
		nParametersRequired++;

	// Validate arguments length
	if (nArgumentsLength > nParametersLength)
		throw new cException("XPST0017"

		);
	else
	if (nArgumentsLength < nParametersRequired)
		throw new cException("XPST0017"

		);

	for (var nIndex = 0; nIndex < nArgumentsLength; nIndex++) {
		oParameter	= aParameters[nIndex];
		oArgument	= aArguments[nIndex];
		// Check sequence cardinality
		fFunctionCall_assertSequenceCardinality(oContext, oArgument, oParameter[1]

		);
		// Check sequence items data types consistency
		fFunctionCall_assertSequenceItemType(oContext, oArgument, oParameter[0]

		);
		if (oParameter[1] != '+' && oParameter[1] != '*')
			aArguments[nIndex]	= oArgument.length ? oArgument[0] : null;
	}
};

function fFunctionCall_assertSequenceItemType(oContext, oSequence, cItemType

	) {
	//
	for (var nIndex = 0, nLength = oSequence.length, nNodeType, vItem; nIndex < nLength; nIndex++) {
		vItem	= oSequence[nIndex];
		// Node types
		if (cItemType == cXTNode || cItemType.prototype instanceof cXTNode) {
			// Check if is node
			if (!oContext.DOMAdapter.isNode(vItem))
				throw new cException("XPTY0004"

				);

			// Check node type
			if (cItemType != cXTNode) {
				nNodeType	= oContext.DOMAdapter.getProperty(vItem, "nodeType");
				if ([null, cXTElement, cXTAttribute, cXTText, cXTText, null, null, cXTProcessingInstruction, cXTComment, cXTDocument, null, null, null][nNodeType] != cItemType)
					throw new cException("XPTY0004"

					);
			}
		}
		else
		// Atomic types
		if (cItemType == cXSAnyAtomicType || cItemType.prototype instanceof cXSAnyAtomicType) {
			// Atomize item
			vItem	= fFunction_sequence_atomize([vItem], oContext)[0];
			// Convert type if necessary
			if (cItemType != cXSAnyAtomicType) {
				// Cast item to expected type if it's type is xs:untypedAtomic
				if (vItem instanceof cXSUntypedAtomic)
					vItem	= cItemType.cast(vItem);
				// Cast item to xs:string if it's type is xs:anyURI
				else
				if (cItemType == cXSString/* || cItemType.prototype instanceof cXSString*/) {
					if (vItem instanceof cXSAnyURI)
						vItem	= cXSString.cast(vItem);
				}
				else
				if (cItemType == cXSDouble/* || cItemType.prototype instanceof cXSDouble*/) {
					if (fXSAnyAtomicType_isNumeric(vItem))
						vItem	= cItemType.cast(vItem);
				}
			}
			// Check type
			if (!(vItem instanceof cItemType))
				throw new cException("XPTY0004"

				);
			// Write value back to sequence
			oSequence[nIndex]	= vItem;
		}
	}
};

function fFunctionCall_assertSequenceCardinality(oContext, oSequence, sCardinality

	) {
	var nLength	= oSequence.length;
	// Check cardinality
	if (sCardinality == '?') {	// =0 or 1
		if (nLength > 1)
			throw new cException("XPTY0004"

			);
	}
	else
	if (sCardinality == '+') {	// =1+
		if (nLength < 1)
			throw new cException("XPTY0004"

			);
	}
	else
	if (sCardinality != '*') {	// =1 ('*' =0+)
		if (nLength != 1)
			throw new cException("XPTY0004"

			);
	}
};

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cIntersectExceptExpr(oExpr) {
	this.left	= oExpr;
	this.items	= [];
};

cIntersectExceptExpr.prototype.left		= null;
cIntersectExceptExpr.prototype.items	= null;

// Static members
function fIntersectExceptExpr_parse (oLexer, oStaticContext) {
	var oExpr,
		sOperator;
	if (oLexer.eof() ||!(oExpr = fInstanceofExpr_parse(oLexer, oStaticContext)))
		return;
	if (!((sOperator = oLexer.peek()) == "intersect" || sOperator == "except"))
		return oExpr;

	// IntersectExcept expression
	var oIntersectExceptExpr	= new cIntersectExceptExpr(oExpr);
	while ((sOperator = oLexer.peek()) == "intersect" || sOperator == "except") {
		oLexer.next();
		if (oLexer.eof() ||!(oExpr = fInstanceofExpr_parse(oLexer, oStaticContext)))
			throw new cException("XPST0003"

			);
		oIntersectExceptExpr.items.push([sOperator, oExpr]);
	}
	return oIntersectExceptExpr;
};

// Public members
cIntersectExceptExpr.prototype.evaluate	= function (oContext) {
	var oSequence	= this.left.evaluate(oContext);
	for (var nIndex = 0, nLength = this.items.length, oItem; nIndex < nLength; nIndex++)
		oSequence	= hStaticContext_operators[(oItem = this.items[nIndex])[0]].call(oContext, oSequence, oItem[1].evaluate(oContext));
	return oSequence;
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cRangeExpr(oLeft, oRight) {
	this.left	= oLeft;
	this.right	= oRight;
};

cRangeExpr.prototype.left	= null;
cRangeExpr.prototype.right	= null;

// Static members
function fRangeExpr_parse (oLexer, oStaticContext) {
	var oExpr,
		oRight;
	if (oLexer.eof() ||!(oExpr = fAdditiveExpr_parse(oLexer, oStaticContext)))
		return;
	if (oLexer.peek() != "to")
		return oExpr;

	// Range expression
	oLexer.next();
	if (oLexer.eof() ||!(oRight = fAdditiveExpr_parse(oLexer, oStaticContext)))
		throw new cException("XPST0003"

		);
	return new cRangeExpr(oExpr, oRight);
};

// Public members
cRangeExpr.prototype.evaluate	= function (oContext) {
	//
	var oLeft	= this.left.evaluate(oContext);
	if (!oLeft.length)
		return [];
	//


	fFunctionCall_assertSequenceCardinality(oContext, oLeft, '?'

	);
	fFunctionCall_assertSequenceItemType(oContext, oLeft, cXSInteger

	);

	var oRight	= this.right.evaluate(oContext);
	if (!oRight.length)
		return [];



	fFunctionCall_assertSequenceCardinality(oContext, oRight, '?'

	);
	fFunctionCall_assertSequenceItemType(oContext, oRight, cXSInteger

	);

	return hStaticContext_operators["to"].call(oContext, oLeft[0], oRight[0]);
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cUnionExpr(oExpr) {
	this.left	= oExpr;
	this.items	= [];
};

cUnionExpr.prototype.left	= null;
cUnionExpr.prototype.items	= null;

// Static members
function fUnionExpr_parse (oLexer, oStaticContext) {
	var oExpr,
		sOperator;
	if (oLexer.eof() ||!(oExpr = fIntersectExceptExpr_parse(oLexer, oStaticContext)))
		return;
	if (!((sOperator = oLexer.peek()) == '|' || sOperator == "union"))
		return oExpr;

	// Union expression
	var oUnionExpr	= new cUnionExpr(oExpr);
	while ((sOperator = oLexer.peek()) == '|' || sOperator == "union") {
		oLexer.next();
		if (oLexer.eof() ||!(oExpr = fIntersectExceptExpr_parse(oLexer, oStaticContext)))
			throw new cException("XPST0003"

			);
		oUnionExpr.items.push(oExpr);
	}
	return oUnionExpr;
};

// Public members
cUnionExpr.prototype.evaluate	= function (oContext) {
	var oSequence	= this.left.evaluate(oContext);
	for (var nIndex = 0, nLength = this.items.length; nIndex < nLength; nIndex++)
		oSequence	= hStaticContext_operators["union"].call(oContext, oSequence, this.items[nIndex].evaluate(oContext));
	return oSequence;
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cInstanceofExpr(oExpr, oType) {
	this.expression	= oExpr;
	this.type		= oType;
};

cInstanceofExpr.prototype.expression	= null;
cInstanceofExpr.prototype.type			= null;

function fInstanceofExpr_parse (oLexer, oStaticContext) {
	var oExpr,
		oType;
	if (oLexer.eof() ||!(oExpr = fTreatExpr_parse(oLexer, oStaticContext)))
		return;

	if (!(oLexer.peek() == "instance" && oLexer.peek(1) == "of"))
		return oExpr;

	oLexer.next(2);
	if (oLexer.eof() ||!(oType = fSequenceType_parse(oLexer, oStaticContext)))
		throw new cException("XPST0003"

		);

	return new cInstanceofExpr(oExpr, oType);
};

cInstanceofExpr.prototype.evaluate	= function(oContext) {
	var oSequence1	= this.expression.evaluate(oContext),
		oItemType	= this.type.itemType,
		sOccurence	= this.type.occurence;
	// Validate empty-sequence()
	if (!oItemType)
		return [new cXSBoolean(!oSequence1.length)];
	// Validate cardinality
	if (!oSequence1.length)
		return [new cXSBoolean(sOccurence == '?' || sOccurence == '*')];
	if (oSequence1.length != 1)
		if (!(sOccurence == '+' || sOccurence == '*'))
			return [new cXSBoolean(false)];

	// Validate type
	if (!oItemType.test)	// item()
		return [new cXSBoolean(true)];

	var bValue	= true;
	for (var nIndex = 0, nLength = oSequence1.length; (nIndex < nLength) && bValue; nIndex++)
		bValue	= oItemType.test.test(oSequence1[nIndex], oContext);
	//
	return [new cXSBoolean(bValue)];
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cTreatExpr(oExpr, oType) {
	this.expression	= oExpr;
	this.type		= oType;
};

cTreatExpr.prototype.expression	= null;
cTreatExpr.prototype.type		= null;

function fTreatExpr_parse (oLexer, oStaticContext) {
	var oExpr,
		oType;
	if (oLexer.eof() ||!(oExpr = fCastableExpr_parse(oLexer, oStaticContext)))
		return;

	if (!(oLexer.peek() == "treat" && oLexer.peek(1) == "as"))
		return oExpr;

	oLexer.next(2);
	if (oLexer.eof() ||!(oType = fSequenceType_parse(oLexer, oStaticContext)))
		throw new cException("XPST0003"

		);

	return new cTreatExpr(oExpr, oType);
};

cTreatExpr.prototype.evaluate	= function(oContext) {
	var oSequence1	= this.expression.evaluate(oContext),
		oItemType	= this.type.itemType,
		sOccurence	= this.type.occurence;
	// Validate empty-sequence()
	if (!oItemType) {
		if (oSequence1.length)
			throw new cException("XPDY0050"

			);
		return oSequence1;
	}

	// Validate cardinality
	if (!(sOccurence == '?' || sOccurence == '*'))
		if (!oSequence1.length)
			throw new cException("XPDY0050"

			);

	if (!(sOccurence == '+' || sOccurence == '*'))
		if (oSequence1.length != 1)
			throw new cException("XPDY0050"

			);

	// Validate type
	if (!oItemType.test)	// item()
		return oSequence1;

	for (var nIndex = 0, nLength = oSequence1.length; nIndex < nLength; nIndex++)
		if (!oItemType.test.test(oSequence1[nIndex], oContext))
			throw new cException("XPDY0050"

			);

	//
	return oSequence1;
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cCastableExpr(oExpr, oType) {
	this.expression	= oExpr;
	this.type		= oType;
};

cCastableExpr.prototype.expression	= null;
cCastableExpr.prototype.type		= null;

function fCastableExpr_parse (oLexer, oStaticContext) {
	var oExpr,
		oType;
	if (oLexer.eof() ||!(oExpr = fCastExpr_parse(oLexer, oStaticContext)))
		return;

	if (!(oLexer.peek() == "castable" && oLexer.peek(1) == "as"))
		return oExpr;

	oLexer.next(2);
	if (oLexer.eof() ||!(oType = fSingleType_parse(oLexer, oStaticContext)))
		throw new cException("XPST0003"

		);

	return new cCastableExpr(oExpr, oType);
};

cCastableExpr.prototype.evaluate	= function(oContext) {
	var oSequence1	= this.expression.evaluate(oContext),
		oItemType	= this.type.itemType,
		sOccurence	= this.type.occurence;

	if (oSequence1.length > 1)
		return [new cXSBoolean(false)];
	else
	if (!oSequence1.length)
		return [new cXSBoolean(sOccurence == '?')];

	// Try casting
	try {
		oItemType.cast(fFunction_sequence_atomize(oSequence1, oContext)[0]);
	}
	catch (e) {
		if (e.code == "XPST0051")
			throw e;
		if (e.code == "XPST0017")
			throw new cException("XPST0080"

			);
		//
		return [new cXSBoolean(false)];
	}

	return [new cXSBoolean(true)];
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cCastExpr(oExpr, oType) {
	this.expression	= oExpr;
	this.type		= oType;
};

cCastExpr.prototype.expression	= null;
cCastExpr.prototype.type		= null;

function fCastExpr_parse (oLexer, oStaticContext) {
	var oExpr,
		oType;
	if (oLexer.eof() ||!(oExpr = fUnaryExpr_parse(oLexer, oStaticContext)))
		return;

	if (!(oLexer.peek() == "cast" && oLexer.peek(1) == "as"))
		return oExpr;

	oLexer.next(2);
	if (oLexer.eof() ||!(oType = fSingleType_parse(oLexer, oStaticContext)))
		throw new cException("XPST0003"

		);

	return new cCastExpr(oExpr, oType);
};

cCastExpr.prototype.evaluate	= function(oContext) {
	var oSequence1	= this.expression.evaluate(oContext);
	// Validate cardinality
	fFunctionCall_assertSequenceCardinality(oContext, oSequence1, this.type.occurence

	);
	//
	if (!oSequence1.length)
		return [];
	//
	return [this.type.itemType.cast(fFunction_sequence_atomize(oSequence1, oContext)[0], oContext)];
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cAtomicType(sPrefix, sLocalName, sNameSpaceURI) {
	this.prefix			= sPrefix;
	this.localName		= sLocalName;
	this.namespaceURI	= sNameSpaceURI;
};

cAtomicType.prototype.prefix		= null;
cAtomicType.prototype.localName		= null;
cAtomicType.prototype.namespaceURI	= null;

function fAtomicType_parse (oLexer, oStaticContext) {
	var aMatch	= oLexer.peek().match(rNameTest);
	if (aMatch) {
		if (aMatch[1] == '*' || aMatch[2] == '*')
			throw new cException("XPST0003"

			);
		oLexer.next();
		return new cAtomicType(aMatch[1] || null, aMatch[2], aMatch[1] ? oStaticContext.getURIForPrefix(aMatch[1]) : null);
	}
};

cAtomicType.prototype.test	= function(vItem, oContext) {
	// Test
	var sUri	= (this.namespaceURI ? '{' + this.namespaceURI + '}' : '') + this.localName,
		cType	= this.namespaceURI == sNS_XSD ? hStaticContext_dataTypes[this.localName] : oContext.staticContext.getDataType(sUri);
	if (cType)
		return vItem instanceof cType;
	//
	throw new cException("XPST0051"

	);
};

cAtomicType.prototype.cast	= function(vItem, oContext) {
	// Cast
	var sUri	= (this.namespaceURI ? '{' + this.namespaceURI + '}' : '') + this.localName,
		cType	= this.namespaceURI == sNS_XSD ? hStaticContext_dataTypes[this.localName] : oContext.staticContext.getDataType(sUri);
	if (cType)
		return cType.cast(vItem);
	//
	throw new cException("XPST0051"

	);
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cItemType(oTest) {
	this.test	= oTest;
};

cItemType.prototype.test	= null;

function fItemType_parse (oLexer, oStaticContext) {
	if (oLexer.eof())
		return;

	var oExpr;
	if (oLexer.peek() == "item" && oLexer.peek(1) == '(') {
		oLexer.next(2);
		if (oLexer.peek() != ')')
			throw new cException("XPST0003"

			);
		oLexer.next();
		return new cItemType;
	}
	// Note! Following step should have been before previous as per spec
	if (oExpr = fKindTest_parse(oLexer, oStaticContext))
		return new cItemType(oExpr);
	if (oExpr = fAtomicType_parse(oLexer, oStaticContext))
		return new cItemType(oExpr);
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cSequenceType(oItemType, sOccurence) {
	this.itemType	= oItemType	|| null;
	this.occurence	= sOccurence|| null;
};

cSequenceType.prototype.itemType	= null;
cSequenceType.prototype.occurence	= null;

function fSequenceType_parse (oLexer, oStaticContext) {
	if (oLexer.eof())
		return;

	if (oLexer.peek() == "empty-sequence" && oLexer.peek(1) == '(') {
		oLexer.next(2);
		if (oLexer.peek() != ')')
			throw new cException("XPST0003"

			);
		oLexer.next();
		return new cSequenceType;	// empty sequence
	}

	var oExpr,
		sOccurence;
	if (!oLexer.eof() && (oExpr = fItemType_parse(oLexer, oStaticContext))) {
		sOccurence	= oLexer.peek();
		if (sOccurence == '?' || sOccurence == '*' || sOccurence == '+')
			oLexer.next();
		else
			sOccurence	= null;

		return new cSequenceType(oExpr, sOccurence);
	}
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cSingleType(oItemType, sOccurence) {
	this.itemType	= oItemType	|| null;
	this.occurence	= sOccurence|| null;
};

cSingleType.prototype.itemType	= null;
cSingleType.prototype.occurence	= null;

function fSingleType_parse (oLexer, oStaticContext) {
	var oExpr,
		sOccurence;
	if (!oLexer.eof() && (oExpr = fAtomicType_parse(oLexer, oStaticContext))) {
		sOccurence	= oLexer.peek();
		if (sOccurence == '?')
			oLexer.next();
		else
			sOccurence	= null;

		return new cSingleType(oExpr, sOccurence);
	}
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSAnyType() {

};

cXSAnyType.prototype.builtInKind	= cXSConstants.ANYTYPE_DT;
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSAnySimpleType() {

};

cXSAnySimpleType.prototype	= new cXSAnyType;

cXSAnySimpleType.prototype.builtInKind	= cXSConstants.ANYSIMPLETYPE_DT;
cXSAnySimpleType.prototype.primitiveKind= null;

cXSAnySimpleType.PRIMITIVE_ANYURI		= "anyURI";		//18;
cXSAnySimpleType.PRIMITIVE_BASE64BINARY	= "base64Binary";	// 17;
cXSAnySimpleType.PRIMITIVE_BOOLEAN		= "boolean";	// 3;
cXSAnySimpleType.PRIMITIVE_DATE			= "date";		// 10;
cXSAnySimpleType.PRIMITIVE_DATETIME		= "dateTime";	// 8;
cXSAnySimpleType.PRIMITIVE_DECIMAL		= "decimal";	// 4;
cXSAnySimpleType.PRIMITIVE_DOUBLE		= "double";		// 6;
cXSAnySimpleType.PRIMITIVE_DURATION		= "duration";	// 7;
cXSAnySimpleType.PRIMITIVE_FLOAT		= "float";		// 5;
cXSAnySimpleType.PRIMITIVE_GDAY			= "gDay";		// 14;
cXSAnySimpleType.PRIMITIVE_GMONTH		= "gMonth";		// 15;
cXSAnySimpleType.PRIMITIVE_GMONTHDAY	= "gMonthDay";	// 13;
cXSAnySimpleType.PRIMITIVE_GYEAR		= "gYear";		// 12;
cXSAnySimpleType.PRIMITIVE_GYEARMONTH	= "gYearMonth";	// 11;
cXSAnySimpleType.PRIMITIVE_HEXBINARY	= "hexBinary";	// 16;
cXSAnySimpleType.PRIMITIVE_NOTATION		= "NOTATION";	// 20;
cXSAnySimpleType.PRIMITIVE_QNAME		= "QName";		// 19;
cXSAnySimpleType.PRIMITIVE_STRING		= "string";		// 2;
cXSAnySimpleType.PRIMITIVE_TIME			= "time";		// 9;

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSAnyAtomicType() {

};

cXSAnyAtomicType.prototype	= new cXSAnySimpleType;
cXSAnyAtomicType.prototype.builtInKind	= cXSConstants.ANYATOMICTYPE_DT;

cXSAnyAtomicType.cast	= function(vValue) {
	throw new cException("XPST0017"

	);	//  {http://www.w3.org/2001/XMLSchema}anyAtomicType
};

function fXSAnyAtomicType_isNumeric(vItem) {
	return vItem instanceof cXSFloat || vItem instanceof cXSDouble || vItem instanceof cXSDecimal;
};

//
fStaticContext_defineSystemDataType("anyAtomicType",	cXSAnyAtomicType);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSAnyURI(sScheme, sAuthority, sPath, sQuery, sFragment) {
	this.scheme		= sScheme;
	this.authority	= sAuthority;
	this.path		= sPath;
	this.query		= sQuery;
	this.fragment	= sFragment;
};

cXSAnyURI.prototype	= new cXSAnyAtomicType;
cXSAnyURI.prototype.builtInKind		= cXSConstants.ANYURI_DT;
cXSAnyURI.prototype.primitiveKind	= cXSAnySimpleType.PRIMITIVE_ANYURI;

cXSAnyURI.prototype.scheme		= null;
cXSAnyURI.prototype.authority	= null;
cXSAnyURI.prototype.path		= null;
cXSAnyURI.prototype.query		= null;
cXSAnyURI.prototype.fragment	= null;

cXSAnyURI.prototype.toString	= function() {
	return (this.scheme ? this.scheme + ':' : '')
			+ (this.authority ? '/' + '/' + this.authority : '')
			+ (this.path ? this.path : '')
			+ (this.query ? '?' + this.query : '')
			+ (this.fragment ? '#' + this.fragment : '');
};

var rXSAnyURI	= /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;	// http://tools.ietf.org/html/rfc3986
cXSAnyURI.cast	= function(vValue) {
	if (vValue instanceof cXSAnyURI)
		return vValue;
	if (vValue instanceof cXSString || vValue instanceof cXSUntypedAtomic) {
		var aMatch;
		if (aMatch = fString_trim(vValue).match(rXSAnyURI))
			return new cXSAnyURI(aMatch[2], aMatch[4], aMatch[5], aMatch[7], aMatch[9]);
		throw new cException("FORG0001");
	}
	//
	throw new cException("XPTY0004"

	);
};

//
fStaticContext_defineSystemDataType("anyURI",	cXSAnyURI);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSBase64Binary(sValue) {
	this.value	= sValue;
};

cXSBase64Binary.prototype	= new cXSAnyAtomicType;
cXSBase64Binary.prototype.builtInKind	= cXSConstants.BASE64BINARY_DT;
cXSBase64Binary.prototype.primitiveKind	= cXSAnySimpleType.PRIMITIVE_BASE64BINARY;

cXSBase64Binary.prototype.value	= null;

cXSBase64Binary.prototype.valueOf	= function() {
	return this.value;
};

cXSBase64Binary.prototype.toString	= function() {
	return this.value;
};

var rXSBase64Binary		= /^((([A-Za-z0-9+\/]\s*){4})*(([A-Za-z0-9+\/]\s*){3}[A-Za-z0-9+\/]|([A-Za-z0-9+\/]\s*){2}[AEIMQUYcgkosw048]\s*=|[A-Za-z0-9+\/]\s*[AQgw]\s*=\s*=))?$/;
cXSBase64Binary.cast	= function(vValue) {
	if (vValue instanceof cXSBase64Binary)
		return vValue;
	if (vValue instanceof cXSString || vValue instanceof cXSUntypedAtomic) {
		var aMatch	= fString_trim(vValue).match(rXSBase64Binary);
		if (aMatch)
			return new cXSBase64Binary(aMatch[0]);
		throw new cException("FORG0001");
	}
	if (vValue instanceof cXSHexBinary) {
		var aMatch	= vValue.valueOf().match(/.{2}/g),
			aValue	= [];
		for (var nIndex = 0, nLength = aMatch.length; nIndex < nLength; nIndex++)
			aValue.push(cString.fromCharCode(fWindow_parseInt(aMatch[nIndex], 16)));
		return new cXSBase64Binary(fWindow_btoa(aValue.join('')));
	}
	//
	throw new cException("XPTY0004"

	);
};

//
fStaticContext_defineSystemDataType("base64Binary",	cXSBase64Binary);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSBoolean(bValue) {
	this.value	= bValue;
};

cXSBoolean.prototype	= new cXSAnyAtomicType;
cXSBoolean.prototype.builtInKind	= cXSConstants.BOOLEAN_DT;
cXSBoolean.prototype.primitiveKind	= cXSAnySimpleType.PRIMITIVE_BOOLEAN;

cXSBoolean.prototype.value	= null;

cXSBoolean.prototype.valueOf	= function() {
	return this.value;
};

cXSBoolean.prototype.toString	= function() {
	return cString(this.value);
};

var rXSBoolean	= /^(0|1|true|false)$/;
cXSBoolean.cast	= function(vValue) {
	if (vValue instanceof cXSBoolean)
		return vValue;
	if (vValue instanceof cXSString || vValue instanceof cXSUntypedAtomic) {
		var aMatch;
		if (aMatch = fString_trim(vValue).match(rXSBoolean))
			return new cXSBoolean(aMatch[1] == '1' || aMatch[1] == "true");
		throw new cException("FORG0001");
	}
	if (fXSAnyAtomicType_isNumeric(vValue))
		return new cXSBoolean(vValue != 0);
	//
	throw new cException("XPTY0004"

	);
};

//
fStaticContext_defineSystemDataType("boolean",	cXSBoolean);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSDate(nYear, nMonth, nDay, nTimezone, bNegative) {
	this.year		= nYear;
	this.month		= nMonth;
	this.day		= nDay;
	this.timezone	= nTimezone;
	this.negative	= bNegative;
};

cXSDate.prototype	= new cXSAnyAtomicType;
cXSDate.prototype.builtInKind	= cXSConstants.DATE_DT;
cXSDate.prototype.primitiveKind	= cXSAnySimpleType.PRIMITIVE_DATE;

cXSDate.prototype.year		= null;
cXSDate.prototype.month		= null;
cXSDate.prototype.day		= null;
cXSDate.prototype.timezone	= null;
cXSDate.prototype.negative	= null;

cXSDate.prototype.toString	= function() {
	return fXSDateTime_getDateComponent(this)
			+ fXSDateTime_getTZComponent(this);
};

var rXSDate		= /^(-?)([1-9]\d\d\d+|0\d\d\d)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(Z|([+\-])(0\d|1[0-4]):([0-5]\d))?$/;
cXSDate.cast	= function(vValue) {
	if (vValue instanceof cXSDate)
		return vValue;
	if (vValue instanceof cXSString || vValue instanceof cXSUntypedAtomic) {
		var aMatch	= fString_trim(vValue).match(rXSDate);
		if (aMatch) {
			var nYear	= +aMatch[2],
				nMonth	= +aMatch[3],
				nDay	= +aMatch[4];
			if (nDay - 1 < fXSDate_getDaysForYearMonth(nYear, nMonth))
				return new cXSDate( nYear,
									nMonth,
									nDay,
									aMatch[5] ? aMatch[5] == 'Z' ? 0 : (aMatch[6] == '-' ? -1 : 1) * (aMatch[7] * 60 + aMatch[8] * 1) : null,
									aMatch[1] == '-'
				);
			//
			throw new cException("FORG0001"

			);
		}
		throw new cException("FORG0001");
	}
	if (vValue instanceof cXSDateTime)
		return new cXSDate(vValue.year, vValue.month, vValue.day, vValue.timezone, vValue.negative);
	//
	throw new cException("XPTY0004"

	);
};

// Utilities
var aXSDate_days	= [31,28,31,30,31,30,31,31,30,31,30,31];
function fXSDate_getDaysForYearMonth(nYear, nMonth) {
	return nMonth == 2 && (nYear % 400 == 0 || nYear % 100 != 0 && nYear % 4 == 0) ? 29 : aXSDate_days[nMonth - 1];
};

function fXSDate_normalize(oValue, bDay) {
	// Adjust day for month/year
	if (!bDay) {
		var nDay	= fXSDate_getDaysForYearMonth(oValue.year, oValue.month);
		if (oValue.day > nDay) {
			while (oValue.day > nDay) {
				oValue.month	+= 1;
				if (oValue.month > 12) {
					oValue.year		+= 1;
					if (oValue.year == 0)
						oValue.year	= 1;
					oValue.month	= 1;
				}
				oValue.day	-= nDay;
				nDay = fXSDate_getDaysForYearMonth(oValue.year, oValue.month);
			}
		}
		else
		if (oValue.day < 1) {
			while (oValue.day < 1) {
				oValue.month	-= 1;
				if (oValue.month < 1) {
					oValue.year		-= 1;
					if (oValue.year == 0)
						oValue.year	=-1;
					oValue.month	= 12;
				}
				nDay = fXSDate_getDaysForYearMonth(oValue.year, oValue.month);
				oValue.day	+= nDay;
			}
		}
	}
//?	else
	// Adjust month
	if (oValue.month > 12) {
		oValue.year		+= ~~(oValue.month / 12);
		if (oValue.year == 0)
			oValue.year	= 1;
		oValue.month	= oValue.month % 12;
	}
	else
	if (oValue.month < 1) {
		oValue.year		+= ~~(oValue.month / 12) - 1;
		if (oValue.year == 0)
			oValue.year	=-1;
		oValue.month	= oValue.month % 12 + 12;
	}

	return oValue;
};

//
fStaticContext_defineSystemDataType("date",	cXSDate);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSDateTime(nYear, nMonth, nDay, nHours, nMinutes, nSeconds, nTimezone, bNegative) {
	this.year	= nYear;
	this.month	= nMonth;
	this.day	= nDay;
	this.hours	= nHours;
	this.minutes	= nMinutes;
	this.seconds	= nSeconds;
	this.timezone	= nTimezone;
	this.negative	= bNegative;
};

cXSDateTime.prototype	= new cXSAnyAtomicType;
cXSDateTime.prototype.builtInKind	= cXSConstants.DATETIME_DT;
cXSDateTime.prototype.primitiveKind	= cXSAnySimpleType.PRIMITIVE_DATETIME;

cXSDateTime.prototype.year		= null;
cXSDateTime.prototype.month		= null;
cXSDateTime.prototype.day		= null;
cXSDateTime.prototype.hours		= null;
cXSDateTime.prototype.minutes	= null;
cXSDateTime.prototype.seconds	= null;
cXSDateTime.prototype.timezone	= null;
cXSDateTime.prototype.negative	= null;

cXSDateTime.prototype.toString	= function() {
	return fXSDateTime_getDateComponent(this)
			+ 'T'
			+ fXSDateTime_getTimeComponent(this)
			+ fXSDateTime_getTZComponent(this);
};

var rXSDateTime		= /^(-?)([1-9]\d\d\d+|0\d\d\d)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T(([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(?:\.(\d+))?|(24:00:00)(?:\.(0+))?)(Z|([+\-])(0\d|1[0-4]):([0-5]\d))?$/;
cXSDateTime.cast	= function(vValue) {
	if (vValue instanceof cXSDateTime)
		return vValue;
	if (vValue instanceof cXSString || vValue instanceof cXSUntypedAtomic) {
		var aMatch	= fString_trim(vValue).match(rXSDateTime);
		if (aMatch) {
			var nYear	= +aMatch[2],
				nMonth	= +aMatch[3],
				nDay	= +aMatch[4],
				bValue	= !!aMatch[10];
			if (nDay - 1 < fXSDate_getDaysForYearMonth(nYear, nMonth))
				return fXSDateTime_normalize(new cXSDateTime( nYear,
										nMonth,
										nDay,
										bValue ? 24 : +aMatch[6],
										bValue ? 0 : +aMatch[7],
										cNumber((bValue ? 0 : aMatch[8]) + '.' + (bValue ? 0 : aMatch[9] || 0)),
										aMatch[12] ? aMatch[12] == 'Z' ? 0 : (aMatch[13] == '-' ? -1 : 1) * (aMatch[14] * 60 + aMatch[15] * 1) : null,
										aMatch[1] == '-'
				));
			//
			throw new cException("FORG0001"

			);
		}
		throw new cException("FORG0001");
	}
	if (vValue instanceof cXSDate)
		return new cXSDateTime(vValue.year, vValue.month, vValue.day, 0, 0, 0, vValue.timezone, vValue.negative);
	//
	throw new cException("XPTY0004"

	);
};

// Utilities
function fXSDateTime_pad(vValue, nLength) {
	var sValue	= cString(vValue);
	if (arguments.length < 2)
		nLength	= 2;
	return (sValue.length < nLength + 1 ? new cArray(nLength + 1 - sValue.length).join('0') : '') + sValue;
};

function fXSDateTime_getTZComponent(oDateTime) {
	var nTimezone	= oDateTime.timezone;
	return nTimezone == null
			? ''
			: nTimezone
				? (nTimezone > 0 ? '+' : '-')
					+ fXSDateTime_pad(cMath.abs(~~(nTimezone / 60)))
					+ ':'
					+ fXSDateTime_pad(cMath.abs(nTimezone % 60))
				: 'Z';
};

function fXSDateTime_getDateComponent(oDateTime) {
	return (oDateTime.negative ? '-' : '')
			+ fXSDateTime_pad(oDateTime.year, 4)
			+ '-' + fXSDateTime_pad(oDateTime.month)
			+ '-' + fXSDateTime_pad(oDateTime.day);
};

function fXSDateTime_getTimeComponent(oDateTime) {
	var aValue	= cString(oDateTime.seconds).split('.');
	return fXSDateTime_pad(oDateTime.hours)
			+ ':' + fXSDateTime_pad(oDateTime.minutes)
			+ ':' + fXSDateTime_pad(aValue[0])
			+ (aValue.length > 1 ? '.' + aValue[1] : '');
};

function fXSDateTime_normalize(oValue) {
	return fXSDate_normalize(fXSTime_normalize(oValue));
};

//
fStaticContext_defineSystemDataType("dateTime",	cXSDateTime);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSDecimal(nValue) {
	this.value	= nValue;
};

cXSDecimal.prototype	= new cXSAnyAtomicType;
cXSDecimal.prototype.builtInKind	= cXSConstants.DECIMAL_DT;
cXSDecimal.prototype.primitiveKind	= cXSAnySimpleType.PRIMITIVE_DECIMAL;

cXSDecimal.prototype.value	= null;

cXSDecimal.prototype.valueOf	= function() {
	return this.value;
};

cXSDecimal.prototype.toString	= function() {
	return cString(this.value);
};

var rXSDecimal	= /^[+\-]?((\d+(\.\d*)?)|(\.\d+))$/;
cXSDecimal.cast	= function(vValue) {
	if (vValue instanceof cXSDecimal)
		return vValue;
	if (vValue instanceof cXSString || vValue instanceof cXSUntypedAtomic) {
		var aMatch	= fString_trim(vValue).match(rXSDecimal);
		if (aMatch)
			return new cXSDecimal(+vValue);
		throw new cException("FORG0001");
	}
	if (vValue instanceof cXSBoolean)
		return new cXSDecimal(vValue * 1);
	if (fXSAnyAtomicType_isNumeric(vValue)) {
		if (!fIsNaN(vValue) && fIsFinite(vValue))
			return new cXSDecimal(+vValue);
		throw new cException("FOCA0002"

		);
	}
	//
	throw new cException("XPTY0004"

	);
};

//
fStaticContext_defineSystemDataType("decimal",	cXSDecimal);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSDouble(nValue) {
	this.value	= nValue;
};

cXSDouble.prototype	= new cXSAnyAtomicType;
cXSDouble.prototype.builtInKind		= cXSConstants.DOUBLE_DT;
cXSDouble.prototype.primitiveKind	= cXSAnySimpleType.PRIMITIVE_DOUBLE;

cXSDouble.prototype.value	= null;

cXSDouble.prototype.valueOf	= function() {
	return this.value;
};

cXSDouble.prototype.toString	= function() {
	return cString(this.value);
};

var rXSDouble	= /^([+\-]?((\d+(\.\d*)?)|(\.\d+))([eE][+\-]?\d+)?|(-?INF)|NaN)$/;
cXSDouble.cast	= function(vValue) {
	if (vValue instanceof cXSDouble)
		return vValue;
	if (vValue instanceof cXSString || vValue instanceof cXSUntypedAtomic) {
		var aMatch	= fString_trim(vValue).match(rXSDouble);
		if (aMatch)
			return new cXSDouble(aMatch[7] ? +aMatch[7].replace("INF", "Infinity") : +vValue);
		throw new cException("FORG0001");
	}
	if (vValue instanceof cXSBoolean)
		return new cXSDouble(vValue * 1);
	if (fXSAnyAtomicType_isNumeric(vValue))
		return new cXSDouble(vValue.value);
	//
	throw new cException("XPTY0004"

	);
};

//
fStaticContext_defineSystemDataType("double",	cXSDouble);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSDuration(nYear, nMonth, nDay, nHours, nMinutes, nSeconds, bNegative) {
	this.year	= nYear;
	this.month	= nMonth;
	this.day	= nDay;
	this.hours	= nHours;
	this.minutes	= nMinutes;
	this.seconds	= nSeconds;
	this.negative	= bNegative;
};

cXSDuration.prototype	= new cXSAnyAtomicType;
cXSDuration.prototype.builtInKind	= cXSConstants.DURATION_DT;
cXSDuration.prototype.primitiveKind	= cXSAnySimpleType.PRIMITIVE_DURATION;

cXSDuration.prototype.year		= null;
cXSDuration.prototype.month		= null;
cXSDuration.prototype.day		= null;
cXSDuration.prototype.hours		= null;
cXSDuration.prototype.minutes	= null;
cXSDuration.prototype.seconds	= null;
cXSDuration.prototype.negative	= null;

cXSDuration.prototype.toString	= function() {
	return (this.negative ? '-' : '') + 'P'
			+ ((fXSDuration_getYearMonthComponent(this) + fXSDuration_getDayTimeComponent(this)) || 'T0S');
};

var rXSDuration		= /^(-)?P(?:([0-9]+)Y)?(?:([0-9]+)M)?(?:([0-9]+)D)?(?:T(?:([0-9]+)H)?(?:([0-9]+)M)?(?:((?:(?:[0-9]+(?:.[0-9]*)?)|(?:.[0-9]+)))S)?)?$/;
cXSDuration.cast	= function(vValue) {
	if (vValue instanceof cXSDuration)
		return vValue;
	if (vValue instanceof cXSYearMonthDuration)
		return new cXSDuration(vValue.year, vValue.month, 0, 0, 0, 0, vValue.negative);
	if (vValue instanceof cXSDayTimeDuration)
		return new cXSDuration(0, 0, vValue.day, vValue.hours, vValue.minutes, vValue.seconds, vValue.negative);
	if (vValue instanceof cXSString || vValue instanceof cXSUntypedAtomic) {
		var aMatch	= fString_trim(vValue).match(rXSDuration);
		if (aMatch)
			return fXSDuration_normalize(new cXSDuration(+aMatch[2] || 0, +aMatch[3] || 0, +aMatch[4] || 0, +aMatch[5] || 0, +aMatch[6] || 0, +aMatch[7] || 0, aMatch[1] == '-'));
		throw new cException("FORG0001");
	}
	//
	throw new cException("XPTY0004"

	);
};

// Utilities
function fXSDuration_getYearMonthComponent(oDuration) {
	return (oDuration.year ? oDuration.year + 'Y' : '')
			+ (oDuration.month ? oDuration.month + 'M' : '');
};

function fXSDuration_getDayTimeComponent(oDuration) {
	return (oDuration.day ? oDuration.day + 'D' : '')
			+ (oDuration.hours || oDuration.minutes || oDuration.seconds
				? 'T'
					+ (oDuration.hours ? oDuration.hours + 'H' : '')
					+ (oDuration.minutes ? oDuration.minutes + 'M' : '')
					+ (oDuration.seconds ? oDuration.seconds + 'S' : '')
				: '');
};

function fXSDuration_normalize(oDuration) {
	return fXSYearMonthDuration_normalize(fXSDayTimeDuration_normalize(oDuration));
};

//
fStaticContext_defineSystemDataType("duration",	cXSDuration);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSFloat(nValue) {
	this.value	= nValue;
};

cXSFloat.prototype	= new cXSAnyAtomicType;
cXSFloat.prototype.builtInKind		= cXSConstants.FLOAT_DT;
cXSFloat.prototype.primitiveKind	= cXSAnySimpleType.PRIMITIVE_FLOAT;

cXSFloat.prototype.value	= null;

cXSFloat.prototype.valueOf	= function() {
	return this.value;
};

cXSFloat.prototype.toString	= function() {
	return cString(this.value);
};

var rXSFloat	= /^([+\-]?((\d+(\.\d*)?)|(\.\d+))([eE][+\-]?\d+)?|(-?INF)|NaN)$/;
cXSFloat.cast	= function(vValue) {
	if (vValue instanceof cXSFloat)
		return vValue;
	if (vValue instanceof cXSString || vValue instanceof cXSUntypedAtomic) {
		var aMatch	= fString_trim(vValue).match(rXSFloat);
		if (aMatch)
			return new cXSFloat(aMatch[7] ? +aMatch[7].replace("INF", "Infinity") : +vValue);
		throw new cException("FORG0001");
	}
	if (vValue instanceof cXSBoolean)
		return new cXSFloat(vValue * 1);
	if (fXSAnyAtomicType_isNumeric(vValue))
		return new cXSFloat(vValue.value);
	//
	throw new cException("XPTY0004"

	);
};

//
fStaticContext_defineSystemDataType("float",	cXSFloat);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSGDay(nDay, nTimezone) {
	this.day		= nDay;
	this.timezone	= nTimezone;
};

cXSGDay.prototype	= new cXSAnyAtomicType;
cXSGDay.prototype.builtInKind	= cXSConstants.GDAY_DT;
cXSGDay.prototype.primitiveKind	= cXSAnySimpleType.PRIMITIVE_GDAY;

cXSGDay.prototype.day		= null;
cXSGDay.prototype.timezone	= null;

cXSGDay.prototype.toString	= function() {
	return '-'
			+ '-'
			+ '-' + fXSDateTime_pad(this.day)
			+ fXSDateTime_getTZComponent(this);
};

var rXSGDay		= /^---(0[1-9]|[12]\d|3[01])(Z|([+\-])(0\d|1[0-4]):([0-5]\d))?$/;
cXSGDay.cast	= function(vValue) {
	if (vValue instanceof cXSGDay)
		return vValue;
	if (vValue instanceof cXSString || vValue instanceof cXSUntypedAtomic) {
		var aMatch	= fString_trim(vValue).match(rXSGDay);
		if (aMatch) {
			var nDay	= +aMatch[1];
			return new cXSGDay(	nDay,
								aMatch[2] ? aMatch[2] == 'Z' ? 0 : (aMatch[3] == '-' ? -1 : 1) * (aMatch[4] * 60 + aMatch[5] * 1) : null
			);
		}
		throw new cException("FORG0001");
	}
	if (vValue instanceof cXSDate || vValue instanceof cXSDateTime)
		return new cXSGDay(vValue.day, vValue.timezone);
	//
	throw new cException("XPTY0004"

	);
};

//
fStaticContext_defineSystemDataType("gDay",	cXSGDay);
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSGMonth(nMonth, nTimezone) {
	this.month		= nMonth;
	this.timezone	= nTimezone;
};

cXSGMonth.prototype	= new cXSAnyAtomicType;
cXSGMonth.prototype.builtInKind		= cXSConstants.GMONTH_DT;
cXSGMonth.prototype.primitiveKind	= cXSAnySimpleType.PRIMITIVE_GMONTH;

cXSGMonth.prototype.month		= null;
cXSGMonth.prototype.timezone	= null;

cXSGMonth.prototype.toString	= function() {
	return '-'
			+ '-' + fXSDateTime_pad(this.month)
			+ fXSDateTime_getTZComponent(this);
};

var rXSGMonth	= /^--(0[1-9]|1[0-2])(Z|([+\-])(0\d|1[0-4]):([0-5]\d))?$/;
cXSGMonth.cast	= function(vValue) {
	if (vValue instanceof cXSGMonth)
		return vValue;
	if (vValue instanceof cXSString || vValue instanceof cXSUntypedAtomic) {
		var aMatch	= fString_trim(vValue).match(rXSGMonth);
		if (aMatch) {
			var nMonth	= +aMatch[1];
			return new cXSGMonth(	nMonth,
									aMatch[2] ? aMatch[2] == 'Z' ? 0 : (aMatch[3] == '-' ? -1 : 1) * (aMatch[4] * 60 + aMatch[5] * 1) : null
			);
		}
		throw new cException("FORG0001");
	}
	if (vValue instanceof cXSDate || vValue instanceof cXSDateTime)
		return new cXSGMonth(vValue.month, vValue.timezone);
	//
	throw new cException("XPTY0004"

	);
};

//
fStaticContext_defineSystemDataType("gMonth",	cXSGMonth);
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSGMonthDay(nMonth, nDay, nTimezone) {
	this.month		= nMonth;
	this.day		= nDay;
	this.timezone	= nTimezone;
};

cXSGMonthDay.prototype	= new cXSAnyAtomicType;
cXSGMonthDay.prototype.builtInKind		= cXSConstants.GMONTHDAY_DT;
cXSGMonthDay.prototype.primitiveKind	= cXSAnySimpleType.PRIMITIVE_GMONTHDAY;

cXSGMonthDay.prototype.month	= null;
cXSGMonthDay.prototype.day		= null;
cXSGMonthDay.prototype.timezone	= null;

cXSGMonthDay.prototype.toString	= function() {
	return '-'
			+ '-' + fXSDateTime_pad(this.month)
			+ '-' + fXSDateTime_pad(this.day)
			+ fXSDateTime_getTZComponent(this);
};

var rXSGMonthDay	= /^--(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(Z|([+\-])(0\d|1[0-4]):([0-5]\d))?$/;
cXSGMonthDay.cast	= function(vValue) {
	if (vValue instanceof cXSGMonthDay)
		return vValue;
	if (vValue instanceof cXSString || vValue instanceof cXSUntypedAtomic) {
		var aMatch	= fString_trim(vValue).match(rXSGMonthDay);
		if (aMatch) {
			var nMonth	= +aMatch[1],
				nDay	= +aMatch[2];
			if (nDay - 1 < fXSDate_getDaysForYearMonth(1976, nMonth))
				return new cXSGMonthDay(	nMonth,
											nDay,
											aMatch[3] ? aMatch[3] == 'Z' ? 0 : (aMatch[4] == '-' ? -1 : 1) * (aMatch[5] * 60 + aMatch[6] * 1) : null
				);
			//
			throw new cException("FORG0001"

			);
		}
		throw new cException("FORG0001");
	}
	if (vValue instanceof cXSDate || vValue instanceof cXSDateTime)
		return new cXSGMonthDay(vValue.month, vValue.day, vValue.timezone);
	//
	throw new cException("XPTY0004"

	);
};

//
fStaticContext_defineSystemDataType("gMonthDay",	cXSGMonthDay);
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSGYear(nYear, nTimezone) {
	this.year	= nYear;
	this.timezone	= nTimezone;
};

cXSGYear.prototype	= new cXSAnyAtomicType;
cXSGYear.prototype.builtInKind		= cXSConstants.GYEAR_DT;
cXSGYear.prototype.primitiveKind	= cXSAnySimpleType.PRIMITIVE_GYEAR;

cXSGYear.prototype.year		= null;
cXSGYear.prototype.timezone	= null;

cXSGYear.prototype.toString	= function() {
	return fXSDateTime_pad(this.year)
			+ fXSDateTime_getTZComponent(this);
};

var rXSGYear		= /^-?([1-9]\d\d\d+|0\d\d\d)(Z|([+\-])(0\d|1[0-4]):([0-5]\d))?$/;
cXSGYear.cast	= function(vValue) {
	if (vValue instanceof cXSGYear)
		return vValue;
	if (vValue instanceof cXSString || vValue instanceof cXSUntypedAtomic) {
		var aMatch	= fString_trim(vValue).match(rXSGYear);
		if (aMatch) {
			var nYear	= +aMatch[1];
			return new cXSGYear(	nYear,
									aMatch[2] ? aMatch[2] == 'Z' ? 0 : (aMatch[3] == '-' ? -1 : 1) * (aMatch[4] * 60 + aMatch[5] * 1) : null
			);
		}
		throw new cException("FORG0001");
	}
	if (vValue instanceof cXSDate || vValue instanceof cXSDateTime)
		return new cXSGYear(vValue.year, vValue.timezone);
	//
	throw new cException("XPTY0004"

	);
};

//
fStaticContext_defineSystemDataType("gYear",	cXSGYear);
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSGYearMonth(nYear, nMonth, nTimezone) {
	this.year		= nYear;
	this.month		= nMonth;
	this.timezone	= nTimezone;
};

cXSGYearMonth.prototype	= new cXSAnyAtomicType;
cXSGYearMonth.prototype.builtInKind		= cXSConstants.GYEARMONTH_DT;
cXSGYearMonth.prototype.primitiveKind	= cXSAnySimpleType.PRIMITIVE_GYEARMONTH;

cXSGYearMonth.prototype.year	= null;
cXSGYearMonth.prototype.month	= null;
cXSGYearMonth.prototype.timezone= null;

cXSGYearMonth.prototype.toString	= function() {
	return fXSDateTime_pad(this.year)
			+ '-' + fXSDateTime_pad(this.month)
			+ fXSDateTime_getTZComponent(this);
};

var rXSGYearMonth	= /^-?([1-9]\d\d\d+|0\d\d\d)-(0[1-9]|1[0-2])(Z|([+\-])(0\d|1[0-4]):([0-5]\d))?$/;
cXSGYearMonth.cast	= function(vValue) {
	if (vValue instanceof cXSGYearMonth)
		return vValue;
	if (vValue instanceof cXSString || vValue instanceof cXSUntypedAtomic) {
		var aMatch	= fString_trim(vValue).match(rXSGYearMonth);
		if (aMatch) {
			var nYear	= +aMatch[1],
				nMonth	= +aMatch[2];
			return new cXSGYearMonth(	nYear,
										nMonth,
										aMatch[3] ? aMatch[3] == 'Z' ? 0 : (aMatch[4] == '-' ? -1 : 1) * (aMatch[5] * 60 + aMatch[6] * 1) : null
			);
		}
		throw new cException("FORG0001");
	}
	if (vValue instanceof cXSDate || vValue instanceof cXSDateTime)
		return new cXSGYearMonth(vValue.year, vValue.month, vValue.timezone);
	//
	throw new cException("XPTY0004"

	);
};

//
fStaticContext_defineSystemDataType("gYearMonth",	cXSGYearMonth);
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSHexBinary(sValue) {
	this.value	= sValue;
};

cXSHexBinary.prototype	= new cXSAnyAtomicType;
cXSHexBinary.prototype.builtInKind		= cXSConstants.HEXBINARY_DT;
cXSHexBinary.prototype.primitiveKind	= cXSAnySimpleType.PRIMITIVE_HEXBINARY;

cXSHexBinary.prototype.value	= null;

cXSHexBinary.prototype.valueOf	= function() {
	return this.value;
};

cXSHexBinary.prototype.toString	= function() {
	return this.value;
};

var rXSHexBinary	= /^([0-9a-fA-F]{2})*$/;
cXSHexBinary.cast	= function(vValue) {
	if (vValue instanceof cXSHexBinary)
		return vValue;
	if (vValue instanceof cXSString || vValue instanceof cXSUntypedAtomic) {
		var aMatch	= fString_trim(vValue).match(rXSHexBinary);
		if (aMatch)
			return new cXSHexBinary(aMatch[0].toUpperCase());
		throw new cException("FORG0001");
	}
	if (vValue instanceof cXSBase64Binary) {
		var sValue	= fWindow_atob(vValue.valueOf()),
			aValue	= [];
		for (var nIndex = 0, nLength = sValue.length, sLetter; nIndex < nLength; nIndex++) {
			sLetter = sValue.charCodeAt(nIndex).toString(16);
			aValue.push(new cArray(3 - sLetter.length).join('0') + sLetter);
		}
		return new cXSHexBinary(aValue.join(''));
	}
	//
	throw new cException("XPTY0004"

	);
};

//
fStaticContext_defineSystemDataType("hexBinary",	cXSHexBinary);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSNOTATION() {

};

cXSNOTATION.prototype	= new cXSAnyAtomicType;
cXSNOTATION.prototype.builtInKind	= cXSConstants.NOTATION_DT;
cXSNOTATION.prototype.primitiveKind	= cXSAnySimpleType.PRIMITIVE_NOTATION;

cXSNOTATION.cast	= function(vValue) {
	throw new cException("XPST0017"

	);	//  {http://www.w3.org/2001/XMLSchema}NOTATION
};

//
fStaticContext_defineSystemDataType("NOTATION",	cXSNOTATION);


/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSQName(sPrefix, sLocalName, sNameSpaceURI) {
	this.prefix	= sPrefix;
	this.localName	= sLocalName;
	this.namespaceURI	= sNameSpaceURI;
};

cXSQName.prototype	= new cXSAnyAtomicType;
cXSQName.prototype.builtInKind		= cXSConstants.QNAME_DT;
cXSQName.prototype.primitiveKind	= cXSAnySimpleType.PRIMITIVE_QNAME;

cXSQName.prototype.prefix	= null;
cXSQName.prototype.localName	= null;
cXSQName.prototype.namespaceURI	= null;

cXSQName.prototype.toString	= function() {
	return (this.prefix ? this.prefix + ':' : '') + this.localName;
};

var rXSQName	= /^(?:(?![0-9-])(\w[\w.-]*)\:)?(?![0-9-])(\w[\w.-]*)$/;
cXSQName.cast	= function(vValue) {
	if (vValue instanceof cXSQName)
		return vValue;
	if (vValue instanceof cXSString || vValue instanceof cXSUntypedAtomic) {
		var aMatch	= fString_trim(vValue).match(rXSQName);
		if (aMatch)
			return new cXSQName(aMatch[1] || null, aMatch[2], null);
		throw new cException("FORG0001");
	}
	//
	throw new cException("XPTY0004"

	);
};

//
fStaticContext_defineSystemDataType("QName",	cXSQName);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSString(sValue) {
	this.value	= sValue;
};

cXSString.prototype	= new cXSAnyAtomicType;

cXSString.prototype.value	= null;
cXSString.prototype.builtInKind		= cXSConstants.STRING_DT;
cXSString.prototype.primitiveKind	= cXSAnySimpleType.PRIMITIVE_STRING;

cXSString.prototype.valueOf		= function() {
	return this.value;
};

cXSString.prototype.toString	= function() {
	return this.value;
};

cXSString.cast	= function(vValue) {
	return new cXSString(cString(vValue));
	//
	throw new cException("XPTY0004"

	);
};

//
fStaticContext_defineSystemDataType("string",	cXSString);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSTime(nHours, nMinutes, nSeconds, nTimezone) {
	this.hours	= nHours;
	this.minutes	= nMinutes;
	this.seconds	= nSeconds;
	this.timezone	= nTimezone;
};

cXSTime.prototype	= new cXSAnyAtomicType;
cXSTime.prototype.builtInKind	= cXSConstants.TIME_DT;
cXSTime.prototype.primitiveKind	= cXSAnySimpleType.PRIMITIVE_TIME;

cXSTime.prototype.hours		= null;
cXSTime.prototype.minutes	= null;
cXSTime.prototype.seconds	= null;
cXSTime.prototype.timezone		= null;

cXSTime.prototype.toString	= function() {
	return fXSDateTime_getTimeComponent(this)
			+ fXSDateTime_getTZComponent(this);
};

var rXSTime		= /^(([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(?:\.(\d+))?|(24:00:00)(?:\.(0+))?)(Z|([+\-])(0\d|1[0-4]):([0-5]\d))?$/;
cXSTime.cast	= function(vValue) {
	if (vValue instanceof cXSTime)
		return vValue;
	if (vValue instanceof cXSString || vValue instanceof cXSUntypedAtomic) {
		var aMatch	= fString_trim(vValue).match(rXSTime);
		if (aMatch) {
			var bValue	= !!aMatch[6];
			return new cXSTime(bValue ? 0 : +aMatch[2],
								bValue ? 0 : +aMatch[3],
								cNumber((bValue ? 0 : aMatch[4]) + '.' + (bValue ? 0 : aMatch[5] || 0)),
								aMatch[8] ? aMatch[8] == 'Z' ? 0 : (aMatch[9] == '-' ? -1 : 1) * (aMatch[10] * 60 + aMatch[11] * 1) : null
			);
		}
		throw new cException("FORG0001");
	}
	if (vValue instanceof cXSDateTime)
		return new cXSTime(vValue.hours, vValue.minutes, vValue.seconds, vValue.timezone);
	//
	throw new cException("XPTY0004"

	);
};

//
function fXSTime_normalize(oValue) {
	//
	if (oValue.seconds >= 60 || oValue.seconds < 0) {
		oValue.minutes	+= ~~(oValue.seconds / 60) - (oValue.seconds < 0 && oValue.seconds % 60 ? 1 : 0);
		oValue.seconds	= oValue.seconds % 60 + (oValue.seconds < 0 && oValue.seconds % 60 ? 60 : 0);
	}
	//
	if (oValue.minutes >= 60 || oValue.minutes < 0) {
		oValue.hours	+= ~~(oValue.minutes / 60) - (oValue.minutes < 0 && oValue.minutes % 60 ? 1 : 0);
		oValue.minutes	= oValue.minutes % 60 + (oValue.minutes < 0 && oValue.minutes % 60 ? 60 : 0);
	}
	//
	if (oValue.hours >= 24 || oValue.hours < 0) {
		if (oValue instanceof cXSDateTime)
			oValue.day		+= ~~(oValue.hours / 24) - (oValue.hours < 0 && oValue.hours % 24 ? 1 : 0);
		oValue.hours	= oValue.hours % 24 + (oValue.hours < 0 && oValue.hours % 24 ? 24 : 0);
	}
	//
	return oValue;
};

//
fStaticContext_defineSystemDataType("time",	cXSTime);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSUntypedAtomic(sValue) {
	this.value	= sValue;
};

cXSUntypedAtomic.prototype	= new cXSAnyAtomicType;
cXSUntypedAtomic.prototype.builtInKind	= cXSConstants.XT_UNTYPEDATOMIC_DT;

cXSUntypedAtomic.prototype.toString	= function() {
	return cString(this.value);
};

cXSUntypedAtomic.cast	= function(vValue) {
	if (vValue instanceof cXSUntypedAtomic)
		return vValue;

	return new cXSUntypedAtomic(cString(vValue));
	//
	throw new cException("XPTY0004"

	);
};

//
fStaticContext_defineSystemDataType("untypedAtomic",	cXSUntypedAtomic);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSYearMonthDuration(nYear, nMonth, bNegative) {
	cXSDuration.call(this, nYear, nMonth, 0, 0, 0, 0, bNegative);
};

cXSYearMonthDuration.prototype	= new cXSDuration;
cXSYearMonthDuration.prototype.builtInKind	= cXSConstants.XT_YEARMONTHDURATION_DT;

cXSYearMonthDuration.prototype.toString	= function() {
	return (this.negative ? '-' : '') + 'P'
			+ (fXSDuration_getYearMonthComponent(this) || '0M');
};

var rXSYearMonthDuration	= /^(-)?P(?:([0-9]+)Y)?(?:([0-9]+)M)?$/;
cXSYearMonthDuration.cast	= function(vValue) {
	if (vValue instanceof cXSYearMonthDuration)
		return vValue;
	if (vValue instanceof cXSString || vValue instanceof cXSUntypedAtomic) {
		var aMatch	= fString_trim(vValue).match(rXSYearMonthDuration);
		if (aMatch)
			return fXSYearMonthDuration_normalize(new cXSYearMonthDuration(+aMatch[2] || 0, +aMatch[3] || 0, aMatch[1] == '-'));
		throw new cException("FORG0001");
	}
	if (vValue instanceof cXSDayTimeDuration)
		return new cXSYearMonthDuration(0, 0);
	if (vValue instanceof cXSDuration)
		return new cXSYearMonthDuration(vValue.year, vValue.month, vValue.negative);
	//
	throw new cException("XPTY0004"

	);
};

//
function fXSYearMonthDuration_normalize(oDuration) {
	if (oDuration.month >= 12) {
		oDuration.year	+= ~~(oDuration.month / 12);
		oDuration.month	%= 12;
	}
	return oDuration;
};

//
fStaticContext_defineSystemDataType("yearMonthDuration",	cXSYearMonthDuration);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSDayTimeDuration(nDay, nHours, nMinutes, nSeconds, bNegative) {
	cXSDuration.call(this, 0, 0, nDay, nHours, nMinutes, nSeconds, bNegative);
};

cXSDayTimeDuration.prototype	= new cXSDuration;
cXSDayTimeDuration.prototype.builtInKind	= cXSConstants.DAYTIMEDURATION_DT;

cXSDayTimeDuration.prototype.toString	= function() {
	return (this.negative ? '-' : '') + 'P'
			+ (fXSDuration_getDayTimeComponent(this) || 'T0S');
};

var rXSDayTimeDuration	= /^(-)?P(?:([0-9]+)D)?(?:T(?:([0-9]+)H)?(?:([0-9]+)M)?(?:((?:(?:[0-9]+(?:.[0-9]*)?)|(?:.[0-9]+)))S)?)?$/;
cXSDayTimeDuration.cast	= function(vValue) {
	if (vValue instanceof cXSDayTimeDuration)
		return vValue;
	if (vValue instanceof cXSString || vValue instanceof cXSUntypedAtomic) {
		var aMatch	= fString_trim(vValue).match(rXSDayTimeDuration);
		if (aMatch)
			return fXSDayTimeDuration_normalize(new cXSDayTimeDuration(+aMatch[2] || 0, +aMatch[3] || 0, +aMatch[4] || 0, +aMatch[5] || 0, aMatch[1] == '-'));
		throw new cException("FORG0001");
	}
	if (vValue instanceof cXSYearMonthDuration)
		return new cXSDayTimeDuration(0, 0, 0, 0);
	if (vValue instanceof cXSDuration)
		return new cXSDayTimeDuration(vValue.day, vValue.hours, vValue.minutes, vValue.seconds, vValue.negative);
	//
	throw new cException("XPTY0004"

	);
};

// Utilities
function fXSDayTimeDuration_normalize(oDuration) {
	if (oDuration.seconds >= 60) {
		oDuration.minutes	+= ~~(oDuration.seconds / 60);
		oDuration.seconds	%= 60;
	}
	if (oDuration.minutes >= 60) {
		oDuration.hours		+= ~~(oDuration.minutes / 60);
		oDuration.minutes	%= 60;
	}
	if (oDuration.hours >= 24) {
		oDuration.day		+= ~~(oDuration.hours / 24);
		oDuration.hours		%= 24;
	}
	return oDuration;
};

//
fStaticContext_defineSystemDataType("dayTimeDuration",	cXSDayTimeDuration);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSInteger(nValue) {
	this.value	= nValue;
};

cXSInteger.prototype	= new cXSDecimal;
cXSInteger.prototype.builtInKind	= cXSConstants.INTEGER_DT;

var rXSInteger	= /^[-+]?[0-9]+$/;
cXSInteger.cast	= function(vValue) {
	if (vValue instanceof cXSInteger)
		return new cXSInteger(vValue.value);
	if (vValue instanceof cXSString || vValue instanceof cXSUntypedAtomic) {
		var aMatch	= fString_trim(vValue).match(rXSInteger);
		if (aMatch)
			return new cXSInteger(+vValue);
		throw new cException("FORG0001");
	}
	if (vValue instanceof cXSBoolean)
		return new cXSInteger(vValue * 1);
	if (fXSAnyAtomicType_isNumeric(vValue)) {
		if (!fIsNaN(vValue) && fIsFinite(vValue))
			return new cXSInteger(+vValue);
		throw new cException("FOCA0002"

		);
	}
	//
	throw new cException("XPTY0004"

	);
};

//
fStaticContext_defineSystemDataType("integer",	cXSInteger);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSNonPositiveInteger(nValue) {
	this.value	= nValue;
};

cXSNonPositiveInteger.prototype	= new cXSInteger;
cXSNonPositiveInteger.prototype.builtInKind	= cXSConstants.NONPOSITIVEINTEGER_DT;

cXSNonPositiveInteger.cast	= function(vValue) {
	var oValue;
	try {
		oValue	= cXSInteger.cast(vValue);
	}
	catch (oError) {
		throw oError;
	}
	// facet validation
	if (oValue.value <= 0)
		return new cXSNonPositiveInteger(oValue.value);
	//
	throw new cException("FORG0001");
};

//
fStaticContext_defineSystemDataType("nonPositiveInteger",	cXSNonPositiveInteger);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSNegativeInteger(nValue) {
	this.value	= nValue;
};

cXSNegativeInteger.prototype	= new cXSNonPositiveInteger;
cXSNegativeInteger.prototype.builtInKind	= cXSConstants.NEGATIVEINTEGER_DT;

cXSNegativeInteger.cast	= function(vValue) {
	var oValue;
	try {
		oValue	= cXSInteger.cast(vValue);
	}
	catch (oError) {
		throw oError;
	}
	// facet validation
	if (oValue.value <= -1)
		return new cXSNegativeInteger(oValue.value);
	//
	throw new cException("FORG0001");
};

//
fStaticContext_defineSystemDataType("negativeInteger",	cXSNegativeInteger);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSLong(nValue) {
	this.value	= nValue;
};

cXSLong.prototype	= new cXSInteger;
cXSLong.prototype.builtInKind	= cXSConstants.LONG_DT;

cXSLong.cast	= function(vValue) {
	var oValue;
	try {
		oValue	= cXSInteger.cast(vValue);
	}
	catch (oError) {
		throw oError;
	}
	// facet validation
	if (oValue.value <= 9223372036854775807 && oValue.value >= -9223372036854775808)
		return new cXSLong(oValue.value);
	//
	throw new cException("FORG0001");
};

//
fStaticContext_defineSystemDataType("long",	cXSLong);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSInt(nValue) {
	this.value	= nValue;
};

cXSInt.prototype	= new cXSLong;
cXSInt.prototype.builtInKind	= cXSConstants.INT_DT;

cXSInt.cast	= function(vValue) {
	var oValue;
	try {
		oValue	= cXSInteger.cast(vValue);
	}
	catch (oError) {
		throw oError;
	}
	// facet validation
	if (oValue.value <= 2147483647 && oValue.value >= -2147483648)
		return new cXSInt(oValue.value);
	//
	throw new cException("FORG0001");
};

//
fStaticContext_defineSystemDataType("int",	cXSInt);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSShort(nValue) {
	this.value	= nValue;
};

cXSShort.prototype	= new cXSInt;
cXSShort.prototype.builtInKind	= cXSConstants.SHORT_DT;

cXSShort.cast	= function(vValue) {
	var oValue;
	try {
		oValue	= cXSInteger.cast(vValue);
	}
	catch (oError) {
		throw oError;
	}
	// facet validation
	if (oValue.value <= 32767 && oValue.value >= -32768)
		return new cXSShort(oValue.value);
	//
	throw new cException("FORG0001");
};

//
fStaticContext_defineSystemDataType("short",	cXSShort);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSByte(nValue) {
	this.value	= nValue;
};

cXSByte.prototype	= new cXSShort;
cXSByte.prototype.builtInKind	= cXSConstants.BYTE_DT;

cXSByte.cast	= function(vValue) {
	var oValue;
	try {
		oValue	= cXSInteger.cast(vValue);
	}
	catch (oError) {
		throw oError;
	}
	// facet validation
	if (oValue.value <= 127 && oValue.value >= -128)
		return new cXSByte(oValue.value);
	//
	throw new cException("FORG0001");
};

//
fStaticContext_defineSystemDataType("byte",	cXSByte);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSNonNegativeInteger(nValue) {
	this.value	= nValue;
};

cXSNonNegativeInteger.prototype	= new cXSInteger;
cXSNonNegativeInteger.prototype.builtInKind	= cXSConstants.NONNEGATIVEINTEGER_DT;

cXSNonNegativeInteger.cast	= function(vValue) {
	var oValue;
	try {
		oValue	= cXSInteger.cast(vValue);
	}
	catch (oError) {
		throw oError;
	}
	// facet validation
	if (oValue.value >= 0)
		return new cXSNonNegativeInteger(oValue.value);
	//
	throw new cException("FORG0001");
};

//
fStaticContext_defineSystemDataType("nonNegativeInteger",	cXSNonNegativeInteger);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSPositiveInteger(nValue) {
	this.value	= nValue;
};

cXSPositiveInteger.prototype	= new cXSNonNegativeInteger;
cXSPositiveInteger.prototype.builtInKind	= cXSConstants.POSITIVEINTEGER_DT;

cXSPositiveInteger.cast	= function(vValue) {
	var oValue;
	try {
		oValue	= cXSInteger.cast(vValue);
	}
	catch (oError) {
		throw oError;
	}
	// facet validation
	if (oValue.value >= 1)
		return new cXSPositiveInteger(oValue.value);
	//
	throw new cException("FORG0001");
};

//
fStaticContext_defineSystemDataType("positiveInteger",	cXSPositiveInteger);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSUnsignedLong(nValue) {
	this.value	= nValue;
};

cXSUnsignedLong.prototype	= new cXSNonNegativeInteger;
cXSUnsignedLong.prototype.builtInKind	= cXSConstants.UNSIGNEDLONG_DT;

cXSUnsignedLong.cast	= function(vValue) {
	var oValue;
	try {
		oValue	= cXSInteger.cast(vValue);
	}
	catch (oError) {
		throw oError;
	}
	// facet validation
	if (oValue.value >= 1 && oValue.value <= 18446744073709551615)
		return new cXSUnsignedLong(oValue.value);
	//
	throw new cException("FORG0001");
};

//
fStaticContext_defineSystemDataType("unsignedLong",	cXSUnsignedLong);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSUnsignedInt(nValue) {
	this.value	= nValue;
};

cXSUnsignedInt.prototype	= new cXSNonNegativeInteger;
cXSUnsignedInt.prototype.builtInKind	= cXSConstants.UNSIGNEDINT_DT;

cXSUnsignedInt.cast	= function(vValue) {
	var oValue;
	try {
		oValue	= cXSInteger.cast(vValue);
	}
	catch (oError) {
		throw oError;
	}
	// facet validation
	if (oValue.value >= 1 && oValue.value <= 4294967295)
		return new cXSUnsignedInt(oValue.value);
	//
	throw new cException("FORG0001");
};

//
fStaticContext_defineSystemDataType("unsignedInt",	cXSUnsignedInt);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSUnsignedShort(nValue) {
	this.value	= nValue;
};

cXSUnsignedShort.prototype	= new cXSUnsignedInt;
cXSUnsignedShort.prototype.builtInKind	= cXSConstants.UNSIGNEDSHORT_DT;

cXSUnsignedShort.cast	= function(vValue) {
	var oValue;
	try {
		oValue	= cXSInteger.cast(vValue);
	}
	catch (oError) {
		throw oError;
	}
	// facet validation
	if (oValue.value >= 1 && oValue.value <= 65535)
		return new cXSUnsignedShort(oValue.value);
	//
	throw new cException("FORG0001");
};

//
fStaticContext_defineSystemDataType("unsignedShort",	cXSUnsignedShort);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSUnsignedByte(nValue) {
	this.value	= nValue;
};

cXSUnsignedByte.prototype	= new cXSUnsignedShort;
cXSUnsignedByte.prototype.builtInKind	= cXSConstants.UNSIGNEDBYTE_DT;

cXSUnsignedByte.cast	= function(vValue) {
	var oValue;
	try {
		oValue	= cXSInteger.cast(vValue);
	}
	catch (oError) {
		throw oError;
	}
	// facet validation
	if (oValue.value >= 1 && oValue.value <= 255)
		return new cXSUnsignedByte(oValue.value);
	//
	throw new cException("FORG0001");
};

//
fStaticContext_defineSystemDataType("unsignedByte",	cXSUnsignedByte);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSNormalizedString(sValue) {
	this.value	= sValue;
};

cXSNormalizedString.prototype	= new cXSString;
cXSNormalizedString.prototype.builtInKind	= cXSConstants.NORMALIZEDSTRING_DT;

cXSNormalizedString.cast	= function(vValue) {
	return new cXSNormalizedString(cString(vValue));
};

//
fStaticContext_defineSystemDataType("normalizedString",	cXSNormalizedString);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSToken(sValue) {
	this.value	= sValue;
};

cXSToken.prototype	= new cXSNormalizedString;
cXSToken.prototype.builtInKind	= cXSConstants.TOKEN_DT;

cXSToken.cast	= function(vValue) {
	return new cXSToken(cString(vValue));
};

//
fStaticContext_defineSystemDataType("token",	cXSToken);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSName(sValue) {
	this.value	= sValue;
};

cXSName.prototype	= new cXSToken;
cXSName.prototype.builtInKind	= cXSConstants.NAME_DT;

cXSName.cast	= function(vValue) {
	return new cXSName(cString(vValue));
};

//
fStaticContext_defineSystemDataType("Name",	cXSName);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSNCName(sValue) {
	this.value	= sValue;
};

cXSNCName.prototype	= new cXSName;
cXSNCName.prototype.builtInKind	= cXSConstants.NCNAME_DT;

cXSNCName.cast	= function(vValue) {
	return new cXSNCName(cString(vValue));
};

//
fStaticContext_defineSystemDataType("NCName",	cXSNCName);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSENTITY(sValue) {
	this.value	= sValue;
};

cXSENTITY.prototype	= new cXSNCName;
cXSENTITY.prototype.builtInKind	= cXSConstants.ENTITY_DT;

cXSENTITY.cast	= function(vValue) {
	return new cXSENTITY(cString(vValue));
};

//
fStaticContext_defineSystemDataType("ENTITY",	cXSENTITY);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSID(sValue) {
	this.value	= sValue;
};

cXSID.prototype	= new cXSNCName;
cXSID.prototype.builtInKind	= cXSConstants.ID_DT;

cXSID.cast	= function(vValue) {
	return new cXSID(cString(vValue));
};

//
fStaticContext_defineSystemDataType("ID",	cXSID);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSIDREF(sValue) {
	this.value	= sValue;
};

cXSIDREF.prototype	= new cXSNCName;
cXSIDREF.prototype.builtInKind	= cXSConstants.IDREF_DT;

cXSIDREF.cast	= function(vValue) {
	return new cXSIDREF(cString(vValue));
};

//
fStaticContext_defineSystemDataType("IDREF",	cXSIDREF);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSLanguage(sValue) {
	this.value	= sValue;
};

cXSLanguage.prototype	= new cXSToken;
cXSLanguage.prototype.builtInKind	= cXSConstants.LANGUAGE_DT;

cXSLanguage.cast	= function(vValue) {
	return new cXSLanguage(cString(vValue));
};

//
fStaticContext_defineSystemDataType("language",	cXSLanguage);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXSNMTOKEN(sValue) {
	this.value	= sValue;
};

cXSNMTOKEN.prototype	= new cXSToken;
cXSNMTOKEN.prototype.builtInKind	= cXSConstants.NMTOKEN_DT;

cXSNMTOKEN.cast	= function(vValue) {
	return new cXSNMTOKEN(cString(vValue));
};

//
fStaticContext_defineSystemDataType("NMTOKEN",	cXSNMTOKEN);

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXTItem() {

};

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXTNode() {

};

cXTNode.prototype	= new cXTItem;


/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXTAttribute() {

};

cXTAttribute.prototype	= new cXTNode;
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXTComment() {

};

cXTComment.prototype	= new cXTNode;
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXTDocument() {

};

cXTDocument.prototype	= new cXTNode;
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXTElement() {

};

cXTElement.prototype	= new cXTNode;
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXTProcessingInstruction() {

};

cXTProcessingInstruction.prototype	= new cXTNode;
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

function cXTText() {

};

cXTText.prototype	= new cXTNode;
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

/*
	12.1 Comparisons of base64Binary and hexBinary Values
		op:hexBinary-equal
		op:base64Binary-equal
*/
hStaticContext_operators["hexBinary-equal"]	= function(oLeft, oRight) {
	return new cXSBoolean(oLeft.valueOf() == oRight.valueOf());
};

hStaticContext_operators["base64Binary-equal"]	= function(oLeft, oRight) {
	return new cXSBoolean(oLeft.valueOf() == oRight.valueOf());
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

/*
	9.2 Operators on Boolean Values
		op:boolean-equal
		op:boolean-less-than
		op:boolean-greater-than
*/

// 9.2 Operators on Boolean Values
// op:boolean-equal($value1 as xs:boolean, $value2 as xs:boolean) as xs:boolean
hStaticContext_operators["boolean-equal"]	= function(oLeft, oRight) {
	return new cXSBoolean(oLeft.valueOf() == oRight.valueOf());
};

// op:boolean-less-than($arg1 as xs:boolean, $arg2 as xs:boolean) as xs:boolean
hStaticContext_operators["boolean-less-than"]	= function(oLeft, oRight) {
	return new cXSBoolean(oLeft.valueOf() < oRight.valueOf());
};

// op:boolean-greater-than($arg1 as xs:boolean, $arg2 as xs:boolean) as xs:boolean
hStaticContext_operators["boolean-greater-than"]	= function(oLeft, oRight) {
	return new cXSBoolean(oLeft.valueOf() > oRight.valueOf());
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

/*
	10.4 Comparison Operators on Duration, Date and Time Values
		op:yearMonthDuration-less-than
		op:yearMonthDuration-greater-than
		op:dayTimeDuration-less-than
		op:dayTimeDuration-greater-than
		op:duration-equal
		op:dateTime-equal
		op:dateTime-less-than
		op:dateTime-greater-than
		op:date-equal
		op:date-less-than
		op:date-greater-than
		op:time-equal
		op:time-less-than
		op:time-greater-than
		op:gYearMonth-equal
		op:gYear-equal
		op:gMonthDay-equal
		op:gMonth-equal
		op:gDay-equal

	10.6 Arithmetic Operators on Durations
		op:add-yearMonthDurations
		op:subtract-yearMonthDurations
		op:multiply-yearMonthDuration
		op:divide-yearMonthDuration
		op:divide-yearMonthDuration-by-yearMonthDuration
		op:add-dayTimeDurations
		op:subtract-dayTimeDurations
		op:multiply-dayTimeDuration
		op:divide-dayTimeDuration
		op:divide-dayTimeDuration-by-dayTimeDuration


	10.8 Arithmetic Operators on Durations, Dates and Times
		op:subtract-dateTimes
		op:subtract-dates
		op:subtract-times
		op:add-yearMonthDuration-to-dateTime
		op:add-dayTimeDuration-to-dateTime
		op:subtract-yearMonthDuration-from-dateTime
		op:subtract-dayTimeDuration-from-dateTime
		op:add-yearMonthDuration-to-date
		op:add-dayTimeDuration-to-date
		op:subtract-yearMonthDuration-from-date
		op:subtract-dayTimeDuration-from-date
		op:add-dayTimeDuration-to-time
		op:subtract-dayTimeDuration-from-time

*/

// 10.4 Comparison Operators on Duration, Date and Time Values
// op:yearMonthDuration-less-than($arg1 as xs:yearMonthDuration, $arg2 as xs:yearMonthDuration) as xs:boolean
hStaticContext_operators["yearMonthDuration-less-than"]	= function(oLeft, oRight) {
	return new cXSBoolean(fOperator_yearMonthDuration_toMonths(oLeft) < fOperator_yearMonthDuration_toMonths(oRight));
};

// op:yearMonthDuration-greater-than($arg1 as xs:yearMonthDuration, $arg2 as xs:yearMonthDuration) as xs:boolean
hStaticContext_operators["yearMonthDuration-greater-than"]	= function(oLeft, oRight) {
	return new cXSBoolean(fOperator_yearMonthDuration_toMonths(oLeft) > fOperator_yearMonthDuration_toMonths(oRight));
};

// op:dayTimeDuration-less-than($arg1 as dayTimeDuration, $arg2 as dayTimeDuration) as xs:boolean
hStaticContext_operators["dayTimeDuration-less-than"]	= function(oLeft, oRight) {
	return new cXSBoolean(fOperator_dayTimeDuration_toSeconds(oLeft) < fOperator_dayTimeDuration_toSeconds(oRight));
};

// op:dayTimeDuration-greater-than($arg1 as dayTimeDuration, $arg2 as dayTimeDuration) as xs:boolean
hStaticContext_operators["dayTimeDuration-greater-than"]	= function(oLeft, oRight) {
	return new cXSBoolean(fOperator_dayTimeDuration_toSeconds(oLeft) > fOperator_dayTimeDuration_toSeconds(oRight));
};

// op:duration-equal($arg1 as xs:duration, $arg2 as xs:duration) as xs:boolean
hStaticContext_operators["duration-equal"]	= function(oLeft, oRight) {
	return new cXSBoolean(oLeft.negative == oRight.negative
			&& fOperator_yearMonthDuration_toMonths(oLeft) == fOperator_yearMonthDuration_toMonths(oRight)
			&& fOperator_dayTimeDuration_toSeconds(oLeft) == fOperator_dayTimeDuration_toSeconds(oRight));
};

// op:dateTime-equal($arg1 as xs:dateTime, $arg2 as xs:dateTime) as xs:boolean
hStaticContext_operators["dateTime-equal"]	= function(oLeft, oRight) {
	return fOperator_compareDateTimes(oLeft, oRight, 'eq');
};

// op:dateTime-less-than($arg1 as xs:dateTime, $arg2 as xs:dateTime) as xs:boolean
hStaticContext_operators["dateTime-less-than"]	= function(oLeft, oRight) {
	return fOperator_compareDateTimes(oLeft, oRight, 'lt');
};

//op:dateTime-greater-than($arg1 as xs:dateTime, $arg2 as xs:dateTime) as xs:boolean
hStaticContext_operators["dateTime-greater-than"]	= function(oLeft, oRight) {
	return fOperator_compareDateTimes(oLeft, oRight, 'gt');
};

// op:date-equal($arg1 as xs:date, $arg2 as xs:date) as xs:boolean
hStaticContext_operators["date-equal"]	= function(oLeft, oRight) {
	return fOperator_compareDates(oLeft, oRight, 'eq');
};

// op:date-less-than($arg1 as xs:date, $arg2 as xs:date) as xs:boolean
hStaticContext_operators["date-less-than"]	= function(oLeft, oRight) {
	return fOperator_compareDates(oLeft, oRight, 'lt');
};

// op:date-greater-than($arg1 as xs:date, $arg2 as xs:date) as xs:boolean
hStaticContext_operators["date-greater-than"]	= function(oLeft, oRight) {
	return fOperator_compareDates(oLeft, oRight, 'gt');
};

// op:time-equal($arg1 as xs:time, $arg2 as xs:time) as xs:boolean
hStaticContext_operators["time-equal"]	= function(oLeft, oRight) {
	return fOperator_compareTimes(oLeft, oRight, 'eq');
};

// op:time-less-than($arg1 as xs:time, $arg2 as xs:time) as xs:boolean
hStaticContext_operators["time-less-than"]	= function(oLeft, oRight) {
	return fOperator_compareTimes(oLeft, oRight, 'lt');
};

// op:time-greater-than($arg1 as xs:time, $arg2 as xs:time) as xs:boolean
hStaticContext_operators["time-greater-than"]	= function(oLeft, oRight) {
	return fOperator_compareTimes(oLeft, oRight, 'gt');
};

// op:gYearMonth-equal($arg1 as xs:gYearMonth, $arg2 as xs:gYearMonth) as xs:boolean
hStaticContext_operators["gYearMonth-equal"]	= function(oLeft, oRight) {
	return fOperator_compareDateTimes(
			new cXSDateTime(oLeft.year, oLeft.month, fXSDate_getDaysForYearMonth(oLeft.year, oLeft.month), 0, 0, 0, oLeft.timezone == null ? this.timezone : oLeft.timezone),
			new cXSDateTime(oRight.year, oRight.month, fXSDate_getDaysForYearMonth(oRight.year, oRight.month), 0, 0, 0, oRight.timezone == null ? this.timezone : oRight.timezone),
			'eq'
	);
};

// op:gYear-equal($arg1 as xs:gYear, $arg2 as xs:gYear) as xs:boolean
hStaticContext_operators["gYear-equal"]	= function(oLeft, oRight) {
	return fOperator_compareDateTimes(
			new cXSDateTime(oLeft.year, 1, 1, 0, 0, 0, oLeft.timezone == null ? this.timezone : oLeft.timezone),
			new cXSDateTime(oRight.year, 1, 1, 0, 0, 0, oRight.timezone == null ? this.timezone : oRight.timezone),
			'eq'
	);
};

// op:gMonthDay-equal($arg1 as xs:gMonthDay, $arg2 as xs:gMonthDay) as xs:boolean
hStaticContext_operators["gMonthDay-equal"]	= function(oLeft, oRight) {
	return fOperator_compareDateTimes(
			new cXSDateTime(1972, oLeft.month, oLeft.day, 0, 0, 0, oLeft.timezone == null ? this.timezone : oLeft.timezone),
			new cXSDateTime(1972, oRight.month, oRight.day, 0, 0, 0, oRight.timezone == null ? this.timezone : oRight.timezone),
			'eq'
	);
};

// op:gMonth-equal($arg1 as xs:gMonth, $arg2 as xs:gMonth) as xs:boolean
hStaticContext_operators["gMonth-equal"]	= function(oLeft, oRight) {
	return fOperator_compareDateTimes(
			new cXSDateTime(1972, oLeft.month, fXSDate_getDaysForYearMonth(1972, oRight.month), 0, 0, 0, oLeft.timezone == null ? this.timezone : oLeft.timezone),
			new cXSDateTime(1972, oRight.month, fXSDate_getDaysForYearMonth(1972, oRight.month), 0, 0, 0, oRight.timezone == null ? this.timezone : oRight.timezone),
			'eq'
	);
};

// op:gDay-equal($arg1 as xs:gDay, $arg2 as xs:gDay) as xs:boolean
hStaticContext_operators["gDay-equal"]	= function(oLeft, oRight) {
	return fOperator_compareDateTimes(
			new cXSDateTime(1972, 12, oLeft.day, 0, 0, 0, oLeft.timezone == null ? this.timezone : oLeft.timezone),
			new cXSDateTime(1972, 12, oRight.day, 0, 0, 0, oRight.timezone == null ? this.timezone : oRight.timezone),
			'eq'
	);
};

// 10.6 Arithmetic Operators on Durations
// op:add-yearMonthDurations($arg1 as xs:yearMonthDuration, $arg2 as xs:yearMonthDuration) as xs:yearMonthDuration
hStaticContext_operators["add-yearMonthDurations"]	= function(oLeft, oRight) {
	return fOperator_yearMonthDuration_fromMonths(fOperator_yearMonthDuration_toMonths(oLeft) + fOperator_yearMonthDuration_toMonths(oRight));
};

// op:subtract-yearMonthDurations($arg1 as xs:yearMonthDuration, $arg2 as xs:yearMonthDuration) as xs:yearMonthDuration
hStaticContext_operators["subtract-yearMonthDurations"]	= function(oLeft, oRight) {
	return fOperator_yearMonthDuration_fromMonths(fOperator_yearMonthDuration_toMonths(oLeft) - fOperator_yearMonthDuration_toMonths(oRight));
};

// op:multiply-yearMonthDuration($arg1 as xs:yearMonthDuration, $arg2 as xs:double) as xs:yearMonthDuration
hStaticContext_operators["multiply-yearMonthDuration"]	= function(oLeft, oRight) {
	return fOperator_yearMonthDuration_fromMonths(fOperator_yearMonthDuration_toMonths(oLeft) * oRight);
};

// op:divide-yearMonthDuration($arg1 as xs:yearMonthDuration, $arg2 as xs:double) as xs:yearMonthDuration
hStaticContext_operators["divide-yearMonthDuration"]	= function(oLeft, oRight) {
	return fOperator_yearMonthDuration_fromMonths(fOperator_yearMonthDuration_toMonths(oLeft) / oRight);
};

// op:divide-yearMonthDuration-by-yearMonthDuration($arg1 as xs:yearMonthDuration, $arg2 as xs:yearMonthDuration) as xs:decimal
hStaticContext_operators["divide-yearMonthDuration-by-yearMonthDuration"]	= function(oLeft, oRight) {
	return new cXSDecimal(fOperator_yearMonthDuration_toMonths(oLeft) / fOperator_yearMonthDuration_toMonths(oRight));
};

// op:add-dayTimeDurations($arg1 as xs:dayTimeDuration, $arg2 as xs:dayTimeDuration) as xs:dayTimeDuration
hStaticContext_operators["add-dayTimeDurations"]	= function(oLeft, oRight) {
	return fOperator_dayTimeDuration_fromSeconds(fOperator_dayTimeDuration_toSeconds(oLeft) + fOperator_dayTimeDuration_toSeconds(oRight));
};

// op:subtract-dayTimeDurations($arg1 as xs:dayTimeDuration, $arg2 as xs:dayTimeDuration) as xs:dayTimeDuration
hStaticContext_operators["subtract-dayTimeDurations"]	= function(oLeft, oRight) {
	return fOperator_dayTimeDuration_fromSeconds(fOperator_dayTimeDuration_toSeconds(oLeft) - fOperator_dayTimeDuration_toSeconds(oRight));
};

// op:multiply-dayTimeDurations($arg1 as xs:dayTimeDuration, $arg2 as xs:double) as xs:dayTimeDuration
hStaticContext_operators["multiply-dayTimeDuration"]	= function(oLeft, oRight) {
	return fOperator_dayTimeDuration_fromSeconds(fOperator_dayTimeDuration_toSeconds(oLeft) * oRight);
};

// op:divide-dayTimeDurations($arg1 as xs:dayTimeDuration, $arg2 as xs:double) as xs:dayTimeDuration
hStaticContext_operators["divide-dayTimeDuration"]	= function(oLeft, oRight) {
	return fOperator_dayTimeDuration_fromSeconds(fOperator_dayTimeDuration_toSeconds(oLeft) / oRight);
};

// op:divide-dayTimeDuration-by-dayTimeDuration($arg1 as xs:dayTimeDuration, $arg2 as xs:dayTimeDuration) as xs:decimal
hStaticContext_operators["divide-dayTimeDuration-by-dayTimeDuration"]	= function(oLeft, oRight) {
	return new cXSDecimal(fOperator_dayTimeDuration_toSeconds(oLeft) / fOperator_dayTimeDuration_toSeconds(oRight));
};

// 10.8 Arithmetic Operators on Durations, Dates and Times
// op:subtract-dateTimes($arg1 as xs:dateTime, $arg2 as xs:dateTime) as xs:dayTimeDuration
hStaticContext_operators["subtract-dateTimes"]	= function(oLeft, oRight) {
	return fOperator_dayTimeDuration_fromSeconds(fOperator_dateTime_toSeconds(oLeft) - fOperator_dateTime_toSeconds(oRight));
};

// op:subtract-dates($arg1 as xs:date, $arg2 as xs:date) as xs:dayTimeDuration
hStaticContext_operators["subtract-dates"]	= function(oLeft, oRight) {
	return fOperator_dayTimeDuration_fromSeconds(fOperator_dateTime_toSeconds(oLeft) - fOperator_dateTime_toSeconds(oRight));
};

// op:subtract-times($arg1 as xs:time, $arg2 as xs:time) as xs:dayTimeDuration
hStaticContext_operators["subtract-times"]	= function(oLeft, oRight) {
	return fOperator_dayTimeDuration_fromSeconds(fOperator_time_toSeconds(oLeft) - fOperator_time_toSeconds(oRight));
};

// op:add-yearMonthDuration-to-dateTime($arg1 as xs:dateTime, $arg2 as xs:yearMonthDuration) as xs:dateTime
hStaticContext_operators["add-yearMonthDuration-to-dateTime"]	= function(oLeft, oRight) {
	return fOperator_addYearMonthDuration2DateTime(oLeft, oRight, '+');
};

// op:add-dayTimeDuration-to-dateTime($arg1 as xs:dateTime, $arg2 as xs:dayTimeDuration) as xs:dateTime
hStaticContext_operators["add-dayTimeDuration-to-dateTime"]	= function(oLeft, oRight) {
	return fOperator_addDayTimeDuration2DateTime(oLeft, oRight, '+');
};

// op:subtract-yearMonthDuration-from-dateTime($arg1 as xs:dateTime, $arg2 as xs:yearMonthDuration) as xs:dateTime
hStaticContext_operators["subtract-yearMonthDuration-from-dateTime"]	= function(oLeft, oRight) {
	return fOperator_addYearMonthDuration2DateTime(oLeft, oRight, '-');
};

// op:subtract-dayTimeDuration-from-dateTime($arg1 as xs:dateTime, $arg2 as xs:dayTimeDuration) as xs:dateTime
hStaticContext_operators["subtract-dayTimeDuration-from-dateTime"]	= function(oLeft, oRight) {
	return fOperator_addDayTimeDuration2DateTime(oLeft, oRight, '-');
};

// op:add-yearMonthDuration-to-date($arg1 as xs:date, $arg2 as xs:yearMonthDuration) as xs:date
hStaticContext_operators["add-yearMonthDuration-to-date"]	= function(oLeft, oRight) {
	return fOperator_addYearMonthDuration2DateTime(oLeft, oRight, '+');
};

// op:add-dayTimeDuration-to-date($arg1 as xs:date, $arg2 as xs:dayTimeDuration) as xs:date
hStaticContext_operators["add-dayTimeDuration-to-date"]	= function(oLeft, oRight) {
	return fOperator_addDayTimeDuration2DateTime(oLeft, oRight, '+');
};

// op:subtract-yearMonthDuration-from-date($arg1 as xs:date, $arg2  as xs:yearMonthDuration) as xs:date
hStaticContext_operators["subtract-yearMonthDuration-from-date"]	= function(oLeft, oRight) {
	return fOperator_addYearMonthDuration2DateTime(oLeft, oRight, '-');
};

// op:subtract-dayTimeDuration-from-date($arg1 as xs:date, $arg2  as xs:dayTimeDuration) as xs:date
hStaticContext_operators["subtract-dayTimeDuration-from-date"]	= function(oLeft, oRight) {
	return fOperator_addDayTimeDuration2DateTime(oLeft, oRight, '-');
};

// op:add-dayTimeDuration-to-time($arg1 as xs:time, $arg2  as xs:dayTimeDuration) as xs:time
hStaticContext_operators["add-dayTimeDuration-to-time"]	= function(oLeft, oRight) {
	var oValue	= new cXSTime(oLeft.hours, oLeft.minutes, oLeft.seconds, oLeft.timezone);
	oValue.hours	+= oRight.hours;
	oValue.minutes	+= oRight.minutes;
	oValue.seconds	+= oRight.seconds;
	//
	return fXSTime_normalize(oValue);
};

// op:subtract-dayTimeDuration-from-time($arg1 as xs:time, $arg2  as xs:dayTimeDuration) as xs:time
hStaticContext_operators["subtract-dayTimeDuration-from-time"]	= function(oLeft, oRight) {
	var oValue	= new cXSTime(oLeft.hours, oLeft.minutes, oLeft.seconds, oLeft.timezone);
	oValue.hours	-= oRight.hours;
	oValue.minutes	-= oRight.minutes;
	oValue.seconds	-= oRight.seconds;
	//
	return fXSTime_normalize(oValue);
};

function fOperator_compareTimes(oLeft, oRight, sComparator) {
	var nLeft	= fOperator_time_toSeconds(oLeft),
		nRight	= fOperator_time_toSeconds(oRight);
	return new cXSBoolean(sComparator == 'lt' ? nLeft < nRight : sComparator == 'gt' ? nLeft > nRight : nLeft == nRight);
};

function fOperator_compareDates(oLeft, oRight, sComparator) {
	return fOperator_compareDateTimes(cXSDateTime.cast(oLeft), cXSDateTime.cast(oRight), sComparator);
};

function fOperator_compareDateTimes(oLeft, oRight, sComparator) {
	// Adjust object time zone to Z and compare as strings
	var oTimezone	= new cXSDayTimeDuration(0, 0, 0, 0),
		sLeft	= fFunction_dateTime_adjustTimezone(oLeft, oTimezone).toString(),
		sRight	= fFunction_dateTime_adjustTimezone(oRight, oTimezone).toString();
	return new cXSBoolean(sComparator == 'lt' ? sLeft < sRight : sComparator == 'gt' ? sLeft > sRight : sLeft == sRight);
};

function fOperator_addYearMonthDuration2DateTime(oLeft, oRight, sOperator) {
	var oValue;
	if (oLeft instanceof cXSDate)
		oValue	= new cXSDate(oLeft.year, oLeft.month, oLeft.day, oLeft.timezone, oLeft.negative);
	else
	if (oLeft instanceof cXSDateTime)
		oValue	= new cXSDateTime(oLeft.year, oLeft.month, oLeft.day, oLeft.hours, oLeft.minutes, oLeft.seconds, oLeft.timezone, oLeft.negative);
	//
	oValue.year		= oValue.year + oRight.year * (sOperator == '-' ?-1 : 1);
	oValue.month	= oValue.month + oRight.month * (sOperator == '-' ?-1 : 1);
	//
	fXSDate_normalize(oValue, true);
	// Correct day if out of month range
	var nDay	= fXSDate_getDaysForYearMonth(oValue.year, oValue.month);
	if (oValue.day > nDay)
		oValue.day	= nDay;
	//
	return oValue;
};

function fOperator_addDayTimeDuration2DateTime(oLeft, oRight, sOperator) {
	var oValue;
	if (oLeft instanceof cXSDate) {
		var nValue	= (oRight.hours * 60 + oRight.minutes) * 60 + oRight.seconds;
		oValue	= new cXSDate(oLeft.year, oLeft.month, oLeft.day, oLeft.timezone, oLeft.negative);
		oValue.day	= oValue.day + oRight.day * (sOperator == '-' ?-1 : 1) - 1 * (nValue && sOperator == '-');
		//
		fXSDate_normalize(oValue);
	}
	else
	if (oLeft instanceof cXSDateTime) {
		oValue	= new cXSDateTime(oLeft.year, oLeft.month, oLeft.day, oLeft.hours, oLeft.minutes, oLeft.seconds, oLeft.timezone, oLeft.negative);
		oValue.seconds	= oValue.seconds + oRight.seconds * (sOperator == '-' ?-1 : 1);
		oValue.minutes	= oValue.minutes + oRight.minutes * (sOperator == '-' ?-1 : 1);
		oValue.hours	= oValue.hours + oRight.hours * (sOperator == '-' ?-1 : 1);
		oValue.day		= oValue.day + oRight.day * (sOperator == '-' ?-1 : 1);
		//
		fXSDateTime_normalize(oValue);
	}
	return oValue;
};

// xs:dayTimeDuration to/from seconds
function fOperator_dayTimeDuration_toSeconds(oDuration) {
	return (((oDuration.day * 24 + oDuration.hours) * 60 + oDuration.minutes) * 60 + oDuration.seconds) * (oDuration.negative ? -1 : 1);
};

function fOperator_dayTimeDuration_fromSeconds(nValue) {
	var bNegative	=(nValue = cMath.round(nValue)) < 0,
		nDays	= ~~((nValue = cMath.abs(nValue)) / 86400),
		nHours	= ~~((nValue -= nDays * 3600 * 24) / 3600),
		nMinutes= ~~((nValue -= nHours * 3600) / 60),
		nSeconds	= nValue -= nMinutes * 60;
	return new cXSDayTimeDuration(nDays, nHours, nMinutes, nSeconds, bNegative);
};

// xs:yearMonthDuration to/from months
function fOperator_yearMonthDuration_toMonths(oDuration) {
	return (oDuration.year * 12 + oDuration.month) * (oDuration.negative ? -1 : 1);
};

function fOperator_yearMonthDuration_fromMonths(nValue) {
	var nNegative	=(nValue = cMath.round(nValue)) < 0,
		nYears	= ~~((nValue = cMath.abs(nValue)) / 12),
		nMonths		= nValue -= nYears * 12;
	return new cXSYearMonthDuration(nYears, nMonths, nNegative);
};

// xs:time to seconds
function fOperator_time_toSeconds(oTime) {
	return oTime.seconds + (oTime.minutes - (oTime.timezone != null ? oTime.timezone % 60 : 0) + (oTime.hours - (oTime.timezone != null ? ~~(oTime.timezone / 60) : 0)) * 60) * 60;
};

// This function unlike all other date-related functions rely on interpretor's dateTime handling
function fOperator_dateTime_toSeconds(oValue) {
	var oDate	= new cDate((oValue.negative ? -1 : 1) * oValue.year, oValue.month, oValue.day, 0, 0, 0, 0);
	if (oValue instanceof cXSDateTime) {
		oDate.setHours(oValue.hours);
		oDate.setMinutes(oValue.minutes);
		oDate.setSeconds(oValue.seconds);
	}
	if (oValue.timezone != null)
		oDate.setMinutes(oDate.getMinutes() - oValue.timezone);
	return oDate.getTime() / 1000;
};

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

/*
	14 Functions and Operators on Nodes
		op:is-same-node
		op:node-before
		op:node-after
*/

// 14 Operators on Nodes
// op:is-same-node($parameter1 as node(), $parameter2 as node()) as xs:boolean
hStaticContext_operators["is-same-node"]	= function(oLeft, oRight) {
	return new cXSBoolean(this.DOMAdapter.isSameNode(oLeft, oRight));
};

// op:node-before($parameter1 as node(), $parameter2 as node()) as xs:boolean
hStaticContext_operators["node-before"]	= function(oLeft, oRight) {
	return new cXSBoolean(!!(this.DOMAdapter.compareDocumentPosition(oLeft, oRight) & 4));
};

// op:node-after($parameter1 as node(), $parameter2 as node()) as xs:boolean
hStaticContext_operators["node-after"]	= function(oLeft, oRight) {
	return new cXSBoolean(!!(this.DOMAdapter.compareDocumentPosition(oLeft, oRight) & 2));
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

/*
	13.1 Operators on NOTATION
		op:NOTATION-equal
*/
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

/*
	6.2 Operators on Numeric Values
		op:numeric-add
		op:numeric-subtract
		op:numeric-multiply
		op:numeric-divide
		op:numeric-integer-divide
		op:numeric-mod
		op:numeric-unary-plus
		op:numeric-unary-minus

	6.3 Comparison Operators on Numeric Values
		op:numeric-equal
		op:numeric-less-than
		op:numeric-greater-than
*/

// 6.2 Operators on Numeric Values
function fFunctionCall_numeric_getPower(oLeft, oRight) {
	if (fIsNaN(oLeft) || (cMath.abs(oLeft) == nInfinity) || fIsNaN(oRight) || (cMath.abs(oRight) == nInfinity))
		return 0;
	var aLeft	= cString(oLeft).match(rNumericLiteral),
		aRight	= cString(oRight).match(rNumericLiteral),
		nPower	= cMath.max(1, (aLeft[2] || aLeft[3] || '').length + (aLeft[5] || 0) * (aLeft[4] == '+' ?-1 : 1), (aRight[2] || aRight[3] || '').length + (aRight[5] || 0) * (aRight[4] == '+' ?-1 : 1));
	return nPower + (nPower % 2 ? 0 : 1);
};

// op:numeric-add($arg1 as numeric, $arg2 as numeric) as numeric
hStaticContext_operators["numeric-add"]		= function(oLeft, oRight) {
	var nLeft	= oLeft.valueOf(),
		nRight	= oRight.valueOf(),
		nPower	= cMath.pow(10, fFunctionCall_numeric_getPower(nLeft, nRight));
	return fOperator_numeric_getResultOfType(oLeft, oRight, ((nLeft * nPower) + (nRight * nPower))/nPower);
};

// op:numeric-subtract($arg1 as numeric, $arg2 as numeric) as numeric
hStaticContext_operators["numeric-subtract"]	= function(oLeft, oRight) {
	var nLeft	= oLeft.valueOf(),
		nRight	= oRight.valueOf(),
		nPower	= cMath.pow(10, fFunctionCall_numeric_getPower(nLeft, nRight));
	return fOperator_numeric_getResultOfType(oLeft, oRight, ((nLeft * nPower) - (nRight * nPower))/nPower);
};

// op:numeric-multiply($arg1 as numeric, $arg2 as numeric) as numeric
hStaticContext_operators["numeric-multiply"]	= function(oLeft, oRight) {
	var nLeft	= oLeft.valueOf(),
		nRight	= oRight.valueOf(),
		nPower	= cMath.pow(10, fFunctionCall_numeric_getPower(nLeft, nRight));
	return fOperator_numeric_getResultOfType(oLeft, oRight, ((nLeft * nPower) * (nRight * nPower))/(nPower * nPower));
};

// op:numeric-divide($arg1 as numeric, $arg2 as numeric) as numeric
hStaticContext_operators["numeric-divide"]	= function(oLeft, oRight) {
	var nLeft	= oLeft.valueOf(),
		nRight	= oRight.valueOf(),
		nPower	= cMath.pow(10, fFunctionCall_numeric_getPower(nLeft, nRight));
	return fOperator_numeric_getResultOfType(oLeft, oRight, (oLeft * nPower) / (oRight * nPower));
};

// op:numeric-integer-divide($arg1 as numeric, $arg2 as numeric) as xs:integer
hStaticContext_operators["numeric-integer-divide"]	= function(oLeft, oRight) {
	var oValue = oLeft / oRight;
	return new cXSInteger(cMath.floor(oValue) + (oValue < 0));
};

// op:numeric-mod($arg1 as numeric, $arg2 as numeric) as numeric
hStaticContext_operators["numeric-mod"]	= function(oLeft, oRight) {
	var nLeft	= oLeft.valueOf(),
		nRight	= oRight.valueOf(),
		nPower	= cMath.pow(10, fFunctionCall_numeric_getPower(nLeft, nRight));
	return fOperator_numeric_getResultOfType(oLeft, oRight, ((nLeft * nPower) % (nRight * nPower)) / nPower);
};

// op:numeric-unary-plus($arg as numeric) as numeric
hStaticContext_operators["numeric-unary-plus"]	= function(oRight) {
	return oRight;
};

// op:numeric-unary-minus($arg as numeric) as numeric
hStaticContext_operators["numeric-unary-minus"]	= function(oRight) {
	oRight.value	*=-1;
	return oRight;
};


// 6.3 Comparison Operators on Numeric Values
// op:numeric-equal($arg1 as numeric, $arg2 as numeric) as xs:boolean
hStaticContext_operators["numeric-equal"]	= function(oLeft, oRight) {
	return new cXSBoolean(oLeft.valueOf() == oRight.valueOf());
};

// op:numeric-less-than($arg1 as numeric, $arg2 as numeric) as xs:boolean
hStaticContext_operators["numeric-less-than"]	= function(oLeft, oRight) {
	return new cXSBoolean(oLeft.valueOf() < oRight.valueOf());
};

// op:numeric-greater-than($arg1 as numeric, $arg2 as numeric) as xs:boolean
hStaticContext_operators["numeric-greater-than"]	= function(oLeft, oRight) {
	return new cXSBoolean(oLeft.valueOf() > oRight.valueOf());
};

function fOperator_numeric_getResultOfType(oLeft, oRight, nResult) {
	return new (oLeft instanceof cXSInteger && oRight instanceof cXSInteger && nResult == cMath.round(nResult) ? cXSInteger : cXSDecimal)(nResult);
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

/*
	11.2 Functions and Operators Related to QNames
		op:QName-equal

*/

// 11.2 Operators Related to QNames
// op:QName-equal($arg1 as xs:QName, $arg2 as xs:QName) as xs:boolean
hStaticContext_operators["QName-equal"]	= function(oLeft, oRight) {
	return new cXSBoolean(oLeft.localName == oRight.localName && oLeft.namespaceURI == oRight.namespaceURI);
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

/*
	15.1 General Functions and Operators on Sequences
		op:concatenate

	15.3 Equals, Union, Intersection and Except
		op:union
		op:intersect
		op:except

	15.5 Functions and Operators that Generate Sequences
		op:to

*/

// 15.1 General Functions and Operators on Sequences
// op:concatenate($seq1 as item()*, $seq2 as item()*) as item()*
hStaticContext_operators["concatenate"]	= function(oSequence1, oSequence2) {
	return oSequence1.concat(oSequence2);
};

// 15.3 Equals, Union, Intersection and Except
// op:union($parameter1 as node()*, $parameter2 as node()*) as node()*
hStaticContext_operators["union"]	= function(oSequence1, oSequence2) {
	var oSequence	= [];
	// Process first collection
	for (var nIndex = 0, nLength = oSequence1.length, oItem; nIndex < nLength; nIndex++) {
		if (!this.DOMAdapter.isNode(oItem = oSequence1[nIndex]))
			throw new cException("XPTY0004"

			);	// Required item type of second operand of 'intersect' is node(); supplied value has item type xs:integer
		//
		if (fArray_indexOf(oSequence, oItem) ==-1)
			oSequence.push(oItem);
	}
	// Process second collection
	for (var nIndex = 0, nLength = oSequence2.length, oItem; nIndex < nLength; nIndex++) {
		if (!this.DOMAdapter.isNode(oItem = oSequence2[nIndex]))
			throw new cException("XPTY0004"

			);	// Required item type of second operand of 'intersect' is node(); supplied value has item type xs:integer
		//
		if (fArray_indexOf(oSequence, oItem) ==-1)
			oSequence.push(oItem);
	}
	return fFunction_sequence_order(oSequence, this);
};

// op:intersect($parameter1 as node()*, $parameter2 as node()*) as node()*
hStaticContext_operators["intersect"]	= function(oSequence1, oSequence2) {
	var oSequence	= [];
	for (var nIndex = 0, nLength = oSequence1.length, oItem, bFound; nIndex < nLength; nIndex++) {
		if (!this.DOMAdapter.isNode(oItem = oSequence1[nIndex]))
			throw new cException("XPTY0004"

			);	// Required item type of second operand of 'intersect' is node(); supplied value has item type xs:integer
		//
		bFound	= false;
		for (var nRightIndex = 0, nRightLength = oSequence2.length;(nRightIndex < nRightLength) && !bFound; nRightIndex++) {
			if (!this.DOMAdapter.isNode(oSequence2[nRightIndex]))
				throw new cException("XPTY0004"

				);
			bFound = this.DOMAdapter.isSameNode(oSequence2[nRightIndex], oItem);
		}
		//
		if (bFound && fArray_indexOf(oSequence, oItem) ==-1)
			oSequence.push(oItem);
	}
	return fFunction_sequence_order(oSequence, this);
};

// op:except($parameter1 as node()*, $parameter2 as node()*) as node()*
hStaticContext_operators["except"]	= function(oSequence1, oSequence2) {
	var oSequence	= [];
	for (var nIndex = 0, nLength = oSequence1.length, oItem, bFound; nIndex < nLength; nIndex++) {
		if (!this.DOMAdapter.isNode(oItem = oSequence1[nIndex]))
			throw new cException("XPTY0004"

			);	// Required item type of second operand of 'intersect' is node(); supplied value has item type xs:integer
		//
		bFound	= false;
		for (var nRightIndex = 0, nRightLength = oSequence2.length;(nRightIndex < nRightLength) && !bFound; nRightIndex++) {
			if (!this.DOMAdapter.isNode(oSequence2[nRightIndex]))
				throw new cException("XPTY0004"

				);
			bFound = this.DOMAdapter.isSameNode(oSequence2[nRightIndex], oItem);
		}
		//
		if (!bFound && fArray_indexOf(oSequence, oItem) ==-1)
			oSequence.push(oItem);
	}
	return fFunction_sequence_order(oSequence, this);
};

// 15.5 Functions and Operators that Generate Sequences
// op:to($firstval as xs:integer, $lastval as xs:integer) as xs:integer*
hStaticContext_operators["to"]	= function(oLeft, oRight) {
	var oSequence	= [];
	for (var nIndex = oLeft.valueOf(), nLength = oRight.valueOf(); nIndex <= nLength; nIndex++)
		oSequence.push(new cXSInteger(nIndex));
	//
	return oSequence;
};

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

/*
	2 Accessors
		node-name
		nilled
		string
		data
		base-uri
		document-uri

*/

// fn:node-name($arg as node()?) as xs:QName?
fStaticContext_defineSystemFunction("node-name",		[[cXTNode, '?']],	function(oNode) {
	if (oNode != null) {
		var fGetProperty	= this.DOMAdapter.getProperty;
		switch (fGetProperty(oNode, "nodeType")) {
			case 1:		// ELEMENT_NAME
			case 2:		// ATTRIBUTE_NODE
				return new cXSQName(fGetProperty(oNode, "prefix"), fGetProperty(oNode, "localName"), fGetProperty(oNode, "namespaceURI"));
			case 5:		// ENTITY_REFERENCE_NODE
				throw "Not implemented";
			case 6:		// ENTITY_NODE
				throw "Not implemented";
			case 7:		// PROCESSING_INSTRUCTION_NODE
				return new cXSQName(null, fGetProperty(oNode, "target"), null);
			case 10:	// DOCUMENT_TYPE_NODE
				return new cXSQName(null, fGetProperty(oNode, "name"), null);
		}
	}
	//
	return null;
});

// fn:nilled($arg as node()?) as xs:boolean?
fStaticContext_defineSystemFunction("nilled",	[[cXTNode, '?']],	function(oNode) {
	if (oNode != null) {
		if (this.DOMAdapter.getProperty(oNode, "nodeType") == 1)
			return new cXSBoolean(false);	// TODO: Determine if node is nilled
	}
	//
	return null;
});

// fn:string() as xs:string
// fn:string($arg as item()?) as xs:string
fStaticContext_defineSystemFunction("string",	[[cXTItem, '?', true]],	function(/*[*/oItem/*]*/) {
	if (!arguments.length) {
		if (!this.item)
			throw new cException("XPDY0002");
		oItem	= this.item;
	}
	return oItem == null ? new cXSString('') : cXSString.cast(fFunction_sequence_atomize([oItem], this)[0]);
});

// fn:data($arg as item()*) as xs:anyAtomicType*
fStaticContext_defineSystemFunction("data",	[[cXTItem, '*']],		function(oSequence1) {
	return fFunction_sequence_atomize(oSequence1, this);
});

// fn:base-uri() as xs:anyURI?
// fn:base-uri($arg as node()?) as xs:anyURI?
fStaticContext_defineSystemFunction("base-uri",	[[cXTNode, '?', true]],	function(oNode) {
	if (!arguments.length) {
		if (!this.DOMAdapter.isNode(this.item))
			throw new cException("XPTY0004"

			);
		oNode	= this.item;
	}
	//
	return cXSAnyURI.cast(new cXSString(this.DOMAdapter.getProperty(oNode, "baseURI") || ''));
});

// fn:document-uri($arg as node()?) as xs:anyURI?
fStaticContext_defineSystemFunction("document-uri",	[[cXTNode, '?']],	function(oNode) {
	if (oNode != null) {
		var fGetProperty	= this.DOMAdapter.getProperty;
		if (fGetProperty(oNode, "nodeType") == 9)
			return cXSAnyURI.cast(new cXSString(fGetProperty(oNode, "documentURI") || ''));
	}
	//
	return null;
});
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

/*
	8 Functions on anyURI
		resolve-uri
*/

// fn:resolve-uri($relative as xs:string?) as xs:anyURI?
// fn:resolve-uri($relative as xs:string?, $base as xs:string) as xs:anyURI?
fStaticContext_defineSystemFunction("resolve-uri",	[[cXSString, '?'], [cXSString, '', true]],	function(sUri, sBaseUri) {
	if (arguments.length < 2) {
		if (!this.DOMAdapter.isNode(this.item))
			throw new cException("XPTY0004"

			);
		sBaseUri	= new cXSString(this.DOMAdapter.getProperty(this.item, "baseURI") || '');
	}

	if (sUri == null)
		return null;

	//
	if (sUri.valueOf() == '' || sUri.valueOf().charAt(0) == '#')
		return cXSAnyURI.cast(sBaseUri);

	var oUri	= cXSAnyURI.cast(sUri);
	if (oUri.scheme)
		return oUri;

	var oBaseUri	= cXSAnyURI.cast(sBaseUri);
	oUri.scheme	= oBaseUri.scheme;

	if (!oUri.authority) {
		// authority
		oUri.authority	= oBaseUri.authority;

		// path
		if (oUri.path.charAt(0) != '/') {
			var aUriSegments		= oUri.path.split('/'),
				aBaseUriSegments	= oBaseUri.path.split('/');
			aBaseUriSegments.pop();

			var nBaseUriStart	= aBaseUriSegments[0] == '' ? 1 : 0;
			for (var nIndex = 0, nLength = aUriSegments.length; nIndex < nLength; nIndex++) {
				if (aUriSegments[nIndex] == '..') {
					if (aBaseUriSegments.length > nBaseUriStart)
						aBaseUriSegments.pop();
					else {
						aBaseUriSegments.push(aUriSegments[nIndex]);
						nBaseUriStart++;
					}
				}
				else
				if (aUriSegments[nIndex] != '.')
					aBaseUriSegments.push(aUriSegments[nIndex]);
			}
			if (aUriSegments[--nIndex] == '..' || aUriSegments[nIndex] == '.')
				aBaseUriSegments.push('');
			//
			oUri.path	= aBaseUriSegments.join('/');
		}
	}

	return oUri;
});
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

/*
	9.1 Additional Boolean Constructor Functions
		true
		false

	9.3 Functions on Boolean Values
		not
*/

// 9.1 Additional Boolean Constructor Functions
// fn:true() as xs:boolean
fStaticContext_defineSystemFunction("true",	[],	function() {
	return new cXSBoolean(true);
});

// fn:false() as xs:boolean
fStaticContext_defineSystemFunction("false",	[],	function() {
	return new cXSBoolean(false);
});

// 9.3 Functions on Boolean Values
// fn:not($arg as item()*) as xs:boolean
fStaticContext_defineSystemFunction("not",	[[cXTItem, '*']],	function(oSequence1) {
	return new cXSBoolean(!fFunction_sequence_toEBV(oSequence1, this));
});
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

/*
	16 Context Functions
		position
		last
		current-dateTime
		current-date
		current-time
		implicit-timezone
		default-collation
		static-base-uri

*/
// fn:position() as xs:integer
fStaticContext_defineSystemFunction("position",	[],	function() {
	return new cXSInteger(this.position);
});

// fn:last() as xs:integer
fStaticContext_defineSystemFunction("last",	[],	function() {
	return new cXSInteger(this.size);
});

// fn:current-dateTime() as xs:dateTime (2004-05-12T18:17:15.125Z)
fStaticContext_defineSystemFunction("current-dateTime",	[],	 function() {
	return this.dateTime;
});

// fn:current-date() as xs:date (2004-05-12+01:00)
fStaticContext_defineSystemFunction("current-date",	[],	function() {
	return cXSDate.cast(this.dateTime);
});

// fn:current-time() as xs:time (23:17:00.000-05:00)
fStaticContext_defineSystemFunction("current-time",	[],	function() {
	return cXSTime.cast(this.dateTime);
});

// fn:implicit-timezone() as xs:dayTimeDuration
fStaticContext_defineSystemFunction("implicit-timezone",	[],	function() {
	return this.timezone;
});

// fn:default-collation() as xs:string
fStaticContext_defineSystemFunction("default-collation",	[],	 function() {
	return new cXSString(this.staticContext.defaultCollationName);
});

// fn:static-base-uri() as xs:anyURI?
fStaticContext_defineSystemFunction("static-base-uri",	[],	function() {
	return cXSAnyURI.cast(new cXSString(this.staticContext.baseURI || ''));
});
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

/*
	10.5 Component Extraction Functions on Durations, Dates and Times
		years-from-duration
		months-from-duration
		days-from-duration
		hours-from-duration
		minutes-from-duration
		seconds-from-duration
		year-from-dateTime
		month-from-dateTime
		day-from-dateTime
		hours-from-dateTime
		minutes-from-dateTime
		seconds-from-dateTime
		timezone-from-dateTime
		year-from-date
		month-from-date
		day-from-date
		timezone-from-date
		hours-from-time
		minutes-from-time
		seconds-from-time
		timezone-from-time

	10.7 Timezone Adjustment Functions on Dates and Time Values
		adjust-dateTime-to-timezone
		adjust-date-to-timezone
		adjust-time-to-timezone
*/

// 10.5 Component Extraction Functions on Durations, Dates and Times
// functions on duration
// fn:years-from-duration($arg as xs:duration?) as xs:integer?
fStaticContext_defineSystemFunction("years-from-duration",	[[cXSDuration, '?']],	function(oDuration) {
	return fFunction_duration_getComponent(oDuration, "year");
});

// fn:months-from-duration($arg as xs:duration?) as xs:integer?
fStaticContext_defineSystemFunction("months-from-duration",	[[cXSDuration, '?']],	function(oDuration) {
	return fFunction_duration_getComponent(oDuration, "month");
});

// fn:days-from-duration($arg as xs:duration?) as xs:integer?
fStaticContext_defineSystemFunction("days-from-duration",	[[cXSDuration, '?']],	function(oDuration) {
	return fFunction_duration_getComponent(oDuration, "day");
});

// fn:hours-from-duration($arg as xs:duration?) as xs:integer?
fStaticContext_defineSystemFunction("hours-from-duration",	[[cXSDuration, '?']],	function(oDuration) {
	return fFunction_duration_getComponent(oDuration, "hours");
});

// fn:minutes-from-duration($arg as xs:duration?) as xs:integer?
fStaticContext_defineSystemFunction("minutes-from-duration",	[[cXSDuration, '?']],	function(oDuration) {
	return fFunction_duration_getComponent(oDuration, "minutes");
});

// fn:seconds-from-duration($arg as xs:duration?) as xs:decimal?
fStaticContext_defineSystemFunction("seconds-from-duration",	[[cXSDuration, '?']],	function(oDuration) {
	return fFunction_duration_getComponent(oDuration, "seconds");
});

// functions on dateTime
// fn:year-from-dateTime($arg as xs:dateTime?) as xs:integer?
fStaticContext_defineSystemFunction("year-from-dateTime",		[[cXSDateTime, '?']],	function(oDateTime) {
	return fFunction_dateTime_getComponent(oDateTime,	"year");
});

// fn:month-from-dateTime($arg as xs:dateTime?) as xs:integer?
fStaticContext_defineSystemFunction("month-from-dateTime",		[[cXSDateTime, '?']],	function(oDateTime) {
	return fFunction_dateTime_getComponent(oDateTime, "month");
});

// fn:day-from-dateTime($arg as xs:dateTime?) as xs:integer?
fStaticContext_defineSystemFunction("day-from-dateTime",			[[cXSDateTime, '?']],	function(oDateTime) {
	return fFunction_dateTime_getComponent(oDateTime, "day");
});

// fn:hours-from-dateTime($arg as xs:dateTime?) as xs:integer?
fStaticContext_defineSystemFunction("hours-from-dateTime",		[[cXSDateTime, '?']],	function(oDateTime) {
	return fFunction_dateTime_getComponent(oDateTime, "hours");
});

// fn:minutes-from-dateTime($arg as xs:dateTime?) as xs:integer?
fStaticContext_defineSystemFunction("minutes-from-dateTime",		[[cXSDateTime, '?']],	function(oDateTime) {
	return fFunction_dateTime_getComponent(oDateTime, "minutes");
});

// fn:seconds-from-dateTime($arg as xs:dateTime?) as xs:decimal?
fStaticContext_defineSystemFunction("seconds-from-dateTime",		[[cXSDateTime, '?']],	function(oDateTime) {
	return fFunction_dateTime_getComponent(oDateTime, "seconds");
});

// fn:timezone-from-dateTime($arg as xs:dateTime?) as xs:dayTimeDuration?
fStaticContext_defineSystemFunction("timezone-from-dateTime",	[[cXSDateTime, '?']],	function(oDateTime) {
	return fFunction_dateTime_getComponent(oDateTime, "timezone");
});

// functions on date
// fn:year-from-date($arg as xs:date?) as xs:integer?
fStaticContext_defineSystemFunction("year-from-date",	[[cXSDate, '?']],	function(oDate) {
	return fFunction_dateTime_getComponent(oDate, "year");
});

// fn:month-from-date($arg as xs:date?) as xs:integer?
fStaticContext_defineSystemFunction("month-from-date",	[[cXSDate, '?']],	function(oDate) {
	return fFunction_dateTime_getComponent(oDate, "month");
});

// fn:day-from-date($arg as xs:date?) as xs:integer?
fStaticContext_defineSystemFunction("day-from-date",		[[cXSDate, '?']],	function(oDate) {
	return fFunction_dateTime_getComponent(oDate, "day");
});

// fn:timezone-from-date($arg as xs:date?) as xs:dayTimeDuration?
fStaticContext_defineSystemFunction("timezone-from-date",	[[cXSDate, '?']],	function(oDate) {
	return fFunction_dateTime_getComponent(oDate, "timezone");
});

// functions on time
// fn:hours-from-time($arg as xs:time?) as xs:integer?
fStaticContext_defineSystemFunction("hours-from-time",		[[cXSTime, '?']],	function(oTime) {
	return fFunction_dateTime_getComponent(oTime, "hours");
});

// fn:minutes-from-time($arg as xs:time?) as xs:integer?
fStaticContext_defineSystemFunction("minutes-from-time",		[[cXSTime, '?']],	function(oTime) {
	return fFunction_dateTime_getComponent(oTime, "minutes");
});

// fn:seconds-from-time($arg as xs:time?) as xs:decimal?
fStaticContext_defineSystemFunction("seconds-from-time",		[[cXSTime, '?']],	function(oTime) {
	return fFunction_dateTime_getComponent(oTime, "seconds");
});

// fn:timezone-from-time($arg as xs:time?) as xs:dayTimeDuration?
fStaticContext_defineSystemFunction("timezone-from-time",	[[cXSTime, '?']],	function(oTime) {
	return fFunction_dateTime_getComponent(oTime, "timezone");
});


// 10.7 Timezone Adjustment Functions on Dates and Time Values
// fn:adjust-dateTime-to-timezone($arg as xs:dateTime?) as xs:dateTime?
// fn:adjust-dateTime-to-timezone($arg as xs:dateTime?, $timezone as xs:dayTimeDuration?) as xs:dateTime?
fStaticContext_defineSystemFunction("adjust-dateTime-to-timezone",	[[cXSDateTime, '?'], [cXSDayTimeDuration, '?', true]],	function(oDateTime, oDayTimeDuration) {
	return fFunction_dateTime_adjustTimezone(oDateTime, arguments.length > 1 && oDayTimeDuration != null ? arguments.length > 1 ? oDayTimeDuration : this.timezone : null);
});

// fn:adjust-date-to-timezone($arg as xs:date?) as xs:date?
// fn:adjust-date-to-timezone($arg as xs:date?, $timezone as xs:dayTimeDuration?) as xs:date?
fStaticContext_defineSystemFunction("adjust-date-to-timezone",		[[cXSDate, '?'], [cXSDayTimeDuration, '?', true]],	function(oDate, oDayTimeDuration) {
	return fFunction_dateTime_adjustTimezone(oDate, arguments.length > 1 && oDayTimeDuration != null ? arguments.length > 1 ? oDayTimeDuration : this.timezone : null);
});

// fn:adjust-time-to-timezone($arg as xs:time?) as xs:time?
// fn:adjust-time-to-timezone($arg as xs:time?, $timezone as xs:dayTimeDuration?) as xs:time?
fStaticContext_defineSystemFunction("adjust-time-to-timezone",		[[cXSTime, '?'], [cXSDayTimeDuration, '?', true]],	function(oTime, oDayTimeDuration) {
	return fFunction_dateTime_adjustTimezone(oTime, arguments.length > 1 && oDayTimeDuration != null ? arguments.length > 1 ? oDayTimeDuration : this.timezone : null);
});

//
function fFunction_duration_getComponent(oDuration, sName) {
	if (oDuration == null)
		return null;

	var nValue	= oDuration[sName] * (oDuration.negative ?-1 : 1);
	return sName == "seconds" ? new cXSDecimal(nValue) : new cXSInteger(nValue);
};

//
function fFunction_dateTime_getComponent(oDateTime, sName) {
	if (oDateTime == null)
		return null;

	if (sName == "timezone") {
		var nTimezone	= oDateTime.timezone;
		if (nTimezone == null)
			return null;
		return new cXSDayTimeDuration(0, cMath.abs(~~(nTimezone / 60)), cMath.abs(nTimezone % 60), 0, nTimezone < 0);
	}
	else {
		var nValue	= oDateTime[sName];
		if (!(oDateTime instanceof cXSDate)) {
			if (sName == "hours")
				if (nValue == 24)
					nValue	= 0;
		}
		if (!(oDateTime instanceof cXSTime))
			nValue	*= oDateTime.negative ?-1 : 1;
		return sName == "seconds" ? new cXSDecimal(nValue) : new cXSInteger(nValue);
	}
};

//
function fFunction_dateTime_adjustTimezone(oDateTime, oTimezone) {
	if (oDateTime == null)
		return null;

	// Create a copy
	var oValue;
	if (oDateTime instanceof cXSDate)
		oValue	= new cXSDate(oDateTime.year, oDateTime.month, oDateTime.day, oDateTime.timezone, oDateTime.negative);
	else
	if (oDateTime instanceof cXSTime)
		oValue	= new cXSTime(oDateTime.hours, oDateTime.minutes, oDateTime.seconds, oDateTime.timezone, oDateTime.negative);
	else
		oValue	= new cXSDateTime(oDateTime.year, oDateTime.month, oDateTime.day, oDateTime.hours, oDateTime.minutes, oDateTime.seconds, oDateTime.timezone, oDateTime.negative);

	//
	if (oTimezone == null)
		oValue.timezone	= null;
	else {
		var nTimezone	= fOperator_dayTimeDuration_toSeconds(oTimezone) / 60;
		if (oDateTime.timezone != null) {
			var nDiff	= nTimezone - oDateTime.timezone;
			if (oDateTime instanceof cXSDate) {
				if (nDiff < 0)
					oValue.day--;
			}
			else {
				oValue.minutes	+= nDiff % 60;
				oValue.hours	+= ~~(nDiff / 60);
			}
			//
			fXSDateTime_normalize(oValue);
		}
		oValue.timezone	= nTimezone;
	}
	return oValue;
};
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

/*
	14 Functions and Operators on Nodes
		name
		local-name
		namespace-uri
		number
		lang
		root

*/

// 14 Functions on Nodes
// fn:name() as xs:string
// fn:name($arg as node()?) as xs:string
fStaticContext_defineSystemFunction("name",	[[cXTNode, '?', true]],	function(oNode) {
	if (!arguments.length) {
		if (!this.DOMAdapter.isNode(this.item))
			throw new cException("XPTY0004"

			);
		oNode	= this.item;
	}
	else
	if (oNode == null)
		return new cXSString('');
	//
	var vValue	= hStaticContext_functions["node-name"].call(this, oNode);
	return new cXSString(vValue == null ? '' : vValue.toString());
});

// fn:local-name() as xs:string
// fn:local-name($arg as node()?) as xs:string
fStaticContext_defineSystemFunction("local-name",	[[cXTNode, '?', true]],	function(oNode) {
	if (!arguments.length) {
		if (!this.DOMAdapter.isNode(this.item))
			throw new cException("XPTY0004"

			);
		oNode	= this.item;
	}
	else
	if (oNode == null)
		return new cXSString('');
	//
	return new cXSString(this.DOMAdapter.getProperty(oNode, "localName") || '');
});

// fn:namespace-uri() as xs:anyURI
// fn:namespace-uri($arg as node()?) as xs:anyURI
fStaticContext_defineSystemFunction("namespace-uri",	[[cXTNode, '?', true]],	function(oNode) {
	if (!arguments.length) {
		if (!this.DOMAdapter.isNode(this.item))
			throw new cException("XPTY0004"

			);
		oNode	= this.item;
	}
	else
	if (oNode == null)
		return cXSAnyURI.cast(new cXSString(''));
	//
	return cXSAnyURI.cast(new cXSString(this.DOMAdapter.getProperty(oNode, "namespaceURI") || ''));
});

// fn:number() as xs:double
// fn:number($arg as xs:anyAtomicType?) as xs:double
fStaticContext_defineSystemFunction("number",	[[cXSAnyAtomicType, '?', true]],	function(/*[*/oItem/*]*/) {
	if (!arguments.length) {
		if (!this.item)
			throw new cException("XPDY0002");
		oItem	= fFunction_sequence_atomize([this.item], this)[0];
	}

	// If input item cannot be cast to xs:decimal, a NaN should be returned
	var vValue	= new cXSDouble(nNaN);
	if (oItem != null) {
		try {
			vValue	= cXSDouble.cast(oItem);
		}
		catch (e) {

		}
	}
	return vValue;
});

// fn:lang($testlang as xs:string?) as xs:boolean
// fn:lang($testlang as xs:string?, $node as node()) as xs:boolean
fStaticContext_defineSystemFunction("lang",	[[cXSString, '?'], [cXTNode, '', true]],	function(sLang, oNode) {
	if (arguments.length < 2) {
		if (!this.DOMAdapter.isNode(this.item))
			throw new cException("XPTY0004"

			);
		oNode	= this.item;
	}

	var fGetProperty	= this.DOMAdapter.getProperty;
	if (fGetProperty(oNode, "nodeType") == 2)
		oNode	= fGetProperty(oNode, "ownerElement");

	// walk up the tree looking for xml:lang attribute
	for (var aAttributes; oNode; oNode = fGetProperty(oNode, "parentNode"))
		if (aAttributes = fGetProperty(oNode, "attributes"))
			for (var nIndex = 0, nLength = aAttributes.length; nIndex < nLength; nIndex++)
				if (fGetProperty(aAttributes[nIndex], "nodeName") == "xml:lang")
					return new cXSBoolean(fGetProperty(aAttributes[nIndex], "value").replace(/-.+/, '').toLowerCase() == sLang.valueOf().replace(/-.+/, '').toLowerCase());
	//
	return new cXSBoolean(false);
});

// fn:root() as node()
// fn:root($arg as node()?) as node()?
fStaticContext_defineSystemFunction("root",	[[cXTNode, '?', true]],	function(oNode) {
	if (!arguments.length) {
		if (!this.DOMAdapter.isNode(this.item))
			throw new cException("XPTY0004"

			);
		oNode	= this.item;
	}
	else
	if (oNode == null)
		return null;

	var fGetProperty	= this.DOMAdapter.getProperty;

	// If context node is Attribute
	if (fGetProperty(oNode, "nodeType") == 2)
		oNode	= fGetProperty(oNode, "ownerElement");

	for (var oParent = oNode; oParent; oParent = fGetProperty(oNode, "parentNode"))
		oNode	= oParent;

	return oNode;
});

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

/*
	6.4 Functions on Numeric Values
		abs
		ceiling
		floor
		round
		round-half-to-even
*/

// 6.4 Functions on Numeric Values
// fn:abs($arg as numeric?) as numeric?
fStaticContext_defineSystemFunction("abs",		[[cXSDouble, '?']],	function(oValue) {
	return new cXSDecimal(cMath.abs(oValue));
});

// fn:ceiling($arg as numeric?) as numeric?
fStaticContext_defineSystemFunction("ceiling",	[[cXSDouble, '?']],	function(oValue) {
	return new cXSDecimal(cMath.ceil(oValue));
});

// fn:floor($arg as numeric?) as numeric?
fStaticContext_defineSystemFunction("floor",		[[cXSDouble, '?']],	function(oValue) {
	return new cXSDecimal(cMath.floor(oValue));
});

// fn:round($arg as numeric?) as numeric?
fStaticContext_defineSystemFunction("round",		[[cXSDouble, '?']],	function(oValue) {
	return new cXSDecimal(cMath.round(oValue));
});

// fn:round-half-to-even($arg as numeric?) as numeric?
// fn:round-half-to-even($arg as numeric?, $precision as xs:integer) as numeric?
fStaticContext_defineSystemFunction("round-half-to-even",	[[cXSDouble, '?'], [cXSInteger, '', true]],	function(oValue, oPrecision) {
	var nPrecision	= arguments.length > 1 ? oPrecision.valueOf() : 0;

	//
	if (nPrecision < 0) {
		var oPower	= new cXSInteger(cMath.pow(10,-nPrecision)),
			nRounded= cMath.round(hStaticContext_operators["numeric-divide"].call(this, oValue, oPower)),
			oRounded= new cXSInteger(nRounded);
			nDecimal= cMath.abs(hStaticContext_operators["numeric-subtract"].call(this, oRounded, hStaticContext_operators["numeric-divide"].call(this, oValue, oPower)));
		return hStaticContext_operators["numeric-multiply"].call(this, hStaticContext_operators["numeric-add"].call(this, oRounded, new cXSDecimal(nDecimal == 0.5 && nRounded % 2 ?-1 : 0)), oPower);
	}
	else {
		var oPower	= new cXSInteger(cMath.pow(10, nPrecision)),
			nRounded= cMath.round(hStaticContext_operators["numeric-multiply"].call(this, oValue, oPower)),
			oRounded= new cXSInteger(nRounded);
			nDecimal= cMath.abs(hStaticContext_operators["numeric-subtract"].call(this, oRounded, hStaticContext_operators["numeric-multiply"].call(this, oValue, oPower)));
		return hStaticContext_operators["numeric-divide"].call(this, hStaticContext_operators["numeric-add"].call(this, oRounded, new cXSDecimal(nDecimal == 0.5 && nRounded % 2 ?-1 : 0)), oPower);
	}
});
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

/*
	11.1 Additional Constructor Functions for QNames
		resolve-QName
		QName

	11.2 Functions and Operators Related to QNames
		prefix-from-QName
		local-name-from-QName
		namespace-uri-from-QName
		namespace-uri-for-prefix
		in-scope-prefixes

*/

// 11.1 Additional Constructor Functions for QNames
// fn:resolve-QName($qname as xs:string?, $element as element()) as xs:QName?
fStaticContext_defineSystemFunction("resolve-QName",	[[cXSString, '?'], [cXTElement]],	function(oQName, oElement) {
	if (oQName == null)
		return null;

	var sQName	= oQName.valueOf(),
		aMatch	= sQName.match(rXSQName);
	if (!aMatch)
		throw new cException("FOCA0002"

		);

	var sPrefix	= aMatch[1] || null,
		sLocalName	= aMatch[2],
		sNameSpaceURI = this.DOMAdapter.lookupNamespaceURI(oElement, sPrefix);
	//
	if (sPrefix != null &&!sNameSpaceURI)
		throw new cException("FONS0004"

		);

	return new cXSQName(sPrefix, sLocalName, sNameSpaceURI || null);
});

// fn:QName($paramURI as xs:string?, $paramQName as xs:string) as xs:QName
fStaticContext_defineSystemFunction("QName",		[[cXSString, '?'], [cXSString]],	function(oUri, oQName) {
	var sQName	= oQName.valueOf(),
		aMatch	= sQName.match(rXSQName);

	if (!aMatch)
		throw new cException("FOCA0002"

		);

	return new cXSQName(aMatch[1] || null, aMatch[2] || null, oUri == null ? '' : oUri.valueOf());
});

// 11.2 Functions Related to QNames
// fn:prefix-from-QName($arg as xs:QName?) as xs:NCName?
fStaticContext_defineSystemFunction("prefix-from-QName",			[[cXSQName, '?']],	function(oQName) {
	if (oQName != null) {
		if (oQName.prefix)
			return new cXSNCName(oQName.prefix);
	}
	//
	return null;
});

// fn:local-name-from-QName($arg as xs:QName?) as xs:NCName?
fStaticContext_defineSystemFunction("local-name-from-QName",		[[cXSQName, '?']],	function(oQName) {
	if (oQName == null)
		return null;

	return new cXSNCName(oQName.localName);
});

// fn:namespace-uri-from-QName($arg as xs:QName?) as xs:anyURI?
fStaticContext_defineSystemFunction("namespace-uri-from-QName",	[[cXSQName, '?']],	function(oQName) {
	if (oQName == null)
		return null;

	return cXSAnyURI.cast(new cXSString(oQName.namespaceURI || ''));
});

// fn:namespace-uri-for-prefix($prefix as xs:string?, $element as element()) as xs:anyURI?
fStaticContext_defineSystemFunction("namespace-uri-for-prefix",	[[cXSString, '?'], [cXTElement]],	function(oPrefix, oElement) {
	var sPrefix	= oPrefix == null ? '' : oPrefix.valueOf(),
		sNameSpaceURI	= this.DOMAdapter.lookupNamespaceURI(oElement, sPrefix || null);

	return sNameSpaceURI == null ? null : cXSAnyURI.cast(new cXSString(sNameSpaceURI));
});

// fn:in-scope-prefixes($element as element()) as xs:string*
fStaticContext_defineSystemFunction("in-scope-prefixes",	[[cXTElement]],	function(oElement) {
	throw "Function '" + "in-scope-prefixes" + "' not implemented";
});

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

/*
	15.1 General Functions and Operators on Sequences
		boolean
		index-of
		empty
		exists
		distinct-values
		insert-before
		remove
		reverse
		subsequence
		unordered

	15.2 Functions That Test the Cardinality of Sequences
		zero-or-one
		one-or-more
		exactly-one

	15.3 Equals, Union, Intersection and Except
		deep-equal

	15.4 Aggregate Functions
		count
		avg
		max
		min
		sum

	15.5 Functions and Operators that Generate Sequences
		id
		idref
		doc
		doc-available
		collection
		element-with-id

*/

// 15.1 General Functions and Operators on Sequences
// fn:boolean($arg as item()*) as xs:boolean
fStaticContext_defineSystemFunction("boolean",	[[cXTItem, '*']],	function(oSequence1) {
	return new cXSBoolean(fFunction_sequence_toEBV(oSequence1, this));
});

// fn:index-of($seqParam as xs:anyAtomicType*, $srchParam as xs:anyAtomicType) as xs:integer*
// fn:index-of($seqParam as xs:anyAtomicType*, $srchParam as xs:anyAtomicType, $collation as xs:string) as xs:integer*
fStaticContext_defineSystemFunction("index-of",	[[cXSAnyAtomicType, '*'], [cXSAnyAtomicType], [cXSString, '', true]],	function(oSequence1, oSearch, oCollation) {
	if (!oSequence1.length || oSearch == null)
		return [];

	// TODO: Implement collation

	var vLeft	= oSearch;
	// Cast to XSString if Untyped
	if (vLeft instanceof cXSUntypedAtomic)
		vLeft	= cXSString.cast(vLeft);

	var oSequence	= [];
	for (var nIndex = 0, nLength = oSequence1.length, vRight; nIndex < nLength; nIndex++) {
		vRight	= oSequence1[nIndex];
		// Cast to XSString if Untyped
		if (vRight instanceof cXSUntypedAtomic)
			vRight	= cXSString.cast(vRight);
		//
		if (vRight.valueOf() === vLeft.valueOf())
			oSequence.push(new cXSInteger(nIndex + 1));
	}

	return oSequence;
});

// fn:empty($arg as item()*) as xs:boolean
fStaticContext_defineSystemFunction("empty",	[[cXTItem, '*']],	function(oSequence1) {
	return new cXSBoolean(!oSequence1.length);
});

// fn:exists($arg as item()*) as xs:boolean
fStaticContext_defineSystemFunction("exists",	[[cXTItem, '*']],	function(oSequence1) {
	return new cXSBoolean(!!oSequence1.length);
});

// fn:distinct-values($arg as xs:anyAtomicType*) as xs:anyAtomicType*
// fn:distinct-values($arg as xs:anyAtomicType*, $collation as xs:string) as xs:anyAtomicType*
fStaticContext_defineSystemFunction("distinct-values",	[[cXSAnyAtomicType, '*'], [cXSString, '', true]],	function(oSequence1, oCollation) {
	if (arguments.length > 1)
		throw "Collation parameter in function '" + "distinct-values" + "' is not implemented";

	if (!oSequence1.length)
		return null;

	var oSequence	= [];
	for (var nIndex = 0, nLength = oSequence1.length, vLeft; nIndex < nLength; nIndex++) {
		vLeft	= oSequence1[nIndex];
		// Cast to XSString if Untyped
		if (vLeft instanceof cXSUntypedAtomic)
			vLeft	= cXSString.cast(vLeft);
		for (var nRightIndex = 0, nRightLength = oSequence.length, vRight, bFound = false; (nRightIndex < nRightLength) &&!bFound; nRightIndex++) {
			vRight	= oSequence[nRightIndex];
			// Cast to XSString if Untyped
			if (vRight instanceof cXSUntypedAtomic)
				vRight	= cXSString.cast(vRight);
			//
			if (vRight.valueOf() === vLeft.valueOf())
				bFound	= true;
		}
		if (!bFound)
			oSequence.push(oSequence1[nIndex]);
	}

	return oSequence;
});

// fn:insert-before($target as item()*, $position as xs:integer, $inserts as item()*) as item()*
fStaticContext_defineSystemFunction("insert-before",	[[cXTItem, '*'], [cXSInteger], [cXTItem, '*']],	function(oSequence1, oPosition, oSequence3) {
	if (!oSequence1.length)
		return oSequence3;
	if (!oSequence3.length)
		return oSequence1;

	var nLength 	= oSequence1.length,
		nPosition	= oPosition.valueOf();
	if (nPosition < 1)
		nPosition	= 1;
	else
	if (nPosition > nLength)
		nPosition	= nLength + 1;

	var oSequence	=  [];
	for (var nIndex = 0; nIndex < nLength; nIndex++) {
		if (nPosition == nIndex + 1)
			oSequence	= oSequence.concat(oSequence3);
		oSequence.push(oSequence1[nIndex]);
	}
	if (nPosition == nIndex + 1)
		oSequence	= oSequence.concat(oSequence3);

	return oSequence;
});

// fn:remove($target as item()*, $position as xs:integer) as item()*
fStaticContext_defineSystemFunction("remove",	[[cXTItem, '*'], [cXSInteger]],	function(oSequence1, oPosition) {
	if (!oSequence1.length)
		return [];

	var nLength 	= oSequence1.length,
		nPosition	= oPosition.valueOf();

	if (nPosition < 1 || nPosition > nLength)
		return oSequence1;

	var oSequence	=  [];
	for (var nIndex = 0; nIndex < nLength; nIndex++)
		if (nPosition != nIndex + 1)
			oSequence.push(oSequence1[nIndex]);

	return oSequence;
});

// fn:reverse($arg as item()*) as item()*
fStaticContext_defineSystemFunction("reverse",	[[cXTItem, '*']],	function(oSequence1) {
	oSequence1.reverse();

	return oSequence1;
});

// fn:subsequence($sourceSeq as item()*, $startingLoc as xs:double) as item()*
// fn:subsequence($sourceSeq as item()*, $startingLoc as xs:double, $length as xs:double) as item()*
fStaticContext_defineSystemFunction("subsequence",	[[cXTItem, '*'], [cXSDouble, ''], [cXSDouble, '', true]],	function(oSequence1, oStart, oLength) {
	var nPosition	= cMath.round(oStart),
		nLength		= arguments.length > 2 ? cMath.round(oLength) : oSequence1.length - nPosition + 1;

	// TODO: Handle out-of-range position and length values
	return oSequence1.slice(nPosition - 1, nPosition - 1 + nLength);
});

// fn:unordered($sourceSeq as item()*) as item()*
fStaticContext_defineSystemFunction("unordered",	[[cXTItem, '*']],	function(oSequence1) {
	return oSequence1;
});


// 15.2 Functions That Test the Cardinality of Sequences
// fn:zero-or-one($arg as item()*) as item()?
fStaticContext_defineSystemFunction("zero-or-one",	[[cXTItem, '*']],	function(oSequence1) {
	if (oSequence1.length > 1)
		throw new cException("FORG0003");

	return oSequence1;
});

// fn:one-or-more($arg as item()*) as item()+
fStaticContext_defineSystemFunction("one-or-more",	[[cXTItem, '*']],	function(oSequence1) {
	if (!oSequence1.length)
		throw new cException("FORG0004");

	return oSequence1;
});

// fn:exactly-one($arg as item()*) as item()
fStaticContext_defineSystemFunction("exactly-one",	[[cXTItem, '*']],	function(oSequence1) {
	if (oSequence1.length != 1)
		throw new cException("FORG0005");

	return oSequence1;
});


// 15.3 Equals, Union, Intersection and Except
// fn:deep-equal($parameter1 as item()*, $parameter2 as item()*) as xs:boolean
// fn:deep-equal($parameter1 as item()*, $parameter2 as item()*, $collation as string) as xs:boolean
fStaticContext_defineSystemFunction("deep-equal",	[[cXTItem, '*'], [cXTItem, '*'], [cXSString, '', true]],	function(oSequence1, oSequence2, oCollation) {
	throw "Function '" + "deep-equal" + "' not implemented";
});


// 15.4 Aggregate Functions
// fn:count($arg as item()*) as xs:integer
fStaticContext_defineSystemFunction("count",	[[cXTItem, '*']],	function(oSequence1) {
	return new cXSInteger(oSequence1.length);
});

// fn:avg($arg as xs:anyAtomicType*) as xs:anyAtomicType?
fStaticContext_defineSystemFunction("avg",	[[cXSAnyAtomicType, '*']],	function(oSequence1) {
	if (!oSequence1.length)
		return null;

	//
	try {
		var vValue	= oSequence1[0];
		if (vValue instanceof cXSUntypedAtomic)
			vValue	= cXSDouble.cast(vValue);
		for (var nIndex = 1, nLength = oSequence1.length, vRight; nIndex < nLength; nIndex++) {
			vRight	= oSequence1[nIndex];
			if (vRight instanceof cXSUntypedAtomic)
				vRight	= cXSDouble.cast(vRight);
			vValue	= hAdditiveExpr_operators['+'](vValue, vRight, this);
		}
		return hMultiplicativeExpr_operators['div'](vValue, new cXSInteger(nLength), this);
	}
	catch (e) {
		// XPTY0004: Arithmetic operator is not defined for provided arguments
		throw e.code != "XPTY0004" ? e : new cException("FORG0006"

		);
	}
});

// fn:max($arg as xs:anyAtomicType*) as xs:anyAtomicType?
// fn:max($arg as xs:anyAtomicType*, $collation as string) as xs:anyAtomicType?
fStaticContext_defineSystemFunction("max",	[[cXSAnyAtomicType, '*'], [cXSString, '', true]],	function(oSequence1, oCollation) {
	if (!oSequence1.length)
		return null;

	// TODO: Implement collation

	//
	try {
		var vValue	= oSequence1[0];
		if (vValue instanceof cXSUntypedAtomic)
			vValue	= cXSDouble.cast(vValue);
		for (var nIndex = 1, nLength = oSequence1.length, vRight; nIndex < nLength; nIndex++) {
			vRight	= oSequence1[nIndex];
			if (vRight instanceof cXSUntypedAtomic)
				vRight	= cXSDouble.cast(vRight);
			if (hComparisonExpr_ValueComp_operators['ge'](vRight, vValue, this).valueOf())
				vValue	= vRight;
		}
		return vValue;
	}
	catch (e) {
		// XPTY0004: Cannot compare {type1} with {type2}
		throw e.code != "XPTY0004" ? e : new cException("FORG0006"

		);
	}
});

// fn:min($arg as xs:anyAtomicType*) as xs:anyAtomicType?
// fn:min($arg as xs:anyAtomicType*, $collation as string) as xs:anyAtomicType?
fStaticContext_defineSystemFunction("min",	[[cXSAnyAtomicType, '*'], [cXSString, '', true]],	function(oSequence1, oCollation) {
	if (!oSequence1.length)
		return null;

	// TODO: Implement collation

	//
	try {
		var vValue	= oSequence1[0];
		if (vValue instanceof cXSUntypedAtomic)
			vValue	= cXSDouble.cast(vValue);
		for (var nIndex = 1, nLength = oSequence1.length, vRight; nIndex < nLength; nIndex++) {
			vRight	= oSequence1[nIndex];
			if (vRight instanceof cXSUntypedAtomic)
				vRight	= cXSDouble.cast(vRight);
			if (hComparisonExpr_ValueComp_operators['le'](vRight, vValue, this).valueOf())
				vValue	= vRight;
			}
		return vValue;
	}
	catch (e) {
		// Cannot compare {type1} with {type2}
		throw e.code != "XPTY0004" ? e : new cException("FORG0006"

		);
	}
});

// fn:sum($arg as xs:anyAtomicType*) as xs:anyAtomicType
// fn:sum($arg as xs:anyAtomicType*, $zero as xs:anyAtomicType?) as xs:anyAtomicType?
fStaticContext_defineSystemFunction("sum",	[[cXSAnyAtomicType, '*'], [cXSAnyAtomicType, '?', true]],	function(oSequence1, oZero) {
	if (!oSequence1.length) {
		if (arguments.length > 1)
			return oZero;
		else
			return new cXSDouble(0);

		return null;
	}

	// TODO: Implement collation

	//
	try {
		var vValue	= oSequence1[0];
		if (vValue instanceof cXSUntypedAtomic)
			vValue	= cXSDouble.cast(vValue);
		for (var nIndex = 1, nLength = oSequence1.length, vRight; nIndex < nLength; nIndex++) {
			vRight	= oSequence1[nIndex];
			if (vRight instanceof cXSUntypedAtomic)
				vRight	= cXSDouble.cast(vRight);
			vValue	= hAdditiveExpr_operators['+'](vValue, vRight, this);
		}
		return vValue;
	}
	catch (e) {
		// XPTY0004: Arithmetic operator is not defined for provided arguments
		throw e.code != "XPTY0004" ? e : new cException("FORG0006"

		);
	}
});


// 15.5 Functions and Operators that Generate Sequences
// fn:id($arg as xs:string*) as element()*
// fn:id($arg as xs:string*, $node as node()) as element()*
fStaticContext_defineSystemFunction("id",	[[cXSString, '*'], [cXTNode, '', true]],	function(oSequence1, oNode) {
	if (arguments.length < 2) {
		if (!this.DOMAdapter.isNode(this.item))
			throw new cException("XPTY0004"

			);
		oNode	= this.item;
	}

	// Get root node and check if it is Document
	var oDocument	= hStaticContext_functions["root"].call(this, oNode);
	if (this.DOMAdapter.getProperty(oDocument, "nodeType") != 9)
		throw new cException("FODC0001");

	// Search for elements
	var oSequence	= [];
	for (var nIndex = 0; nIndex < oSequence1.length; nIndex++)
		for (var nRightIndex = 0, aValue = fString_trim(oSequence1[nIndex]).split(/\s+/), nRightLength = aValue.length; nRightIndex < nRightLength; nRightIndex++)
			if ((oNode = this.DOMAdapter.getElementById(oDocument, aValue[nRightIndex])) && fArray_indexOf(oSequence, oNode) ==-1)
				oSequence.push(oNode);
	//
	return fFunction_sequence_order(oSequence, this);
});

// fn:idref($arg as xs:string*) as node()*
// fn:idref($arg as xs:string*, $node as node()) as node()*
fStaticContext_defineSystemFunction("idref",	[[cXSString, '*'], [cXTNode, '', true]],	function(oSequence1, oNode) {
	throw "Function '" + "idref" + "' not implemented";
});

// fn:doc($uri as xs:string?) as document-node()?
fStaticContext_defineSystemFunction("doc",			[[cXSString, '?', true]],	function(oUri) {
	throw "Function '" + "doc" + "' not implemented";
});

// fn:doc-available($uri as xs:string?) as xs:boolean
fStaticContext_defineSystemFunction("doc-available",	[[cXSString, '?', true]],	function(oUri) {
	throw "Function '" + "doc-available" + "' not implemented";
});

// fn:collection() as node()*
// fn:collection($arg as xs:string?) as node()*
fStaticContext_defineSystemFunction("collection",	[[cXSString, '?', true]],	function(oUri) {
	throw "Function '" + "collection" + "' not implemented";
});

// fn:element-with-id($arg as xs:string*) as element()*
// fn:element-with-id($arg as xs:string*, $node as node()) as element()*
fStaticContext_defineSystemFunction("element-with-id",	[[cXSString, '*'], [cXTNode, '', true]],	function(oSequence1, oNode) {
	throw "Function '" + "element-with-id" + "' not implemented";
});

// EBV calculation
function fFunction_sequence_toEBV(oSequence1, oContext) {
	if (!oSequence1.length)
		return false;

	var oItem	= oSequence1[0];
	if (oContext.DOMAdapter.isNode(oItem))
		return true;

	if (oSequence1.length == 1) {
		if (oItem instanceof cXSBoolean)
			return oItem.value.valueOf();
		if (oItem instanceof cXSString)
			return !!oItem.valueOf().length;
		if (fXSAnyAtomicType_isNumeric(oItem))
			return !(fIsNaN(oItem.valueOf()) || oItem.valueOf() == 0);

		throw new cException("FORG0006"

		);
	}

	throw new cException("FORG0006"

	);
};

function fFunction_sequence_atomize(oSequence1, oContext) {
	var oSequence	= [];
	for (var nIndex = 0, nLength = oSequence1.length, oItem, vItem; nIndex < nLength; nIndex++) {
		oItem	= oSequence1[nIndex];
		vItem	= null;
		// Untyped
		if (oItem == null)
			vItem	= null;
		// Node type
		else
		if (oContext.DOMAdapter.isNode(oItem)) {
			var fGetProperty	= oContext.DOMAdapter.getProperty;
			switch (fGetProperty(oItem, "nodeType")) {
				case 1:	// ELEMENT_NODE
					vItem	= new cXSUntypedAtomic(fGetProperty(oItem, "textContent"));
					break;
				case 2:	// ATTRIBUTE_NODE
					vItem	= new cXSUntypedAtomic(fGetProperty(oItem, "value"));
					break;
				case 3:	// TEXT_NODE
				case 4:	// CDATA_SECTION_NODE
				case 8:	// COMMENT_NODE
					vItem	= new cXSUntypedAtomic(fGetProperty(oItem, "data"));
					break;
				case 7:	// PROCESSING_INSTRUCTION_NODE
					vItem	= new cXSUntypedAtomic(fGetProperty(oItem, "data"));
					break;
				case 9:	// DOCUMENT_NODE
					var oNode	= fGetProperty(oItem, "documentElement");
					vItem	= new cXSUntypedAtomic(oNode ? fGetProperty(oNode, "textContent") : '');
					break;
			}
		}
		// Base types
		else
		if (oItem instanceof cXSAnyAtomicType)
			vItem	= oItem;

		//
		if (vItem != null)
			oSequence.push(vItem);
	}

	return oSequence;
};

// Orders items in sequence in document order
function fFunction_sequence_order(oSequence1, oContext) {
	return oSequence1.sort(function(oNode, oNode2) {
		var nPosition	= oContext.DOMAdapter.compareDocumentPosition(oNode, oNode2);
		return nPosition & 2 ? 1 : nPosition & 4 ?-1 : 0;
	});
};

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

/*
	7.2 Functions to Assemble and Disassemble Strings
		codepoints-to-string
		string-to-codepoints

	7.3 Equality and Comparison of Strings
		compare
		codepoint-equal

	7.4 Functions on String Values
		concat
		string-join
		substring
		string-length
		normalize-space
		normalize-unicode
		upper-case
		lower-case
		translate
		encode-for-uri
		iri-to-uri
		escape-html-uri

	7.5 Functions Based on Substring Matching
		contains
		starts-with
		ends-with
		substring-before
		substring-after

	7.6 String Functions that Use Pattern Matching
		matches
		replace
		tokenize
*/

// 7.2 Functions to Assemble and Disassemble Strings
// fn:codepoints-to-string($arg as xs:integer*) as xs:string
fStaticContext_defineSystemFunction("codepoints-to-string",	[[cXSInteger, '*']],	function(oSequence1) {
	var aValue	= [];
	for (var nIndex = 0, nLength = oSequence1.length; nIndex < nLength; nIndex++)
		aValue.push(cString.fromCharCode(oSequence1[nIndex]));

	return new cXSString(aValue.join(''));
});

// fn:string-to-codepoints($arg as xs:string?) as xs:integer*
fStaticContext_defineSystemFunction("string-to-codepoints",	[[cXSString, '?']],	function(oValue) {
	if (oValue == null)
		return null;

	var sValue	= oValue.valueOf();
	if (sValue == '')
		return [];

	var oSequence	= [];
	for (var nIndex = 0, nLength = sValue.length; nIndex < nLength; nIndex++)
		oSequence.push(new cXSInteger(sValue.charCodeAt(nIndex)));

	return oSequence;
});

// 7.3 Equality and Comparison of Strings
// fn:compare($comparand1 as xs:string?, $comparand2 as xs:string?) as xs:integer?
// fn:compare($comparand1 as xs:string?, $comparand2 as xs:string?, $collation as xs:string) as xs:integer?
fStaticContext_defineSystemFunction("compare",	[[cXSString, '?'], [cXSString, '?'], [cXSString, '', true]],	function(oValue1, oValue2, oCollation) {
	if (oValue1 == null || oValue2 == null)
		return null;

	var sCollation	= this.staticContext.defaultCollationName,
		vCollation;
	if (arguments.length > 2)
		sCollation	= oCollation.valueOf();

	vCollation	= sCollation == sNS_XPF + "/collation/codepoint" ? oCodepointStringCollator : this.staticContext.getCollation(sCollation);
	if (!vCollation)
		throw new cException("FOCH0002"

		);

	return new cXSInteger(vCollation.compare(oValue1.valueOf(), oValue2.valueOf()));
});

// fn:codepoint-equal($comparand1 as xs:string?, $comparand2  as xs:string?) as xs:boolean?
fStaticContext_defineSystemFunction("codepoint-equal",	[[cXSString, '?'], [cXSString, '?']],	function(oValue1, oValue2) {
	if (oValue1 == null || oValue2 == null)
		return null;

	// TODO: Check if JS uses 'Unicode code point collation' here

	return new cXSBoolean(oValue1.valueOf() == oValue2.valueOf());
});


// 7.4 Functions on String Values
// fn:concat($arg1 as xs:anyAtomicType?, $arg2 as xs:anyAtomicType?, ...) as xs:string
fStaticContext_defineSystemFunction("concat",	null,	function() {
	// check arguments length
	if (arguments.length < 2)
		throw new cException("XPST0017"

		);

	var aValue	= [];
	for (var nIndex = 0, nLength = arguments.length, oSequence; nIndex < nLength; nIndex++) {
		oSequence	= arguments[nIndex];
		// Assert cardinality
		fFunctionCall_assertSequenceCardinality(this, oSequence, '?'

		);
		//
		if (oSequence.length)
			aValue[aValue.length]	= cXSString.cast(fFunction_sequence_atomize(oSequence, this)[0]).valueOf();
	}

	return new cXSString(aValue.join(''));
});

// fn:string-join($arg1 as xs:string*, $arg2 as xs:string) as xs:string
fStaticContext_defineSystemFunction("string-join",	[[cXSString, '*'], [cXSString]],	function(oSequence1, oValue) {
	return new cXSString(oSequence1.join(oValue));
});

// fn:substring($sourceString as xs:string?, $startingLoc as xs:double) as xs:string
// fn:substring($sourceString as xs:string?, $startingLoc as xs:double, $length as xs:double) as xs:string
fStaticContext_defineSystemFunction("substring",	[[cXSString, '?'], [cXSDouble], [cXSDouble, '', true]],	function(oValue, oStart, oLength) {
	var sValue	= oValue == null ? '' : oValue.valueOf(),
		nStart	= cMath.round(oStart) - 1,
		nEnd	= arguments.length > 2 ? nStart + cMath.round(oLength) : sValue.length;

	// TODO: start can be negative
	return new cXSString(nEnd > nStart ? sValue.substring(nStart, nEnd) : '');
});

// fn:string-length() as xs:integer
// fn:string-length($arg as xs:string?) as xs:integer
fStaticContext_defineSystemFunction("string-length",	[[cXSString, '?', true]],	function(oValue) {
	if (!arguments.length) {
		if (!this.item)
			throw new cException("XPDY0002");
		oValue	= cXSString.cast(fFunction_sequence_atomize([this.item], this)[0]);
	}
	return new cXSInteger(oValue == null ? 0 : oValue.valueOf().length);
});

// fn:normalize-space() as xs:string
// fn:normalize-space($arg as xs:string?) as xs:string
fStaticContext_defineSystemFunction("normalize-space",	[[cXSString, '?', true]],	function(oValue) {
	if (!arguments.length) {
		if (!this.item)
			throw new cException("XPDY0002");
		oValue	= cXSString.cast(fFunction_sequence_atomize([this.item], this)[0]);
	}
	return new cXSString(oValue == null ? '' : fString_trim(oValue).replace(/\s\s+/g, ' '));
});

// fn:normalize-unicode($arg as xs:string?) as xs:string
// fn:normalize-unicode($arg as xs:string?, $normalizationForm as xs:string) as xs:string
fStaticContext_defineSystemFunction("normalize-unicode",	[[cXSString, '?'], [cXSString, '', true]],	function(oValue, oNormalization) {
	throw "Function '" + "normalize-unicode" + "' not implemented";
});

// fn:upper-case($arg as xs:string?) as xs:string
fStaticContext_defineSystemFunction("upper-case",	[[cXSString, '?']],	function(oValue) {
	return new cXSString(oValue == null ? '' : oValue.valueOf().toUpperCase());
});

// fn:lower-case($arg as xs:string?) as xs:string
fStaticContext_defineSystemFunction("lower-case",	[[cXSString, '?']],	function(oValue) {
	return new cXSString(oValue == null ? '' : oValue.valueOf().toLowerCase());
});

// fn:translate($arg as xs:string?, $mapString as xs:string, $transString as xs:string) as xs:string
fStaticContext_defineSystemFunction("translate",	[[cXSString, '?'], [cXSString], [cXSString]],	function(oValue, oMap, oTranslate) {
	if (oValue == null)
		return new cXSString('');

	var aValue	= oValue.valueOf().split(''),
		aMap	= oMap.valueOf().split(''),
		aTranslate	= oTranslate.valueOf().split(''),
		nTranslateLength	= aTranslate.length,
		aReturn	= [];
	for (var nIndex = 0, nLength = aValue.length, nPosition; nIndex < nLength; nIndex++)
		if ((nPosition = aMap.indexOf(aValue[nIndex])) ==-1)
			aReturn[aReturn.length]	= aValue[nIndex];
		else
		if (nPosition < nTranslateLength)
			aReturn[aReturn.length]	= aTranslate[nPosition];

	return new cXSString(aReturn.join(''));
});

// fn:encode-for-uri($uri-part as xs:string?) as xs:string
fStaticContext_defineSystemFunction("encode-for-uri",	[[cXSString, '?']],	function(oValue) {
	return new cXSString(oValue == null ? '' : window.encodeURIComponent(oValue));
});

// fn:iri-to-uri($iri as xs:string?) as xs:string
fStaticContext_defineSystemFunction("iri-to-uri",		[[cXSString, '?']],	function(oValue) {
	return new cXSString(oValue == null ? '' : window.encodeURI(window.decodeURI(oValue)));
});

// fn:escape-html-uri($uri as xs:string?) as xs:string
fStaticContext_defineSystemFunction("escape-html-uri",	[[cXSString, '?']],	function(oValue) {
	if (oValue == null || oValue.valueOf() == '')
		return new cXSString('');
	// Encode
	var aValue	= oValue.valueOf().split('');
	for (var nIndex = 0, nLength = aValue.length, nCode; nIndex < nLength; nIndex++)
		if ((nCode = aValue[nIndex].charCodeAt(0)) < 32 || nCode > 126)
			aValue[nIndex]	= window.encodeURIComponent(aValue[nIndex]);
	return new cXSString(aValue.join(''));
});


// 7.5 Functions Based on Substring Matching
// fn:contains($arg1 as xs:string?, $arg2 as xs:string?) as xs:boolean
// fn:contains($arg1 as xs:string?, $arg2 as xs:string?, $collation as xs:string) as xs:boolean
fStaticContext_defineSystemFunction("contains",	[[cXSString, '?'], [cXSString, '?'], [cXSString, '', true]],	function(oValue, oSearch, oCollation) {
	if (arguments.length > 2)
		throw "Collation parameter in function '" + "contains" + "' is not implemented";
	return new cXSBoolean((oValue == null ? '' : oValue.valueOf()).indexOf(oSearch == null ? '' : oSearch.valueOf()) >= 0);
});

// fn:starts-with($arg1 as xs:string?, $arg2 as xs:string?) as xs:boolean
// fn:starts-with($arg1 as xs:string?, $arg2 as xs:string?, $collation as xs:string) as xs:boolean
fStaticContext_defineSystemFunction("starts-with",	[[cXSString, '?'], [cXSString, '?'], [cXSString, '', true]],	function(oValue, oSearch, oCollation) {
	if (arguments.length > 2)
		throw "Collation parameter in function '" + "starts-with" + "' is not implemented";
	return new cXSBoolean((oValue == null ? '' : oValue.valueOf()).indexOf(oSearch == null ? '' : oSearch.valueOf()) == 0);
});

// fn:ends-with($arg1 as xs:string?, $arg2 as xs:string?) as xs:boolean
// fn:ends-with($arg1 as xs:string?, $arg2 as xs:string?, $collation as xs:string) as xs:boolean
fStaticContext_defineSystemFunction("ends-with",	[[cXSString, '?'], [cXSString, '?'], [cXSString, '', true]],	function(oValue, oSearch, oCollation) {
	if (arguments.length > 2)
		throw "Collation parameter in function '" + "ends-with" + "' is not implemented";
	var sValue	= oValue == null ? '' : oValue.valueOf(),
		sSearch	= oSearch == null ? '' : oSearch.valueOf();

	return new cXSBoolean(sValue.indexOf(sSearch) == sValue.length - sSearch.length);
});

// fn:substring-before($arg1 as xs:string?, $arg2 as xs:string?) as xs:string
// fn:substring-before($arg1 as xs:string?, $arg2 as xs:string?, $collation as xs:string) as xs:string
fStaticContext_defineSystemFunction("substring-before",	[[cXSString, '?'], [cXSString, '?'], [cXSString, '', true]],	function(oValue, oSearch, oCollation) {
	if (arguments.length > 2)
		throw "Collation parameter in function '" + "substring-before" + "' is not implemented";

	var sValue	= oValue == null ? '' : oValue.valueOf(),
		sSearch	= oSearch == null ? '' : oSearch.valueOf(),
		nPosition;

	return new cXSString((nPosition = sValue.indexOf(sSearch)) >= 0 ? sValue.substring(0, nPosition) : '');
});

// fn:substring-after($arg1 as xs:string?, $arg2 as xs:string?) as xs:string
// fn:substring-after($arg1 as xs:string?, $arg2 as xs:string?, $collation as xs:string) as xs:string
fStaticContext_defineSystemFunction("substring-after",	[[cXSString, '?'], [cXSString, '?'], [cXSString, '', true]],	function(oValue, oSearch, oCollation) {
	if (arguments.length > 2)
		throw "Collation parameter in function '" + "substring-after" + "' is not implemented";

	var sValue	= oValue == null ? '' : oValue.valueOf(),
		sSearch	= oSearch == null ? '' : oSearch.valueOf(),
		nPosition;

	return new cXSString((nPosition = sValue.indexOf(sSearch)) >= 0 ? sValue.substring(nPosition + sSearch.length) : '');
});


// 7.6 String Functions that Use Pattern Matching
function fFunction_string_createRegExp(sValue, sFlags) {
	var d1	= '\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF',
		d2	= '\u0370-\u037D\u037F-\u1FFF\u200C-\u200D',
		d3	= '\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD',
		c	= 'A-Z_a-z\\-.0-9\u00B7' + d1 + '\u0300-\u036F' + d2 + '\u203F-\u2040' + d3,
		i	= 'A-Z_a-z' + d1 + d2 + d3;

	sValue	= sValue
				.replace(/\[\\i-\[:\]\]/g, '[' + i + ']')
				.replace(/\[\\c-\[:\]\]/g, '[' + c + ']')
				.replace(/\\i/g, '[:' + i + ']')
				.replace(/\\I/g, '[^:' + i + ']')
				.replace(/\\c/g, '[:' + c + ']')
				.replace(/\\C/g, '[^:' + c + ']');

	// Check if all flags are legal
	if (sFlags && !sFlags.match(/^[smix]+$/))
		throw new cException("FORX0001");	// Invalid character '{%0}' in regular expression flags

	var bFlagS	= sFlags.indexOf('s') >= 0,
		bFlagX	= sFlags.indexOf('x') >= 0;
	if (bFlagS || bFlagX) {
		// Strip 's' and 'x' from flags
		sFlags	= sFlags.replace(/[sx]/g, '');
		var aValue	= [],
			rValue	= /\s/;
		for (var nIndex = 0, nLength = sValue.length, bValue = false, sCharCurr, sCharPrev = ''; nIndex < nLength; nIndex++) {
			sCharCurr	= sValue.charAt(nIndex);
			if (sCharPrev != '\\') {
				if (sCharCurr == '[')
					bValue	= true;
				else
				if (sCharCurr == ']')
					bValue	= false;
			}
			// Replace '\s' for flag 'x' if not in []
			if (bValue || !(bFlagX && rValue.test(sCharCurr))) {
				// Replace '.' for flag 's' if not in []
				if (!bValue && (bFlagS && sCharCurr == '.' && sCharPrev != '\\'))
					aValue[aValue.length]	= '(?:.|\\s)';
				else
					aValue[aValue.length]	= sCharCurr;
			}
			sCharPrev	= sCharCurr;
		}
		sValue	= aValue.join('');
	}

	return new cRegExp(sValue, sFlags + 'g');
};

// fn:matches($input as xs:string?, $pattern as xs:string) as xs:boolean
// fn:matches($input as xs:string?, $pattern as xs:string, $flags as xs:string) as xs:boolean
fStaticContext_defineSystemFunction("matches",	[[cXSString, '?'], [cXSString], [cXSString, '', true]],	function(oValue, oPattern, oFlags) {
	var sValue	= oValue == null ? '' : oValue.valueOf(),
		rRegExp	= fFunction_string_createRegExp(oPattern.valueOf(), arguments.length > 2 ? oFlags.valueOf() : '');

	return new cXSBoolean(rRegExp.test(sValue));
});

// fn:replace($input as xs:string?, $pattern as xs:string, $replacement as xs:string) as xs:string
// fn:replace($input as xs:string?, $pattern as xs:string, $replacement as xs:string, $flags as xs:string) as xs:string
fStaticContext_defineSystemFunction("replace",	[[cXSString, '?'], [cXSString],  [cXSString], [cXSString, '', true]],	function(oValue, oPattern, oReplacement, oFlags) {
	var sValue	= oValue == null ? '' : oValue.valueOf(),
		rRegExp	= fFunction_string_createRegExp(oPattern.valueOf(), arguments.length > 3 ? oFlags.valueOf() : '');

	return new cXSBoolean(sValue.replace(rRegExp, oReplacement.valueOf()));
});

// fn:tokenize($input as xs:string?, $pattern as xs:string) as xs:string*
// fn:tokenize($input as xs:string?, $pattern as xs:string, $flags as xs:string) as xs:string*
fStaticContext_defineSystemFunction("tokenize",	[[cXSString, '?'], [cXSString], [cXSString, '', true]],	function(oValue, oPattern, oFlags) {
	var sValue	= oValue == null ? '' : oValue.valueOf(),
		rRegExp	= fFunction_string_createRegExp(oPattern.valueOf(), arguments.length > 2 ? oFlags.valueOf() : '');

	var oSequence	= [];
	for (var nIndex = 0, aValue = sValue.split(rRegExp), nLength = aValue.length; nIndex < nLength; nIndex++)
		oSequence.push(new cXSString(aValue[nIndex]));

	return oSequence;
});

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

/*
	4 The Trace Function
		trace
*/

// fn:trace($value as item()*, $label as xs:string) as item()*
fStaticContext_defineSystemFunction("trace",		[[cXTItem, '*'], [cXSString]],	function(oSequence1, oLabel) {
	var oConsole	= window.console;
	if (oConsole && oConsole.log)
		oConsole.log(oLabel.valueOf(), oSequence1);
	return oSequence1;
});
/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

var oCodepointStringCollator	= new cStringCollator;

oCodepointStringCollator.equals	= function(sValue1, sValue2) {
	return sValue1 == sValue2;
};

oCodepointStringCollator.compare	= function(sValue1, sValue2) {
	return sValue1 == sValue2 ? 0 : sValue1 > sValue2 ? 1 :-1;
};
function cLXDOMAdapter() {

};

cLXDOMAdapter.prototype	= new cDOMAdapter;

var oLXDOMAdapter_staticContext	= new cStaticContext;

cLXDOMAdapter.prototype.getProperty	= function(oNode, sName) {
		if (sName in oNode)
		return oNode[sName];

		if (sName == "baseURI") {
		var sBaseURI	= '',
			fResolveUri	= oLXDOMAdapter_staticContext.getFunction('{' + "http://www.w3.org/2005/xpath-functions" + '}' + "resolve-uri"),
			cXSString	= oLXDOMAdapter_staticContext.getDataType('{' + "http://www.w3.org/2001/XMLSchema" + '}' + "string");

		for (var oParent = oNode, sUri; oParent; oParent = oParent.parentNode)
			if (oParent.nodeType == 1  && (sUri = oParent.getAttribute("xml:base")))
				sBaseURI	= fResolveUri(new cXSString(sUri), new cXSString(sBaseURI)).toString();
				return sBaseURI;
	}
	else
	if (sName == "textContent") {
		var aText = [];
		(function(oNode) {
			for (var nIndex = 0, oChild; oChild = oNode.childNodes[nIndex]; nIndex++)
				if (oChild.nodeType == 3  || oChild.nodeType == 4 )
					aText.push(oChild.data);
				else
				if (oChild.nodeType == 1  && oChild.firstChild)
					arguments.callee(oChild);
		})(oNode);
		return aText.join('');
	}
};

cLXDOMAdapter.prototype.compareDocumentPosition	= function(oNode, oChild) {
		if ("compareDocumentPosition" in oNode)
		return oNode.compareDocumentPosition(oChild);

		if (oChild == oNode)
		return 0;

		var oAttr1	= null,
		oAttr2	= null,
		aAttributes,
		oAttr, oElement, nIndex, nLength;
	if (oNode.nodeType == 2 ) {
		oAttr1	= oNode;
		oNode	= this.getProperty(oAttr1, "ownerElement");
	}
	if (oChild.nodeType == 2 ) {
		oAttr2	= oChild;
		oChild	= this.getProperty(oAttr2, "ownerElement");
	}

		if (oAttr1 && oAttr2 && oNode && oNode == oChild) {
		for (nIndex = 0, aAttributes = this.getProperty(oNode, "attributes"), nLength = aAttributes.length; nIndex < nLength; nIndex++) {
			oAttr	= aAttributes[nIndex];
			if (oAttr == oAttr1)
				return 32  | 4 ;
			if (oAttr == oAttr2)
				return 32  | 2 ;
		}
	}

		var aChain1	= [], nLength1, oNode1,
		aChain2	= [], nLength2, oNode2;
		if (oAttr1)
		aChain1.push(oAttr1);
	for (oElement = oNode; oElement; oElement = oElement.parentNode)
		aChain1.push(oElement);
	if (oAttr2)
		aChain2.push(oAttr2);
	for (oElement = oChild; oElement; oElement = oElement.parentNode)
		aChain2.push(oElement);
		if (((oNode.ownerDocument || oNode) != (oChild.ownerDocument || oChild)) || (aChain1[aChain1.length - 1] != aChain2[aChain2.length - 1]))
		return 32  | 1 ;
		for (nIndex = cMath.min(nLength1 = aChain1.length, nLength2 = aChain2.length); nIndex; --nIndex)
		if ((oNode1 = aChain1[--nLength1]) != (oNode2 = aChain2[--nLength2])) {
						if (oNode1.nodeType == 2 )
				return 4 ;
			if (oNode2.nodeType == 2 )
				return 2 ;
						if (!oNode2.nextSibling)
				return 4 ;
			if (!oNode1.nextSibling)
				return 2 ;
			for (oElement = oNode2.previousSibling; oElement; oElement = oElement.previousSibling)
				if (oElement == oNode1)
					return 4 ;
			return 2 ;
		}
		return nLength1 < nLength2 ? 4  | 16  : 2  | 8 ;
};

cLXDOMAdapter.prototype.lookupNamespaceURI	= function(oNode, sPrefix) {
		if ("lookupNamespaceURI" in oNode)
		return oNode.lookupNamespaceURI(sPrefix);

		for (; oNode && oNode.nodeType != 9  ; oNode = oNode.parentNode)
		if (sPrefix == this.getProperty(oChild, "prefix"))
			return this.getProperty(oNode, "namespaceURI");
		else
		if (oNode.nodeType == 1)				for (var oAttributes = this.getProperty(oNode, "attributes"), nIndex = 0, nLength = oAttributes.length, sName = "xmlns" + ':' + sPrefix; nIndex < nLength; nIndex++)
				if (this.getProperty(oAttributes[nIndex], "nodeName") == sName)
					return this.getProperty(oAttributes[nIndex], "value");
	return null;
};

cLXDOMAdapter.prototype.getElementsByTagNameNS	= function(oNode, sNameSpaceURI, sLocalName) {
		if ("getElementsByTagNameNS" in oNode)
		return oNode.getElementsByTagNameNS(sNameSpaceURI, sLocalName);

		var aElements	= [],
		bNameSpaceURI	= '*' == sNameSpaceURI,
		bLocalName		= '*' == sLocalName;
	(function(oNode) {
		for (var nIndex = 0, oChild; oChild = oNode.childNodes[nIndex]; nIndex++)
			if (oChild.nodeType == 1) {					if ((bLocalName || sLocalName == this.getProperty(oChild, "localName")) && (bNameSpaceURI || sNameSpaceURI == this.getProperty(oChild, "namespaceURI")))
					aElements[aElements.length]	= oChild;
				if (oChild.firstChild)
					arguments.callee(oChild);
			}
	})(oNode);
	return aElements;
};

var oMSHTMLDOMAdapter	= new cLXDOMAdapter;

oMSHTMLDOMAdapter.getProperty	= function(oNode, sName) {
	if (sName == "localName") {
		if (oNode.nodeType == 1)
			return oNode.nodeName.toLowerCase();
	}
	if (sName == "prefix")
		return null;
	if (sName == "namespaceURI")
		return oNode.nodeType == 1 ? "http://www.w3.org/1999/xhtml" : null;
	if (sName == "textContent")
		return oNode.innerText;
	if (sName == "attributes" && oNode.nodeType == 1) {
		var aAttributes	= [];
		for (var nIndex = 0, oAttributes = oNode.attributes, nLength = oAttributes.length, oNode2, oAttribute; nIndex < nLength; nIndex++) {
			oNode2	= oAttributes[nIndex];
			if (oNode2.specified) {
				oAttribute	= new cAttr;
				oAttribute.ownerElement	= oNode;
				oAttribute.ownerDocument= oNode.ownerDocument;
				oAttribute.specified	= true;
				oAttribute.value		=
				oAttribute.nodeValue	= oNode2.nodeValue;
				oAttribute.name			=
				oAttribute.nodeName		=
								oAttribute.localName	= oNode2.nodeName.toLowerCase();
								aAttributes[aAttributes.length]	= oAttribute;
			}
		}
		return aAttributes;
	}
		return cLXDOMAdapter.prototype.getProperty.call(this, oNode, sName);
};


var oMSXMLDOMAdapter	= new cLXDOMAdapter;

oMSXMLDOMAdapter.getProperty	= function(oNode, sName) {
	if (sName == "localName") {
		if (oNode.nodeType == 7)
			return null;
		if (oNode.nodeType == 1)
			return oNode.baseName;
	}
	if (sName == "prefix" || sName == "namespaceURI")
		return oNode[sName] || null;
	if (sName == "textContent")
		return oNode.text;
	if (sName == "attributes" && oNode.nodeType == 1) {
		var aAttributes	= [];
		for (var nIndex = 0, oAttributes = oNode.attributes, nLength = oAttributes.length, oNode2, oAttribute; nIndex < nLength; nIndex++) {
			oNode2	= oAttributes[nIndex];
			if (oNode2.specified) {
				oAttribute	= new cAttr;
				oAttribute.nodeType		= 2;
				oAttribute.ownerElement	= oNode;
				oAttribute.ownerDocument= oNode.ownerDocument;
				oAttribute.specified	= true;
				oAttribute.value		=
				oAttribute.nodeValue	= oNode2.nodeValue;
				oAttribute.name			=
				oAttribute.nodeName		= oNode2.nodeName;
								oAttribute.localName	= oNode2.baseName;
				oAttribute.prefix		= oNode2.prefix || null;
				oAttribute.namespaceURI	= oNode2.namespaceURI || null;
								aAttributes[aAttributes.length]	= oAttribute;
			}
		}
		return aAttributes;
	}
		return cLXDOMAdapter.prototype.getProperty.call(this, oNode, sName);
};

oMSXMLDOMAdapter.getElementById	= function(oDocument, sId) {
	return oDocument.nodeFromID(sId);
};

function cEvaluator() {

};

cEvaluator.prototype.defaultOL2DOMAdapter		= new cLXDOMAdapter;
cEvaluator.prototype.defaultOL2HTMLDOMAdapter	= new cLXDOMAdapter;

cEvaluator.prototype.defaultHTMLStaticContext	= new cStaticContext;
cEvaluator.prototype.defaultHTMLStaticContext.baseURI	= window.document.location.href;
cEvaluator.prototype.defaultHTMLStaticContext.defaultFunctionNamespace	= "http://www.w3.org/2005/xpath-functions";
cEvaluator.prototype.defaultHTMLStaticContext.defaultElementNamespace	= "http://www.w3.org/1999/xhtml";

cEvaluator.prototype.defaultXMLStaticContext	= new cStaticContext;
cEvaluator.prototype.defaultXMLStaticContext.defaultFunctionNamespace	= "http://www.w3.org/2005/xpath-functions";

cEvaluator.prototype.bOldMS		= !!window.document.namespaces && !window.document.createElementNS;
cEvaluator.prototype.bOldW3		= !cEvaluator.prototype.bOldMS && window.document.documentElement.namespaceURI != "http://www.w3.org/1999/xhtml";

cEvaluator.prototype.defaultDOMAdapter		= new cDOMAdapter;

cEvaluator.prototype.compile	= function(sExpression, oStaticContext) {
    return new cExpression(sExpression, oStaticContext);
};

cEvaluator.prototype.evaluate	= function(oQuery, sExpression, fNSResolver) {
	if (! (oQuery instanceof window.jQuery))
        oQuery = new window.jQuery(oQuery)

    if (typeof sExpression == "undefined" || sExpression === null)
        sExpression	= '';

    var oNode	= oQuery[0];
    if (typeof oNode == "undefined")
        oNode	= null;

    var oStaticContext	= oNode && (oNode.nodeType == 9 ? oNode : oNode.ownerDocument).createElement("div").tagName == "DIV" ? this.defaultHTMLStaticContext : this.defaultXMLStaticContext;

    oStaticContext.namespaceResolver	= fNSResolver;

    var oExpression	= new cExpression(cString(sExpression), oStaticContext);

    oStaticContext.namespaceResolver	= null;

    var aSequence,
        oSequence	= new window.jQuery,
        oAdapter	= this.defaultOL2DOMAdapter;

    if (this.bOldMS)
        oAdapter	= oStaticContext == this.defaultHTMLStaticContext ? oMSHTMLDOMAdapter : oMSXMLDOMAdapter;
    else
    if (this.bOldW3 && oStaticContext == this.defaultHTMLStaticContext)
        oAdapter	= this.defaultOL2HTMLDOMAdapter;

    aSequence	= oExpression.evaluate(new cDynamicContext(oStaticContext, oNode, null, oAdapter));
    for (var nIndex = 0, nLength = aSequence.length, oItem; nIndex < nLength; nIndex++)
        oSequence.push(oAdapter.isNode(oItem = aSequence[nIndex]) ? oItem : cStaticContext.xs2js(oItem));

    return oSequence;
};

/*
 * XPath.js - Pure JavaScript implementation of XPath 2.0 parser and evaluator
 *
 * Copyright (c) 2012 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 *
 *
 */

var oXPathEvaluator	= new cEvaluator,
    oXPathClasses	= oXPathEvaluator.classes = {};

//
oXPathClasses.Exception		= cException;
oXPathClasses.Expression	= cExpression;
oXPathClasses.DOMAdapter	= cDOMAdapter;
oXPathClasses.StaticContext	= cStaticContext;
oXPathClasses.DynamicContext= cDynamicContext;
oXPathClasses.StringCollator= cStringCollator;

// Publish object
window.xpath	= oXPathEvaluator;

})()