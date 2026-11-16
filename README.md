Currently implemented as part of a single turborepo webapp, working on extracting out to a microservice

The file listing API returns root-relative `/collection/` URLs. Resolve these
against the frontend origin; the frontend proxies collection requests to the
backend in both development and production.
