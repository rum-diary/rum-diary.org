# rum-diary.org

Real user metrics with ethics.

## Guiding principles

* Site operators need visitor information to make good business decisions.
* Site visitors have a right to privacy. Visitors give the sites they visit a level of trust that is not automatically extended to third parties.
* Data should be collected about a user only when necessary.
* Visitors should know what data is collected, how that data is used, with whom it is shared, how long it is retained, and whether it can be deleted.
* Every effort should be made to minimize fingerprintability by collecting as little data as necessary and anonymizing and aggregating the data that is collected.

## Prerequisites:

* [nodejs](http://nodejs.org/) &gt;= 0.10.0
* [mongodb](http://www.mongodb.org/) - on OSX with homebrew - `brew install mongo`

## Installation

1. Fork and clone [the repo](https://github.com/shane-tomlinson/rum-diary.org) from GitHub - https://github.com/shane-tomlinson/rum-diary.org/
2. `npm install`
3. Copy `server/etc/local.json-sample` to `server/etc/local.json`
4. In `server/etc/local.json`, modify the value of `session_cookie_secret`

## Run the server

1. `grunt server`

## View the site locally

1. Run the server
2. Point your browser to http://localhost:8443

## Back end tests

1. `npm test`

## Front end tests

1. `grunt server:test`
2. Open `http://localhost:8443/tests/index.html` in the browser

## Add rum-diary statistics to a site

There are several ways to add rum-diary statistics to a site.

### The simple way - let rum-diary.org handle everything.

1. Add a script tag to https://rum-dairy.org/include.js to your HTML.

This method requires CORS to submit statistics and does not work with older browsers.

While this method is simple, it comes with the drawback of the least amount of privacy and auditability. Since rum-diary.org hosts the statistics collection script as well as directly receives the results, rum-diary.org has the ability to change any data it sees fit, at any time. Rum-diary.org also has the ability to track your users via cookies or IP address. As a site operator, you have no way of auditing what data is collected about your users.

### The more difficult way with increased privacy and auditability - host include.js and proxy stats via your site

1. Install and serve [rum-dairy-js-client](https://github.com/rum-diary/rum-diary-js-client), the client side statistics library. Available on GitHub, bower, and npm.
2. Proxy results via your site. Node.js sites can use [rum-diary-endpoint](https://github.com/rum-diary/rum-diary-endpoint) with the [HTTP Collector](https://github.com/rum-diary/rum-diary-endpoint#send-results-to-rum-diaryorg).

This method is more complex, but also has better privacy and audit properties. With this method, your site controls the client side library that collects data, as well as the results that are sent to rum-diary.org. Since all results are sent via your site, you decouple your users from rum-diary.org and eliminate the possibility of rum-diary.org tracking your users. You can audit each result's data to ensure no unexpected data is ever revealed about your users.

### The most difficult, but private way - host your own stack.

1. Set up your own rum-diary results aggregator (rum-diary.org).
2. Add a script tag to <url_to_your_rum_diary_instance>/include.js to your HTML.

This method is the most complex because it involves running a mongodb instance and a node server. The additional complexity means you control all the pieces, have total control over what data is collected, what data is stored, and how that data is used.

## Author:
* Shane Tomlinson
* shane@shanetomlinson.com
* stomlinson@mozilla.com
* set117@yahoo.com
* https://shanetomlinson.com
* https://github.com/shane-tomlinson
* @shane_tomlinson

## Get involved:

Lots of work needs to be done! I obviously am not a designer, marketer, database administrator, or data engineer. Work needs done everywhere, from the landing page, through to capturing data in a privacy sensitive way and presenting awesome insights to site operators.

More concretely:

* Ensure a site visitor's privacy is respected through anonymisation and aggregation.
* Present site administrators with visitor valuable insights.
* Simplify site administration.
* Make the site aesthetically beautiful.
* Simplify local deployment.
* Crunch numbers in a performant way.

## License:
This software is available under version 2.0 of the MPL:

  https://www.mozilla.org/MPL/

