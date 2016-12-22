test:
		./node_modules/.bin/mocha -u tdd --reporter spec

testDebug:
		./node_modules/.bin/mocha -u tdd --reporter spec --debug-brk

.PHONY: test
