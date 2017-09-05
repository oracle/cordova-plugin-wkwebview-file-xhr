# Running Plugin Tests
Our plugin uses the [Cordova Plugin Test Framework](https://github.com/apache/cordova-plugin-test-framework/blob/master/README.md) for its test automation strategy.

## Steps to Run
+ Clone the repository.  The tests project is a sub folder so we need to install the plugins from the local file system.
```
    git clone http://git-wip-us.apache.org/repos/asf/cordova-plugin-test-framework.git
```
+ Create a cordova project using the cordova CLI:
```
    cordova create test oj.test TestFileXhr
    cd test
    cordova platform add ios
```
+ Install the test harness:
```
    cordova plugin add http://git-wip-us.apache.org/repos/asf/cordova-plugin-test-framework.git
```
+ Change the start page in "`test/config.xml`" with `<content src="cdvtests/index.html"/>`.
+ Install "`cordova-plugin-wkwebview-file-xhr`" plugin and associated tests:
```
    cordova plugin add ../cordova-plugin-wkwebview-file-xhr
    cordova plugin add ../cordova-plugin-wkwebview-file-xhr/tests
```
+ Open the Xcode project "`test/platforms/ios/TestFileXhr.xcodeproj`" in the Xcode IDE and run.  Alternatively, use the cordova CLI:
```
    cordova build
    cordova run ios
```
