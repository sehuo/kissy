function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/io/iframe-transport.js']) {
  _$jscoverage['/io/iframe-transport.js'] = {};
  _$jscoverage['/io/iframe-transport.js'].lineData = [];
  _$jscoverage['/io/iframe-transport.js'].lineData[6] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[7] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[10] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[11] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[12] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[30] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[31] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[35] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[42] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[48] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[54] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[55] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[60] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[68] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[69] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[72] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[73] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[74] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[75] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[76] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[78] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[79] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[80] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[81] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[82] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[83] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[84] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[87] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[90] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[91] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[94] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[95] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[96] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[99] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[102] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[111] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[119] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[121] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[124] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[133] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[134] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[137] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[138] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[141] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[143] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[144] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[145] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[149] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[150] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[153] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[158] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[168] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[169] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[173] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[174] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[175] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[178] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[181] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[183] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[185] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[187] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[191] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[193] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[195] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[196] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[198] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[200] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[202] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[203] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[215] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[216] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[219] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[221] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[222] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[229] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[233] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[235] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[236] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[241] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[247] = 0;
  _$jscoverage['/io/iframe-transport.js'].lineData[249] = 0;
}
if (! _$jscoverage['/io/iframe-transport.js'].functionData) {
  _$jscoverage['/io/iframe-transport.js'].functionData = [];
  _$jscoverage['/io/iframe-transport.js'].functionData[0] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[1] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[2] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[3] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[4] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[5] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[6] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[7] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[8] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[9] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[10] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[11] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[12] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[13] = 0;
  _$jscoverage['/io/iframe-transport.js'].functionData[14] = 0;
}
if (! _$jscoverage['/io/iframe-transport.js'].branchData) {
  _$jscoverage['/io/iframe-transport.js'].branchData = {};
  _$jscoverage['/io/iframe-transport.js'].branchData['68'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['78'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['81'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['112'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['113'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['133'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['137'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['149'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['168'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['173'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['173'][2] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['173'][3] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['193'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['198'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['202'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['215'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['221'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/io/iframe-transport.js'].branchData['235'] = [];
  _$jscoverage['/io/iframe-transport.js'].branchData['235'][1] = new BranchData();
}
_$jscoverage['/io/iframe-transport.js'].branchData['235'][1].init(3375, 21, 'eventType === \'error\'');
function visit64_235_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['221'][1].init(1499, 9, 'iframeDoc');
function visit63_221_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['215'][1].init(1218, 34, 'iframeDoc && iframeDoc.XMLDocument');
function visit62_215_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['202'][1].init(243, 38, 'S.startsWith(io.responseText, \'<?xml\')');
function visit61_202_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['198'][1].init(119, 27, 'iframeDoc && iframeDoc.body');
function visit60_198_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['193'][1].init(1030, 20, 'eventType === \'load\'');
function visit59_193_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['173'][3].init(455, 11, 'UA.ie === 6');
function visit58_173_3(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['173'][3].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['173'][2].init(430, 21, 'eventType === \'abort\'');
function visit57_173_2(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['173'][2].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['173'][1].init(430, 36, 'eventType === \'abort\' && UA.ie === 6');
function visit56_173_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['168'][1].init(319, 7, '!iframe');
function visit55_168_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['149'][1].init(1482, 11, 'UA.ie === 6');
function visit54_149_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['137'][1].init(1147, 5, 'query');
function visit53_137_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['133'][1].init(1063, 4, 'data');
function visit52_133_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['113'][1].init(83, 30, 'Dom.attr(form, \'action\') || \'\'');
function visit51_113_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['112'][1].init(26, 30, 'Dom.attr(form, \'target\') || \'\'');
function visit50_112_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['81'][1].init(117, 25, 'isArray && serializeArray');
function visit49_81_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['78'][1].init(139, 13, 'i < vs.length');
function visit48_78_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].branchData['68'][1].init(517, 31, 'doc.body || doc.documentElement');
function visit47_68_1(result) {
  _$jscoverage['/io/iframe-transport.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/io/iframe-transport.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/io/iframe-transport.js'].functionData[0]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[7]++;
  var Dom = require('dom'), IO = require('./base'), Event = require('event/dom');
  _$jscoverage['/io/iframe-transport.js'].lineData[10]++;
  var logger = S.getLogger('s/io');
  _$jscoverage['/io/iframe-transport.js'].lineData[11]++;
  var UA = require('ua');
  _$jscoverage['/io/iframe-transport.js'].lineData[12]++;
  var doc = S.Env.host.document, OK_CODE = 200, ERROR_CODE = 500, BREATH_INTERVAL = 30, iframeConverter = S.clone(IO.getConfig().converters.text);
  _$jscoverage['/io/iframe-transport.js'].lineData[30]++;
  iframeConverter.json = function(str) {
  _$jscoverage['/io/iframe-transport.js'].functionData[1]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[31]++;
  return S.parseJson(S.unEscapeHtml(str));
};
  _$jscoverage['/io/iframe-transport.js'].lineData[35]++;
  IO.setupConfig({
  converters: {
  iframe: iframeConverter, 
  text: {
  iframe: function(text) {
  _$jscoverage['/io/iframe-transport.js'].functionData[2]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[42]++;
  return text;
}}, 
  xml: {
  iframe: function(xml) {
  _$jscoverage['/io/iframe-transport.js'].functionData[3]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[48]++;
  return xml;
}}}});
  _$jscoverage['/io/iframe-transport.js'].lineData[54]++;
  function createIframe(xhr) {
    _$jscoverage['/io/iframe-transport.js'].functionData[4]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[55]++;
    var id = S.guid('io-iframe'), iframe, src = Dom.getEmptyIframeSrc();
    _$jscoverage['/io/iframe-transport.js'].lineData[60]++;
    iframe = xhr.iframe = Dom.create('<iframe ' + (src ? (' src="' + src + '" ') : '') + ' id="' + id + '"' + ' name="' + id + '"' + ' style="position:absolute;left:-9999px;top:-9999px;"/>');
    _$jscoverage['/io/iframe-transport.js'].lineData[68]++;
    Dom.prepend(iframe, visit47_68_1(doc.body || doc.documentElement));
    _$jscoverage['/io/iframe-transport.js'].lineData[69]++;
    return iframe;
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[72]++;
  function addDataToForm(query, form, serializeArray) {
    _$jscoverage['/io/iframe-transport.js'].functionData[5]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[73]++;
    var ret = [], isArray, vs, i, e;
    _$jscoverage['/io/iframe-transport.js'].lineData[74]++;
    S.each(query, function(data, k) {
  _$jscoverage['/io/iframe-transport.js'].functionData[6]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[75]++;
  isArray = S.isArray(data);
  _$jscoverage['/io/iframe-transport.js'].lineData[76]++;
  vs = S.makeArray(data);
  _$jscoverage['/io/iframe-transport.js'].lineData[78]++;
  for (i = 0; visit48_78_1(i < vs.length); i++) {
    _$jscoverage['/io/iframe-transport.js'].lineData[79]++;
    e = doc.createElement('input');
    _$jscoverage['/io/iframe-transport.js'].lineData[80]++;
    e.type = 'hidden';
    _$jscoverage['/io/iframe-transport.js'].lineData[81]++;
    e.name = k + (visit49_81_1(isArray && serializeArray) ? '[]' : '');
    _$jscoverage['/io/iframe-transport.js'].lineData[82]++;
    e.value = vs[i];
    _$jscoverage['/io/iframe-transport.js'].lineData[83]++;
    Dom.append(e, form);
    _$jscoverage['/io/iframe-transport.js'].lineData[84]++;
    ret.push(e);
  }
});
    _$jscoverage['/io/iframe-transport.js'].lineData[87]++;
    return ret;
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[90]++;
  function removeFieldsFromData(fields) {
    _$jscoverage['/io/iframe-transport.js'].functionData[7]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[91]++;
    Dom.remove(fields);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[94]++;
  function IframeTransport(io) {
    _$jscoverage['/io/iframe-transport.js'].functionData[8]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[95]++;
    this.io = io;
    _$jscoverage['/io/iframe-transport.js'].lineData[96]++;
    logger.info('use IframeTransport for: ' + io.config.url);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[99]++;
  S.augment(IframeTransport, {
  send: function() {
  _$jscoverage['/io/iframe-transport.js'].functionData[9]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[102]++;
  var self = this, io = self.io, c = io.config, fields, iframe, query, data = c.data, form = Dom.get(c.form);
  _$jscoverage['/io/iframe-transport.js'].lineData[111]++;
  self.attrs = {
  target: visit50_112_1(Dom.attr(form, 'target') || ''), 
  action: visit51_113_1(Dom.attr(form, 'action') || ''), 
  encoding: Dom.attr(form, 'encoding'), 
  enctype: Dom.attr(form, 'enctype'), 
  method: Dom.attr(form, 'method')};
  _$jscoverage['/io/iframe-transport.js'].lineData[119]++;
  self.form = form;
  _$jscoverage['/io/iframe-transport.js'].lineData[121]++;
  iframe = createIframe(io);
  _$jscoverage['/io/iframe-transport.js'].lineData[124]++;
  Dom.attr(form, {
  target: iframe.id, 
  action: io._getUrlForSend(), 
  method: 'post', 
  enctype: 'multipart/form-data', 
  encoding: 'multipart/form-data'});
  _$jscoverage['/io/iframe-transport.js'].lineData[133]++;
  if (visit52_133_1(data)) {
    _$jscoverage['/io/iframe-transport.js'].lineData[134]++;
    query = S.unparam(data);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[137]++;
  if (visit53_137_1(query)) {
    _$jscoverage['/io/iframe-transport.js'].lineData[138]++;
    fields = addDataToForm(query, form, c.serializeArray);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[141]++;
  self.fields = fields;
  _$jscoverage['/io/iframe-transport.js'].lineData[143]++;
  function go() {
    _$jscoverage['/io/iframe-transport.js'].functionData[10]++;
    _$jscoverage['/io/iframe-transport.js'].lineData[144]++;
    Event.on(iframe, 'load error', self._callback, self);
    _$jscoverage['/io/iframe-transport.js'].lineData[145]++;
    form.submit();
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[149]++;
  if (visit54_149_1(UA.ie === 6)) {
    _$jscoverage['/io/iframe-transport.js'].lineData[150]++;
    setTimeout(go, 0);
  } else {
    _$jscoverage['/io/iframe-transport.js'].lineData[153]++;
    go();
  }
}, 
  _callback: function(event) {
  _$jscoverage['/io/iframe-transport.js'].functionData[11]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[158]++;
  var self = this, form = self.form, io = self.io, eventType = event.type, iframeDoc, iframe = io.iframe;
  _$jscoverage['/io/iframe-transport.js'].lineData[168]++;
  if (visit55_168_1(!iframe)) {
    _$jscoverage['/io/iframe-transport.js'].lineData[169]++;
    return;
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[173]++;
  if (visit56_173_1(visit57_173_2(eventType === 'abort') && visit58_173_3(UA.ie === 6))) {
    _$jscoverage['/io/iframe-transport.js'].lineData[174]++;
    setTimeout(function() {
  _$jscoverage['/io/iframe-transport.js'].functionData[12]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[175]++;
  Dom.attr(form, self.attrs);
}, 0);
  } else {
    _$jscoverage['/io/iframe-transport.js'].lineData[178]++;
    Dom.attr(form, self.attrs);
  }
  _$jscoverage['/io/iframe-transport.js'].lineData[181]++;
  removeFieldsFromData(this.fields);
  _$jscoverage['/io/iframe-transport.js'].lineData[183]++;
  Event.detach(iframe);
  _$jscoverage['/io/iframe-transport.js'].lineData[185]++;
  setTimeout(function() {
  _$jscoverage['/io/iframe-transport.js'].functionData[13]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[187]++;
  Dom.remove(iframe);
}, BREATH_INTERVAL);
  _$jscoverage['/io/iframe-transport.js'].lineData[191]++;
  io.iframe = null;
  _$jscoverage['/io/iframe-transport.js'].lineData[193]++;
  if (visit59_193_1(eventType === 'load')) {
    _$jscoverage['/io/iframe-transport.js'].lineData[195]++;
    try {
      _$jscoverage['/io/iframe-transport.js'].lineData[196]++;
      iframeDoc = iframe.contentWindow.document;
      _$jscoverage['/io/iframe-transport.js'].lineData[198]++;
      if (visit60_198_1(iframeDoc && iframeDoc.body)) {
        _$jscoverage['/io/iframe-transport.js'].lineData[200]++;
        io.responseText = Dom.html(iframeDoc.body);
        _$jscoverage['/io/iframe-transport.js'].lineData[202]++;
        if (visit61_202_1(S.startsWith(io.responseText, '<?xml'))) {
          _$jscoverage['/io/iframe-transport.js'].lineData[203]++;
          io.responseText = undefined;
        }
      }
      _$jscoverage['/io/iframe-transport.js'].lineData[215]++;
      if (visit62_215_1(iframeDoc && iframeDoc.XMLDocument)) {
        _$jscoverage['/io/iframe-transport.js'].lineData[216]++;
        io.responseXML = iframeDoc.XMLDocument;
      } else {
        _$jscoverage['/io/iframe-transport.js'].lineData[219]++;
        io.responseXML = iframeDoc;
      }
      _$jscoverage['/io/iframe-transport.js'].lineData[221]++;
      if (visit63_221_1(iframeDoc)) {
        _$jscoverage['/io/iframe-transport.js'].lineData[222]++;
        io._ioReady(OK_CODE, 'success');
      } else {
        _$jscoverage['/io/iframe-transport.js'].lineData[229]++;
        io._ioReady(ERROR_CODE, 'parser error');
      }
    }    catch (e) {
  _$jscoverage['/io/iframe-transport.js'].lineData[233]++;
  io._ioReady(ERROR_CODE, 'parser error');
}
  } else {
    _$jscoverage['/io/iframe-transport.js'].lineData[235]++;
    if (visit64_235_1(eventType === 'error')) {
      _$jscoverage['/io/iframe-transport.js'].lineData[236]++;
      io._ioReady(ERROR_CODE, 'error');
    }
  }
}, 
  abort: function() {
  _$jscoverage['/io/iframe-transport.js'].functionData[14]++;
  _$jscoverage['/io/iframe-transport.js'].lineData[241]++;
  this._callback({
  type: 'abort'});
}});
  _$jscoverage['/io/iframe-transport.js'].lineData[247]++;
  IO.setupTransport('iframe', IframeTransport);
  _$jscoverage['/io/iframe-transport.js'].lineData[249]++;
  return IO;
});
