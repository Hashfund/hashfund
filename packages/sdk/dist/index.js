'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var c = require('xior');
var g = require('path');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var c__default = /*#__PURE__*/_interopDefault(c);
var g__default = /*#__PURE__*/_interopDefault(g);

var s=class{constructor(t){this.xior=t;this.buildPath=(...t)=>g__default.default.join(this.path,...t.map(String));this.buildPathWithQuery=(t,r)=>{if(r){for(let[i,l]of Object.entries(r))l||delete r[i];let n=new URLSearchParams(r);return t+"?"+n.toString()}return t};}};var a=class extends s{retrieve(t){return this.xior.get(this.buildPath(t))}list(t){return this.xior.get(this.buildPathWithQuery(this.path,t))}create(t){return this.xior.post(this.path,t)}update(t,r){return this.xior.patch(this.buildPath(t),r)}delete(t){return this.xior.delete(this.buildPath(t))}};var h=(e,...t)=>{for(let r of t)delete e.prototype[r];return e};var o=class extends s{constructor(){super(...arguments);this.path="/imagekit";}getAuthenticationParameters(){return this.xior.get(this.buildPath("auth"))}};var p=class extends a{constructor(){super(...arguments);this.path="users";}list(r){return this.xior.get(this.buildPathWithQuery(this.path,r))}},u=class extends h(a,"create","update","delete"){constructor(){super(...arguments);this.path="mints";}getMintByUser(r){return this.xior.get(this.buildPath("users",r))}},m=class extends h(a,"create","update","delete"){constructor(){super(...arguments);this.path="swaps";}getSwapsGraph(r){return this.xior.get(this.buildPathWithQuery(this.buildPath("graph"),r))}getSwapsVolume(r){return this.xior.get(this.buildPathWithQuery(this.buildPath("volume"),r))}},d=class{constructor(t,r,n="web3auth"){let i=c__default.default.create({baseURL:t,headers:{Authorization:n+" "+r}});this.user=new p(i),this.mint=new u(i),this.swap=new m(i),this.imagekit=new o(i);}};

exports.MintApi = u;
exports.SwapApi = m;
exports.UserApi = p;
exports.default = d;
