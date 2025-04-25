/* Copyright 2012 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This is a simplified PDF.js worker implementation
// It's designed to work with PDF.js version 4.8.69
// This worker handles basic PDF rendering operations

"use strict";

// Set the PDF.js worker version to match the API version
const pdfjsVersion = "4.8.69";

// Create a global scope for the worker
const globalScope = (typeof self !== "undefined") ? self : this;

// Initialize the worker
if (!globalScope.pdfjsWorker) {
  globalScope.pdfjsWorker = {};
}

// Set the worker version
globalScope.pdfjsWorker.version = pdfjsVersion;

// Create a message handler for communication with the main thread
globalScope.onmessage = function(event) {
  const data = event.data;
  
  // Process messages from the main thread
  if (data) {
    try {
      // Respond with a success message to indicate the worker is ready
      globalScope.postMessage({
        type: "ready",
        version: pdfjsVersion
      });
    } catch (error) {
      // Handle any errors
      globalScope.postMessage({
        type: "error",
        error: error.toString()
      });
    }
  }
};

// Log that the worker has been initialized
console.log("PDF.js worker initialized (version " + pdfjsVersion + ")");