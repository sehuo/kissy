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
if (! _$jscoverage['/util/web.js']) {
  _$jscoverage['/util/web.js'] = {};
  _$jscoverage['/util/web.js'].lineData = [];
  _$jscoverage['/util/web.js'].lineData[6] = 0;
  _$jscoverage['/util/web.js'].lineData[7] = 0;
  _$jscoverage['/util/web.js'].lineData[8] = 0;
  _$jscoverage['/util/web.js'].lineData[30] = 0;
  _$jscoverage['/util/web.js'].lineData[32] = 0;
  _$jscoverage['/util/web.js'].lineData[35] = 0;
  _$jscoverage['/util/web.js'].lineData[37] = 0;
  _$jscoverage['/util/web.js'].lineData[40] = 0;
  _$jscoverage['/util/web.js'].lineData[48] = 0;
  _$jscoverage['/util/web.js'].lineData[58] = 0;
  _$jscoverage['/util/web.js'].lineData[59] = 0;
  _$jscoverage['/util/web.js'].lineData[61] = 0;
  _$jscoverage['/util/web.js'].lineData[62] = 0;
  _$jscoverage['/util/web.js'].lineData[64] = 0;
  _$jscoverage['/util/web.js'].lineData[65] = 0;
  _$jscoverage['/util/web.js'].lineData[68] = 0;
  _$jscoverage['/util/web.js'].lineData[69] = 0;
  _$jscoverage['/util/web.js'].lineData[70] = 0;
  _$jscoverage['/util/web.js'].lineData[73] = 0;
  _$jscoverage['/util/web.js'].lineData[74] = 0;
  _$jscoverage['/util/web.js'].lineData[75] = 0;
  _$jscoverage['/util/web.js'].lineData[77] = 0;
  _$jscoverage['/util/web.js'].lineData[78] = 0;
  _$jscoverage['/util/web.js'].lineData[80] = 0;
  _$jscoverage['/util/web.js'].lineData[88] = 0;
  _$jscoverage['/util/web.js'].lineData[92] = 0;
  _$jscoverage['/util/web.js'].lineData[93] = 0;
  _$jscoverage['/util/web.js'].lineData[95] = 0;
  _$jscoverage['/util/web.js'].lineData[96] = 0;
  _$jscoverage['/util/web.js'].lineData[109] = 0;
  _$jscoverage['/util/web.js'].lineData[110] = 0;
  _$jscoverage['/util/web.js'].lineData[111] = 0;
  _$jscoverage['/util/web.js'].lineData[113] = 0;
  _$jscoverage['/util/web.js'].lineData[114] = 0;
  _$jscoverage['/util/web.js'].lineData[115] = 0;
  _$jscoverage['/util/web.js'].lineData[119] = 0;
  _$jscoverage['/util/web.js'].lineData[121] = 0;
  _$jscoverage['/util/web.js'].lineData[131] = 0;
  _$jscoverage['/util/web.js'].lineData[132] = 0;
  _$jscoverage['/util/web.js'].lineData[133] = 0;
  _$jscoverage['/util/web.js'].lineData[134] = 0;
  _$jscoverage['/util/web.js'].lineData[135] = 0;
  _$jscoverage['/util/web.js'].lineData[136] = 0;
  _$jscoverage['/util/web.js'].lineData[138] = 0;
  _$jscoverage['/util/web.js'].lineData[139] = 0;
  _$jscoverage['/util/web.js'].lineData[140] = 0;
  _$jscoverage['/util/web.js'].lineData[141] = 0;
  _$jscoverage['/util/web.js'].lineData[147] = 0;
  _$jscoverage['/util/web.js'].lineData[148] = 0;
  _$jscoverage['/util/web.js'].lineData[149] = 0;
  _$jscoverage['/util/web.js'].lineData[152] = 0;
  _$jscoverage['/util/web.js'].lineData[153] = 0;
  _$jscoverage['/util/web.js'].lineData[155] = 0;
  _$jscoverage['/util/web.js'].lineData[156] = 0;
  _$jscoverage['/util/web.js'].lineData[157] = 0;
  _$jscoverage['/util/web.js'].lineData[158] = 0;
  _$jscoverage['/util/web.js'].lineData[160] = 0;
  _$jscoverage['/util/web.js'].lineData[162] = 0;
  _$jscoverage['/util/web.js'].lineData[163] = 0;
  _$jscoverage['/util/web.js'].lineData[170] = 0;
  _$jscoverage['/util/web.js'].lineData[173] = 0;
  _$jscoverage['/util/web.js'].lineData[174] = 0;
  _$jscoverage['/util/web.js'].lineData[175] = 0;
  _$jscoverage['/util/web.js'].lineData[179] = 0;
  _$jscoverage['/util/web.js'].lineData[182] = 0;
  _$jscoverage['/util/web.js'].lineData[183] = 0;
  _$jscoverage['/util/web.js'].lineData[184] = 0;
  _$jscoverage['/util/web.js'].lineData[185] = 0;
  _$jscoverage['/util/web.js'].lineData[188] = 0;
  _$jscoverage['/util/web.js'].lineData[190] = 0;
  _$jscoverage['/util/web.js'].lineData[191] = 0;
  _$jscoverage['/util/web.js'].lineData[192] = 0;
  _$jscoverage['/util/web.js'].lineData[193] = 0;
  _$jscoverage['/util/web.js'].lineData[199] = 0;
  _$jscoverage['/util/web.js'].lineData[203] = 0;
  _$jscoverage['/util/web.js'].lineData[206] = 0;
  _$jscoverage['/util/web.js'].lineData[207] = 0;
  _$jscoverage['/util/web.js'].lineData[209] = 0;
  _$jscoverage['/util/web.js'].lineData[213] = 0;
  _$jscoverage['/util/web.js'].lineData[214] = 0;
  _$jscoverage['/util/web.js'].lineData[215] = 0;
  _$jscoverage['/util/web.js'].lineData[217] = 0;
  _$jscoverage['/util/web.js'].lineData[218] = 0;
  _$jscoverage['/util/web.js'].lineData[220] = 0;
  _$jscoverage['/util/web.js'].lineData[223] = 0;
  _$jscoverage['/util/web.js'].lineData[229] = 0;
  _$jscoverage['/util/web.js'].lineData[230] = 0;
  _$jscoverage['/util/web.js'].lineData[237] = 0;
  _$jscoverage['/util/web.js'].lineData[238] = 0;
  _$jscoverage['/util/web.js'].lineData[241] = 0;
  _$jscoverage['/util/web.js'].lineData[242] = 0;
}
if (! _$jscoverage['/util/web.js'].functionData) {
  _$jscoverage['/util/web.js'].functionData = [];
  _$jscoverage['/util/web.js'].functionData[0] = 0;
  _$jscoverage['/util/web.js'].functionData[1] = 0;
  _$jscoverage['/util/web.js'].functionData[2] = 0;
  _$jscoverage['/util/web.js'].functionData[3] = 0;
  _$jscoverage['/util/web.js'].functionData[4] = 0;
  _$jscoverage['/util/web.js'].functionData[5] = 0;
  _$jscoverage['/util/web.js'].functionData[6] = 0;
  _$jscoverage['/util/web.js'].functionData[7] = 0;
  _$jscoverage['/util/web.js'].functionData[8] = 0;
  _$jscoverage['/util/web.js'].functionData[9] = 0;
  _$jscoverage['/util/web.js'].functionData[10] = 0;
  _$jscoverage['/util/web.js'].functionData[11] = 0;
  _$jscoverage['/util/web.js'].functionData[12] = 0;
  _$jscoverage['/util/web.js'].functionData[13] = 0;
  _$jscoverage['/util/web.js'].functionData[14] = 0;
  _$jscoverage['/util/web.js'].functionData[15] = 0;
  _$jscoverage['/util/web.js'].functionData[16] = 0;
  _$jscoverage['/util/web.js'].functionData[17] = 0;
  _$jscoverage['/util/web.js'].functionData[18] = 0;
}
if (! _$jscoverage['/util/web.js'].branchData) {
  _$jscoverage['/util/web.js'].branchData = {};
  _$jscoverage['/util/web.js'].branchData['10'] = [];
  _$jscoverage['/util/web.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['24'] = [];
  _$jscoverage['/util/web.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['48'] = [];
  _$jscoverage['/util/web.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['48'][2] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['48'][3] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['58'] = [];
  _$jscoverage['/util/web.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['64'] = [];
  _$jscoverage['/util/web.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['77'] = [];
  _$jscoverage['/util/web.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['77'][2] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['88'] = [];
  _$jscoverage['/util/web.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['92'] = [];
  _$jscoverage['/util/web.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['109'] = [];
  _$jscoverage['/util/web.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['113'] = [];
  _$jscoverage['/util/web.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['134'] = [];
  _$jscoverage['/util/web.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['139'] = [];
  _$jscoverage['/util/web.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['148'] = [];
  _$jscoverage['/util/web.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['152'] = [];
  _$jscoverage['/util/web.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['156'] = [];
  _$jscoverage['/util/web.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['160'] = [];
  _$jscoverage['/util/web.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['173'] = [];
  _$jscoverage['/util/web.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['173'][2] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['182'] = [];
  _$jscoverage['/util/web.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['191'] = [];
  _$jscoverage['/util/web.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['204'] = [];
  _$jscoverage['/util/web.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['207'] = [];
  _$jscoverage['/util/web.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['213'] = [];
  _$jscoverage['/util/web.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['229'] = [];
  _$jscoverage['/util/web.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['229'][2] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['229'][3] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['237'] = [];
  _$jscoverage['/util/web.js'].branchData['237'][1] = new BranchData();
}
_$jscoverage['/util/web.js'].branchData['237'][1].init(7884, 12, 'supportEvent');
function visit216_237_1(result) {
  _$jscoverage['/util/web.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['229'][3].init(7613, 24, 'location.search || EMPTY');
function visit215_229_3(result) {
  _$jscoverage['/util/web.js'].branchData['229'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['229'][2].init(7613, 52, '(location.search || EMPTY).indexOf(\'ks-debug\') !== -1');
function visit214_229_2(result) {
  _$jscoverage['/util/web.js'].branchData['229'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['229'][1].init(7600, 65, 'location && (location.search || EMPTY).indexOf(\'ks-debug\') !== -1');
function visit213_229_1(result) {
  _$jscoverage['/util/web.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['213'][1].init(931, 20, 'doScroll && notframe');
function visit212_213_1(result) {
  _$jscoverage['/util/web.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['207'][1].init(30, 25, 'win.frameElement === null');
function visit211_207_1(result) {
  _$jscoverage['/util/web.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['204'][1].init(41, 27, 'docElem && docElem.doScroll');
function visit210_204_1(result) {
  _$jscoverage['/util/web.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['191'][1].init(22, 27, 'doc.readyState === COMPLETE');
function visit209_191_1(result) {
  _$jscoverage['/util/web.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['182'][1].init(373, 18, 'standardEventModel');
function visit208_182_1(result) {
  _$jscoverage['/util/web.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['173'][2].init(128, 27, 'doc.readyState === COMPLETE');
function visit207_173_2(result) {
  _$jscoverage['/util/web.js'].branchData['173'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['173'][1].init(120, 35, '!doc || doc.readyState === COMPLETE');
function visit206_173_1(result) {
  _$jscoverage['/util/web.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['160'][1].init(24, 12, 'e.stack || e');
function visit205_160_1(result) {
  _$jscoverage['/util/web.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['156'][1].init(236, 20, 'i < callbacks.length');
function visit204_156_1(result) {
  _$jscoverage['/util/web.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['152'][1].init(90, 21, 'win && win.setTimeout');
function visit203_152_1(result) {
  _$jscoverage['/util/web.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['148'][1].init(14, 8, 'domReady');
function visit202_148_1(result) {
  _$jscoverage['/util/web.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['139'][1].init(211, 4, 'node');
function visit201_139_1(result) {
  _$jscoverage['/util/web.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['134'][1].init(22, 27, '++retryCount > POLL_RETIRES');
function visit200_134_1(result) {
  _$jscoverage['/util/web.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['113'][1].init(28, 12, 'e.stack || e');
function visit199_113_1(result) {
  _$jscoverage['/util/web.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['109'][1].init(18, 8, 'domReady');
function visit198_109_1(result) {
  _$jscoverage['/util/web.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['92'][1].init(273, 14, 'win.execScript');
function visit197_92_1(result) {
  _$jscoverage['/util/web.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['88'][1].init(18, 36, 'data && RE_NOT_WHITESPACE.test(data)');
function visit196_88_1(result) {
  _$jscoverage['/util/web.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['77'][2].init(728, 70, '!xml.documentElement || xml.getElementsByTagName(\'parsererror\').length');
function visit195_77_2(result) {
  _$jscoverage['/util/web.js'].branchData['77'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['77'][1].init(720, 78, '!xml || !xml.documentElement || xml.getElementsByTagName(\'parsererror\').length');
function visit194_77_1(result) {
  _$jscoverage['/util/web.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['64'][1].init(51, 13, 'win.DOMParser');
function visit193_64_1(result) {
  _$jscoverage['/util/web.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['58'][1].init(48, 20, 'data.documentElement');
function visit192_58_1(result) {
  _$jscoverage['/util/web.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['48'][3].init(109, 17, 'obj == obj.window');
function visit191_48_3(result) {
  _$jscoverage['/util/web.js'].branchData['48'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['48'][2].init(94, 11, 'obj != null');
function visit190_48_2(result) {
  _$jscoverage['/util/web.js'].branchData['48'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['48'][1].init(94, 32, 'obj != null && obj == obj.window');
function visit189_48_1(result) {
  _$jscoverage['/util/web.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['24'][1].init(516, 37, 'doc.attachEvent || standardEventModel');
function visit188_24_1(result) {
  _$jscoverage['/util/web.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['10'][1].init(52, 18, 'win.document || {}');
function visit187_10_1(result) {
  _$jscoverage['/util/web.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/util/web.js'].functionData[0]++;
  _$jscoverage['/util/web.js'].lineData[7]++;
  var logger = S.getLogger('s/web');
  _$jscoverage['/util/web.js'].lineData[8]++;
  var win = S.Env.host, undef, doc = visit187_10_1(win.document || {}), docElem = doc.documentElement, location = win.location, EMPTY = '', domReady = 0, callbacks = [], POLL_RETIRES = 500, POLL_INTERVAL = 40, RE_ID_STR = /^#?([\w-]+)$/, RE_NOT_WHITESPACE = /\S/, standardEventModel = doc.addEventListener, supportEvent = visit188_24_1(doc.attachEvent || standardEventModel), DOM_READY_EVENT = 'DOMContentLoaded', READY_STATE_CHANGE_EVENT = 'readystatechange', LOAD_EVENT = 'load', COMPLETE = 'complete', addEventListener = standardEventModel ? function(el, type, fn) {
  _$jscoverage['/util/web.js'].functionData[1]++;
  _$jscoverage['/util/web.js'].lineData[30]++;
  el.addEventListener(type, fn, false);
} : function(el, type, fn) {
  _$jscoverage['/util/web.js'].functionData[2]++;
  _$jscoverage['/util/web.js'].lineData[32]++;
  el.attachEvent('on' + type, fn);
}, removeEventListener = standardEventModel ? function(el, type, fn) {
  _$jscoverage['/util/web.js'].functionData[3]++;
  _$jscoverage['/util/web.js'].lineData[35]++;
  el.removeEventListener(type, fn, false);
} : function(el, type, fn) {
  _$jscoverage['/util/web.js'].functionData[4]++;
  _$jscoverage['/util/web.js'].lineData[37]++;
  el.detachEvent('on' + type, fn);
};
  _$jscoverage['/util/web.js'].lineData[40]++;
  S.mix(S, {
  isWindow: function(obj) {
  _$jscoverage['/util/web.js'].functionData[5]++;
  _$jscoverage['/util/web.js'].lineData[48]++;
  return visit189_48_1(visit190_48_2(obj != null) && visit191_48_3(obj == obj.window));
}, 
  parseXML: function(data) {
  _$jscoverage['/util/web.js'].functionData[6]++;
  _$jscoverage['/util/web.js'].lineData[58]++;
  if (visit192_58_1(data.documentElement)) {
    _$jscoverage['/util/web.js'].lineData[59]++;
    return data;
  }
  _$jscoverage['/util/web.js'].lineData[61]++;
  var xml;
  _$jscoverage['/util/web.js'].lineData[62]++;
  try {
    _$jscoverage['/util/web.js'].lineData[64]++;
    if (visit193_64_1(win.DOMParser)) {
      _$jscoverage['/util/web.js'].lineData[65]++;
      xml = new DOMParser().parseFromString(data, 'text/xml');
    } else {
      _$jscoverage['/util/web.js'].lineData[68]++;
      xml = new ActiveXObject('Microsoft.XMLDOM');
      _$jscoverage['/util/web.js'].lineData[69]++;
      xml.async = false;
      _$jscoverage['/util/web.js'].lineData[70]++;
      xml.loadXML(data);
    }
  }  catch (e) {
  _$jscoverage['/util/web.js'].lineData[73]++;
  logger.error('parseXML error :');
  _$jscoverage['/util/web.js'].lineData[74]++;
  logger.error(e);
  _$jscoverage['/util/web.js'].lineData[75]++;
  xml = undef;
}
  _$jscoverage['/util/web.js'].lineData[77]++;
  if (visit194_77_1(!xml || visit195_77_2(!xml.documentElement || xml.getElementsByTagName('parsererror').length))) {
    _$jscoverage['/util/web.js'].lineData[78]++;
    S.error('Invalid XML: ' + data);
  }
  _$jscoverage['/util/web.js'].lineData[80]++;
  return xml;
}, 
  globalEval: function(data) {
  _$jscoverage['/util/web.js'].functionData[7]++;
  _$jscoverage['/util/web.js'].lineData[88]++;
  if (visit196_88_1(data && RE_NOT_WHITESPACE.test(data))) {
    _$jscoverage['/util/web.js'].lineData[92]++;
    if (visit197_92_1(win.execScript)) {
      _$jscoverage['/util/web.js'].lineData[93]++;
      win.execScript(data);
    } else {
      _$jscoverage['/util/web.js'].lineData[95]++;
      (function(data) {
  _$jscoverage['/util/web.js'].functionData[8]++;
  _$jscoverage['/util/web.js'].lineData[96]++;
  win['eval'].call(win, data);
})(data);
    }
  }
}, 
  ready: function(fn) {
  _$jscoverage['/util/web.js'].functionData[9]++;
  _$jscoverage['/util/web.js'].lineData[109]++;
  if (visit198_109_1(domReady)) {
    _$jscoverage['/util/web.js'].lineData[110]++;
    try {
      _$jscoverage['/util/web.js'].lineData[111]++;
      fn(S);
    }    catch (e) {
  _$jscoverage['/util/web.js'].lineData[113]++;
  S.log(visit199_113_1(e.stack || e), 'error');
  _$jscoverage['/util/web.js'].lineData[114]++;
  setTimeout(function() {
  _$jscoverage['/util/web.js'].functionData[10]++;
  _$jscoverage['/util/web.js'].lineData[115]++;
  throw e;
}, 0);
}
  } else {
    _$jscoverage['/util/web.js'].lineData[119]++;
    callbacks.push(fn);
  }
  _$jscoverage['/util/web.js'].lineData[121]++;
  return this;
}, 
  available: function(id, fn) {
  _$jscoverage['/util/web.js'].functionData[11]++;
  _$jscoverage['/util/web.js'].lineData[131]++;
  id = (id + EMPTY).match(RE_ID_STR)[1];
  _$jscoverage['/util/web.js'].lineData[132]++;
  var retryCount = 1;
  _$jscoverage['/util/web.js'].lineData[133]++;
  var timer = S.later(function() {
  _$jscoverage['/util/web.js'].functionData[12]++;
  _$jscoverage['/util/web.js'].lineData[134]++;
  if (visit200_134_1(++retryCount > POLL_RETIRES)) {
    _$jscoverage['/util/web.js'].lineData[135]++;
    timer.cancel();
    _$jscoverage['/util/web.js'].lineData[136]++;
    return;
  }
  _$jscoverage['/util/web.js'].lineData[138]++;
  var node = doc.getElementById(id);
  _$jscoverage['/util/web.js'].lineData[139]++;
  if (visit201_139_1(node)) {
    _$jscoverage['/util/web.js'].lineData[140]++;
    fn(node);
    _$jscoverage['/util/web.js'].lineData[141]++;
    timer.cancel();
  }
}, POLL_INTERVAL, true);
}});
  _$jscoverage['/util/web.js'].lineData[147]++;
  function fireReady() {
    _$jscoverage['/util/web.js'].functionData[13]++;
    _$jscoverage['/util/web.js'].lineData[148]++;
    if (visit202_148_1(domReady)) {
      _$jscoverage['/util/web.js'].lineData[149]++;
      return;
    }
    _$jscoverage['/util/web.js'].lineData[152]++;
    if (visit203_152_1(win && win.setTimeout)) {
      _$jscoverage['/util/web.js'].lineData[153]++;
      removeEventListener(win, LOAD_EVENT, fireReady);
    }
    _$jscoverage['/util/web.js'].lineData[155]++;
    domReady = 1;
    _$jscoverage['/util/web.js'].lineData[156]++;
    for (var i = 0; visit204_156_1(i < callbacks.length); i++) {
      _$jscoverage['/util/web.js'].lineData[157]++;
      try {
        _$jscoverage['/util/web.js'].lineData[158]++;
        callbacks[i](S);
      }      catch (e) {
  _$jscoverage['/util/web.js'].lineData[160]++;
  S.log(visit205_160_1(e.stack || e), 'error');
  _$jscoverage['/util/web.js'].lineData[162]++;
  setTimeout(function() {
  _$jscoverage['/util/web.js'].functionData[14]++;
  _$jscoverage['/util/web.js'].lineData[163]++;
  throw e;
}, 0);
}
    }
  }
  _$jscoverage['/util/web.js'].lineData[170]++;
  function bindReady() {
    _$jscoverage['/util/web.js'].functionData[15]++;
    _$jscoverage['/util/web.js'].lineData[173]++;
    if (visit206_173_1(!doc || visit207_173_2(doc.readyState === COMPLETE))) {
      _$jscoverage['/util/web.js'].lineData[174]++;
      fireReady();
      _$jscoverage['/util/web.js'].lineData[175]++;
      return;
    }
    _$jscoverage['/util/web.js'].lineData[179]++;
    addEventListener(win, LOAD_EVENT, fireReady);
    _$jscoverage['/util/web.js'].lineData[182]++;
    if (visit208_182_1(standardEventModel)) {
      _$jscoverage['/util/web.js'].lineData[183]++;
      var domReady = function() {
  _$jscoverage['/util/web.js'].functionData[16]++;
  _$jscoverage['/util/web.js'].lineData[184]++;
  removeEventListener(doc, DOM_READY_EVENT, domReady);
  _$jscoverage['/util/web.js'].lineData[185]++;
  fireReady();
};
      _$jscoverage['/util/web.js'].lineData[188]++;
      addEventListener(doc, DOM_READY_EVENT, domReady);
    } else {
      _$jscoverage['/util/web.js'].lineData[190]++;
      var stateChange = function() {
  _$jscoverage['/util/web.js'].functionData[17]++;
  _$jscoverage['/util/web.js'].lineData[191]++;
  if (visit209_191_1(doc.readyState === COMPLETE)) {
    _$jscoverage['/util/web.js'].lineData[192]++;
    removeEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
    _$jscoverage['/util/web.js'].lineData[193]++;
    fireReady();
  }
};
      _$jscoverage['/util/web.js'].lineData[199]++;
      addEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
      _$jscoverage['/util/web.js'].lineData[203]++;
      var notframe, doScroll = visit210_204_1(docElem && docElem.doScroll);
      _$jscoverage['/util/web.js'].lineData[206]++;
      try {
        _$jscoverage['/util/web.js'].lineData[207]++;
        notframe = (visit211_207_1(win.frameElement === null));
      }      catch (e) {
  _$jscoverage['/util/web.js'].lineData[209]++;
  notframe = false;
}
      _$jscoverage['/util/web.js'].lineData[213]++;
      if (visit212_213_1(doScroll && notframe)) {
        _$jscoverage['/util/web.js'].lineData[214]++;
        var readyScroll = function() {
  _$jscoverage['/util/web.js'].functionData[18]++;
  _$jscoverage['/util/web.js'].lineData[215]++;
  try {
    _$jscoverage['/util/web.js'].lineData[217]++;
    doScroll('left');
    _$jscoverage['/util/web.js'].lineData[218]++;
    fireReady();
  }  catch (ex) {
  _$jscoverage['/util/web.js'].lineData[220]++;
  setTimeout(readyScroll, POLL_INTERVAL);
}
};
        _$jscoverage['/util/web.js'].lineData[223]++;
        readyScroll();
      }
    }
  }
  _$jscoverage['/util/web.js'].lineData[229]++;
  if (visit213_229_1(location && visit214_229_2((visit215_229_3(location.search || EMPTY)).indexOf('ks-debug') !== -1))) {
    _$jscoverage['/util/web.js'].lineData[230]++;
    S.Config.debug = true;
  }
  _$jscoverage['/util/web.js'].lineData[237]++;
  if (visit216_237_1(supportEvent)) {
    _$jscoverage['/util/web.js'].lineData[238]++;
    bindReady();
  }
  _$jscoverage['/util/web.js'].lineData[241]++;
  try {
    _$jscoverage['/util/web.js'].lineData[242]++;
    doc.execCommand('BackgroundImageCache', false, true);
  }  catch (e) {
}
});
