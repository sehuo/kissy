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
if (! _$jscoverage['/overlay/control.js']) {
  _$jscoverage['/overlay/control.js'] = {};
  _$jscoverage['/overlay/control.js'].lineData = [];
  _$jscoverage['/overlay/control.js'].lineData[6] = 0;
  _$jscoverage['/overlay/control.js'].lineData[7] = 0;
  _$jscoverage['/overlay/control.js'].lineData[8] = 0;
  _$jscoverage['/overlay/control.js'].lineData[9] = 0;
  _$jscoverage['/overlay/control.js'].lineData[10] = 0;
  _$jscoverage['/overlay/control.js'].lineData[11] = 0;
  _$jscoverage['/overlay/control.js'].lineData[12] = 0;
  _$jscoverage['/overlay/control.js'].lineData[13] = 0;
  _$jscoverage['/overlay/control.js'].lineData[14] = 0;
  _$jscoverage['/overlay/control.js'].lineData[15] = 0;
  _$jscoverage['/overlay/control.js'].lineData[31] = 0;
  _$jscoverage['/overlay/control.js'].lineData[40] = 0;
  _$jscoverage['/overlay/control.js'].lineData[42] = 0;
  _$jscoverage['/overlay/control.js'].lineData[43] = 0;
  _$jscoverage['/overlay/control.js'].lineData[44] = 0;
  _$jscoverage['/overlay/control.js'].lineData[45] = 0;
  _$jscoverage['/overlay/control.js'].lineData[54] = 0;
  _$jscoverage['/overlay/control.js'].lineData[55] = 0;
  _$jscoverage['/overlay/control.js'].lineData[56] = 0;
  _$jscoverage['/overlay/control.js'].lineData[83] = 0;
  _$jscoverage['/overlay/control.js'].lineData[98] = 0;
}
if (! _$jscoverage['/overlay/control.js'].functionData) {
  _$jscoverage['/overlay/control.js'].functionData = [];
  _$jscoverage['/overlay/control.js'].functionData[0] = 0;
  _$jscoverage['/overlay/control.js'].functionData[1] = 0;
  _$jscoverage['/overlay/control.js'].functionData[2] = 0;
  _$jscoverage['/overlay/control.js'].functionData[3] = 0;
  _$jscoverage['/overlay/control.js'].functionData[4] = 0;
  _$jscoverage['/overlay/control.js'].functionData[5] = 0;
}
if (! _$jscoverage['/overlay/control.js'].branchData) {
  _$jscoverage['/overlay/control.js'].branchData = {};
  _$jscoverage['/overlay/control.js'].branchData['42'] = [];
  _$jscoverage['/overlay/control.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/overlay/control.js'].branchData['55'] = [];
  _$jscoverage['/overlay/control.js'].branchData['55'][1] = new BranchData();
}
_$jscoverage['/overlay/control.js'].branchData['55'][1].init(49, 40, 'actions[self.get(\'closeAction\')] || HIDE');
function visit2_55_1(result) {
  _$jscoverage['/overlay/control.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/control.js'].branchData['42'][1].init(98, 8, 'closeBtn');
function visit1_42_1(result) {
  _$jscoverage['/overlay/control.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/overlay/control.js'].functionData[0]++;
  _$jscoverage['/overlay/control.js'].lineData[7]++;
  var Container = require('component/container');
  _$jscoverage['/overlay/control.js'].lineData[8]++;
  var Shim = require('component/extension/shim');
  _$jscoverage['/overlay/control.js'].lineData[9]++;
  var AlignExtension = require('component/extension/align');
  _$jscoverage['/overlay/control.js'].lineData[10]++;
  var Loading = require('./extension/loading');
  _$jscoverage['/overlay/control.js'].lineData[11]++;
  var Mask = require('./extension/mask');
  _$jscoverage['/overlay/control.js'].lineData[12]++;
  var OverlayEffect = require('./extension/overlay-effect');
  _$jscoverage['/overlay/control.js'].lineData[13]++;
  var ContentBox = require('component/extension/content-box');
  _$jscoverage['/overlay/control.js'].lineData[14]++;
  var OverlayTpl = require('./overlay-xtpl');
  _$jscoverage['/overlay/control.js'].lineData[15]++;
  var HIDE = 'hide', actions = {
  hide: HIDE, 
  destroy: 'destroy'};
  _$jscoverage['/overlay/control.js'].lineData[31]++;
  return Container.extend([ContentBox, Shim, Loading, AlignExtension, Mask, OverlayEffect], {
  bindUI: function() {
  _$jscoverage['/overlay/control.js'].functionData[1]++;
  _$jscoverage['/overlay/control.js'].lineData[40]++;
  var self = this, closeBtn = self.get('closeBtn');
  _$jscoverage['/overlay/control.js'].lineData[42]++;
  if (visit1_42_1(closeBtn)) {
    _$jscoverage['/overlay/control.js'].lineData[43]++;
    closeBtn.on('click', function(ev) {
  _$jscoverage['/overlay/control.js'].functionData[2]++;
  _$jscoverage['/overlay/control.js'].lineData[44]++;
  self.close();
  _$jscoverage['/overlay/control.js'].lineData[45]++;
  ev.preventDefault();
});
  }
}, 
  close: function() {
  _$jscoverage['/overlay/control.js'].functionData[3]++;
  _$jscoverage['/overlay/control.js'].lineData[54]++;
  var self = this;
  _$jscoverage['/overlay/control.js'].lineData[55]++;
  self[visit2_55_1(actions[self.get('closeAction')] || HIDE)]();
  _$jscoverage['/overlay/control.js'].lineData[56]++;
  return self;
}}, {
  ATTRS: {
  contentEl: {}, 
  closable: {
  value: false, 
  sync: 0, 
  render: 1, 
  parse: function() {
  _$jscoverage['/overlay/control.js'].functionData[4]++;
  _$jscoverage['/overlay/control.js'].lineData[83]++;
  return !!this.get('closeBtn');
}}, 
  closeBtn: {
  selector: function() {
  _$jscoverage['/overlay/control.js'].functionData[5]++;
  _$jscoverage['/overlay/control.js'].lineData[98]++;
  return '.' + this.getBaseCssClass('close');
}}, 
  closeAction: {
  value: HIDE}, 
  focusable: {
  value: false}, 
  allowTextSelection: {
  value: true}, 
  handleGestureEvents: {
  value: false}, 
  visible: {
  value: false}, 
  contentTpl: {
  value: OverlayTpl}}, 
  xclass: 'overlay'});
});
