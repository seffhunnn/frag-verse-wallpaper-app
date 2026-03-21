//#region node_modules/@firebase/util/dist/postinstall.mjs
var getDefaultsFromPostinstall = () => void 0;
//#endregion
//#region node_modules/@firebase/util/dist/index.esm.js
/**
* @license
* Copyright 2017 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var stringToByteArray$1 = function(str) {
	const out = [];
	let p = 0;
	for (let i = 0; i < str.length; i++) {
		let c = str.charCodeAt(i);
		if (c < 128) out[p++] = c;
		else if (c < 2048) {
			out[p++] = c >> 6 | 192;
			out[p++] = c & 63 | 128;
		} else if ((c & 64512) === 55296 && i + 1 < str.length && (str.charCodeAt(i + 1) & 64512) === 56320) {
			c = 65536 + ((c & 1023) << 10) + (str.charCodeAt(++i) & 1023);
			out[p++] = c >> 18 | 240;
			out[p++] = c >> 12 & 63 | 128;
			out[p++] = c >> 6 & 63 | 128;
			out[p++] = c & 63 | 128;
		} else {
			out[p++] = c >> 12 | 224;
			out[p++] = c >> 6 & 63 | 128;
			out[p++] = c & 63 | 128;
		}
	}
	return out;
};
/**
* Turns an array of numbers into the string given by the concatenation of the
* characters to which the numbers correspond.
* @param bytes Array of numbers representing characters.
* @return Stringification of the array.
*/
var byteArrayToString = function(bytes) {
	const out = [];
	let pos = 0, c = 0;
	while (pos < bytes.length) {
		const c1 = bytes[pos++];
		if (c1 < 128) out[c++] = String.fromCharCode(c1);
		else if (c1 > 191 && c1 < 224) {
			const c2 = bytes[pos++];
			out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
		} else if (c1 > 239 && c1 < 365) {
			const c2 = bytes[pos++];
			const c3 = bytes[pos++];
			const c4 = bytes[pos++];
			const u = ((c1 & 7) << 18 | (c2 & 63) << 12 | (c3 & 63) << 6 | c4 & 63) - 65536;
			out[c++] = String.fromCharCode(55296 + (u >> 10));
			out[c++] = String.fromCharCode(56320 + (u & 1023));
		} else {
			const c2 = bytes[pos++];
			const c3 = bytes[pos++];
			out[c++] = String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
		}
	}
	return out.join("");
};
var base64 = {
	byteToCharMap_: null,
	charToByteMap_: null,
	byteToCharMapWebSafe_: null,
	charToByteMapWebSafe_: null,
	ENCODED_VALS_BASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
	get ENCODED_VALS() {
		return this.ENCODED_VALS_BASE + "+/=";
	},
	get ENCODED_VALS_WEBSAFE() {
		return this.ENCODED_VALS_BASE + "-_.";
	},
	HAS_NATIVE_SUPPORT: typeof atob === "function",
	encodeByteArray(input, webSafe) {
		if (!Array.isArray(input)) throw Error("encodeByteArray takes an array as a parameter");
		this.init_();
		const byteToCharMap = webSafe ? this.byteToCharMapWebSafe_ : this.byteToCharMap_;
		const output = [];
		for (let i = 0; i < input.length; i += 3) {
			const byte1 = input[i];
			const haveByte2 = i + 1 < input.length;
			const byte2 = haveByte2 ? input[i + 1] : 0;
			const haveByte3 = i + 2 < input.length;
			const byte3 = haveByte3 ? input[i + 2] : 0;
			const outByte1 = byte1 >> 2;
			const outByte2 = (byte1 & 3) << 4 | byte2 >> 4;
			let outByte3 = (byte2 & 15) << 2 | byte3 >> 6;
			let outByte4 = byte3 & 63;
			if (!haveByte3) {
				outByte4 = 64;
				if (!haveByte2) outByte3 = 64;
			}
			output.push(byteToCharMap[outByte1], byteToCharMap[outByte2], byteToCharMap[outByte3], byteToCharMap[outByte4]);
		}
		return output.join("");
	},
	encodeString(input, webSafe) {
		if (this.HAS_NATIVE_SUPPORT && !webSafe) return btoa(input);
		return this.encodeByteArray(stringToByteArray$1(input), webSafe);
	},
	decodeString(input, webSafe) {
		if (this.HAS_NATIVE_SUPPORT && !webSafe) return atob(input);
		return byteArrayToString(this.decodeStringToByteArray(input, webSafe));
	},
	decodeStringToByteArray(input, webSafe) {
		this.init_();
		const charToByteMap = webSafe ? this.charToByteMapWebSafe_ : this.charToByteMap_;
		const output = [];
		for (let i = 0; i < input.length;) {
			const byte1 = charToByteMap[input.charAt(i++)];
			const byte2 = i < input.length ? charToByteMap[input.charAt(i)] : 0;
			++i;
			const byte3 = i < input.length ? charToByteMap[input.charAt(i)] : 64;
			++i;
			const byte4 = i < input.length ? charToByteMap[input.charAt(i)] : 64;
			++i;
			if (byte1 == null || byte2 == null || byte3 == null || byte4 == null) throw new DecodeBase64StringError();
			const outByte1 = byte1 << 2 | byte2 >> 4;
			output.push(outByte1);
			if (byte3 !== 64) {
				const outByte2 = byte2 << 4 & 240 | byte3 >> 2;
				output.push(outByte2);
				if (byte4 !== 64) {
					const outByte3 = byte3 << 6 & 192 | byte4;
					output.push(outByte3);
				}
			}
		}
		return output;
	},
	init_() {
		if (!this.byteToCharMap_) {
			this.byteToCharMap_ = {};
			this.charToByteMap_ = {};
			this.byteToCharMapWebSafe_ = {};
			this.charToByteMapWebSafe_ = {};
			for (let i = 0; i < this.ENCODED_VALS.length; i++) {
				this.byteToCharMap_[i] = this.ENCODED_VALS.charAt(i);
				this.charToByteMap_[this.byteToCharMap_[i]] = i;
				this.byteToCharMapWebSafe_[i] = this.ENCODED_VALS_WEBSAFE.charAt(i);
				this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[i]] = i;
				if (i >= this.ENCODED_VALS_BASE.length) {
					this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(i)] = i;
					this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(i)] = i;
				}
			}
		}
	}
};
/**
* An error encountered while decoding base64 string.
*/
var DecodeBase64StringError = class extends Error {
	constructor() {
		super(...arguments);
		this.name = "DecodeBase64StringError";
	}
};
/**
* URL-safe base64 encoding
*/
var base64Encode = function(str) {
	const utf8Bytes = stringToByteArray$1(str);
	return base64.encodeByteArray(utf8Bytes, true);
};
/**
* URL-safe base64 encoding (without "." padding in the end).
* e.g. Used in JSON Web Token (JWT) parts.
*/
var base64urlEncodeWithoutPadding = function(str) {
	return base64Encode(str).replace(/\./g, "");
};
/**
* URL-safe base64 decoding
*
* NOTE: DO NOT use the global atob() function - it does NOT support the
* base64Url variant encoding.
*
* @param str To be decoded
* @return Decoded result, if possible
*/
var base64Decode = function(str) {
	try {
		return base64.decodeString(str, true);
	} catch (e) {
		console.error("base64Decode failed: ", e);
	}
	return null;
};
/**
* @license
* Copyright 2022 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* Polyfill for `globalThis` object.
* @returns the `globalThis` object for the given environment.
* @public
*/
function getGlobal() {
	if (typeof self !== "undefined") return self;
	if (typeof window !== "undefined") return window;
	if (typeof global !== "undefined") return global;
	throw new Error("Unable to locate global object.");
}
/**
* @license
* Copyright 2022 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var getDefaultsFromGlobal = () => getGlobal().__FIREBASE_DEFAULTS__;
/**
* Attempt to read defaults from a JSON string provided to
* process(.)env(.)__FIREBASE_DEFAULTS__ or a JSON file whose path is in
* process(.)env(.)__FIREBASE_DEFAULTS_PATH__
* The dots are in parens because certain compilers (Vite?) cannot
* handle seeing that variable in comments.
* See https://github.com/firebase/firebase-js-sdk/issues/6838
*/
var getDefaultsFromEnvVariable = () => {
	if (typeof process === "undefined" || typeof process.env === "undefined") return;
	const defaultsJsonString = process.env.__FIREBASE_DEFAULTS__;
	if (defaultsJsonString) return JSON.parse(defaultsJsonString);
};
var getDefaultsFromCookie = () => {
	if (typeof document === "undefined") return;
	let match;
	try {
		match = document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/);
	} catch (e) {
		return;
	}
	const decoded = match && base64Decode(match[1]);
	return decoded && JSON.parse(decoded);
};
/**
* Get the __FIREBASE_DEFAULTS__ object. It checks in order:
* (1) if such an object exists as a property of `globalThis`
* (2) if such an object was provided on a shell environment variable
* (3) if such an object exists in a cookie
* @public
*/
var getDefaults = () => {
	try {
		return getDefaultsFromPostinstall() || getDefaultsFromGlobal() || getDefaultsFromEnvVariable() || getDefaultsFromCookie();
	} catch (e) {
		/**
		* Catch-all for being unable to get __FIREBASE_DEFAULTS__ due
		* to any environment case we have not accounted for. Log to
		* info instead of swallowing so we can find these unknown cases
		* and add paths for them if needed.
		*/
		console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`);
		return;
	}
};
/**
* Returns emulator host stored in the __FIREBASE_DEFAULTS__ object
* for the given product.
* @returns a URL host formatted like `127.0.0.1:9999` or `[::1]:4000` if available
* @public
*/
var getDefaultEmulatorHost = (productName) => getDefaults()?.emulatorHosts?.[productName];
/**
* Returns Firebase app config stored in the __FIREBASE_DEFAULTS__ object.
* @public
*/
var getDefaultAppConfig = () => getDefaults()?.config;
/**
* Returns an experimental setting on the __FIREBASE_DEFAULTS__ object (properties
* prefixed by "_")
* @public
*/
var getExperimentalSetting = (name) => getDefaults()?.[`_${name}`];
/**
* @license
* Copyright 2017 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var Deferred = class {
	constructor() {
		this.reject = () => {};
		this.resolve = () => {};
		this.promise = new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}
	/**
	* Our API internals are not promisified and cannot because our callback APIs have subtle expectations around
	* invoking promises inline, which Promises are forbidden to do. This method accepts an optional node-style callback
	* and returns a node-style callback which will resolve or reject the Deferred's promise.
	*/
	wrapCallback(callback) {
		return (error, value) => {
			if (error) this.reject(error);
			else this.resolve(value);
			if (typeof callback === "function") {
				this.promise.catch(() => {});
				if (callback.length === 1) callback(error);
				else callback(error, value);
			}
		};
	}
};
/**
* @license
* Copyright 2017 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* Returns navigator.userAgent string or '' if it's not defined.
* @return user agent string
*/
function getUA() {
	if (typeof navigator !== "undefined" && typeof navigator["userAgent"] === "string") return navigator["userAgent"];
	else return "";
}
/**
* Detect Cordova / PhoneGap / Ionic frameworks on a mobile device.
*
* Deliberately does not rely on checking `file://` URLs (as this fails PhoneGap
* in the Ripple emulator) nor Cordova `onDeviceReady`, which would normally
* wait for a callback.
*/
function isMobileCordova() {
	return typeof window !== "undefined" && !!(window["cordova"] || window["phonegap"] || window["PhoneGap"]) && /ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(getUA());
}
/**
* Detect Browser Environment.
* Note: This will return true for certain test frameworks that are incompletely
* mimicking a browser, and should not lead to assuming all browser APIs are
* available.
*/
function isBrowser() {
	return typeof window !== "undefined" || isWebWorker();
}
/**
* Detect Web Worker context.
*/
function isWebWorker() {
	return typeof WorkerGlobalScope !== "undefined" && typeof self !== "undefined" && self instanceof WorkerGlobalScope;
}
/**
* Detect Cloudflare Worker context.
*/
function isCloudflareWorker() {
	return typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";
}
function isBrowserExtension() {
	const runtime = typeof chrome === "object" ? chrome.runtime : typeof browser === "object" ? browser.runtime : void 0;
	return typeof runtime === "object" && runtime.id !== void 0;
}
/**
* Detect React Native.
*
* @return true if ReactNative environment is detected.
*/
function isReactNative() {
	return typeof navigator === "object" && navigator["product"] === "ReactNative";
}
/** Detects Internet Explorer. */
function isIE() {
	const ua = getUA();
	return ua.indexOf("MSIE ") >= 0 || ua.indexOf("Trident/") >= 0;
}
/**
* This method checks if indexedDB is supported by current browser/service worker context
* @return true if indexedDB is supported by current browser/service worker context
*/
function isIndexedDBAvailable() {
	try {
		return typeof indexedDB === "object";
	} catch (e) {
		return false;
	}
}
/**
* This method validates browser/sw context for indexedDB by opening a dummy indexedDB database and reject
* if errors occur during the database open operation.
*
* @throws exception if current browser/sw context can't run idb.open (ex: Safari iframe, Firefox
* private browsing)
*/
function validateIndexedDBOpenable() {
	return new Promise((resolve, reject) => {
		try {
			let preExist = true;
			const DB_CHECK_NAME = "validate-browser-context-for-indexeddb-analytics-module";
			const request = self.indexedDB.open(DB_CHECK_NAME);
			request.onsuccess = () => {
				request.result.close();
				if (!preExist) self.indexedDB.deleteDatabase(DB_CHECK_NAME);
				resolve(true);
			};
			request.onupgradeneeded = () => {
				preExist = false;
			};
			request.onerror = () => {
				reject(request.error?.message || "");
			};
		} catch (error) {
			reject(error);
		}
	});
}
/**
* @license
* Copyright 2017 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* @fileoverview Standardized Firebase Error.
*
* Usage:
*
*   // TypeScript string literals for type-safe codes
*   type Err =
*     'unknown' |
*     'object-not-found'
*     ;
*
*   // Closure enum for type-safe error codes
*   // at-enum {string}
*   var Err = {
*     UNKNOWN: 'unknown',
*     OBJECT_NOT_FOUND: 'object-not-found',
*   }
*
*   let errors: Map<Err, string> = {
*     'generic-error': "Unknown error",
*     'file-not-found': "Could not find file: {$file}",
*   };
*
*   // Type-safe function - must pass a valid error code as param.
*   let error = new ErrorFactory<Err>('service', 'Service', errors);
*
*   ...
*   throw error.create(Err.GENERIC);
*   ...
*   throw error.create(Err.FILE_NOT_FOUND, {'file': fileName});
*   ...
*   // Service: Could not file file: foo.txt (service/file-not-found).
*
*   catch (e) {
*     assert(e.message === "Could not find file: foo.txt.");
*     if ((e as FirebaseError)?.code === 'service/file-not-found') {
*       console.log("Could not read file: " + e['file']);
*     }
*   }
*/
var ERROR_NAME = "FirebaseError";
var FirebaseError = class FirebaseError extends Error {
	constructor(code, message, customData) {
		super(message);
		this.code = code;
		this.customData = customData;
		/** The custom name for all FirebaseErrors. */
		this.name = ERROR_NAME;
		Object.setPrototypeOf(this, FirebaseError.prototype);
		if (Error.captureStackTrace) Error.captureStackTrace(this, ErrorFactory.prototype.create);
	}
};
var ErrorFactory = class {
	constructor(service, serviceName, errors) {
		this.service = service;
		this.serviceName = serviceName;
		this.errors = errors;
	}
	create(code, ...data) {
		const customData = data[0] || {};
		const fullCode = `${this.service}/${code}`;
		const template = this.errors[code];
		const message = template ? replaceTemplate(template, customData) : "Error";
		return new FirebaseError(fullCode, `${this.serviceName}: ${message} (${fullCode}).`, customData);
	}
};
function replaceTemplate(template, data) {
	return template.replace(PATTERN, (_, key) => {
		const value = data[key];
		return value != null ? String(value) : `<${key}?>`;
	});
}
var PATTERN = /\{\$([^}]+)}/g;
function isEmpty(obj) {
	for (const key in obj) if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
	return true;
}
/**
* Deep equal two objects. Support Arrays and Objects.
*/
function deepEqual(a, b) {
	if (a === b) return true;
	const aKeys = Object.keys(a);
	const bKeys = Object.keys(b);
	for (const k of aKeys) {
		if (!bKeys.includes(k)) return false;
		const aProp = a[k];
		const bProp = b[k];
		if (isObject(aProp) && isObject(bProp)) {
			if (!deepEqual(aProp, bProp)) return false;
		} else if (aProp !== bProp) return false;
	}
	for (const k of bKeys) if (!aKeys.includes(k)) return false;
	return true;
}
function isObject(thing) {
	return thing !== null && typeof thing === "object";
}
/**
* @license
* Copyright 2017 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* Returns a querystring-formatted string (e.g. &arg=val&arg2=val2) from a
* params object (e.g. {arg: 'val', arg2: 'val2'})
* Note: You must prepend it with ? when adding it to a URL.
*/
function querystring(querystringParams) {
	const params = [];
	for (const [key, value] of Object.entries(querystringParams)) if (Array.isArray(value)) value.forEach((arrayVal) => {
		params.push(encodeURIComponent(key) + "=" + encodeURIComponent(arrayVal));
	});
	else params.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
	return params.length ? "&" + params.join("&") : "";
}
/**
* Decodes a querystring (e.g. ?arg=val&arg2=val2) into a params object
* (e.g. {arg: 'val', arg2: 'val2'})
*/
function querystringDecode(querystring) {
	const obj = {};
	querystring.replace(/^\?/, "").split("&").forEach((token) => {
		if (token) {
			const [key, value] = token.split("=");
			obj[decodeURIComponent(key)] = decodeURIComponent(value);
		}
	});
	return obj;
}
/**
* Extract the query string part of a URL, including the leading question mark (if present).
*/
function extractQuerystring(url) {
	const queryStart = url.indexOf("?");
	if (!queryStart) return "";
	const fragmentStart = url.indexOf("#", queryStart);
	return url.substring(queryStart, fragmentStart > 0 ? fragmentStart : void 0);
}
/**
* Helper to make a Subscribe function (just like Promise helps make a
* Thenable).
*
* @param executor Function which can make calls to a single Observer
*     as a proxy.
* @param onNoObservers Callback when count of Observers goes to zero.
*/
function createSubscribe(executor, onNoObservers) {
	const proxy = new ObserverProxy(executor, onNoObservers);
	return proxy.subscribe.bind(proxy);
}
/**
* Implement fan-out for any number of Observers attached via a subscribe
* function.
*/
var ObserverProxy = class {
	/**
	* @param executor Function which can make calls to a single Observer
	*     as a proxy.
	* @param onNoObservers Callback when count of Observers goes to zero.
	*/
	constructor(executor, onNoObservers) {
		this.observers = [];
		this.unsubscribes = [];
		this.observerCount = 0;
		this.task = Promise.resolve();
		this.finalized = false;
		this.onNoObservers = onNoObservers;
		this.task.then(() => {
			executor(this);
		}).catch((e) => {
			this.error(e);
		});
	}
	next(value) {
		this.forEachObserver((observer) => {
			observer.next(value);
		});
	}
	error(error) {
		this.forEachObserver((observer) => {
			observer.error(error);
		});
		this.close(error);
	}
	complete() {
		this.forEachObserver((observer) => {
			observer.complete();
		});
		this.close();
	}
	/**
	* Subscribe function that can be used to add an Observer to the fan-out list.
	*
	* - We require that no event is sent to a subscriber synchronously to their
	*   call to subscribe().
	*/
	subscribe(nextOrObserver, error, complete) {
		let observer;
		if (nextOrObserver === void 0 && error === void 0 && complete === void 0) throw new Error("Missing Observer.");
		if (implementsAnyMethods(nextOrObserver, [
			"next",
			"error",
			"complete"
		])) observer = nextOrObserver;
		else observer = {
			next: nextOrObserver,
			error,
			complete
		};
		if (observer.next === void 0) observer.next = noop;
		if (observer.error === void 0) observer.error = noop;
		if (observer.complete === void 0) observer.complete = noop;
		const unsub = this.unsubscribeOne.bind(this, this.observers.length);
		if (this.finalized) this.task.then(() => {
			try {
				if (this.finalError) observer.error(this.finalError);
				else observer.complete();
			} catch (e) {}
		});
		this.observers.push(observer);
		return unsub;
	}
	unsubscribeOne(i) {
		if (this.observers === void 0 || this.observers[i] === void 0) return;
		delete this.observers[i];
		this.observerCount -= 1;
		if (this.observerCount === 0 && this.onNoObservers !== void 0) this.onNoObservers(this);
	}
	forEachObserver(fn) {
		if (this.finalized) return;
		for (let i = 0; i < this.observers.length; i++) this.sendOne(i, fn);
	}
	sendOne(i, fn) {
		this.task.then(() => {
			if (this.observers !== void 0 && this.observers[i] !== void 0) try {
				fn(this.observers[i]);
			} catch (e) {
				if (typeof console !== "undefined" && console.error) console.error(e);
			}
		});
	}
	close(err) {
		if (this.finalized) return;
		this.finalized = true;
		if (err !== void 0) this.finalError = err;
		this.task.then(() => {
			this.observers = void 0;
			this.onNoObservers = void 0;
		});
	}
};
/**
* Return true if the object passed in implements any of the named methods.
*/
function implementsAnyMethods(obj, methods) {
	if (typeof obj !== "object" || obj === null) return false;
	for (const method of methods) if (method in obj && typeof obj[method] === "function") return true;
	return false;
}
function noop() {}
/**
* @license
* Copyright 2021 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
function getModularInstance(service) {
	if (service && service._delegate) return service._delegate;
	else return service;
}
/**
* @license
* Copyright 2025 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* Checks whether host is a cloud workstation or not.
* @public
*/
function isCloudWorkstation(url) {
	try {
		return (url.startsWith("http://") || url.startsWith("https://") ? new URL(url).hostname : url).endsWith(".cloudworkstations.dev");
	} catch {
		return false;
	}
}
/**
* Makes a fetch request to the given server.
* Mostly used for forwarding cookies in Firebase Studio.
* @public
*/
async function pingServer(endpoint) {
	return (await fetch(endpoint, { credentials: "include" })).ok;
}
//#endregion
//#region node_modules/@firebase/component/dist/esm/index.esm.js
/**
* Component for service name T, e.g. `auth`, `auth-internal`
*/
var Component = class {
	/**
	*
	* @param name The public service name, e.g. app, auth, firestore, database
	* @param instanceFactory Service factory responsible for creating the public interface
	* @param type whether the service provided by the component is public or private
	*/
	constructor(name, instanceFactory, type) {
		this.name = name;
		this.instanceFactory = instanceFactory;
		this.type = type;
		this.multipleInstances = false;
		/**
		* Properties to be added to the service namespace
		*/
		this.serviceProps = {};
		this.instantiationMode = "LAZY";
		this.onInstanceCreated = null;
	}
	setInstantiationMode(mode) {
		this.instantiationMode = mode;
		return this;
	}
	setMultipleInstances(multipleInstances) {
		this.multipleInstances = multipleInstances;
		return this;
	}
	setServiceProps(props) {
		this.serviceProps = props;
		return this;
	}
	setInstanceCreatedCallback(callback) {
		this.onInstanceCreated = callback;
		return this;
	}
};
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var DEFAULT_ENTRY_NAME$1 = "[DEFAULT]";
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* Provider for instance for service name T, e.g. 'auth', 'auth-internal'
* NameServiceMapping[T] is an alias for the type of the instance
*/
var Provider = class {
	constructor(name, container) {
		this.name = name;
		this.container = container;
		this.component = null;
		this.instances = /* @__PURE__ */ new Map();
		this.instancesDeferred = /* @__PURE__ */ new Map();
		this.instancesOptions = /* @__PURE__ */ new Map();
		this.onInitCallbacks = /* @__PURE__ */ new Map();
	}
	/**
	* @param identifier A provider can provide multiple instances of a service
	* if this.component.multipleInstances is true.
	*/
	get(identifier) {
		const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
		if (!this.instancesDeferred.has(normalizedIdentifier)) {
			const deferred = new Deferred();
			this.instancesDeferred.set(normalizedIdentifier, deferred);
			if (this.isInitialized(normalizedIdentifier) || this.shouldAutoInitialize()) try {
				const instance = this.getOrInitializeService({ instanceIdentifier: normalizedIdentifier });
				if (instance) deferred.resolve(instance);
			} catch (e) {}
		}
		return this.instancesDeferred.get(normalizedIdentifier).promise;
	}
	getImmediate(options) {
		const normalizedIdentifier = this.normalizeInstanceIdentifier(options?.identifier);
		const optional = options?.optional ?? false;
		if (this.isInitialized(normalizedIdentifier) || this.shouldAutoInitialize()) try {
			return this.getOrInitializeService({ instanceIdentifier: normalizedIdentifier });
		} catch (e) {
			if (optional) return null;
			else throw e;
		}
		else if (optional) return null;
		else throw Error(`Service ${this.name} is not available`);
	}
	getComponent() {
		return this.component;
	}
	setComponent(component) {
		if (component.name !== this.name) throw Error(`Mismatching Component ${component.name} for Provider ${this.name}.`);
		if (this.component) throw Error(`Component for ${this.name} has already been provided`);
		this.component = component;
		if (!this.shouldAutoInitialize()) return;
		if (isComponentEager(component)) try {
			this.getOrInitializeService({ instanceIdentifier: DEFAULT_ENTRY_NAME$1 });
		} catch (e) {}
		for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) {
			const normalizedIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
			try {
				const instance = this.getOrInitializeService({ instanceIdentifier: normalizedIdentifier });
				instanceDeferred.resolve(instance);
			} catch (e) {}
		}
	}
	clearInstance(identifier = DEFAULT_ENTRY_NAME$1) {
		this.instancesDeferred.delete(identifier);
		this.instancesOptions.delete(identifier);
		this.instances.delete(identifier);
	}
	async delete() {
		const services = Array.from(this.instances.values());
		await Promise.all([...services.filter((service) => "INTERNAL" in service).map((service) => service.INTERNAL.delete()), ...services.filter((service) => "_delete" in service).map((service) => service._delete())]);
	}
	isComponentSet() {
		return this.component != null;
	}
	isInitialized(identifier = DEFAULT_ENTRY_NAME$1) {
		return this.instances.has(identifier);
	}
	getOptions(identifier = DEFAULT_ENTRY_NAME$1) {
		return this.instancesOptions.get(identifier) || {};
	}
	initialize(opts = {}) {
		const { options = {} } = opts;
		const normalizedIdentifier = this.normalizeInstanceIdentifier(opts.instanceIdentifier);
		if (this.isInitialized(normalizedIdentifier)) throw Error(`${this.name}(${normalizedIdentifier}) has already been initialized`);
		if (!this.isComponentSet()) throw Error(`Component ${this.name} has not been registered yet`);
		const instance = this.getOrInitializeService({
			instanceIdentifier: normalizedIdentifier,
			options
		});
		for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()) if (normalizedIdentifier === this.normalizeInstanceIdentifier(instanceIdentifier)) instanceDeferred.resolve(instance);
		return instance;
	}
	/**
	*
	* @param callback - a function that will be invoked  after the provider has been initialized by calling provider.initialize().
	* The function is invoked SYNCHRONOUSLY, so it should not execute any longrunning tasks in order to not block the program.
	*
	* @param identifier An optional instance identifier
	* @returns a function to unregister the callback
	*/
	onInit(callback, identifier) {
		const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
		const existingCallbacks = this.onInitCallbacks.get(normalizedIdentifier) ?? /* @__PURE__ */ new Set();
		existingCallbacks.add(callback);
		this.onInitCallbacks.set(normalizedIdentifier, existingCallbacks);
		const existingInstance = this.instances.get(normalizedIdentifier);
		if (existingInstance) callback(existingInstance, normalizedIdentifier);
		return () => {
			existingCallbacks.delete(callback);
		};
	}
	/**
	* Invoke onInit callbacks synchronously
	* @param instance the service instance`
	*/
	invokeOnInitCallbacks(instance, identifier) {
		const callbacks = this.onInitCallbacks.get(identifier);
		if (!callbacks) return;
		for (const callback of callbacks) try {
			callback(instance, identifier);
		} catch {}
	}
	getOrInitializeService({ instanceIdentifier, options = {} }) {
		let instance = this.instances.get(instanceIdentifier);
		if (!instance && this.component) {
			instance = this.component.instanceFactory(this.container, {
				instanceIdentifier: normalizeIdentifierForFactory(instanceIdentifier),
				options
			});
			this.instances.set(instanceIdentifier, instance);
			this.instancesOptions.set(instanceIdentifier, options);
			/**
			* Invoke onInit listeners.
			* Note this.component.onInstanceCreated is different, which is used by the component creator,
			* while onInit listeners are registered by consumers of the provider.
			*/
			this.invokeOnInitCallbacks(instance, instanceIdentifier);
			/**
			* Order is important
			* onInstanceCreated() should be called after this.instances.set(instanceIdentifier, instance); which
			* makes `isInitialized()` return true.
			*/
			if (this.component.onInstanceCreated) try {
				this.component.onInstanceCreated(this.container, instanceIdentifier, instance);
			} catch {}
		}
		return instance || null;
	}
	normalizeInstanceIdentifier(identifier = DEFAULT_ENTRY_NAME$1) {
		if (this.component) return this.component.multipleInstances ? identifier : DEFAULT_ENTRY_NAME$1;
		else return identifier;
	}
	shouldAutoInitialize() {
		return !!this.component && this.component.instantiationMode !== "EXPLICIT";
	}
};
function normalizeIdentifierForFactory(identifier) {
	return identifier === DEFAULT_ENTRY_NAME$1 ? void 0 : identifier;
}
function isComponentEager(component) {
	return component.instantiationMode === "EAGER";
}
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* ComponentContainer that provides Providers for service name T, e.g. `auth`, `auth-internal`
*/
var ComponentContainer = class {
	constructor(name) {
		this.name = name;
		this.providers = /* @__PURE__ */ new Map();
	}
	/**
	*
	* @param component Component being added
	* @param overwrite When a component with the same name has already been registered,
	* if overwrite is true: overwrite the existing component with the new component and create a new
	* provider with the new component. It can be useful in tests where you want to use different mocks
	* for different tests.
	* if overwrite is false: throw an exception
	*/
	addComponent(component) {
		const provider = this.getProvider(component.name);
		if (provider.isComponentSet()) throw new Error(`Component ${component.name} has already been registered with ${this.name}`);
		provider.setComponent(component);
	}
	addOrOverwriteComponent(component) {
		if (this.getProvider(component.name).isComponentSet()) this.providers.delete(component.name);
		this.addComponent(component);
	}
	/**
	* getProvider provides a type safe interface where it can only be called with a field name
	* present in NameServiceMapping interface.
	*
	* Firebase SDKs providing services should extend NameServiceMapping interface to register
	* themselves.
	*/
	getProvider(name) {
		if (this.providers.has(name)) return this.providers.get(name);
		const provider = new Provider(name, this);
		this.providers.set(name, provider);
		return provider;
	}
	getProviders() {
		return Array.from(this.providers.values());
	}
};
//#endregion
//#region node_modules/@firebase/logger/dist/esm/index.esm.js
/**
* @license
* Copyright 2017 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* A container for all of the Logger instances
*/
var instances = [];
/**
* The JS SDK supports 5 log levels and also allows a user the ability to
* silence the logs altogether.
*
* The order is a follows:
* DEBUG < VERBOSE < INFO < WARN < ERROR
*
* All of the log types above the current log level will be captured (i.e. if
* you set the log level to `INFO`, errors will still be logged, but `DEBUG` and
* `VERBOSE` logs will not)
*/
var LogLevel;
(function(LogLevel) {
	LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
	LogLevel[LogLevel["VERBOSE"] = 1] = "VERBOSE";
	LogLevel[LogLevel["INFO"] = 2] = "INFO";
	LogLevel[LogLevel["WARN"] = 3] = "WARN";
	LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
	LogLevel[LogLevel["SILENT"] = 5] = "SILENT";
})(LogLevel || (LogLevel = {}));
var levelStringToEnum = {
	"debug": LogLevel.DEBUG,
	"verbose": LogLevel.VERBOSE,
	"info": LogLevel.INFO,
	"warn": LogLevel.WARN,
	"error": LogLevel.ERROR,
	"silent": LogLevel.SILENT
};
/**
* The default log level
*/
var defaultLogLevel = LogLevel.INFO;
/**
* By default, `console.debug` is not displayed in the developer console (in
* chrome). To avoid forcing users to have to opt-in to these logs twice
* (i.e. once for firebase, and once in the console), we are sending `DEBUG`
* logs to the `console.log` function.
*/
var ConsoleMethod = {
	[LogLevel.DEBUG]: "log",
	[LogLevel.VERBOSE]: "log",
	[LogLevel.INFO]: "info",
	[LogLevel.WARN]: "warn",
	[LogLevel.ERROR]: "error"
};
/**
* The default log handler will forward DEBUG, VERBOSE, INFO, WARN, and ERROR
* messages on to their corresponding console counterparts (if the log method
* is supported by the current log level)
*/
var defaultLogHandler = (instance, logType, ...args) => {
	if (logType < instance.logLevel) return;
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const method = ConsoleMethod[logType];
	if (method) console[method](`[${now}]  ${instance.name}:`, ...args);
	else throw new Error(`Attempted to log a message with an invalid logType (value: ${logType})`);
};
var Logger = class {
	/**
	* Gives you an instance of a Logger to capture messages according to
	* Firebase's logging scheme.
	*
	* @param name The name that the logs will be associated with
	*/
	constructor(name) {
		this.name = name;
		/**
		* The log level of the given Logger instance.
		*/
		this._logLevel = defaultLogLevel;
		/**
		* The main (internal) log handler for the Logger instance.
		* Can be set to a new function in internal package code but not by user.
		*/
		this._logHandler = defaultLogHandler;
		/**
		* The optional, additional, user-defined log handler for the Logger instance.
		*/
		this._userLogHandler = null;
		/**
		* Capture the current instance for later use
		*/
		instances.push(this);
	}
	get logLevel() {
		return this._logLevel;
	}
	set logLevel(val) {
		if (!(val in LogLevel)) throw new TypeError(`Invalid value "${val}" assigned to \`logLevel\``);
		this._logLevel = val;
	}
	setLogLevel(val) {
		this._logLevel = typeof val === "string" ? levelStringToEnum[val] : val;
	}
	get logHandler() {
		return this._logHandler;
	}
	set logHandler(val) {
		if (typeof val !== "function") throw new TypeError("Value assigned to `logHandler` must be a function");
		this._logHandler = val;
	}
	get userLogHandler() {
		return this._userLogHandler;
	}
	set userLogHandler(val) {
		this._userLogHandler = val;
	}
	/**
	* The functions below are all based on the `console` interface
	*/
	debug(...args) {
		this._userLogHandler && this._userLogHandler(this, LogLevel.DEBUG, ...args);
		this._logHandler(this, LogLevel.DEBUG, ...args);
	}
	log(...args) {
		this._userLogHandler && this._userLogHandler(this, LogLevel.VERBOSE, ...args);
		this._logHandler(this, LogLevel.VERBOSE, ...args);
	}
	info(...args) {
		this._userLogHandler && this._userLogHandler(this, LogLevel.INFO, ...args);
		this._logHandler(this, LogLevel.INFO, ...args);
	}
	warn(...args) {
		this._userLogHandler && this._userLogHandler(this, LogLevel.WARN, ...args);
		this._logHandler(this, LogLevel.WARN, ...args);
	}
	error(...args) {
		this._userLogHandler && this._userLogHandler(this, LogLevel.ERROR, ...args);
		this._logHandler(this, LogLevel.ERROR, ...args);
	}
};
function setLogLevel$1(level) {
	instances.forEach((inst) => {
		inst.setLogLevel(level);
	});
}
function setUserLogHandler(logCallback, options) {
	for (const instance of instances) {
		let customLogLevel = null;
		if (options && options.level) customLogLevel = levelStringToEnum[options.level];
		if (logCallback === null) instance.userLogHandler = null;
		else instance.userLogHandler = (instance, level, ...args) => {
			const message = args.map((arg) => {
				if (arg == null) return null;
				else if (typeof arg === "string") return arg;
				else if (typeof arg === "number" || typeof arg === "boolean") return arg.toString();
				else if (arg instanceof Error) return arg.message;
				else try {
					return JSON.stringify(arg);
				} catch (ignored) {
					return null;
				}
			}).filter((arg) => arg).join(" ");
			if (level >= (customLogLevel ?? instance.logLevel)) logCallback({
				level: LogLevel[level].toLowerCase(),
				message,
				args,
				type: instance.name
			});
		};
	}
}
//#endregion
//#region node_modules/idb/build/wrap-idb-value.js
var instanceOfAny = (object, constructors) => constructors.some((c) => object instanceof c);
var idbProxyableTypes;
var cursorAdvanceMethods;
function getIdbProxyableTypes() {
	return idbProxyableTypes || (idbProxyableTypes = [
		IDBDatabase,
		IDBObjectStore,
		IDBIndex,
		IDBCursor,
		IDBTransaction
	]);
}
function getCursorAdvanceMethods() {
	return cursorAdvanceMethods || (cursorAdvanceMethods = [
		IDBCursor.prototype.advance,
		IDBCursor.prototype.continue,
		IDBCursor.prototype.continuePrimaryKey
	]);
}
var cursorRequestMap = /* @__PURE__ */ new WeakMap();
var transactionDoneMap = /* @__PURE__ */ new WeakMap();
var transactionStoreNamesMap = /* @__PURE__ */ new WeakMap();
var transformCache = /* @__PURE__ */ new WeakMap();
var reverseTransformCache = /* @__PURE__ */ new WeakMap();
function promisifyRequest(request) {
	const promise = new Promise((resolve, reject) => {
		const unlisten = () => {
			request.removeEventListener("success", success);
			request.removeEventListener("error", error);
		};
		const success = () => {
			resolve(wrap(request.result));
			unlisten();
		};
		const error = () => {
			reject(request.error);
			unlisten();
		};
		request.addEventListener("success", success);
		request.addEventListener("error", error);
	});
	promise.then((value) => {
		if (value instanceof IDBCursor) cursorRequestMap.set(value, request);
	}).catch(() => {});
	reverseTransformCache.set(promise, request);
	return promise;
}
function cacheDonePromiseForTransaction(tx) {
	if (transactionDoneMap.has(tx)) return;
	const done = new Promise((resolve, reject) => {
		const unlisten = () => {
			tx.removeEventListener("complete", complete);
			tx.removeEventListener("error", error);
			tx.removeEventListener("abort", error);
		};
		const complete = () => {
			resolve();
			unlisten();
		};
		const error = () => {
			reject(tx.error || new DOMException("AbortError", "AbortError"));
			unlisten();
		};
		tx.addEventListener("complete", complete);
		tx.addEventListener("error", error);
		tx.addEventListener("abort", error);
	});
	transactionDoneMap.set(tx, done);
}
var idbProxyTraps = {
	get(target, prop, receiver) {
		if (target instanceof IDBTransaction) {
			if (prop === "done") return transactionDoneMap.get(target);
			if (prop === "objectStoreNames") return target.objectStoreNames || transactionStoreNamesMap.get(target);
			if (prop === "store") return receiver.objectStoreNames[1] ? void 0 : receiver.objectStore(receiver.objectStoreNames[0]);
		}
		return wrap(target[prop]);
	},
	set(target, prop, value) {
		target[prop] = value;
		return true;
	},
	has(target, prop) {
		if (target instanceof IDBTransaction && (prop === "done" || prop === "store")) return true;
		return prop in target;
	}
};
function replaceTraps(callback) {
	idbProxyTraps = callback(idbProxyTraps);
}
function wrapFunction(func) {
	if (func === IDBDatabase.prototype.transaction && !("objectStoreNames" in IDBTransaction.prototype)) return function(storeNames, ...args) {
		const tx = func.call(unwrap(this), storeNames, ...args);
		transactionStoreNamesMap.set(tx, storeNames.sort ? storeNames.sort() : [storeNames]);
		return wrap(tx);
	};
	if (getCursorAdvanceMethods().includes(func)) return function(...args) {
		func.apply(unwrap(this), args);
		return wrap(cursorRequestMap.get(this));
	};
	return function(...args) {
		return wrap(func.apply(unwrap(this), args));
	};
}
function transformCachableValue(value) {
	if (typeof value === "function") return wrapFunction(value);
	if (value instanceof IDBTransaction) cacheDonePromiseForTransaction(value);
	if (instanceOfAny(value, getIdbProxyableTypes())) return new Proxy(value, idbProxyTraps);
	return value;
}
function wrap(value) {
	if (value instanceof IDBRequest) return promisifyRequest(value);
	if (transformCache.has(value)) return transformCache.get(value);
	const newValue = transformCachableValue(value);
	if (newValue !== value) {
		transformCache.set(value, newValue);
		reverseTransformCache.set(newValue, value);
	}
	return newValue;
}
var unwrap = (value) => reverseTransformCache.get(value);
//#endregion
//#region node_modules/idb/build/index.js
/**
* Open a database.
*
* @param name Name of the database.
* @param version Schema version.
* @param callbacks Additional callbacks.
*/
function openDB(name, version, { blocked, upgrade, blocking, terminated } = {}) {
	const request = indexedDB.open(name, version);
	const openPromise = wrap(request);
	if (upgrade) request.addEventListener("upgradeneeded", (event) => {
		upgrade(wrap(request.result), event.oldVersion, event.newVersion, wrap(request.transaction), event);
	});
	if (blocked) request.addEventListener("blocked", (event) => blocked(event.oldVersion, event.newVersion, event));
	openPromise.then((db) => {
		if (terminated) db.addEventListener("close", () => terminated());
		if (blocking) db.addEventListener("versionchange", (event) => blocking(event.oldVersion, event.newVersion, event));
	}).catch(() => {});
	return openPromise;
}
var readMethods = [
	"get",
	"getKey",
	"getAll",
	"getAllKeys",
	"count"
];
var writeMethods = [
	"put",
	"add",
	"delete",
	"clear"
];
var cachedMethods = /* @__PURE__ */ new Map();
function getMethod(target, prop) {
	if (!(target instanceof IDBDatabase && !(prop in target) && typeof prop === "string")) return;
	if (cachedMethods.get(prop)) return cachedMethods.get(prop);
	const targetFuncName = prop.replace(/FromIndex$/, "");
	const useIndex = prop !== targetFuncName;
	const isWrite = writeMethods.includes(targetFuncName);
	if (!(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) || !(isWrite || readMethods.includes(targetFuncName))) return;
	const method = async function(storeName, ...args) {
		const tx = this.transaction(storeName, isWrite ? "readwrite" : "readonly");
		let target = tx.store;
		if (useIndex) target = target.index(args.shift());
		return (await Promise.all([target[targetFuncName](...args), isWrite && tx.done]))[0];
	};
	cachedMethods.set(prop, method);
	return method;
}
replaceTraps((oldTraps) => ({
	...oldTraps,
	get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
	has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop)
}));
//#endregion
//#region node_modules/@firebase/app/dist/esm/index.esm.js
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var PlatformLoggerServiceImpl = class {
	constructor(container) {
		this.container = container;
	}
	getPlatformInfoString() {
		return this.container.getProviders().map((provider) => {
			if (isVersionServiceProvider(provider)) {
				const service = provider.getImmediate();
				return `${service.library}/${service.version}`;
			} else return null;
		}).filter((logString) => logString).join(" ");
	}
};
/**
*
* @param provider check if this provider provides a VersionService
*
* NOTE: Using Provider<'app-version'> is a hack to indicate that the provider
* provides VersionService. The provider is not necessarily a 'app-version'
* provider.
*/
function isVersionServiceProvider(provider) {
	return provider.getComponent()?.type === "VERSION";
}
var name$q = "@firebase/app";
var version$1 = "0.14.10";
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var logger = new Logger("@firebase/app");
var name$p = "@firebase/app-compat";
var name$o = "@firebase/analytics-compat";
var name$n = "@firebase/analytics";
var name$m = "@firebase/app-check-compat";
var name$l = "@firebase/app-check";
var name$k = "@firebase/auth";
var name$j = "@firebase/auth-compat";
var name$i = "@firebase/database";
var name$h = "@firebase/data-connect";
var name$g = "@firebase/database-compat";
var name$f = "@firebase/functions";
var name$e = "@firebase/functions-compat";
var name$d = "@firebase/installations";
var name$c = "@firebase/installations-compat";
var name$b = "@firebase/messaging";
var name$a = "@firebase/messaging-compat";
var name$9 = "@firebase/performance";
var name$8 = "@firebase/performance-compat";
var name$7 = "@firebase/remote-config";
var name$6 = "@firebase/remote-config-compat";
var name$5 = "@firebase/storage";
var name$4 = "@firebase/storage-compat";
var name$3 = "@firebase/firestore";
var name$2 = "@firebase/ai";
var name$1 = "@firebase/firestore-compat";
var name = "firebase";
var version = "12.11.0";
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* The default app name
*
* @internal
*/
var DEFAULT_ENTRY_NAME = "[DEFAULT]";
var PLATFORM_LOG_STRING = {
	[name$q]: "fire-core",
	[name$p]: "fire-core-compat",
	[name$n]: "fire-analytics",
	[name$o]: "fire-analytics-compat",
	[name$l]: "fire-app-check",
	[name$m]: "fire-app-check-compat",
	[name$k]: "fire-auth",
	[name$j]: "fire-auth-compat",
	[name$i]: "fire-rtdb",
	[name$h]: "fire-data-connect",
	[name$g]: "fire-rtdb-compat",
	[name$f]: "fire-fn",
	[name$e]: "fire-fn-compat",
	[name$d]: "fire-iid",
	[name$c]: "fire-iid-compat",
	[name$b]: "fire-fcm",
	[name$a]: "fire-fcm-compat",
	[name$9]: "fire-perf",
	[name$8]: "fire-perf-compat",
	[name$7]: "fire-rc",
	[name$6]: "fire-rc-compat",
	[name$5]: "fire-gcs",
	[name$4]: "fire-gcs-compat",
	[name$3]: "fire-fst",
	[name$1]: "fire-fst-compat",
	[name$2]: "fire-vertex",
	"fire-js": "fire-js",
	[name]: "fire-js-all"
};
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* @internal
*/
var _apps = /* @__PURE__ */ new Map();
/**
* @internal
*/
var _serverApps = /* @__PURE__ */ new Map();
/**
* Registered components.
*
* @internal
*/
var _components = /* @__PURE__ */ new Map();
/**
* @param component - the component being added to this app's container
*
* @internal
*/
function _addComponent(app, component) {
	try {
		app.container.addComponent(component);
	} catch (e) {
		logger.debug(`Component ${component.name} failed to register with FirebaseApp ${app.name}`, e);
	}
}
/**
*
* @internal
*/
function _addOrOverwriteComponent(app, component) {
	app.container.addOrOverwriteComponent(component);
}
/**
*
* @param component - the component to register
* @returns whether or not the component is registered successfully
*
* @internal
*/
function _registerComponent(component) {
	const componentName = component.name;
	if (_components.has(componentName)) {
		logger.debug(`There were multiple attempts to register component ${componentName}.`);
		return false;
	}
	_components.set(componentName, component);
	for (const app of _apps.values()) _addComponent(app, component);
	for (const serverApp of _serverApps.values()) _addComponent(serverApp, component);
	return true;
}
/**
*
* @param app - FirebaseApp instance
* @param name - service name
*
* @returns the provider for the service with the matching name
*
* @internal
*/
function _getProvider(app, name) {
	const heartbeatController = app.container.getProvider("heartbeat").getImmediate({ optional: true });
	if (heartbeatController) heartbeatController.triggerHeartbeat();
	return app.container.getProvider(name);
}
/**
*
* @param app - FirebaseApp instance
* @param name - service name
* @param instanceIdentifier - service instance identifier in case the service supports multiple instances
*
* @internal
*/
function _removeServiceInstance(app, name, instanceIdentifier = DEFAULT_ENTRY_NAME) {
	_getProvider(app, name).clearInstance(instanceIdentifier);
}
/**
*
* @param obj - an object of type FirebaseApp, FirebaseOptions or FirebaseAppSettings.
*
* @returns true if the provide object is of type FirebaseApp.
*
* @internal
*/
function _isFirebaseApp(obj) {
	return obj.options !== void 0;
}
/**
*
* @param obj - an object of type FirebaseApp, FirebaseOptions or FirebaseAppSettings.
*
* @returns true if the provided object is of type FirebaseServerAppImpl.
*
* @internal
*/
function _isFirebaseServerAppSettings(obj) {
	if (_isFirebaseApp(obj)) return false;
	return "authIdToken" in obj || "appCheckToken" in obj || "releaseOnDeref" in obj || "automaticDataCollectionEnabled" in obj;
}
/**
*
* @param obj - an object of type FirebaseApp.
*
* @returns true if the provided object is of type FirebaseServerAppImpl.
*
* @internal
*/
function _isFirebaseServerApp(obj) {
	if (obj === null || obj === void 0) return false;
	return obj.settings !== void 0;
}
/**
* Test only
*
* @internal
*/
function _clearComponents() {
	_components.clear();
}
var ERROR_FACTORY = new ErrorFactory("app", "Firebase", {
	["no-app"]: "No Firebase App '{$appName}' has been created - call initializeApp() first",
	["bad-app-name"]: "Illegal App name: '{$appName}'",
	["duplicate-app"]: "Firebase App named '{$appName}' already exists with different options or config",
	["app-deleted"]: "Firebase App named '{$appName}' already deleted",
	["server-app-deleted"]: "Firebase Server App has been deleted",
	["no-options"]: "Need to provide options, when not being deployed to hosting via source.",
	["invalid-app-argument"]: "firebase.{$appName}() takes either no argument or a Firebase App instance.",
	["invalid-log-argument"]: "First argument to `onLog` must be null or a function.",
	["idb-open"]: "Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.",
	["idb-get"]: "Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.",
	["idb-set"]: "Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.",
	["idb-delete"]: "Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.",
	["finalization-registry-not-supported"]: "FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.",
	["invalid-server-app-environment"]: "FirebaseServerApp is not for use in browser environments."
});
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var FirebaseAppImpl = class {
	constructor(options, config, container) {
		this._isDeleted = false;
		this._options = { ...options };
		this._config = { ...config };
		this._name = config.name;
		this._automaticDataCollectionEnabled = config.automaticDataCollectionEnabled;
		this._container = container;
		this.container.addComponent(new Component("app", () => this, "PUBLIC"));
	}
	get automaticDataCollectionEnabled() {
		this.checkDestroyed();
		return this._automaticDataCollectionEnabled;
	}
	set automaticDataCollectionEnabled(val) {
		this.checkDestroyed();
		this._automaticDataCollectionEnabled = val;
	}
	get name() {
		this.checkDestroyed();
		return this._name;
	}
	get options() {
		this.checkDestroyed();
		return this._options;
	}
	get config() {
		this.checkDestroyed();
		return this._config;
	}
	get container() {
		return this._container;
	}
	get isDeleted() {
		return this._isDeleted;
	}
	set isDeleted(val) {
		this._isDeleted = val;
	}
	/**
	* This function will throw an Error if the App has already been deleted -
	* use before performing API actions on the App.
	*/
	checkDestroyed() {
		if (this.isDeleted) throw ERROR_FACTORY.create("app-deleted", { appName: this._name });
	}
};
/**
* @license
* Copyright 2023 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
function validateTokenTTL(base64Token, tokenName) {
	const secondPart = base64Decode(base64Token.split(".")[1]);
	if (secondPart === null) {
		console.error(`FirebaseServerApp ${tokenName} is invalid: second part could not be parsed.`);
		return;
	}
	if (JSON.parse(secondPart).exp === void 0) {
		console.error(`FirebaseServerApp ${tokenName} is invalid: expiration claim could not be parsed`);
		return;
	}
	if (JSON.parse(secondPart).exp * 1e3 - (/* @__PURE__ */ new Date()).getTime() <= 0) console.error(`FirebaseServerApp ${tokenName} is invalid: the token has expired.`);
}
var FirebaseServerAppImpl = class extends FirebaseAppImpl {
	constructor(options, serverConfig, name, container) {
		const automaticDataCollectionEnabled = serverConfig.automaticDataCollectionEnabled !== void 0 ? serverConfig.automaticDataCollectionEnabled : true;
		const config = {
			name,
			automaticDataCollectionEnabled
		};
		if (options.apiKey !== void 0) super(options, config, container);
		else super(options.options, config, container);
		this._serverConfig = {
			automaticDataCollectionEnabled,
			...serverConfig
		};
		if (this._serverConfig.authIdToken) validateTokenTTL(this._serverConfig.authIdToken, "authIdToken");
		if (this._serverConfig.appCheckToken) validateTokenTTL(this._serverConfig.appCheckToken, "appCheckToken");
		this._finalizationRegistry = null;
		if (typeof FinalizationRegistry !== "undefined") this._finalizationRegistry = new FinalizationRegistry(() => {
			this.automaticCleanup();
		});
		this._refCount = 0;
		this.incRefCount(this._serverConfig.releaseOnDeref);
		this._serverConfig.releaseOnDeref = void 0;
		serverConfig.releaseOnDeref = void 0;
		registerVersion(name$q, version$1, "serverapp");
	}
	toJSON() {}
	get refCount() {
		return this._refCount;
	}
	incRefCount(obj) {
		if (this.isDeleted) return;
		this._refCount++;
		if (obj !== void 0 && this._finalizationRegistry !== null) this._finalizationRegistry.register(obj, this);
	}
	decRefCount() {
		if (this.isDeleted) return 0;
		return --this._refCount;
	}
	automaticCleanup() {
		deleteApp(this);
	}
	get settings() {
		this.checkDestroyed();
		return this._serverConfig;
	}
	/**
	* This function will throw an Error if the App has already been deleted -
	* use before performing API actions on the App.
	*/
	checkDestroyed() {
		if (this.isDeleted) throw ERROR_FACTORY.create("server-app-deleted");
	}
};
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* The current SDK version.
*
* @public
*/
var SDK_VERSION = version;
function initializeApp(_options, rawConfig = {}) {
	let options = _options;
	if (typeof rawConfig !== "object") rawConfig = { name: rawConfig };
	const config = {
		name: DEFAULT_ENTRY_NAME,
		automaticDataCollectionEnabled: true,
		...rawConfig
	};
	const name = config.name;
	if (typeof name !== "string" || !name) throw ERROR_FACTORY.create("bad-app-name", { appName: String(name) });
	options || (options = getDefaultAppConfig());
	if (!options) throw ERROR_FACTORY.create("no-options");
	const existingApp = _apps.get(name);
	if (existingApp) if (deepEqual(options, existingApp.options) && deepEqual(config, existingApp.config)) return existingApp;
	else throw ERROR_FACTORY.create("duplicate-app", { appName: name });
	const container = new ComponentContainer(name);
	for (const component of _components.values()) container.addComponent(component);
	const newApp = new FirebaseAppImpl(options, config, container);
	_apps.set(name, newApp);
	return newApp;
}
function initializeServerApp(_options, _serverAppConfig = {}) {
	if (isBrowser() && !isWebWorker()) throw ERROR_FACTORY.create("invalid-server-app-environment");
	let firebaseOptions;
	let serverAppSettings = _serverAppConfig || {};
	if (_options) if (_isFirebaseApp(_options)) firebaseOptions = _options.options;
	else if (_isFirebaseServerAppSettings(_options)) serverAppSettings = _options;
	else firebaseOptions = _options;
	if (serverAppSettings.automaticDataCollectionEnabled === void 0) serverAppSettings.automaticDataCollectionEnabled = true;
	firebaseOptions || (firebaseOptions = getDefaultAppConfig());
	if (!firebaseOptions) throw ERROR_FACTORY.create("no-options");
	const nameObj = {
		...serverAppSettings,
		...firebaseOptions
	};
	if (nameObj.releaseOnDeref !== void 0) delete nameObj.releaseOnDeref;
	const hashCode = (s) => {
		return [...s].reduce((hash, c) => Math.imul(31, hash) + c.charCodeAt(0) | 0, 0);
	};
	if (serverAppSettings.releaseOnDeref !== void 0) {
		if (typeof FinalizationRegistry === "undefined") throw ERROR_FACTORY.create("finalization-registry-not-supported", {});
	}
	const nameString = "" + hashCode(JSON.stringify(nameObj));
	const existingApp = _serverApps.get(nameString);
	if (existingApp) {
		existingApp.incRefCount(serverAppSettings.releaseOnDeref);
		return existingApp;
	}
	const container = new ComponentContainer(nameString);
	for (const component of _components.values()) container.addComponent(component);
	const newApp = new FirebaseServerAppImpl(firebaseOptions, serverAppSettings, nameString, container);
	_serverApps.set(nameString, newApp);
	return newApp;
}
/**
* Retrieves a {@link @firebase/app#FirebaseApp} instance.
*
* When called with no arguments, the default app is returned. When an app name
* is provided, the app corresponding to that name is returned.
*
* An exception is thrown if the app being retrieved has not yet been
* initialized.
*
* @example
* ```javascript
* // Return the default app
* const app = getApp();
* ```
*
* @example
* ```javascript
* // Return a named app
* const otherApp = getApp("otherApp");
* ```
*
* @param name - Optional name of the app to return. If no name is
*   provided, the default is `"[DEFAULT]"`.
*
* @returns The app corresponding to the provided app name.
*   If no app name is provided, the default app is returned.
*
* @public
*/
function getApp(name = DEFAULT_ENTRY_NAME) {
	const app = _apps.get(name);
	if (!app && name === "[DEFAULT]" && getDefaultAppConfig()) return initializeApp();
	if (!app) throw ERROR_FACTORY.create("no-app", { appName: name });
	return app;
}
/**
* A (read-only) array of all initialized apps.
* @public
*/
function getApps() {
	return Array.from(_apps.values());
}
/**
* Renders this app unusable and frees the resources of all associated
* services.
*
* @example
* ```javascript
* deleteApp(app)
*   .then(function() {
*     console.log("App deleted successfully");
*   })
*   .catch(function(error) {
*     console.log("Error deleting app:", error);
*   });
* ```
*
* @public
*/
async function deleteApp(app) {
	let cleanupProviders = false;
	const name = app.name;
	if (_apps.has(name)) {
		cleanupProviders = true;
		_apps.delete(name);
	} else if (_serverApps.has(name)) {
		if (app.decRefCount() <= 0) {
			_serverApps.delete(name);
			cleanupProviders = true;
		}
	}
	if (cleanupProviders) {
		await Promise.all(app.container.getProviders().map((provider) => provider.delete()));
		app.isDeleted = true;
	}
}
/**
* Registers a library's name and version for platform logging purposes.
* @param library - Name of 1p or 3p library (e.g. firestore, angularfire)
* @param version - Current version of that library.
* @param variant - Bundle variant, e.g., node, rn, etc.
*
* @public
*/
function registerVersion(libraryKeyOrName, version, variant) {
	let library = PLATFORM_LOG_STRING[libraryKeyOrName] ?? libraryKeyOrName;
	if (variant) library += `-${variant}`;
	const libraryMismatch = library.match(/\s|\//);
	const versionMismatch = version.match(/\s|\//);
	if (libraryMismatch || versionMismatch) {
		const warning = [`Unable to register library "${library}" with version "${version}":`];
		if (libraryMismatch) warning.push(`library name "${library}" contains illegal characters (whitespace or "/")`);
		if (libraryMismatch && versionMismatch) warning.push("and");
		if (versionMismatch) warning.push(`version name "${version}" contains illegal characters (whitespace or "/")`);
		logger.warn(warning.join(" "));
		return;
	}
	_registerComponent(new Component(`${library}-version`, () => ({
		library,
		version
	}), "VERSION"));
}
/**
* Sets log handler for all Firebase SDKs.
* @param logCallback - An optional custom log handler that executes user code whenever
* the Firebase SDK makes a logging call.
*
* @public
*/
function onLog(logCallback, options) {
	if (logCallback !== null && typeof logCallback !== "function") throw ERROR_FACTORY.create("invalid-log-argument");
	setUserLogHandler(logCallback, options);
}
/**
* Sets log level for all Firebase SDKs.
*
* All of the log types above the current log level are captured (i.e. if
* you set the log level to `info`, errors are logged, but `debug` and
* `verbose` logs are not).
*
* @public
*/
function setLogLevel(logLevel) {
	setLogLevel$1(logLevel);
}
/**
* @license
* Copyright 2021 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var DB_NAME = "firebase-heartbeat-database";
var DB_VERSION = 1;
var STORE_NAME = "firebase-heartbeat-store";
var dbPromise = null;
function getDbPromise() {
	if (!dbPromise) dbPromise = openDB(DB_NAME, DB_VERSION, { upgrade: (db, oldVersion) => {
		switch (oldVersion) {
			case 0: try {
				db.createObjectStore(STORE_NAME);
			} catch (e) {
				console.warn(e);
			}
		}
	} }).catch((e) => {
		throw ERROR_FACTORY.create("idb-open", { originalErrorMessage: e.message });
	});
	return dbPromise;
}
async function readHeartbeatsFromIndexedDB(app) {
	try {
		const tx = (await getDbPromise()).transaction(STORE_NAME);
		const result = await tx.objectStore(STORE_NAME).get(computeKey(app));
		await tx.done;
		return result;
	} catch (e) {
		if (e instanceof FirebaseError) logger.warn(e.message);
		else {
			const idbGetError = ERROR_FACTORY.create("idb-get", { originalErrorMessage: e?.message });
			logger.warn(idbGetError.message);
		}
	}
}
async function writeHeartbeatsToIndexedDB(app, heartbeatObject) {
	try {
		const tx = (await getDbPromise()).transaction(STORE_NAME, "readwrite");
		await tx.objectStore(STORE_NAME).put(heartbeatObject, computeKey(app));
		await tx.done;
	} catch (e) {
		if (e instanceof FirebaseError) logger.warn(e.message);
		else {
			const idbGetError = ERROR_FACTORY.create("idb-set", { originalErrorMessage: e?.message });
			logger.warn(idbGetError.message);
		}
	}
}
function computeKey(app) {
	return `${app.name}!${app.options.appId}`;
}
/**
* @license
* Copyright 2021 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var MAX_HEADER_BYTES = 1024;
var MAX_NUM_STORED_HEARTBEATS = 30;
var HeartbeatServiceImpl = class {
	constructor(container) {
		this.container = container;
		/**
		* In-memory cache for heartbeats, used by getHeartbeatsHeader() to generate
		* the header string.
		* Stores one record per date. This will be consolidated into the standard
		* format of one record per user agent string before being sent as a header.
		* Populated from indexedDB when the controller is instantiated and should
		* be kept in sync with indexedDB.
		* Leave public for easier testing.
		*/
		this._heartbeatsCache = null;
		this._storage = new HeartbeatStorageImpl(this.container.getProvider("app").getImmediate());
		this._heartbeatsCachePromise = this._storage.read().then((result) => {
			this._heartbeatsCache = result;
			return result;
		});
	}
	/**
	* Called to report a heartbeat. The function will generate
	* a HeartbeatsByUserAgent object, update heartbeatsCache, and persist it
	* to IndexedDB.
	* Note that we only store one heartbeat per day. So if a heartbeat for today is
	* already logged, subsequent calls to this function in the same day will be ignored.
	*/
	async triggerHeartbeat() {
		try {
			const agent = this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString();
			const date = getUTCDateString();
			if (this._heartbeatsCache?.heartbeats == null) {
				this._heartbeatsCache = await this._heartbeatsCachePromise;
				if (this._heartbeatsCache?.heartbeats == null) return;
			}
			if (this._heartbeatsCache.lastSentHeartbeatDate === date || this._heartbeatsCache.heartbeats.some((singleDateHeartbeat) => singleDateHeartbeat.date === date)) return;
			else {
				this._heartbeatsCache.heartbeats.push({
					date,
					agent
				});
				if (this._heartbeatsCache.heartbeats.length > MAX_NUM_STORED_HEARTBEATS) {
					const earliestHeartbeatIdx = getEarliestHeartbeatIdx(this._heartbeatsCache.heartbeats);
					this._heartbeatsCache.heartbeats.splice(earliestHeartbeatIdx, 1);
				}
			}
			return this._storage.overwrite(this._heartbeatsCache);
		} catch (e) {
			logger.warn(e);
		}
	}
	/**
	* Returns a base64 encoded string which can be attached to the heartbeat-specific header directly.
	* It also clears all heartbeats from memory as well as in IndexedDB.
	*
	* NOTE: Consuming product SDKs should not send the header if this method
	* returns an empty string.
	*/
	async getHeartbeatsHeader() {
		try {
			if (this._heartbeatsCache === null) await this._heartbeatsCachePromise;
			if (this._heartbeatsCache?.heartbeats == null || this._heartbeatsCache.heartbeats.length === 0) return "";
			const date = getUTCDateString();
			const { heartbeatsToSend, unsentEntries } = extractHeartbeatsForHeader(this._heartbeatsCache.heartbeats);
			const headerString = base64urlEncodeWithoutPadding(JSON.stringify({
				version: 2,
				heartbeats: heartbeatsToSend
			}));
			this._heartbeatsCache.lastSentHeartbeatDate = date;
			if (unsentEntries.length > 0) {
				this._heartbeatsCache.heartbeats = unsentEntries;
				await this._storage.overwrite(this._heartbeatsCache);
			} else {
				this._heartbeatsCache.heartbeats = [];
				this._storage.overwrite(this._heartbeatsCache);
			}
			return headerString;
		} catch (e) {
			logger.warn(e);
			return "";
		}
	}
};
function getUTCDateString() {
	return (/* @__PURE__ */ new Date()).toISOString().substring(0, 10);
}
function extractHeartbeatsForHeader(heartbeatsCache, maxSize = MAX_HEADER_BYTES) {
	const heartbeatsToSend = [];
	let unsentEntries = heartbeatsCache.slice();
	for (const singleDateHeartbeat of heartbeatsCache) {
		const heartbeatEntry = heartbeatsToSend.find((hb) => hb.agent === singleDateHeartbeat.agent);
		if (!heartbeatEntry) {
			heartbeatsToSend.push({
				agent: singleDateHeartbeat.agent,
				dates: [singleDateHeartbeat.date]
			});
			if (countBytes(heartbeatsToSend) > maxSize) {
				heartbeatsToSend.pop();
				break;
			}
		} else {
			heartbeatEntry.dates.push(singleDateHeartbeat.date);
			if (countBytes(heartbeatsToSend) > maxSize) {
				heartbeatEntry.dates.pop();
				break;
			}
		}
		unsentEntries = unsentEntries.slice(1);
	}
	return {
		heartbeatsToSend,
		unsentEntries
	};
}
var HeartbeatStorageImpl = class {
	constructor(app) {
		this.app = app;
		this._canUseIndexedDBPromise = this.runIndexedDBEnvironmentCheck();
	}
	async runIndexedDBEnvironmentCheck() {
		if (!isIndexedDBAvailable()) return false;
		else return validateIndexedDBOpenable().then(() => true).catch(() => false);
	}
	/**
	* Read all heartbeats.
	*/
	async read() {
		if (!await this._canUseIndexedDBPromise) return { heartbeats: [] };
		else {
			const idbHeartbeatObject = await readHeartbeatsFromIndexedDB(this.app);
			if (idbHeartbeatObject?.heartbeats) return idbHeartbeatObject;
			else return { heartbeats: [] };
		}
	}
	async overwrite(heartbeatsObject) {
		if (!await this._canUseIndexedDBPromise) return;
		else {
			const existingHeartbeatsObject = await this.read();
			return writeHeartbeatsToIndexedDB(this.app, {
				lastSentHeartbeatDate: heartbeatsObject.lastSentHeartbeatDate ?? existingHeartbeatsObject.lastSentHeartbeatDate,
				heartbeats: heartbeatsObject.heartbeats
			});
		}
	}
	async add(heartbeatsObject) {
		if (!await this._canUseIndexedDBPromise) return;
		else {
			const existingHeartbeatsObject = await this.read();
			return writeHeartbeatsToIndexedDB(this.app, {
				lastSentHeartbeatDate: heartbeatsObject.lastSentHeartbeatDate ?? existingHeartbeatsObject.lastSentHeartbeatDate,
				heartbeats: [...existingHeartbeatsObject.heartbeats, ...heartbeatsObject.heartbeats]
			});
		}
	}
};
/**
* Calculate bytes of a HeartbeatsByUserAgent array after being wrapped
* in a platform logging header JSON object, stringified, and converted
* to base 64.
*/
function countBytes(heartbeatsCache) {
	return base64urlEncodeWithoutPadding(JSON.stringify({
		version: 2,
		heartbeats: heartbeatsCache
	})).length;
}
/**
* Returns the index of the heartbeat with the earliest date.
* If the heartbeats array is empty, -1 is returned.
*/
function getEarliestHeartbeatIdx(heartbeats) {
	if (heartbeats.length === 0) return -1;
	let earliestHeartbeatIdx = 0;
	let earliestHeartbeatDate = heartbeats[0].date;
	for (let i = 1; i < heartbeats.length; i++) if (heartbeats[i].date < earliestHeartbeatDate) {
		earliestHeartbeatDate = heartbeats[i].date;
		earliestHeartbeatIdx = i;
	}
	return earliestHeartbeatIdx;
}
/**
* @license
* Copyright 2019 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
function registerCoreComponents(variant) {
	_registerComponent(new Component("platform-logger", (container) => new PlatformLoggerServiceImpl(container), "PRIVATE"));
	_registerComponent(new Component("heartbeat", (container) => new HeartbeatServiceImpl(container), "PRIVATE"));
	registerVersion(name$q, version$1, variant);
	registerVersion(name$q, version$1, "esm2020");
	registerVersion("fire-js", "");
}
/**
* Firebase App
*
* @remarks This package coordinates the communication between the different Firebase components
* @packageDocumentation
*/
registerCoreComponents("");
//#endregion
export { deepEqual as A, isIE as B, LogLevel as C, FirebaseError as D, ErrorFactory as E, getUA as F, querystringDecode as G, isReactNative as H, isBrowserExtension as I, isCloudWorkstation as L, getDefaultEmulatorHost as M, getExperimentalSetting as N, base64Decode as O, getModularInstance as P, isCloudflareWorker as R, setLogLevel as S, Component as T, pingServer as U, isMobileCordova as V, querystring as W, getApps as _, _apps as a, onLog as b, _getProvider as c, _isFirebaseServerAppSettings as d, _registerComponent as f, getApp as g, deleteApp as h, _addOrOverwriteComponent as i, extractQuerystring as j, createSubscribe as k, _isFirebaseApp as l, _serverApps as m, SDK_VERSION as n, _clearComponents as o, _removeServiceInstance as p, _addComponent as r, _components as s, DEFAULT_ENTRY_NAME as t, _isFirebaseServerApp as u, initializeApp as v, Logger as w, registerVersion as x, initializeServerApp as y, isEmpty as z };

//# sourceMappingURL=index.esm-BhZHjKuY.js.map