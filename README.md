# Now

An app for seeing live foursquare checkins around the globe.

## [Live Demo](http://appbaseio.github.io/Now/)

A hosted live demo can be seen on the gh-pages branch link above.  

Alternatively, you can clone the repo and run a static server with ``python`` in the root folder.

```
$ git clone https://github.com/appbaseio/Now/ && cd Now
$ python -m SimpleHTTPServer 3000
```

## Backend

**Now** is built with [appbase.io](https://appbase.io) and has a [backend worker](https://github.com/rishiloyola/Now-worker) that continuously fetches streaming data from Twitter for new foursquare checkins.

## License

The code is licensed under [MIT](https://github.com/appbaseio/Now/blob/master/LICENSE), and encourages usage and distribution.
