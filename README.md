# cf-plus-server

* [What's this?](https://github.com/schwarzkopfb/cf-plus)
* [Browser Extension (client)](https://github.com/schwarzkopfb/cf-plus-browser-extension)

The server provides a simple REST API for user management and powerUp suggestions. It's backed by [Redis](https://redis.io) for fast permanent storage and based on [Deno](https://deno.land) for low latency.

Optionally a server access token can be set to keep out unknown users. If that's enabled then an `X-Access-Token` header will be required for every request.

Config can be passed via environment variables:
* `CFP_REDIS_HOST`
* `CFP_REDIS_PORT`
* `CFP_REDIS_USERNAME`
* `CFP_REDIS_PASSWORD`
* `CFP_SERVER_ACCESS_TOKEN` (optional)

To start the server locally for development, run `deno task start`. This will watch for file changes and restarts the server.

Tested with [Deno Deploy](https://deno.com/deploy).

[MIT licensed](LICENSE)
