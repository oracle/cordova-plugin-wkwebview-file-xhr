/*
 * Copyright (c) 2016 Oracle and/or its affiliates. 
 *
 * The Universal Permissive License (UPL), Version 1.0
 *
 * Subject to the condition set forth below, permission is hereby granted to any person obtaining a copy of this
 * software, associated documentation and/or data (collectively the "Software"), free of charge and under any and
 * all copyright rights in the Software, and any and all patent rights owned or freely licensable by each
 * licensor hereunder covering either (i) the unmodified Software as contributed to or provided by such licensor,
 * or (ii) the Larger Works (as defined below), to deal in both
 *
 *
 * (a) the Software, and
 *
 * (b) any piece of software and/or hardware listed in the lrgrwrks.txt file if one is included with the Software
 * (each a “Larger Work” to which the Software is contributed by such licensors),
 *
 * without restriction, including without limitation the rights to copy, create derivative works of, display,
 * perform, and distribute the Software and make, use, sell, offer for sale, import, export, have made, and
 * have sold the Software and the Larger Work(s), and to sublicense the foregoing rights on either these or other
 * terms.
 *
 * This license is subject to the following condition:
 *
 * The above copyright notice and either this complete permission notice or at a minimum a reference to the UPL
 * must be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

#import "CDVWKWebViewFileXhr.h"
#import <Cordova/CDV.h>

@implementation CDVWKWebViewFileXhr

/*!
 * @param uri target relative file from the XMLHttpRequest polyfill
 * @return URL relative to the main bundle's www folder
 */
-(NSURL*)getWebContentResourceURL: (NSString*) uri
{
    NSString *wwwuri = [NSString stringWithFormat:@"www/%@", uri];
    NSURL *baseURL = [[NSBundle mainBundle] resourceURL];
    return [NSURL URLWithString:wwwuri relativeToURL:baseURL];
}

/*!
 * @discussion Verifying the standardized path of the target URL is under the www
 * folder of the main bundle.
 *
 * @param targetURL target file under the www folder of the main bundle
 * @return true if the targetURL is within the www folder in the main bundle
 */
-(BOOL)isWebContentResourceSecure: (NSURL*) targetURL
{
    NSURL *baseURL = [NSURL URLWithString:@"www" relativeToURL:[[NSBundle mainBundle] resourceURL]];
    NSString *basePath = [baseURL absoluteString];
    NSString *targetPath = [[targetURL standardizedURL] absoluteString];
    return [targetPath hasPrefix:basePath];
}

/*!
 * @discussion Cordova API command impl that reads and return file data as a javascript string
 * @param command NSArray* arguments[0] - NSString* uri
 */
- (void)readAsText:(CDVInvokedUrlCommand*)command
{
    NSString *uri = [command.arguments.firstObject isKindOfClass: NSString.class] ? command.arguments.firstObject : nil;
    if (uri.length == 0) {
        // this catches nil value or empty string
        [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_IO_EXCEPTION messageAsInt:404] callbackId:command.callbackId];
        return;
    }

    NSURL *targetURL = [self getWebContentResourceURL:uri];
    
    if (![self isWebContentResourceSecure:targetURL]) {
        
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ILLEGAL_ACCESS_EXCEPTION messageAsInt:404];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        
    } else {
        
        __weak CDVWKWebViewFileXhr* weakSelf = self;
        [self.commandDelegate runInBackground:^ {
            
            NSData* data = [[NSData alloc] initWithContentsOfURL:targetURL];
            CDVPluginResult* result = nil;
            
            if (data != nil) {
                NSString* str = [[NSString alloc] initWithBytesNoCopy:(void*)[data bytes] length:[data length] encoding:NSUTF8StringEncoding freeWhenDone:NO];
                
                // Check that UTF8 conversion did not fail.
                if (str != nil) {
                    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:str];
                    result.associatedObject = data;
                }
            }
            
            if (result == nil) {
                result = [CDVPluginResult resultWithStatus:CDVCommandStatus_IO_EXCEPTION messageAsInt:404];
            }
            
            [weakSelf.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        }];
    }
}

/*!
 * @discussion Cordova API command impl that reads and return file data as a javascript arraybuffer
 * @param command NSArray* arguments[0] - NSString* uri
 */
- (void)readAsArrayBuffer:(CDVInvokedUrlCommand*)command
{
    NSString *uri = [command.arguments.firstObject isKindOfClass: NSString.class] ? command.arguments.firstObject : nil;
    if (uri.length == 0) {
        // this catches nil value or empty string
        [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_IO_EXCEPTION messageAsInt:404] callbackId:command.callbackId];
        return;
    } 
    NSURL *targetURL = [self getWebContentResourceURL:uri];
    
    if (![self isWebContentResourceSecure:targetURL]) {
        
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ILLEGAL_ACCESS_EXCEPTION messageAsInt:404];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        
    } else {
        
        __weak CDVWKWebViewFileXhr* weakSelf = self;
        [self.commandDelegate runInBackground:^ {
            
            NSData* data = [[NSData alloc] initWithContentsOfURL:targetURL];
            
            CDVPluginResult* result = nil;
            if (data != nil) {
                result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArrayBuffer:data];
            } else {
                result = [CDVPluginResult resultWithStatus:CDVCommandStatus_IO_EXCEPTION messageAsInt:404];
            }
            
            [weakSelf.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        }];
    }
}
@end
